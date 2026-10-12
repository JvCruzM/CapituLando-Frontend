"use client";

import {
  LayoutDashboard,
  BookOpen,
  Users,
  Calendar,
  Globe,
  Feather,
  Target,
  Lightbulb,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export function Sidebar({ activeTab, setActiveTab, onLogout }: SidebarProps) {
  const menuItems = [
    { id: "painel", label: "Painel Principal", icon: LayoutDashboard },
    { id: "projetos", label: "Projetos/Livros", icon: BookOpen },
    { id: "personagens", label: "Personagens", icon: Users },
    { id: "timeline", label: "Idade/Timeline", icon: Calendar },
    { id: "universo", label: "Universo/Ambientação", icon: Globe },
    { id: "escrita", label: "Escrita", icon: Feather },
    { id: "metas", label: "Metas", icon: Target },
    { id: "ideias", label: "Ideias", icon: Lightbulb },
  ];

  return (
    <aside className="flex min-h-screen w-64 flex-col justify-between border-r border-stone-700/30 bg-cozy-green-dark p-4 text-stone-100">
      <div className="space-y-6">
        <div className="rounded-xl border border-amber-500/30 bg-amber-900/40 p-3 text-center">
          <span className="block text-xs font-semibold uppercase tracking-widest text-amber-200/80">
            BEM VINDO AO
          </span>
          <h1 className="mt-0.5 font-serif text-xl font-bold tracking-wide text-amber-100">
            CapituLando
          </h1>
        </div>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-cozy-card text-stone-900 shadow-sm" : "text-stone-200 hover:bg-cozy-green-light/50"}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-xl border border-stone-600/30 bg-cozy-green-light/40 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-200 text-sm font-bold text-cozy-brown shadow-inner">
            C
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-100">CapituLando</h4>
            <p className="text-[10px] italic text-stone-300">
              Seu espaço de escrita
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-200 transition-colors hover:bg-red-900/40 hover:text-white"
        >
          <LogOut size={18} />
          <span>Sair da conta</span>
        </button>
      </div>
    </aside>
  );
}
