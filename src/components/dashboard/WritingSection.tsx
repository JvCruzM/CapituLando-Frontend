'use client';

import React, { useState } from 'react';
import { PenTool, Save } from 'lucide-react';

export function WritingSection() {
  const [text, setText] = useState(
    'O sol despontava sobre o Vale Encantado quando Anya ajustou o manto em volta do pescoço...'
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#f7eee3] p-4 rounded-xl border border-[#d8c2aa]">
        <div className="flex items-center gap-3">
          <PenTool className="text-[#7a5230]" size={24} />
          <div>
            <h2 className="text-xl font-serif font-bold text-stone-900">Espaço de Escrita</h2>
            <p className="text-xs text-stone-600">Rascunhe sem distrações.</p>
          </div>
        </div>
        <button className="bg-[#385338] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2c422c] flex items-center gap-2">
          <Save size={16} /> Guardar
        </button>
      </div>

      <div className="bg-[#f7eee3] border border-[#d8c2aa] rounded-xl p-6 shadow-sm">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          className="w-full bg-transparent resize-none outline-none font-serif text-stone-800 text-sm leading-relaxed"
          placeholder="Comece a escrever aqui..."
        />
        <div className="border-t border-[#d8c2aa]/60 pt-3 mt-3 flex justify-between text-xs text-stone-500 font-sans">
          <span>Palavras: {text.trim() ? text.trim().split(/\s+/).length : 0}</span>
          <span>Caracteres: {text.length}</span>
        </div>
      </div>
    </div>
  );
}