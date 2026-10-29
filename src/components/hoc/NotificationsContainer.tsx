import React from "react";
import { Toaster, toast } from "sonner";

import { useTabletUp } from "@/components/hooks/useTabletUp";

// Toasts (docs/ui-kit.md, "Toasts"), on Sonner: one toaster for the whole app, mounted once in AppContainer, above the
// garage door. Top centre on phones, bottom right from tablet up. Each toast has a title, maybe a description and an
// action; its dismiss button shows on hover or focus (on touch, swipe it away). Errors go after 2.5 s, other messages
// after 4 s; reminders (`remind`) stay until dismissed or opened.
//
// Errors are red, info blue, success green, on any page. Reminders follow the surface: dark on the night pages, light
// on the party page (which asks with useToastSurface). From tablet up they clear the signed-in pages' footer while
// it's on screen (useToastsAboveFooter). The look is in src/styles/base.css ("Toasts").

type Surface = "dark" | "light";

let surface: Surface = "dark";
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const setSurface = (next: Surface) => {
  surface = next;
  listeners.forEach(listener => listener());
};

/** Shows toasts on this surface while the calling component is on screen (the default is dark). */
export const useToastSurface = (next: Surface) => {
  React.useEffect(
    () => {
      const previous = surface;
      setSurface(next);
      return () => setSurface(previous);
    },
    [next],
  );
};

/** How much of the footer is on screen, from the bottom, in px (useToastsAboveFooter): toasts sit just above it. */
let footerLift = 0;
const setFooterLift = (px: number) => {
  if (px !== footerLift) {
    footerLift = px;
    listeners.forEach(listener => listener());
  }
};

/**
 * While `active`, toasts clear `footer` (the signed-in pages' footer) by however much of it is on screen: at the very
 * bottom while it's scrolled away, rising with it as it scrolls in. Measured on scroll (any scroller), resize, and when
 * the footer or the page changes size, once a frame at most.
 */
export const useToastsAboveFooter = (active: boolean, footer: React.RefObject<HTMLElement | null>) => {
  React.useEffect(
    () => {
      const element = footer.current;
      if (!active || !element) {
        return;
      }
      let frame = 0;
      const measure = () => {
        frame = 0;
        setFooterLift(Math.max(0, Math.round(window.innerHeight - element.getBoundingClientRect().top)));
      };
      const schedule = () => {
        frame ||= requestAnimationFrame(measure);
      };
      measure();
      const resizes = new ResizeObserver(schedule);
      resizes.observe(element);
      resizes.observe(document.body);
      window.addEventListener("scroll", schedule, { capture: true, passive: true });
      window.addEventListener("resize", schedule);
      return () => {
        cancelAnimationFrame(frame);
        resizes.disconnect();
        window.removeEventListener("scroll", schedule, { capture: true });
        window.removeEventListener("resize", schedule);
        setFooterLift(0);
      };
    },
    [active, footer],
  );
};

/** Toasts' gap to the screen's edges, and to the footer when one is showing. */
const EDGE = 16;

const ERROR_MS = 2500;
const MESSAGE_MS = 4000;

export const NotificationsContainer = () => {
  const current = React.useSyncExternalStore(subscribe, () => surface, () => surface);
  const lift = React.useSyncExternalStore(subscribe, () => footerLift, () => 0);
  const tabletUp = useTabletUp();

  return (
    <Toaster
      theme={current}
      position={tabletUp ? "bottom-right" : "top-center"}
      closeButton
      className="app-toaster"
      // From tablet up, at the bottom right: just above the footer when some of it is on screen, else at the edge.
      offset={{ top: EDGE, right: EDGE, left: EDGE, bottom: EDGE + lift }}
      // On phones, below the status bar (the page draws under it: viewport-fit=cover).
      mobileOffset={{ top: "calc(env(safe-area-inset-top, 0px) + 16px)", left: 16, right: 16, bottom: 16 }}
      visibleToasts={4}
      style={{ zIndex: 10001, fontFamily: '"Cuprum", sans-serif' }}
      toastOptions={{
        classNames: {
          toast: "rounded-lg! text-base! shadow-md!",
          title: "text-base! font-normal!",
          description: "text-sm!",
          actionButton: "rounded-lg! px-3! text-sm! font-medium!",
          error: "bg-red-600! border-red-700! text-white!",
          info: "bg-blue-600! border-blue-600! text-white!",
          success: "bg-green-700! border-green-700! text-white!",
        },
      }}
    />
  );
};

export type Reminder = {
  /** Stable id: showing the same reminder again doesn't add another. */
  id: string;
  /** Beside the text, where the other toasts have their icon: an emoji, or a picture (the reveal's postmark). */
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  action: { label: string; onClick: () => void };
  /** Called when the user dismisses it (not when it's opened or taken away). */
  onDismiss?: () => void;
};

/** Reminders taken away by the app (not by the user), so their `onDismiss` isn't called. */
const forgotten = new Set<string>();

/**
 * A reminder toast: rich (title, description, action), and it stays until the user dismisses or opens it. Laid out as
 * a little card (src/styles/base.css, ".reminder-toast"): the icon on the left, the text beside it, the action under
 * the text.
 */
export const remind = ({ id, icon, title, description, action, onDismiss }: Reminder) => {
  forgotten.delete(id);
  toast(title, {
    id,
    className: "reminder-toast",
    icon: typeof icon === "string" ? <span className="toast-emoji">{icon}</span> : icon,
    description,
    action,
    duration: Infinity,
    onDismiss: () => {
      if (!forgotten.delete(id)) {
        onDismiss?.();
      }
    },
  });
};

/** Takes a reminder away (it was answered in another tab, or its screen closed), without counting as dismissed. */
export const forget = (id: string) => {
  forgotten.add(id);
  toast.dismiss(id);
};

export const useNotifications = () => {
  const error = React.useCallback(
    (message: string) => {
      toast.error(message, { duration: ERROR_MS });
    },
    []
  );

  const success = React.useCallback(
    (message: string) => {
      toast.success(message, { duration: MESSAGE_MS });
    },
    []
  );

  const info = React.useCallback(
    (message: string) => {
      toast.info(message, { duration: MESSAGE_MS });
    },
    []
  );

  return React.useMemo(
    () => ({
      error,
      info,
      success,
    }),
    [
      error,
      info,
      success,
    ],
  );
}
