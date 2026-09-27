'use client';

import React from 'react';
import { Calendar, Plus } from 'lucide-react';

export function TimelineSection() {
  const events = [
    { year: 'Ano 1020', title: 'O Grande Eclipse', character: 'Anya', description: 'Nascimento sob o sinal dos astros e a revelação da profecia.' },
    { year: 'Ano 1038', title: 'Incêndio na Vila', character: 'Ben Thorne', description: 'Perda dos pais de Ben e encontro inicial com os guardiões.' },
    { year: 'Ano 1043', title: 'A Iniciação', character: 'Anya & Ben', description: 'Entrada oficial na Academia Arcana e juramento de proteção.' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#f7eee3] p-4 rounded-xl border border-[#d8c2aa]">
        <div className="flex items-center gap-3">
          <Calendar className="text-[#7a5230]" size={24} />
          <div>
            <h2 className="text-xl font-serif font-bold text-stone-900">Linha do Tempo & Idades</h2>
            <p className="text-xs text-stone-600">Organize os eventos cronológicos do seu enredo.</p>
          </div>
        </div>
        <button className="bg-[#385338] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2c422c] flex items-center gap-2">
          <Plus size={16} /> Novo Evento
        </button>
      </div>

      <div className="relative border-l-2 border-[#385338] ml-4 pl-6 space-y-6">
        {events.map((evt, idx) => (
          <div key={idx} className="relative bg-[#f7eee3] border border-[#d8c2aa] rounded-xl p-4 shadow-sm">
            <span className="absolute -left-[31px] top-4 w-4 h-4 rounded-full bg-[#385338] border-2 border-[#ebd9c6]" />
            <span className="text-xs font-bold text-[#7a5230]">{evt.year}</span>
            <h3 className="text-md font-bold text-stone-900 font-serif">{evt.title}</h3>
            <p className="text-xs font-semibold text-stone-600 mt-0.5">Personagens: {evt.character}</p>
            <p className="text-xs text-stone-700 mt-2">{evt.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}