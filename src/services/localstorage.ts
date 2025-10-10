import { Dispatch, SetStateAction, useCallback, useState, useRef, useLayoutEffect } from 'react';

const EXPIRE_LIMIT_MS = 24 * 3600 * 1000; // 1 day

export const LOCAL_HIDE_ALERT_RETRY = 'local-hide-alert-retry';
export const LOCAL_ACCOUNTS = 'local-accounts';
export const LOCAL_CLIST_APIKEY = 'local-clist-apikey';
export const LOCAL_LEETCODE_COOKIE = 'local-leetcode-cookie';
export const LOCAL_STATISTICS_STRATEGY = 'local-statistics-strategy';

export enum StatisticsStrategy {
    NetworkFirst = 'network-first',
    CacheFirst = 'cache-first',
    CacheFirstIfNonEmpty = 'cache-first-if-nonempty',
};

export function isCacheExpired(key: string) {
    const value = localStorage.getItem(key);
    if (!value) return true;

    const a = (new Date()).getTime();
    const b = (new Date(value)).getTime();
    return a - b > EXPIRE_LIMIT_MS;
}
export function touchCache(key: string) {
    localStorage.setItem(key, (new Date()).toString());
}

export function loadLocalObject(key: string, path?: string) {
    try {
        const obj = JSON.parse(localStorage.getItem(key) || '');
        return path ? obj[path] : obj;
    } catch (e) {
        return null;
    }
}
export function saveLocalObject(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
}

// modified from https://github.com/streamich/react-use/blob/master/src/useLocalStorage.ts
type parserOptions<T> =
  | {
      raw: true;
    }
  | {
    raw: false;
    serializer: (value: T) => string;
    deserializer: (value: string) => T;
};
export const useLocalStorage = <T>(
  key: string,
  initialValue?: T,
  options?: parserOptions<T>
): [T | undefined, Dispatch<SetStateAction<T | undefined>>, () => void] => {
  if (!key) {
    throw new Error('useLocalStorage key may not be falsy');
  }

  const deserializer = options
    ? options.raw
      ? (value: any) => value
      : options.deserializer
    : JSON.parse;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const initializer = useRef((key: string) => {
    try {
      const serializer = options ? (options.raw ? String : options.serializer) : JSON.stringify;

      const localStorageValue = localStorage.getItem(key);
      if (localStorageValue !== null) {
        return deserializer(localStorageValue);
      } else {
        initialValue && localStorage.setItem(key, serializer(initialValue));
        return initialValue;
      }
    } catch {
      // If user is in private mode or has storage restriction
      // localStorage can throw. JSON.parse and JSON.stringify
      // can throw, too.
      return initialValue;
    }
  });

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [state, setState] = useState<T | undefined>(() => initializer.current(key));

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useLayoutEffect(() => setState(initializer.current(key)), [key]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const set: Dispatch<SetStateAction<T | undefined>> = useCallback(
    (valOrFunc) => {
      try {
        const newState =
          typeof valOrFunc === 'function' ? (valOrFunc as Function)(state) : valOrFunc;
        if (typeof newState === 'undefined') return;
        let value: string;

        if (options)
          if (options.raw)
            if (typeof newState === 'string') value = newState;
            else value = JSON.stringify(newState);
          else if (options.serializer) value = options.serializer(newState);
          else value = JSON.stringify(newState);
        else value = JSON.stringify(newState);

        localStorage.setItem(key, value);
        setState(deserializer(value));
      } catch {
        // If user is in private mode or has storage restriction
        // localStorage can throw. Also JSON.stringify can throw.
      }
    },
    [key, setState]
  );

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const remove = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setState(undefined);
    } catch {
      // If user is in private mode or has storage restriction
      // localStorage can throw.
    }
  }, [key, setState]);

  return [state, set, remove];
};
