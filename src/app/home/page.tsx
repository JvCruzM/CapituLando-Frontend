'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { CharactersSection } from '@/components/dashboard/CharactersSection';
import { ProjectsSection } from '@/components/dashboard/ProjectsSection';
import { TimelineSection } from '@/components/dashboard/TimelineSection';
import { UniverseSection } from '@/components/dashboard/UniverseSection';
import { WritingSection } from '@/components/dashboard/WritingSection';
import { GoalsSection } from '@/components/dashboard/GoalsSection';
import { IdeasSection } from '@/components/dashboard/IdeasSection';
import { BookOpen, User } from 'lucide-react';

export default function Page() {
  const [activeTab, setActiveTab] = useState<string>('painel');

  const pageBackgrounds: Record<string, string> = {
    painel: 'bg-[#f3ccde]',
    projetos: 'bg-[#f3ccde]',
    personagens: 'bg-[#f3ccde]',
    timeline: 'bg-[#f3ccde]',
    universo: 'bg-[#f3ccde]',
    escrita: 'bg-[#f3ccde]',
    metas: 'bg-[#f3ccde]',
    ideias: 'bg-[#f3ccde]',
  };

  return (
    <div className="flex min-h-screen text-stone-800">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className={`flex-1 p-8 space-y-6 overflow-y-auto transition-colors duration-300 ${pageBackgrounds[activeTab] || 'bg-[#ebd9c6]'}`}>
        {activeTab === 'projetos' && <ProjectsSection />}
        {activeTab === 'personagens' && <CharactersSection />}
        {activeTab === 'timeline' && <TimelineSection />}
        {activeTab === 'universo' && <UniverseSection />}
        {activeTab === 'escrita' && <WritingSection />}
        {activeTab === 'metas' && <GoalsSection />}
        {activeTab === 'ideias' && <IdeasSection />}

        {activeTab === 'painel' && (
          <>
            <header className="flex justify-between items-center mb-2">
              <div>
                <h1 className="text-3xl font-bold text-stone-900 font-serif">Painel Principal</h1>
                <p className="text-stone-600 text-sm">Bem-vindo de volta ao CapituLando.</p>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="bg-[#ffffff] border border-[#d8c2aa] rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 font-serif font-bold text-lg text-[#1e0057] border-b border-[#d8c2aa]/60 pb-2">
                    <BookOpen size={20} />
                    <span>Projetos Atuais</span>
                  </div>
                  <div className="space-y-4 pt-1">
                    <div>
                      <div className="flex justify-between text-xs mb-1 font-semibold text-stone-700">
                        <span>O Guardião da Floresta</span>
                        <span>60% - 12 capítulos</span>
                      </div>
                      <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#32005c] rounded-full" style={{ width: '60%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-[#ffffff] border border-[#d8c2aa] rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 font-serif font-bold text-lg text-[#1e0057] border-b border-[#1e0057]/60 pb-2">
                    <User size={20} />
                    <span>Personagem Destaque</span>
                  </div>
                  <div className="flex gap-3 items-start pt-1">
                    <div className="w-12 h-12 bg-amber-200 border border-amber-300 rounded-lg flex items-center justify-center font-bold text-[#7a5230] text-xl">
                      A
                    </div>
                    <div className="text-xs space-y-1">
                      <h3 className="font-bold text-stone-800 text-sm">Anya Silva</h3>
                      <p><strong>Idade:</strong> 23 | <strong>MBTI:</strong> INFJ</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}