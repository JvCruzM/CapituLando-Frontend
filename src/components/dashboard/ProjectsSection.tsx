'use client';

import React from 'react';
import { BookOpen, Plus, Edit, Trash2 } from 'lucide-react';

export function ProjectsSection() {
  const projects = [
    {
      id: '1',
      title: 'O Guardião da Floresta',
      genre: 'Fantasia',
      status: 'Em progresso',
      progress: 60,
      chapters: 12,
      words: 24500,
      description: 'Uma jornada mágica sobre segredos antigos e guardiões da natureza.',
    },
    {
      id: '2',
      title: 'Segredos de Algures',
      genre: 'Mistério',
      status: 'Em planejamento',
      progress: 25,
      chapters: 5,
      words: 8200,
      description: 'Investigação em uma cidade isolada onde nada é o que parece.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#f7eee3] p-4 rounded-xl border border-[#d8c2aa]">
        <div className="flex items-center gap-3">
          <BookOpen className="text-[#7a5230]" size={24} />
          <div>
            <h2 className="text-xl font-serif font-bold text-stone-900">Projetos & Livros</h2>
            <p className="text-xs text-stone-600">Acompanhe o progresso de cada manuscrito.</p>
          </div>
        </div>
        <button className="bg-[#385338] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2c422c] flex items-center gap-2">
          <Plus size={16} /> Novo Projeto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((proj) => (
          <div key={proj.id} className="bg-[#f7eee3] border border-[#d8c2aa] rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-200 text-[#7a5230]">
                  {proj.genre}
                </span>
                <h3 className="text-lg font-bold text-stone-900 mt-1 font-serif">{proj.title}</h3>
              </div>
              <div className="flex gap-2 text-stone-500">
                <button className="hover:text-stone-800"><Edit size={16} /></button>
                <button className="hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            </div>

            <p className="text-xs text-stone-700 italic">"{proj.description}"</p>

            <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 bg-[#ebd9c6]/50 rounded-lg border border-[#d8c2aa]/60">
              <div>
                <p className="text-stone-500 text-[10px]">Capítulos</p>
                <p className="font-bold text-stone-800">{proj.chapters}</p>
              </div>
              <div>
                <p className="text-stone-500 text-[10px]">Palavras</p>
                <p className="font-bold text-stone-800">{proj.words.toLocaleString('pt-PT')}</p>
              </div>
              <div>
                <p className="text-stone-500 text-[10px]">Status</p>
                <p className="font-bold text-[#385338]">{proj.status}</p>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-stone-700">
                <span>Progresso Geral</span>
                <span>{proj.progress}%</span>
              </div>
              <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#385338] rounded-full" style={{ width: `${proj.progress}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}