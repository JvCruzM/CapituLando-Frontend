import type { ReactNode } from "react";
import { Brand } from "./Brand";
import { ThemeControl } from "./theme/ThemeControl";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f3ccde] text-stone-800 dark:bg-[#120e17] dark:text-stone-100">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#4b1d3f]/15 px-5 py-3 dark:border-[#382b47] sm:px-8">
        <Brand />
        <ThemeControl />
      </header>
      {children}
    </div>
  );
}
