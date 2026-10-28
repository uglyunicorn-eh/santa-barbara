import React from "react";
import { Toaster, toast } from "sonner";

import { useTabletUp } from "@/components/hooks/useTabletUp";

// Toasts (docs/ui-kit.md, "Toasts"), on Sonner: one toaster for the whole app, mounted once in AppContainer, above the
// garage door. Top centre on phones, bottom right from tablet up. Each toast has a title, maybe a description and an
// action; its dismiss button shows on hover or focus (on touch, swipe it away). Errors go after 2.5 s, other messages
// after 4 s; reminders (`remind`) stay until dismissed or opened.
//
// Errors are red, info blue, success green, on any page. Reminders follow the surface: dark on the night pages, light
// on the party page (which asks with useToastSurface). The look is in src/styles/base.css ("Toasts").

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

/** How far above the bottom toasts sit on the light party page: clear of its footer (three lines and its padding). */
const LIGHT_PAGE_BOTTOM = 96;

const ERROR_MS = 2500;
const MESSAGE_MS = 4000;

export const NotificationsContainer = () => {
  const current = React.useSyncExternalStore(subscribe, () => surface, () => surface);
  const tabletUp = useTabletUp();

  return (
    <Toaster
      theme={current}
      position={tabletUp ? "bottom-right" : "top-center"}
      closeButton
      className="app-toaster"
      // On the light party page, from tablet up, above the footer's links and credits (bottom right, like the toasts).
      offset={current === "light" ? { top: 16, right: 16, left: 16, bottom: LIGHT_PAGE_BOTTOM } : 16}
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
  /** An emoji shown beside the title, where the other toasts have their icon. */
  icon?: string;
  title: string;
  description?: React.ReactNode;
  action: { label: string; onClick: () => void };
  /** Called when the user dismisses it (not when it's opened or taken away). */
  onDismiss?: () => void;
};

/** Reminders taken away by the app (not by the user), so their `onDismiss` isn't called. */
const forgotten = new Set<string>();

/** A reminder toast: rich (title, description, action), and it stays until the user dismisses or opens it. */
export const remind = ({ id, icon, title, description, action, onDismiss }: Reminder) => {
  forgotten.delete(id);
  toast(title, {
    id,
    icon: icon && <span className="toast-emoji">{icon}</span>,
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
