'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Calendar,
  Globe,
  Feather,
  Target,
  Lightbulb,
  Sparkles,
  User,
  Settings,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const router = useRouter();
  
  const [currentProfileName] = useState<string>(() => {
    if (typeof window === 'undefined') return 'Escritor(a)';
    try {
      const activeProfileId = localStorage.getItem('capitulando_active_profile_id');
      const customProfiles = JSON.parse(localStorage.getItem('capitulando_custom_profiles') || '[]');
      const currentUserName = localStorage.getItem('capitulando_user_name');
      
      const activeCustomProfile = customProfiles.find((p: { id: string }) => p.id === activeProfileId);
      const specificAuthorProfile = activeProfileId ? JSON.parse(localStorage.getItem(`capitulando_${activeProfileId}_author_profile`) || 'null') : null;

      return specificAuthorProfile?.name || activeCustomProfile?.name || currentUserName || 'Escritor(a)';
    } catch {
      return 'Escritor(a)';
    }
  });

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      // Limpa as chaves da sessão de autenticação e perfis
      sessionStorage.removeItem('capitulando_access_token');
      sessionStorage.removeItem('capitulando_user');
      sessionStorage.removeItem('capitulando_active_profile');
      localStorage.removeItem('capitulando_active_profile_id');
      localStorage.removeItem('capitulando_logged_user');
      router.push('/login');
    }
  };

  const menuItems = [
    { id: 'painel', label: 'Painel Principal', icon: LayoutDashboard },
    { id: 'projetos', label: 'Projetos / Livros', icon: BookOpen },
    { id: 'personagens', label: 'Personagens', icon: Users },
    { id: 'timeline', label: 'Timeline / Idade', icon: Calendar },
    { id: 'universo', label: 'Universo / Mundo', icon: Globe },
    { id: 'escrita', label: 'Espaço de Escrita', icon: Feather },
    { id: 'metas', label: 'Metas & Desafios', icon: Target },
    { id: 'ideias', label: 'Bloco de Ideias', icon: Lightbulb },
    { id: 'perfil', label: 'Perfil do Autor', icon: User },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#4b1d3f] dark:bg-[#1a1321] text-stone-100 flex flex-col justify-between p-4 min-h-screen border-r border-[#38142f] dark:border-[#382b47] shadow-lg font-sans transition-colors duration-300 shrink-0">
      <div className="space-y-6">
        <div className="bg-[#38142f]/80 dark:bg-[#221a2b] p-4 rounded-2xl border border-[#f3ccde]/20 text-center space-y-1 shadow-inner">
          <div className="flex items-center justify-center gap-2 text-[#f3ccde] dark:text-pink-300">
            <Sparkles size={18} />
            <span className="text-[10px] font-bold tracking-widest uppercase opacity-90">
              ESCRITÓRIO LITERÁRIO
            </span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-white tracking-wide">
            CapituLando
          </h1>
        </div>

        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-200 text-left ${
                  isActive
                    ? 'bg-[#fcf8f2] text-[#4b1d3f] shadow-md dark:bg-pink-800 dark:text-white font-extrabold translate-x-1'
                    : 'text-stone-200 hover:bg-[#38142f]/60 dark:hover:bg-[#281e33] hover:text-white'
                }`}
              >
                <Icon
                  size={18}
                  className={
                    isActive
                      ? 'text-[#4b1d3f] dark:text-white'
                      : 'text-pink-200/70 dark:text-stone-400'
                  }
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-2">
        <div
          onClick={() => setActiveTab('perfil')}
          className={`p-3.5 rounded-2xl border flex items-center gap-3 shadow-sm cursor-pointer transition-all duration-200 ${
            activeTab === 'perfil'
              ? 'bg-[#fcf8f2] text-[#4b1d3f] border-white dark:bg-pink-800 dark:text-white'
              : 'bg-[#38142f]/90 hover:bg-[#38142f] dark:bg-[#221a2b] dark:hover:bg-[#2a2035] border-[#f3ccde]/20'
          }`}
          title="Ver Perfil do Autor"
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-serif text-lg shrink-0 border ${
              activeTab === 'perfil'
                ? 'bg-[#4b1d3f] text-white border-[#4b1d3f] dark:bg-white dark:text-pink-900'
                : 'bg-[#f3ccde] text-[#4b1d3f] border-[#f3ccde]/40 dark:bg-pink-900 dark:text-pink-100'
            }`}
          >
            {currentProfileName.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden text-xs space-y-0.5">
            <h4
              className={`font-bold truncate font-serif ${
                activeTab === 'perfil' ? 'text-[#4b1d3f] dark:text-white' : 'text-white'
              }`}
            >
              {currentProfileName}
            </h4>
            <p
              className={`text-[10px] italic truncate ${
                activeTab === 'perfil'
                  ? 'text-[#4b1d3f]/80 dark:text-pink-100'
                  : 'text-pink-200/80 dark:text-stone-400'
              }`}
            >
              Conta Ativa
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-200 hover:text-white border border-red-500/20 rounded-xl text-xs font-bold transition-all"
          title="Trocar de conta"
        >
          <LogOut size={16} />
          <span>Sair / Trocar de Conta</span>
        </button>
      </div>
    </aside>
  );
}