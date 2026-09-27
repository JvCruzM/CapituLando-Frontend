import React from 'react';

interface CardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export function Card({ title, icon, children }: CardProps) {
  return (
    <div className="bg-cozy-card border-2 border-cozy-card-border rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3 text-cozy-brown font-bold border-b border-cozy-card-border/60 pb-2">
        {icon}
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}