import React from "react";

export const useLocalStorage = function <T>(key: string) {
  const [value, setValue] = React.useState<T | undefined>(undefined);

  const readStoredValue = React.useCallback(
    () => {
      const storedValue = localStorage.getItem(key);

      if (storedValue) {
        setValue(JSON.parse(storedValue));
      }
    },
    [key],
  );

  React.useEffect(
    () => readStoredValue(),
    [
      readStoredValue,
    ],
  );

  React.useEffect(
    () => {
      console.log('useLocalStorage', { key, value })
      const handleStorage = (event: StorageEvent) => {
        console.log({ event })
        if (event.key === key) {
          readStoredValue();
        }
      };

      window.addEventListener('storage', handleStorage);

      return () => window.removeEventListener('storage', handleStorage);
    },
    [
      key,
      readStoredValue,
    ],
  )

  const setStoredValue = React.useCallback(
    (newValue?: T) => {
      if (newValue !== undefined) {
        localStorage.setItem(key, JSON.stringify(newValue));
      }
      else {
        localStorage.removeItem(key);
      }
      setValue(newValue);
    },
    [key],
  );

  return [value, setStoredValue] as const;
};
