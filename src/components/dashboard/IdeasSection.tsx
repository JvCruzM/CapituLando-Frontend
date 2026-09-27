'use client';

import React from 'react';
import { Lightbulb, Plus } from 'lucide-react';

export function IdeasSection() {
  const ideas = [
    'Criar uma reviravolta no Capítulo 15 onde Ben revela o seu passado.',
    'Símbolos mágicos baseados nas estações do ano.',
    'Cena da tempestade no mar de neblina.',
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#f7eee3] p-4 rounded-xl border border-[#d8c2aa]">
        <div className="flex items-center gap-3">
          <Lightbulb className="text-[#7a5230]" size={24} />
          <div>
            <h2 className="text-xl font-serif font-bold text-stone-900">Bloco de Ideias</h2>
            <p className="text-xs text-stone-600">Anote pensamentos e insights sem perder o foco.</p>
          </div>
        </div>
        <button className="bg-[#385338] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2c422c] flex items-center gap-2">
          <Plus size={16} /> Nova Ideia
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ideas.map((idea, i) => (
          <div key={i} className="bg-[#f7eee3] border border-[#d8c2aa] rounded-xl p-4 shadow-sm text-xs text-stone-800 space-y-2">
            <p className="italic">"{idea}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}