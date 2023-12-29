import React from "react";

type SignalHandler<T> = (event: CustomEvent<T>) => void;

export const useSignals = () => {
  const subscribe = React.useCallback(
    function <T extends any = undefined>(signal: string, handler: SignalHandler<T>) {
      window.addEventListener(`signal:${signal}`, handler as any);

      return () => {
        window.removeEventListener(`signal:${signal}`, handler as any);
      };
    },
    [],
  );

  const signal = React.useCallback(
    function <T extends any = undefined>(signal: string, payload?: T) {
      window.dispatchEvent(new CustomEvent(`signal:${signal}`, { detail: payload }));
    },
    [],
  );

  return React.useMemo(
    () => ({
      subscribe,
      signal,
    }),
    [
      subscribe,
      signal,
    ],
  );
};
