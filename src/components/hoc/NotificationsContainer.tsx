import React from "react";
import { AlertCircle, CheckCircle } from "react-feather";
import toast, { Toaster } from "react-hot-toast";

// Toasts (docs/ui-kit.md, "Toasts"): one toaster for the whole app, mounted once in AppContainer, above the garage
// door. They follow the surface: dark on the night pages, light on the party page (which asks with useToastSurface).

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

const looks = {
  dark: { background: "#18181b", color: "#fff", border: "rgb(255 255 255 / 0.15)", error: "#f6c6c7", success: "#acdcbf" },
  light: { background: "#fff", color: "#18181b", border: "#e4e4e7", error: "#a8222a", success: "#257942" },
};

export const NotificationsContainer = () => {
  const current = React.useSyncExternalStore(subscribe, () => surface, () => surface);
  const look = looks[current];

  return (
    <Toaster
      position="top-center"
      containerStyle={{ inset: 16, zIndex: 10001 }}
      toastOptions={{
        style: {
          maxWidth: "min(560px, calc(100vw - 32px))",
          padding: "12px 16px",
          borderRadius: 8,
          border: `1px solid ${look.border}`,
          background: look.background,
          color: look.color,
          boxShadow: "0 8px 20px rgb(0 0 0 / 0.25)",
          fontFamily: "inherit",
          fontSize: 18,
          lineHeight: "28px",
          overflowWrap: "anywhere",
        },
        error: {
          icon: <AlertCircle size={20} color={look.error} aria-hidden="true" style={{ flex: "none" }} />,
          duration: 5000,
        },
        success: {
          icon: <CheckCircle size={20} color={look.success} aria-hidden="true" style={{ flex: "none" }} />,
          duration: 10000,
        },
      }}
    />
  );
}

export const useNotifications = () => {
  const error = React.useCallback(
    (message: string) => {
      toast.error(message);
    },
    []
  );

  const success = React.useCallback(
    (message: string) => {
      toast.success(message);
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
