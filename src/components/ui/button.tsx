import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Buttons from docs/ui-kit.md (shadcn's Base UI button, with our variants). The UI kit (/ui-kit in dev) shows every
// variant in every state.
//
// `surface` is what the button sits on: "light" (white cards, the light party page) or "dark" (night photos and
// glass panels). Only secondary, ghost and link look different on dark.
//
// Which shape and size where, so the same kind of button looks the same everywhere:
// - Hero screens (sign-in, join, the sign-in link page, the account links, party not found, 404): the main action is
//   `brand` (red) `lg` `pill`; going home or back is `secondary` `pill` (md).
// - Content screens (party pages, dialogs, the profile, knowledge pages): the main action is `primary` (turquoise);
//   no pill, `md`; `sm` only in the profile's setting rows. Delete actions are `ghost-destructive` until the final
//   confirm, which is `destructive`. Red on a content screen means danger.

const variants = cva(
  [
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-transparent",
    // No nowrap: a label too long for the screen wraps instead of overflowing (sizes are minimum heights).
    "text-center font-sans font-medium select-none outline-none transition-colors duration-150",
    "focus-visible:ring-2 focus-visible:ring-offset-2",
    // Disabled fades; busy (loading) is disabled too, so it can't be pressed twice, but keeps its colour.
    "disabled:pointer-events-none disabled:not-aria-busy:opacity-50 aria-busy:pointer-events-none",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        /** The one main action on a content screen: turquoise with a dark label. */
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
        /** The main action on a hero screen: the brand red. */
        brand: "bg-brand text-brand-foreground hover:bg-brand-hover",
        /** Dismiss, cancel, show more. */
        secondary: "",
        /** Quiet actions in rows: Change, Cancel. */
        ghost: "",
        /** Delete actions, until the final confirm. */
        "ghost-destructive": "",
        /** Only the final confirm of a delete. */
        destructive: "bg-destructive-strong text-white hover:bg-destructive-strong-hover",
        /** Links in copy. */
        link: "underline underline-offset-4",
      },
      // One line is exactly 32 / 40 / 48px: line height + vertical padding + the 1px borders. Longer labels wrap.
      size: {
        sm: "min-h-8 px-3 py-1 text-sm",
        md: "min-h-10 px-4 py-1.25 text-base",
        lg: "min-h-12 px-5 py-2.25 text-lg",
      },
      surface: {
        light: "focus-visible:ring-ring focus-visible:ring-offset-white",
        dark: "focus-visible:ring-white focus-visible:ring-offset-night",
      },
      /** Fully rounded: only on hero screens (their main action, and going home or back). */
      pill: { true: "rounded-full", false: "" },
      fullWidth: { true: "w-full", false: "" },
    },
    compoundVariants: [
      { variant: "secondary", surface: "light", class: "border-input bg-white text-zinc-900 hover:bg-zinc-50" },
      { variant: "secondary", surface: "dark", class: "border-white/40 bg-transparent text-white hover:bg-white/10" },
      { variant: "ghost", surface: "light", class: "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900" },
      { variant: "ghost", surface: "dark", class: "text-white hover:bg-white/10" },
      { variant: "ghost-destructive", surface: "light", class: "text-destructive hover:bg-red-50" },
      { variant: "ghost-destructive", surface: "dark", class: "text-red-200 hover:bg-white/10" },
      // On light, red buttons get a red focus ring like the button, not the usual teal.
      { variant: "brand", surface: "light", class: "focus-visible:ring-brand" },
      { variant: ["destructive", "ghost-destructive"], surface: "light", class: "focus-visible:ring-destructive" },
      { variant: ["primary", "brand", "destructive"], surface: "dark", class: "shadow-sm" },
      // The busy beam (src/styles/tailwind.css): white over a fill; teal on white, where a dark label's colour would
      // look like a smudge rather than a glow. Elsewhere it's the label's colour.
      { variant: ["primary", "brand", "destructive"], class: "[--busy-beam-color:var(--color-white)]" },
      { variant: ["secondary", "ghost"], surface: "light", class: "[--busy-beam-color:var(--color-teal-500)]" },
      // Sits inside a sentence: inline, with the sentence's size and line height.
      { variant: "link", class: "inline min-h-0 rounded-sm p-0 text-[length:inherit] leading-[inherit] select-auto" },
      { variant: "link", surface: "light", class: "text-link hover:text-teal-900" },
      { variant: "link", surface: "dark", class: "text-zinc-100 hover:text-white" },
    ],
    defaultVariants: {
      variant: "secondary",
      size: "md",
      surface: "light",
      pill: false,
      fullWidth: false,
    },
  },
);

/** The button's classes, merged so a variant's overrides win: also for links styled as buttons (`<a className=…>`). */
const buttonVariants = (props?: Parameters<typeof variants>[0]) => cn(variants(props));

type ButtonProps = ButtonPrimitive.Props & VariantProps<typeof variants> & {
  /** Busy: the label dims and a glowing beam runs around the edge (src/styles/tailwind.css); same size, can't be pressed. */
  loading?: boolean;
};

function Button({ className, variant, size, surface, pill, fullWidth, loading = false, disabled, children, ...props }: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, surface, pill, fullWidth }), loading && "relative", className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {/* The label lays out as before (no box of its own until busy), so the button keeps its size either way. */}
      <span className={loading ? "inline-flex items-center justify-center gap-2 opacity-40" : "contents"}>{children}</span>
      {loading && (
        <span className="busy-beam" aria-hidden="true">
          <span className="busy-beam-ring" />
        </span>
      )}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants, type ButtonProps };
