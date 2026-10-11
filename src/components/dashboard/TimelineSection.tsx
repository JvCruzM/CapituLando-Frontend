'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  User,
  BookOpen,
  Clock,
} from 'lucide-react';

interface TimelineEvent {
  id: string;
  projectId: string;
  yearOrDate: string;
  title: string;
  characters: string;
  description: string;
}

interface ProjectMinimal {
  id: string;
  title: string;
}

const DEFAULT_PROJECTS: ProjectMinimal[] = [
  { id: '1', title: 'O Guardião da Floresta' },
  { id: '2', title: 'Segredos de Algures' },
];

const DEFAULT_EVENTS: TimelineEvent[] = [
  {
    id: 'e1',
    projectId: '1',
    yearOrDate: 'Ano 1020',
    title: 'O Grande Eclipse',
    characters: 'Anya',
    description: 'Nascimento sob o sinal dos astros e a revelação da profecia.',
  },
  {
    id: 'e2',
    projectId: '1',
    yearOrDate: 'Ano 1038',
    title: 'Incêndio na Vila',
    characters: 'Ben Thorne',
    description: 'Perda dos pais de Ben e encontro inicial com os guardiões.',
  },
  {
    id: 'e3',
    projectId: '1',
    yearOrDate: 'Ano 1043',
    title: 'A Iniciação',
    characters: 'Anya & Ben',
    description: 'Entrada oficial na Academia Arcana e juramento de proteção.',
  },
];

export function TimelineSection() {
  // Carrega lista de projetos do localStorage para vincular à linha do tempo
  const [projects, setProjects] = useState<ProjectMinimal[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('capitulando_projects');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.length > 0) {
            return parsed.map((p: any) => ({ id: p.id, title: p.title }));
          }
        } catch (e) {
          console.error('Erro ao ler projetos do localStorage', e);
        }
      }
    }
    return DEFAULT_PROJECTS;
  });

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    () => projects[0]?.id || '1'
  );

  // Carrega lista de eventos do localStorage
  const [events, setEvents] = useState<TimelineEvent[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('capitulando_timeline_events');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Erro ao ler eventos da linha do tempo', e);
        }
      }
    }
    return DEFAULT_EVENTS;
  });

  // Salva eventos no localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('capitulando_timeline_events', JSON.stringify(events));
    }
  }, [events]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    yearOrDate: '',
    title: '',
    characters: '',
    description: '',
  });

  // Eventos filtrados para o projeto selecionado
  const projectEvents = events.filter((e) => e.projectId === selectedProjectId);

  const handleOpenCreate = () => {
    setEditingEventId(null);
    setFormData({
      yearOrDate: 'Ano 1050',
      title: '',
      characters: '',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (event: TimelineEvent) => {
    setEditingEventId(event.id);
    setFormData({
      yearOrDate: event.yearOrDate,
      title: event.title,
      characters: event.characters,
      description: event.description,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const newEvent: TimelineEvent = {
      id: editingEventId || Date.now().toString(),
      projectId: selectedProjectId,
      yearOrDate: formData.yearOrDate || 'Sem data',
      title: formData.title || 'Evento sem título',
      characters: formData.characters || 'Geral',
      description: formData.description || '',
    };

    if (editingEventId) {
      setEvents((prev) =>
        prev.map((item) => (item.id === editingEventId ? newEvent : item))
      );
    } else {
      setEvents((prev) => [...prev, newEvent]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este evento da linha do tempo?')) {
      setEvents((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div className="space-y-6 font-sans">
      {/* Cabeçalho */}
      <div className="bg-[#f7eee3] p-5 rounded-2xl border-2 border-[#d8c2aa] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#ebd9c6] text-[#385338] rounded-xl border border-[#d8c2aa]">
            <Calendar size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-stone-900">
              Linha do Tempo & Idades
            </h2>
            <p className="text-xs text-stone-600">
              Organize os eventos cronológicos do seu enredo por projeto.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Seletor de Projeto */}
          <div className="flex items-center gap-2 bg-[#ffffff] px-3 py-2 rounded-xl border border-[#d8c2aa] shadow-sm flex-1 md:flex-none">
            <BookOpen size={16} className="text-[#385338]" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-xs font-bold text-stone-800 focus:outline-none cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleOpenCreate}
            className="bg-[#385338] hover:bg-[#2c422c] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 shrink-0"
          >
            <Plus size={16} />
            <span>Novo Evento</span>
          </button>
        </div>
      </div>

      {/* Lista / Timeline de Eventos */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-1 before:bg-[#385338]/40">
        {projectEvents.map((event) => (
          <div key={event.id} className="relative group">
            {/* Marcador na linha */}
            <div className="absolute -left-[19px] top-6 w-4 h-4 rounded-full bg-[#385338] border-2 border-white shadow-sm group-hover:scale-125 transition-transform" />

            {/* Cartão de Evento */}
            <div className="bg-[#f7eee3] border-2 border-[#d8c2aa] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative space-y-2">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-xs font-bold text-[#385338] block mb-1">
                    {event.yearOrDate}
                  </span>
                  <h3 className="text-lg font-bold font-serif text-stone-900">
                    {event.title}
                  </h3>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(event)}
                    className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-[#ebd9c6] rounded-lg transition-colors"
                    title="Editar Evento"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                    title="Excluir Evento"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {event.characters && (
                <div className="flex items-center gap-1.5 text-xs text-stone-600">
                  <User size={14} className="text-[#385338]" />
                  <span>
                    <strong>Personagens:</strong> {event.characters}
                  </span>
                </div>
              )}

              <p className="text-xs text-stone-700 leading-relaxed pt-1 border-t border-[#d8c2aa]/40">
                {event.description}
              </p>
            </div>
          </div>
        ))}

        {projectEvents.length === 0 && (
          <div className="bg-[#f7eee3] border-2 border-dashed border-[#d8c2aa] rounded-2xl p-10 text-center text-stone-500 space-y-2">
            <Clock size={36} className="mx-auto text-stone-400" />
            <p className="text-sm font-semibold">
              Nenhum evento registrado para "{selectedProject?.title}".
            </p>
            <p className="text-xs text-stone-400">
              Clique em "Novo Evento" para começar a estruturar a cronologia deste livro.
            </p>
          </div>
        )}
      </div>

      {/* Modal de Criar / Editar Evento */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#f7eee3] border-2 border-[#d8c2aa] rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#d8c2aa] pb-3">
              <h3 className="font-bold font-serif text-lg text-stone-900">
                {editingEventId ? 'Editar Evento' : 'Novo Evento na Linha do Tempo'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-500 hover:text-stone-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Ano / Data / Época
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ano 1020, Cap. 3, Verão..."
                    value={formData.yearOrDate}
                    onChange={(e) =>
                      setFormData({ ...formData, yearOrDate: e.target.value })
                    }
                    className="w-full p-2.5 bg-white border border-[#d8c2aa] rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#385338]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Título do Evento
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: O Grande Eclipse"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full p-2.5 bg-white border border-[#d8c2aa] rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#385338]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Personagens Envolvidos
                </label>
                <input
                  type="text"
                  placeholder="Ex: Anya & Ben"
                  value={formData.characters}
                  onChange={(e) =>
                    setFormData({ ...formData, characters: e.target.value })
                  }
                  className="w-full p-2.5 bg-white border border-[#d8c2aa] rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#385338]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Descrição do Acontecimento
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Descreva o que acontece neste momento do enredo..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full p-2.5 bg-white border border-[#d8c2aa] rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#385338]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#d8c2aa]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#385338] hover:bg-[#2c422c] text-white rounded-xl font-bold flex items-center gap-1 shadow-sm"
                >
                  <Check size={16} /> Salvar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}