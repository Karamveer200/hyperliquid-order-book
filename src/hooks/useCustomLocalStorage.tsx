import { useState, useEffect, useCallback } from 'react';

// This lets other tabs know when localStorage changes
const dispatchStorageEvent = (key: string, newValue: string | null) => {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new StorageEvent('storage', { key, newValue }));
};

const setLocalStorageItem = (key: string, value: any) => {
  if (!key) return;

  const stringifiedValue = JSON.stringify(value);
  localStorage.setItem(key, stringifiedValue);
  dispatchStorageEvent(key, stringifiedValue);
};

const removeLocalStorageItem = (key: string) => {
  if (typeof window === 'undefined' || !key) return null;

  localStorage.removeItem(key);
  dispatchStorageEvent(key, null);
};

const getLocalStorageItem = (key: string) => {
  if (typeof window === 'undefined' || !key) return null;

  return localStorage.getItem(key);
};

export const useCustomLocalStorage = (
  key: string,
  initialValue: any | null = null
) => {
  const [state, setState] = useState(() => {
    if (typeof window === 'undefined') return initialValue;
    const stored = getLocalStorageItem(key);
    if (stored !== null && stored !== undefined) {
      try {
        return JSON.parse(stored);
      } catch {
        return initialValue;
      }
    }
    setLocalStorageItem(key, initialValue);
    return initialValue;
  });

  const setLocalState = useCallback(
    (value: any) => {
      try {
        const nextState = typeof value === 'function' ? value(state) : value;
        nextState === null
          ? removeLocalStorageItem(key)
          : setLocalStorageItem(key, nextState);
        setState(nextState);
      } catch (e) {
        console.warn(e);
      }
    },
    [key, state]
  );

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        setState(e.newValue ? JSON.parse(e.newValue) : initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]);

  return [state, setLocalState];
};

export const LOCAL_STORAGE_KEYS = {
  ORDER_BOOK_SYMBOL: 'orderBook_symbol',
  ORDER_BOOK_PRECISION: 'orderBook_precision',
} as const;
