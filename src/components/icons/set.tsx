/**
 * GeniusFiles — système d'icônes unique (famille Phosphor, graisse « regular »).
 *
 * UN SEUL langage visuel pour TOUTE l'application :
 * · grille 24×24, trait constant, terminaisons et angles identiques ;
 * · style outline propre, sobre, sans détail superflu ;
 * · variante pleine réservée aux rares états actifs qui en tirent un bénéfice ;
 * · couleur héritée du contexte (`currentColor`), donc thème-compatible.
 *
 * · Les noms `Gf*` restent l'API métier de l'application.
 * · Les noms historiques (Home, Search, Trash2…) sont conservés comme alias
 *   pour que chaque écran pointe vers la même famille sans exception.
 */
import type { ComponentType, ReactElement } from "react";
import * as Ph from "./phosphor";
import type { PhIconProps } from "./phosphor";

import type { GfIconComponent, GfIconProps } from "./GfIcon";

type PhComponent = (props: PhIconProps) => ReactElement;
type PhWeight = NonNullable<PhIconProps["weight"]>;

/** Fabrique : fige la graisse et la taille par défaut du système. */
function icon(Base: PhComponent, weight: PhWeight = "regular"): GfIconComponent {
  const Wrapped = ({ size = 24, strokeWidth: _ignored, ...rest }: GfIconProps): ReactElement => {
    const Component = Base as unknown as ComponentType<Record<string, unknown>>;
    return <Component size={size} weight={weight} {...rest} />;
  };
  Wrapped.displayName = "GfIcon";
  return Wrapped;
}

/** Variante pleine : réservée aux états actifs et aux pastilles. */
function solid(Base: PhComponent): GfIconComponent {
  return icon(Base, "fill");
}


/* --------------------------------------------------------------------- */
/* Familles de fichiers et stockages                                       */
/* --------------------------------------------------------------------- */

export const GfFolder = icon(Ph.Folder);
export const GfFolderOpen = icon(Ph.FolderOpen);
export const GfFile = icon(Ph.File);
export const GfDocument = icon(Ph.FileDoc);
export const GfPdf = icon(Ph.FilePdf);
export const GfText = icon(Ph.FileText);
export const GfCode = icon(Ph.FileCode);
export const GfArchive = icon(Ph.FileZip);
export const GfFont = icon(Ph.TextAa);
export const GfImage = icon(Ph.Image);
export const GfVideo = icon(Ph.FilmSlate);
export const GfAudio = icon(Ph.MusicNotes);
export const GfApk = icon(Ph.AndroidLogo);
export const GfDownload = icon(Ph.DownloadSimple);
export const GfInternalStorage = icon(Ph.DeviceMobile);
export const GfSdCard = icon(Ph.SimCard);
export const GfUsbDrive = icon(Ph.UsbIcon);
export const GfExternalStorage = icon(Ph.HardDrives);
export const GfNetworkStorage = icon(Ph.CloudArrowUp);
export const GfStorageGauge = icon(Ph.Gauge);

/* --------------------------------------------------------------------- */
/* Navigation principale et modules                                        */
/* --------------------------------------------------------------------- */

export const GfHome = icon(Ph.House);
export const GfGeniusAi = icon(Ph.Sparkle);
export const GfAutomations = icon(Ph.Lightning);
export const GfPdfTools = icon(Ph.FilePdf);
export const GfSettings = icon(Ph.GearSix);
export const GfCleaner = icon(Ph.Broom);
export const GfVault = icon(Ph.LockKey);
export const GfVaultOpen = icon(Ph.LockKeyOpen);
export const GfTransfer = icon(Ph.ArrowsLeftRight);
export const GfTrash = icon(Ph.Trash);
export const GfApps = icon(Ph.SquaresFour);
export const GfPhotoEditor = icon(Ph.ImageSquare);
export const GfAudioEditor = icon(Ph.WaveformIcon);
export const GfSearch = icon(Ph.MagnifyingGlass);
export const GfCompress = icon(Ph.ArrowsInSimple);
export const GfExtract = icon(Ph.ArrowsOutSimple);
export const GfShare = icon(Ph.ShareNetwork);
export const GfConvert = icon(Ph.ArrowsClockwise);
export const GfOrganize = icon(Ph.Stack);

/* --------------------------------------------------------------------- */
/* Sécurité et états                                                       */
/* --------------------------------------------------------------------- */

export const GfBiometric = icon(Ph.Fingerprint);
export const GfLocked = icon(Ph.Lock);
export const GfUnlocked = icon(Ph.LockOpen);
export const GfKey = icon(Ph.Key);
export const GfShieldCheck = icon(Ph.ShieldCheck);
export const GfShieldAlert = icon(Ph.ShieldWarning);
export const GfInfo = icon(Ph.Info);
export const GfSuccess = icon(Ph.CheckCircle);
export const GfWarning = icon(Ph.Warning);
export const GfError = icon(Ph.XCircle);
export const GfPermission = icon(Ph.ShieldStar);
export const GfOffline = icon(Ph.WifiSlash);
export const GfNoResults = icon(Ph.MagnifyingGlassMinus);
export const GfNotFound = icon(Ph.FileDashed);
export const GfOpenFailed = icon(Ph.FileX);
export const GfLowSpace = icon(Ph.WarningDiamond);
export const GfFavorite = icon(Ph.Star);
export const GfRecent = icon(Ph.ClockCounterClockwise);
export const GfEmptyFiles = icon(Ph.FolderDashed);

/* --------------------------------------------------------------------- */
/* Gestes et actions sur les fichiers                                      */
/* --------------------------------------------------------------------- */

export const GfShareNodes = icon(Ph.ShareNetwork);
export const GfRename = icon(Ph.PencilSimpleLine);
export const GfCopyFiles = icon(Ph.Copy);
export const GfMoveTo = icon(Ph.FolderSimplePlus);
export const GfCut = icon(Ph.Scissors);
export const GfPinned = icon(Ph.PushPin);
export const GfUnpinned = icon(Ph.PushPinSlash);
export const GfHidden = icon(Ph.EyeSlash);
export const GfSelectAll = icon(Ph.SelectionAll);
export const GfUploadTo = icon(Ph.UploadSimple);
export const GfPlus = icon(Ph.PlusCircle);
export const GfRestore = icon(Ph.ArrowCounterClockwise);
export const GfRefreshCycle = icon(Ph.ArrowsClockwise);
export const GfPlay = icon(Ph.PlayCircle);
export const GfPause = icon(Ph.PauseCircle);
export const GfStop = icon(Ph.StopCircle);
export const GfHistory = icon(Ph.ClockCounterClockwise);
export const GfSort = icon(Ph.SortAscending);
export const GfFilter = icon(Ph.FunnelSimple);
export const GfEyeOpen = icon(Ph.Eye);
export const GfExternalApp = icon(Ph.ArrowSquareOut);

/* --------------------------------------------------------------------- */
/* Outils PDF                                                              */
/* --------------------------------------------------------------------- */

export const GfPdfMerge = icon(Ph.FilesIcon);
export const GfPdfSplit = icon(Ph.Scissors);
export const GfPdfCompress = icon(Ph.ArrowsInLineVertical);
export const GfPdfConvert = icon(Ph.FileArrowUp);
export const GfPdfExtract = icon(Ph.Export);
export const GfPdfRotate = icon(Ph.ArrowClockwise);
export const GfPdfProtect = icon(Ph.ShieldCheck);
export const GfPdfUnlock = icon(Ph.LockKeyOpen);
export const GfPdfSign = icon(Ph.Signature);
export const GfPdfAnnotate = icon(Ph.PencilSimple);
export const GfPdfScan = icon(Ph.Scan);
export const GfPdfWatermark = icon(Ph.Drop);
export const GfPdfPages = icon(Ph.Cards);
export const GfPdfImages = icon(Ph.Images);
export const GfPdfText = icon(Ph.TextT);
export const GfPdfSearch = icon(Ph.FileMagnifyingGlass);
export const GfPdfForm = icon(Ph.ListChecks);

/* --------------------------------------------------------------------- */
/* Nettoyeur                                                               */
/* --------------------------------------------------------------------- */

export const GfDuplicates = icon(Ph.CopySimple);
export const GfJunkFile = icon(Ph.FileX);
export const GfBigFile = icon(Ph.FileArrowUp);
export const GfStaleFile = icon(Ph.ClockClockwise);
export const GfEmptyFolderClean = icon(Ph.FolderMinus);
export const GfCacheSweep = icon(Ph.Broom);

/* --------------------------------------------------------------------- */
/* Alias historiques — même famille, aucun héritage visuel                 */
/* --------------------------------------------------------------------- */

export const Activity = icon(Ph.Pulse);
export const AlertTriangle = icon(Ph.Warning);
export const AppWindow = icon(Ph.AppWindow);
export const ArrowDown = icon(Ph.ArrowDown);
export const ArrowDownAZ = icon(Ph.SortAscending);
export const ArrowLeft = icon(Ph.ArrowLeft);
export const ArrowLeftRight = icon(Ph.ArrowsLeftRight);
export const ArrowRight = icon(Ph.ArrowRight);
export const ArrowUp = icon(Ph.ArrowUp);
export const ArrowUpAZ = icon(Ph.SortDescending);
export const ArrowUpDown = icon(Ph.ArrowsDownUp);
export const AudioWaveform = icon(Ph.WaveformIcon);
export const Ban = icon(Ph.Prohibit);
export const Bell = icon(Ph.Bell);
export const BellRing = icon(Ph.BellRinging);
export const Boxes = icon(Ph.Cube);
export const BrainCircuit = icon(Ph.Brain);
export const Brush = icon(Ph.PaintBrush);
export const CalendarClock = icon(Ph.CalendarCheck);
export const Check = icon(Ph.Check);
export const CheckCircle2 = icon(Ph.CheckCircle);
export const CheckSquare = icon(Ph.CheckSquare);
export const ChevronDown = icon(Ph.CaretDown);
export const ChevronDownIcon = ChevronDown;
export const ChevronLeft = icon(Ph.CaretLeft);
export const ChevronLeftIcon = ChevronLeft;
export const ChevronRight = icon(Ph.CaretRight);
export const ChevronRightIcon = ChevronRight;
export const ChevronUp = icon(Ph.CaretUp);
export const Circle = solid(Ph.Circle);
export const Clipboard = icon(Ph.Clipboard);
export const Clock = icon(Ph.Clock);
export const Clock3 = icon(Ph.Clock);
export const Copy = icon(Ph.Copy);
export const Cpu = icon(Ph.Cpu);
export const Crop = icon(Ph.Crop);
export const Crown = icon(Ph.Crown);
export const Download = icon(Ph.DownloadSimple);
export const Droplets = icon(Ph.Drop);
export const Eraser = icon(Ph.Eraser);
export const ExternalLink = icon(Ph.ArrowSquareOut);
export const Eye = icon(Ph.Eye);
export const FastForward = icon(Ph.FastForward);
export const FileArchive = icon(Ph.FileZip);
export const FileText = icon(Ph.FileText);
export const FileWarning = icon(Ph.FileX);
export const Filter = icon(Ph.FunnelSimple);
export const Flame = icon(Ph.Fire);
export const Folder = icon(Ph.Folder);
export const FolderInput = icon(Ph.FolderSimplePlus);
export const FolderOpen = icon(Ph.FolderOpen);
export const FolderOutput = icon(Ph.FolderSimpleMinus);
export const FolderPlus = icon(Ph.FolderPlus);
export const FolderSearch = icon(Ph.FolderSimpleStar);
export const Gauge = icon(Ph.Gauge);
export const Grid3X3 = icon(Ph.GridFour);
export const Grid3x3 = Grid3X3;
export const GripVertical = icon(Ph.DotsSixVertical);
export const HardDrive = icon(Ph.HardDrive);
export const Headphones = icon(Ph.Headphones);
export const History = icon(Ph.ClockCounterClockwise);
export const Home = icon(Ph.House);
export const Image = icon(Ph.Image);
export const Info = icon(Ph.Info);
export const KeyRound = icon(Ph.Key);
export const Layers = icon(Ph.Stack);
export const LayoutGrid = icon(Ph.SquaresFour);
export const LayoutList = icon(Ph.Rows);
export const List = icon(Ph.List);
export const ListMusic = icon(Ph.Playlist);
export const ListTree = icon(Ph.TreeStructure);
export const ListVideo = icon(Ph.Playlist);
export const Loader2 = icon(Ph.CircleNotch);
export const Lock = icon(Ph.Lock);
export const Mail = icon(Ph.Envelope);
export const Maximize2 = icon(Ph.ArrowsOutSimple);
export const Menu = icon(Ph.List);
export const MessageCircle = icon(Ph.ChatCircle);
export const MessageSquare = icon(Ph.ChatText);
export const MessagesSquare = icon(Ph.ChatsCircle);
export const MicOff = icon(Ph.MicrophoneSlash);
export const Minus = icon(Ph.Minus);
export const MinusCircle = icon(Ph.MinusCircle);
export const MonitorSmartphone = icon(Ph.DeviceMobileCamera);
export const Moon = icon(Ph.Moon);
export const MoreHorizontal = icon(Ph.DotsThree);
export const MoreVertical = icon(Ph.DotsThreeVertical);
export const Music2 = icon(Ph.MusicNote);
export const Music4 = icon(Ph.MusicNotes);
export const Package = icon(Ph.Package);
export const PackageCheck = icon(Ph.PackageIcon);
export const PackageOpen = icon(Ph.Package);
export const Palette = icon(Ph.Palette);
export const PanelLeft = icon(Ph.SidebarSimple);
export const Pause = icon(Ph.Pause);
export const PenSquare = icon(Ph.PencilSimpleLine);
export const Pencil = icon(Ph.PencilSimple);
export const PencilLine = icon(Ph.PencilSimpleLine);
export const PictureInPicture2 = icon(Ph.PictureInPicture);
export const Play = icon(Ph.Play);
export const PlayCircle = icon(Ph.PlayCircle);
export const Plus = icon(Ph.Plus);
export const PlusCircle = icon(Ph.PlusCircle);
export const Power = icon(Ph.Power);
export const Printer = icon(Ph.Printer);
export const Radio = icon(Ph.RadioButton);
export const Redo2 = icon(Ph.ArrowUUpRight);
export const RefreshCw = icon(Ph.ArrowsClockwise);
export const Repeat = icon(Ph.Repeat);
export const Repeat1 = icon(Ph.RepeatOnce);
export const Repeat2 = icon(Ph.Repeat);
export const Rewind = icon(Ph.Rewind);
export const RotateCcw = icon(Ph.ArrowCounterClockwise);
export const RotateCw = icon(Ph.ArrowClockwise);
export const Save = icon(Ph.FloppyDisk);
export const Scissors = icon(Ph.Scissors);
export const Search = icon(Ph.MagnifyingGlass);
export const SearchX = icon(Ph.MagnifyingGlassMinus);
export const Shapes = icon(Ph.Shapes);
export const Share2 = icon(Ph.ShareNetwork);
export const Shield = icon(Ph.Shield);
export const ShieldAlert = icon(Ph.ShieldWarning);
export const ShieldCheck = icon(Ph.ShieldCheck);
export const Shuffle = icon(Ph.Shuffle);
export const SkipBack = icon(Ph.SkipBack);
export const SkipForward = icon(Ph.SkipForward);
export const SlidersHorizontal = icon(Ph.SlidersHorizontal);
export const Sparkles = icon(Ph.Sparkle);
export const Square = icon(Ph.Square);
export const SquarePen = icon(Ph.NotePencil);
export const SquareSplitHorizontal = icon(Ph.SquareSplitHorizontal);
export const Subtitles = icon(Ph.ClosedCaptioning);
export const Sun = icon(Ph.Sun);
export const TextSelect = icon(Ph.TextAlignLeft);
export const Timer = icon(Ph.Timer);
export const Trash2 = icon(Ph.Trash);
export const TrendingDown = icon(Ph.TrendDown);
export const Type = icon(Ph.TextT);
export const Undo2 = icon(Ph.ArrowUUpLeft);
export const Unlock = icon(Ph.LockOpen);
export const User = icon(Ph.User);
export const Volume2 = icon(Ph.SpeakerHigh);
export const VolumeX = icon(Ph.SpeakerSlash);
export const Wand2 = icon(Ph.MagicWand);
export const Waves = icon(Ph.WaveSine);
export const WifiOff = icon(Ph.WifiSlash);
export const Wrench = icon(Ph.Wrench);
export const X = icon(Ph.X);
export const XCircle = icon(Ph.XCircle);
export const Zap = icon(Ph.Lightning);
export const ZoomIn = icon(Ph.MagnifyingGlassPlus);
export const ZoomOut = icon(Ph.MagnifyingGlassMinus);

/** Compatibilité de typage avec l'ancien alias de bibliothèque. */
export type LucideIcon = GfIconComponent;
