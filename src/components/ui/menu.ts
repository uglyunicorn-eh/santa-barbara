// Classes for Base UI menus (`@base-ui/react/menu`), so every menu looks the same: the footer's ☰ and the party's
// actions. Menus open above their button (`side="top"` on the positioner).

/** The positioner: above everything, including the garage door (z-index 9999). */
export const menuPositionerClass = "z-10000";

/** The menu card: white on any background, with a short open and close animation. */
export const menuPopupClass =
  "min-w-48 origin-(--transform-origin) rounded-lg border border-border bg-white py-1 text-left font-sans text-base shadow-lg outline-none transition-[opacity,scale] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0";

/** An item (overrides the footer's white, shadowed link styles when it's a link). */
export const menuItemClass =
  "flex w-full cursor-pointer flex-row items-center justify-start gap-2 px-4 py-2 text-zinc-900 no-underline [text-shadow:none] outline-none select-none hover:bg-zinc-100 hover:text-zinc-900 hover:no-underline focus-visible:bg-zinc-100 data-highlighted:bg-zinc-100 data-highlighted:text-zinc-900";

/** A delete item: red, never filled. */
export const menuItemDestructiveClass =
  "text-destructive hover:bg-red-50 hover:text-destructive data-highlighted:bg-red-50 data-highlighted:text-destructive";
