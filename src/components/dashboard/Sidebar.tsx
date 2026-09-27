'use client';

import React from 'react';
import { LayoutDashboard, BookOpen, Users, Calendar, Globe, Feather, Target, Lightbulb } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'painel', label: 'Painel Principal', icon: LayoutDashboard },
    { id: 'projetos', label: 'Projetos/Livros', icon: BookOpen },
    { id: 'personagens', label: 'Personagens', icon: Users },
    { id: 'timeline', label: 'Idade/Timeline', icon: Calendar },
    { id: 'universo', label: 'Universo/Ambientação', icon: Globe },
    { id: 'escrita', label: 'Escrita', icon: Feather },
    { id: 'metas', label: 'Metas', icon: Target },
    { id: 'ideias', label: 'Ideias', icon: Lightbulb },
  ];

  return (
    <aside className="w-64 bg-cozy-green-dark text-stone-100 p-4 flex flex-col justify-between min-h-screen border-r border-stone-700/30">
      <div className="space-y-6">
        {/* Logo / Header */}
        <div className="bg-amber-900/40 border border-amber-500/30 p-3 rounded-xl text-center">
          <span className="text-xs uppercase tracking-widest text-amber-200/80 block font-semibold">
            BEM VINDO AO
          </span>
          <h1 className="text-xl font-serif font-bold text-amber-100 tracking-wide mt-0.5">
            CapituLando
          </h1>
        </div>

        {/* Menu Navigation */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-cozy-card text-stone-900 shadow-sm'
                    : 'text-stone-200 hover:bg-cozy-green-light/50'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Perfil no fundo da barra lateral */}
      <div className="bg-cozy-green-light/40 border border-stone-600/30 p-3 rounded-xl flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-amber-200 text-cozy-brown font-bold flex items-center justify-center text-sm shadow-inner">
          A
        </div>
        <div>
          <h4 className="text-xs font-bold text-stone-100">Advriqum</h4>
          <p className="text-[10px] text-stone-300 italic">"Pense em um enredo forte..."</p>
        </div>
      </div>
    </aside>
  );
}