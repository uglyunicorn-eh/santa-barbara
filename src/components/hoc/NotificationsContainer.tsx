import React from "react";
import { Toaster, toast } from "sonner";

// Toasts (docs/ui-kit.md, "Toasts"), on Sonner: one toaster for the whole app, mounted once in AppContainer, above the
// garage door. Each toast has a title, maybe a description and an action, and a dismiss button. Errors go after
// 2.5 s, other messages after 4 s; reminders (`remind`) stay until dismissed or opened.
//
// They follow the surface: dark on the night pages, light on the party page (which asks with useToastSurface).

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

const ERROR_MS = 2500;
const MESSAGE_MS = 4000;

export const NotificationsContainer = () => {
  const current = React.useSyncExternalStore(subscribe, () => surface, () => surface);

  return (
    <Toaster
      theme={current}
      position="top-center"
      closeButton
      offset={16}
      mobileOffset={16}
      visibleToasts={4}
      style={{ zIndex: 10001, fontFamily: '"Cuprum", sans-serif' }}
      toastOptions={{
        classNames: {
          toast: "rounded-lg! text-base! shadow-md!",
          title: "text-base! font-semibold!",
          description: "text-sm!",
          actionButton: "rounded-lg! px-3! text-sm! font-medium!",
        },
      }}
    />
  );
};

export type Reminder = {
  /** Stable id: showing the same reminder again doesn't add another. */
  id: string;
  title: string;
  description?: React.ReactNode;
  action: { label: string; onClick: () => void };
  /** Called when the user dismisses it (not when it's opened or taken away). */
  onDismiss?: () => void;
};

/** Reminders taken away by the app (not by the user), so their `onDismiss` isn't called. */
const forgotten = new Set<string>();

/** A reminder toast: rich (title, description, action), and it stays until the user dismisses or opens it. */
export const remind = ({ id, title, description, action, onDismiss }: Reminder) => {
  forgotten.delete(id);
  toast(title, {
    id,
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

  return React.useMemo(
    () => ({
      error,
      success,
    }),
    [
      error,
      success,
    ],
  );
}
