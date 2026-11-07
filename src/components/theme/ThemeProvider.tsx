"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type ThemeMode = "light" | "dark" | "system";
const key = "capitulando:theme";
const eventName = "capitulando:theme-changed";
let memoryTheme: ThemeMode | null = null;
function readTheme(): ThemeMode {
  if (memoryTheme) return memoryTheme;
  try {
    const stored = localStorage.getItem(key);
    if (stored === "light" || stored === "dark" || stored === "system")
      return stored;
  } catch {
    /* The in-memory preference still works when storage is unavailable. */
  }
  return "system";
}
function snapshot() {
  return `${readTheme()}:${window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"}`;
}
function subscribe(listener: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onStorage = (event: StorageEvent) => {
    if (event.key === key || event.key === null) {
      memoryTheme = null;
      listener();
    }
  };
  window.addEventListener(eventName, listener);
  window.addEventListener("storage", onStorage);
  media.addEventListener("change", listener);
  return () => {
    window.removeEventListener(eventName, listener);
    window.removeEventListener("storage", onStorage);
    media.removeEventListener("change", listener);
  };
}
function setTheme(theme: ThemeMode) {
  memoryTheme = theme;
  try {
    localStorage.setItem(key, theme);
  } catch {
    /* Keep the choice for this session. */
  }
  window.dispatchEvent(new Event(eventName));
}
interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  setTheme: typeof setTheme;
}
const Context = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = useSyncExternalStore(subscribe, snapshot, () => "system:light");
  const [theme, system] = value.split(":") as [ThemeMode, "light" | "dark"];
  const resolvedTheme = theme === "system" ? system : theme;
  useEffect(() => {
    // Read the current browser preference even during the first hydration effect.
    const [choice, systemTheme] = snapshot().split(":");
    document.documentElement.classList.toggle(
      "dark",
      choice === "dark" || (choice === "system" && systemTheme === "dark"),
    );
  }, [value]);
  return (
    <Context.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </Context.Provider>
  );
}

export function useTheme() {
  const context = useContext(Context);
  if (!context) throw new Error("ThemeProvider não encontrado.");
  return context;
}
