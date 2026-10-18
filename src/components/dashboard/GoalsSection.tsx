'use client';

import React, { useState, useEffect } from 'react';
import { Target, Plus, Edit2, Trash2, CheckCircle2, Circle, X, Check } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  completed: boolean;
}

export function GoalsSection() {
  const [goals, setGoals] = useState<Goal[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('capitulando_goals');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('capitulando_goals', JSON.stringify(goals));
    }
  }, [goals]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialForm = { title: '', current: 0, target: 10, unit: 'capítulos' };
  const [formData, setFormData] = useState(initialForm);

  const handleOpenModal = (goal?: Goal) => {
    if (goal) {
      setEditingId(goal.id);
      setFormData({ title: goal.title, current: goal.current, target: goal.target, unit: goal.unit });
    } else {
      setEditingId(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const current = Number(formData.current) || 0;
    const target = Number(formData.target) || 1;
    const completed = current >= target;

    const newGoal: Goal = {
      id: editingId || Date.now().toString(),
      title: formData.title || 'Nova Meta',
      current,
      target,
      unit: formData.unit || 'itens',
      completed,
    };

    setGoals((prev) => editingId ? prev.map((g) => (g.id === editingId ? newGoal : g)) : [...prev, newGoal]);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem a certeza de que deseja eliminar esta meta?')) {
      setGoals((prev) => prev.filter((g) => g.id !== id));
    }
  };

  const handleToggle = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const completed = !g.completed;
          return { ...g, completed, current: completed ? g.target : g.current };
        }
        return g;
      })
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {/* CABEÇALHO */}
      <div className="bg-[#fcf8f2] dark:bg-[#1a1321] p-5 rounded-3xl border border-[#4b1d3f]/20 dark:border-[#382b47] flex justify-between items-center shadow-xs transition-colors duration-300">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#f3ccde]/40 dark:bg-[#2a2035] text-[#4b1d3f] dark:text-pink-300 rounded-2xl border border-[#4b1d3f]/20 dark:border-[#382b47]">
            <Target size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100">Metas & Desafios</h2>
            <p className="text-xs text-stone-600 dark:text-stone-400">Acompanhe e conquiste os seus objetivos literários.</p>
          </div>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-[#4b1d3f] hover:bg-[#38142f] dark:bg-pink-800 dark:hover:bg-pink-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all">
          <Plus size={16} /> Nova Meta
        </button>
      </div>

      {/* LISTA DE METAS */}
      <div className="space-y-4">
        {goals.map((goal) => {
          const pct = Math.min(Math.round((goal.current / (goal.target || 1)) * 100), 100);
          return (
            <div key={goal.id} className={`bg-[#fcf8f2] dark:bg-[#1a1321] border rounded-3xl p-5 shadow-xs space-y-3 transition-colors duration-300 ${goal.completed ? 'border-emerald-600/40 bg-emerald-50/10 dark:bg-emerald-950/10' : 'border-[#4b1d3f]/20 dark:border-[#382b47]'}`}>
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => handleToggle(goal.id)} className="text-[#4b1d3f] dark:text-pink-300 hover:scale-110 transition-transform">
                    {goal.completed ? <CheckCircle2 size={24} className="text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950" /> : <Circle size={24} className="text-stone-400 dark:text-stone-500" />}
                  </button>
                  <div>
                    <h3 className={`text-sm font-bold font-serif ${goal.completed ? 'line-through text-stone-400 dark:text-stone-500' : 'text-stone-900 dark:text-stone-100'}`}>{goal.title}</h3>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Progresso: {goal.current} / {goal.target} {goal.unit} ({pct}%)</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleOpenModal(goal)} className="p-1.5 text-stone-400 hover:text-[#4b1d3f] dark:hover:text-pink-300 rounded-lg transition-colors"><Edit2 size={15} /></button>
                  <button onClick={() => handleDelete(goal.id)} className="p-1.5 text-red-400 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={15} /></button>
                </div>
              </div>

              {/* BARRA DE PROGRESSO */}
              <div className="w-full h-2.5 bg-stone-200 dark:bg-[#2a2035] rounded-full overflow-hidden border border-stone-300/40 dark:border-[#382b47]">
                <div className={`h-full rounded-full transition-all duration-500 ${goal.completed ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-[#4b1d3f] dark:bg-pink-700'}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="text-center py-12 bg-[#fcf8f2] dark:bg-[#1a1321] rounded-3xl border border-dashed border-[#4b1d3f]/20 dark:border-[#382b47] text-stone-500 dark:text-stone-400 space-y-2">
            <Target size={32} className="mx-auto text-stone-400 dark:text-stone-600" />
            <p className="text-xs font-semibold">Nenhuma meta registada.</p>
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#fcf8f2] dark:bg-[#1a1321] border border-[#4b1d3f]/30 dark:border-[#382b47] rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 text-stone-900 dark:text-stone-100">
            <div className="flex justify-between items-center border-b border-[#4b1d3f]/20 dark:border-[#382b47] pb-3">
              <h3 className="font-bold font-serif text-lg">{editingId ? 'Editar Meta' : 'Nova Meta / Desafio'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Título da Meta</label>
                <input type="text" required placeholder="Ex: Escrever o Primeiro Capítulo" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-2.5 bg-white dark:bg-[#221a2b] border border-stone-300 dark:border-[#382b47] rounded-xl text-stone-800 dark:text-stone-100 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Valor Atual</label>
                  <input type="number" min="0" value={formData.current} onChange={(e) => setFormData({ ...formData, current: Number(e.target.value) })} className="w-full p-2.5 bg-white dark:bg-[#221a2b] border border-stone-300 dark:border-[#382b47] rounded-xl text-stone-800 dark:text-stone-100 focus:outline-none" />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Valor Alvo</label>
                  <input type="number" min="1" required value={formData.target} onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })} className="w-full p-2.5 bg-white dark:bg-[#221a2b] border border-stone-300 dark:border-[#382b47] rounded-xl text-stone-800 dark:text-stone-100 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Unidade</label>
                <input type="text" placeholder="Ex: capítulos, palavras" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="w-full p-2.5 bg-white dark:bg-[#221a2b] border border-stone-300 dark:border-[#382b47] rounded-xl text-stone-800 dark:text-stone-100 focus:outline-none" />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#4b1d3f]/20 dark:border-[#382b47]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-xl font-semibold">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-[#4b1d3f] dark:bg-pink-800 text-white rounded-xl font-bold flex items-center gap-1"><Check size={16} /> Salvar Meta</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}