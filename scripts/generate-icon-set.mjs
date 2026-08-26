/**
 * Génère src/components/icons/hugeicons.tsx à partir de l'API Iconify
 * (collection « hugeicons », variante stroke arrondie).
 *
 * Un seul langage : trait 1,5 sur grille 24, terminaisons arrondies,
 * géométrie sobre et premium — la référence visuelle de GeniusFiles.
 *
 * Usage : node scripts/generate-icon-set.mjs
 */
import { writeFileSync } from "node:fs";

const OUT = "src/components/icons/hugeicons.tsx";

/** Nom métier GeniusFiles → identifiant Hugeicons. */
export const MAP = {
  AndroidLogo: "android",
  AppWindow: "computer",
  ArrowClockwise: "arrow-reload-horizontal",
  ArrowCounterClockwise: "arrow-turn-backward",
  ArrowDown: "arrow-down-01",
  ArrowLeft: "arrow-left-01",
  ArrowRight: "arrow-right-01",
  ArrowSquareOut: "link-square-01",
  ArrowUUpLeft: "arrow-turn-backward",
  ArrowUUpRight: "arrow-turn-forward",
  ArrowUp: "arrow-up-01",
  ArrowsClockwise: "arrow-reload-horizontal",
  ArrowsDownUp: "arrow-up-down",
  ArrowsInLineVertical: "arrow-shrink-02",
  ArrowsInSimple: "arrow-shrink-01",
  ArrowsLeftRight: "arrow-left-right",
  ArrowsOutSimple: "arrow-expand-01",
  Bell: "notification-01",
  BellRinging: "notification-02",
  Brain: "brain-02",
  Broom: "clean",
  CalendarCheck: "calendar-check-in-01",
  Cards: "layers-01",
  CaretDown: "arrow-down-01",
  CaretLeft: "arrow-left-01",
  CaretRight: "arrow-right-01",
  CaretUp: "arrow-up-01",
  ChatCircle: "bubble-chat",
  ChatText: "message-01",
  ChatsCircle: "bubble-chat-question",
  Check: "tick-02",
  CheckCircle: "checkmark-circle-02",
  CheckSquare: "checkmark-square-02",
  Circle: "circle",
  CircleNotch: "loading-03",
  Clipboard: "clipboard",
  Clock: "clock-01",
  ClockClockwise: "clock-05",
  ClockCounterClockwise: "clock-04",
  ClosedCaptioning: "subtitle",
  CloudArrowUp: "cloud-upload",
  Copy: "copy-01",
  CopySimple: "copy-02",
  Cpu: "cpu",
  Crop: "crop",
  Crown: "crown",
  Cube: "cube",
  DeviceMobile: "smart-phone-01",
  DeviceMobileCamera: "smart-phone-02",
  DotsSixVertical: "drag-drop-vertical",
  DotsThree: "more-horizontal",
  DotsThreeVertical: "more-vertical",
  DownloadSimple: "download-01",
  Drop: "droplet",
  Envelope: "mail-01",
  Eraser: "eraser-01",
  Export: "file-export",
  Eye: "eye",
  EyeSlash: "view-off",
  FastForward: "forward-01",
  File: "file-01",
  FileArrowUp: "file-upload",
  FileCode: "file-code",
  FileDashed: "file-empty-02",
  FileDoc: "file-02",
  FileMagnifyingGlass: "file-search",
  FilePdf: "pdf-01",
  FileText: "file-01",
  FileX: "file-remove",
  FileZip: "file-zip",
  FilesIcon: "files-01",
  FilmSlate: "film-01",
  Fingerprint: "finger-print",
  Fire: "fire",
  FloppyDisk: "floppy-disk",
  Folder: "folder-01",
  FolderDashed: "folder-off",
  FolderMinus: "folder-minus",
  FolderOpen: "folder-open",
  FolderPlus: "folder-add",
  FolderSimpleMinus: "folder-export",
  FolderSimplePlus: "folder-import",
  FolderSimpleStar: "folder-favourite",
  FunnelSimple: "filter",
  Gauge: "dashboard-speed-01",
  GearSix: "settings-01",
  GridFour: "grid",
  HardDrive: "hard-drive",
  HardDrives: "database",
  Headphones: "headphones",
  House: "home-01",
  Image: "image-01",
  ImageSquare: "image-02",
  Images: "image-03",
  Info: "information-circle",
  Key: "key-01",
  Lightning: "flash",
  List: "menu-01",
  ListChecks: "check-list",
  Lock: "lock",
  LockKey: "lock-key",
  LockKeyOpen: "square-unlock-01",
  LockOpen: "square-unlock-02",
  MagicWand: "magic-wand-01",
  MagnifyingGlass: "search-01",
  MagnifyingGlassMinus: "search-minus",
  MagnifyingGlassPlus: "search-add",
  MicrophoneSlash: "mic-off-01",
  Minus: "minus-sign",
  MinusCircle: "minus-sign-circle",
  Moon: "moon-02",
  MusicNote: "music-note-01",
  MusicNotes: "music-note-03",
  NotePencil: "note-edit",
  Package: "package",
  PackageIcon: "package-02",
  PaintBrush: "paint-brush-01",
  Palette: "paint-board",
  Pause: "pause",
  PauseCircle: "pause",
  PencilSimple: "pencil-edit-01",
  PencilSimpleLine: "edit-02",
  PictureInPicture: "picture-in-picture-on",
  Play: "play",
  PlayCircle: "play-circle",
  Playlist: "list-music",
  Plus: "plus-sign",
  PlusCircle: "plus-sign-circle",
  Power: "power-socket-01",
  Printer: "printer",
  Prohibit: "cancel-circle",
  Pulse: "pulse-01",
  PushPin: "pin",
  PushPinSlash: "pin-off",
  RadioButton: "circle",
  Repeat: "repeat",
  RepeatOnce: "repeat-one-01",
  Rewind: "backward-01",
  Rows: "list-view",
  Scan: "scan-image",
  Scissors: "scissor-01",
  SelectionAll: "checkmark-square-02",
  Shapes: "shapes",
  ShareNetwork: "share-08",
  Shield: "shield-01",
  ShieldCheck: "security-check",
  ShieldStar: "security-validation",
  ShieldWarning: "shield-energy",
  Shuffle: "shuffle",
  SidebarSimple: "sidebar-left-01",
  Signature: "signature",
  SimCard: "simcard-01",
  SkipBack: "backward-02",
  SkipForward: "forward-02",
  SlidersHorizontal: "filter-horizontal",
  SortAscending: "arrow-down-a-z",
  SortDescending: "arrow-up-z-a",
  Sparkle: "sparkles",
  SpeakerHigh: "volume-high",
  SpeakerSlash: "volume-off",
  Square: "square",
  SquareSplitHorizontal: "grid-table",
  SquaresFour: "dashboard-square-01",
  Stack: "layers-01",
  Star: "star",
  StopCircle: "stop",
  Sun: "sun-02",
  TextAa: "text-font",
  TextAlignLeft: "text-align-left",
  TextT: "text",
  Timer: "timer-01",
  Trash: "delete-02",
  TreeStructure: "hierarchy",
  TrendDown: "trade-down",
  UploadSimple: "upload-01",
  UsbIcon: "usb-connected-01",
  User: "user",
  Warning: "alert-02",
  WarningDiamond: "alert-diamond",
  WaveSine: "audio-wave-01",
  WaveformIcon: "audio-wave-02",
  WifiSlash: "wifi-disconnected-01",
  Wrench: "wrench-01",
  X: "cancel-01",
  XCircle: "cancel-circle",
};

/** Icônes disposant d'une variante pleine (états actifs uniquement). */
const FILLED = {
  Circle: "circle",
  House: "home-01",
  Sparkle: "sparkles",
  GearSix: "settings-01",
  Folder: "folder-01",
  Lightning: "flash",
  Star: "star",
  CheckCircle: "checkmark-circle-02",
};

const API = "https://api.iconify.design";

async function fetchBody(prefix, name) {
  const res = await fetch(`${API}/${prefix}.json?icons=${name}`);
  const json = await res.json();
  const entry = json.icons?.[name];
  if (!entry) return null;
  return entry.body;
}

const names = Object.keys(MAP).sort();
const missing = [];
const lines = [];

for (const name of names) {
  const body = await fetchBody("hugeicons", MAP[name]);
  if (!body) {
    missing.push(`${name} -> ${MAP[name]}`);
    continue;
  }
  let fill = null;
  if (FILLED[name]) {
    fill = await fetchBody("hugeicons-solid", FILLED[name]);
  }
  const args = fill
    ? `\n  ${JSON.stringify(body)},\n  ${JSON.stringify(fill)},\n`
    : `\n  ${JSON.stringify(body)},\n`;
  lines.push(`export const ${name} = make(${args});`);
}

if (missing.length) {
  console.error("Icônes introuvables :\n" + missing.join("\n"));
  process.exit(1);
}

const header = `/**
 * Icônes GeniusFiles — géométrie Hugeicons « stroke rounded » figée localement.
 *
 * UN SEUL langage visuel : grille 24×24, trait 1,5, terminaisons arrondies,
 * silhouettes épurées de qualité premium. La variante pleine n'existe que
 * pour les rares états actifs qui en tirent un vrai bénéfice.
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
  }: PhIconProps & { color?: string }): ReactElement => {
    const solid = weight === "fill" && Boolean(fill);
    const tint = color ?? "currentColor";
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={solid ? tint : "none"}
        stroke={solid ? "none" : tint}
        strokeWidth={solid ? undefined : 1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        {...rest}
        dangerouslySetInnerHTML={{ __html: solid && fill ? fill : regular }}
      />
    );
  };
  return Icon;
}

`;

writeFileSync(OUT, header + lines.join("\n") + "\n");
console.log(`${lines.length} icônes générées dans ${OUT}`);
