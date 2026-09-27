import React from 'react';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

export function SidebarItem({ icon, label, active = false }: SidebarItemProps) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors ${
        active 
          ? 'bg-cozy-card text-cozy-brown font-semibold shadow-sm' 
          : 'hover:bg-cozy-green-light/40 text-amber-50'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}