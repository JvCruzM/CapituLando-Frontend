'use client';

import React from 'react';
import { Target, Plus } from 'lucide-react';

export function GoalsSection() {
  const goals = [
    { title: 'Concluir Rascunho do Livro 1', target: '100 capitulos', current: '75 capítulos', progress: 75 },
    { title: 'Fichas de Personagens Secundários', target: '8 fichas', current: '5 fichas', progress: 62 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#f7eee3] p-4 rounded-xl border border-[#d8c2aa]">
        <div className="flex items-center gap-3">
          <Target className="text-[#7a5230]" size={24} />
          <div>
            <h2 className="text-xl font-serif font-bold text-stone-900">Metas & Desafios</h2>
            <p className="text-xs text-stone-600">Acompanhe seus objetivos literários.</p>
          </div>
        </div>
        <button className="bg-[#385338] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2c422c] flex items-center gap-2">
          <Plus size={16} /> Nova Meta
        </button>
      </div>

      <div className="space-y-4">
        {goals.map((goal, i) => (
          <div key={i} className="bg-[#f7eee3] border border-[#d8c2aa] rounded-xl p-5 shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-stone-900 font-serif text-md">{goal.title}</h3>
              <span className="text-xs text-stone-600">{goal.current} / {goal.target}</span>
            </div>
            <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#385338] rounded-full" style={{ width: `${goal.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}