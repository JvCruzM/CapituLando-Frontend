"use client";
import { useEffect, useState } from "react";
import { Globe, BookOpen } from "lucide-react";
import { loadStories, type Story } from "@/lib/writing-api";
import type { WorldKind } from "@/lib/world-api";
import { worldCatalogs } from "@/lib/world-fields";
import { UniverseNotes } from "./UniverseNotes";
import { WorldCatalog } from "./WorldCatalog";
const tabs: (WorldKind | "notes")[] = [
  "notes",
  "races",
  "creatures",
  "items",
  "locations",
  "organizations",
  "rules",
];
export function UniverseSection() {
  const [stories, setStories] = useState<Story[]>([]);
  const [storyId, setStoryId] = useState("");
  const [tab, setTab] = useState<WorldKind | "notes">("notes");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    loadStories()
      .then((rows) => {
        if (active) {
          setStories(rows);
          setStoryId(rows[0]?.id || "");
          setLoading(false);
          setError("");
        }
      })
      .catch((reason) => {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : "Não foi possível carregar os livros.",
          );
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  return (
    <div className="space-y-5 font-sans text-stone-800 dark:text-stone-100">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border-2 border-[#4b1d3f]/20 bg-[#fcf8f2] p-5 dark:border-[#382b47] dark:bg-[#1a1321]">
        <div className="flex items-center gap-3">
          <Globe size={28} className="text-[#4b1d3f] dark:text-pink-200" />
          <div>
            <h2 className="font-serif text-xl font-bold">
              Universo & Ambientação
            </h2>
            <p className="mt-1 text-xs text-stone-600 dark:text-stone-300">
              Raças, criaturas, itens, locais e tudo que dá vida à sua história.
            </p>
          </div>
        </div>
        <label className="flex max-w-full items-center gap-2 rounded-xl border border-[#4b1d3f]/20 bg-white p-3 dark:border-[#382b47] dark:bg-[#221a2b]">
          <BookOpen size={16} aria-hidden="true" />
          <span className="sr-only">Livro do universo</span>
          <select
            value={storyId}
            disabled={loading || Boolean(error)}
            onChange={(event) => setStoryId(event.target.value)}
            className="max-w-56 text-xs font-bold"
          >
            <option value="" disabled>
              {loading ? "Carregando livros…" : "Selecione um livro"}
            </option>
            {stories.map((story) => (
              <option key={story.id} value={story.id}>
                {story.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && (
        <div
          role="alert"
          className="rounded-xl bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950 dark:text-red-100"
        >
          {error}
          <button
            onClick={() => {
              setLoading(true);
              setAttempt((value) => value + 1);
            }}
            className="ml-3 underline"
          >
            Tentar novamente
          </button>
        </div>
      )}
      {loading ? (
        <p role="status" className="text-sm">
          Carregando livros…
        </p>
      ) : !error && !storyId ? (
        <p className="rounded-2xl border border-dashed border-[#4b1d3f]/20 p-8 text-center text-sm dark:border-[#382b47]">
          Crie um livro no Espaço de Escrita para construir seu universo.
        </p>
      ) : (
        storyId && (
          <>
            <div
              role="tablist"
              aria-label="Categorias do universo"
              className="flex flex-wrap gap-2"
            >
              {tabs.map((value) => (
                <button
                  key={value}
                  role="tab"
                  aria-selected={value === tab}
                  aria-controls="universe-content"
                  onClick={() => setTab(value)}
                  className={`rounded-xl border px-4 py-2 text-xs font-bold ${value === tab ? "border-[#4b1d3f] bg-[#4b1d3f] text-white dark:border-pink-800 dark:bg-pink-800" : "border-[#4b1d3f]/15 bg-[#fcf8f2] text-stone-700 dark:border-[#382b47] dark:bg-[#221a2b] dark:text-stone-200"}`}
                >
                  {value === "notes" ? "Anotações" : worldCatalogs[value].label}
                </button>
              ))}
            </div>
            <div
              id="universe-content"
              role="tabpanel"
              aria-label={
                tab === "notes" ? "Anotações" : worldCatalogs[tab].label
              }
            >
              {tab === "notes" ? (
                <UniverseNotes key={storyId} selectedProjectId={storyId} />
              ) : (
                <WorldCatalog
                  key={`${storyId}:${tab}`}
                  kind={tab}
                  storyId={storyId}
                />
              )}
            </div>
          </>
        )
      )}
    </div>
  );
}
