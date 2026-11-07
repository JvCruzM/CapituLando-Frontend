"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type ThemeMode } from "./ThemeProvider";

export function ThemeControl() {
  const { theme, setTheme } = useTheme();
  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  return (
    <label className="inline-flex items-center gap-2 rounded-xl border border-[#4b1d3f]/20 bg-[#fcf8f2] px-3 py-2 text-xs font-bold text-[#4b1d3f] dark:border-[#382b47] dark:bg-[#221a2b] dark:text-pink-100">
      <Icon size={16} aria-hidden="true" />
      <span className="sr-only">Tema de aparência</span>
      <select
        value={theme}
        onChange={(event) => setTheme(event.target.value as ThemeMode)}
        className="cursor-pointer rounded-md bg-transparent text-xs font-bold"
      >
        <option value="system">Sistema</option>
        <option value="light">Claro</option>
        <option value="dark">Escuro</option>
      </select>
    </label>
  );
}
