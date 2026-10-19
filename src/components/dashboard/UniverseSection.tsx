"use client";

import Image from "next/image";

import React, { useState, useEffect } from "react";
import {
  Globe,
  Plus,
  Search,
  MapPin,
  Sparkles,
  BookMarked,
  Shield,
  Edit2,
  Trash2,
  X,
  Check,
  BookOpen,
} from "lucide-react";
import { loadWritingProjects } from "@/lib/writing-api";

interface UniverseConcept {
  id: string;
  projectId: string;
  title: string;
  category: "Local" | "Regra de Magia" | "Lore / História" | "Organização";
  region?: string;
  description: string;
  notes?: string;
  imageUrl?: string;
}

interface ProjectMinimal {
  id: string;
  title: string;
  genre: string;
}

export function UniverseSection() {
  const [projects, setProjects] = useState<ProjectMinimal[]>([]);

  useEffect(() => {
    loadWritingProjects()
      .then((loaded) => {
        setProjects(
          loaded.map(({ id, title, genre }) => ({
            id,
            title,
            genre: genre || "Geral",
          })),
        );
      })
      .catch(() => setProjects([]));
  }, []);

  const [concepts, setConcepts] = useState<UniverseConcept[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("capitulando_universe_concepts");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "capitulando_universe_concepts",
        JSON.stringify(concepts),
      );
    }
  }, [concepts]);

  const [selectedProjectId, setSelectedProjectId] = useState(
    () => projects[0]?.id || "1",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingConcept, setViewingConcept] = useState<UniverseConcept | null>(
    null,
  );

  const initialForm = {
    title: "",
    category: "Local" as UniverseConcept["category"],
    region: "Geral",
    description: "",
    notes: "",
    imageUrl: "",
  };
  const [formData, setFormData] = useState(initialForm);

  const categories = [
    "Todos",
    "Local",
    "Regra de Magia",
    "Lore / História",
    "Organização",
  ];

  const getIcon = (cat: string) => {
    if (cat === "Local") return <MapPin size={14} />;
    if (cat === "Regra de Magia") return <Sparkles size={14} />;
    if (cat === "Lore / História") return <BookMarked size={14} />;
    if (cat === "Organização") return <Shield size={14} />;
    return <Globe size={14} />;
  };

  const filteredConcepts = concepts.filter((item) => {
    const matchProj = (item.projectId || "1") === selectedProjectId;
    const matchSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat =
      selectedCategory === "Todos" || item.category === selectedCategory;
    return matchProj && matchSearch && matchCat;
  });

  const handleOpenModal = (concept?: UniverseConcept, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (concept) {
      setEditingId(concept.id);
      setFormData({
        title: concept.title,
        category: concept.category,
        region: concept.region || "",
        description: concept.description,
        notes: concept.notes || "",
        imageUrl: concept.imageUrl || "",
      });
    } else {
      setEditingId(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const item: UniverseConcept = {
      id: editingId || Date.now().toString(),
      projectId: selectedProjectId,
      ...formData,
    };
    setConcepts((prev) =>
      editingId
        ? prev.map((c) => (c.id === editingId ? item : c))
        : [item, ...prev],
    );
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Eliminar este conceito?")) {
      setConcepts((prev) => prev.filter((c) => c.id !== id));
      if (viewingConcept?.id === id) setViewingConcept(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-[#f3ccde]/60 dark:bg-[#221a2b] p-5 rounded-2xl border-2 border-[#4b1d3f]/20 dark:border-[#382b47] flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#f3ccde] dark:bg-[#2a2035] text-[#4b1d3f] dark:text-pink-300 rounded-xl border border-[#4b1d3f]/30">
            <Globe size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100">
              Universo & Ambientação
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Worldbuilding, regras e locais importantes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-white dark:bg-[#1c1524] px-3 py-2 rounded-xl border border-[#4b1d3f]/20 flex-1 md:flex-none">
            <BookOpen size={16} className="text-[#4b1d3f] dark:text-pink-300" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-xs font-bold text-stone-800 dark:text-stone-200 focus:outline-none cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="dark:bg-[#1c1524]">
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-[#4b1d3f] dark:bg-pink-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm shrink-0"
          >
            <Plus size={16} /> Novo Local / Regra
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1321] border-2 border-[#4b1d3f]/20 dark:border-[#382b47] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-80">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            type="text"
            placeholder="Pesquisar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-[#221a2b] border rounded-xl text-xs text-stone-800 dark:text-stone-100"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${selectedCategory === cat ? "bg-[#4b1d3f] text-white dark:bg-pink-800" : "bg-stone-100 dark:bg-[#221a2b] text-stone-600 dark:text-stone-300"}`}
            >
              {getIcon(cat)} <span>{cat}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredConcepts.map((item) => (
          <div
            key={item.id}
            onClick={() => setViewingConcept(item)}
            className="bg-white dark:bg-[#1a1321] border-2 border-[#4b1d3f]/20 dark:border-[#382b47] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            {item.imageUrl ? (
              <div className="h-44 w-full relative bg-stone-100 dark:bg-stone-800">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-[#4b1d3f]/90 text-white px-2.5 py-1 rounded-lg flex items-center gap-1">
                  {getIcon(item.category)} {item.category}
                </span>
              </div>
            ) : (
              <div className="h-28 w-full bg-gradient-to-br from-[#f3ccde]/50 to-[#4b1d3f]/20 dark:from-[#221a2b] dark:to-[#382b47] p-4 flex items-end">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#4b1d3f] text-white px-2.5 py-1 rounded-lg flex items-center gap-1">
                  {getIcon(item.category)} {item.category}
                </span>
              </div>
            )}
            <div className="p-5 space-y-3 flex-grow flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 group-hover:text-[#4b1d3f] dark:group-hover:text-pink-300">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => handleOpenModal(item, e)}
                      className="p-1 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {item.region && (
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#4b1d3f] dark:text-pink-300 bg-[#f3ccde]/40 dark:bg-[#221a2b] px-2 py-0.5 rounded">
                    Região: {item.region}
                  </span>
                )}
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-3">
                  {item.description}
                </p>
              </div>
              {item.notes && (
                <p className="text-[11px] text-stone-500 italic border-t border-stone-100 dark:border-stone-800 pt-2 font-serif">
                  <strong>Nota:</strong> {item.notes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredConcepts.length === 0 && (
        <div className="text-center py-16 bg-[#f3ccde]/20 dark:bg-[#1a1321] rounded-3xl border-2 border-dashed border-[#4b1d3f]/20 dark:border-[#382b47] text-stone-500 space-y-2">
          <Globe size={40} className="mx-auto text-stone-400" />
          <p className="text-sm font-semibold">Nenhum conceito encontrado.</p>
        </div>
      )}

      {viewingConcept && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#fcf8f2] dark:bg-[#18121e] border-2 border-[#4b1d3f]/30 dark:border-[#382b47] rounded-3xl overflow-hidden w-full max-w-2xl shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            {viewingConcept.imageUrl && (
              <div className="h-56 w-full relative">
                <Image
                  src={viewingConcept.imageUrl}
                  alt={viewingConcept.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 672px"
                  unoptimized
                  className="object-cover"
                />
                <button
                  onClick={() => setViewingConcept(null)}
                  className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full"
                >
                  <X size={18} />
                </button>
              </div>
            )}
            <div className="p-6 md:p-8 space-y-4 overflow-y-auto">
              <div className="flex justify-between items-start gap-4 border-b border-[#4b1d3f]/15 dark:border-[#382b47] pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#4b1d3f] text-white px-2.5 py-0.5 rounded">
                    {viewingConcept.category}
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-2">
                    {viewingConcept.title}
                  </h2>
                </div>
                {!viewingConcept.imageUrl && (
                  <button
                    onClick={() => setViewingConcept(null)}
                    className="p-1.5 text-stone-500"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              {viewingConcept.region && (
                <p className="text-xs text-stone-500 font-semibold">
                  <strong>Região:</strong> {viewingConcept.region}
                </p>
              )}
              <p className="text-sm font-serif text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-wrap">
                {viewingConcept.description}
              </p>
              {viewingConcept.notes && (
                <div className="p-4 bg-[#f3ccde]/30 dark:bg-[#221a2b] border border-[#4b1d3f]/20 rounded-2xl space-y-1">
                  <h4 className="text-xs font-bold text-[#4b1d3f] dark:text-pink-300">
                    Notas Adicionais
                  </h4>
                  <p className="text-xs italic text-stone-700 dark:text-stone-300 font-serif">
                    {viewingConcept.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#fcf8f2] dark:bg-[#18121e] border-2 border-[#4b1d3f]/30 dark:border-[#382b47] rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#4b1d3f]/20 dark:border-[#382b47] pb-3">
              <h3 className="font-bold font-serif text-lg text-stone-900 dark:text-stone-100">
                {editingId ? "Editar Elemento" : "Novo Elemento"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-500"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full p-2.5 bg-white dark:bg-[#221a2b] border rounded-xl text-stone-800 dark:text-stone-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as UniverseConcept["category"],
                      })
                    }
                    className="w-full p-2.5 bg-white dark:bg-[#221a2b] border rounded-xl text-stone-800 dark:text-stone-100"
                  >
                    <option value="Local">Local</option>
                    <option value="Regra de Magia">Regra de Magia</option>
                    <option value="Lore / História">Lore / História</option>
                    <option value="Organização">Organização</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Região
                  </label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) =>
                      setFormData({ ...formData, region: e.target.value })
                    }
                    className="w-full p-2.5 bg-white dark:bg-[#221a2b] border rounded-xl text-stone-800 dark:text-stone-100"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  URL da Imagem
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  className="w-full p-2.5 bg-white dark:bg-[#221a2b] border rounded-xl text-stone-800 dark:text-stone-100"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Descrição
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full p-2.5 bg-white dark:bg-[#221a2b] border rounded-xl text-stone-800 dark:text-stone-100"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Notas
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full p-2.5 bg-white dark:bg-[#221a2b] border rounded-xl text-stone-800 dark:text-stone-100"
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
                  className="px-4 py-2 bg-[#4b1d3f] text-white rounded-xl font-bold flex items-center gap-1"
                >
                  <Check size={16} /> Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
