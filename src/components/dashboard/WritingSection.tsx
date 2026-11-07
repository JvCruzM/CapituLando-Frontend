"use client";

import { sanitizeHtml, textToHtml } from "@/lib/html";
import { useWorkspaceSection } from "./WorkspaceProvider";
import { useAuthenticatedUser } from "@/components/auth/AuthGuard";
import React, { useState, useEffect, useRef } from "react";
import {
  createStory,
  loadWritingProjects,
  saveChapter,
  type WritingProject,
} from "@/lib/writing-api";
import {
  Feather,
  Maximize2,
  Minimize2,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Quote,
  List,
  Download,
  Copy,
  Check,
  Type,
  Clock,
  Sparkles,
  FileText,
  Sliders,
  Send,
  BookOpen,
  FolderOpen,
  PlusCircle,
  RefreshCw,
  X,
  Indent,
  FileDown,
} from "lucide-react";

export function WritingSpace() {
  type Recovery = {
    content?: string;
    title?: string;
    projectId?: string;
    chapterId?: string;
    type?: "chapter" | "draft";
  };
  const [remoteRecovery, setRemoteRecovery] = useWorkspaceSection<Recovery>(
    "writing",
    {},
  );
  const user = useAuthenticatedUser()!;
  const recoveryKey = `capitulando:${user.id}:writing`;
  const [recovered] = useState<{
    content?: string;
    title?: string;
    projectId?: string;
    chapterId?: string;
    type?: "chapter" | "draft";
  }>(() => {
    try {
      const local = JSON.parse(localStorage.getItem(recoveryKey) || "{}");
      return local.content ? local : remoteRecovery;
    } catch {
      return remoteRecovery;
    }
  });
  const [content, setContent] = useState(recovered.content || "");
  const [title, setTitle] = useState(recovered.title || "Novo Capítulo");

  const [projects, setProjects] = useState<WritingProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState(
    recovered.projectId || "",
  );
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    loadWritingProjects()
      .then((loadedProjects) => {
        setProjects(loadedProjects);
        if (!recovered.projectId && loadedProjects[0])
          setSelectedProjectId(loadedProjects[0].id);
        if (
          recovered.projectId &&
          !loadedProjects.some((project) => project.id === recovered.projectId)
        )
          setApiError(
            "O livro da recuperação não está disponível. Escolha um livro para salvar o texto recuperado.",
          );
      })
      .catch((error: unknown) =>
        setApiError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar seus projetos.",
        ),
      )
      .finally(() => setLoadingProjects(false));
  }, [recovered.projectId]);
  const [exportType, setExportType] = useState<"chapter" | "draft">(
    recovered.type || "chapter",
  );
  const [editingItemId, setEditingItemId] = useState<string | null>(
    recovered.chapterId || null,
  );

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newGenre, setNewGenre] = useState("Fantasia");

  const [isSaved, setIsSaved] = useState(!recovered.content);
  const inFlight = useRef(false);
  const [saving, setSaving] = useState(false);
  const currentText = useRef({ content, title });
  useEffect(() => {
    currentText.current = { content, title };
  }, [content, title]);
  useEffect(() => {
    if (!isSaved) {
      try {
        localStorage.setItem(
          recoveryKey,
          JSON.stringify({
            content,
            title,
            projectId: selectedProjectId,
            chapterId: editingItemId,
            type: exportType,
          }),
        );
      } catch {
        queueMicrotask(() =>
          setApiError(
            "Não foi possível preservar a recuperação local. Salve ou exporte seu texto antes de sair.",
          ),
        );
      }
    }
    const warn = (event: BeforeUnloadEvent) => {
      if (!isSaved) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [
    content,
    title,
    selectedProjectId,
    editingItemId,
    exportType,
    isSaved,
    recoveryKey,
  ]);
  useEffect(() => {
    if (isSaved || !selectedProjectId) return;
    const timer = setTimeout(
      () =>
        setRemoteRecovery({
          content,
          title,
          projectId: selectedProjectId,
          chapterId: editingItemId || undefined,
          type: exportType,
        }),
      250,
    );
    return () => clearTimeout(timer);
  }, [
    content,
    title,
    selectedProjectId,
    editingItemId,
    exportType,
    isSaved,
    setRemoteRecovery,
  ]);
  const [isFocus, setIsFocus] = useState(false);
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState(false);

  const [font, setFont] = useState<"serif" | "sans" | "mono" | "georgia">(
    "serif",
  );
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState<"relaxed" | "loose" | "normal">(
    "relaxed",
  );
  const [indent, setIndent] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const proj = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const items =
    exportType === "chapter" ? proj?.chapters || [] : proj?.drafts || [];

  useEffect(() => {
    try {
      document.execCommand("defaultParagraphSeparator", false, "p");
    } catch {}
  }, []);

  const plainText = (() => {
    if (typeof document !== "undefined") {
      const tmp = document.createElement("DIV");
      tmp.innerHTML = content;
      return tmp.textContent || tmp.innerText || "";
    }
    return content.replace(/<[^>]*>/g, "");
  })();

  const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
  const readingTime = Math.ceil(wordCount / 200);

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) setContent(editorRef.current.innerHTML);
    setIsSaved(false);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertHTML", false, textToHtml(text));
    if (editorRef.current) setContent(editorRef.current.innerHTML);
    setIsSaved(false);
  };

  const handleSave = async () => {
    if (inFlight.current) return;
    if (!selectedProjectId) {
      setApiError("Crie ou selecione um livro antes de salvar o texto.");
      return;
    }
    setApiError("");
    inFlight.current = true;
    setSaving(true);
    const sent = { content, title };
    try {
      const savedChapter = await saveChapter(
        selectedProjectId,
        {
          title: title.trim() || "Sem Título",
          content: sanitizeHtml(content),
          status:
            exportType === "draft"
              ? "DRAFT"
              : items.find((item) => item.id === editingItemId)?.status ||
                "IN_REVIEW",
        },
        editingItemId || undefined,
      );
      const key = exportType === "chapter" ? "chapters" : "drafts";
      setProjects((previous) =>
        previous.map((project) =>
          project.id === selectedProjectId
            ? {
                ...project,
                chapters:
                  key === "chapters"
                    ? [
                        ...project.chapters.filter(
                          (item) => item.id !== savedChapter.id,
                        ),
                        savedChapter,
                      ]
                    : project.chapters.filter(
                        (item) => item.id !== savedChapter.id,
                      ),
                drafts:
                  key === "drafts"
                    ? [
                        ...project.drafts.filter(
                          (item) => item.id !== savedChapter.id,
                        ),
                        savedChapter,
                      ]
                    : project.drafts.filter(
                        (item) => item.id !== savedChapter.id,
                      ),
              }
            : project,
        ),
      );
      setEditingItemId(savedChapter.id);
      const unchanged =
        currentText.current.content === sent.content &&
        currentText.current.title === sent.title;
      setIsSaved(unchanged);
      if (unchanged) {
        localStorage.removeItem(recoveryKey);
        setRemoteRecovery({});
      }
      window.dispatchEvent(new Event("capitulando:data-changed"));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o texto.",
      );
    } finally {
      inFlight.current = false;
      setSaving(false);
    }
  };

  const downloadFile = (type: "txt" | "pdf") => {
    if (type === "txt") {
      const blob = new Blob([`${title}\n\n${plainText}`], {
        type: "text/plain;charset=utf-8",
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${title.toLowerCase().replace(/\s+/g, "_")}.txt`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } else {
      const w = window.open("", "_blank");
      if (!w) return;
      w.document.write(
        `<html><head><title>${title.replace(/[<>&]/g, "")}</title><style>body{font-family:serif;padding:45px;line-height:1.6}h1{text-align:center}p{text-indent:${indent ? "2.5em" : "0"};margin-bottom:12px;text-align:justify}</style></head><body><h1>${title.replace(/[<>&]/g, "")}</h1>${sanitizeHtml(content)}</body></html>`,
      );
      w.document.close();
      w.onload = () => {
        w.print();
        w.close();
      };
    }
  };

  const fontClass = {
    serif: "font-serif",
    sans: "font-sans",
    mono: "font-mono",
    georgia: "font-[Georgia,serif]",
  }[font];

  return (
    <div
      className={`transition-all duration-300 font-sans ${isFocus ? "fixed inset-0 z-50 bg-[#FCF8F2] dark:bg-[#120e17] p-6 md:p-12 overflow-y-auto" : "space-y-4"}`}
    >
      <style>{`
        .editor-area p, .editor-area div { text-indent: ${indent ? "2.5em" : "0"} !important; margin-bottom: 0.6em; display: block; }
        .editor-area h1, .editor-area h2, .editor-area blockquote, .editor-area ul, .editor-area ol, .editor-area li { text-indent: 0 !important; }
      `}</style>

      {apiError && (
        <div
          role="alert"
          className="rounded-xl bg-red-100 p-3 text-sm text-red-800"
        >
          {apiError}
        </div>
      )}
      {/* HEADER */}
      <div className="bg-[#FCF8F2] dark:bg-[#1a1120] p-4 md:p-5 rounded-3xl border border-[#4b1d3f]/20 dark:border-[#2e1d3a] flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#f3ccde]/40 dark:bg-[#281832] text-[#4b1d3f] dark:text-pink-300 rounded-2xl border border-[#4b1d3f]/20 dark:border-[#3d224d]">
            <Feather size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100">
                Espaço de Escrita
              </h2>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${isSaved ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200" : "bg-amber-100 text-amber-800 animate-pulse"}`}
              >
                {isSaved ? "Guardado" : "A guardar..."}
              </span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              {editingItemId ? "A rever texto." : "Escreva um novo rascunho."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5 bg-white dark:bg-[#24172d] px-3 py-1.5 rounded-xl border border-[#4b1d3f]/20 dark:border-[#382245]">
            <BookOpen size={15} className="text-[#4b1d3f] dark:text-pink-300" />
            <select
              value={selectedProjectId}
              disabled={saving}
              onChange={(e) => {
                if (e.target.value === "new") {
                  setIsNewModalOpen(true);
                  return;
                }
                if (
                  !isSaved &&
                  !confirm(
                    "Salvar ou exportar o texto antes de trocar de livro. Deseja descartar esta edição?",
                  )
                )
                  return;
                setSelectedProjectId(e.target.value);
                setEditingItemId(null);
                setContent("");
                setTitle("Novo Capítulo");
                setIsSaved(true);
                localStorage.removeItem(recoveryKey);
                setRemoteRecovery({});
                if (editorRef.current) editorRef.current.innerHTML = "";
              }}
              className="bg-transparent text-xs font-bold text-stone-800 dark:text-stone-200 focus:outline-none cursor-pointer"
            >
              {loadingProjects && (
                <option value="">Carregando projetos…</option>
              )}
              {!loadingProjects && projects.length === 0 && (
                <option value="">Nenhum livro criado</option>
              )}
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="dark:bg-[#24172d]">
                  {p.title}
                </option>
              ))}
              <option
                value="new"
                className="font-bold text-[#4b1d3f] dark:text-pink-300"
              >
                + Criar Livro...
              </option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-white dark:bg-[#24172d] p-1 rounded-xl border border-[#4b1d3f]/20 dark:border-[#382245] text-xs">
            <button
              onClick={() => {
                setExportType("chapter");
                if (content) setIsSaved(false);
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold ${exportType === "chapter" ? "bg-[#4b1d3f] text-white dark:bg-pink-800" : "text-stone-600 dark:text-stone-400"}`}
            >
              Capítulo
            </button>
            <button
              onClick={() => {
                setExportType("draft");
                if (content) setIsSaved(false);
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold ${exportType === "draft" ? "bg-[#4b1d3f] text-white dark:bg-pink-800" : "text-stone-600 dark:text-stone-400"}`}
            >
              Rascunho
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-white dark:bg-[#24172d] px-3 py-1.5 rounded-xl border border-[#4b1d3f]/20 dark:border-[#382245]">
            <FolderOpen
              size={15}
              className="text-[#4b1d3f] dark:text-pink-300"
            />
            <select
              value={editingItemId || ""}
              disabled={saving}
              onChange={(e) => {
                if (
                  !isSaved &&
                  !confirm(
                    "Descartar o texto ainda não salvo? Exporte ou salve antes de continuar.",
                  )
                )
                  return;
                const item = items.find((i) => i.id === e.target.value);
                if (item) {
                  setEditingItemId(item.id);
                  setTitle(item.title);
                  setContent(sanitizeHtml(item.content));
                  setIsSaved(true);
                  if (editorRef.current)
                    editorRef.current.innerHTML = sanitizeHtml(item.content);
                } else {
                  setEditingItemId(null);
                }
              }}
              className="bg-transparent text-xs font-bold text-stone-800 dark:text-stone-200 focus:outline-none max-w-[120px] truncate"
            >
              <option value="">-- Carregar --</option>
              {items.map((i) => (
                <option key={i.id} value={i.id} className="dark:bg-[#24172d]">
                  {i.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              if (!isSaved && !confirm("Descartar o texto ainda não salvo?"))
                return;
              setEditingItemId(null);
              localStorage.removeItem(recoveryKey);
              setRemoteRecovery({});
              setIsSaved(true);
              setTitle("Novo Capítulo");
              setContent("");
              if (editorRef.current) editorRef.current.innerHTML = "";
            }}
            className="p-2.5 bg-white dark:bg-[#24172d] text-stone-700 dark:text-stone-200 rounded-xl border border-[#4b1d3f]/20 dark:border-[#382245] text-xs"
            title="Novo"
          >
            <PlusCircle size={15} />
          </button>
          <button
            disabled={saving || loadingProjects || !selectedProjectId}
            onClick={() => void handleSave()}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${success ? "bg-emerald-600 text-white" : "bg-[#4b1d3f] dark:bg-pink-800 text-white"}`}
          >
            {success ? (
              <Check size={16} />
            ) : editingItemId ? (
              <RefreshCw size={15} />
            ) : (
              <Send size={15} />
            )}
            <span>
              {success ? "Atualizado!" : editingItemId ? "Atualizar" : "Salvar"}
            </span>
          </button>
        </div>
      </div>

      {/* FERRAMENTAS & AÇÕES */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-[#FCF8F2] dark:bg-[#1a1120] text-stone-700 dark:text-stone-300 rounded-xl border border-[#4b1d3f]/20 dark:border-[#2e1d3a] text-xs font-semibold flex items-center gap-1.5"
          >
            <Sliders size={15} /> Tipografia
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${title}\n\n${plainText}`);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="p-2 bg-[#FCF8F2] dark:bg-[#1a1120] text-stone-700 dark:text-stone-300 rounded-xl border border-[#4b1d3f]/20 dark:border-[#2e1d3a] text-xs font-semibold flex items-center gap-1.5"
          >
            {copied ? (
              <Check size={15} className="text-emerald-600" />
            ) : (
              <Copy size={15} />
            )}{" "}
            {copied ? "Copiado!" : "Copiar"}
          </button>
          <button
            onClick={() => downloadFile("txt")}
            className="p-2 bg-[#FCF8F2] dark:bg-[#1a1120] text-stone-700 dark:text-stone-300 rounded-xl border border-[#4b1d3f]/20 dark:border-[#2e1d3a] text-xs font-semibold flex items-center gap-1.5"
          >
            <Download size={15} /> .TXT
          </button>
          <button
            onClick={() => downloadFile("pdf")}
            className="p-2 bg-[#FCF8F2] dark:bg-[#1a1120] text-stone-700 dark:text-stone-300 rounded-xl border border-[#4b1d3f]/20 dark:border-[#2e1d3a] text-xs font-semibold flex items-center gap-1.5"
          >
            <FileDown size={15} /> .PDF
          </button>
        </div>
        <button
          onClick={() => setIsFocus(!isFocus)}
          className="p-2 bg-[#f3ccde]/40 dark:bg-[#281832] text-[#4b1d3f] dark:text-pink-300 border border-[#4b1d3f]/30 dark:border-[#3d224d] rounded-xl text-xs font-bold flex items-center gap-1.5"
        >
          {isFocus ? <Minimize2 size={15} /> : <Maximize2 size={15} />}{" "}
          {isFocus ? "Sair do Foco" : "Modo Foco"}
        </button>
      </div>

      {/* PAINEL DE CONFIGURAÇÕES */}
      {showSettings && (
        <div className="bg-[#FCF8F2] dark:bg-[#1a1120] border border-[#4b1d3f]/30 dark:border-[#2e1d3a] p-4 rounded-3xl shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-sans">
          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
              Fonte
            </label>
            <div className="grid grid-cols-2 gap-1">
              {(["serif", "sans", "mono", "georgia"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFont(f)}
                  className={`py-1.5 rounded-xl border capitalize text-center ${font === f ? "bg-[#4b1d3f] text-white dark:bg-pink-800" : "bg-white dark:bg-[#24172d] text-stone-700 dark:text-stone-200"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label
              htmlFor="writingsection-field-1"
              className="block font-bold text-stone-700 dark:text-stone-300 mb-1"
            >
              Tamanho: {fontSize}px
            </label>
            <input
              id="writingsection-field-1"
              type="range"
              min="14"
              max="32"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-[#4b1d3f] cursor-pointer mt-2"
            />
          </div>
          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
              Espaçamento
            </label>
            <div className="flex gap-1">
              {(["normal", "relaxed", "loose"] as const).map((lh) => (
                <button
                  key={lh}
                  onClick={() => setLineHeight(lh)}
                  className={`flex-1 py-1.5 rounded-xl border capitalize ${lineHeight === lh ? "bg-[#4b1d3f] text-white dark:bg-pink-800" : "bg-white dark:bg-[#24172d] text-stone-700 dark:text-stone-200"}`}
                >
                  {lh}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-end">
            <button
              onClick={() => {
                setFont("georgia");
                setFontSize(16);
                setLineHeight("relaxed");
                setIndent(true);
              }}
              className="w-full py-2 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 rounded-xl font-bold flex items-center justify-center gap-1.5"
            >
              <Sparkles size={14} /> Padrão ABNT
            </button>
          </div>
        </div>
      )}

      {/* EDITOR */}
      <div className="bg-[#FCF8F2] dark:bg-[#1a1120] border border-[#4b1d3f]/20 dark:border-[#2e1d3a] rounded-3xl p-6 md:p-10 shadow-xs space-y-4 relative min-h-[550px] flex flex-col justify-between">
        <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-[#4b1d3f]/15 dark:border-[#2e1d3a] text-stone-700 dark:text-stone-300">
          <button
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyFormat("bold")}
            className="p-1.5 hover:bg-[#f3ccde]/40 dark:hover:bg-[#281832] rounded-lg font-bold"
          >
            <Bold size={16} />
          </button>
          <button
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyFormat("italic")}
            className="p-1.5 hover:bg-[#f3ccde]/40 dark:hover:bg-[#281832] rounded-lg italic"
          >
            <Italic size={16} />
          </button>
          <button
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyFormat("underline")}
            className="p-1.5 hover:bg-[#f3ccde]/40 dark:hover:bg-[#281832] rounded-lg underline"
          >
            <Underline size={16} />
          </button>
          <div className="h-4 w-px bg-stone-300 dark:bg-stone-700 mx-1" />
          <button
            onClick={() => applyFormat("formatBlock", "<h1>")}
            className="p-1.5 hover:bg-[#f3ccde]/40 dark:hover:bg-[#281832] rounded-lg"
          >
            <Heading1 size={16} />
          </button>
          <button
            onClick={() => applyFormat("formatBlock", "<h2>")}
            className="p-1.5 hover:bg-[#f3ccde]/40 dark:hover:bg-[#281832] rounded-lg"
          >
            <Heading2 size={16} />
          </button>
          <div className="h-4 w-px bg-stone-300 dark:bg-[#2e1d3a] mx-1" />
          <button
            onClick={() => applyFormat("formatBlock", "<blockquote>")}
            className="p-1.5 hover:bg-[#f3ccde]/40 dark:hover:bg-[#281832] rounded-lg"
          >
            <Quote size={16} />
          </button>
          <button
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyFormat("insertUnorderedList")}
            className="p-1.5 hover:bg-[#f3ccde]/40 dark:hover:bg-[#281832] rounded-lg"
          >
            <List size={16} />
          </button>
          <div className="h-4 w-px bg-stone-300 dark:bg-[#2e1d3a] mx-1" />
          <button
            onClick={() => setIndent(!indent)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${indent ? "bg-[#4b1d3f] text-white dark:bg-pink-800" : "hover:bg-[#f3ccde]/40 dark:hover:bg-[#281832]"}`}
          >
            <Indent size={14} /> {indent ? "Recuo Ativo" : "Sem Recuo"}
          </button>
        </div>

        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setIsSaved(false);
            }}
            placeholder="Título..."
            className="w-full text-2xl md:text-3xl font-bold font-serif bg-transparent border-b border-transparent hover:border-stone-300 focus:border-[#4b1d3f] dark:focus:border-pink-400 focus:outline-none text-stone-900 dark:text-stone-100 pb-2"
          />
        </div>

        <div className="flex-grow my-2 relative">
          <div
            ref={(element) => {
              editorRef.current = element;
              if (element && !element.dataset.initialized) {
                element.innerHTML = sanitizeHtml(recovered.content || "");
                element.dataset.initialized = "true";
              }
            }}
            contentEditable
            onPaste={handlePaste}
            onInput={(e) => {
              setContent(e.currentTarget.innerHTML);
              setIsSaved(false);
            }}
            style={{ fontSize: `${fontSize}px` }}
            className={`w-full h-full min-h-[380px] bg-transparent focus:outline-none text-stone-800 dark:text-stone-200 ${fontClass} ${lineHeight === "normal" ? "leading-normal" : lineHeight === "loose" ? "leading-loose" : "leading-relaxed"} overflow-y-auto whitespace-pre-wrap editor-area`}
          />
        </div>

        <div className="pt-4 border-t border-[#4b1d3f]/15 dark:border-[#2e1d3a] flex flex-wrap items-center justify-between text-xs text-stone-600 dark:text-stone-400 font-medium gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5">
              <FileText
                size={14}
                className="text-[#4b1d3f] dark:text-pink-300"
              />{" "}
              <strong>{wordCount}</strong> Palavras
            </span>
            <span className="flex items-center gap-1.5">
              <Type size={14} className="text-[#4b1d3f] dark:text-pink-300" />{" "}
              <strong>{plainText.length}</strong> Caracteres
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400">
            <Clock size={14} /> <span>~{readingTime} min de leitura</span>
          </div>
        </div>
      </div>

      {/* MODAL NOVO LIVRO */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#FCF8F2] dark:bg-[#18121e] border border-[#4b1d3f]/30 dark:border-[#2e1d3a] rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 text-stone-900 dark:text-stone-100">
            <div className="flex justify-between items-center border-b border-[#4b1d3f]/20 dark:border-[#2e1d3a] pb-3">
              <h3 className="font-bold font-serif text-lg">Criar Novo Livro</h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              >
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newTitle.trim()) return;
                setApiError("");
                try {
                  const story = await createStory({
                    title: newTitle.trim(),
                    genre: newGenre.trim(),
                    description: "",
                  });
                  const project: WritingProject = {
                    ...story,
                    chapters: [],
                    drafts: [],
                  };
                  setProjects((previous) => [...previous, project]);
                  setSelectedProjectId(story.id);
                  setEditingItemId(null);
                  setNewTitle("");
                  setIsNewModalOpen(false);
                } catch (error) {
                  setApiError(
                    error instanceof Error
                      ? error.message
                      : "Não foi possível criar o livro.",
                  );
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label
                  htmlFor="writingsection-field-2"
                  className="block font-bold mb-1"
                >
                  Título
                </label>
                <input
                  id="writingsection-field-2"
                  type="text"
                  required
                  placeholder="Ex: Crónicas"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-[#221a2b] border border-stone-300 dark:border-[#382245] rounded-xl focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="writingsection-field-3"
                  className="block font-bold mb-1"
                >
                  Género
                </label>
                <input
                  id="writingsection-field-3"
                  type="text"
                  required
                  placeholder="Ex: Fantasia"
                  value={newGenre}
                  onChange={(e) => setNewGenre(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-[#221a2b] border border-stone-300 dark:border-[#382b47] rounded-xl focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#4b1d3f]/20 dark:border-[#2e1d3a]">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 bg-stone-200 dark:bg-stone-800 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4b1d3f] dark:bg-pink-800 text-white rounded-xl font-bold flex items-center gap-1"
                >
                  <Check size={16} /> Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
