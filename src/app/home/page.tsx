"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { CharactersSection } from "@/components/dashboard/CharactersSection";
import { ProjectsSection } from "@/components/dashboard/ProjectsSection";
import { TimelineSection } from "@/components/dashboard/TimelineSection";
import { UniverseSection } from "@/components/dashboard/UniverseSection";
import { WritingSection } from "@/components/dashboard/WritingSection";
import { GoalsSection } from "@/components/dashboard/GoalsSection";
import { IdeasSection } from "@/components/dashboard/IdeasSection";
import { BookOpen, User } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function Page() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("painel");

  const pageBackgrounds: Record<string, string> = {
    painel: "bg-[#f3ccde]",
    projetos: "bg-[#f3ccde]",
    personagens: "bg-[#f3ccde]",
    timeline: "bg-[#f3ccde]",
    universo: "bg-[#f3ccde]",
    escrita: "bg-[#f3ccde]",
    metas: "bg-[#f3ccde]",
    ideias: "bg-[#f3ccde]",
  };

  function handleLogout() {
    window.sessionStorage.removeItem("capitulando_access_token");
    window.sessionStorage.removeItem("capitulando_user");
    router.replace("/login");
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen text-stone-800">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
        />
        <main
          className={`flex-1 space-y-6 overflow-y-auto p-8 transition-colors duration-300 ${pageBackgrounds[activeTab] || "bg-[#ebd9c6]"}`}
        >
          {activeTab === "projetos" && <ProjectsSection />}
          {activeTab === "personagens" && <CharactersSection />}
          {activeTab === "timeline" && <TimelineSection />}
          {activeTab === "universo" && <UniverseSection />}
          {activeTab === "escrita" && <WritingSection />}
          {activeTab === "metas" && <GoalsSection />}
          {activeTab === "ideias" && <IdeasSection />}
          {activeTab === "painel" && (
            <>
              <header className="mb-2 flex items-center justify-between">
                <div>
                  <h1 className="font-serif text-3xl font-bold text-stone-900">
                    Painel Principal
                  </h1>
                  <p className="text-sm text-stone-600">
                    Bem-vindo de volta ao CapituLando.
                  </p>
                </div>
              </header>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-6 md:col-span-2">
                  <div className="space-y-3 rounded-xl border border-[#d8c2aa] bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 border-b border-[#d8c2aa]/60 pb-2 font-serif text-lg font-bold text-[#1e0057]">
                      <BookOpen size={20} />
                      <span>Projetos Atuais</span>
                    </div>
                    <div className="space-y-4 pt-1">
                      <div>
                        <div className="mb-1 flex justify-between text-xs font-semibold text-stone-700">
                          <span>O Guardião da Floresta</span>
                          <span>60% - 12 capítulos</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
                          <div
                            className="h-full rounded-full bg-[#32005c]"
                            style={{ width: "60%" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-3 rounded-xl border border-[#d8c2aa] bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 border-b border-[#1e0057]/60 pb-2 font-serif text-lg font-bold text-[#1e0057]">
                      <User size={20} />
                      <span>Personagem Destaque</span>
                    </div>
                    <div className="flex items-start gap-3 pt-1">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-amber-300 bg-amber-200 text-xl font-bold text-[#7a5230]">
                        A
                      </div>
                      <div className="space-y-1 text-xs">
                        <h3 className="text-sm font-bold text-stone-800">
                          Anya Silva
                        </h3>
                        <p>
                          <strong>Idade:</strong> 23 | <strong>MBTI:</strong>{" "}
                          INFJ
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
