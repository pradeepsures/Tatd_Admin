import { useEffect, useState } from "react";

/** Keep list controls for the current route while navigating to details and back. */
export default function useAdminListState(name, initialValue) {
  const storageKey = `admin:list:${window.location.pathname}:${name}`;
  const [value, setValue] = useState(() => {
    try {
      const saved = window.sessionStorage.getItem(storageKey);
      return saved === null ? initialValue : JSON.parse(saved);
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // Keep the list usable when browser storage is unavailable or full.
    }
  }, [storageKey, value]);

  return [value, setValue];
}
