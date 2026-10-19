"use client";

import React, { useEffect, useState } from "react";
import {
  BookOpen,
  FileText,
  FileCode,
  Trash2,
  Eye,
  X,
  Edit3,
  Save,
} from "lucide-react";
import {
  deleteChapter,
  deleteStory,
  loadWritingProjects,
  saveChapter,
  updateStory,
  type Chapter,
  type WritingProject,
} from "@/lib/writing-api";

function toPlainText(content: string) {
  return (
    new DOMParser().parseFromString(content, "text/html").body.textContent || ""
  );
}

export function ProjectsSection() {
  const [projects, setProjects] = useState<WritingProject[]>([]);
  const [activeTabMap, setActiveTabMap] = useState<
    Record<string, "chapters" | "drafts">
  >({});
  const [readingItem, setReadingItem] = useState<{
    projectId: string;
    item: Chapter;
  } | null>(null);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editingProject, setEditingProject] = useState<WritingProject | null>(
    null,
  );
  const [projTitle, setProjTitle] = useState("");
  const [projGenre, setProjGenre] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = async () => setProjects(await loadWritingProjects());
  useEffect(() => {
    loadWritingProjects()
      .then(setProjects)
      .catch((err: unknown) =>
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar os projetos.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteItem = async (
    projectId: string,
    item: Chapter,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    if (!confirm("Excluir este capítulo?")) return;
    try {
      await deleteChapter(projectId, item.id);
      await refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível excluir o capítulo.",
      );
    }
  };

  const handleDeleteProject = async (
    projectId: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    if (!confirm("Excluir este livro e todos os seus capítulos?")) return;
    try {
      await deleteStory(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível excluir o projeto.",
      );
    }
  };

  const saveProject = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingProject) return;
    setSaving(true);
    setError("");
    try {
      await updateStory({
        ...editingProject,
        title: projTitle.trim(),
        genre: projGenre.trim(),
        description: projDesc,
      });
      await refresh();
      setEditingProject(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível salvar o projeto.",
      );
    } finally {
      setSaving(false);
    }
  };

  const saveItem = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!readingItem) return;
    setSaving(true);
    setError("");
    try {
      const current = projects.find(
        (project) => project.id === readingItem.projectId,
      );
      const isDraft =
        current?.drafts.some((item) => item.id === readingItem.item.id) ??
        false;
      const item = await saveChapter(
        readingItem.projectId,
        {
          title: editTitle.trim(),
          content: editContent,
          status: isDraft ? "DRAFT" : "IN_REVIEW",
        },
        readingItem.item.id,
      );
      setReadingItem({ ...readingItem, item });
      await refresh();
      setIsEditingMode(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível salvar o capítulo.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-[#fcf8f2] dark:bg-[#1a1120] p-5 rounded-3xl border border-[#4b1d3f]/20 dark:border-[#2e1d3a] flex items-center gap-3.5 shadow-xs">
        <div className="p-3 bg-[#f3ccde]/40 dark:bg-[#281832] text-[#4b1d3f] dark:text-pink-300 rounded-2xl">
          <BookOpen size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold font-serif">Projetos & Livros</h2>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            Seus projetos e textos salvos na sua conta.
          </p>
        </div>
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-100 p-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}
      {loading ? (
        <p className="text-center py-10 text-sm">Carregando seus projetos…</p>
      ) : projects.length === 0 ? (
        <p className="text-center py-10 text-sm text-stone-500">
          Nenhum projeto criado ainda. Comece pelo Espaço de Escrita.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => {
            const subTab = activeTabMap[project.id] || "chapters";
            const items =
              subTab === "chapters" ? project.chapters : project.drafts;
            return (
              <div
                key={project.id}
                className="bg-[#fcf8f2] dark:bg-[#1a1120] border border-[#4b1d3f]/20 dark:border-[#2e1d3a] rounded-3xl p-6 shadow-xs space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase bg-[#4b1d3f] text-white px-2.5 py-1 rounded-md">
                      {project.genre || "Geral"}
                    </span>
                    <h3 className="mt-2 text-lg font-bold font-serif">
                      {project.title}
                    </h3>
                    {project.description && (
                      <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      aria-label={`Editar ${project.title}`}
                      onClick={() => {
                        setEditingProject(project);
                        setProjTitle(project.title);
                        setProjGenre(project.genre || "");
                        setProjDesc(project.description || "");
                      }}
                      className="p-1.5 text-stone-400"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      aria-label={`Excluir ${project.title}`}
                      onClick={(e) => void handleDeleteProject(project.id, e)}
                      className="p-1.5 text-red-400"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <div className="flex border-b border-stone-200 dark:border-[#2e1d3a] text-xs font-bold">
                  {(["chapters", "drafts"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() =>
                        setActiveTabMap((prev) => ({
                          ...prev,
                          [project.id]: tab,
                        }))
                      }
                      className={`pb-2 px-3 border-b-2 flex items-center gap-1.5 ${subTab === tab ? "border-[#4b1d3f] text-[#4b1d3f]" : "border-transparent text-stone-500"}`}
                    >
                      {tab === "chapters" ? (
                        <FileText size={14} />
                      ) : (
                        <FileCode size={14} />
                      )}
                      {tab === "chapters" ? "Capítulos" : "Rascunhos"} (
                      {items.length})
                    </button>
                  ))}
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setReadingItem({ projectId: project.id, item });
                        setEditTitle(item.title);
                        setEditContent(toPlainText(item.content || ""));
                        setIsEditingMode(false);
                      }}
                      className="p-3 bg-white dark:bg-[#24172d] border rounded-2xl flex justify-between items-center text-xs cursor-pointer"
                    >
                      <div>
                        <h4 className="font-bold">{item.title}</h4>
                        <p className="text-[10px] text-stone-500">
                          {item.wordCount} palavras •{" "}
                          {item.updatedAt
                            ? new Date(item.updatedAt).toLocaleDateString(
                                "pt-BR",
                              )
                            : ""}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          aria-label={`Ler ${item.title}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setReadingItem({ projectId: project.id, item });
                            setEditTitle(item.title);
                            setEditContent(toPlainText(item.content || ""));
                            setIsEditingMode(false);
                          }}
                          className="p-1.5"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          aria-label={`Excluir ${item.title}`}
                          onClick={(e) =>
                            void handleDeleteItem(project.id, item, e)
                          }
                          className="p-1.5 text-red-400"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <p className="text-center text-xs text-stone-400 py-4">
                      Nenhum item salvo.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editingProject && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#fcf8f2] dark:bg-[#18121e] rounded-3xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between">
              <h3 className="font-bold text-lg">Editar Livro</h3>
              <button
                aria-label="Fechar"
                onClick={() => setEditingProject(null)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={saveProject} className="space-y-3 text-xs">
              <label className="block font-bold">
                Título
                <input
                  required
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  className="mt-1 w-full p-2.5 bg-white border rounded-xl"
                />
              </label>
              <label className="block font-bold">
                Gênero
                <input
                  value={projGenre}
                  onChange={(e) => setProjGenre(e.target.value)}
                  className="mt-1 w-full p-2.5 bg-white border rounded-xl"
                />
              </label>
              <label className="block font-bold">
                Descrição
                <textarea
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="mt-1 w-full p-2.5 bg-white border rounded-xl"
                />
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  disabled={saving}
                  className="px-4 py-2 bg-[#4b1d3f] text-white rounded-xl font-bold flex gap-1"
                >
                  <Save size={16} />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {readingItem && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 md:p-8">
          <div className="bg-[#fcf8f2] dark:bg-[#1a1120] rounded-3xl p-6 md:p-10 w-full max-w-3xl space-y-6 max-h-[92vh] flex flex-col">
            <div className="flex justify-between border-b pb-4">
              <span className="font-bold">Modo Leitura</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditingMode((v) => !v)}
                  className="px-3 py-1 rounded-xl text-xs border"
                >
                  {isEditingMode ? "Leitor" : "Editar"}
                </button>
                <button
                  aria-label="Fechar"
                  onClick={() => setReadingItem(null)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            {isEditingMode ? (
              <form
                onSubmit={saveItem}
                className="flex-grow flex flex-col gap-3 overflow-y-auto"
              >
                <label className="text-xs font-bold">
                  Título
                  <input
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="mt-1 w-full p-2.5 border rounded-xl"
                  />
                </label>
                <label className="flex-grow flex flex-col text-xs font-bold">
                  Conteúdo
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="mt-1 flex-grow min-h-64 w-full p-3 border rounded-xl font-serif"
                  />
                </label>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingMode(false)}
                    className="px-4 py-2 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    disabled={saving}
                    className="px-4 py-2 bg-[#4b1d3f] text-white rounded-xl"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex-grow overflow-y-auto space-y-4">
                <h2 className="text-2xl font-serif font-bold text-center">
                  {readingItem.item.title}
                </h2>
                <div className="font-serif text-base leading-relaxed whitespace-pre-wrap">
                  {toPlainText(readingItem.item.content || "")}
                </div>
              </div>
            )}
            <div className="pt-3 border-t text-xs text-stone-500">
              {readingItem.item.wordCount} palavras
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
