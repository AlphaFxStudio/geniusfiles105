import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useT } from "@/lib/i18n";
import {
  GfAutomations,
  GfGeniusAi,
  GfHome,
  GfSettings,
  type GfIconComponent,
} from "@/components/icons";
import { useEffect, type ReactNode } from "react";
import { PlayerHost } from "@/components/player/PlayerHost";
import { QuickScrollFab } from "@/components/common/QuickScrollFab";
import { ScrollFeel } from "@/components/common/ScrollFeel";
import { TransferTracker } from "@/components/jobs/TransferTracker";
import { ConflictDialog } from "@/components/jobs/ConflictDialog";
import { useReaderMode } from "@/lib/viewer/reader-mode";
import { useInPickLayer } from "@/components/files/pick-layer-context";
import { PackageSheetHost } from "@/components/files/PackageSheet";
import { IncomingFileHost } from "@/components/viewer/IncomingFileHost";
import { warmUpAds } from "@/lib/ads/warmup";
import { useViewportInset } from "@/hooks/use-viewport-inset";

type NavItem = {
  to: string;
  labelKey: "nav.home" | "nav.assistant" | "nav.automations" | "nav.settings";
  icon: GfIconComponent;
};

/* Quatre destinations, ni plus ni moins : la barre se divise en quatre
   colonnes de largeur strictement identique. */
const NAV: NavItem[] = [
  { to: "/", labelKey: "nav.home", icon: GfHome },
  { to: "/assistant", labelKey: "nav.assistant", icon: GfGeniusAi },
  { to: "/automatisations", labelKey: "nav.automations", icon: GfAutomations },
  { to: "/parametres", labelKey: "nav.settings", icon: GfSettings },
];

export function AppShell({ children }: { children?: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  /* Pendant la lecture d'un document, la navigation principale est
     entièrement retirée de l'arbre : aucune hauteur, aucun événement. */
  const reader = useReaderMode();
  /* Rendu à l'intérieur d'une session de sélection : la navigation
     principale, le lecteur et les suivis sont déjà montés par l'écran
     appelant — on ne les duplique pas. */
  const inPick = useInPickLayer();
  const isHome = pathname === "/" || inPick;
  /* Écrans dotés d'un en-tête collant (FilesTopBar ou PageHeader) : ils
     absorbent eux-mêmes l'inset supérieur. Un padding ici laisserait une
     bande vide au-dessus du titre. */
  const ownsSafeArea =
    isHome ||
    [
      "/categorie",
      "/parametres",
      "/automatisations",
      "/pdf-outils",
      "/corbeille",
      "/coffre-fort",
      "/fichiers-recents",
      "/nettoyeur",
      "/applications",
    ].some((p) => pathname.startsWith(p));
  /* La conversation gère elle-même sa hauteur et son espace bas (nav + clavier). */
  const isChat = pathname.startsWith("/assistant");
  /* Clavier logiciel : la barre de navigation reste physiquement en bas de
     l'écran (elle passe derrière le clavier) au lieu d'être remontée
     par-dessus le formulaire de saisie. */
  const { keyboardInset } = useViewportInset();

  /* Préchauffage publicitaire : une seule annonce est préparée en arrière-
     plan, après le premier écran. Elle est ainsi déjà prête quand un écran
     publicitaire s'ouvre. Best-effort : jamais bloquant, jamais répété. */
  useEffect(() => warmUpAds(), []);

  return (
    <div
      /* overflow-x-clip (et non hidden) : « hidden » crée un conteneur de
         défilement qui casse position:sticky des en-têtes. */
      className="mx-auto flex min-h-dvh w-full max-w-[560px] flex-col overflow-x-clip bg-background"
    >
      <main
        className={
          isChat
            ? "flex h-dvh min-h-0 flex-1 flex-col overflow-hidden px-0 pb-0 pt-0"
            : `flex-1 px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] ${
                ownsSafeArea ? "pt-0" : "pt-safe"
              }`
        }
      >
        {/* Aucune clé sur le conteneur : une clé par chemin remonterait
            tout l'écran à chaque navigation (perte d'état, de position de
            défilement et clignotement au retour). */}
        <div className={isChat ? "gf-page flex min-h-0 flex-1 flex-col" : "gf-page"}>
          {children ?? <Outlet />}
        </div>
      </main>
      {inPick ? null : <PlayerHost />}
      {/* Fiche paquet Android (APK / AAB / XAPK) : montée une seule fois,
          partagée par tous les écrans qui listent des fichiers. */}
      <PackageSheetHost />
      {/* « Ouvrir avec… » entrant : fichier confié par une autre
          application Android, affiché dans la visionneuse universelle. */}
      {inPick ? null : <IncomingFileHost />}
      {/* Sensation de défilement native : résistance de bord sur le seul
          contenu + tirer pour actualiser (jamais en mode lecture). */}
      {/* Genius AI gère son propre défilement interne : aucun geste global
          (résistance de bord, tirer pour actualiser) sur cet écran. */}
      {reader || inPick || isChat ? null : <ScrollFeel />}

      {/* Navigation verticale rapide : la fenêtre est le conteneur défilant
          de tous les écrans de listes. */}
      {isChat || reader || inPick ? null : <QuickScrollFab topInset={72} bottomInset={104} />}
      {/* Copies / déplacements en arrière-plan : suivi permanent (sans interface). */}
      {inPick ? null : <TransferTracker />}
      {/* Conflit de copie / déplacement : une seule question, partout. */}
      <ConflictDialog />
      {reader || inPick ? null : <BottomNav pathname={pathname} keyboardInset={keyboardInset} />}
      {/* Aucune bannière globale : les annonces sont intégrées dans le flux
          des écrans concernés (voir <InlineAdBanner /> et <EmptyStateAd />). */}
      {/* Écran opaque de la barre d'état. */}
      {reader ? null : (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 z-50 h-safe-top bg-background"
        />
      )}
    </div>
  );
}

/**
 * Barre de navigation principale.
 *
 * Composition : quatre colonnes strictement égales (`flex-1 basis-0`), donc
 * un équilibre parfait quelle que soit la longueur du libellé. Aucun calcul
 * de position en JavaScript, aucune mesure au redimensionnement : l'état
 * actif est un simple aplat compact derrière l'icône, animé par CSS.
 */
function BottomNav({ pathname, keyboardInset = 0 }: { pathname: string; keyboardInset?: number }) {
  const t = useT();
  const activeTo =
    NAV.find(({ to }) => (to === "/" ? pathname === "/" : pathname.startsWith(to)))?.to ?? null;

  return (
    <nav
      data-gf-bottom-nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[560px] border-t border-border/70 bg-nav-bar pb-[env(safe-area-inset-bottom)] pl-safe pr-safe shadow-[0_-8px_28px_-18px_rgb(0_0_0/0.55)]"
      aria-label={t("home.nav.aria")}
      /* Clavier ouvert : la barre est redescendue derrière le clavier pour
         ne jamais recouvrir le formulaire de saisie. */
      style={keyboardInset > 0 ? { transform: `translateY(${keyboardInset}px)` } : undefined}
    >
      <div className="flex w-full items-stretch">
        {NAV.map(({ to, labelKey, icon: Icon }) => {
          const active = to === activeTo;
          return (
            <Link
              key={to}
              to={to}
              /* Les sections principales ne s'empilent JAMAIS : passer de
                 l'une à l'autre remplace l'écran courant. Le Retour ne
                 redéroule donc pas la liste des sections déjà visitées —
                 il ramène directement à l'Accueil (puis propose de
                 quitter l'application). */
              replace
              /* Les quatre destinations sont préchargées dès l'affichage de
                 la barre : passer d'une section à l'autre n'attend plus
                 aucun chargement de module. */
              preload="render"
              aria-current={active ? "page" : undefined}
              className="relative flex flex-1 basis-0 flex-col items-center justify-center gap-1 pb-2 pt-2.5 transition-transform duration-150 ease-out active:scale-95"
            >
              {/* Repère supérieur (« lampadaire ») : segment court ancré au
                  bord haut de la barre, exactement au-dessus de la
                  destination active. */}
              <span
                aria-hidden
                className={`absolute -top-px left-1/2 h-[3px] w-10 -translate-x-1/2 rounded-full bg-nav-pill-foreground transition-opacity duration-200 ease-out ${
                  active ? "opacity-100" : "opacity-0"
                }`}
              />
              <span
                aria-hidden
                className={`flex h-9 w-14 items-center justify-center rounded-2xl transition-colors duration-200 ease-out ${
                  active ? "bg-nav-pill" : "bg-transparent"
                }`}
              >
                <Icon
                  className={`h-[26px] w-[26px] shrink-0 transition-colors duration-200 ease-out ${
                    active ? "text-nav-pill-foreground" : "text-nav-inactive"
                  }`}
                />
              </span>
              <span
                className={`w-full truncate px-1 text-center text-[11px] leading-none transition-colors duration-200 ease-out ${
                  active
                    ? "font-semibold text-nav-pill-foreground"
                    : "font-medium text-nav-inactive"
                }`}
              >
                {t(labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
