import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Buttons from docs/design-spec.md §5 (shadcn's Base UI button, with our variants). The UI kit (/ui-kit in dev)
// shows every variant in every state.
//
// `surface` is what the button sits on: "light" (white cards, the light party page) or "dark" (night photos and
// glass panels). Only secondary, ghost and link look different on dark.

const buttonVariants = cva(
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
        /** The one main action on a screen. */
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
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
      /** Fully rounded: only for the main action on a hero screen. */
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
      { variant: ["primary", "destructive"], surface: "dark", class: "shadow-sm" },
      { variant: "link", class: "min-h-0 p-0" },
      { variant: "link", surface: "light", class: "text-link hover:text-red-800" },
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

type ButtonProps = ButtonPrimitive.Props & VariantProps<typeof buttonVariants> & {
  /** Busy: a spinner before the label, the width stays, and it can't be pressed. */
  loading?: boolean;
};

function Button({ className, variant, size, surface, pill, fullWidth, loading = false, disabled, children, ...props }: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, surface, pill, fullWidth }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <span className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />}
      {children}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants, type ButtonProps };
