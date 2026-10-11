'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  Plus,
  Search,
  MapPin,
  Edit2,
  Trash2,
  X,
  Check,
  Image as ImageIcon,
  BookOpen,
  Sparkles,
  Compass,
} from 'lucide-react';

interface WorldItem {
  id: string;
  title: string;
  category: 'Local' | 'Regra de Magia' | 'Lore / História' | 'Organização';
  regionOrType: string;
  description: string;
  imageUrl?: string;
  notes?: string;
}

const DEFAULT_WORLD_ITEMS: WorldItem[] = [
  {
    id: '1',
    title: 'Vale Encantado',
    category: 'Local',
    regionOrType: 'Norte',
    description: 'Região montanhosa rica em minério arcano e florestas densas.',
    imageUrl:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    notes: 'Habitado principalmente por clãs protetores da magia antiga.',
  },
  {
    id: '2',
    title: 'Cachoeira do Mistério',
    category: 'Local',
    regionOrType: 'Sul',
    description: 'Locus mágico onde os rituais de passagem são efetuados.',
    imageUrl:
      'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800&auto=format&fit=crop&q=80',
    notes: 'A água possui propriedades curativas durante a lua cheia.',
  },
];

export function UniverseSection() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  // Estado dos Locais / Regras com localStorage
  const [items, setItems] = useState<WorldItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('capitulando_world_items');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Erro ao ler dados de Universo do localStorage', e);
        }
      }
    }
    return DEFAULT_WORLD_ITEMS;
  });

  // Salva no localStorage sempre que houver alterações
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('capitulando_world_items', JSON.stringify(items));
    }
  }, [items]);

  // Modais e formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Local' as WorldItem['category'],
    regionOrType: '',
    description: '',
    imageUrl: '',
    notes: '',
  });

  const categories = ['Todos', 'Local', 'Regra de Magia', 'Lore / História', 'Organização'];

  // Abrir Modal de Criação
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      title: '',
      category: 'Local',
      regionOrType: '',
      description: '',
      imageUrl: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  // Abrir Modal de Edição
  const handleOpenEdit = (item: WorldItem) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      category: item.category,
      regionOrType: item.regionOrType,
      description: item.description,
      imageUrl: item.imageUrl || '',
      notes: item.notes || '',
    });
    setIsModalOpen(true);
  };

  // Salvar (Criar ou Editar)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const newItem: WorldItem = {
      id: editingId || Date.now().toString(),
      title: formData.title || 'Sem título',
      category: formData.category,
      regionOrType: formData.regionOrType || 'Geral',
      description: formData.description || '',
      imageUrl: formData.imageUrl || undefined,
      notes: formData.notes || '',
    };

    if (editingId) {
      setItems((prev) => prev.map((item) => (item.id === editingId ? newItem : item)));
    } else {
      setItems((prev) => [newItem, ...prev]);
    }

    setIsModalOpen(false);
  };

  // Eliminar
  const handleDelete = (id: string) => {
    if (confirm('Tem certeza de que deseja excluir este registro?')) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Filtragem
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.regionOrType.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'Todos' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Cabeçalho */}
      <div className="bg-[#f7eee3] p-5 rounded-2xl border-2 border-[#d8c2aa] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#ebd9c6] text-[#385338] rounded-xl border border-[#d8c2aa]">
            <Globe size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-stone-900">
              Universo & Ambientação
            </h2>
            <p className="text-xs text-stone-600">
              Worldbuilding, regras de magia, locais importantes e conceitos do seu mundo.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-[#385338] hover:bg-[#2c422c] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
        >
          <Plus size={16} />
          <span>Novo Local / Regra</span>
        </button>
      </div>

      {/* Barra de Filtros e Pesquisa */}
      <div className="bg-[#f7eee3] p-4 rounded-2xl border-2 border-[#d8c2aa] flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            type="text"
            placeholder="Pesquisar local ou regra..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#ffffff] border border-[#d8c2aa] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#385338]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-[#385338] text-white shadow-sm scale-105'
                  : 'bg-[#ebd9c6]/60 text-stone-700 hover:bg-[#d8c2aa]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Cards dos Locais e Conceitos */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-[#f7eee3] border-2 border-[#d8c2aa] rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between"
          >
            <div>
              {/* Imagem do Local */}
              {item.imageUrl ? (
                <div className="relative h-44 w-full bg-stone-200 border-b border-[#d8c2aa] overflow-hidden group">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-[#385338] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                    {item.category}
                  </div>
                </div>
              ) : (
                <div className="h-28 w-full bg-[#ebd9c6]/50 border-b border-[#d8c2aa] flex items-center justify-center text-stone-400 relative">
                  <ImageIcon size={32} className="opacity-40" />
                  <div className="absolute top-3 left-3 bg-[#385338] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                    {item.category}
                  </div>
                </div>
              )}

              {/* Conteúdo do Card */}
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-stone-900 font-bold text-lg font-serif">
                    {item.category === 'Local' ? (
                      <MapPin size={18} className="text-[#385338] shrink-0" />
                    ) : item.category === 'Regra de Magia' ? (
                      <Sparkles size={18} className="text-amber-600 shrink-0" />
                    ) : (
                      <BookOpen size={18} className="text-stone-700 shrink-0" />
                    )}
                    <span>{item.title}</span>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-[#ebd9c6] rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Tag de Região / Tipo */}
                <div>
                  <span className="inline-block px-2.5 py-0.5 bg-[#ebd9c6] border border-[#d8c2aa] rounded-md text-[10px] font-bold uppercase tracking-wider text-stone-700">
                    Região/Tipo: {item.regionOrType}
                  </span>
                </div>

                {/* Descrição */}
                <p className="text-xs text-stone-700 leading-relaxed">
                  {item.description}
                </p>

                {/* Notas adicionais */}
                {item.notes && (
                  <div className="pt-2 border-t border-[#d8c2aa]/60 text-[11px] text-stone-600 italic">
                    <strong>Nota:</strong> {item.notes}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 bg-[#f7eee3] rounded-2xl border-2 border-[#d8c2aa] text-stone-500 space-y-2">
          <Compass size={36} className="mx-auto text-stone-400" />
          <p className="text-sm font-semibold">Nenhum local ou regra encontrado.</p>
          <p className="text-xs text-stone-400">Clique em "Novo Local / Regra" para criar um novo registro.</p>
        </div>
      )}

      {/* Modal de Criar / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#f7eee3] border-2 border-[#d8c2aa] rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#d8c2aa] pb-3">
              <h3 className="font-bold font-serif text-lg text-stone-900">
                {editingId ? 'Editar Elemento do Universo' : 'Novo Elemento do Universo'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-500 hover:text-stone-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Nome do Local / Conceito
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Vale Encantado, Sistema de Runas..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#d8c2aa] rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#385338]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as WorldItem['category'],
                      })
                    }
                    className="w-full p-2.5 bg-white border border-[#d8c2aa] rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#385338]"
                  >
                    <option value="Local">Local</option>
                    <option value="Regra de Magia">Regra de Magia</option>
                    <option value="Lore / História">Lore / História</option>
                    <option value="Organização">Organização</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Região ou Subtipo
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Norte, Magia Elemental, Reino..."
                    value={formData.regionOrType}
                    onChange={(e) =>
                      setFormData({ ...formData, regionOrType: e.target.value })
                    }
                    className="w-full p-2.5 bg-white border border-[#d8c2aa] rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#385338]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  URL da Foto / Imagem do Local
                </label>
                <input
                  type="text"
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  className="w-full p-2.5 bg-white border border-[#d8c2aa] rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#385338]"
                />
                {formData.imageUrl && (
                  <div className="mt-2 h-28 w-full rounded-xl overflow-hidden border border-[#d8c2aa]">
                    <img
                      src={formData.imageUrl}
                      alt="Pré-visualização"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Descrição</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Descreva o local ou conceito..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full p-2.5 bg-white border border-[#d8c2aa] rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#385338]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Notas Adicionais / Segredos (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalhes internos ou importância no enredo..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
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
                  <Check size={16} /> Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}