import React from "react";
import toast, { Toaster } from "react-hot-toast"

export const NotificationsContainer = () => {
  return (
    <Toaster
      toastOptions={{
        error: {
          style: {
            color: 'white',
            textShadow: '0 0 2px rgba(0, 0, 0, 0.3)',
            background: 'rgb(241, 70, 104)',
            maxWidth: '1000px',
          },
          iconTheme: {
            primary: 'white',
            secondary: 'rgb(241, 70, 104)',
          },
        }
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

  return React.useMemo(
    () => ({
      error,
    }),
    [
      error,
    ],
  );
}
