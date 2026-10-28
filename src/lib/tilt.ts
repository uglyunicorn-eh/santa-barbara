import type React from "react";

/**
 * A card under the mouse tilts as if pressed where the pointer is: that side dips away from the viewer. These set
 * --tilt-x and --tilt-y on the element as the pointer moves, up to `degrees` at its edges, and clear them when it
 * leaves; the element's styles turn them into a transform (the landing's step cards, the home screen's tickets).
 * Touch and pen are left alone.
 */
export const tiltHandlers = (degrees: number) => ({
  onPointerMove: (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse") {
      return;
    }
    const card = event.currentTarget;
    const box = card.getBoundingClientRect();
    // -0.5 at the left or top edge, 0.5 at the right or bottom.
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    card.style.setProperty("--tilt-x", `${(-y * 2 * degrees).toFixed(2)}deg`);
    card.style.setProperty("--tilt-y", `${(x * 2 * degrees).toFixed(2)}deg`);
  },
  onPointerLeave: (event: React.PointerEvent<HTMLElement>) => {
    event.currentTarget.style.removeProperty("--tilt-x");
    event.currentTarget.style.removeProperty("--tilt-y");
  },
});
