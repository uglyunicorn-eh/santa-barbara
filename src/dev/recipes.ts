// Helpers for the UI kit page. Buttons are the real component now (src/components/ui/button.tsx); the field recipes
// below are still prototypes from docs/design-spec.md until Phase 4.2 builds the real form fields.
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

export type ButtonVariant = "brand" | "primary" | "secondary" | "ghost" | "ghost-destructive" | "destructive" | "link";
export type ButtonSize = "sm" | "md" | "lg";

export const BUTTON_VARIANTS: { id: ButtonVariant; name: string; use: string }[] = [
  { id: "brand", name: "brand", use: "A hero screen's main action" },
  { id: "primary", name: "primary", use: "A content screen's main action" },
  { id: "secondary", name: "secondary", use: "Dismiss, cancel, show more" },
  { id: "ghost", name: "ghost", use: "Quiet actions in rows: Change, Cancel" },
  { id: "ghost-destructive", name: "ghost + destructive", use: "Delete actions, until the final confirm" },
  { id: "destructive", name: "destructive", use: "Only the final confirm of a delete" },
  { id: "link", name: "link", use: "Links in copy" },
];

/** The real Button's surface for a kit surface: glass and night are both "dark". */
export const toneOf = (surface: Surface) => (surface === "paper" ? "light" : "dark");

/**
 * Classes that force a state the kit can't trigger without a mouse or keyboard: the hovered look (the same colours as
 * the Button's `hover:` classes) or the focus ring (its `focus-visible:` ring).
 */
const hovered: Record<ButtonVariant, Record<"light" | "dark", string>> = {
  brand: { light: "bg-brand-hover", dark: "bg-brand-hover" },
  primary: { light: "bg-primary-hover", dark: "bg-primary-hover" },
  secondary: { light: "bg-zinc-50", dark: "bg-white/10" },
  ghost: { light: "bg-zinc-100 text-zinc-900", dark: "bg-white/10" },
  "ghost-destructive": { light: "bg-red-50", dark: "bg-white/10" },
  destructive: { light: "bg-destructive-strong-hover", dark: "bg-destructive-strong-hover" },
  link: { light: "text-teal-900", dark: "text-white" },
};

/** The focus ring: 2px in the ring colour with a 2px gap in the surface colour. */
const focusRing = (surface: Surface) =>
  surface === "paper" ? "ring-2 ring-ring ring-offset-2 ring-offset-white" : "ring-2 ring-white ring-offset-2 ring-offset-night";
const focusVisible = (surface: Surface) =>
  surface === "paper"
    ? "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    : "focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-night";

export const forced = (variant: ButtonVariant, surface: Surface, state: State) =>
  state === "hover" ? hovered[variant][toneOf(surface)] : state === "focus" ? focusRing(surface) : "";

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
