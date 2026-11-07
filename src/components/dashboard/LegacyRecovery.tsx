"use client";
import { useState } from "react";
import { ArchiveRestore, Download } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { createStory, saveChapter, type Story } from "@/lib/writing-api";
import { useWorkspaceSection, useWorkspaceSync } from "./WorkspaceProvider";
type LegacyRecord = { id: string; projectId?: string; [key: string]: unknown };
export function LegacyRecovery() {
  const [goals, setGoals] = useWorkspaceSection<LegacyRecord[]>("goals", []);
  const [ideas, setIdeas] = useWorkspaceSection<LegacyRecord[]>("ideas", []);
  const [concepts, setConcepts] = useWorkspaceSection<LegacyRecord[]>(
    "concepts",
    [],
  );
  const [events, setEvents] = useWorkspaceSection<LegacyRecord[]>("events", []);
  const flush = useWorkspaceSync();
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const [available] = useState(() =>
    ["projects", "goals", "ideas", "universe_concepts", "timeline_events"].some(
      (key) => localStorage.getItem(`capitulando_${key}`),
    ),
  );
  if (!available) return null;
  return (
    <section className="rounded-3xl border-2 border-[#4b1d3f]/20 dark:border-[#382b47] bg-[#fcf8f2] dark:bg-[#1a1321] p-5 sm:p-6 shadow-sm space-y-5 text-stone-800 dark:text-stone-200">
      <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-[#4b1d3f] dark:text-pink-200">
        <ArchiveRestore size={20} />
        Recuperar dados da versão antiga
      </h3>
      <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-300">
        Há dados antigos neste navegador sem identificação de conta. Eles só
        serão importados se você confirmar que pertencem a você.
      </p>
      {message && (
        <p
          role="status"
          className="rounded-2xl bg-[#f3ccde]/40 dark:bg-[#221a2b] p-4 text-sm"
        >
          {message}
        </p>
      )}
      <button
        disabled={busy}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4b1d3f] hover:bg-[#38142f] dark:bg-pink-800 dark:hover:bg-pink-900 px-4 py-3 text-xs font-bold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
        onClick={async () => {
          if (
            !confirm(
              "Confirmo que os dados antigos deste navegador pertencem a mim e desejo copiá-los para esta conta.",
            )
          )
            return;
          setBusy(true);
          setMessage("");
          try {
            const read = (key: string): LegacyRecord[] => {
              const value = JSON.parse(
                localStorage.getItem(`capitulando_${key}`) || "[]",
              );
              if (
                !Array.isArray(value) ||
                value.some((row) => !row || typeof row !== "object")
              )
                throw new Error(
                  "Dados antigos inválidos. A cópia original foi preservada.",
                );
              return value;
            };
            const existing = await apiRequest<Story[]>("/stories"),
              mapping = new Map(existing.map((story) => [story.id, story.id]));
            for (const old of read("projects")) {
              let story = existing.find((story) => story.title === old.title);
              if (!story)
                story = await createStory({
                  title: String(old.title || "Livro recuperado"),
                  genre: String(old.genre || "Geral"),
                  description: String(old.description || ""),
                });
              mapping.set(String(old.id), story.id);
              for (const kind of ["chapters", "drafts"] as const) {
                const chapters = Array.isArray(old[kind])
                  ? (old[kind] as LegacyRecord[])
                  : [];
                for (const chapter of chapters)
                  await saveChapter(story.id, {
                    title: String(chapter.title || "Texto recuperado"),
                    content: String(chapter.content || ""),
                    status: kind === "drafts" ? "DRAFT" : "IN_REVIEW",
                  });
              }
            }
            const attach = (items: LegacyRecord[]) =>
              items.map((item) => {
                const id = mapping.get(String(item.projectId));
                if (!id)
                  throw new Error(
                    "Um registro antigo não possui livro correspondente. A cópia original foi preservada para recuperação manual.",
                  );
                return { ...item, id: crypto.randomUUID(), projectId: id };
              });
            setGoals([
              ...goals,
              ...read("goals").map((goal) => ({
                ...goal,
                id: crypto.randomUUID(),
              })),
            ]);
            setIdeas([...ideas, ...attach(read("ideas"))]);
            setConcepts([...concepts, ...attach(read("universe_concepts"))]);
            setEvents([...events, ...attach(read("timeline_events"))]);
            if (!(await flush()))
              throw new Error(
                "A sincronização ainda está pendente. A cópia original foi preservada.",
              );
            [
              "projects",
              "goals",
              "ideas",
              "universe_concepts",
              "timeline_events",
            ].forEach((key) => localStorage.removeItem(`capitulando_${key}`));
            setMessage(
              "Dados recuperados. Exporte um backup completo para guardar uma cópia.",
            );
          } catch (reason) {
            setMessage(
              reason instanceof Error
                ? reason.message
                : "Não foi possível recuperar os dados.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <Download size={16} className="shrink-0" />
        {busy
          ? "Recuperando…"
          : "Confirmar propriedade e recuperar dados antigos"}
      </button>
    </section>
  );
}
