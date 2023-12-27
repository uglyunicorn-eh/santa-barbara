import React from "react";
import toast, { Toaster } from "react-hot-toast"

export const NotificationsContainer = () => {
  return (
    <Toaster
      containerStyle={{
        inset: "20px 10px",
        fontSize: "1.25em",
      }}
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
        },
        success: {
          style: {
            color: 'white',
            textShadow: '0 0 2px rgba(0, 0, 0, 0.3)',
            background: '#548ccb',
            maxWidth: '1000px',
          },
          iconTheme: {
            primary: 'white',
            secondary: '#548ccb',
          },
          duration: 10000,
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
