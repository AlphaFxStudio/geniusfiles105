package app.geniusfiles.mobile

import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.google.android.libraries.ads.mobile.sdk.banner.AdSize
import com.google.android.libraries.ads.mobile.sdk.banner.AdView
import com.google.android.libraries.ads.mobile.sdk.banner.BannerAd
import com.google.android.libraries.ads.mobile.sdk.banner.BannerAdEventCallback
import com.google.android.libraries.ads.mobile.sdk.banner.BannerAdRequest
import com.google.android.libraries.ads.mobile.sdk.common.AdLoadCallback
import com.google.android.libraries.ads.mobile.sdk.common.LoadAdError

/**
 * Bannière AdMob (GMA Next-Gen) ancrée à un emplacement DÉCIDÉ PAR LA PAGE.
 *
 * L'`AdView` est ajoutée DIRECTEMENT au conteneur de l'activité, à la taille
 * exacte du bloc réservé par la page : aucune vue plein écran n'est posée
 * au-dessus de la WebView (une telle superposition rendait l'interface
 * invisible pendant le défilement). Quand la page défile, JS renvoie la
 * nouvelle position ; quand le bloc sort de l'écran, la vue est masquée.
 *
 * Performance : l'annonce est **préchargée** dès le démarrage et **conservée**
 * entre les écrans qui utilisent le même format. Changer de page masque
 * immédiatement la vue mais ne détruit rien : au retour, l'annonce déjà
 * chargée réapparaît instantanément, sans nouvelle requête réseau.
 *
 * Aucune donnée personnelle n'est transmise au SDK par ce pont.
 */
@CapacitorPlugin(name = "GeniusFilesAds")
class GeniusFilesAdsPlugin : Plugin() {
    private var adView: AdView? = null
    private var loadedUnitId: String? = null
    private var lastWidthDp: Int = 0
    private var lastFormat: String = ""
    private var adLoaded: Boolean = false
    private var loading: Boolean = false

    /**
     * Taille demandée : bannière adaptative ancrée par défaut, ou
     * Medium Rectangle (300x250) quand la page en fait explicitement la
     * demande (écran vide disposant de suffisamment de place).
     */
    private fun adSizeFor(widthDp: Int, format: String): AdSize =
        if (format == "mrec") {
            AdSize.MEDIUM_RECTANGLE
        } else {
            AdSize.getLargeAnchoredAdaptiveBannerAdSize(activity, widthDp.coerceIn(200, 1200))
        }

    @PluginMethod
    fun isAvailable(call: PluginCall) {
        call.resolve(JSObject().put("available", true))
    }

    /** État courant : permet à la page de réserver la bonne hauteur sans attendre. */
    @PluginMethod
    fun getStatus(call: PluginCall) {
        call.resolve(
            JSObject()
                .put("loaded", adLoaded)
                .put("height", if (adLoaded) adSizeHeight(lastWidthDp, lastFormat) else 0),
        )
    }

    /**
     * Prépare une annonce à l'avance (aucun affichage).
     *
     * Appelé au démarrage : quand l'utilisateur atteint un écran publicitaire,
     * l'annonce est déjà en mémoire et s'affiche sans délai perceptible.
     */
    @PluginMethod
    fun preload(call: PluginCall) {
        val widthDp = (call.getDouble("width") ?: 0.0).toInt().let { if (it <= 0) 360 else it }
        val unitId = call.getString("unitId") ?: TEST_BANNER_UNIT_ID
        val format = call.getString("format") ?: "adaptive"
        activity.runOnUiThread {
            try {
                ensureAdView(unitId, widthDp, format)
            } catch (_: Throwable) {
                /* préchargement best-effort : jamais bloquant */
            }
            call.resolve(JSObject().put("loaded", adLoaded))
        }
    }

    /**
     * Crée l'`AdView` et lance le chargement si nécessaire.
     * Réutilise telle quelle une annonce déjà chargée au même format.
     */
    private fun ensureAdView(unitId: String, widthDp: Int, format: String): AdView {
        val existing = adView
        val sameRequest = loadedUnitId == unitId && lastWidthDp == widthDp && lastFormat == format
        if (existing != null && sameRequest) return existing

        releaseAdView()
        adLoaded = false
        val view = AdView(activity)
        view.visibility = View.INVISIBLE
        view.layoutParams = FrameLayout.LayoutParams(1, 1, Gravity.TOP or Gravity.START)
        activity.findViewById<ViewGroup>(android.R.id.content).addView(view)
        adView = view
        loadedUnitId = unitId
        lastWidthDp = widthDp
        lastFormat = format
        loadInto(view, unitId, widthDp, format)
        return view
    }

    /**
     * Affiche (ou repositionne) la bannière.
     *
     * @param x,y,width  rectangle CSS px du bloc réservé dans la page.
     * @param unitId     bloc d'annonces ; par défaut le bloc de TEST Google.
     */
    @PluginMethod
    fun showBanner(call: PluginCall) {
        val density = context.resources.displayMetrics.density
        val xDp = (call.getDouble("x") ?: 0.0).toInt()
        val yDp = (call.getDouble("y") ?: 0.0).toInt()
        val widthDp = (call.getDouble("width") ?: 0.0).toInt().let { if (it <= 0) 360 else it }
        val unitId = call.getString("unitId") ?: TEST_BANNER_UNIT_ID
        val format = call.getString("format") ?: "adaptive"
        val heightDp = adSizeHeight(widthDp, format)

        activity.runOnUiThread {
            try {
                val view = ensureAdView(unitId, widthDp, format)
                view.layoutParams = FrameLayout.LayoutParams(
                    (widthDp * density).toInt(),
                    (heightDp * density).toInt(),
                    Gravity.TOP or Gravity.START,
                ).also { lp ->
                    lp.leftMargin = (xDp * density).toInt()
                    lp.topMargin = (yDp * density).toInt()
                }
                // Tant qu'aucune annonce n'est chargée, la vue reste
                // invisible : aucun cadre vide, aucune interception de
                // clic, aucun recouvrement du contenu.
                view.visibility = if (adLoaded) View.VISIBLE else View.INVISIBLE
                view.requestLayout()
                call.resolve(
                    JSObject().put("height", heightDp).put("shown", adLoaded)
                        .put("loaded", adLoaded),
                )
            } catch (t: Throwable) {
                call.resolve(
                    JSObject().put("height", heightDp).put("shown", false)
                        .put("error", t.message ?: "banner error"),
                )
            }
        }
    }

    private fun adSizeHeight(widthDp: Int, format: String): Int = try {
        adSizeFor(if (widthDp <= 0) 360 else widthDp, format).height
    } catch (_: Throwable) {
        50
    }

    /** Informe la page du résultat du chargement (hauteur réelle à réserver). */
    private fun notifyStatus(loaded: Boolean, heightDp: Int) {
        try {
            notifyListeners(
                "bannerStatus",
                JSObject().put("loaded", loaded).put("height", heightDp),
            )
        } catch (_: Throwable) {
            /* pont fermé */
        }
    }

    private fun loadInto(view: AdView, unitId: String, widthDp: Int, format: String) {
        if (loading) return
        loading = true
        val request = BannerAdRequest.Builder(unitId, adSizeFor(widthDp, format)).build()
        view.loadAd(
            request,
            object : AdLoadCallback<BannerAd> {
                override fun onAdLoaded(ad: BannerAd) {
                    ad.adEventCallback = object : BannerAdEventCallback {}
                    loading = false
                    adLoaded = true
                    activity.runOnUiThread {
                        // Visible seulement si la page a déjà réservé sa place.
                        if ((view.layoutParams?.height ?: 0) > 1) view.visibility = View.VISIBLE
                    }
                    notifyStatus(true, adSizeHeight(widthDp, format))
                }

                override fun onAdFailedToLoad(adError: LoadAdError) {
                    // Réseau absent ou remplissage vide : l'application
                    // continue normalement et aucun espace n'est réservé.
                    loading = false
                    adLoaded = false
                    activity.runOnUiThread { view.visibility = View.INVISIBLE }
                    notifyStatus(false, 0)
                }
            },
        )
    }

    /** Masque immédiatement la bannière sans détruire l'annonce chargée. */
    @PluginMethod
    fun hideBanner(call: PluginCall) {
        activity.runOnUiThread {
            adView?.let { view ->
                view.visibility = View.GONE
                view.layoutParams = FrameLayout.LayoutParams(1, 1, Gravity.TOP or Gravity.START)
            }
            call.resolve()
        }
    }

    @PluginMethod
    fun removeBanner(call: PluginCall) {
        activity.runOnUiThread {
            releaseAdView()
            call.resolve()
        }
    }

    /** Retire la bannière de la hiérarchie et libère ses ressources. */
    private fun releaseAdView() {
        val view = adView ?: return
        (view.parent as? ViewGroup)?.removeView(view)
        try {
            view.destroy()
        } catch (_: Throwable) {
            /* déjà libérée */
        }
        adView = null
        loadedUnitId = null
        lastWidthDp = 0
        lastFormat = ""
        adLoaded = false
        loading = false
    }

    override fun handleOnDestroy() {
        super.handleOnDestroy()
        releaseAdView()
    }

    companion object {
        /** Bloc de TEST officiel Google — jamais de trafic réel en debug. */
        const val TEST_BANNER_UNIT_ID = "ca-app-pub-3940256099942544/9214589741"
    }
}
