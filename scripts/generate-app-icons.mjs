#!/usr/bin/env node
/**
 * generate-app-icons.mjs
 *
 * Génère TOUTES les ressources graphiques Android de GeniusFiles à partir
 * d'un seul master : `public/brand/geniusfiles-logo.png`.
 *
 * Ce master est un PNG 1024×1024 **détouré** (fond transparent) et
 * **recadré au plus juste** sur la marque : une plaque à coins arrondis
 * (corps clair ≈ #EDEEF2, onglet bleu, visage sombre).
 *
 * CAUSE RACINE de l'effet « petite image posée sur un carré noir » :
 * Android n'affiche que la région centrale 72dp d'un calque adaptatif de
 * 108dp (ratio 0.667). L'ancien premier plan dessinait la marque à 0.50
 * du canvas — soit ~54dp sur les 72dp visibles (75 %) — sur un fond
 * graphite #191919. Résultat : marque visuellement réduite d'un quart,
 * encadrée d'un liseré sombre, là où les applications premium (TempoKey)
 * sont *full-bleed*.
 *
 * CORRECTIF : la marque est dessinée à 0.62 du canvas → elle remplit
 * la fenêtre visible de 72dp (léger retrait pour que l'onglet du dossier
 * ne soit jamais rogné par un masque circulaire), et le calque de fond reprend la couleur du corps du
 * logo (#EDEEF2). Les coins rognés par le masque du lanceur (cercle,
 * squircle, arrondi, carré) se fondent donc dans la marque : plus aucun
 * bord noir, aucune marge excessive, proportions d'origine intactes.
 *
 * Ressources produites :
 *   resources/icon.png            → icône legacy (API < 26), 1024², fond plaque
 *   resources/icon-foreground.png → premier plan adaptatif, transparent
 *   resources/icon-background.png → arrière-plan adaptatif, couleur plaque
 *   resources/splash.png(-dark)   → splash Capacitor (API < 31)
 *   drawable-nodpi/splash_icon_foreground.png → icône du SplashScreen API 31+
 *
 * Les ratios respectent les keylines Material :
 *   - adaptatif full-bleed : fenêtre visible = 72/108 = 0.667 → marque à
 *     0.62 (léger retrait pour préserver l'onglet du dossier), fond plein
 *     de la couleur de la plaque (aucun contraste sur les
 *     coins rognés, quel que soit le lanceur).
 *   - SplashScreen API 31+ : la marque doit tenir dans les 2/3 intérieurs
 *     du cercle de 288dp → 0.62 (≈ 179dp sur 192dp utiles).
 *
 * Idempotent — sûr à relancer à chaque build CI. Doit tourner APRÈS
 * `npx cap add android` et AVANT `apply-android-overrides.mjs`.
 */
import { copyFile, mkdir, readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";

import { join, resolve } from "node:path";
import sharp from "sharp";

const ROOT = resolve(process.cwd());
const RESOURCES = join(ROOT, "resources");
const ANDROID = join(ROOT, "android");

/**
 * Fond de marque — identique à `values/colors.xml` (splash_background),
 * à `capacitor.config.ts` et à la variable CSS `--background` sombre.
 */
const BG = { r: 0x19, g: 0x19, b: 0x19, alpha: 1 };

/**
 * Couleur du corps de la plaque du logo, échantillonnée sur le master.
 * Utilisée comme calque de fond adaptatif ET comme fond de l'icône legacy :
 * les zones rognées par les masques constructeurs deviennent invisibles.
 */
const PLATE = { r: 0xed, g: 0xee, b: 0xf2, alpha: 1 };

/** Fond clair officiel de l'application (`--background` en thème clair). */
const PLATE_LIGHT = { r: 0xf5, g: 0xf6, b: 0xf8, alpha: 1 };

if (!existsSync(ANDROID)) {
  console.error("✗ android/ folder does not exist. Run `npx cap add android` first.");
  process.exit(1);
}

const LOGO_SRC = join(ROOT, "public", "brand", "geniusfiles-logo.png");
if (!existsSync(LOGO_SRC)) {
  console.error(`✗ Missing brand logo at ${LOGO_SRC}.`);
  process.exit(1);
}
console.log(`→ Using brand logo ${LOGO_SRC}`);

/**
 * Illustration officielle du splash (robot GeniusFiles), PNG détouré.
 * Elle n'est plus composée dans les ressources natives : le splash système
 * ne peint que le fond du thème, l'illustration unique étant rendue par
 * l'overlay web (`SplashOverlay`). On vérifie néanmoins sa présence : elle
 * doit être embarquée dans l'APK (`public/brand/`).
 */
const SPLASH_SRC = join(ROOT, "public", "brand", "geniusfiles-splash.png");
if (!existsSync(SPLASH_SRC)) {
  console.error(`✗ Missing splash artwork at ${SPLASH_SRC}.`);
  process.exit(1);
}

/**
 * Largeur d'affichage OFFICIELLE de l'illustration, en dp, identique sur
 * le splash système (toutes générations d'Android) et sur l'overlay web.
 *
 * 192dp = les 2/3 intérieurs du cercle de 288dp du SplashScreen Android
 * 12+ : c'est la plus grande largeur qui NE SOIT JAMAIS rognée par le
 * masque système. Au-delà, Android bascule sur la branche « icône avec
 * fond » (240dp puis re-masquage) : l'illustration était alors réduite
 * d'un tiers puis rééchantillonnée — d'où l'effet « petit et flou ».
 *
 * 192 × 4 = 768 px ≤ 801 px (résolution réelle du master officiel) : la
 * ressource est toujours une RÉDUCTION du master, jamais un
 * agrandissement, donc nette jusqu'à la densité xxxhdpi.
 */
const ART_WIDTH_DP = 192;

/**
 * Déclinaisons 1:1 de l'illustration pour l'overlay web (176dp × densité).
 * Elles évitent tout rééchantillonnage par la WebView : la netteté du
 * splash applicatif est alors identique à celle du splash système.
 * Elles sont versionnées dans `public/brand/` et embarquées dans l'APK.
 */
for (const scale of [1, 2, 3, 4]) {
  const variant = join(ROOT, "public", "brand", `geniusfiles-splash-${scale}x.png`);
  if (!existsSync(variant)) {
    console.error(
      `✗ Missing splash variant ${variant}. Régénérez les déclinaisons ${ART_WIDTH_DP}dp ×${scale} depuis le master.`,
    );
    process.exit(1);
  }
}

/**
 * Recadre le master sur ses pixels non transparents puis le re-centre dans
 * un carré. Filet de sécurité : si quelqu'un remplace le logo par une
 * version comportant des marges, les ratios ci-dessous restent exacts.
 */
async function squareMark(src) {
  const trimmed = await sharp(await readFile(src))
    .ensureAlpha()
    .trim({ threshold: 1 })
    .png()
    .toBuffer();
  const meta = await sharp(trimmed).metadata();
  const side = Math.max(meta.width ?? 1024, meta.height ?? 1024);
  return sharp({
    create: { width: side, height: side, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: trimmed, gravity: "centre" }])
    .png()
    .toBuffer();
}

const markBuf = await squareMark(LOGO_SRC);

await mkdir(RESOURCES, { recursive: true });

/**
 * Compose la marque, centrée, à `ratio` du canvas, sur `background`.
 *
 * QUALITÉ : la marque n'est JAMAIS agrandie au-delà de la résolution du
 * master (`lanczos3` en réduction uniquement). Un agrandissement produirait
 * une image floue / pixellisée sur le splash système — c'est exactement ce
 * que l'on interdit ici.
 */
async function compose({ size, ratio, background, output, source = markBuf }) {
  const markSize = Math.round(size * ratio);
  const srcMeta = await sharp(source).metadata();
  const srcSide = Math.max(srcMeta.width ?? 0, srcMeta.height ?? 0);
  if (srcSide && markSize > srcSide) {
    throw new Error(
      `Agrandissement interdit : marque ${markSize}px demandée pour un master ${srcSide}px (${output}).`,
    );
  }
  const mark = await sharp(source)
    .resize(markSize, markSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toBuffer();

  await sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: mark, gravity: "centre" }])
    .png({ compressionLevel: 9 })
    .toFile(output);
  console.log(`   ✓ ${output} (${size}², marque ${Math.round(ratio * 100)}%)`);
}

const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

console.log(`→ Composition des masters sous resources/`);
// Résolution réelle du master détouré : aucune ressource ne doit demander
// une marque plus grande (interdiction d'agrandissement = aucun flou).
const markMeta = await sharp(markBuf).metadata();
const MARK_SIDE = Math.max(markMeta.width ?? 1024, markMeta.height ?? 1024);
// Icône legacy (API < 26) : le lanceur masque directement cette tuile, la
// marque occupe donc le carré entier — plafonnée à la résolution du master,
// le reste étant comblé par le fond plaque (invisible : même couleur).
await compose({
  size: 1024,
  ratio: Math.min(1, MARK_SIDE / 1024),
  background: PLATE,
  output: join(RESOURCES, "icon.png"),
});
// Premier plan adaptatif : 0.667 = EXACTEMENT la fenêtre visible 72/108 →
// la marque remplit toute la zone affichée par le lanceur (taille visuelle
// comparable aux autres applications) sans jamais être rognée. Aller au-delà
// ferait couper les bords de la plaque sur les masques circulaires.
// Le master officiel est réduit, jamais agrandi : aucun flou.
await compose({
  size: 1024,
  ratio: 0.667,
  background: TRANSPARENT,
  output: join(RESOURCES, "icon-foreground.png"),
});
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: PLATE } })
  .png()
  .toFile(join(RESOURCES, "icon-background.png"));
console.log(`   ✓ resources/icon-background.png (fond adaptatif)`);

// ─────────────────────────────────────────────────────────────────────
// Splash Capacitor (API < 31).
//
// Le splash natif peint DÉSORMAIS l'illustration officielle, à la même
// échelle et à la même position que l'overlay web : la marque est donc
// visible dès la toute première frame du cold start (plus aucun écran de
// couleur « vide » pendant le démarrage de la WebView), et la passation
// vers l'overlay est strictement invisible (même image, même taille,
// même centre, même fond).
//
// Géométrie : Capacitor affiche ce carré en FIT_CENTER, donc le carré est
// mis à l'échelle de la plus petite dimension de l'écran. Le ratio
// reproduit, sur un téléphone standard (~360dp de large), la largeur
// officielle ART_WIDTH_DP — toutes les générations d'Android affichent
// ainsi la marque à la même taille perçue.
// ─────────────────────────────────────────────────────────────────────
const splashMarkBuf = await squareMark(SPLASH_SRC);
const LEGACY_SPLASH_RATIO = ART_WIDTH_DP / 360;
/**
 * Taille du canvas calée sur la résolution native du master : la marque
 * est composée à 1:1 (aucun agrandissement, donc aucun flou), puis
 * réduite par Android à la taille de l'écran (FIT_CENTER) — une réduction
 * reste toujours nette.
 */
const splashMarkMeta = await sharp(splashMarkBuf).metadata();
const SPLASH_MARK_SIDE = Math.max(splashMarkMeta.width ?? 802, splashMarkMeta.height ?? 802);
const LEGACY_SPLASH_SIZE = Math.round(SPLASH_MARK_SIDE / LEGACY_SPLASH_RATIO);
await compose({
  size: LEGACY_SPLASH_SIZE,
  ratio: LEGACY_SPLASH_RATIO,
  background: PLATE_LIGHT,
  output: join(RESOURCES, "splash.png"),
  source: splashMarkBuf,
});
await compose({
  size: LEGACY_SPLASH_SIZE,
  ratio: LEGACY_SPLASH_RATIO,
  background: BG,
  output: join(RESOURCES, "splash-dark.png"),
  source: splashMarkBuf,
});
console.log("   ✓ resources/splash.png + splash-dark.png (illustration officielle)");

// ─────────────────────────────────────────────────────────────────────
// Génération des ressources Android.
//
// CAUSE RACINE d'un échec CI : `npx capacitor-assets` embarque SA PROPRE
// copie imbriquée de `sharp` (node_modules/@capacitor/assets/node_modules),
// dont le binaire natif `sharp-linux-x64.node` n'est pas installé par bun
// (scripts d'install ignorés) → « Cannot find module
// '../build/Release/sharp-linux-x64.node' » et build Android bloqué.
//
// CORRECTIF : on n'appelle plus le binaire externe. Les mipmaps et les
// splash sont écrits ici avec le `sharp` de premier niveau (déjà utilisé
// plus haut, donc forcément fonctionnel), aux MÊMES noms et MÊMES tailles
// que ceux produits auparavant par @capacitor/assets — aucun changement de
// rendu, aucune dépendance fragile.
// ─────────────────────────────────────────────────────────────────────
const RES = join(ANDROID, "app", "src", "main", "res");

/** Densités des icônes de lanceur (px du côté, cf. keylines Material). */
const MIPMAPS = { ldpi: 36, mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };

/**
 * Splash Capacitor (API < 31) : UNE seule ressource, carrée, à la
 * résolution native du master, en `drawable/` (jour) et `drawable-night/`
 * (nuit). Capacitor l'affiche en FIT_CENTER, donc Android la réduit à la
 * taille de l'écran — une réduction reste nette quelle que soit la
 * densité.
 *
 * Les anciennes déclinaisons `drawable-{port,land}-*dpi/splash.png`
 * étaient produites en `cover` (recadrage) à des résolutions très
 * inférieures aux écrans réels (720×1280 pour un écran 1080×2400) :
 * Android les AGRANDISSAIT — c'était la source du splash flou et
 * basse qualité. Elles sont supprimées ci-dessous.
 */
const LEGACY_SPLASH_DIRS = ["drawable", "drawable-night"];

/** Dossiers de splash obsolètes, purgés à chaque exécution (idempotent). */
const STALE_SPLASH_DIRS = ["ldpi", "mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi"].flatMap((dpi) => [
  `drawable-port-${dpi}`,
  `drawable-land-${dpi}`,
  `drawable-port-night-${dpi}`,
  `drawable-land-night-${dpi}`,
]);

async function writeResized(src, dir, name, width, height) {
  await mkdir(dir, { recursive: true });
  await sharp(src)
    .resize(width, height, { fit: "cover", position: "centre", kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9 })
    .toFile(join(dir, name));
}

console.log(`→ Génération des mipmaps et splash Android (sharp local)`);
for (const [dpi, side] of Object.entries(MIPMAPS)) {
  const dir = join(RES, `mipmap-${dpi}`);
  await writeResized(join(RESOURCES, "icon.png"), dir, "ic_launcher.png", side, side);
  await writeResized(join(RESOURCES, "icon.png"), dir, "ic_launcher_round.png", side, side);
  await writeResized(
    join(RESOURCES, "icon-foreground.png"),
    dir,
    "ic_launcher_foreground.png",
    side,
    side,
  );
  await writeResized(
    join(RESOURCES, "icon-background.png"),
    dir,
    "ic_launcher_background.png",
    side,
    side,
  );
}
console.log(`   ✓ mipmap-{ldpi…xxxhdpi}/ic_launcher*(.png)`);

for (const dir of LEGACY_SPLASH_DIRS) {
  const dark = dir === "drawable-night";
  await mkdir(join(RES, dir), { recursive: true });
  await copyFile(
    join(RESOURCES, dark ? "splash-dark.png" : "splash.png"),
    join(RES, dir, "splash.png"),
  );
}
for (const dir of STALE_SPLASH_DIRS) {
  await rm(join(RES, dir), { recursive: true, force: true });
}
console.log(`   ✓ drawable{,-night}/splash.png (pleine résolution, variantes obsolètes purgées)`);

// ─────────────────────────────────────────────────────────────────────
// Icône du SplashScreen (Android 12+ ET rétro-compatibilité androidx).
//
// CAUSE RACINE DU SPLASH « PETIT ET FLOU » : `windowSplashScreenAnimatedIcon`
// recevait un drawable ADAPTATIF doté d'un calque de fond. Android bascule
// alors sur la branche « icône avec fond » : l'icône est ramenée à 240dp,
// chaque calque agrandi de 1,5× puis rogné aux 2/3 — l'illustration
// finissait peinte à ~120dp (deux fois plus petite que sur le web) après
// un double rééchantillonnage (d'où le flou).
//
// CORRECTIF : plus aucun drawable adaptatif. `splash_icon.png` est un PNG
// simple, transparent, de 288dp de côté (la fenêtre réelle du
// SplashScreen), dans lequel l'illustration occupe ART_WIDTH_DP / 288 :
// elle est donc peinte à 192dp — la même taille que l'overlay web — et
// reste intégralement à l'intérieur du masque circulaire.
//
// Le canvas est émis à 288 × 4 = 1152 px, soit la résolution physique
// maximale demandée (densité ×4) : Android ne fait plus que réduire.
// Le même fichier sert au thème de lancement API < 31 (splash_window.xml)
// et à androidx.core.splashscreen : taille perçue identique partout.
// ─────────────────────────────────────────────────────────────────────
//
// CAUSE RÉSIDUELLE DU FLOU : la ressource était unique et rangée en
// `drawable-nodpi`. Un bitmap `nodpi` est réputé « déjà à la densité de
// l'appareil » : Android ne le rééchantillonne pas proprement, il le
// contraint aux bornes 288dp avec un simple filtre bilinéaire au moment
// du rendu (et, sur les thèmes de lancement API < 31, un filtre encore
// plus rustique). D'un canvas de 1152 px vers 576 px (xhdpi), les
// contours de l'illustration devenaient mous.
//
// CORRECTIF : une ressource PAR DENSITÉ, dimensionnée exactement à
// 288dp × densité. Android choisit alors le bitmap de sa propre densité
// et le peint 1:1, sans aucun rééchantillonnage → net partout. Chaque
// variante reste une RÉDUCTION du master (768 px max ≤ 801 px).
const SPLASH_ICON_DP = 288;
const SPLASH_ICON_DENSITIES = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
for (const [dpi, scale] of Object.entries(SPLASH_ICON_DENSITIES)) {
  const dir = join(RES, `drawable-${dpi}`);
  await mkdir(dir, { recursive: true });
  await compose({
    size: Math.round(SPLASH_ICON_DP * scale),
    ratio: ART_WIDTH_DP / SPLASH_ICON_DP,
    background: TRANSPARENT,
    output: join(dir, "splash_icon.png"),
    source: splashMarkBuf,
  });
}
// Reliquats : ancienne ressource unique nodpi, calque adaptatif, XML v26.
await rm(join(RES, "drawable-nodpi", "splash_icon.png"), { force: true });
await rm(join(RES, "drawable-nodpi", "splash_icon_foreground.png"), { force: true });
await rm(join(RES, "drawable-anydpi-v26", "splash_icon.xml"), { force: true });
console.log("   ✓ drawable-{mdpi…xxxhdpi}/splash_icon.png — 288dp exacts, aucun rééchantillonnage");

console.log("✓ Icônes + splash Android générés depuis le logo GeniusFiles.");
