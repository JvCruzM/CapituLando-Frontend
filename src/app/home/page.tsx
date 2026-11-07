"use client";

import React, { useState, useEffect } from "react";
import { loadWritingProjects, type WritingProject } from "@/lib/writing-api";
import { useAuthenticatedUser } from "@/components/auth/AuthGuard";
import { useWorkspaceSection } from "@/components/dashboard/WorkspaceProvider";
import { useTheme, type ThemeMode } from "@/components/theme/ThemeProvider";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { CharactersSection } from "@/components/dashboard/CharactersSection";
import { ProjectsSection } from "@/components/dashboard/ProjectsSection";
import { TimelineSection } from "@/components/dashboard/TimelineSection";
import { UniverseSection } from "@/components/dashboard/UniverseSection";
import { WritingSpace } from "@/components/dashboard/WritingSection";
import { GoalsSection } from "@/components/dashboard/GoalsSection";
import { IdeasSection } from "@/components/dashboard/IdeasSection";
import { ProfileSection } from "@/components/dashboard/ProfileSection";
import { SettingsSection } from "@/components/dashboard/SettingsSection";
import {
  Feather,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Target,
  Lightbulb,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface Goal {
  id: string;
  completed: boolean;
}
interface Idea {
  id: string;
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<string>("painel");
  const authenticatedUser = useAuthenticatedUser();
  const userName =
    authenticatedUser?.displayName ||
    authenticatedUser?.username ||
    authenticatedUser?.email?.split("@")[0] ||
    "Escritor(a)";
  const [settings] = useWorkspaceSection<{
    themeMode?: string;
    fontSize?: string;
    dailyReminder?: boolean;
    reminderTime?: string;
    goalAlerts?: boolean;
  }>("settings", {});
  const [profile] = useWorkspaceSection<{ name?: string }>("profile", {});
  const { resolvedTheme, setTheme, theme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [projects, setProjects] = useState<WritingProject[]>([]);
  const [apiError, setApiError] = useState("");
  const activeProfileId = authenticatedUser!.id;
  const [goals] = useWorkspaceSection<Goal[]>("goals", []);
  const [ideas] = useWorkspaceSection<Idea[]>("ideas", []);
  const [reminder, setReminder] = useState("");
  useEffect(() => {
    const load = () => {
      loadWritingProjects()
        .then((value) => {
          setProjects(value);
          setApiError("");
        })
        .catch((reason) =>
          setApiError(
            reason instanceof Error
              ? reason.message
              : "Não foi possível carregar o painel.",
          ),
        );
    };
    load();
    window.addEventListener("capitulando:data-changed", load);
    return () => window.removeEventListener("capitulando:data-changed", load);
  }, [activeTab]);
  useEffect(() => {
    const savedTheme = settings.themeMode;
    if (
      savedTheme === "light" ||
      savedTheme === "dark" ||
      savedTheme === "system"
    )
      setTheme(savedTheme as ThemeMode);
  }, [settings.themeMode, setTheme]);
  useEffect(() => {
    document.documentElement.style.fontSize =
      settings.fontSize === "sm"
        ? "14px"
        : settings.fontSize === "lg"
          ? "18px"
          : "16px";
    return () => {
      document.documentElement.style.fontSize = "";
    };
  }, [settings.fontSize]);
  useEffect(() => {
    const check = () => {
      if (!settings.dailyReminder) return;
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const key = `capitulando:${activeProfileId}:reminder:${now.toLocaleDateString()}`;
      if (
        time === (settings.reminderTime || "20:00") &&
        !localStorage.getItem(key)
      ) {
        setReminder("Hora de escrever! Seu espaço de escrita está pronto.");
        localStorage.setItem(key, "1");
      }
    };
    check();
    const timer = setInterval(check, 30_000);
    return () => clearInterval(timer);
  }, [settings.dailyReminder, settings.reminderTime, activeProfileId]);

  const totalBooks = projects.length;
  const completedGoals = goals.filter((g) => g.completed).length;
  const totalIdeas = ideas.length;
  const totalWords = projects.reduce(
    (acc, p) =>
      acc +
      (p.chapters?.reduce((s, c) => s + (c.wordCount || 0), 0) || 0) +
      (p.drafts?.reduce((s, d) => s + (d.wordCount || 0), 0) || 0),
    0,
  );

  const renderSection = () => {
    switch (activeTab) {
      case "projetos":
        return <ProjectsSection key={activeProfileId} />;
      case "personagens":
        return <CharactersSection key={activeProfileId} />;
      case "timeline":
        return <TimelineSection key={activeProfileId} />;
      case "universo":
        return <UniverseSection key={activeProfileId} />;
      case "escrita":
        return <WritingSpace key={activeProfileId} />;
      case "metas":
        return <GoalsSection key={activeProfileId} />;
      case "ideias":
        return <IdeasSection key={activeProfileId} />;
      case "perfil":
        return <ProfileSection key={activeProfileId} />;
      case "configuracoes":
        return <SettingsSection key={activeProfileId} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`flex flex-col md:flex-row min-h-screen ${isDarkMode ? "dark bg-[#120e17]" : "bg-[#f3ccde]"}`}
    >
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main
        className={`flex-1 min-w-0 p-4 sm:p-6 md:p-8 space-y-6 overflow-y-auto transition-colors duration-300 ${isDarkMode ? "bg-[#120e17] text-stone-100" : "bg-[#f3ccde] text-stone-800"}`}
      >
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#4b1d3f] dark:text-pink-300 bg-white/60 dark:bg-[#2a2035] px-3 py-1 rounded-full border border-[#4b1d3f]/20">
            Escritório Literário
          </span>
          <span className="text-xs font-semibold text-stone-600 dark:text-stone-300 bg-white/80 dark:bg-[#221a2b] border border-[#4b1d3f]/20 dark:border-[#382b47] px-3 py-1.5 rounded-xl shadow-xs">
            {theme === "system" ? "Tema do sistema" : "Tema"} (
            {isDarkMode ? "Escuro" : "Claro"})
          </span>
        </div>

        {apiError && (
          <p role="alert" className="text-red-700">
            {apiError}
          </p>
        )}
        {reminder && (
          <p role="status" className="bg-amber-100 p-3 text-amber-950">
            {reminder} <button onClick={() => setReminder("")}>Fechar</button>
          </p>
        )}
        {activeTab !== "painel" ? (
          renderSection()
        ) : (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#fcf8f2] to-[#f3ccde]/60 dark:from-[#1a1321] dark:to-[#221a2b] border-2 border-[#4b1d3f]/20 dark:border-[#382b47] rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
              <div className="space-y-2 z-10 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-[#2a2035] text-[#4b1d3f] dark:text-pink-300 text-xs font-bold border border-[#4b1d3f]/20 shadow-xs">
                  <Sparkles size={14} />
                  <span>Sessão Privada Ativa</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold font-serif">
                  Boas-vindas, {profile.name || userName}!
                </h1>
                <p className="text-xs md:text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                  O seu santuário criativo está pronto. Acompanhe o progresso
                  das suas obras ou continue a escrever.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("escrita")}
                className="z-10 bg-[#4b1d3f] hover:bg-[#38142f] dark:bg-pink-800 dark:hover:bg-pink-900 text-white px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md transition-all active:scale-95 shrink-0"
              >
                <Feather size={18} />
                <span>Continuar Escrevendo</span>
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#1a1321] border-2 border-[#4b1d3f]/20 dark:border-[#382b47] p-5 rounded-2xl shadow-sm space-y-1">
                <div className="flex justify-between items-center text-[#4b1d3f] dark:text-pink-300">
                  <BookOpen size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                    Livros
                  </span>
                </div>
                <p className="text-2xl font-bold font-serif">{totalBooks}</p>
                <p className="text-[11px] text-stone-600 dark:text-stone-400">
                  Projetos criados
                </p>
              </div>
              <div className="bg-white dark:bg-[#1a1321] border-2 border-[#4b1d3f]/20 dark:border-[#382b47] p-5 rounded-2xl shadow-sm space-y-1">
                <div className="flex justify-between items-center text-[#4b1d3f] dark:text-pink-300">
                  <Feather size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                    Escrita
                  </span>
                </div>
                <p className="text-2xl font-bold font-serif">
                  {totalWords.toLocaleString("pt-PT")}
                </p>
                <p className="text-[11px] text-stone-600 dark:text-stone-400">
                  Palavras guardadas
                </p>
              </div>
              <div className="bg-white dark:bg-[#1a1321] border-2 border-[#4b1d3f]/20 dark:border-[#382b47] p-5 rounded-2xl shadow-sm space-y-1">
                <div className="flex justify-between items-center text-[#4b1d3f] dark:text-pink-300">
                  <Target size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                    Metas
                  </span>
                </div>
                <p className="text-2xl font-bold font-serif">
                  {completedGoals}
                </p>
                <p className="text-[11px] text-stone-600 dark:text-stone-400">
                  Objetivos concluídos
                </p>
              </div>
              <div className="bg-white dark:bg-[#1a1321] border-2 border-[#4b1d3f]/20 dark:border-[#382b47] p-5 rounded-2xl shadow-sm space-y-1">
                <div className="flex justify-between items-center text-[#4b1d3f] dark:text-pink-300">
                  <Lightbulb size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                    Ideias
                  </span>
                </div>
                <p className="text-2xl font-bold font-serif">{totalIdeas}</p>
                <p className="text-[11px] text-stone-600 dark:text-stone-400">
                  Notas e insights
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white dark:bg-[#1a1321] border-2 border-[#4b1d3f]/20 dark:border-[#382b47] rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[#4b1d3f]/15 dark:border-[#382b47] pb-3">
                  <h3 className="font-serif font-bold text-base flex items-center gap-2">
                    <BookOpen
                      size={18}
                      className="text-[#4b1d3f] dark:text-pink-300"
                    />
                    <span>Os Seus Livros & Projetos</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab("projetos")}
                    className="text-xs font-bold text-[#4b1d3f] dark:text-pink-300 hover:underline flex items-center gap-1"
                  >
                    <span>Ver Todos</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
                <div className="space-y-3">
                  {projects.length > 0 ? (
                    projects.slice(0, 3).map((proj) => (
                      <div
                        key={proj.id}
                        onClick={() => setActiveTab("escrita")}
                        className="p-4 bg-stone-50 dark:bg-[#221a2b] border border-stone-200 dark:border-[#382b47] rounded-2xl flex justify-between items-center hover:border-[#4b1d3f]/50 transition-all cursor-pointer group"
                      >
                        <div className="space-y-1">
                          <h4 className="font-serif font-bold text-sm group-hover:text-[#4b1d3f] dark:group-hover:text-pink-300">
                            {proj.title}
                          </h4>
                          <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-[#f3ccde]/60 dark:bg-[#2a2035] text-[#4b1d3f] dark:text-pink-300 px-2 py-0.5 rounded">
                            {proj.genre || "Geral"}
                          </span>
                        </div>
                        <div className="p-2 bg-white dark:bg-[#1a1321] rounded-xl text-stone-600 dark:text-stone-400 group-hover:text-[#4b1d3f] dark:group-hover:text-pink-300 shadow-xs">
                          <ArrowRight size={16} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-stone-600 dark:text-stone-400 text-xs italic">
                      Nenhum livro criado ainda. Vá ao Espaço de Escrita para
                      criar o seu primeiro livro!
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-[#1a1321] border-2 border-[#4b1d3f]/20 dark:border-[#382b47] rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[#4b1d3f] dark:text-pink-300 border-b border-[#4b1d3f]/15 dark:border-[#382b47] pb-3">
                    <ShieldCheck size={20} />
                    <h3 className="font-serif font-bold text-base">
                      Privacidade de Dados
                    </h3>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    A sua conta possui um ecossistema 100% isolado. Nenhuma
                    alteração afetará outras contas.
                  </p>
                </div>
                <div className="p-3 bg-[#f3ccde]/30 dark:bg-[#221a2b] border border-[#4b1d3f]/20 dark:border-[#382b47] rounded-2xl flex items-center gap-3">
                  <div className="p-2 bg-[#f3ccde] dark:bg-[#2a2035] text-[#4b1d3f] dark:text-pink-300 rounded-xl">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Sessão Protegida</p>
                    <span className="text-[10px] text-stone-600 dark:text-stone-400">
                      Dados vinculados à sua conta
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
