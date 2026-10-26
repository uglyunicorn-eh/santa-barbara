// Class recipes for the controls in docs/design-spec.md, used by the UI kit page. They're prototypes: Phase 4 turns
// them into the real components (shadcn on Base UI), and the kit then shows those instead.
//
// A recipe takes a `state` so the kit can show hover and focus without a mouse; "live" leaves them to the browser.

import { cn } from "@/lib/utils";

export type Surface = "paper" | "night" | "glass";
export type State = "default" | "hover" | "focus" | "disabled" | "loading" | "live";

export const SURFACES: { id: Surface; name: string; note: string }[] = [
  { id: "night", name: "Night", note: "Dark photo backgrounds: the start page, sign-in, join, and behind every dialog." },
  { id: "paper", name: "Paper", note: "White cards: every dialog, the profile, the join box; and the light party page." },
  { id: "glass", name: "Glass", note: "Dark translucent panels on photos: the sign-in card." },
];

const dark = (surface: Surface) => surface !== "paper";

// ---------------------------------------------------------------------------------------------------------------
// Buttons

export type ButtonVariant = "primary" | "secondary" | "ghost" | "ghost-destructive" | "destructive" | "link";
export type ButtonSize = "sm" | "md" | "lg";

export const BUTTON_VARIANTS: { id: ButtonVariant; name: string; use: string }[] = [
  { id: "primary", name: "primary", use: "The one main action on a screen" },
  { id: "secondary", name: "secondary", use: "Dismiss, cancel, show more" },
  { id: "ghost", name: "ghost", use: "Quiet actions in rows: Change, Cancel" },
  { id: "ghost-destructive", name: "ghost + destructive", use: "Delete actions, until the final confirm" },
  { id: "destructive", name: "destructive", use: "Only the final confirm of a delete" },
  { id: "link", name: "link", use: "Links in copy" },
];

const buttonBase =
  "inline-flex items-center justify-center gap-2 font-sans font-medium whitespace-nowrap rounded-lg border border-transparent transition-colors duration-150 cursor-pointer outline-none select-none";

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-base",
  lg: "h-12 px-5 text-lg",
};

/** Resting look, and the look while hovered, per variant and surface. */
const buttonLooks: Record<ButtonVariant, Record<"light" | "dark", [string, string]>> = {
  primary: {
    light: ["bg-primary text-primary-foreground", "bg-primary-hover text-primary-foreground"],
    dark: ["bg-primary text-primary-foreground shadow-sm", "bg-primary-hover text-primary-foreground shadow-sm"],
  },
  secondary: {
    light: ["bg-white border-input text-zinc-900", "bg-zinc-50 border-input text-zinc-900"],
    dark: ["bg-transparent border-white/40 text-white", "bg-white/10 border-white/40 text-white"],
  },
  ghost: {
    light: ["bg-transparent text-zinc-700", "bg-zinc-100 text-zinc-900"],
    dark: ["bg-transparent text-white", "bg-white/10 text-white"],
  },
  "ghost-destructive": {
    light: ["bg-transparent text-destructive", "bg-red-50 text-destructive"],
    dark: ["bg-transparent text-red-200", "bg-white/10 text-red-200"],
  },
  destructive: {
    light: ["bg-destructive-strong text-white", "bg-destructive-strong-hover text-white"],
    dark: ["bg-destructive-strong text-white shadow-sm", "bg-destructive-strong-hover text-white shadow-sm"],
  },
  link: {
    light: ["h-auto px-0 bg-transparent text-link underline underline-offset-4", "h-auto px-0 bg-transparent text-red-800 underline underline-offset-4"],
    dark: ["h-auto px-0 bg-transparent text-zinc-100 underline underline-offset-4", "h-auto px-0 bg-transparent text-white underline underline-offset-4"],
  },
};

/** The focus ring: 2px in the ring colour with a 2px gap in the surface colour. */
const focusRing = (surface: Surface) =>
  surface === "paper" ? "ring-2 ring-ring ring-offset-2 ring-offset-white" : "ring-2 ring-white ring-offset-2 ring-offset-night";
const focusVisible = (surface: Surface) =>
  surface === "paper"
    ? "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    : "focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-night";

const liveHover: Record<ButtonVariant, Record<"light" | "dark", string>> = {
  primary: { light: "hover:bg-primary-hover", dark: "hover:bg-primary-hover" },
  secondary: { light: "hover:bg-zinc-50", dark: "hover:bg-white/10" },
  ghost: { light: "hover:bg-zinc-100 hover:text-zinc-900", dark: "hover:bg-white/10" },
  "ghost-destructive": { light: "hover:bg-red-50", dark: "hover:bg-white/10" },
  destructive: { light: "hover:bg-destructive-strong-hover", dark: "hover:bg-destructive-strong-hover" },
  link: { light: "hover:text-red-800", dark: "hover:text-white" },
};

export function button({ variant, size = "md", surface, state = "default", pill = false, fullWidth = false }: {
  variant: ButtonVariant; size?: ButtonSize; surface: Surface; state?: State; pill?: boolean; fullWidth?: boolean;
}) {
  const tone = dark(surface) ? "dark" : "light";
  const [rest, hovered] = buttonLooks[variant][tone];
  return cn(
    buttonBase,
    buttonSizes[size],
    state === "hover" ? hovered : rest,
    state === "focus" && focusRing(surface),
    state === "live" && `${liveHover[variant][tone]} ${focusVisible(surface)}`,
    state === "disabled" && "opacity-50 pointer-events-none",
    pill && "rounded-full",
    fullWidth && "w-full",
  );
}

/** Spinner for loading buttons: replaces the icon, the label stays. */
export const spinner = "size-4 shrink-0 rounded-full border-2 border-current border-r-transparent animate-spin";

// ---------------------------------------------------------------------------------------------------------------
// Form fields

export type FieldState = "default" | "focus" | "filled" | "error" | "disabled" | "live";

export function input({ state = "default", size = "md", surface }: { state?: FieldState; size?: ButtonSize; surface: Surface }) {
  return cn(
    "w-full min-w-0 rounded-lg border bg-white font-sans text-zinc-900 placeholder:text-zinc-500 outline-none transition-colors duration-150",
    size === "sm" ? "h-8 px-3 text-sm" : size === "lg" ? "h-12 px-4 text-lg" : "h-10 px-3 text-base",
    state === "error" ? "border-destructive" : "border-input",
    state === "focus" && `border-primary ${focusRing(surface)}`,
    state === "live" && `focus-visible:border-primary ${focusVisible(surface)}`,
    state === "disabled" && "bg-zinc-50 text-zinc-500 pointer-events-none",
  );
}

export const label = (surface: Surface) => (dark(surface) ? "text-sm font-medium text-zinc-300" : "text-sm font-medium text-zinc-700");
export const help = (surface: Surface) => (dark(surface) ? "text-sm text-zinc-400" : "text-sm text-muted-foreground");
export const error = (surface: Surface) => (dark(surface) ? "text-sm text-red-200" : "text-sm text-destructive");

// ---------------------------------------------------------------------------------------------------------------
// Surfaces, text

export const surfacePanel: Record<Surface, string> = {
  night: "bg-night bg-cover bg-center text-white",
  paper: "bg-zinc-200 bg-cover bg-top text-zinc-900",
  glass: "bg-night bg-cover bg-center text-white",
};

/** Real photo backgrounds from public/ (artwork, so set inline rather than as a token). */
export const surfacePhoto: Record<Surface, string> = {
  night: "/welcome.jpg",
  paper: "/party-background.jpg",
  glass: "/login-garage-door.jpg",
};

/** The card each surface puts its controls on. Night has none: controls sit straight on the photo. */
export const surfaceCard: Record<Surface, string> = {
  night: "",
  paper: "rounded-card bg-white text-zinc-900 shadow-lg",
  glass: "rounded-card border border-white/20 bg-black/90 text-white shadow-md",
};

export const muted = (surface: Surface) => (dark(surface) ? "text-zinc-400" : "text-muted-foreground");
export const onPhoto = (surface: Surface) => (surface === "night" ? "text-shadow-photo" : "");
