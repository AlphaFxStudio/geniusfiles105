package app.geniusfiles.mobile

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.nio.ByteBuffer
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Moteur natif de copie / déplacement.
 *
 * Toute l'opération (planification, streaming NIO, suppression de la
 * source pour un déplacement) s'exécute en Kotlin, dans un service au
 * premier plan. Conséquences :
 *
 *  - la WebView n'est jamais sollicitée : aucun blocage du thread UI ;
 *  - la tâche survit au passage en arrière-plan ET à la fermeture de
 *    l'application (le service est `stopWithTask="false"`) ;
 *  - plusieurs tâches tournent en parallèle sur un pool borné, sans se
 *    bloquer mutuellement et sans saturer le stockage ;
 *  - la mémoire reste plate (transferTo par blocs, aucun buffer géant).
 *
 * L'interface JavaScript se contente de démarrer / annuler / lister les
 * tâches et d'écouter les évènements `fileOpProgress` / `fileOpDone`.
 */
class FileOpsService : Service() {

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        ensureChannel(this)
        val notif = buildSummaryNotification(this)
        try {
            if (Build.VERSION.SDK_INT >= 34) {
                startForeground(NOTIF_SUMMARY, notif, ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC)
            } else {
                startForeground(NOTIF_SUMMARY, notif)
            }
        } catch (_: Throwable) {
        }
        if (intent?.action == ACTION_STOP || tasks.values.none { it.status == "running" }) {
            if (intent?.action == ACTION_STOP) {
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf(startId)
                return START_NOT_STICKY
            }
        }
        return START_STICKY
    }

    /* ------------------------------------------------------------------ */

    /**
     * Conflit en attente de décision utilisateur. La tâche est suspendue
     * (aucun octet écrit, aucune source supprimée) tant que `choice`
     * n'est pas renseigné : un doublon n'est JAMAIS un échec.
     */
    class Pending(val name: String, val isDirectory: Boolean) {
        @Volatile var choice: String? = null
    }

    class Task(
        val id: String,
        val mode: String,
        val sources: List<String>,
        val destination: String,
        val title: String,
        /** Noms de premier niveau déjà autorisés à écraser (décidés côté app). */
        val overwrite: MutableSet<String> = java.util.Collections.synchronizedSet(HashSet()),
    ) {
        @Volatile var total: Int = 0
        @Volatile var completed: Int = 0
        @Volatile var totalBytes: Long = 0
        @Volatile var bytes: Long = 0
        @Volatile var currentName: String = ""
        @Volatile var status: String = "running"
        @Volatile var speedBps: Long = 0
        @Volatile var etaMs: Long = -1
        val startedAt: Long = System.currentTimeMillis()
        @Volatile var endedAt: Long = 0
        @Volatile var lastEmit: Long = 0
        @Volatile var lastSpeedAt: Long = startedAt
        @Volatile var lastSpeedBytes: Long = 0
        val failures = java.util.Collections.synchronizedList(ArrayList<Pair<String, String>>())
        val cancelled = AtomicBoolean(false)
        /** Éléments écartés sur décision de l'utilisateur (jamais des échecs). */
        @Volatile var skipped: Int = 0
        /** Éléments conservés en double sous un nouveau nom. */
        @Volatile var renamed: Int = 0

        /** « Appliquer à tous » — valable pour cette tâche uniquement. */
        @Volatile var blanket: String? = null
        /** Conflit courant, non nul uniquement pendant l'attente. */
        @Volatile var pending: Pending? = null
        val notifId: Int = NOTIF_BASE + (nextNotif++ % 100)

        fun toJson(): JSObject {
            val o = JSObject()
            o.put("id", id)
            o.put("mode", mode)
            o.put("status", status)
            o.put("title", title)
            o.put("destination", destination)
            o.put("source", sources.firstOrNull()?.let { File(it).parent } ?: "")
            o.put("total", total)
            o.put("completed", completed)
            o.put("totalBytes", totalBytes)
            o.put("bytes", bytes)
            o.put("speedBps", speedBps)
            o.put("etaMs", etaMs)
            o.put("currentName", currentName)
            o.put("startedAt", startedAt)
            o.put("endedAt", endedAt)
            o.put("skipped", skipped)
            o.put("renamed", renamed)

            pending?.let {
                val c = JSObject()
                c.put("name", it.name)
                c.put("isDirectory", it.isDirectory)
                o.put("conflict", c)
            }
            val arr = JSArray()
            synchronized(failures) {
                for ((name, reason) in failures) {
                    val f = JSObject(); f.put("name", name); f.put("reason", reason); arr.put(f)
                }
            }
            o.put("failures", arr)
            return o
        }
    }

    companion object {
        const val ACTION_STOP = "app.geniusfiles.mobile.FILEOPS_STOP"
        private const val CHANNEL_ID = "gf_file_ops"
        private const val NOTIF_SUMMARY = 4200
        private const val NOTIF_BASE = 4300
        private var nextNotif = 0

        private val pool = Executors.newFixedThreadPool(
            Runtime.getRuntime().availableProcessors().coerceIn(3, 4),
        ) { r ->
            Thread(r, "gf-fileops").apply { priority = Thread.NORM_PRIORITY - 1 }
        }
        val tasks = ConcurrentHashMap<String, Task>()

        /** Pont vers la WebView : nul lorsque l'application est fermée. */
        @Volatile var listener: ((String, JSObject) -> Unit)? = null

        fun snapshot(): JSArray {
            val arr = JSArray()
            for (t in tasks.values.sortedBy { it.startedAt }) arr.put(t.toJson())
            return arr
        }

        fun cancel(id: String) {
            val t = tasks[id] ?: return
            t.cancelled.set(true)
            // Débloque immédiatement une tâche suspendue sur un conflit.
            t.pending?.choice = "skip"
        }

        /**
         * Décision de l'utilisateur pour le conflit courant (dialogue de
         * l'application ou action de notification) :
         *  - « overwrite » remplace l'élément existant ;
         *  - « rename » conserve les deux (suffixe « (1) », « (2) »…) ;
         *  - « skip » laisse cet élément de côté et poursuit avec le suivant.
         * « Appliquer à tous » ne vaut que pour cette tâche.
         */
        fun resolveConflict(id: String, choice: String, applyToAll: Boolean) {
            val t = tasks[id] ?: return
            val safe = when (choice) {
                "overwrite", "rename", "skip" -> choice
                else -> "skip"
            }
            if (applyToAll) t.blanket = safe
            t.pending?.choice = safe
        }

        /** Nom libre à destination : « photo (1).jpg », « photo (2).jpg »… */
        private fun freeName(dir: File, name: String, isDirectory: Boolean): File {
            val dot = if (isDirectory) -1 else name.lastIndexOf('.')
            val base = if (dot > 0) name.substring(0, dot) else name
            val ext = if (dot > 0) name.substring(dot) else ""
            var i = 1
            while (i < 1000) {
                val candidate = File(dir, "$base ($i)$ext")
                if (!candidate.exists()) return candidate
                i++
            }
            return File(dir, "$base (${System.currentTimeMillis()})$ext")
        }

        /**
         * Suspend la tâche et demande une décision. Une seule question par
         * élément de premier niveau : les fichiers internes d'un dossier
         * suivent la décision prise pour ce dossier.
         */
        private fun askConflict(
            ctx: Context,
            task: Task,
            name: String,
            isDirectory: Boolean,
        ): String {
            task.blanket?.let { return it }
            if (task.cancelled.get()) return "skip"
            val pending = Pending(name, isDirectory)
            task.pending = pending
            val payload = task.toJson()
            try { listener?.invoke("fileOpConflict", payload) } catch (_: Throwable) {}
            postConflictNotification(ctx, task, name)
            // Attente passive : aucun octet écrit, aucune source touchée.
            while (pending.choice == null && !task.cancelled.get()) {
                try { Thread.sleep(150) } catch (_: Throwable) { break }
            }
            val choice = pending.choice ?: "skip"
            task.pending = null
            try { nm(ctx).cancel(task.notifId + 700) } catch (_: Throwable) {}
            updateNotification(ctx, task)
            return choice
        }


        private fun nm(ctx: Context): NotificationManager =
            ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        /**
         * Notification d'intervention : l'utilisateur peut trancher sans
         * revenir dans l'application (transfert en arrière-plan).
         */
        private fun postConflictNotification(ctx: Context, task: Task, name: String) {
            fun pi(choice: String, req: Int): PendingIntent? = try {
                PendingIntent.getBroadcast(
                    ctx, task.notifId + req,
                    Intent(ctx, FileOpsActionReceiver::class.java)
                        .setAction(FileOpsActionReceiver.ACTION_CONFLICT)
                        .putExtra("id", task.id)
                        .putExtra("choice", choice)
                        .setData(android.net.Uri.parse("gf://conflict/${task.id}/$choice")),
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
                )
            } catch (_: Throwable) { null }
            val n = NotificationCompat.Builder(ctx, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.stat_sys_warning)
                .setContentTitle("Un élément du même nom existe déjà")
                .setContentText(name)
                .setStyle(
                    NotificationCompat.BigTextStyle()
                        .bigText("$name\nRemplacer, conserver les deux, ou ne pas transférer cet élément."),
                )
                .setOngoing(true)
                .setOnlyAlertOnce(true)
                .setContentIntent(contentIntent(ctx))
                .addAction(android.R.drawable.ic_menu_save, "Remplacer", pi("overwrite", 710))
                .addAction(android.R.drawable.ic_menu_add, "Conserver les deux", pi("rename", 720))
                .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Ne pas transférer", pi("skip", 730))

                .build()
            try { nm(ctx).notify(task.notifId + 700, n) } catch (_: Throwable) {}
        }

        fun start(
            ctx: Context,
            id: String,
            mode: String,
            sources: List<String>,
            destination: String,
            title: String,
            overwrite: Collection<String> = emptyList(),
        ): Task {
            val task = Task(id, mode, sources, destination, title)
            task.overwrite.addAll(overwrite)
            tasks[id] = task
            ensureChannel(ctx)
            val app = ctx.applicationContext
            try {
                val i = Intent(app, FileOpsService::class.java)
                if (Build.VERSION.SDK_INT >= 26) app.startForegroundService(i) else app.startService(i)
            } catch (_: Throwable) {
            }
            pool.execute { runTask(app, task) }
            return task
        }

        /* ---------------- exécution ---------------- */

        private class Plan(
            val root: File,
            val files: MutableList<File> = ArrayList(),
            val dirs: MutableList<File> = ArrayList(),
            var bytes: Long = 0,
        )

        private fun plan(root: File): Plan {
            val p = Plan(root)
            if (!root.isDirectory) {
                p.files.add(root)
                p.bytes = root.length()
                return p
            }
            val stack = ArrayDeque<File>()
            stack.addLast(root)
            while (stack.isNotEmpty()) {
                val cur = stack.removeLast()
                if (cur.isDirectory) {
                    p.dirs.add(cur)
                    cur.listFiles()?.forEach { stack.addLast(it) }
                } else {
                    p.files.add(cur)
                    p.bytes += cur.length()
                }
            }
            return p
        }

        private fun copyStream(ctx: Context, task: Task, src: File, dst: File): Boolean {
            dst.parentFile?.mkdirs()
            FileInputStream(src).channel.use { input ->
                FileOutputStream(dst).channel.use { output ->
                    var pos = 0L
                    val size = input.size()
                    val fallback = ByteBuffer.allocateDirect(1024 * 1024)
                    while (pos < size) {
                        if (task.cancelled.get()) return false
                        val n = input.transferTo(pos, minOf(8L * 1024 * 1024, size - pos), output)
                        if (n > 0) {
                            pos += n
                            task.bytes += n
                            emit(ctx, task)
                            continue
                        }
                        input.position(pos)
                        fallback.clear()
                        val read = input.read(fallback)
                        if (read <= 0) throw java.io.EOFException("Copie interrompue")
                        fallback.flip()
                        while (fallback.hasRemaining()) output.write(fallback)
                        pos += read
                        task.bytes += read
                        emit(ctx, task)
                    }
                }
            }
            try { dst.setLastModified(src.lastModified()) } catch (_: Throwable) {}
            return true
        }

        private fun runTask(ctx: Context, task: Task) {
            val dstRoot = File(task.destination)
            dstRoot.mkdirs()
            val plans = ArrayList<Plan>()
            for (s in task.sources) {
                if (task.cancelled.get()) break
                val f = File(s)
                if (!f.exists()) {
                    task.failures.add(f.name to "Introuvable")
                    continue
                }
                val p = plan(f)
                plans.add(p)
                task.total += p.files.size + p.dirs.size
                task.totalBytes += p.bytes
            }
            emit(ctx, task, force = true)

            for (p in plans) {
                if (task.cancelled.get()) break
                val srcRoot = p.root
                var target = File(dstRoot, srcRoot.name)

                // Doublon à destination : ce n'est pas une erreur, c'est une
                // décision utilisateur (remplacer / conserver les deux / ne
                // pas transférer cet élément — les suivants continuent).
                var replace = task.overwrite.contains(srcRoot.name)
                var keepBoth = false
                if (target.exists() && !replace) {
                    when (askConflict(ctx, task, srcRoot.name, srcRoot.isDirectory)) {
                        "overwrite" -> replace = true
                        "rename" -> {
                            keepBoth = true
                            target = freeName(dstRoot, srcRoot.name, srcRoot.isDirectory)
                            task.renamed++
                        }
                        else -> {
                            task.skipped++
                            task.completed += p.files.size + p.dirs.size
                            emit(ctx, task, force = true)
                            continue
                        }
                    }
                }

                // Déplacement sur le même volume : rename instantané.
                if (task.mode == "move") {
                    val clear = if (!target.exists()) true else if (replace) {
                        try { target.deleteRecursively() } catch (_: Throwable) { false }
                    } else false
                    if (clear && srcRoot.renameTo(target)) {
                        task.completed += p.files.size + p.dirs.size
                        task.bytes += p.bytes
                        task.currentName = srcRoot.name
                        emit(ctx, task)
                        continue
                    }
                }

                val failuresBefore = task.failures.size

                val basePath = srcRoot.absolutePath
                for (d in p.dirs) {
                    if (task.cancelled.get()) break
                    val rel = d.absolutePath.removePrefix(basePath).trimStart('/')
                    File(target, rel).mkdirs()
                    task.completed++
                }
                var skipEntry = false
                for (f in p.files) {
                    if (task.cancelled.get()) break
                    val rel = f.absolutePath.removePrefix(basePath).trimStart('/')
                    var out = if (rel.isEmpty()) target else File(target, rel)
                    task.currentName = f.name
                    try {
                        if (out.exists() && !replace) {
                            if (keepBoth) {
                                out = freeName(out.parentFile ?: dstRoot, out.name, false)
                            } else {
                                // Fichier interne apparu / fusion de dossier :
                                // même question, une seule fois pour cet élément.
                                when (askConflict(ctx, task, srcRoot.name, srcRoot.isDirectory)) {
                                    "overwrite" -> replace = true
                                    "rename" -> {
                                        keepBoth = true
                                        task.renamed++
                                        out = freeName(out.parentFile ?: dstRoot, out.name, false)
                                    }
                                    else -> {
                                        task.skipped++
                                        task.completed++
                                        skipEntry = true
                                    }
                                }
                                if (skipEntry) break
                            }
                        }

                        if (!copyStream(ctx, task, f, out)) break
                    } catch (e: Throwable) {
                        // Un échec n'interrompt jamais la tâche : on continue.
                        task.failures.add(f.name to (e.message ?: "Copie impossible"))
                    }
                    task.completed++

                    emit(ctx, task)
                }
                // La source ne disparaît qu'après une arrivée confirmée à
                // destination ET aucun échec sur CET élément.
                if (
                    task.mode == "move" &&
                    !skipEntry &&
                    !task.cancelled.get() &&
                    task.failures.size == failuresBefore &&
                    target.exists()
                ) {
                    try { srcRoot.deleteRecursively() } catch (_: Throwable) {}
                }

                emit(ctx, task)
            }

            task.status = when {
                task.cancelled.get() -> "cancelled"
                task.failures.isNotEmpty() -> "failed"
                else -> "done"
            }
            task.endedAt = System.currentTimeMillis()
            task.speedBps = 0
            task.etaMs = 0
            emit(ctx, task, force = true)
            listener?.invoke("fileOpDone", task.toJson())
            postFinalNotification(ctx, task)

            // Purge différée : la WebView peut encore lire l'état au retour.
            if (tasks.values.none { it.status == "running" }) {
                try {
                    val i = Intent(ctx, FileOpsService::class.java).setAction(ACTION_STOP)
                    ctx.startService(i)
                } catch (_: Throwable) {}
            }
        }

        private fun emit(ctx: Context, task: Task, force: Boolean = false) {
            val now = System.currentTimeMillis()
            if (!force && now - task.lastEmit < 250) return
            task.lastEmit = now
            val speedDt = now - task.lastSpeedAt
            if (speedDt >= 400) {
                val inst = ((task.bytes - task.lastSpeedBytes) * 1000.0 / speedDt).toLong()
                task.speedBps = if (task.speedBps > 0) (task.speedBps * 7 + inst * 3) / 10 else inst
                task.lastSpeedAt = now
                task.lastSpeedBytes = task.bytes
                task.etaMs =
                    if (task.speedBps > 0 && task.totalBytes > task.bytes)
                        (task.totalBytes - task.bytes) * 1000 / task.speedBps
                    else -1
            }
            listener?.invoke("fileOpProgress", task.toJson())
            updateNotification(ctx, task)
        }

        /* ---------------- notifications ---------------- */

        fun ensureChannel(ctx: Context) {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
            val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            if (nm.getNotificationChannel(CHANNEL_ID) == null) {
                val ch = NotificationChannel(
                    CHANNEL_ID,
                    "Copies et déplacements",
                    NotificationManager.IMPORTANCE_LOW,
                )
                ch.setShowBadge(false)
                nm.createNotificationChannel(ch)
            }
        }

        private fun contentIntent(ctx: Context): PendingIntent? = try {
            val i = ctx.packageManager.getLaunchIntentForPackage(ctx.packageName)
            PendingIntent.getActivity(
                ctx, 0, i,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
        } catch (_: Throwable) { null }

        private fun humanBytes(n: Long): String {
            if (n <= 0) return "0 o"
            val units = arrayOf("o", "Ko", "Mo", "Go", "To")
            var v = n.toDouble(); var i = 0
            while (v >= 1024 && i < units.size - 1) { v /= 1024; i++ }
            return if (v >= 10 || i == 0) "${v.toInt()} ${units[i]}" else String.format("%.1f %s", v, units[i])
        }

        private fun humanDelay(ms: Long): String? {
            if (ms <= 0) return null
            val s = (ms / 1000).toInt()
            if (s < 60) return "$s s"
            val m = s / 60
            return if (m < 60) "$m min" else "${m / 60} h ${m % 60} min"
        }

        fun buildSummaryNotification(ctx: Context): Notification =
            NotificationCompat.Builder(ctx, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.stat_sys_download)
                .setContentTitle("GeniusFiles")
                .setContentText("Transferts de fichiers en cours")
                .setOngoing(true)
                .setOnlyAlertOnce(true)
                .setContentIntent(contentIntent(ctx))
                .build()

        private fun updateNotification(ctx: Context, task: Task) {
            val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            val pct = when {
                task.totalBytes > 0 -> ((task.bytes * 100) / task.totalBytes).toInt()
                task.total > 0 -> (task.completed * 100) / task.total
                else -> 0
            }
            val bits = ArrayList<String>()
            if (task.total > 0) bits.add("${task.completed}/${task.total}")
            if (task.totalBytes > 0) bits.add("${humanBytes(task.bytes)} / ${humanBytes(task.totalBytes)}")
            if (task.speedBps > 0) bits.add("${humanBytes(task.speedBps)}/s")
            humanDelay(task.etaMs)?.let { bits.add("reste $it") }

            val cancelIntent = Intent(ctx, FileOpsActionReceiver::class.java)
                .setAction(FileOpsActionReceiver.ACTION_CANCEL)
                .putExtra("id", task.id)
            val cancelPi = PendingIntent.getBroadcast(
                ctx, task.notifId, cancelIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )

            val n = NotificationCompat.Builder(ctx, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.stat_sys_download)
                .setContentTitle(
                    (if (task.mode == "copy") "Copie" else "Déplacement") + " — ${task.title}"
                )
                .setContentText(bits.joinToString(" · "))
                .setSubText(task.currentName)
                .setStyle(NotificationCompat.BigTextStyle().bigText(
                    bits.joinToString(" · ") + "\n" + task.currentName
                ))
                .setProgress(100, pct.coerceIn(0, 100), task.totalBytes <= 0 && task.total <= 0)
                .setOngoing(true)
                .setOnlyAlertOnce(true)
                .setContentIntent(contentIntent(ctx))
                .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Annuler", cancelPi)
                .build()
            try { nm.notify(task.notifId, n) } catch (_: Throwable) {}
        }

        private fun postFinalNotification(ctx: Context, task: Task) {
            val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            val title = when {
                task.status == "cancelled" ->
                    if (task.mode == "copy") "Copie annulée" else "Déplacement annulé"
                task.status == "failed" ->
                    if (task.mode == "copy") "Copie incomplète" else "Déplacement incomplet"
                else -> if (task.mode == "copy") "Copie terminée" else "Déplacement terminé"
            }
            val secs = ((task.endedAt - task.startedAt) / 1000).coerceAtLeast(1)
            val body = buildString {
                append("${task.completed} élément(s) · ${humanBytes(task.bytes)}")
                if (task.failures.isNotEmpty()) append(" · ${task.failures.size} échec(s)")
                append(" · ${humanDelay(secs * 1000) ?: "$secs s"}")
                append("\n→ ${File(task.destination).name.ifEmpty { task.destination }}")
            }
            val open = Intent(ctx, FileOpsActionReceiver::class.java)
                .setAction(FileOpsActionReceiver.ACTION_OPEN_DEST)
                .putExtra("path", task.destination)
            val openPi = PendingIntent.getBroadcast(
                ctx, task.notifId + 1000, open,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
            val n = NotificationCompat.Builder(ctx, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.stat_sys_download_done)
                .setContentTitle(title)
                .setContentText(body.replace("\n", " "))
                .setStyle(NotificationCompat.BigTextStyle().bigText(body))
                .setAutoCancel(true)
                .setContentIntent(contentIntent(ctx))
                .addAction(android.R.drawable.ic_menu_view, "Ouvrir le dossier", openPi)
                .build()
            try {
                nm.cancel(task.notifId)
                nm.notify(task.notifId + 500, n)
            } catch (_: Throwable) {}
        }
    }
}
