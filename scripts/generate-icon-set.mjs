/**
 * Génère src/components/icons/phosphor.tsx à partir de @phosphor-icons/core.
 *
 * Un seul langage : graisse « regular » (trait 1,5 sur grille 24), terminaisons
 * et angles identiques pour toutes les icônes. Une variante « fill » n'est
 * embarquée que pour les rares états actifs qui en tirent un vrai bénéfice.
 *
 * Usage : node scripts/generate-icon-set.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

const OUT = "src/components/icons/phosphor.tsx";
const ASSETS = "node_modules/@phosphor-icons/core/assets";

/** Icônes disposant d'une variante pleine (états actifs uniquement). */
const FILLED = new Set([
  "Circle",
  "House",
  "Sparkle",
  "GearSix",
  "Folder",
  "Lightning",
  "Star",
  "CheckCircle",
]);

const names = [
  ...new Set(
    [...readFileSync(OUT, "utf8").matchAll(/export const (\w+) = make/g)].map((m) => m[1]),
  ),
].sort();

/** PascalCase → kebab-case, en retirant le suffixe technique « Icon ». */
function slug(name) {
  return name
    .replace(/Icon$/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function body(file) {
  const svg = readFileSync(`${ASSETS}/${file}`, "utf8");
  const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>[\s\S]*$/, "");
  return inner.replace(/\s*fill="none"/g, "").trim();
}

const lines = [];
const missing = [];
for (const name of names) {
  const s = slug(name);
  let regular;
  try {
    regular = body(`regular/${s}.svg`);
  } catch {
    missing.push(name);
    continue;
  }
  let fill = null;
  if (FILLED.has(name)) {
    try {
      fill = body(`fill/${s}-fill.svg`);
    } catch {
      fill = null;
    }
  }
  const args = fill
    ? `\n  ${JSON.stringify(regular)},\n  ${JSON.stringify(fill)},\n`
    : `\n  ${JSON.stringify(regular)},\n`;
  lines.push(`export const ${name} = make(${args});`);
}

if (missing.length) {
  console.error("Icônes introuvables :", missing.join(", "));
  process.exit(1);
}

const header = `/**
 * Icônes GeniusFiles — géométrie Phosphor « regular » figée localement.
 *
 * UN SEUL langage visuel : même grille 24×24 (viewBox 256), même graisse de
 * trait, mêmes terminaisons arrondies, même niveau de détail. La variante
 * pleine n'existe que pour les états actifs qui en ont réellement besoin.
 *
 * Fichier généré par scripts/generate-icon-set.mjs — ne pas modifier à la main.
 */
import type { ReactElement, SVGProps } from "react";

export type PhIconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  size?: number | string;
  weight?: "regular" | "fill";
};

function make(regular: string, fill?: string) {
  const Icon = ({
    size = 24,
    weight = "regular",
    color,
    ...rest
  }: PhIconProps & { color?: string }): ReactElement => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill={color ?? "currentColor"}
      aria-hidden="true"
      focusable="false"
      {...rest}
      dangerouslySetInnerHTML={{ __html: weight === "fill" && fill ? fill : regular }}
    />
  );
  return Icon;
}

`;

writeFileSync(OUT, header + lines.join("\n") + "\n");
console.log(`${lines.length} icônes générées dans ${OUT}`);
