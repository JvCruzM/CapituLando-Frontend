'use client';

import React from 'react';
import { Globe, Plus, MapPin } from 'lucide-react';

export function UniverseSection() {
  const locations = [
    { name: 'Vale Encantado', region: 'Norte', desc: 'Região montanhosa rica em minério arcano e florestas densas.' },
    { name: 'Cachoeira do Mistério', region: 'Sul', desc: 'Locus mágico onde os rituais de passagem são efetuados.' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#f7eee3] p-4 rounded-xl border border-[#d8c2aa]">
        <div className="flex items-center gap-3">
          <Globe className="text-[#7a5230]" size={24} />
          <div>
            <h2 className="text-xl font-serif font-bold text-stone-900">Universo & Ambientação</h2>
            <p className="text-xs text-stone-600">Worldbuilding, regre de magia e locais importantes.</p>
          </div>
        </div>
        <button className="bg-[#385338] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2c422c] flex items-center gap-2">
          <Plus size={16} /> Novo Local / Regra
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {locations.map((loc, i) => (
          <div key={i} className="bg-[#f7eee3] border border-[#d8c2aa] rounded-xl p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-[#385338] font-bold font-serif text-lg">
              <MapPin size={18} />
              <span>{loc.name}</span>
            </div>
            <span className="text-[10px] font-bold uppercase bg-stone-200 px-2 py-0.5 rounded text-stone-700 inline-block">
              Região: {loc.region}
            </span>
            <p className="text-xs text-stone-700 mt-2">{loc.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}