import React from "react";

const readStoredValue = (key: string) => {
  const storedValue = localStorage.getItem(key);

  if (storedValue) {
    return JSON.parse(storedValue);
  }
};

const writeStoredValue = (key: string, value: any) => {
  if (value !== undefined) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  else {
    localStorage.removeItem(key);
  }
};

export const useLocalStorage = function <T>(key: string) {
  const [value, setValue] = React.useState<T | undefined>(readStoredValue(key));

  React.useEffect(
    () => {
      const handleStorage = (event: StorageEvent) => {
        if (event.key === key) {
          setValue(readStoredValue(key));
        }
      };

      addEventListener('storage', handleStorage);

      return () => window.removeEventListener('storage', handleStorage);
    },
    [
      key,
    ],
  )

  const setStoredValue = React.useCallback(
    (newValue?: T) => {
      writeStoredValue(key, newValue);
      setValue(newValue);
      window.dispatchEvent(new StorageEvent('storage', { key }));
    },
    [
      key,
    ],
  );

  return [value, setStoredValue] as const;
};
