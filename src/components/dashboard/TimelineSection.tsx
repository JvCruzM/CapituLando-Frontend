"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { loadWritingProjects } from "@/lib/writing-api";

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

export function TimelineSection() {
  const [projects, setProjects] = useState<ProjectMinimal[]>([]);

  useEffect(() => {
    loadWritingProjects()
      .then((loaded) => {
        setProjects(loaded.map(({ id, title }) => ({ id, title })));
      })
      .catch(() => setProjects([]));
  }, []);

  const [events, setEvents] = useState<TimelineEvent[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("capitulando_timeline_events");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "capitulando_timeline_events",
        JSON.stringify(events),
      );
    }
  }, [events]);

  const [selectedProjectId, setSelectedProjectId] = useState(
    () => projects[0]?.id || "1",
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const initialForm = {
    yearOrDate: "Ano 1050",
    title: "",
    characters: "",
    description: "",
  };
  const [formData, setFormData] = useState(initialForm);

  const projectEvents = events.filter(
    (e) => (e.projectId || "1") === selectedProjectId,
  );
  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const handleOpenModal = (event?: TimelineEvent) => {
    if (event) {
      setEditingEventId(event.id);
      setFormData({
        yearOrDate: event.yearOrDate,
        title: event.title,
        characters: event.characters,
        description: event.description,
      });
    } else {
      setEditingEventId(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: TimelineEvent = {
      id: editingEventId || Date.now().toString(),
      projectId: selectedProjectId,
      yearOrDate: formData.yearOrDate || "Sem data",
      title: formData.title || "Evento sem título",
      characters: formData.characters || "Geral",
      description: formData.description || "",
    };
    setEvents((prev) =>
      editingEventId
        ? prev.map((item) => (item.id === editingEventId ? newEvent : item))
        : [newEvent, ...prev],
    );
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* CABEÇALHO */}
      <div className="bg-[#fcf8f2] dark:bg-[#1a1321] p-5 rounded-3xl border border-[#4b1d3f]/20 dark:border-[#382b47] flex flex-col md:flex-row justify-between items-center gap-4 shadow-xs transition-colors duration-300">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#f3ccde]/40 dark:bg-[#2a2035] text-[#4b1d3f] dark:text-pink-300 rounded-2xl border border-[#4b1d3f]/20 dark:border-[#382b47]">
            <Calendar size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100">
              Linha do Tempo & Cronologia
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Organize os acontecimentos por ordem cronológica por projeto.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 bg-white dark:bg-[#221a2b] px-3.5 py-2 rounded-xl border border-[#4b1d3f]/20 dark:border-[#382b47] shadow-xs flex-1 md:flex-none">
            <BookOpen
              size={16}
              className="text-[#4b1d3f] dark:text-pink-300 shrink-0"
            />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-xs font-bold text-stone-800 dark:text-stone-200 focus:outline-none cursor-pointer w-full"
            >
              {projects.map((p) => (
                <option
                  key={p.id}
                  value={p.id}
                  className="bg-[#fcf8f2] dark:bg-[#221a2b] text-stone-900 dark:text-stone-100"
                >
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-[#4b1d3f] hover:bg-[#38142f] dark:bg-pink-800 dark:hover:bg-pink-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm shrink-0 transition-all"
          >
            <Plus size={16} /> Novo Evento
          </button>
        </div>
      </div>

      {/* LINHA DO TEMPO */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#4b1d3f]/30 dark:before:bg-[#382b47]">
        {projectEvents.map((event) => (
          <div key={event.id} className="relative group">
            {/* Ponto indicador na linha */}
            <div className="absolute -left-[21px] top-5 w-3.5 h-3.5 rounded-full bg-[#4b1d3f] dark:bg-pink-400 border-2 border-[#fcf8f2] dark:border-[#120e17] shadow-xs group-hover:scale-125 transition-transform" />

            <div className="bg-[#fcf8f2] dark:bg-[#1a1321] border border-[#4b1d3f]/20 dark:border-[#382b47] rounded-3xl p-5 shadow-xs space-y-3 transition-colors duration-300">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#f3ccde]/60 dark:bg-[#2a2035] text-[#4b1d3f] dark:text-pink-300 px-2.5 py-0.5 rounded-md inline-block mb-1.5 border border-[#4b1d3f]/15 dark:border-[#382b47]">
                    {event.yearOrDate}
                  </span>
                  <h3 className="text-base font-bold font-serif text-stone-900 dark:text-stone-100">
                    {event.title}
                  </h3>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenModal(event)}
                    className="p-1.5 text-stone-400 hover:text-[#4b1d3f] dark:hover:text-pink-300 rounded-lg transition-colors"
                    title="Editar Evento"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() =>
                      confirm(
                        "Tem a certeza de que deseja excluir este evento?",
                      ) &&
                      setEvents((prev) => prev.filter((i) => i.id !== event.id))
                    }
                    className="p-1.5 text-red-400 hover:text-red-500 rounded-lg transition-colors"
                    title="Excluir Evento"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {event.characters && (
                <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400">
                  <User
                    size={14}
                    className="text-[#4b1d3f] dark:text-pink-300 shrink-0"
                  />
                  <span>
                    <strong>Personagens:</strong> {event.characters}
                  </span>
                </div>
              )}

              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed pt-2 border-t border-stone-200 dark:border-[#382b47] whitespace-pre-wrap font-serif">
                {event.description}
              </p>
            </div>
          </div>
        ))}

        {projectEvents.length === 0 && (
          <div className="bg-[#fcf8f2] dark:bg-[#1a1321] border border-dashed border-[#4b1d3f]/20 dark:border-[#382b47] rounded-3xl p-10 text-center text-stone-500 dark:text-stone-400 space-y-2">
            <Clock
              size={32}
              className="mx-auto text-stone-400 dark:text-stone-600"
            />
            <p className="text-xs font-semibold">
              Nenhum evento registrado ainda para &ldquo;
              {selectedProject?.title}&rdquo;.
            </p>
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#fcf8f2] dark:bg-[#1a1321] border border-[#4b1d3f]/30 dark:border-[#382b47] rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 text-stone-900 dark:text-stone-100">
            <div className="flex justify-between items-center border-b border-[#4b1d3f]/20 dark:border-[#382b47] pb-3">
              <h3 className="font-bold font-serif text-lg">
                {editingEventId ? "Editar Evento" : "Novo Evento"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Ano / Data / Época
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.yearOrDate}
                    onChange={(e) =>
                      setFormData({ ...formData, yearOrDate: e.target.value })
                    }
                    className="w-full p-2.5 bg-white dark:bg-[#221a2b] border border-stone-300 dark:border-[#382b47] rounded-xl text-stone-800 dark:text-stone-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Título do Evento
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full p-2.5 bg-white dark:bg-[#221a2b] border border-stone-300 dark:border-[#382b47] rounded-xl text-stone-800 dark:text-stone-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Personagens Envolvidos
                </label>
                <input
                  type="text"
                  value={formData.characters}
                  onChange={(e) =>
                    setFormData({ ...formData, characters: e.target.value })
                  }
                  placeholder="Ex: Gabriel, Elena..."
                  className="w-full p-2.5 bg-white dark:bg-[#221a2b] border border-stone-300 dark:border-[#382b47] rounded-xl text-stone-800 dark:text-stone-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Descrição do Evento
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Escreva os detalhes do acontecimento..."
                  className="w-full p-2.5 bg-white dark:bg-[#221a2b] border border-stone-300 dark:border-[#382b47] rounded-xl text-stone-800 dark:text-stone-100 focus:outline-none resize-y"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#4b1d3f]/20 dark:border-[#382b47]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4b1d3f] dark:bg-pink-800 text-white rounded-xl font-bold flex items-center gap-1 shadow-xs"
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
