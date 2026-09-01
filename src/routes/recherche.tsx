/**
 * Recherche globale — véritable vue du gestionnaire de fichiers.
 *
 * Les résultats utilisent exactement les mêmes composants que le
 * gestionnaire (FileListView / FileGridView, SelectionBar,
 * EntryActionSheet, MoreActionsSheet, UniversalViewer…), donc les mêmes
 * gestes et les mêmes actions : ouvrir, sélectionner, copier, déplacer,
 * renommer, supprimer, partager, informations.
 *
 * L'état de la recherche (requête, filtres, portée, sélection, position
 * de défilement) est conservé : ouvrir un fichier puis revenir ne
 * réinitialise jamais la recherche.
 */
import { useListScrollMemory } from "@/lib/files/use-list-scroll";
import { createFileRoute } from "@tanstack/react-router";
import { useAppNavigate } from "@/lib/navigation/pick-nav";
import { confirmPick, requestDestination, usePickRequest } from "@/lib/files/pick-session";
import {
  selectionKey,
  toggleSelection as toggleGlobalSelection,
  useSelection as useGlobalSelection,
  type SelectionItem,
} from "@/lib/files/selection-store";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, Clock, X, SlidersHorizontal, Trash2 } from "@/components/icons";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Spinner } from "@/components/ui/states";
import { BACK_PRIORITY, useBackHandler } from "@/lib/navigation/back-stack";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { InlineAdBanner } from "@/components/ads/InlineAdBanner";
import { IllustratedEmptyState } from "@/components/ui/IllustratedEmptyState";
import { BottomSheet, NamePrompt } from "@/components/files/BottomSheet";
import { DeleteConfirmDialog } from "@/components/files/DeleteConfirmDialog";
import { FileGridView, FileListView } from "@/components/files/FileList";
import { SelectionBar, SelectionTopBar } from "@/components/files/SelectionBar";
import { MoreActionsSheet } from "@/components/files/MoreActionsSheet";
import { buildMoreActions } from "@/lib/files/selection-actions";
import { EntryActionSheet, type EntryAction } from "@/components/files/EntryActionSheet";
import { DetailsSheet } from "@/components/files/DetailsSheet";
import { ProgressDialog } from "@/components/files/ProgressDialog";
import { UniversalViewer, type ViewerAction } from "@/components/viewer/UniversalViewer";
import { canOpenInViewer, canPreview } from "@/lib/viewer/kinds";
import { isPackageEntry } from "@/lib/files/package";
import { openPackageSheet } from "@/lib/files/package-sheet-store";
import { openWithSystem } from "@/lib/viewer/openWith";
import { audioEditorSearch } from "@/lib/audio/routes";
import { batchSummary, errorMessage } from "@/lib/errors/humanize";
import { progressLabel } from "@/lib/copy";
import { formatSize } from "@/lib/files/format";
import { useSelectionSize } from "@/lib/files/selection-size";
import { loadView } from "@/lib/files/preferences";
import {
  startTransfer,
  cancelTransfer,
  openTransferDestination,
  summaryMessage,
} from "@/lib/transfers/manager";
import { useTransferTask } from "@/lib/transfers/useTransfers";
import {
  deleteEntries,
  readDetails,
  renameEntry,
  shareEntries,
  type DetailsInfo,
  type OperationSignal,
  type ProgressEvent,
} from "@/lib/files/operations";
import { loadScreenState, saveScreenState } from "@/lib/navigation/screen-state";
import { useRoots } from "@/lib/fs/useRoots";
import type { FileEntry, PathRef, StorageRootId, ViewMode } from "@/lib/files/types";
import { runSearch, sortResults } from "@/lib/search/engine";
import { usePullToRefresh } from "@/lib/gestures/pull-refresh";
import {
  DEFAULT_FILTERS,
  filtersActive,
  type DateBand,
  type KindFilter,
  type SearchFilters,
  type SearchResult,
  type SizeBand,
} from "@/lib/search/types";
import {
  clearSearchHistory,
  loadSearchHistory,
  pushSearchHistory,
  removeSearchHistoryItem,
  type SearchHistoryItem,
} from "@/lib/search/history";
import { loadSearchFilters, saveSearchFilters } from "@/lib/search/preferences";
import { takeSearchScope, type SearchScope } from "@/lib/search/scope";
import { clearSearchCache, getCachedSearch, keyFor, setCachedSearch } from "@/lib/search/cache";
// Effet de bord : enregistre le provider de recherche par contenu (index
// inversé + OCR + PDF). Aucune modif d'UI n'est nécessaire — le provider
// se branche via le point d'extension prévu par le moteur.
import "@/lib/analysis";
import { useT, t as translate } from "@/lib/i18n";
import type { TransValues } from "@/lib/i18n";

type TFn = (key: string, values?: TransValues) => string;

export const Route = createFileRoute("/recherche")({
  head: () => ({
    meta: [
      { title: "Recherche — GeniusFiles" },
      {
        name: "description",
        content: translate("meta.search.description"),
      },
    ],
  }),
  component: SearchPage,
});

const kindChips = (t: TFn): { id: KindFilter; label: string }[] => [
  { id: "any", label: t("home.scopePicker.all") },
  { id: "image", label: t("search.chip.images") },
  { id: "video", label: t("home.category.videos") },
  { id: "audio", label: t("search.chip.audio") },
  { id: "document", label: t("search.chip.documents") },
  { id: "archive", label: t("search.chip.archives") },
  { id: "folder", label: t("files.archive.info.folders") },
];

const sizeOptions = (t: TFn): { id: SizeBand; label: string }[] => [
  { id: "any", label: t("files.toutesTailles") },
  { id: "lt1", label: t("search.size.lt1") },
  { id: "1to10", label: t("search.size.1to10") },
  { id: "10to100", label: t("search.size.10to100") },
  { id: "100to1000", label: t("search.size.100to1000") },
  { id: "gt1000", label: t("search.size.gt1000") },
];

const dateOptions = (t: TFn): { id: DateBand; label: string }[] => [
  { id: "any", label: t("search.date.any") },
  { id: "today", label: t("search.date.today") },
  { id: "week", label: t("search.date.week") },
  { id: "month", label: t("search.date.month") },
  { id: "year", label: t("files.cetteAnnee") },
];

const RESULTS_LIMIT = 500;
const SESSION_KEY = "search";

type SearchSession = {
  query: string;
  filters: SearchFilters;
  scope: SearchScope | null;
  selected: string[];
};

type Dialog =
  | { kind: "none" }
  | { kind: "actions"; entry: SearchResult }
  | { kind: "details"; info: DetailsInfo | null; loading: boolean }
  | { kind: "rename"; entry: SearchResult }
  | { kind: "confirmDelete"; items: SearchResult[]; viewerId?: string }
  | { kind: "viewer"; entryId: string };

function resultId(r: SearchResult): string {
  return `${r.rootId}::${r.segments.join("/")}`;
}

function parentOf(r: SearchResult): PathRef {
  return { rootId: r.rootId, segments: r.parentSegments };
}

function groupByParent(items: SearchResult[]) {
  const m = new Map<string, { parent: PathRef; entries: SearchResult[] }>();
  for (const r of items) {
    const key = `${r.rootId}/${r.parentSegments.join("/")}`;
    const bucket = m.get(key);
    if (bucket) bucket.entries.push(r);
    else m.set(key, { parent: parentOf(r), entries: [r] });
  }
  return [...m.values()];
}

export function SearchPage() {
  const t = useT();
  const navigate = useAppNavigate();
  const pick = usePickRequest();
  const globalSelection = useGlobalSelection();
  const { available: roots } = useRoots();

  const [query, setQuery] = useState("");
  const [filters, setFiltersState] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<ViewMode>("list");
  /* Portée contextuelle posée par l'écran appelant. Absente depuis
     l'accueil → recherche globale (tous les stockages). */
  const [scope, setScope] = useState<SearchScope | null>(null);
  const [restored, setRestored] = useState(false);

  const [results, setResults] = useState<SearchResult[]>([]);
  /* Tirer pour actualiser : relance une vraie recherche en ignorant le
     cache, sans vider la liste affichée entre-temps. */
  const [reloadTick, setReloadTick] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(0);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<Dialog>({ kind: "none" });
  const [moreOpen, setMoreOpen] = useState(false);

  /* Position de la liste restituée au retour depuis un aperçu. */
  useListScrollMemory("search", results.length > 0);

  const [progressOpen, setProgressOpen] = useState(false);
  const [progressTitle, setProgressTitle] = useState("");
  const [progressSubtitle, setProgressSubtitle] = useState("");
  const [transferTaskId, setTransferTaskId] = useState<string | null>(null);
  const activeTransfer = useTransferTask(transferTaskId);
  const transferProgress: ProgressEvent | null = activeTransfer
    ? {
        completed: activeTransfer.completed,
        total: activeTransfer.total,
        bytes: activeTransfer.bytes,
        totalBytes: activeTransfer.totalBytes,
        currentName: activeTransfer.currentName ?? "",
        elapsedMs: Date.now() - activeTransfer.startedAt,
        etaMs: activeTransfer.etaMs,
      }
    : null;
  const hideTransferDialog = useCallback(() => {
    setProgressOpen(false);
    setTransferTaskId(null);
  }, []);
  useEffect(() => {
    if (activeTransfer && activeTransfer.status !== "running") {
      setProgressOpen(false);
      setTransferTaskId(null);
    }
  }, [activeTransfer]);

  const signalRef = useRef<(OperationSignal & { cancel: () => void }) | null>(null);
  const runRef = useRef<{ abort: () => void } | null>(null);
  const historyTimer = useRef<number | null>(null);

  /* ---------- restauration de l'état ---------- */

  useEffect(() => {
    setHistory(loadSearchHistory());
    setView(loadView());
    const incoming = takeSearchScope();
    if (incoming) {
      // Nouvelle recherche contextuelle demandée par l'écran appelant.
      setScope(incoming);
      setFiltersState(loadSearchFilters());
      setRestored(true);
      return;
    }
    const saved = loadScreenState<SearchSession>(SESSION_KEY);
    if (saved) {
      setQuery(saved.query ?? "");
      setFiltersState(saved.filters ?? loadSearchFilters());
      setScope(saved.scope ?? null);
      setSelected(new Set(saved.selected ?? []));
    } else {
      setFiltersState(loadSearchFilters());
    }
    setRestored(true);
  }, []);

  // Sauvegarde continue : ouvrir un dossier puis revenir restitue
  // exactement la même recherche.
  useEffect(() => {
    if (!restored) return;
    saveScreenState<SearchSession>(SESSION_KEY, {
      query,
      filters,
      scope,
      selected: [...selected],
    });
  }, [restored, query, filters, scope, selected]);

  /* Retour Android : filtres → sélection → recherche en cours → écran
     précédent. */
  useBackHandler(
    showFilters,
    () => {
      setShowFilters(false);
      return true;
    },
    BACK_PRIORITY.overlay,
  );
  useBackHandler(
    moreOpen,
    () => {
      setMoreOpen(false);
      return true;
    },
    BACK_PRIORITY.overlay,
  );
  useBackHandler(
    selected.size > 0,
    () => {
      setSelected(new Set());
      return true;
    },
    BACK_PRIORITY.mode,
  );
  useBackHandler(
    query.length > 0,
    () => {
      setQuery("");
      return true;
    },
    BACK_PRIORITY.mode,
  );

  // Les filtres survivent à la navigation et au redémarrage de l'app.
  const setFilters = useCallback((next: SearchFilters) => {
    setFiltersState(next);
    saveSearchFilters(next);
  }, []);

  /* ---------- streaming search ---------- */

  useEffect(() => {
    if (!restored) return;
    // Debounce: cancel previous, wait 140ms before firing.
    runRef.current?.abort();

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setScanned(0);
      setScanning(false);
      return;
    }

    // LRU cache — instant paint on back-navigation / repeated queries.
    const cacheKey = keyFor(trimmed, filters);
    const cached = getCachedSearch(cacheKey);
    if (cached) {
      setResults(cached.results);
      setScanned(cached.scanned);
      setScanning(false);
    } else {
      // Pas de purge ici : les résultats précédents restent affichés pendant
      // le nouveau scan et sont remplacés à l'arrivée du premier lot.
      setScanned(0);
    }

    const targetRoots = scope
      ? [{ rootId: scope.path.rootId, path: scope.path }]
      : filters.rootId === "all"
        ? roots.map((r) => ({ rootId: r.id, path: { rootId: r.id, segments: [] } as PathRef }))
        : [
            {
              rootId: filters.rootId as StorageRootId,
              path: { rootId: filters.rootId as StorageRootId, segments: [] } as PathRef,
            },
          ];

    if (targetRoots.length === 0) {
      setScanning(false);
      return;
    }

    setScanning(true);
    let latestScanned = 0;
    let firstBatch = !cached;
    let latestResults: SearchResult[] = cached?.results ?? [];
    const timer = window.setTimeout(() => {
      const ctrl = runSearch({
        query: trimmed,
        filters,
        roots: targetRoots,
        onBatch: (batch) => {
          setResults((prev) => {
            const base = firstBatch ? [] : prev;
            firstBatch = false;
            const merged = sortResults([...base, ...batch]).slice(0, RESULTS_LIMIT);
            latestResults = merged;
            return merged;
          });
        },
        onProgress: (n) => {
          latestScanned = n;
          setScanned(n);
        },
        onDone: ({ failedProviders }) => {
          setScanning(false);
          // Aucun lot reçu : la requête n'a réellement rien donné, on retire
          // les résultats de la requête précédente encore affichés.
          if (firstBatch) {
            firstBatch = false;
            latestResults = [];
            setResults([]);
          }
          setCachedSearch(cacheKey, latestResults, latestScanned);
          if (failedProviders.length > 0) {
            toast.warning(translate("search.toast.partial.title"), {
              description: translate("search.toast.partial.desc"),
            });
          }
        },
      });
      runRef.current = ctrl;
    }, 140);

    // Persist to history after a short pause (avoids logging every keystroke).
    if (historyTimer.current != null) window.clearTimeout(historyTimer.current);
    historyTimer.current = window.setTimeout(() => {
      setHistory(pushSearchHistory(trimmed));
    }, 900);

    return () => {
      window.clearTimeout(timer);
      runRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    restored,
    query,
    filters.kind,
    filters.size,
    filters.date,
    filters.rootId,
    scope,
    reloadTick,
  ]);

  useEffect(() => {
    return () => {
      runRef.current?.abort();
      if (historyTimer.current != null) window.clearTimeout(historyTimer.current);
    };
  }, []);

  /* ---------- sélection ---------- */

  const selectedFiles = useMemo(
    () => results.filter((r) => selected.has(resultId(r))),
    [results, selected],
  );

  // La sélection reste pertinente : les éléments disparus des résultats
  // sont oubliés silencieusement.
  useEffect(() => {
    if (selected.size === 0) return;
    const alive = new Set(results.map(resultId));
    let changed = false;
    const next = new Set<string>();
    for (const id of selected) {
      if (alive.has(id)) next.add(id);
      else changed = true;
    }
    if (changed && !scanning) setSelected(next);
  }, [results, selected, scanning]);

  const selectionItems = useMemo(() => {
    const m = new Map<string, SelectionItem>();
    for (const r of selectedFiles) {
      const parent = parentOf(r);
      const key = selectionKey(parent, r.name);
      m.set(key, { key, parent, entry: r });
    }
    return m;
  }, [selectedFiles]);
  const selectionSize = useSelectionSize(selectionItems);
  const selectionSizeLabel = selectionSize.pending
    ? selectionSize.bytes > 0
      ? t("files.recent.calculatingSuffix", { size: formatSize(selectionSize.bytes) })
      : t("files.recent.calculatingOnly")
    : formatSize(selectionSize.bytes);

  const clearSelection = useCallback(() => setSelected(new Set()), []);
  const selectAll = useCallback(() => {
    setSelected(new Set(results.map(resultId)));
  }, [results]);
  const selectRange = useCallback(() => {
    setSelected((prev) => {
      if (prev.size === 0) return prev;
      const indices: number[] = [];
      results.forEach((r, i) => {
        if (prev.has(resultId(r))) indices.push(i);
      });
      if (indices.length === 0) return prev;
      const next = new Set(prev);
      for (let i = indices[0]; i <= indices[indices.length - 1]; i++) {
        next.add(resultId(results[i]));
      }
      return next;
    });
  }, [results]);

  const openFolder = useCallback(
    (target: PathRef) => {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("gf.files.jumpTo", JSON.stringify(target));
      }
      navigate({ to: "/" });
    },
    [navigate],
  );

  const toggleSelect = useCallback(
    (entry: FileEntry) => {
      const r = entry as SearchResult;
      if (pick) {
        if (r.isDirectory) {
          if (pick.accept === "files") openFolder({ rootId: r.rootId, segments: r.segments });
          return;
        }
        if (pick.accept === "folders") return;
        if (!pick.multi) {
          confirmPick({ parent: parentOf(r), entry: r });
          return;
        }
        toggleGlobalSelection(parentOf(r), r);
        return;
      }
      const id = resultId(r);
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    [pick, openFolder],
  );

  const beginSelection = useCallback(
    (entry: FileEntry) => {
      if (pick) return;
      setSelected(new Set([resultId(entry as SearchResult)]));
    },
    [pick],
  );

  const isSelected = useCallback(
    (e: FileEntry) =>
      pick
        ? globalSelection.has(selectionKey(parentOf(e as SearchResult), e.name))
        : selected.has(resultId(e as SearchResult)),
    [pick, globalSelection, selected],
  );

  /* ---------- ouverture ---------- */

  const openEntry = useCallback(
    (entry: FileEntry) => {
      const r = entry as SearchResult;
      if (pick) {
        toggleSelect(entry);
        return;
      }
      if (r.isDirectory) {
        openFolder({ rootId: r.rootId, segments: r.segments });
        return;
      }
      if (isPackageEntry(r)) openPackageSheet({ parent: parentOf(r), entry: r });
      else if (canPreview(r)) setDialog({ kind: "viewer", entryId: resultId(r) });
      else setDialog({ kind: "actions", entry: r });
    },
    [pick, toggleSelect, openFolder],
  );

  const quickOpenEntry = useCallback(
    (entry: FileEntry) => {
      const r = entry as SearchResult;
      if (r.isDirectory) {
        openFolder({ rootId: r.rootId, segments: r.segments });
        return;
      }
      if (isPackageEntry(r)) openPackageSheet({ parent: parentOf(r), entry: r });
      else if (canOpenInViewer(r)) setDialog({ kind: "viewer", entryId: resultId(r) });
      else setDialog({ kind: "actions", entry: r });
    },
    [openFolder],
  );

  /* ---------- opérations ---------- */

  usePullToRefresh(
    useCallback(() => {
      // Le cache est vidé : la relecture repart réellement du stockage.
      clearSearchCache();
      setReloadTick((n) => n + 1);
    }, []),
  );

  const refreshAfterMutation = useCallback(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("gf:storage-changed"));
    }
  }, []);

  const doShare = useCallback(
    async (items: SearchResult[]) => {
      for (const g of groupByParent(items)) {
        const r = await shareEntries(g.parent, g.entries);
        if (!r.ok) toast.error(errorMessage(r.error, t("files.recent.sharePartial")));
      }
    },
    [t],
  );

  const doDelete = useCallback(
    async (items: SearchResult[], permanent = false) => {
      let ok = 0;
      let failed = 0;
      const removed = new Set(items.map(resultId));
      for (const g of groupByParent(items)) {
        const r = await deleteEntries(g.parent, g.entries, { permanent });
        ok += r.succeeded;
        failed += r.failed.length;
      }
      clearSelection();
      setResults((prev) => prev.filter((r) => !removed.has(resultId(r))));
      refreshAfterMutation();
      const s = batchSummary(
        permanent ? t("action.deleteForever") : t("files.recent.movedToTrashVerb"),
        ok,
        failed,
      );
      if (s.ok) toast.success(s.message);
      else toast.error(s.message);
      return ok > 0;
    },
    [clearSelection, refreshAfterMutation, t],
  );

  const doTransfer = useCallback(
    (mode: "copy" | "move", items: SearchResult[], dest: PathRef) => {
      const destLabel = dest.segments.length
        ? dest.segments.join(" / ")
        : t("home.transfer.rootLabel");
      const moved = new Set(items.map(resultId));
      const id = startTransfer({
        mode,
        groups: groupByParent(items),
        destination: dest,
        onDone: (task) => {
          refreshAfterMutation();
          if (mode === "move") {
            setResults((prev) => prev.filter((r) => !moved.has(resultId(r))));
          }
          if (task.status === "cancelled") {
            toast.warning(t("home.transfer.cancelled"));
            return;
          }
          const message = summaryMessage(task);
          if (task.failures.length > 0) toast.error(message);
          else toast.success(message);
          if (task.succeeded > 0) openTransferDestination(task);
        },
      });
      setTransferTaskId(id);
      setProgressTitle(
        progressLabel(
          mode === "copy" ? t("files.recent.copyAction") : t("files.recent.moveAction"),
          undefined,
          items.length,
        ),
      );
      setProgressSubtitle(t("files.recent.destinationSubtitle", { destination: destLabel }));
      setProgressOpen(true);
      clearSelection();
    },
    [clearSelection, refreshAfterMutation, t],
  );

  const startTransferFlow = useCallback(
    async (mode: "copy" | "move", items: SearchResult[]) => {
      if (items.length === 0) return;
      const picked = [...items];
      setDialog({ kind: "none" });
      const dest = await requestDestination({ mode });
      if (!dest) return;
      doTransfer(mode, picked, dest);
    },
    [doTransfer],
  );

  const doRename = useCallback(
    async (entry: SearchResult, newName: string) => {
      const r = await renameEntry(parentOf(entry), entry, newName);
      if (r.ok) {
        toast.success(t("home.rename.done"));
        clearSelection();
        setResults((prev) =>
          prev.map((item) =>
            resultId(item) === resultId(entry)
              ? {
                  ...item,
                  name: newName,
                  segments: [...item.parentSegments, newName],
                  path: item.path.slice(0, item.path.length - item.name.length) + newName,
                }
              : item,
          ),
        );
        refreshAfterMutation();
        return true;
      }
      toast.error(errorMessage(r.error, t("files.recent.renamePartial")));
      return false;
    },
    [clearSelection, refreshAfterMutation, t],
  );

  const showDetails = useCallback(async (entry: SearchResult) => {
    setDialog({ kind: "details", info: null, loading: true });
    const info = await readDetails(parentOf(entry), entry);
    setDialog({ kind: "details", info, loading: false });
  }, []);

  const onEntryAction = useCallback(
    async (action: EntryAction) => {
      if (dialog.kind !== "actions") return;
      const r = dialog.entry;
      const parent = parentOf(r);
      setDialog({ kind: "none" });
      switch (action) {
        case "open":
          if (isPackageEntry(r)) openPackageSheet({ parent, entry: r });
          else if (canPreview(r)) setDialog({ kind: "viewer", entryId: resultId(r) });
          else await openWithSystem(parent, r);
          break;
        case "openWith":
          await openWithSystem(parent, r);
          break;
        case "editAudio":
          await navigate({ to: "/editeur-audio", search: audioEditorSearch(parent, r) });
          break;
        case "share":
          await doShare([r]);
          break;
        case "rename":
          setDialog({ kind: "rename", entry: r });
          break;
        case "copy":
          void startTransferFlow("copy", [r]);
          break;
        case "move":
          void startTransferFlow("move", [r]);
          break;
        case "delete":
          setDialog({ kind: "confirmDelete", items: [r] });
          break;
        case "info":
          await showDetails(r);
          break;
        default:
          break;
      }
    },
    [dialog, doShare, navigate, showDetails, startTransferFlow],
  );

  const onViewerAction = useCallback(
    async (entry: FileEntry, action: ViewerAction) => {
      const r = entry as SearchResult;
      const parent = parentOf(r);
      switch (action) {
        case "share":
          await doShare([r]);
          break;
        case "openWith":
          await openWithSystem(parent, r);
          break;
        case "rename":
          setDialog({ kind: "rename", entry: r });
          break;
        case "copy":
          void startTransferFlow("copy", [r]);
          break;
        case "move":
          void startTransferFlow("move", [r]);
          break;
        case "delete":
          setDialog({ kind: "confirmDelete", items: [r] });
          break;
        case "info":
          await showDetails(r);
          break;
        default:
          break;
      }
    },
    [doShare, showDetails, startTransferFlow],
  );

  const viewerEntries = useMemo(() => results.filter((r) => canOpenInViewer(r)), [results]);
  /* Identifiant affiché par le lecteur : il survit à l'ouverture du
     dialogue de suppression, qui se superpose au lecteur. */
  const activeViewerId =
    dialog.kind === "viewer"
      ? dialog.entryId
      : dialog.kind === "confirmDelete"
        ? dialog.viewerId
        : undefined;
  const viewerIndex = useMemo(() => {
    if (!activeViewerId) return -1;
    return viewerEntries.findIndex((r) => resultId(r) === activeViewerId);
  }, [activeViewerId, viewerEntries]);

  const activeFilterCount = filtersActive(filters);
  const showRecents = query.trim().length === 0;
  const selectionMode = selected.size > 0 && !pick;

  return (
    <AppShell>
      {selectionMode ? (
        <SelectionTopBar
          count={selectedFiles.length}
          sizeLabel={selectionSizeLabel}
          onClear={clearSelection}
          onSelectAll={selectAll}
          onSelectRange={selectedFiles.length >= 1 ? selectRange : undefined}
        />
      ) : (
        <>
          <div className="mt-2">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                inputMode="search"
                enterKeyHint="search"
                autoCorrect="on"
                autoCapitalize="sentences"
                spellCheck
                autoFocus={query.length === 0}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  scope
                    ? t("search.input.placeholderScoped", { scope: scope.label })
                    : t("search.input.placeholderGlobal")
                }
                aria-label={t("search.input.aria")}
                className="h-13 w-full rounded-3xl border border-border bg-surface-elevated pl-11 pr-20 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30 focus-visible:shadow-none"
              />
              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label={t("cleaner.trash.clearSearch.aria")}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <X className="h-[18px] w-[18px]" />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setShowFilters(true)}
                  aria-label={t("search.filters.aria")}
                  className={`relative rounded-lg p-1.5 transition-colors ${
                    activeFilterCount > 0
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <SlidersHorizontal className="h-[18px] w-[18px]" />
                  {activeFilterCount > 0 ? (
                    <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                      {activeFilterCount}
                    </span>
                  ) : null}
                </button>
              </div>
            </label>
          </div>

          {/* Quick kind chips — always visible for one-tap filtering. */}
          <div className="mt-3 flex flex-wrap gap-2">
            {kindChips(t).map((c) => {
              const active = filters.kind === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setFilters({ ...filters, kind: c.id })}
                  className={`gf-press rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition-colors ${
                    active
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-surface text-foreground hover:border-primary/40 hover:bg-accent"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </>
      )}

      {showRecents ? (
        <RecentSearches
          history={history}
          onPick={(q) => setQuery(q)}
          onRemove={(q) => setHistory(removeSearchHistoryItem(q))}
          onClear={() => {
            clearSearchHistory();
            setHistory([]);
          }}
        />
      ) : (
        <>
          <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              {results.length > 0
                ? `${t("search.results.found", { count: results.length })}${
                    results.length >= RESULTS_LIMIT ? "+" : ""
                  }`
                : scanning
                  ? t("search.results.searching")
                  : t("state.noResults")}
            </span>
            {scanning ? (
              <span className="inline-flex items-center gap-1">
                <Spinner size={12} />
                {scanned > 0
                  ? t("search.results.scanned", { count: scanned })
                  : t("search.results.starting")}
              </span>
            ) : null}
          </div>

          {results.length > 0 ? (
            <div className="-mx-4 pt-1">
              {view === "list" ? (
                <FileListView
                  entries={results}
                  onOpen={openEntry}
                  onQuickOpen={quickOpenEntry}
                  onLongPress={beginSelection}
                  onMore={(e) => {
                    if (!pick) setDialog({ kind: "actions", entry: e as SearchResult });
                  }}
                  selectionMode={selectionMode || pick !== null}
                  isSelected={isSelected}
                  onToggleSelect={toggleSelect}
                />
              ) : (
                <FileGridView
                  entries={results}
                  onOpen={openEntry}
                  onQuickOpen={quickOpenEntry}
                  onLongPress={beginSelection}
                  onMore={(e) => {
                    if (!pick) setDialog({ kind: "actions", entry: e as SearchResult });
                  }}
                  selectionMode={selectionMode || pick !== null}
                  isSelected={isSelected}
                  onToggleSelect={toggleSelect}
                />
              )}
            </div>
          ) : null}

          {!scanning && results.length === 0 ? (
            <div className="mt-4">
              <IllustratedEmptyState
                id="search"
                adSlot="empty-search"
                description={t("search.empty.description", { query })}
              />
            </div>
          ) : null}

          {/* Publicité : toujours après le dernier résultat, jamais au
              milieu de la liste ; repliée à zéro sans annonce. */}
          {!scanning && results.length > 0 && !pick && !selectionMode ? (
            <div className="mt-4">
              <InlineAdBanner slot="search" />
            </div>
          ) : null}
        </>
      )}

      {selectionMode ? (
        <SelectionBar
          count={selectedFiles.length}
          onCopy={() => void startTransferFlow("copy", selectedFiles)}
          onMove={() => void startTransferFlow("move", selectedFiles)}
          onDelete={() => setDialog({ kind: "confirmDelete", items: selectedFiles })}
          onRename={() => {
            if (selectedFiles.length !== 1) return;
            setDialog({ kind: "rename", entry: selectedFiles[0] });
          }}
          onShare={() => doShare(selectedFiles.filter((r) => !r.isDirectory))}
          onMore={() => setMoreOpen(true)}
        />
      ) : null}

      <MoreActionsSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        actions={buildMoreActions(selectedFiles, {
          onShare: () => doShare(selectedFiles.filter((r) => !r.isDirectory)),
          onProperties: async () => {
            const r = selectedFiles[0];
            if (r) await showDetails(r);
          },
          onCut: () => void startTransferFlow("move", selectedFiles),
        })}
      />

      <EntryActionSheet
        open={dialog.kind === "actions"}
        entry={dialog.kind === "actions" ? dialog.entry : null}
        onClose={() => setDialog({ kind: "none" })}
        onAction={onEntryAction}
      />

      <NamePrompt
        open={dialog.kind === "rename"}
        title={t("action.rename")}
        label={t("files.recent.newNameLabel")}
        initial={dialog.kind === "rename" ? dialog.entry.name : ""}
        cta={t("action.rename")}
        onCancel={() => setDialog({ kind: "none" })}
        onSubmit={async (name: string) => {
          if (dialog.kind !== "rename") return;
          const ok = await doRename(dialog.entry, name);
          if (ok) setDialog({ kind: "none" });
        }}
      />

      <DeleteConfirmDialog
        open={dialog.kind === "confirmDelete"}
        count={dialog.kind === "confirmDelete" ? dialog.items.length : 0}
        onCancel={() => {
          if (dialog.kind === "confirmDelete" && dialog.viewerId)
            setDialog({ kind: "viewer", entryId: dialog.viewerId });
          else setDialog({ kind: "none" });
        }}
        onConfirm={async (permanent) => {
          if (dialog.kind !== "confirmDelete") return;
          const { items, viewerId } = dialog;
          let nextId: string | null = null;
          if (viewerId) {
            const idx = viewerEntries.findIndex((r) => resultId(r) === viewerId);
            if (idx >= 0) {
              const next = viewerEntries[idx + 1] ?? viewerEntries[idx - 1];
              nextId = next ? resultId(next) : null;
            }
          }
          setDialog({ kind: "none" });
          const ok = await doDelete(items, permanent);
          if (viewerId && ok && nextId) setDialog({ kind: "viewer", entryId: nextId });
        }}
      />

      <DetailsSheet
        open={dialog.kind === "details"}
        info={dialog.kind === "details" ? dialog.info : null}
        onClose={() => setDialog({ kind: "none" })}
      />

      <UniversalViewer
        open={Boolean(activeViewerId) && viewerIndex >= 0}
        entries={viewerEntries}
        parent={
          viewerEntries[viewerIndex >= 0 ? viewerIndex : 0]
            ? parentOf(viewerEntries[viewerIndex >= 0 ? viewerIndex : 0])
            : null
        }
        index={viewerIndex >= 0 ? viewerIndex : 0}
        onIndexChange={(i) => {
          const next = viewerEntries[i];
          if (next) setDialog({ kind: "viewer", entryId: resultId(next) });
        }}
        onClose={() => setDialog({ kind: "none" })}
        parentOf={(e) => parentOf(e as SearchResult)}
        onAction={onViewerAction}
      />

      <ProgressDialog
        open={progressOpen}
        title={progressTitle}
        subtitle={progressSubtitle}
        progress={transferProgress}
        onCancel={() => {
          if (transferTaskId) cancelTransfer(transferTaskId);
          else signalRef.current?.cancel();
        }}
        onHide={transferTaskId ? hideTransferDialog : undefined}
      />

      <FiltersSheet
        open={showFilters}
        filters={filters}
        onClose={() => setShowFilters(false)}
        onChange={setFilters}
        roots={roots}
      />
    </AppShell>
  );
}

/* ---------- recherches récentes (requête vide) ---------- */

function RecentSearches({
  history,
  onPick,
  onRemove,
  onClear,
}: {
  history: SearchHistoryItem[];
  onPick: (q: string) => void;
  onRemove: (q: string) => void;
  onClear: () => void;
}) {
  const t = useT();
  const pick = usePickRequest();
  return (
    <>
      <SectionHeader
        title={t("files.recherchesRecentes")}
        action={
          history.length > 0 ? (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <Trash2 className="h-4 w-4" />
              {t("search.recents.clearAll")}
            </button>
          ) : undefined
        }
      />
      {history.length === 0 ? (
        <p className="gf-card px-4 py-7 text-center text-[12.5px] text-muted-foreground">
          {t("files.vosRecherchesRecentesApparaitrontIci")}
        </p>
      ) : (
        <div className="gf-card divide-y divide-border/60">
          {history.slice(0, 10).map((h) => (
            <div
              key={h.query}
              className="flex items-center gap-2 pr-2 transition-colors hover:bg-secondary/40"
            >
              <button
                type="button"
                onClick={() => onPick(h.query)}
                className="flex flex-1 items-center gap-3 px-4 py-3 text-left"
              >
                <Clock className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate text-sm">{h.query}</span>
              </button>
              <button
                type="button"
                aria-label={t("search.recents.remove.aria", { query: h.query })}
                onClick={() => onRemove(h.query)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Écran initial : publicité en zone secondaire, tout en bas du
          contenu, loin du champ de recherche et du clavier. Jamais pendant
          une session de sélection de fichiers. */}
      {pick ? null : (
        <div className="mt-4">
          <InlineAdBanner slot="search" />
        </div>
      )}
    </>
  );
}

/* ---------- filters sheet ---------- */

function FiltersSheet({
  open,
  filters,
  onChange,
  onClose,
  roots,
}: {
  open: boolean;
  filters: SearchFilters;
  onChange: (f: SearchFilters) => void;
  onClose: () => void;
  roots: { id: StorageRootId; label: string }[];
}) {
  const t = useT();
  return (
    <BottomSheet open={open} onClose={onClose} title={t("search.filters.title")}>
      <div className="space-y-5 pb-2">
        <FilterGroup title={t("search.filters.location")}>
          <FilterChip
            active={filters.rootId === "all"}
            onClick={() => onChange({ ...filters, rootId: "all" })}
          >
            {t("files.tousLesEmplacements")}
          </FilterChip>
          {roots.map((r) => (
            <FilterChip
              key={r.id}
              active={filters.rootId === r.id}
              onClick={() => onChange({ ...filters, rootId: r.id })}
            >
              {r.label}
            </FilterChip>
          ))}
        </FilterGroup>

        <FilterGroup title={t("files.details.size")}>
          {sizeOptions(t).map((o) => (
            <FilterChip
              key={o.id}
              active={filters.size === o.id}
              onClick={() => onChange({ ...filters, size: o.id })}
            >
              {o.label}
            </FilterChip>
          ))}
        </FilterGroup>

        <FilterGroup title={t("search.filters.dateModified")}>
          {dateOptions(t).map((o) => (
            <FilterChip
              key={o.id}
              active={filters.date === o.id}
              onClick={() => onChange({ ...filters, date: o.id })}
            >
              {o.label}
            </FilterChip>
          ))}
        </FilterGroup>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            {t("action.reset")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="gf-press rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft"
          >
            {t("search.filters.apply")}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`gf-press rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition-colors ${
        active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-surface text-foreground hover:border-primary/40 hover:bg-accent"
      }`}
    >
      {children}
    </button>
  );
}
