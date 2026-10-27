// Helpers for the UI kit page, which shows the real components (Button, Input, the toaster). These add the looks the
// kit can't trigger without a mouse or keyboard (hover, focus), and the surfaces it shows them on.

import type { ButtonProps } from "@/components/ui/button";

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

/** Taken from the real Button, so the kit can't list a variant or size the component doesn't have. */
export type ButtonVariant = NonNullable<ButtonProps["variant"]>;
export type ButtonSize = NonNullable<ButtonProps["size"]>;

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

/** The focus ring: 2px in the ring colour (red for red buttons on paper) with a 2px gap in the surface colour. */
const focusRing = (surface: Surface, variant?: ButtonVariant) =>
  surface !== "paper"
    ? "ring-2 ring-white ring-offset-2 ring-offset-night"
    : variant === "brand"
      ? "ring-2 ring-brand ring-offset-2 ring-offset-white"
      : variant === "destructive" || variant === "ghost-destructive"
        ? "ring-2 ring-destructive ring-offset-2 ring-offset-white"
        : "ring-2 ring-ring ring-offset-2 ring-offset-white";
export const forced = (variant: ButtonVariant, surface: Surface, state: State) =>
  state === "hover" ? hovered[variant][toneOf(surface)] : state === "focus" ? focusRing(surface, variant) : "";

// ---------------------------------------------------------------------------------------------------------------
// Form fields

export type FieldState = "default" | "focus" | "filled" | "error" | "disabled" | "live";

/** The focus look of the real Input (its `focus-visible:` border and ring), forced for the kit's "focus" sample. */
export const fieldFocus = (surface: Surface) => `${dark(surface) ? "border-white" : "border-ring"} ${focusRing(surface)}`;

// Labels and notes, as FormField draws them.
export const label = (surface: Surface) => (dark(surface) ? "text-base font-semibold text-zinc-300" : "text-base font-semibold text-zinc-700");
export const help = (surface: Surface) => (dark(surface) ? "text-sm text-zinc-300" : "text-sm text-muted-foreground");
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
  glass: "/login-garage-door.webp",
};

/** The card each surface puts its controls on. Night has none: controls sit straight on the photo. */
export const surfaceCard: Record<Surface, string> = {
  night: "",
  paper: "rounded-card bg-white text-zinc-900 shadow-lg",
  glass: "rounded-card border border-white/20 bg-black/90 text-white shadow-md",
};

export const muted = (surface: Surface) => (dark(surface) ? "text-zinc-400" : "text-muted-foreground");
export const onPhoto = (surface: Surface) => (surface === "night" ? "text-shadow-photo" : "");
