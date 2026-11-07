"use client";

import Image from "next/image";

import { useWorkspaceSection } from "./WorkspaceProvider";
import React, { useState } from "react";
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
} from "lucide-react";

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

export function UniverseNotes({
  selectedProjectId,
}: {
  selectedProjectId: string;
}) {
  const [concepts, setConcepts] = useWorkspaceSection<UniverseConcept[]>(
    "concepts",
    [],
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
    if (!selectedProjectId) {
      alert("Crie e selecione um livro primeiro.");
      return;
    }
    const item: UniverseConcept = {
      id: editingId || crypto.randomUUID(),
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-stone-600 dark:text-stone-300">
          Conceitos e anotações livres do seu mundo. Seus registros anteriores
          continuam aqui.
        </p>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-xl bg-[#4b1d3f] px-4 py-2.5 text-xs font-bold text-white dark:bg-pink-800"
        >
          <Plus size={16} />
          Nova anotação
        </button>
      </div>
      <div className="bg-white dark:bg-[#1a1321] border-2 border-[#4b1d3f]/20 dark:border-[#382b47] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-80">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-600 dark:text-stone-400"
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
                      className="p-1 text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-1 text-red-600 dark:text-red-300 hover:text-red-700 dark:hover:text-red-200"
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
                <p className="text-[11px] text-stone-600 dark:text-stone-400 italic border-t border-stone-100 dark:border-stone-800 pt-2 font-serif">
                  <strong>Nota:</strong> {item.notes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredConcepts.length === 0 && (
        <div className="text-center py-16 bg-[#f3ccde]/20 dark:bg-[#1a1321] rounded-3xl border-2 border-dashed border-[#4b1d3f]/20 dark:border-[#382b47] text-stone-600 dark:text-stone-400 space-y-2">
          <Globe
            size={40}
            className="mx-auto text-stone-600 dark:text-stone-400"
          />
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
                    className="p-1.5 text-stone-600 dark:text-stone-400"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              {viewingConcept.region && (
                <p className="text-xs text-stone-600 dark:text-stone-400 font-semibold">
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
                {editingId ? "Editar anotação" : "Nova anotação"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-600 dark:text-stone-400"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label
                  htmlFor="universesection-field-1"
                  className="block font-bold text-stone-700 dark:text-stone-300 mb-1"
                >
                  Nome
                </label>
                <input
                  id="universesection-field-1"
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
                  <label
                    htmlFor="universesection-field-2"
                    className="block font-bold text-stone-700 dark:text-stone-300 mb-1"
                  >
                    Categoria
                  </label>
                  <select
                    id="universesection-field-2"
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
                  <label
                    htmlFor="universesection-field-3"
                    className="block font-bold text-stone-700 dark:text-stone-300 mb-1"
                  >
                    Região
                  </label>
                  <input
                    id="universesection-field-3"
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
                <label
                  htmlFor="universesection-field-4"
                  className="block font-bold text-stone-700 dark:text-stone-300 mb-1"
                >
                  URL da Imagem
                </label>
                <input
                  id="universesection-field-4"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  className="w-full p-2.5 bg-white dark:bg-[#221a2b] border rounded-xl text-stone-800 dark:text-stone-100"
                />
              </div>
              <div>
                <label
                  htmlFor="universesection-field-5"
                  className="block font-bold text-stone-700 dark:text-stone-300 mb-1"
                >
                  Descrição
                </label>
                <textarea
                  id="universesection-field-5"
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
                <label
                  htmlFor="universesection-field-6"
                  className="block font-bold text-stone-700 dark:text-stone-300 mb-1"
                >
                  Notas
                </label>
                <input
                  id="universesection-field-6"
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
