/**
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
  }: PhIconProps & { color?: string }): ReactElement => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color ?? "currentColor"}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
      dangerouslySetInnerHTML={{ __html: weight === "fill" && fill ? fill : regular }}
    />
  );
  return Icon;
}

export const AndroidLogo = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path d=\"M6.5 9.5a5.5 5.5 0 1 1 11 0V16c0 1.414 0 2.121-.44 2.56c-.439.44-1.146.44-2.56.44h-5c-1.414 0-2.121 0-2.56-.44c-.44-.439-.44-1.146-.44-2.56z\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M20 11v6m-5 2v3m-6-3v3M4 11v6m6-13L8.5 2M14 4l1.5-2m-9 8h11\"/></g>",
);
export const AppWindow = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M14 21h2m-2 0a1.5 1.5 0 0 1-1.5-1.5V17H12m2 4h-4m0 0H8m2 0a1.5 1.5 0 0 0 1.5-1.5V17h.5m0 0v4m4-18H8c-2.828 0-4.243 0-5.121.879C2 4.757 2 6.172 2 9v2c0 2.828 0 4.243.879 5.121C3.757 17 5.172 17 8 17h8c2.828 0 4.243 0 5.121-.879C22 15.243 22 13.828 22 11V9c0-2.828 0-4.243-.879-5.121C20.243 3 18.828 3 16 3\"/>",
);
export const ArrowClockwise = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M20.5 5.5h-11C5.787 5.5 3 8.185 3 12m.5 6.5h11c3.713 0 6.5-2.685 6.5-6.5\"/><path d=\"M18.5 3S21 4.841 21 5.5S18.5 8 18.5 8m-13 8S3 17.841 3 18.5S5.5 21 5.5 21\"/></g>",
);
export const ArrowCounterClockwise = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M11 6h4.5a4.5 4.5 0 1 1 0 9H4\"/><path d=\"M7 12s-3 2.21-3 3s3 3 3 3\"/></g>",
);
export const ArrowDown = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M18 9s-4.419 6-6 6s-6-6-6-6\"/>",
);
export const ArrowLeft = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M15 6s-6 4.419-6 6s6 6 6 6\"/>",
);
export const ArrowRight = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M9 6s6 4.419 6 6s-6 6-6 6\"/>",
);
export const ArrowSquareOut = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M11.1 3.002c-3.648.007-5.56.096-6.78 1.317C3.002 5.637 3.002 7.758 3.002 12s0 6.363 1.318 7.681c1.317 1.318 3.438 1.318 7.68 1.318s6.363 0 7.68-1.318c1.222-1.22 1.312-3.132 1.318-6.78m-.518-9.383l-5.549 5.534m5.55-5.534c-.495-.495-3.822-.449-4.526-.439m4.525.439c.494.494.448 3.825.438 4.53\"/>",
);
export const ArrowUUpLeft = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M11 6h4.5a4.5 4.5 0 1 1 0 9H4\"/><path d=\"M7 12s-3 2.21-3 3s3 3 3 3\"/></g>",
);
export const ArrowUUpRight = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M13 6H8.5a4.5 4.5 0 0 0 0 9H20\"/><path d=\"M17 12s3 2.21 3 3s-3 3-3 3\"/></g>",
);
export const ArrowUp = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M18 15s-4.42-6-6-6s-6 6-6 6\"/>",
);
export const ArrowsClockwise = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M20.5 5.5h-11C5.787 5.5 3 8.185 3 12m.5 6.5h11c3.713 0 6.5-2.685 6.5-6.5\"/><path d=\"M18.5 3S21 4.841 21 5.5S18.5 8 18.5 8m-13 8S3 17.841 3 18.5S5.5 21 5.5 21\"/></g>",
);
export const ArrowsDownUp = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M7 4v16m10-1V4m-7 3S7.79 4 7 4S4 7 4 7m16 10s-2.21 3-3 3s-3-3-3-3\"/>",
);
export const ArrowsInLineVertical = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M6.502 13.264c.845-.012 3.641-.593 4.234 0c.593.592.012 3.389 0 4.233m2.532-11c-.011.845-.592 3.641 0 4.234c.593.593 3.39.012 4.234 0M21 3l-7.389 7.382m-3.24 3.243L3 21\"/>",
);
export const ArrowsInSimple = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M6.502 10.737c.845.011 3.641.592 4.234 0c.593-.593.012-3.39 0-4.234m2.532 11c-.011-.845-.592-3.641 0-4.234c.593-.593 3.39-.012 4.234 0M21 21l-7.389-7.382m-3.24-3.243L3 3\"/>",
);
export const ArrowsLeftRight = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M20 17H4m13-3s3 2.21 3 3s-3 3-3 3M5 7h15M7 4S4 6.21 4 7s3 3 3 3\"/>",
);
export const ArrowsOutSimple = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M16.5 3.266c.844-.012 3.64-.593 4.234 0s.012 3.39 0 4.234m-.228-4.009l-7.004 7.005M3.266 16.5c-.012.845-.593 3.641 0 4.234s3.39.012 4.234 0m3.002-7.236l-7.004 7.005\"/>",
);
export const Bell = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M15.5 18a3.5 3.5 0 1 1-7 0m10.731 0H4.77a1.769 1.769 0 0 1-1.25-3.02l.602-.603A3 3 0 0 0 5 12.256V9.5a7 7 0 0 1 14 0v2.756a3 3 0 0 0 .879 2.121l.603.603a1.77 1.77 0 0 1-1.25 3.02\"/>",
);
export const BellRinging = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path stroke-linecap=\"round\" d=\"M19 18V9.5a7 7 0 1 0-14 0V18m15.5 0h-17\"/><path d=\"M13.5 20a1.5 1.5 0 0 1-1.5 1.5M10.5 20a1.5 1.5 0 0 0 1.5 1.5m0 0V20\"/></g>",
);
export const Brain = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M4.222 21.995v-3.55c0-1.271-.333-1.932-.987-3.037A8.888 8.888 0 0 1 10.889 2a8.89 8.89 0 0 1 8.889 8.887c0 .58 0 .87.024 1.032c.058.388.24.722.417 1.068L22 16.441l-1.4.7c-.405.202-.608.303-.749.49s-.181.399-.26.82l-.008.042c-.183.968-.384 2.036-.95 2.71c-.2.237-.448.43-.727.567c-.461.225-1.028.225-2.162.225c-.525 0-1.051.012-1.576 0c-1.243-.031-2.168-1.077-2.168-2.29\"/><path d=\"M14.388 10.532c-.426 0-.815-.162-1.11-.427m1.11.426c0 1.146-.664 2.235-1.942 2.235S10.504 13.854 10.504 15m3.884-4.469c2.15 0 2.15-3.35 0-3.35q-.294.001-.557.095c.105-2.498-3.496-3.176-4.312-.836m.985 1.857c0-.774-.39-1.456-.985-1.857m0 0c-1.852-1.25-4.32.993-3.146 2.993c-1.97.295-1.76 3.333.247 3.333a1.66 1.66 0 0 0 1.362-.712\"/></g>",
);
export const Broom = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"m21 3l-8 8.5m-3.554-.415c-2.48.952-4.463.789-6.446.003c.5 6.443 3.504 8.92 7.509 9.912c0 0 3.017-2.134 3.452-7.193c.047-.548.07-.821-.043-1.13c-.114-.309-.338-.53-.785-.973c-.736-.728-1.103-1.092-1.54-1.184c-.437-.09-1.007.128-2.147.565\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M4.5 16.446S7 16.93 9.5 15\"/><path d=\"M8.5 7.25a1.25 1.25 0 1 1-2.5 0a1.25 1.25 0 0 1 2.5 0Z\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M11.125 4H11m.25 0a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0\"/></g>",
);
export const CalendarCheck = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M16 2v4M8 2v4m13 10v-4c0-3.771 0-5.657-1.172-6.828S16.771 4 13 4h-2C7.229 4 5.343 4 4.172 5.172S3 8.229 3 12v2c0 3.771 0 5.657 1.172 6.828S7.229 22 11 22h1M3 10h18\"/><path d=\"M21 19.5h-6.5m2 2.5c-.506-.491-2.5-1.8-2.5-2.5s1.994-2.009 2.5-2.5\"/></g>",
);
export const Cards = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"m8.643 3.146l-1.705.788C4.313 5.147 3 5.754 3 6.75s1.313 1.603 3.938 2.816l1.705.788c1.652.764 2.478 1.146 3.357 1.146s1.705-.382 3.357-1.146l1.705-.788C19.687 8.353 21 7.746 21 6.75s-1.313-1.603-3.938-2.816l-1.705-.788C13.705 2.382 12.879 2 12 2s-1.705.382-3.357 1.146\"/><path d=\"M20.788 11.097c.141.199.212.406.212.634c0 .982-1.313 1.58-3.938 2.776l-1.705.777c-1.652.753-2.478 1.13-3.357 1.13s-1.705-.377-3.357-1.13l-1.705-.777C4.313 13.311 3 12.713 3 11.731c0-.228.07-.435.212-.634\"/><path d=\"M20.377 16.266c.415.331.623.661.623 1.052c0 .981-1.313 1.58-3.938 2.776l-1.705.777C13.705 21.624 12.879 22 12 22s-1.705-.376-3.357-1.13l-1.705-.776C4.313 18.898 3 18.299 3 17.318c0-.391.208-.72.623-1.052\"/></g>",
);
export const CaretDown = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M18 9s-4.419 6-6 6s-6-6-6-6\"/>",
);
export const CaretLeft = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M15 6s-6 4.419-6 6s6 6 6 6\"/>",
);
export const CaretRight = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M9 6s6 4.419 6 6s-6 6-6 6\"/>",
);
export const CaretUp = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M18 15s-4.42-6-6-6s-6 6-6 6\"/>",
);
export const ChatCircle = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M21.5 12a9.5 9.5 0 0 1-9.5 9.5c-1.628 0-3.16-.41-4.5-1.131c-1.868-1.007-3.125-.071-4.234.097a.53.53 0 0 1-.456-.156a.64.64 0 0 1-.117-.703c.436-1.025.835-2.969.29-4.607a9.5 9.5 0 0 1-.483-3a9.5 9.5 0 1 1 19 0\"/><path d=\"M12.126 12H12m-3.876 0H8m8.125 0H16m-3.75 0a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0m-4 0a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0m8 0a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0\"/></g>",
);
export const ChatText = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path stroke-linecap=\"round\" d=\"M8.5 14.5h7m-7-5H12\"/><path d=\"M14.17 20.89c4.184-.277 7.516-3.657 7.79-7.9c.053-.83.053-1.69 0-2.52c-.274-4.242-3.606-7.62-7.79-7.899a33 33 0 0 0-4.34 0c-4.184.278-7.516 3.657-7.79 7.9a20 20 0 0 0 0 2.52c.1 1.545.783 2.976 1.588 4.184c.467.845.159 1.9-.328 2.823c-.35.665-.526.997-.385 1.237c.14.24.455.248 1.084.263c1.245.03 2.084-.322 2.75-.813c.377-.279.566-.418.696-.434s.387.09.899.3c.46.19.995.307 1.485.34c1.425.094 2.914.094 4.342 0Z\"/></g>",
);
export const ChatsCircle = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M21.5 12a9.5 9.5 0 0 1-9.5 9.5c-1.628 0-3.16-.41-4.5-1.131c-1.868-1.007-3.125-.071-4.234.097a.53.53 0 0 1-.456-.156a.64.64 0 0 1-.117-.703c.436-1.025.835-2.969.29-4.607a9.5 9.5 0 0 1-.483-3a9.5 9.5 0 1 1 19 0\"/><path d=\"M9.5 9.5a2.5 2.5 0 1 1 3.912 2.064C12.728 12.032 12 12.672 12 13.5m.125 3.25H12m.25 0a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0\"/></g>",
);
export const Check = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"m5 14l3.5 3.5L19 6.5\"/>",
);
export const CheckCircle = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path d=\"M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12s4.477 10 10 10s10-4.477 10-10Z\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"m8 12.5l2.5 2.5L16 9\"/></g>",
);
export const CheckSquare = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path d=\"M2.5 12c0-4.478 0-6.718 1.391-8.109S7.521 2.5 12 2.5c4.478 0 6.718 0 8.109 1.391S21.5 7.521 21.5 12c0 4.478 0 6.718-1.391 8.109S16.479 21.5 12 21.5c-4.478 0-6.718 0-8.109-1.391S2.5 16.479 2.5 12Z\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"m8 12.5l2.5 2.5L16 9\"/></g>",
);
export const Circle = make(
  "<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"none\" stroke=\"currentColor\" stroke-linejoin=\"round\" stroke-width=\"1.5\"/>",
);
export const CircleNotch = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\" d=\"M12 3v3m0 12v3m9-9h-3M6 12H3m15.364-6.363l-2.122 2.121m-8.484 8.484l-2.121 2.121m12.727.001l-2.122-2.122M7.758 7.758L5.637 5.637\"/>",
);
export const Clipboard = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path d=\"m17.024 3.034l-.955-.255c-2.7-.72-4.05-1.079-5.113-.468c-1.064.61-1.426 1.953-2.15 4.637l-1.022 3.797c-.724 2.685-1.086 4.027-.471 5.085c.614 1.057 1.964 1.417 4.664 2.136l.954.255c2.7.72 4.05 1.079 5.114.468c1.063-.61 1.425-1.953 2.148-4.637l1.023-3.797c.724-2.685 1.085-4.027.471-5.085s-1.963-1.417-4.664-2.136Z\"/><path d=\"M16.854 7.433c0 .814-.664 1.474-1.483 1.474c-.818 0-1.482-.66-1.482-1.474s.664-1.474 1.482-1.474c.82 0 1.483.66 1.483 1.474Z\"/><path stroke-linecap=\"round\" d=\"m12 20.946l-.952.26c-2.694.733-4.04 1.1-5.102.477c-1.06-.622-1.422-1.99-2.143-4.728l-1.021-3.872c-.722-2.737-1.083-4.106-.47-5.184C2.842 6.966 4 7 5.5 7\"/></g>",
);
export const Clock = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M12 8v4l2 2\"/></g>",
);
export const ClockClockwise = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2c4.478 0 8.226 2.943 9.5 7H19\"/><path d=\"M12 8v4l2 2m7.955-1q.045-.495.045-1m-7 10a10 10 0 0 0 1-.392M20.79 17q.291-.558.515-1.154m-3.113 4.383q.518-.428.977-.922\"/></g>",
);
export const ClockCounterClockwise = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2C7.522 2 3.774 4.943 2.5 9H5\"/><path d=\"M12 8v4l2 2M2 12q0 .505.045 1M9 22a10 10 0 0 1-1-.392M3.21 17a11 11 0 0 1-.515-1.154m2.136 3.46q.46.495.977.923\"/></g>",
);
export const ClosedCaptioning = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path d=\"M2.5 12c0-4.478 0-6.718 1.391-8.109S7.521 2.5 12 2.5c4.478 0 6.718 0 8.109 1.391S21.5 7.521 21.5 12c0 4.478 0 6.718-1.391 8.109S16.479 21.5 12 21.5c-4.478 0-6.718 0-8.109-1.391S2.5 16.479 2.5 12Z\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M18 18h-8m8-4h-3m-3 0h-2\"/></g>",
);
export const CloudArrowUp = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M17.478 9.011h.022c2.485 0 4.5 2.018 4.5 4.508c0 2.32-1.75 4.232-4 4.481m-.522-8.989q.021-.248.022-.5A5.505 5.505 0 0 0 12 3a5.505 5.505 0 0 0-5.48 5.032m10.958.98a5.5 5.5 0 0 1-1.235 3.005M6.52 8.032A5.006 5.006 0 0 0 2 13.018a5.01 5.01 0 0 0 4 4.91m.52-9.896q.237-.023.48-.023c1.126 0 2.165.373 3 1.002M12 13v8m0-8c-.7 0-2.008 1.994-2.5 2.5M12 13c.7 0 2.008 1.994 2.5 2.5\"/>",
);
export const Copy = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M7.5 14.5c0-3.3 0-4.95 1.025-5.975S11.2 7.5 14.5 7.5s4.95 0 5.975 1.025S21.5 11.2 21.5 14.5s0 4.95-1.025 5.975S17.8 21.5 14.5 21.5s-4.95 0-5.975-1.025S7.5 17.8 7.5 14.5\"/><path d=\"M7.5 16.5c-1.396 0-2.095 0-2.656-.196a3.5 3.5 0 0 1-2.148-2.148C2.5 13.595 2.5 12.896 2.5 11.5v-2c0-3.3 0-4.95 1.025-5.975S6.2 2.5 9.5 2.5h2c1.396 0 2.095 0 2.656.196a3.5 3.5 0 0 1 2.148 2.148c.196.561.196 1.26.196 2.656\"/></g>",
);
export const CopySimple = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M16.964 8.982c-.003-2.95-.047-4.478-.906-5.524a4 4 0 0 0-.553-.554C14.4 2 12.76 2 9.48 2s-4.92 0-6.024.905a4 4 0 0 0-.553.554C1.998 4.56 1.998 6.2 1.998 9.48s0 4.92.906 6.023q.25.304.553.553c1.046.86 2.575.904 5.525.906\"/><path d=\"m14.028 9.025l2.966-.043m-2.98 13.02l2.966-.043m4.992-7.937l-.028 2.96M9.01 14.036l-.028 2.96m2.505-7.971c-.832.149-2.17.302-2.477 2.024m10.485 10.91c.835-.137 2.174-.27 2.508-1.986M19.495 9.025c.832.149 2.17.302 2.477 2.024M11.5 21.957c-.833-.148-2.17-.301-2.478-2.023\"/></g>",
);
export const Cpu = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M4 12c0-3.771 0-5.657 1.172-6.828S8.229 4 12 4s5.657 0 6.828 1.172S20 8.229 20 12s0 5.657-1.172 6.828S15.771 20 12 20s-5.657 0-6.828-1.172S4 15.771 4 12Z\"/><path stroke-linecap=\"round\" d=\"M9.5 2v2m5-2v2m-5 16v2m5-2v2M13 9l-4 4m6 0l-2 2m9-.5h-2m-16-5H2m2 5H2m20-5h-2\"/></g>",
);
export const Crop = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M4 2v2m18 16h-2m-3.5 0H10c-2.828 0-4.243 0-5.121-.879C4 18.243 4 16.828 4 14V7.5M20 22V12c0-3.771 0-5.657-1.172-6.828S15.771 4 12 4H2\"/>",
);
export const Crown = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M5 21h14m-6.875-8.25H12m.25 0a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0\"/><path d=\"m14.915 7.61l-1.107-2.228C13.019 3.794 12.625 3 12 3s-1.019.794-1.808 2.382L9.085 7.61C8.58 8.625 8.329 9.132 7.88 9.246a1 1 0 0 1-.095.02c-.458.07-.886-.3-1.741-1.037C4.012 6.476 2.997 5.6 2.38 5.949a1 1 0 0 0-.114.076c-.564.43-.17 1.716.616 4.29l1.166 3.813c.423 1.384.635 2.076 1.17 2.474S6.473 17 7.91 17h8.178c1.438 0 2.158 0 2.693-.398s.747-1.09 1.17-2.474l1.166-3.813c.787-2.574 1.18-3.86.616-4.29a1 1 0 0 0-.114-.076c-.617-.349-1.632.527-3.664 2.28c-.855.738-1.283 1.107-1.741 1.036a1 1 0 0 1-.095-.019c-.45-.114-.701-.621-1.205-1.635\"/></g>",
);
export const Cube = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M2.793 21.207c.293.293.764.293 1.707.293h10c.943 0 1.414 0 1.707-.293m-13.414 0C2.5 20.914 2.5 20.443 2.5 19.5v-10c0-.943 0-1.414.293-1.707m0 13.414l6-6m7.414 6c.293-.293.293-.764.293-1.707v-10c0-.943 0-1.414-.293-1.707m0 13.414l5-5c.293-.293.293-.764.293-1.707v-10c0-.943 0-1.414-.293-1.707m-5 5C15.914 7.5 15.443 7.5 14.5 7.5h-10c-.943 0-1.414 0-1.707.293m13.414 0l5-5m-18.414 5l5-5C8.086 2.5 8.557 2.5 9.5 2.5h10c.943 0 1.414 0 1.707.293M8.793 15.207c.293.293.764.293 1.707.293H14m-5.207-.293C8.5 14.914 8.5 14.443 8.5 13.5v-3\"/>",
);
export const DeviceMobile = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M13.5 2h-3c-2.357 0-3.536 0-4.268.732S5.5 4.643 5.5 7v10c0 2.357 0 3.535.732 4.268S8.143 22 10.5 22h3c2.357 0 3.535 0 4.268-.732c.732-.733.732-1.911.732-4.268V7c0-2.357 0-3.536-.732-4.268C17.035 2 15.857 2 13.5 2\"/><path d=\"M12.125 19H12m.25 0a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0\"/></g>",
);
export const DeviceMobileCamera = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M13.5 2h-3c-2.357 0-3.536 0-4.268.732S5.5 4.643 5.5 7v10c0 2.357 0 3.535.732 4.268S8.143 22 10.5 22h3c2.357 0 3.535 0 4.268-.732c.732-.733.732-1.911.732-4.268V7c0-2.357 0-3.536-.732-4.268C17.035 2 15.857 2 13.5 2\"/><path d=\"M14 2h-4l.5 1h3z\"/></g>",
);
export const DotsSixVertical = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M16 6a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-6 0a1 1 0 1 1-2 0a1 1 0 0 1 2 0m6 12a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0-6a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-6 6a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0-6a1 1 0 1 1-2 0a1 1 0 0 1 2 0\"/>",
);
export const DotsThree = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M6.004 12.5V12m12 .5V12m-6 .5V12m-5 .5a1 1 0 1 0-2 0a1 1 0 0 0 2 0m12 0a1 1 0 1 0-2 0a1 1 0 0 0 2 0m-6 0a1 1 0 1 0-2 0a1 1 0 0 0 2 0\"/>",
);
export const DotsThreeVertical = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M11.997 12.5V12m0-5.5V6m0 12.5V18m1-5.5a1 1 0 1 0-2 0a1 1 0 0 0 2 0m0-6a1 1 0 1 0-2 0a1 1 0 0 0 2 0m0 12a1 1 0 1 0-2 0a1 1 0 0 0 2 0\"/>",
);
export const DownloadSimple = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M3 17c0 .93 0 1.395.102 1.777a3 3 0 0 0 2.121 2.121C5.605 21 6.07 21 7 21h10c.93 0 1.395 0 1.776-.102a3 3 0 0 0 2.122-2.121C21 18.395 21 17.93 21 17m-4.5-5.5S13.186 16 12 16s-4.5-4.5-4.5-4.5M12 15V3\"/>",
);
export const Drop = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path d=\"M3.5 13.678c0-4.184 3.58-8.319 6.094-10.706a3.463 3.463 0 0 1 4.812 0C16.919 5.36 20.5 9.494 20.5 13.678C20.5 17.78 17.281 22 12 22s-8.5-4.22-8.5-8.322Z\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M16 14a4 4 0 0 1-4 4\"/></g>",
);
export const Envelope = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"m2 6l6.913 3.917c2.549 1.444 3.625 1.444 6.174 0L22 6\"/><path d=\"M2.016 13.476c.065 3.065.098 4.598 1.229 5.733c1.131 1.136 2.705 1.175 5.854 1.254c1.94.05 3.862.05 5.802 0c3.149-.079 4.723-.118 5.854-1.254c1.131-1.135 1.164-2.668 1.23-5.733c.02-.986.02-1.966 0-2.952c-.066-3.065-.099-4.598-1.23-5.733c-1.131-1.136-2.705-1.175-5.854-1.254a115 115 0 0 0-5.802 0c-3.149.079-4.723.118-5.854 1.254c-1.131 1.135-1.164 2.668-1.23 5.733a69 69 0 0 0 0 2.952Z\"/></g>",
);
export const Eraser = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path d=\"M2 12c0-3.771 0-5.657 1.172-6.828S6.229 4 10 4h3c1.963 0 2.944 0 3.789.422c.844.423 1.433 1.208 2.611 2.778C21.133 9.511 22 10.667 22 12s-.867 2.489-2.6 4.8c-1.178 1.57-1.767 2.355-2.611 2.778C15.944 20 14.963 20 13 20h-3c-3.771 0-5.657 0-6.828-1.172S2 15.771 2 12Z\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"m14 9l-6 6m6 0L8 9\"/></g>",
);
export const Export = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M20 14v-3.343c0-.818 0-1.226-.152-1.594c-.152-.367-.441-.657-1.02-1.235l-4.736-4.736c-.499-.499-.748-.748-1.058-.896a2 2 0 0 0-.197-.082C12.514 2 12.161 2 11.456 2c-3.245 0-4.868 0-5.967.886a4 4 0 0 0-.603.603C4 4.59 4 6.211 4 9.456V14c0 3.771 0 5.657 1.172 6.828S8.229 22 12 22m1-19.5V3c0 2.828 0 4.243.879 5.121C14.757 9 16.172 9 19 9h.5\"/><path d=\"M17 22c.607-.59 3-2.16 3-3s-2.393-2.41-3-3m2 3h-7\"/></g>",
);
export const Eye = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path stroke-linecap=\"round\" d=\"M2 8s4.477-5 10-5s10 5 10 5\"/><path d=\"M21.544 13.045c.304.426.456.64.456.955c0 .316-.152.529-.456.955C20.178 16.871 16.689 21 12 21c-4.69 0-8.178-4.13-9.544-6.045C2.152 14.529 2 14.315 2 14c0-.316.152-.529.456-.955C3.822 11.129 7.311 7 12 7c4.69 0 8.178 4.13 9.544 6.045Z\"/><path d=\"M15 14a3 3 0 1 0-6 0a3 3 0 0 0 6 0Z\"/></g>",
);
export const EyeSlash = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M22 8s-4 6-10 6S2 8 2 8\"/><path stroke-linejoin=\"round\" d=\"m15 13.5l1.5 2.5m3.5-5l2 2M2 13l2-2m5 2.5L7.5 16\"/></g>",
);
export const FastForward = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path stroke-linejoin=\"round\" d=\"M19.935 12.626c-.254 1.211-1.608 2.082-4.315 3.822c-2.945 1.893-4.417 2.84-5.61 2.475a2.8 2.8 0 0 1-1.088-.635C8 17.418 8 15.612 8 12s0-5.418.922-6.288a2.8 2.8 0 0 1 1.088-.635c1.193-.365 2.665.582 5.61 2.475c2.707 1.74 4.06 2.61 4.315 3.822c.087.412.087.84 0 1.252Z\"/><path stroke-linecap=\"round\" d=\"M4 5v14\"/></g>",
);
export const File = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M8 7h8m-8 4h4m1 10.5V21c0-2.828 0-4.243.879-5.121C14.757 15 16.172 15 19 15h.5m.5-1.657V10c0-3.771 0-5.657-1.172-6.828S15.771 2 12 2S6.343 2 5.172 3.172S4 6.229 4 10v4.544c0 3.245 0 4.868.886 5.967a4 4 0 0 0 .603.603C6.59 22 8.211 22 11.456 22c.705 0 1.058 0 1.381-.114q.1-.036.197-.082c.31-.148.559-.397 1.058-.896l4.736-4.736c.579-.578.867-.867 1.02-1.235c.152-.368.152-.776.152-1.594\"/>",
);
export const FileArrowUp = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M4 12v2.544c0 3.245 0 4.868.886 5.967a4 4 0 0 0 .603.603C6.59 22 8.211 22 11.456 22c.705 0 1.058 0 1.381-.114q.1-.036.197-.082c.31-.148.559-.397 1.058-.896l4.736-4.736c.579-.578.867-.867 1.02-1.235c.152-.368.152-.776.152-1.594V10c0-3.771 0-5.657-1.172-6.828S15.771 2 12 2m1 19.5V21c0-2.828 0-4.243.879-5.121C14.757 15 16.172 15 19 15h.5\"/><path d=\"M10 5c-.59-.607-2.16-3-3-3S4.59 4.393 4 5m3-2v7\"/></g>",
);
export const FileCode = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M10 18s-2.5-1.841-2.5-2.5S10 13 10 13m4 5s2.5-1.841 2.5-2.5S14 13 14 13\"/><path d=\"M13 2.5V3c0 2.828 0 4.243.879 5.121C14.757 9 16.172 9 19 9h.5m.5 1.657V14c0 3.771 0 5.657-1.172 6.828S15.771 22 12 22s-5.657 0-6.828-1.172S4 17.771 4 14V9.456c0-3.245 0-4.868.886-5.967a4 4 0 0 1 .603-.603C6.59 2 8.211 2 11.456 2c.705 0 1.058 0 1.381.114q.1.036.197.082c.31.148.559.397 1.058.896l4.736 4.736c.579.578.867.868 1.02 1.235c.152.368.152.776.152 1.594\"/></g>",
);
export const FileDashed = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M13 2.5V3c0 2.828 0 4.243.879 5.121C14.757 9 16.172 9 19 9h.5m.5 1.657V14c0 3.771 0 5.657-1.172 6.828S15.771 22 12 22s-5.657 0-6.828-1.172S4 17.771 4 14V9.456c0-3.245 0-4.868.886-5.967a4 4 0 0 1 .603-.603C6.59 2 8.211 2 11.456 2c.705 0 1.058 0 1.381.114q.1.036.197.082c.31.148.559.397 1.058.896l4.736 4.736c.579.578.867.868 1.02 1.235c.152.368.152.776.152 1.594\"/>",
);
export const FileDoc = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M8 17h8m-8-4h4m1-10.5V3c0 2.828 0 4.243.879 5.121C14.757 9 16.172 9 19 9h.5m.5 1.657V14c0 3.771 0 5.657-1.172 6.828S15.771 22 12 22s-5.657 0-6.828-1.172S4 17.771 4 14V9.456c0-3.245 0-4.868.886-5.967a4 4 0 0 1 .603-.603C6.59 2 8.211 2 11.456 2c.705 0 1.058 0 1.381.114q.1.036.197.082c.31.148.559.397 1.058.896l4.736 4.736c.579.578.867.868 1.02 1.235c.152.368.152.776.152 1.594\"/>",
);
export const FileMagnifyingGlass = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M13.5 16.5L15 18m-1-3.5a2.5 2.5 0 1 1-5 0a2.5 2.5 0 0 1 5 0\"/><path d=\"M13 2.5V3c0 2.828 0 4.243.879 5.121C14.757 9 16.172 9 19 9h.5m.5 1.657V14c0 3.771 0 5.657-1.172 6.828S15.771 22 12 22s-5.657 0-6.828-1.172S4 17.771 4 14V9.456c0-3.245 0-4.868.886-5.967a4 4 0 0 1 .603-.603C6.59 2 8.211 2 11.456 2c.705 0 1.058 0 1.381.114q.1.036.197.082c.31.148.559.397 1.058.896l4.736 4.736c.579.578.867.868 1.02 1.235c.152.368.152.776.152 1.594\"/></g>",
);
export const FilePdf = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M20 13v-2.343c0-.818 0-1.226-.152-1.594c-.152-.367-.441-.657-1.02-1.235l-4.736-4.736c-.499-.499-.748-.748-1.058-.896a2 2 0 0 0-.197-.082C12.514 2 12.161 2 11.456 2c-3.245 0-4.868 0-5.967.886a4 4 0 0 0-.603.603C4 4.59 4 6.211 4 9.456V13m9-10.5V3c0 2.828 0 4.243.879 5.121C14.757 9 16.172 9 19 9h.5m.25 7h-2.5a1 1 0 0 0-1 1v2m0 0v3m0-3h3m-15 3v-2.5m0 0V16H6a1.75 1.75 0 1 1 0 3.5zm6-3.5h1.5a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1.5z\"/>",
);
export const FileText = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M8 7h8m-8 4h4m1 10.5V21c0-2.828 0-4.243.879-5.121C14.757 15 16.172 15 19 15h.5m.5-1.657V10c0-3.771 0-5.657-1.172-6.828S15.771 2 12 2S6.343 2 5.172 3.172S4 6.229 4 10v4.544c0 3.245 0 4.868.886 5.967a4 4 0 0 0 .603.603C6.59 22 8.211 22 11.456 22c.705 0 1.058 0 1.381-.114q.1-.036.197-.082c.31-.148.559-.397 1.058-.896l4.736-4.736c.579-.578.867-.867 1.02-1.235c.152-.368.152-.776.152-1.594\"/>",
);
export const FileX = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M4 11.995v2.545c0 3.247 0 4.87.886 5.97q.27.334.603.603C6.59 22 8.211 22 11.456 22c.705 0 1.058 0 1.381-.114q.1-.036.197-.082c.31-.148.559-.397 1.058-.896l4.736-4.74c.579-.578.867-.867 1.02-1.235c.152-.367.152-.776.152-1.594V9.994c0-3.773 0-5.66-1.172-6.832c-.93-.932-2.314-1.123-4.736-1.162M13 21.5V21c0-2.83 0-4.245.879-5.124c.878-.88 2.293-.88 5.121-.88h.5M11 9L4 2m7 0L4 9\"/>",
);
export const FileZip = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M4 22V9.456c0-3.245 0-4.868.886-5.967a4 4 0 0 1 .603-.603C6.59 2 8.211 2 11.456 2c.705 0 1.058 0 1.381.114q.1.036.197.082c.31.148.559.397 1.058.896l4.736 4.736c.579.578.867.868 1.02 1.235c.152.368.152.776.152 1.594V14c0 3.771 0 5.657-1.172 6.828c-.93.932-2.314 1.123-4.736 1.162M13 2.5V3c0 2.828 0 4.243.879 5.121C14.757 9 16.172 9 19 9h.5m-12-3.5H7m3 2h-.5m-2 2H7m3 2.023h-.5m-2 1.977H7\"/><path d=\"M11 22v-3a2 2 0 1 0-4 0v3z\"/></g>",
);
export const FilesIcon = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M14.5 19h-2c-2.829 0-4.243 0-5.121-.879c-.88-.878-.88-2.293-.88-5.121V8c0-2.828 0-4.243.88-5.121C8.256 2 9.67 2 12.499 2h1.344c.818 0 1.226 0 1.594.152c.367.152.656.442 1.234 1.02l2.657 2.656c.578.578.867.868 1.02 1.235c.152.368.152.776.152 1.594V13c0 2.828 0 4.243-.879 5.121C18.743 19 17.328 19 14.5 19\"/><path d=\"M15 2.5v1c0 1.886 0 2.828.586 3.414c.585.586 1.528.586 3.414.586h1M6.5 5a3 3 0 0 0-3 3v8c0 2.828 0 4.243.878 5.121C5.257 22 6.671 22 9.5 22h5a3 3 0 0 0 3-3M10 11h4m-4 4h7\"/></g>",
);
export const FilmSlate = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path d=\"M2.5 12c0-4.478 0-6.718 1.391-8.109S7.521 2.5 12 2.5c4.478 0 6.718 0 8.109 1.391S21.5 7.521 21.5 12c0 4.478 0 6.718-1.391 8.109S16.479 21.5 12 21.5c-4.478 0-6.718 0-8.109-1.391S2.5 16.479 2.5 12Z\"/><path stroke-linejoin=\"round\" d=\"M2.5 7h19m-19 10h19\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M12 17V7M8 7V3m8 4V3M8 21v-4m8 4v-4\"/></g>",
);
export const Fingerprint = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M7.429 3.362c3.97-2.698 9.707-1.238 11.801 3.056m-8.373 15.506C15.584 22.582 20 18.895 20 14.21v-3.877M7.429 20.606C5.356 19.198 4 16.858 4 14.21V9.758c0-1.185.271-2.308.757-3.314\"/><path d=\"M16 13.8c0 2.32-1.79 4.2-4 4.2s-4-1.88-4-4.2v-3.6c0-.644.138-1.254.385-1.8M12 6c2.21 0 4 1.88 4 4.2m-4 .3v3\"/></g>",
);
export const Fire = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M13.856 22c12.222-3 5.378-15-2.933-20c-.978 3.5-2.445 4.5-5.378 8c-3.884 4.634-1.955 10 3.422 12c-.815-1-2.917-3.1-1.467-6c.5-1 1.5-2 1-4c.978.5 3 1 3.5 3.5c.815-1 1.66-3.1.878-5.5c6.122 4.5 3.622 9 .978 12\"/>",
);
export const FloppyDisk = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path stroke-linejoin=\"round\" d=\"M8 22v-3c0-1.886 0-2.828.586-3.414S10.114 15 12 15s2.828 0 3.414.586S16 17.114 16 19v3\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M10 7h4\"/><path d=\"M3 11.858c0-4.576 0-6.864 1.387-8.314a5 5 0 0 1 .157-.157C5.994 2 8.282 2 12.858 2c1.085 0 1.608.004 2.105.19c.479.178.88.512 1.682 1.181l2.196 1.83c1.062.885 1.592 1.327 1.876 1.932C21 7.737 21 8.428 21 9.81V13c0 3.75 0 5.625-.955 6.939a5 5 0 0 1-1.106 1.106C17.625 22 15.749 22 12 22s-5.625 0-6.939-.955a5 5 0 0 1-1.106-1.106C3 18.625 3 16.749 3 13z\"/></g>",
);
export const Folder = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\" d=\"M8 7h8.75c2.107 0 3.16 0 3.917.506a3 3 0 0 1 .827.827C22 9.09 22 10.143 22 12.25c0 3.511 0 5.267-.843 6.528a5 5 0 0 1-1.38 1.38C18.518 21 16.762 21 13.25 21H12c-4.714 0-7.071 0-8.536-1.465C2 18.072 2 15.715 2 11V7.944c0-1.816 0-2.724.38-3.406A3 3 0 0 1 3.538 3.38C4.22 3 5.128 3 6.944 3C8.108 3 8.69 3 9.2 3.191c1.163.436 1.643 1.493 2.168 2.542L12 7\"/>",
);
export const FolderDashed = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\" d=\"M20 20a5 5 0 0 1-.222.157C18.517 21 16.76 21 13.25 21H12c-4.714 0-7.071 0-8.536-1.464C2 18.07 2 15.714 2 11V7.944c0-1.816 0-2.724.38-3.406A3 3 0 0 1 3.342 3.5M11 6.999h5.75c2.107 0 3.16 0 3.917.506a3 3 0 0 1 .827.827C22 9.09 22 10.142 22 12.25c0 2.14 0 3.629-.19 4.75M12 7l-.633-1.267c-.525-1.05-1.005-2.106-2.168-2.542c-.42-.158-.891-.185-1.699-.19H7M2 2l20 20\"/>",
);
export const FolderMinus = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\" d=\"M13 21h-1c-4.714 0-7.071 0-8.536-1.465C2 18.072 2 15.715 2 11V7.944c0-1.816 0-2.724.38-3.406A3 3 0 0 1 3.538 3.38C4.22 3 5.128 3 6.944 3C8.108 3 8.69 3 9.2 3.191c1.163.436 1.643 1.493 2.168 2.542L12 7M8 7h8.75c2.107 0 3.16 0 3.917.506a3 3 0 0 1 .827.827C21.98 9.06 22 10.06 22 12v1m0 4h-8\"/>",
);
export const FolderOpen = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M2.5 20V8.877c0-1.288 0-1.931.285-2.407a2 2 0 0 1 .685-.685C3.946 5.5 4.594 5.5 5.892 5.5c.631 0 .947 0 1.234.088a2 2 0 0 1 .539.26c.248.168.444.413.835.902s.587.734.835.903a2 2 0 0 0 .539.259C10.16 8 10.474 8 11.1 8H15c1.404 0 2.107 0 2.611.337a2 2 0 0 1 .552.552c.337.504.337 1.207.337 2.611\"/><path d=\"m4.42 14.014l-.786 2c-.978 2.486-1.467 3.729-.882 4.607s1.901.879 4.533.879h7.905c1.235 0 1.852 0 2.34-.32c.487-.321.74-.893 1.247-2.038l.885-2c1.125-2.543 1.687-3.814 1.106-4.728s-1.952-.914-4.693-.914H8.072c-1.29 0-1.934 0-2.434.344s-.739.953-1.218 2.17Z\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M11.5 4.515c.915-1.23 2.166-1.96 4.012-2.013a4.1 4.1 0 0 1 1.756.353c1.307.571 2.15 1.301 2.732 2.645L21.5 3\"/></g>",
);
export const FolderPlus = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M13 21h-1c-4.714 0-7.071 0-8.536-1.465C2 18.072 2 15.715 2 11V7.944c0-1.816 0-2.724.38-3.406A3 3 0 0 1 3.538 3.38C4.22 3 5.128 3 6.944 3C8.108 3 8.69 3 9.2 3.191c1.163.436 1.643 1.493 2.168 2.542L12 7M8 7h8.75c2.107 0 3.16 0 3.917.506a3 3 0 0 1 .827.827C21.98 9.06 22 10.06 22 12\"/><path stroke-linejoin=\"round\" d=\"M18 13v8m4-4h-8\"/></g>",
);
export const FolderSimpleMinus = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path stroke-linejoin=\"round\" d=\"M19 21c.607-.59 3-2.16 3-3s-2.393-2.41-3-3m2 3h-7\"/><path d=\"M12 21c-4.714 0-7.071 0-8.536-1.465C2 18.072 2 15.715 2 11V7.944c0-1.816 0-2.724.38-3.406A3 3 0 0 1 3.538 3.38C4.22 3 5.128 3 6.944 3C8.108 3 8.69 3 9.2 3.191c1.163.436 1.643 1.493 2.168 2.542L12 7M8 7h8.75c2.107 0 3.16 0 3.917.506a3 3 0 0 1 .827.827C21.98 9.06 22 10.06 22 12v1\"/></g>",
);
export const FolderSimplePlus = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path stroke-linejoin=\"round\" d=\"M17 21c-.607-.59-3-2.16-3-3s2.393-2.41 3-3m-2 3h7\"/><path d=\"M12 21c-4.714 0-7.071 0-8.536-1.465C2 18.072 2 15.715 2 11V7.944c0-1.816 0-2.724.38-3.406A3 3 0 0 1 3.538 3.38C4.22 3 5.128 3 6.944 3C8.108 3 8.69 3 9.2 3.191c1.163.436 1.643 1.493 2.168 2.542L12 7M8 7h8.75c2.107 0 3.16 0 3.917.506a3 3 0 0 1 .827.827C21.98 9.06 22 10.06 22 12v2\"/></g>",
);
export const FolderSimpleStar = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M12.003 21c-4.716 0-7.073 0-8.538-1.465C2 18.072 2 15.715 2 11V7.944c0-1.816 0-2.724.38-3.406A3 3 0 0 1 3.538 3.38C4.22 3 5.128 3 6.946 3C8.11 3 8.692 3 9.2 3.191c1.163.436 1.643 1.493 2.168 2.542L12.003 7M8.002 7h8.752c2.107 0 3.16 0 3.918.506a3 3 0 0 1 .828.827c.394.59.48 1.36.5 2.667\"/><path stroke-linejoin=\"round\" d=\"M20.586 13.331c-1.796-.951-3.086.451-3.086.451s-1.29-1.402-3.086-.451C12.238 14.483 12.082 18.996 17.5 21c5.418-2.004 5.262-6.517 3.086-7.669\"/></g>",
);
export const FunnelSimple = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M8.857 12.506C6.37 10.646 4.596 8.6 3.627 7.45c-.3-.356-.398-.617-.457-1.076c-.202-1.572-.303-2.358.158-2.866S4.604 3 6.234 3h11.532c1.63 0 2.445 0 2.906.507c.461.508.36 1.294.158 2.866c-.06.459-.158.72-.457 1.076c-.97 1.152-2.747 3.202-5.24 5.065a1.05 1.05 0 0 0-.402.747c-.247 2.731-.475 4.227-.617 4.983c-.229 1.222-1.96 1.957-2.888 2.612c-.552.39-1.222-.074-1.293-.678a196 196 0 0 1-.674-6.917a1.05 1.05 0 0 0-.402-.755\"/>",
);
export const Gauge = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path stroke-linecap=\"round\" d=\"M13.5 13L17 9m-3 6a2 2 0 1 1-4 0a2 2 0 0 1 4 0Zm-8-3a6 6 0 0 1 9-5.197\"/><path d=\"M2.5 12c0-4.478 0-6.717 1.391-8.109c1.392-1.39 3.63-1.39 8.11-1.39c4.477 0 6.717 0 8.108 1.39c1.391 1.392 1.391 3.63 1.391 8.11c0 4.477 0 6.717-1.391 8.108S16.479 21.5 12 21.5c-4.478 0-6.717 0-8.109-1.391c-1.39-1.391-1.39-3.63-1.39-8.109Z\"/></g>",
);
export const GearSix = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path stroke-linecap=\"round\" d=\"m21.318 7.141l-.494-.856c-.373-.648-.56-.972-.878-1.101c-.317-.13-.676-.027-1.395.176l-1.22.344c-.459.106-.94.046-1.358-.17l-.337-.194a2 2 0 0 1-.788-.967l-.334-.998c-.22-.66-.33-.99-.591-1.178c-.261-.19-.609-.19-1.303-.19h-1.115c-.694 0-1.041 0-1.303.19c-.261.188-.37.518-.59 1.178l-.334.998a2 2 0 0 1-.789.967l-.337.195c-.418.215-.9.275-1.358.17l-1.22-.345c-.719-.203-1.078-.305-1.395-.176c-.318.129-.505.453-.878 1.1l-.493.857c-.35.608-.525.911-.491 1.234c.034.324.268.584.736 1.105l1.031 1.153c.252.319.431.875.431 1.375s-.179 1.056-.43 1.375l-1.032 1.152c-.468.521-.702.782-.736 1.105s.14.627.49 1.234l.494.857c.373.647.56.971.878 1.1s.676.028 1.395-.176l1.22-.344a2 2 0 0 1 1.359.17l.336.194c.36.23.636.57.788.968l.334.997c.22.66.33.99.591 1.18c.262.188.609.188 1.303.188h1.115c.694 0 1.042 0 1.303-.189s.371-.519.59-1.179l.335-.997c.152-.399.428-.738.788-.968l.336-.194c.42-.215.9-.276 1.36-.17l1.22.344c.718.204 1.077.306 1.394.177c.318-.13.505-.454.878-1.101l.493-.857c.35-.607.525-.91.491-1.234s-.268-.584-.736-1.105l-1.031-1.152c-.252-.32-.431-.875-.431-1.375s.179-1.056.43-1.375l1.032-1.153c.468-.52.702-.781.736-1.105s-.14-.626-.49-1.234Z\"/><path d=\"M15.52 12a3.5 3.5 0 1 1-7 0a3.5 3.5 0 0 1 7 0Z\"/></g>",
);
export const GridFour = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M7 3v18M17 3v18m4-14H3m18 10H3\"/>",
);
export const HardDrive = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"m20.71 8.701l1.209 4.028c.039.13.058.195.069.262l.003.02c.009.068.009.136.009.272c0 3.497 0 5.245-1.019 6.384q-.149.165-.314.314C19.528 21 17.78 21 14.283 21H9.717c-3.497 0-5.245 0-6.384-1.019a4 4 0 0 1-.314-.314C2 18.528 2 16.78 2 13.283c0-.136 0-.204.01-.271l.002-.02c.01-.068.03-.133.07-.263L3.29 8.7c.824-2.746 1.236-4.12 2.298-4.91S8.085 3 10.952 3h2.096c2.867 0 4.3 0 5.364.79c1.063.792 1.475 2.165 2.298 4.911M2 13h20\"/><path d=\"M18.125 17H18m-3.875 0H14m4.25 0a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0m-4 0a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0\"/></g>",
);
export const HardDrives = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><ellipse cx=\"12\" cy=\"5\" rx=\"8\" ry=\"3\"/><path stroke-linecap=\"round\" d=\"M7 10.842c.602.18 1.274.33 2 .44\"/><path d=\"M20 12c0 1.657-3.582 3-8 3s-8-1.343-8-3\"/><path stroke-linecap=\"round\" d=\"M7 17.842c.602.18 1.274.33 2 .44\"/><path d=\"M20 5v14c0 1.657-3.582 3-8 3s-8-1.343-8-3V5\"/></g>",
);
export const Headphones = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M20.085 17c.5-1.5.915-3.563.915-5a9 9 0 1 0-18 0c0 1.437.415 3.5.915 5\"/><path d=\"m8.977 19.604l-1.738-4.991c-.186-.466-.777-.7-1.264-.583a2.9 2.9 0 0 0-1.828 3.66l.438 1.326a2.88 2.88 0 0 0 3.643 1.836c.461-.196.876-.762.749-1.248m6.047 0l1.737-4.991c.186-.466.777-.7 1.264-.583a2.9 2.9 0 0 1 1.828 3.66l-.438 1.326a2.88 2.88 0 0 1-3.643 1.836c-.461-.196-.876-.762-.748-1.248\"/></g>",
);
export const House = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M3 11.99v2.51c0 3.3 0 4.95 1.025 5.975S6.7 21.5 10 21.5h4c3.3 0 4.95 0 5.975-1.025S21 17.8 21 14.5v-2.51c0-1.682 0-2.522-.356-3.25s-1.02-1.244-2.346-2.276l-2-1.555C14.233 3.303 13.2 2.5 12 2.5s-2.233.803-4.298 2.409l-2 1.555C4.375 7.496 3.712 8.012 3.356 8.74S3 10.308 3 11.99\"/>",
);
export const Image = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><circle cx=\"7.5\" cy=\"7.5\" r=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M2.5 12c0-4.478 0-6.718 1.391-8.109S7.521 2.5 12 2.5c4.478 0 6.718 0 8.109 1.391S21.5 7.521 21.5 12c0 4.478 0 6.718-1.391 8.109S16.479 21.5 12 21.5c-4.478 0-6.718 0-8.109-1.391S2.5 16.479 2.5 12Z\"/><path d=\"M5 21c4.372-5.225 9.274-12.116 16.498-7.458\"/></g>",
);
export const ImageSquare = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"m3 16l4.47-4.47a1.81 1.81 0 0 1 2.56 0L14 15.5m1.5 1.5L14 15.5m7 .5l-2.47-2.47a1.81 1.81 0 0 0-2.56 0L14 15.5M15.5 8a.5.5 0 0 0 0-1m0 1a.5.5 0 0 1 0-1m0 1V7\"/><path d=\"M3.698 19.747C2.5 18.345 2.5 16.23 2.5 12s0-6.345 1.198-7.747q.256-.3.555-.555C5.655 2.5 7.77 2.5 12 2.5s6.345 0 7.747 1.198q.3.256.555.555C21.5 5.655 21.5 7.77 21.5 12s0 6.345-1.198 7.747q-.256.3-.555.555C18.345 21.5 16.23 21.5 12 21.5s-6.345 0-7.747-1.198q-.3-.256-.555-.555\"/></g>",
);
export const Images = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M14 3h-4C6.229 3 4.343 3 3.172 4.172S2 7.229 2 11v2c0 3.771 0 5.657 1.172 6.828S6.229 21 10 21h4c3.771 0 5.657 0 6.828-1.172S22 16.771 22 13v-2c0-3.771 0-5.657-1.172-6.828S17.771 3 14 3\"/><circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/><path d=\"m21.5 17l-5.152-5.62a1.17 1.17 0 0 0-1.69-.037L10 16l-2.16-2.16a1.16 1.16 0 0 0-1.686.049L2.5 18\"/></g>",
);
export const Info = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 16v-4m.125-3.75H12m.25 0a.25.25 0 1 0-.5 0a.25.25 0 0 0 .5 0\"/></g>",
);
export const Key = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M15.5 14.5a6 6 0 1 0-5.47-3.53L2.5 18.5v3h3v-2h2v-2h2l3.53-3.53c.754.34 1.59.53 2.47.53m2-8l-1 1\"/>",
);
export const Lightning = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"m5.226 11.33l6.998-8.983c.547-.703 1.573-.266 1.573.67V9.97c0 .56.402 1.015.899 1.015H18.1c.773 0 1.185 1.03.674 1.686l-6.998 8.983c-.547.702-1.573.265-1.573-.671V14.03c0-.56-.403-1.015-.899-1.015H5.9c-.773 0-1.185-1.03-.674-1.686\"/>",
);
export const List = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M4 5h16M4 12h16M4 19h16\"/>",
);
export const ListChecks = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M11 6h10m-10 6h10m-10 6h10\"/><path stroke-linejoin=\"round\" d=\"M3 7.393S4 8.045 4.5 9C4.5 9 6 5.25 8 4M3 18.393S4 19.045 4.5 20c0 0 1.5-3.75 3.5-5\"/></g>",
);
export const Lock = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path d=\"M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2s10 4.477 10 10Z\"/><path stroke-linecap=\"round\" d=\"M12 13a2 2 0 1 0 0-4a2 2 0 0 0 0 4Zm0 0v3\"/></g>",
);
export const LockKey = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path stroke-linecap=\"round\" d=\"M18 10.997c-.392-.8-1.452-1.975-3.63-1.925c0 0-1.727-.075-3.68-.075c-1.952 0-2.866.045-4.43.075c-1.001-.025-2.904.2-3.78 2.275c-.576 1.75-.6 5.427-.25 7.277c.075.95.576 2.276 2.128 2.976c.95.5 2.478.3 3.63.4M5.984 8.196c-.05-2.375-.15-4.25 2.603-5.801c.926-.375 2.303-.7 4.005.1c1.777 1.075 1.999 2.213 2.153 2.5c.425 1.126.2 2.726.25 3.376\"/><path d=\"M15.5 19.735a2.23 2.23 0 0 1-2.245 2.23c-1.236 0-2.255-.986-2.255-2.23a2.25 2.25 0 0 1 2.255-2.244c1.236 0 2.245 1 2.245 2.244Z\"/><path stroke-linecap=\"round\" d=\"m22 15.848l-1.627-1.54c-.773-.739-1.423-.093-1.747.183l-1.41 1.357l-1.991 1.943m1.99-1.943l1.61 1.546\"/></g>",
);
export const LockKeyOpen = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path d=\"M4.268 18.845c.225 1.67 1.608 2.979 3.292 3.056c1.416.065 2.855.099 4.44.099s3.024-.034 4.44-.1c1.684-.076 3.067-1.385 3.292-3.055c.147-1.09.268-2.207.268-3.345s-.121-2.255-.268-3.345c-.225-1.67-1.608-2.979-3.292-3.056A95 95 0 0 0 12 9c-1.585 0-3.024.034-4.44.1c-1.684.076-3.067 1.385-3.292 3.055C4.12 13.245 4 14.362 4 15.5s.121 2.255.268 3.345Z\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M7.5 9V6.5A4.5 4.5 0 0 1 12 2c1.96 0 3.5 1.5 4 3\"/><path stroke-linecap=\"round\" d=\"M12.125 15.5H12m.25 0a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0Z\"/></g>",
);
export const LockOpen = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path stroke-linecap=\"round\" d=\"M12 16.5v-2\"/><path d=\"M4.268 18.845c.225 1.67 1.608 2.979 3.292 3.056c1.416.065 2.855.099 4.44.099s3.024-.034 4.44-.1c1.684-.076 3.067-1.385 3.292-3.055c.147-1.09.268-2.207.268-3.345s-.121-2.255-.268-3.345c-.225-1.67-1.608-2.979-3.292-3.056A95 95 0 0 0 12 9c-1.585 0-3.024.034-4.44.1c-1.684.076-3.067 1.385-3.292 3.055C4.12 13.245 4 14.362 4 15.5s.121 2.255.268 3.345Z\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M7.5 9V6.5A4.5 4.5 0 0 1 12 2c1.96 0 3.5 1.5 4 3\"/></g>",
);
export const MagicWand = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path stroke-linecap=\"round\" d=\"m13.926 12.778l-2.149-2.149c-.292-.293-.439-.439-.597-.517a1.07 1.07 0 0 0-.954 0c-.158.078-.304.224-.597.517s-.439.44-.517.597c-.15.301-.15.654 0 .954c.078.158.224.305.517.598l2.149 2.148m2.148-2.149l6.445 6.446c.293.292.439.439.517.597c.15.3.15.653 0 .954c-.078.157-.224.304-.517.597s-.44.439-.597.517c-.301.15-.654.15-.954 0c-.158-.078-.305-.224-.598-.517l-6.445-6.445m2.149-2.149l-2.149 2.149\"/><path d=\"m17 2l.295.797c.386 1.044.58 1.566.96 1.947c.382.381.904.575 1.948.961L21 6l-.797.295c-1.044.386-1.566.58-1.947.96c-.381.382-.575.904-.961 1.948L17 10l-.295-.797c-.386-1.044-.58-1.566-.96-1.947c-.382-.381-.904-.575-1.948-.961L13 6l.797-.295c1.044-.386 1.566-.58 1.947-.96c.381-.382.575-.904.961-1.948zM6 4l.221.597c.29.784.435 1.176.72 1.461c.286.286.678.431 1.462.72L9 7l-.597.221c-.784.29-1.176.435-1.461.72c-.286.286-.431.678-.72 1.462L6 10l-.221-.597c-.29-.784-.435-1.176-.72-1.461c-.286-.286-.678-.431-1.462-.72L3 7l.597-.221c.784-.29 1.176-.435 1.461-.72c.286-.286.431-.678.72-1.462z\"/></g>",
);
export const MagnifyingGlass = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"m17 17l4 4m-2-10a8 8 0 1 0-16 0a8 8 0 0 0 16 0\"/>",
);
export const MagnifyingGlassMinus = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"m17 17l4 4m-2-10a8 8 0 1 0-16 0a8 8 0 0 0 16 0M7.5 11h7\"/>",
);
export const MagnifyingGlassPlus = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"m17 17l4 4m-2-10a8 8 0 1 0-16 0a8 8 0 0 0 16 0M7.5 11h7M11 7.5v7\"/>",
);
export const MicrophoneSlash = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\" d=\"m2 2l20 20M4 11a8 8 0 0 0 8 8m0 0c1.954 0 3.745-.7 5.135-1.865M12 19v3m0 0h3m-3 0H9m11-11c0 1.651-.5 3.186-1.358 4.46m-1.634-8.464c0-2.761-2.239-4.98-5-4.98c-1.869 0-3.47.965-4.328 2.484m9.328 2.496l-3.028.012m3.028-.012v4.008m-10-4.008v4.02a5 5 0 0 0 5 5c1.135 0 2.165-.39 3.004-1.028m1.435-1.728c.358-.69.56-1.413.56-2.244v-.012m-2.824 0h2.825\"/>",
);
export const Minus = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M20 12H4\"/>",
);
export const MinusCircle = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M16 12H8\"/><circle cx=\"12\" cy=\"12\" r=\"10\"/></g>",
);
export const Moon = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M21.5 14.078A8.557 8.557 0 0 1 9.922 2.5C5.668 3.497 2.5 7.315 2.5 11.873a9.627 9.627 0 0 0 9.627 9.627c4.558 0 8.376-3.168 9.373-7.422\"/>",
);
export const MusicNote = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M7 9.5a2.5 2.5 0 1 1-5 0a2.5 2.5 0 0 1 5 0m0 0V2c.333.5.6 2.6 3 3\"/><circle cx=\"10.5\" cy=\"19.5\" r=\"2.5\"/><circle cx=\"20\" cy=\"18\" r=\"2\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M13 19.5V11c0-.91 0-1.365.247-1.648c.246-.282.747-.35 1.748-.487c3.014-.411 5.206-1.667 6.375-2.436c.28-.184.42-.276.525-.22s.105.223.105.554v11.163\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M13 13c4.8 0 8-2.333 9-3\"/></g>",
);
export const MusicNotes = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><circle cx=\"6.5\" cy=\"18.5\" r=\"3.5\"/><circle cx=\"18\" cy=\"16\" r=\"3\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M10 18.5V7c0-.923 0-1.385.264-1.672c.263-.287.754-.329 1.735-.413c4.023-.343 6.91-1.655 8.356-2.505c.296-.174.444-.26.544-.203s.101.225.101.559V16\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M10 10c5.867 0 9.778-2.333 11-3\"/></g>",
);
export const NotePencil = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M15.5 2v3m-9-3v3M11 2v3m8 7v-1.5c0-3.3 0-4.95-1.025-5.975S15.3 3.5 12 3.5h-2c-3.3 0-4.95 0-5.975 1.025S3 7.2 3 10.5V15c0 3.3 0 4.95 1.025 5.975S6.7 22 10 22h1m-4-7h4m-4-4h8m.737 10.653L14 22l.347-1.737c.07-.352.244-.676.499-.93l4.065-4.066a.91.91 0 0 1 1.288 0l.534.534a.91.91 0 0 1 0 1.288l-4.065 4.065a1.8 1.8 0 0 1-.931.499\"/>",
);
export const Package = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M12 22c-.818 0-1.6-.33-3.163-.99C4.946 19.366 3 18.543 3 17.16V7m9 15c.818 0 1.6-.33 3.163-.99C19.054 19.366 21 18.543 21 17.16V7m-9 15V11.355M8.326 9.691L5.405 8.278C3.802 7.502 3 7.114 3 6.5s.802-1.002 2.405-1.778l2.92-1.413C10.13 2.436 11.03 2 12 2s1.871.436 3.674 1.309l2.921 1.413C20.198 5.498 21 5.886 21 6.5s-.802 1.002-2.405 1.778l-2.92 1.413C13.87 10.564 12.97 11 12 11s-1.871-.436-3.674-1.309M6 12l2 1m9-9L7 9\"/>",
);
export const PackageIcon = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M10.5 14.5h-3c-.943 0-1.414 0-1.707.293S5.5 15.557 5.5 16.5v0c0 .943 0 1.414.293 1.707s.764.293 1.707.293h3c.943 0 1.414 0 1.707-.293s.293-.764.293-1.707v0c0-.943 0-1.414-.293-1.707s-.764-.293-1.707-.293\"/><path d=\"M21.5 13.5v-5c0-.991 0-1.487-.154-1.949S20.895 5.693 20.3 4.9c-.883-1.178-1.325-1.767-1.958-2.083c-.634-.317-1.37-.317-2.842-.317h-7c-1.472 0-2.208 0-2.842.317c-.633.316-1.075.905-1.958 2.083c-.595.793-.892 1.19-1.046 1.651S2.5 7.51 2.5 8.5v5c0 3.771 0 5.657 1.172 6.828S6.729 21.5 10.5 21.5h3c3.771 0 5.657 0 6.828-1.172S21.5 17.271 21.5 13.5M3 6.5h18\"/><path d=\"M14.5 6.5h-5l1-4h3zm0 0v2c0 .943 0 1.414-.293 1.707s-.764.293-1.707.293h-1c-.943 0-1.414 0-1.707-.293S9.5 9.443 9.5 8.5v-2\"/></g>",
);
export const PaintBrush = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M3.89 20.873L3 21l.127-.89c.194-1.356.29-2.034.591-2.635s.785-1.085 1.753-2.053L16.983 3.91c.423-.423.635-.635.863-.748a1.55 1.55 0 0 1 1.38 0c.229.113.44.325.864.748c.424.424.635.635.749.864c.215.435.215.945 0 1.38c-.114.228-.325.44-.75.863L8.58 18.53c-.969.968-1.453 1.452-2.054 1.753s-1.279.397-2.634.59M6 15l3 3m-.5-5.5l3 3\"/>",
);
export const Palette = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path d=\"M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12s4.477 10 10 10c.842 0 2 .116 2-1c0-.609-.317-1.079-.631-1.546c-.46-.683-.917-1.359-.369-2.454c.667-1.333 1.778-1.333 3.482-1.333c.851 0 1.851 0 3.018-.167c2.101-.3 2.5-1.592 2.5-3.5Z\"/><circle cx=\"9.5\" cy=\"8.5\" r=\"1.5\"/><circle cx=\"16.5\" cy=\"9.5\" r=\"1.5\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M7.125 15H7m.25 0a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0\"/></g>",
);
export const Pause = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" d=\"M4 7c0-1.414 0-2.121.44-2.56C4.878 4 5.585 4 7 4s2.121 0 2.56.44C10 4.878 10 5.585 10 7v10c0 1.414 0 2.121-.44 2.56C9.122 20 8.415 20 7 20s-2.121 0-2.56-.44C4 19.122 4 18.415 4 17zm10 0c0-1.414 0-2.121.44-2.56C14.878 4 15.585 4 17 4s2.121 0 2.56.44C20 4.878 20 5.585 20 7v10c0 1.414 0 2.121-.44 2.56c-.439.44-1.146.44-2.56.44s-2.121 0-2.56-.44C14 19.122 14 18.415 14 17z\"/>",
);
export const PauseCircle = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" d=\"M4 7c0-1.414 0-2.121.44-2.56C4.878 4 5.585 4 7 4s2.121 0 2.56.44C10 4.878 10 5.585 10 7v10c0 1.414 0 2.121-.44 2.56C9.122 20 8.415 20 7 20s-2.121 0-2.56-.44C4 19.122 4 18.415 4 17zm10 0c0-1.414 0-2.121.44-2.56C14.878 4 15.585 4 17 4s2.121 0 2.56.44C20 4.878 20 5.585 20 7v10c0 1.414 0 2.121-.44 2.56c-.439.44-1.146.44-2.56.44s-2.121 0-2.56-.44C14 19.122 14 18.415 14 17z\"/>",
);
export const PencilSimple = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path stroke-linejoin=\"round\" d=\"m15.214 5.982l1.402-1.401a1.982 1.982 0 0 1 2.803 2.803l-1.401 1.402m-2.804-2.804L6.98 14.216c-1.045 1.046-1.568 1.568-1.924 2.205S4.342 18.561 4 20c1.438-.342 2.942-.7 3.579-1.056s1.16-.879 2.205-1.924l8.234-8.234m-2.804-2.804l2.804 2.804\"/><path d=\"M11 20h6\"/></g>",
);
export const PencilSimpleLine = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M14.074 3.885c.745-.807 1.117-1.21 1.513-1.446a3.1 3.1 0 0 1 3.103-.047c.403.224.787.616 1.555 1.4c.768.785 1.152 1.178 1.37 1.589a3.29 3.29 0 0 1-.045 3.17c-.23.404-.625.785-1.416 1.546l-9.403 9.057c-1.498 1.443-2.247 2.164-3.183 2.53s-1.965.338-4.023.285l-.28-.008c-.626-.016-.94-.024-1.121-.231c-.183-.207-.158-.526-.108-1.164l.027-.346c.14-1.796.21-2.694.56-3.502s.956-1.463 2.166-2.774zM13 4l7 7\"/><path stroke-linecap=\"round\" d=\"M14 22h8\"/></g>",
);
export const PictureInPicture = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M11.5 20H10c-3.771 0-5.657 0-6.828-1.172S2 15.771 2 12s0-5.657 1.172-6.828S6.229 4 10 4h4c3.771 0 5.657 0 6.828 1.172C21.947 6.29 21.998 8.06 22 11.5\"/><path d=\"M20.5 14h-5a1.5 1.5 0 0 0-1.5 1.5v3a1.5 1.5 0 0 0 1.5 1.5h5a1.5 1.5 0 0 0 1.5-1.5v-3a1.5 1.5 0 0 0-1.5-1.5Z\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M11 9.5V12c.047.574-.397 1.024-1 1H7.5M6 8l4 4\"/></g>",
);
export const Play = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M18.89 12.846c-.353 1.343-2.023 2.292-5.364 4.19c-3.23 1.835-4.845 2.752-6.146 2.384a3.25 3.25 0 0 1-1.424-.841C5 17.614 5 15.743 5 12s0-5.614.956-6.579a3.25 3.25 0 0 1 1.424-.84c1.301-.37 2.916.548 6.146 2.383c3.34 1.898 5.011 2.847 5.365 4.19a3.3 3.3 0 0 1 0 1.692Z\"/>",
);
export const PlayCircle = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path stroke-linejoin=\"round\" d=\"M15.945 12.395c-.176.627-1.012 1.07-2.682 1.955c-1.615.856-2.422 1.285-3.073 1.113a1.66 1.66 0 0 1-.712-.393C9 14.62 9 13.746 9 12s0-2.62.478-3.07c.198-.186.443-.321.712-.392c.65-.173 1.458.256 3.073 1.112c1.67.886 2.506 1.329 2.682 1.955c.073.259.073.531 0 .79Z\"/></g>",
);
export const Playlist = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M2 5h12M2 12h7m-7 7h7m9-3V5s1 3.5 4 3.5M18 16a3 3 0 1 1-6 0a3 3 0 0 1 6 0\"/>",
);
export const Plus = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M12 4v16m8-8H4\"/>",
);
export const PlusCircle = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M12 8v8m4-4H8\"/><circle cx=\"12\" cy=\"12\" r=\"10\"/></g>",
);
export const Power = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path d=\"M2.5 12c0-4.23 0-6.345 1.198-7.747q.256-.3.555-.555C5.655 2.5 7.77 2.5 12 2.5s6.345 0 7.747 1.198q.3.256.555.555C21.5 5.655 21.5 7.77 21.5 12s0 6.345-1.198 7.747q-.256.3-.555.555C18.345 21.5 16.23 21.5 12 21.5s-6.345 0-7.747-1.198q-.3-.256-.555-.555C2.5 18.345 2.5 16.23 2.5 12Z\"/><circle cx=\"12\" cy=\"12\" r=\"6\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M9.875 12H9.75m4.625.001h-.125M10 12a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0m4.5.001a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0\"/></g>",
);
export const Printer = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M17 17h1.667c1.246 0 1.869 0 2.333-.268a2 2 0 0 0 .732-.732c.268-.464.268-1.087.268-2.333c0-2.493 0-3.739-.536-4.667A4 4 0 0 0 20 7.536C19.072 7 17.826 7 15.333 7H8.667C6.174 7 4.928 7 4 7.536A4 4 0 0 0 2.536 9C2 9.928 2 11.174 2 13.667c0 1.246 0 1.869.268 2.333a2 2 0 0 0 .732.732C3.464 17 4.087 17 5.333 17H7M17 7V5c0-1.414 0-2.121-.44-2.56C16.122 2 15.415 2 14 2h-4c-1.414 0-2.121 0-2.56.44C7 2.878 7 3.585 7 5v2\"/><path d=\"M17 14v5c0 1.414 0 2.121-.44 2.56c-.439.44-1.146.44-2.56.44h-4c-1.414 0-2.121 0-2.56-.44C7 21.122 7 20.415 7 19v-5zm1.875-3.75h-.125m.25 0a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0\"/></g>",
);
export const Prohibit = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12s4.477 10 10 10s10-4.477 10-10m-7 3L9 9m0 6l6-6\"/>",
);
export const Pulse = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M2 12h4l1.5-4l2 7L13 6l2.5 12l2.5-6h4\"/>",
);
export const PushPin = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"m3 21l5-5m5.259 2.871c-3.744-.85-7.28-4.386-8.13-8.13c-.135-.592-.202-.888-.007-1.369c.194-.48.433-.63.909-.927c1.076-.672 2.242-.886 3.451-.78c1.697.151 2.546.226 2.97.005c.423-.22.71-.736 1.286-1.767l.728-1.307c.48-.86.72-1.291 1.285-1.494s.905-.08 1.585.166a5.63 5.63 0 0 1 3.396 3.396c.246.68.369 1.02.166 1.585c-.203.564-.633.804-1.494 1.285l-1.337.745c-1.03.574-1.544.862-1.765 1.289c-.22.428-.14 1.258.02 2.918c.118 1.22-.085 2.394-.766 3.484c-.298.476-.447.714-.928.909c-.48.194-.777.127-1.37-.008\"/>",
);
export const PushPinSlash = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M7.5 8c-.541.128-1 .142-1.507.459c-.92.575-1.142 1.258-.905 2.302c.852 3.753 4.398 7.299 8.15 8.15c1.045.238 1.728.017 2.304-.903c.3-.48.33-1 .458-1.508m-4-8.7a1.3 1.3 0 0 0 .43-.118c.97-.505 1.5-2.148 2.02-3.082c.481-.863.722-1.294 1.288-1.498s.907-.08 1.588.166a5.64 5.64 0 0 1 3.406 3.406c.246.681.37 1.022.166 1.588s-.635.807-1.498 1.288c-.94.524-2.605 1.06-3.11 2.04a1.2 1.2 0 0 0-.113.41M3 21l5-5M3 3l18 18\"/>",
);
export const RadioButton = make(
  "<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"none\" stroke=\"currentColor\" stroke-linejoin=\"round\" stroke-width=\"1.5\"/>",
);
export const Repeat = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"m16.388 3l1.003.976c.448.436.672.654.593.839C17.906 5 17.59 5 16.955 5h-7.76C5.22 5 2 8.134 2 12c0 1.487.477 2.866 1.29 4m4.322 5l-1.003-.976c-.448-.436-.672-.654-.593-.839C6.094 19 6.41 19 7.045 19h7.76C18.78 19 22 15.866 22 12a6.84 6.84 0 0 0-1.29-4\"/>",
);
export const RepeatOnce = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"m16.388 3l1.003.976c.448.436.672.654.593.839C17.906 5 17.59 5 16.955 5h-7.76C5.22 5 2 8.134 2 12c0 1.487.477 2.866 1.29 4m4.322 5l-1.003-.976c-.448-.436-.672-.654-.593-.839C6.094 19 6.41 19 7.045 19h7.76C18.78 19 22 15.866 22 12a6.84 6.84 0 0 0-1.29-4\"/><path d=\"M13 15V9.316c0-.26-.282-.408-.48-.252l-1.52 1.2\"/></g>",
);
export const Rewind = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path stroke-linejoin=\"round\" d=\"M4.065 12.626c.254 1.211 1.608 2.082 4.315 3.822c2.945 1.893 4.417 2.84 5.61 2.475c.403-.124.775-.34 1.088-.635C16 17.418 16 15.612 16 12s0-5.418-.922-6.288a2.8 2.8 0 0 0-1.088-.635c-1.193-.365-2.665.582-5.61 2.475c-2.707 1.74-4.06 2.61-4.315 3.822c-.087.412-.087.84 0 1.252Z\"/><path stroke-linecap=\"round\" d=\"M20 5v14\"/></g>",
);
export const Rows = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\" d=\"M2 11.4c0-1.158.242-1.4 1.4-1.4h17.2c1.158 0 1.4.242 1.4 1.4v1.2c0 1.158-.242 1.4-1.4 1.4H3.4C2.242 14 2 13.758 2 12.6zm0-8C2 2.242 2.242 2 3.4 2h17.2c1.158 0 1.4.242 1.4 1.4v1.2c0 1.158-.242 1.4-1.4 1.4H3.4C2.242 6 2 5.758 2 4.6zm0 16c0-1.158.242-1.4 1.4-1.4h17.2c1.158 0 1.4.242 1.4 1.4v1.2c0 1.158-.242 1.4-1.4 1.4H3.4C2.242 22 2 21.758 2 20.6z\"/>",
);
export const Scan = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M6.5 21.5c-.464 0-.697 0-.892-.022a3.5 3.5 0 0 1-3.086-3.086c-.022-.195-.022-.428-.022-.892m15 4c.464 0 .697 0 .892-.022a3.5 3.5 0 0 0 3.086-3.086c.022-.195.022-.428.022-.892m-15-15c-.464 0-.697 0-.892.022a3.5 3.5 0 0 0-3.086 3.086c-.022.195-.022.428-.022.892m15-4c.464 0 .697 0 .892.022a3.5 3.5 0 0 1 3.086 3.086c.022.195.022.428.022.892m-14.621.379C7.757 6 9.172 6 12 6s4.243 0 5.121.879C18 7.757 18 9.172 18 12s0 4.243-.879 5.121C16.243 18 14.828 18 12 18s-4.243 0-5.121-.879C6 16.243 6 14.828 6 12s0-4.243.879-5.121\"/><path d=\"m6.5 15.5l1.533-1.648a1.3 1.3 0 0 1 1.934 0a1.303 1.303 0 0 0 1.995-.071l1.41-1.73a1.433 1.433 0 0 1 2.257 0l2.131 2.617M10.375 9.75h-.125m.25 0a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0\"/></g>",
);
export const Scissors = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path d=\"M2.5 12c0-4.478 0-6.718 1.391-8.109S7.521 2.5 12 2.5c4.478 0 6.718 0 8.109 1.391S21.5 7.521 21.5 12c0 4.478 0 6.718-1.391 8.109S16.479 21.5 12 21.5c-4.478 0-6.718 0-8.109-1.391S2.5 16.479 2.5 12Z\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M13.437 9.558L10.6 12m0 0L7 15m3.6-3l2.895 2.387M10.6 12L7 9m9-.5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0m0 7a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0\"/></g>",
);
export const SelectionAll = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path d=\"M2.5 12c0-4.478 0-6.718 1.391-8.109S7.521 2.5 12 2.5c4.478 0 6.718 0 8.109 1.391S21.5 7.521 21.5 12c0 4.478 0 6.718-1.391 8.109S16.479 21.5 12 21.5c-4.478 0-6.718 0-8.109-1.391S2.5 16.479 2.5 12Z\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"m8 12.5l2.5 2.5L16 9\"/></g>",
);
export const Shapes = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M4 8a4 4 0 0 0 4-4c0-.728 0-1.092.024-1.199c.109-.49.257-.64.745-.756c.107-.025.318-.028.74-.034C10.256 2 11.083 2 12 2c1.371 0 2.543 0 3.552.036c.408.015.612.022.735.059c.423.126.57.278.68.705C17 2.925 17 3.283 17 4a4 4 0 0 0 4 4c.493 0 .963.343.976.836C22 9.754 22 10.801 22 12c0 .916 0 1.743-.01 2.492c-.007.421-.01.632-.035.74c-.116.487-.267.635-.756.744C21.092 16 20.728 16 20 16a4 4 0 0 0-4 4c0 .728 0 1.092-.024 1.199c-.109.49-.257.64-.745.756c-.107.025-.318.028-.74.034C13.744 22 12.917 22 12 22s-1.743 0-2.492-.01c-.421-.007-.632-.01-.74-.035c-.487-.116-.635-.267-.744-.756C8 21.092 8 20.728 8 20a4 4 0 0 0-4-4c-.728 0-1.092 0-1.199-.024c-.49-.109-.64-.257-.756-.745c-.025-.107-.028-.318-.034-.74C2 13.744 2 12.917 2 12s0-1.743.01-2.492c.007-.421.01-.632.035-.74c.116-.487.267-.635.756-.744C2.908 8 3.272 8 4 8Z\"/>",
);
export const ShareNetwork = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" d=\"M21 6.5a3 3 0 1 1-6 0a3 3 0 0 1 6 0ZM9 12a3 3 0 1 1-6 0a3 3 0 0 1 6 0Zm12 5.5a3 3 0 1 1-6 0a3 3 0 0 1 6 0ZM8.729 10.75l6.5-3m-6.5 5.5l6.5 3\"/>",
);
export const Shield = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M18.709 3.495C16.817 2.554 14.5 2 12 2s-4.816.554-6.709 1.495c-.928.462-1.392.693-1.841 1.419S3 6.342 3 7.748v3.49c0 5.683 4.542 8.842 7.173 10.196c.734.377 1.1.566 1.827.566s1.093-.189 1.827-.566C16.457 20.08 21 16.92 21 11.237V7.748c0-1.406 0-2.108-.45-2.834s-.913-.957-1.841-1.419\"/>",
);
export const ShieldCheck = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M18.709 3.495C16.817 2.554 14.5 2 12 2s-4.816.554-6.709 1.495c-.928.462-1.392.693-1.841 1.419S3 6.342 3 7.748v3.49c0 5.683 4.542 8.842 7.173 10.196c.734.377 1.1.566 1.827.566s1.093-.189 1.827-.566C16.457 20.08 21 16.92 21 11.237V7.748c0-1.406 0-2.108-.45-2.834s-.913-.957-1.841-1.419\"/><path d=\"M9 11.5s1.408.252 2 2c0 0 1.5-3 4-4\"/></g>",
);
export const ShieldStar = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path stroke-linejoin=\"round\" d=\"M10 12s.5 0 1 1c0 0 1.588-2.5 3-3\"/><path d=\"M17 11.5a5 5 0 1 1-10 0a5 5 0 0 1 10 0Z\"/><path d=\"M21 11.183V8.28c0-1.64 0-2.46-.404-2.995s-1.318-.794-3.145-1.314a25 25 0 0 1-3.229-1.173C13.023 2.266 12.424 2 12 2s-1.023.266-2.222.798c-.88.39-1.98.818-3.229 1.173c-1.827.52-2.74.78-3.145 1.314C3 5.82 3 6.64 3 8.28v2.903c0 5.625 5.063 9 7.594 10.336c.607.32.91.481 1.406.481s.799-.16 1.406-.48C15.937 20.182 21 16.807 21 11.182Z\"/></g>",
);
export const ShieldWarning = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path stroke-linejoin=\"round\" d=\"m8.129 11.131l3.999-4.94c.313-.387.899-.146.899.369v3.824c0 .308.23.558.514.558h1.944c.442 0 .678.566.386.927l-3.999 4.94c-.313.387-.899.146-.899-.368v-3.824c0-.309-.23-.559-.514-.559H8.515c-.441 0-.677-.566-.385-.927\"/><path d=\"M21 11.184V8.28c0-1.64 0-2.46-.404-2.995s-1.318-.794-3.145-1.314a25 25 0 0 1-3.229-1.173C13.023 2.266 12.424 2 12 2s-1.023.266-2.222.798c-.88.39-1.98.818-3.229 1.173c-1.827.52-2.74.78-3.145 1.314C3 5.82 3 6.64 3 8.28v2.904c0 5.625 5.063 9 7.594 10.336c.607.32.91.48 1.406.48s.799-.16 1.406-.48C15.937 20.184 21 16.809 21 11.184Z\"/></g>",
);
export const Shuffle = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"m19.558 4l.897.976c.401.436.602.654.531.839S20.632 6 20.065 6c-1.27 0-2.788-.205-3.954.473c-.72.42-1.223 1.152-2.072 2.527M3 18h1.58c1.929 0 2.893 0 3.706-.473c.721-.42 1.223-1.152 2.072-2.527m9.2 5l.897-.976c.401-.436.602-.654.531-.839S20.632 18 20.065 18c-1.27 0-2.788.205-3.954-.473c-.813-.474-1.348-1.346-2.418-3.09l-2.99-4.875C9.635 7.82 9.1 6.947 8.287 6.473S6.51 6 4.581 6H3\"/>",
);
export const SidebarSimple = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M2 12c0-3.75 0-5.625.955-6.939A5 5 0 0 1 4.06 3.955C5.375 3 7.251 3 11 3h2c3.75 0 5.625 0 6.939.955a5 5 0 0 1 1.106 1.106C22 6.375 22 8.251 22 12s0 5.625-.955 6.939a5 5 0 0 1-1.106 1.106C18.625 21 16.749 21 13 21h-2c-3.75 0-5.625 0-6.939-.955a5 5 0 0 1-1.106-1.106C2 17.625 2 15.749 2 12Zm7.5-8.5v17\"/><path stroke-linecap=\"round\" d=\"M5 7h1.5M5 11h1.5M17 10l-1.226 1.057c-.516.445-.774.667-.774.943s.258.498.774.943L17 14\"/></g>",
);
export const Signature = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M22 12.634c-4 3.512-4.572-2.013-6.65-1.617c-2.35.447-3.85 5.428-2.35 5.428s-.5-5.945-2.5-3.89s-2.64 4.74-4.265 2.748C-1.5 5.813 5-1.15 8.163 3.457C10.165 6.373 6.5 16.977 2 22m7-1h10\"/>",
);
export const SimCard = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"m9.5 18l-1.112-.94c-.592-.5-.888-.75-.888-1.06s.296-.56.888-1.06L9.5 14m5 0l1.112.94c.592.5.888.75.888 1.06s-.296.56-.888 1.06L14.5 18\"/><path d=\"M3 11.858c0-4.576 0-6.864 1.387-8.314a5 5 0 0 1 .157-.157C5.994 2 8.282 2 12.858 2c1.085 0 1.608.004 2.105.19c.479.178.88.512 1.682 1.181l2.196 1.83c1.062.885 1.592 1.327 1.876 1.932C21 7.737 21 8.428 21 9.81V13c0 3.75 0 5.625-.955 6.939a5 5 0 0 1-1.106 1.106C17.625 22 15.749 22 12 22s-5.625 0-6.939-.955a5 5 0 0 1-1.106-1.106C3 18.625 3 16.749 3 13z\"/></g>",
);
export const SkipBack = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M2.163 12.918c.282.77 1.136 1.387 2.842 2.62c2.327 1.68 3.49 2.52 4.464 2.459a2.7 2.7 0 0 0 1.909-.965C12 16.286 12 14.858 12 12s0-4.286-.622-5.032a2.7 2.7 0 0 0-1.91-.965c-.972-.061-2.136.779-4.463 2.46c-1.706 1.232-2.56 1.849-2.842 2.62a2.67 2.67 0 0 0 0 1.835Z\"/><path d=\"M12.163 12.918c.282.77 1.136 1.387 2.842 2.62c2.327 1.68 3.49 2.52 4.464 2.459a2.7 2.7 0 0 0 1.909-.965C22 16.286 22 14.858 22 12s0-4.286-.622-5.032a2.7 2.7 0 0 0-1.91-.965c-.972-.061-2.136.779-4.463 2.46c-1.706 1.232-2.56 1.849-2.842 2.62a2.67 2.67 0 0 0 0 1.835Z\"/></g>",
);
export const SkipForward = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M21.837 12.918c-.282.77-1.136 1.387-2.842 2.62c-2.327 1.68-3.49 2.52-4.464 2.459a2.7 2.7 0 0 1-1.909-.965C12 16.286 12 14.858 12 12s0-4.286.622-5.032a2.7 2.7 0 0 1 1.91-.965c.972-.061 2.136.779 4.463 2.46c1.706 1.232 2.56 1.849 2.842 2.62a2.67 2.67 0 0 1 0 1.835Z\"/><path d=\"M11.837 12.918c-.282.77-1.136 1.387-2.842 2.62c-2.327 1.68-3.49 2.52-4.464 2.459a2.7 2.7 0 0 1-1.909-.965C2 16.286 2 14.858 2 12s0-4.286.622-5.032a2.7 2.7 0 0 1 1.91-.965c.972-.061 2.136.779 4.463 2.46c1.706 1.232 2.56 1.849 2.842 2.62a2.67 2.67 0 0 1 0 1.835Z\"/></g>",
);
export const SlidersHorizontal = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M3 7h3M3 17h6m9 0h3M15 7h6\"/><path d=\"M6 7c0-.932 0-1.398.152-1.765a2 2 0 0 1 1.083-1.083C7.602 4 8.068 4 9 4s1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C12 5.602 12 6.068 12 7s0 1.398-.152 1.765a2 2 0 0 1-1.083 1.083C10.398 10 9.932 10 9 10s-1.398 0-1.765-.152a2 2 0 0 1-1.083-1.083C6 8.398 6 7.932 6 7Zm6 10c0-.932 0-1.398.152-1.765a2 2 0 0 1 1.083-1.083C13.602 14 14.068 14 15 14s1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C18 15.602 18 16.068 18 17s0 1.398-.152 1.765a2 2 0 0 1-1.083 1.083C16.398 20 15.932 20 15 20s-1.398 0-1.765-.152a2 2 0 0 1-1.083-1.083C12 18.398 12 17.932 12 17Z\"/></g>",
);
export const SortAscending = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M8 19V4m8 4h4m0 2V6a2 2 0 1 0-4 0v4m0 4h2.365c.924 0 1.385 0 1.52.288s-.16.643-.752 1.352l-2.266 2.72c-.591.71-.887 1.064-.752 1.352s.596.288 1.52.288H20M4 16s2.946 4 4 4s4-4 4-4\"/>",
);
export const SortDescending = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M16 18h4m0 2v-4a2 2 0 1 0-4 0v4M4 8s2.946-4 4-4s4 4 4 4M8 5v15m8-16h2.365c.924 0 1.385 0 1.52.288s-.16.643-.752 1.352l-2.266 2.72c-.591.71-.887 1.064-.752 1.352s.596.288 1.52.288H20\"/>",
);
export const Sparkle = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"m15 2l.539 2.392a5.39 5.39 0 0 0 4.07 4.07L22 9l-2.392.539a5.39 5.39 0 0 0-4.07 4.07L15 16l-.539-2.392a5.39 5.39 0 0 0-4.07-4.07L8 9l2.392-.539a5.39 5.39 0 0 0 4.07-4.07zM7 12l.385 1.708a3.85 3.85 0 0 0 2.907 2.907L12 17l-1.708.385a3.85 3.85 0 0 0-2.907 2.907L7 22l-.385-1.708a3.85 3.85 0 0 0-2.907-2.907L2 17l1.708-.385a3.85 3.85 0 0 0 2.907-2.907z\"/>",
);
export const SpeakerHigh = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M14 14.814V9.186c0-3.145 0-4.717-.925-5.109c-.926-.391-2.015.72-4.193 2.945c-1.128 1.152-1.771 1.407-3.376 1.407c-1.403 0-2.105 0-2.61.344C1.85 9.487 2.01 10.882 2.01 12s-.159 2.513.888 3.227c.504.344 1.206.344 2.609.344c1.605 0 2.248.255 3.376 1.407c2.178 2.224 3.267 3.336 4.193 2.945c.925-.392.925-1.964.925-5.11M17 9c.625.82 1 1.863 1 3s-.375 2.18-1 3m3-8c1.25 1.366 2 3.106 2 5s-.75 3.634-2 5\"/>",
);
export const SpeakerSlash = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M22 22L2 2m15 8c.63.767 1 1.705 1 2.72c0 .444-.071.873-.204 1.28M20 8c1.25 1.23 2 2.795 2 4.5c0 1.416-.517 2.737-1.41 3.848M14 14c0 3.145 0 5.531-.926 5.923c-.926.391-2.016-.72-4.195-2.945c-1.13-1.152-1.773-1.407-3.379-1.407c-1.112 0-2.473.148-3.163-.907C2 14.15 2 13.434 2 12c0-1.433 0-2.15.337-2.664c.69-1.055 2.05-.907 3.163-.907c1.107 0 1.857.01 2.46-.469M14 9.5c0-3.145.026-5.031-.9-5.423c-.77-.326-1.568.39-3.1 1.923\"/>",
);
export const Square = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" d=\"M2.5 12c0-4.478 0-6.718 1.391-8.109S7.521 2.5 12 2.5c4.478 0 6.718 0 8.109 1.391S21.5 7.521 21.5 12c0 4.478 0 6.718-1.391 8.109S16.479 21.5 12 21.5c-4.478 0-6.718 0-8.109-1.391S2.5 16.479 2.5 12Z\"/>",
);
export const SquareSplitHorizontal = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M13 3h-2C7.229 3 5.343 3 4.172 4.172S3 7.229 3 11v2c0 3.771 0 5.657 1.172 6.828S7.229 21 11 21h2c3.771 0 5.657 0 6.828-1.172S21 16.771 21 13v-2c0-3.771 0-5.657-1.172-6.828S16.771 3 13 3M9 3v18m6-18v18m6-12H3m18 6H3\"/>",
);
export const SquaresFour = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"square\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M13.69 19.457c-.19-.46-.19-1.042-.19-2.207s0-1.747.19-2.207a2.5 2.5 0 0 1 1.353-1.353c.46-.19 1.042-.19 2.207-.19s1.747 0 2.207.19a2.5 2.5 0 0 1 1.353 1.353c.19.46.19 1.042.19 2.207s0 1.747-.19 2.207a2.5 2.5 0 0 1-1.353 1.353c-.46.19-1.042.19-2.207.19s-1.747 0-2.207-.19a2.5 2.5 0 0 1-1.353-1.353Zm0-10.5c-.19-.46-.19-1.042-.19-2.207s0-1.747.19-2.207a2.5 2.5 0 0 1 1.353-1.353C15.503 3 16.085 3 17.25 3s1.747 0 2.207.19a2.5 2.5 0 0 1 1.353 1.353c.19.46.19 1.042.19 2.207s0 1.747-.19 2.207a2.5 2.5 0 0 1-1.353 1.353c-.46.19-1.042.19-2.207.19s-1.747 0-2.207-.19a2.5 2.5 0 0 1-1.353-1.353Zm-10.5 10.5C3 18.997 3 18.415 3 17.25s0-1.747.19-2.207a2.5 2.5 0 0 1 1.353-1.353c.46-.19 1.042-.19 2.207-.19s1.747 0 2.207.19a2.5 2.5 0 0 1 1.353 1.353c.19.46.19 1.042.19 2.207s0 1.747-.19 2.207a2.5 2.5 0 0 1-1.353 1.353c-.46.19-1.042.19-2.207.19s-1.747 0-2.207-.19a2.5 2.5 0 0 1-1.353-1.353Zm0-10.5C3 8.497 3 7.915 3 6.75s0-1.747.19-2.207A2.5 2.5 0 0 1 4.543 3.19C5.003 3 5.585 3 6.75 3s1.747 0 2.207.19a2.5 2.5 0 0 1 1.353 1.353c.19.46.19 1.042.19 2.207s0 1.747-.19 2.207a2.5 2.5 0 0 1-1.353 1.353c-.46.19-1.042.19-2.207.19s-1.747 0-2.207-.19A2.5 2.5 0 0 1 3.19 8.957Z\"/>",
);
export const Stack = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"m8.643 3.146l-1.705.788C4.313 5.147 3 5.754 3 6.75s1.313 1.603 3.938 2.816l1.705.788c1.652.764 2.478 1.146 3.357 1.146s1.705-.382 3.357-1.146l1.705-.788C19.687 8.353 21 7.746 21 6.75s-1.313-1.603-3.938-2.816l-1.705-.788C13.705 2.382 12.879 2 12 2s-1.705.382-3.357 1.146\"/><path d=\"M20.788 11.097c.141.199.212.406.212.634c0 .982-1.313 1.58-3.938 2.776l-1.705.777c-1.652.753-2.478 1.13-3.357 1.13s-1.705-.377-3.357-1.13l-1.705-.777C4.313 13.311 3 12.713 3 11.731c0-.228.07-.435.212-.634\"/><path d=\"M20.377 16.266c.415.331.623.661.623 1.052c0 .981-1.313 1.58-3.938 2.776l-1.705.777C13.705 21.624 12.879 22 12 22s-1.705-.376-3.357-1.13l-1.705-.776C4.313 18.898 3 18.299 3 17.318c0-.391.208-.72.623-1.052\"/></g>",
);
export const Star = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"m13.728 3.444l1.76 3.549c.24.494.88.968 1.42 1.058l3.189.535c2.04.343 2.52 1.835 1.05 3.307l-2.48 2.5c-.42.423-.65 1.24-.52 1.825l.71 3.095c.56 2.45-.73 3.397-2.88 2.117l-2.99-1.785c-.54-.322-1.43-.322-1.98 0L8.019 21.43c-2.14 1.28-3.44.322-2.88-2.117l.71-3.095c.13-.585-.1-1.402-.52-1.825l-2.48-2.5C1.39 10.42 1.86 8.929 3.899 8.586l3.19-.535c.53-.09 1.17-.564 1.41-1.058l1.76-3.549c.96-1.925 2.52-1.925 3.47 0\"/>",
);
export const StopCircle = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" d=\"M4 12c0-3.28 0-4.919.814-6.081a4.5 4.5 0 0 1 1.105-1.105C7.08 4 8.72 4 12 4s4.919 0 6.081.814a4.5 4.5 0 0 1 1.105 1.105C20 7.08 20 8.72 20 12s0 4.919-.814 6.081a4.5 4.5 0 0 1-1.105 1.105C16.92 20 15.28 20 12 20s-4.919 0-6.081-.814a4.5 4.5 0 0 1-1.105-1.105C4 16.92 4 15.28 4 12Z\"/>",
);
export const Sun = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path d=\"M17 12a5 5 0 1 1-10 0a5 5 0 0 1 10 0Z\"/><path stroke-linecap=\"round\" d=\"M12 2c-.377.333-.905 1.2 0 2m0 16c.377.333.906 1.2 0 2m7.5-17.497c-.532-.033-1.575.22-1.496 1.495M5.496 17.5c.033.532-.22 1.575-1.496 1.496M5.003 4.5c-.033.532.22 1.576 1.497 1.497M18 17.503c.532-.032 1.575.208 1.496 1.414M22 12c-.333-.377-1.2-.905-2 0m-16-.5c-.333.377-1.2.906-2 0\"/></g>",
);
export const TextAa = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"m14 19l-2.893-8.252C9.763 6.916 9.092 5 8 5s-1.763 1.916-3.107 5.748L2 19m2.5-7h7m10.47 1.94v4.5m0-4.5c.046-.824.048-1.45-.05-1.963c-.234-1.206-1.494-1.933-2.714-2.081c-1.168-.142-2.104.159-3.052 1.54m5.815 2.503h-2.843c-.437 0-.878.021-1.299.138c-2.573.716-2.384 4.323.196 4.768c.287.05.58.07.87.058c.677-.03 1.302-.358 1.84-.773c.627-.486 1.236-1.165 1.236-2.19z\"/>",
);
export const TextAlignLeft = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M3 3h18M3 9h8m-8 6h18M3 21h8\"/>",
);
export const TextT = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path stroke-linejoin=\"round\" d=\"M15 21.001H9\"/><path d=\"M12 3v18m0-18c1.387 0 3.17.03 4.588.176c.6.062.9.093 1.166.202a2.05 2.05 0 0 1 1.165 1.299C19 4.954 19 5.27 19 5.902M12 3c-1.387 0-3.17.03-4.588.176c-.6.062-.9.093-1.166.202A2.05 2.05 0 0 0 5.08 4.677C5 4.954 5 5.27 5 5.902\"/></g>",
);
export const Timer = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M11.08 13.152L8 7l5.42 4.28c.77.608.774 1.767.008 2.38a1.547 1.547 0 0 1-2.347-.508\"/><path d=\"M5 4.82a10 10 0 0 0-3 7.158C2 17.513 6.477 22 12 22s10-4.487 10-10.022a10.02 10.02 0 0 0-8.013-9.825c-.836-.17-1.254-.254-1.62.047S12 2.987 12 3.96v1.002\"/></g>",
);
export const Trash = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\" d=\"m19.5 5.5l-.62 10.025c-.158 2.561-.237 3.842-.88 4.763a4 4 0 0 1-1.2 1.128c-.957.584-2.24.584-4.806.584c-2.57 0-3.855 0-4.814-.585a4 4 0 0 1-1.2-1.13c-.642-.922-.72-2.205-.874-4.77L4.5 5.5M3 5.5h18m-4.944 0l-.683-1.408c-.453-.936-.68-1.403-1.071-1.695a2 2 0 0 0-.275-.172C13.594 2 13.074 2 12.035 2c-1.066 0-1.599 0-2.04.234a2 2 0 0 0-.278.18c-.395.303-.616.788-1.058 1.757L8.053 5.5m1.447 11v-6m5 6v-6\"/>",
);
export const TreeStructure = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M9.891 7.556c-.55.316-1.992.96-1.114 1.768c.43.394.907.676 1.508.676h3.43c.6 0 1.079-.282 1.508-.676c.879-.807-.564-1.452-1.114-1.768a4.28 4.28 0 0 0-4.218 0\"/><path d=\"M13.5 3.5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0Z\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M16.391 19.556c-.55.316-1.992.96-1.114 1.768c.43.394.907.676 1.508.676h3.43c.6 0 1.079-.282 1.508-.676c.879-.808-.564-1.453-1.114-1.768a4.28 4.28 0 0 0-4.218 0\"/><path d=\"M20 15.5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0Z\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M3.391 19.556c-.55.316-1.992.96-1.114 1.768c.43.394.907.676 1.508.676h3.43c.6 0 1.079-.282 1.508-.676c.878-.808-.564-1.453-1.114-1.768a4.28 4.28 0 0 0-4.218 0\"/><path d=\"M7 15.5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0Z\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M12 13v2.5m0 0l2.5 1.5M12 15.5L9.5 17\"/></g>",
);
export const TrendDown = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M20 11v5h-5\"/><path d=\"m20 16l-5-5c-.883-.883-1.324-1.324-1.865-1.373a1.5 1.5 0 0 0-.27 0c-.541.05-.982.49-1.865 1.373s-1.324 1.324-1.865 1.373q-.135.012-.27 0c-.541-.05-.982-.49-1.865-1.373L4 8\"/></g>",
);
export const UploadSimple = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M3 17c0 .93 0 1.395.102 1.776a3 3 0 0 0 2.121 2.122C5.605 21 6.07 21 7 21h10c.93 0 1.395 0 1.776-.102a3 3 0 0 0 2.122-2.122C21 18.396 21 17.93 21 17m-4.5-9.5S13.186 3 12 3S7.5 7.5 7.5 7.5M12 4v12\"/>",
);
export const UsbIcon = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path stroke-linecap=\"round\" d=\"M10.984 16.5H9.016a3.08 3.08 0 0 1-2.547-1.338l-.601-.885a9.9 9.9 0 0 1-1.68-4.785l-.184-2.379C3.937 6.243 4.64 5.5 5.53 5.5h8.94c.89 0 1.593.743 1.525 1.613L15.928 8\"/><path d=\"M13.5 6v-.5c0-1.404 0-2.107-.337-2.611a2 2 0 0 0-.552-.552C12.107 2 11.404 2 10 2s-2.107 0-2.611.337a2 2 0 0 0-.552.552C6.5 3.393 6.5 4.096 6.5 5.5V6\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M10 17v5M9 8.5h2m1 5s1 0 2 2c0 0 3.177-5 6-6\"/></g>",
);
export const User = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M20 21a7.53 7.53 0 0 0-7.005-6.934L12 14q-.531.015-1 .038c-3.7.181-6.716 3.268-7 6.962\"/><circle cx=\"12\" cy=\"7\" r=\"4\"/></g>",
);
export const Warning = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M13.925 21h-3.85c-4.63 0-6.945 0-7.799-1.506c-.853-1.506.331-3.503 2.7-7.495L6.9 8.753C9.176 4.918 10.313 3 12 3s2.824 1.918 5.1 5.753L19.023 12c2.369 3.992 3.553 5.989 2.7 7.495C20.87 21 18.555 21 13.924 21M12 9v4\"/><path d=\"M12.125 16.75H12m.25 0a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0\"/></g>",
);
export const WarningDiamond = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M5.92 5.92c2.238-2.237 3.357-3.355 4.666-3.724a5.2 5.2 0 0 1 2.828 0c1.309.369 2.428 1.487 4.665 3.725s3.356 3.356 3.725 4.665a5.2 5.2 0 0 1 0 2.828c-.369 1.309-1.487 2.428-3.725 4.665s-3.356 3.356-4.665 3.725a5.2 5.2 0 0 1-2.828 0c-1.309-.369-2.428-1.487-4.665-3.725s-3.356-3.356-3.725-4.665a5.2 5.2 0 0 1 0-2.828C2.565 9.277 3.683 8.158 5.92 5.92M12 8v4\"/><path d=\"M12.125 15.75H12m.25 0a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0\"/></g>",
);
export const WaveSine = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M9 3v18M6 7v10m6-11v12m3-9v6m3-8v10m3-6v2M3 11v2\"/>",
);
export const WaveformIcon = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M3 14V9.5a1.5 1.5 0 1 1 3 0v7a1.5 1.5 0 0 0 3 0v-12a1.5 1.5 0 1 1 3 0v15a1.5 1.5 0 0 0 3 0v-11a1.5 1.5 0 0 1 3 0v7a1.5 1.5 0 0 0 3 0V12\"/>",
);
export const WifiSlash = make(
  "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path stroke-linejoin=\"round\" d=\"M8.5 16c.867-.867 1.92-1.358 3-1.474m-6-2.026c3.173-3.173 7.122-3.83 10.5-1.968M2 8.5c6.316-5.333 13.684-5.333 20 0\"/><path d=\"m21 13.5l-6 6m6 0l-6-6\"/></g>",
);
export const Wrench = make(
  "<g fill=\"none\" stroke=\"currentColor\"><path stroke-width=\"1.5\" d=\"M20.358 13.357c-1.19 1.189-3.427 1.143-6.859 1.143a4 4 0 0 1-3.999-4c0-3.43-.046-5.67 1.143-6.859s1.715-1.14 6.984-1.14a.57.57 0 0 1 .406.973L15.32 6.187a1.763 1.763 0 1 0 2.492 2.494l2.714-2.712a.57.57 0 0 1 .974.405c0 5.268.048 5.794-1.142 6.983Z\"/><path stroke-linecap=\"round\" stroke-width=\"1.5\" d=\"m13.5 14.5l-6.172 6.172a2.829 2.829 0 0 1-4-4L9.5 10.5\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M5.509 18.5H5.5\"/></g>",
);
export const X = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M18 6L6 18m12 0L6 6\"/>",
);
export const XCircle = make(
  "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12s4.477 10 10 10s10-4.477 10-10m-7 3L9 9m0 6l6-6\"/>",
);
