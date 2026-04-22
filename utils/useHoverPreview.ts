import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "spotify_hover_preview_enabled";
const listeners = new Set<(value: boolean) => void>();

function readStored(): boolean {
  if (typeof window === "undefined") return true;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === null ? true : raw === "true";
}

export default function useHoverPreview(): [boolean, (next: boolean) => void] {
  const [enabled, setEnabled] = useState<boolean>(true);

  useEffect(() => {
    setEnabled(readStored());
    const listener = (value: boolean) => setEnabled(value);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const update = useCallback((next: boolean) => {
    window.localStorage.setItem(STORAGE_KEY, String(next));
    listeners.forEach((l) => l(next));
  }, []);

  return [enabled, update];
}
