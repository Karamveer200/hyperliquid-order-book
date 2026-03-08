import { useState, useEffect, useCallback, useRef } from 'react';

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
  const [state, setState] = useState(initialValue);

  const initialRenderRef = useRef(0);

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

  useEffect(() => {
    if (getLocalStorageItem(key) === null && initialValue !== undefined) {
      setLocalStorageItem(key, initialValue);
    }
  }, [key, initialValue]);

  useEffect(() => {
    if (key && initialRenderRef.current === 0) {
      // This block is used to support dynamic keys, for ex - an id from an api call
      // Initially key is null, due to which state becomes initialValue and then never
      // gets auto-updated from getLocalStorageItem(key)
      // Once key is valid, then this snippet tries to update the state if its null

      // Dont add (!state) in the if statement above as the initialValue can be {true}
      // due to which the state never gets auto updated until setState is called explicitly

      initialRenderRef.current++;

      setState(() => {
        const storedValue = getLocalStorageItem(key);

        return storedValue ? JSON.parse(storedValue) : initialValue;
      });
    }
  }, [key, initialValue]);

  return [state, setLocalState];
};

export const LOCAL_STORAGE_KEYS = {};
