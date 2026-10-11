'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Ruler,
  Weight,
  Sparkles,
  Smile,
  Frown,
  Quote,
  Star,
  Paperclip,
  X,
  Check,
  Heart,
  Users,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface Character {
  id: string;
  projectId: string; // Associação ao Projeto
  name: string;
  role: 'Protagonista' | 'Aliado' | 'Antagonista' | 'Secundário';
  age: number;
  height: string;
  weight: string;
  zodiac: string;
  mbti: string;
  imageUrl?: string;
  appearance: string[];
  likes: string[];
  dislikes: string[];
  drinks: string[];
  motto: string;
  shortNote: string;
}

interface Relationship {
  id: string;
  projectId: string; // Associação ao Projeto
  character1Id: string;
  character2Id: string;
  type: string;
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

const DEFAULT_CHARACTERS: Character[] = [
  {
    id: '1',
    projectId: '1',
    name: 'Anya Silva',
    role: 'Protagonista',
    age: 24,
    height: '1,68 m',
    weight: '58 kg',
    zodiac: 'Peixes ♓',
    mbti: 'INFJ',
    imageUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    appearance: [
      'Cabelos castanhos ondulados',
      'Olhos expressivos e castanhos',
      'Estilo confortável e vintage',
      'Sempre carrega um caderno',
    ],
    likes: ['Café expresso', 'Livros antigos', 'Fotografia analógica'],
    dislikes: ['Falso moralismo', 'Lugares muito barulhentos'],
    drinks: ['Café preto', 'Chá de camomila'],
    motto: 'A verdade é o único caminho para a liberdade.',
    shortNote:
      'Gosta de observações calmas. Muito leal aos amigos próximos, mas guarda segredos profundos.',
  },
  {
    id: '2',
    projectId: '1',
    name: 'Park Jimin',
    role: 'Aliado',
    age: 25,
    height: '1,82 m',
    weight: '75 kg',
    zodiac: 'Áries ♈',
    mbti: 'ESTP',
    imageUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    appearance: [
      'Cabelo curto e alinhado',
      'Olhos castanhos claros',
      'Porte atlético',
    ],
    likes: ['Desportos radicais', 'Comida apimentada', 'Gatos'],
    dislikes: ['Mentiras', 'Inação/Falta de atitude'],
    drinks: ['Café gelado', 'Limonada'],
    motto: 'Ação rápida resolve quase tudo.',
    shortNote:
      'Protege os seus a qualquer custo. Tende a agir antes de pensar, mas tem um coração enorme.',
  },
];

const DEFAULT_RELATIONSHIPS: Relationship[] = [
  {
    id: 'r1',
    projectId: '1',
    character1Id: '1',
    character2Id: '2',
    type: 'Confiança Mútua',
    description: 'Conhecem-se desde a infância e confiam a vida um ao outro.',
  },
];

export function CharactersSection() {
  const [activeTab, setActiveTab] = useState<'characters' | 'relationships'>('characters');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('Todos');

  // Carrega Lista de Projetos do localStorage
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

  // Estado dos Personagens (localStorage)
  const [characters, setCharacters] = useState<Character[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('capitulando_characters');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Erro ao ler personagens do localStorage', e);
        }
      }
    }
    return DEFAULT_CHARACTERS;
  });

  // Estado dos Relacionamentos (localStorage)
  const [relationships, setRelationships] = useState<Relationship[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('capitulando_relationships');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Erro ao ler relacionamentos do localStorage', e);
        }
      }
    }
    return DEFAULT_RELATIONSHIPS;
  });

  // Gravar no localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('capitulando_characters', JSON.stringify(characters));
    }
  }, [characters]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('capitulando_relationships', JSON.stringify(relationships));
    }
  }, [relationships]);

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [isRelModalOpen, setIsRelModalOpen] = useState(false);
  const [editingRelId, setEditingRelId] = useState<string | null>(null);

  // Form de Personagem
  const [formData, setFormData] = useState({
    name: '',
    role: 'Protagonista' as Character['role'],
    age: 20,
    height: '',
    weight: '',
    zodiac: '',
    mbti: '',
    imageUrl: '',
    appearance: '',
    likes: '',
    dislikes: '',
    drinks: '',
    motto: '',
    shortNote: '',
  });

  // Form de Relacionamento
  const [relFormData, setRelFormData] = useState({
    character1Id: '',
    character2Id: '',
    type: '',
    description: '',
  });

  const categories = ['Todos', 'Protagonista', 'Aliado', 'Antagonista', 'Secundário'];

  // Personagens e Relacionamentos pertencentes APENAS ao projeto ativo
  const currentProjectCharacters = characters.filter((c) => (c.projectId || '1') === selectedProjectId);
  const currentProjectRelationships = relationships.filter((r) => (r.projectId || '1') === selectedProjectId);

  // Handlers Personagens
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      name: '',
      role: 'Protagonista',
      age: 20,
      height: '',
      weight: '',
      zodiac: '',
      mbti: '',
      imageUrl: '',
      appearance: '',
      likes: '',
      dislikes: '',
      drinks: '',
      motto: '',
      shortNote: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (char: Character) => {
    setEditingId(char.id);
    setFormData({
      name: char.name,
      role: char.role,
      age: char.age,
      height: char.height,
      weight: char.weight,
      zodiac: char.zodiac,
      mbti: char.mbti,
      imageUrl: char.imageUrl || '',
      appearance: char.appearance.join(', '),
      likes: char.likes.join(', '),
      dislikes: char.dislikes.join(', '),
      drinks: char.drinks.join(', '),
      motto: char.motto,
      shortNote: char.shortNote,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedCharacter: Character = {
      id: editingId || Date.now().toString(),
      projectId: selectedProjectId,
      name: formData.name || 'Sem nome',
      role: formData.role,
      age: Number(formData.age) || 0,
      height: formData.height || '-',
      weight: formData.weight || '-',
      zodiac: formData.zodiac || '-',
      mbti: formData.mbti || '-',
      imageUrl: formData.imageUrl || undefined,
      appearance: formData.appearance
        ? formData.appearance.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      likes: formData.likes
        ? formData.likes.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      dislikes: formData.dislikes
        ? formData.dislikes.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      drinks: formData.drinks
        ? formData.drinks.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      motto: formData.motto || '',
      shortNote: formData.shortNote || '',
    };

    if (editingId) {
      setCharacters((prev) =>
        prev.map((c) => (c.id === editingId ? formattedCharacter : c))
      );
    } else {
      setCharacters((prev) => [formattedCharacter, ...prev]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem a certeza que deseja eliminar esta ficha?')) {
      setCharacters((prev) => prev.filter((c) => c.id !== id));
      setRelationships((prev) =>
        prev.filter((r) => r.character1Id !== id && r.character2Id !== id)
      );
    }
  };

  // Handlers Relacionamentos
  const handleOpenRelCreate = () => {
    setEditingRelId(null);
    setRelFormData({
      character1Id: currentProjectCharacters[0]?.id || '',
      character2Id: currentProjectCharacters[1]?.id || currentProjectCharacters[0]?.id || '',
      type: 'Amigo',
      description: '',
    });
    setIsRelModalOpen(true);
  };

  const handleOpenRelEdit = (rel: Relationship) => {
    setEditingRelId(rel.id);
    setRelFormData({
      character1Id: rel.character1Id,
      character2Id: rel.character2Id,
      type: rel.type,
      description: rel.description,
    });
    setIsRelModalOpen(true);
  };

  const handleRelSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!relFormData.character1Id || !relFormData.character2Id) {
      alert('Selecione dois personagens válidos.');
      return;
    }

    const newRel: Relationship = {
      id: editingRelId || Date.now().toString(),
      projectId: selectedProjectId,
      character1Id: relFormData.character1Id,
      character2Id: relFormData.character2Id,
      type: relFormData.type || 'Indefinido',
      description: relFormData.description || '',
    };

    if (editingRelId) {
      setRelationships((prev) =>
        prev.map((r) => (r.id === editingRelId ? newRel : r))
      );
    } else {
      setRelationships((prev) => [newRel, ...prev]);
    }

    setIsRelModalOpen(false);
  };

  const handleRelDelete = (id: string) => {
    if (confirm('Tem a certeza que deseja eliminar este relacionamento?')) {
      setRelationships((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const filteredCharacters = currentProjectCharacters.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'Todos' || c.role === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Barra de Seleção de Projeto e Abas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-[#d8c2aa] pb-2 gap-4">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('characters')}
            className={`pb-2 px-3 font-bold text-sm flex items-center gap-2 border-b-4 -mb-[10px] transition-all ${
              activeTab === 'characters'
                ? 'border-[#32005c] text-[#385338]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Users size={18} />
            <span>Fichas de Personagens ({currentProjectCharacters.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('relationships')}
            className={`pb-2 px-3 font-bold text-sm flex items-center gap-2 border-b-4 -mb-[10px] transition-all ${
              activeTab === 'relationships'
                ? 'border-[#32005c] text-[#385338]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Heart size={18} />
            <span>Relacionamentos ({currentProjectRelationships.length})</span>
          </button>
        </div>

        {/* Seletor do Projeto */}
        <div className="flex items-center gap-2 bg-[#f7eee3] px-3 py-1.5 rounded-xl border border-[#d8c2aa]">
          <BookOpen size={16} className="text-[#385338]" />
          <span className="text-xs text-stone-600 font-medium">Projeto:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-transparent text-xs font-bold text-stone-900 focus:outline-none cursor-pointer"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ABA 1: PERSONAGENS */}
      {activeTab === 'characters' && (
        <>
          <div className="bg-[#FAE6FA] p-4 rounded-2xl border-2 border-[#32005c] flex flex-col md:flex-row gap-4 items-center justify-between shadow-md">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                type="text"
                placeholder="Pesquisar ficha..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#ffffff]/50 border border-[#32005c] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#385338]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filter === cat
                      ? 'bg-[#32005c] text-white shadow-sm scale-105'
                      : 'bg-[#FAE6FA]/60 text-stone-700 hover:bg-[#f3ccde]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={handleOpenCreate}
              className="w-full md:w-auto bg-[#32005c] hover:bg-[#2c422c] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
            >
              <Plus size={16} />
              <span>Criar Ficha</span>
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {filteredCharacters.map((char) => (
              <div
                key={char.id}
                className="relative bg-[#FAE6FA] border-2 border-[#32005c] rounded-3xl p-6 sm:p-8 shadow-lg space-y-6 overflow-hidden"
                style={{
                  backgroundImage:
                    'radial-gradient(#d8c2aa 0.75px, transparent 0.75px)',
                  backgroundSize: '16px 16px',
                }}
              >
                <div className="absolute -top-3 left-10 w-24 h-7 bg-amber-100/80 border border-amber-300/60 rotate-[-4deg] shadow-sm pointer-events-none" />

                <div className="absolute top-4 right-4 flex items-center gap-2 text-stone-400 z-10">
                  <button
                    onClick={() => handleOpenEdit(char)}
                    title="Editar Ficha"
                    className="p-1.5 bg-[#f3ccde] hover:bg-[#f3ccde] rounded-lg border border-[#d8c2aa] text-stone-700 transition-colors shadow-sm"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(char.id)}
                    title="Eliminar Ficha"
                    className="p-1.5 bg-[#f3ccde] hover:bg-red-100 rounded-lg border border-[#d8c2aa] text-red-600 transition-colors shadow-sm"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start pt-2">
                  <div className="sm:col-span-5 flex flex-col items-center">
                    <div className="relative p-2 bg-[#f7eee3] border-2 border-[#d8c2aa] rounded-2xl shadow-sm rotate-[-1deg] w-full max-w-[200px]">
                      <Paperclip size={20} className="absolute -top-3 left-1/2 -translate-x-1/2 text-stone-500 drop-shadow-sm z-10" />
                      <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-stone-200 border border-[#d8c2aa]">
                        {char.imageUrl ? (
                          <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400">Sem foto</div>
                        )}
                      </div>
                      <div className="mt-2 text-center">
                        <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold bg-[#32005c] text-white rounded-full">
                          {char.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-7 space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold font-serif text-stone-900">{char.name}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-[#f3ccde]/70 p-3 rounded-xl border border-[#32005c]">
                      <div className="flex items-center gap-1.5 text-stone-700">
                        <Calendar size={14} className="text-[#385338]" />
                        <span><strong>Idade:</strong> {char.age} anos</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-700">
                        <Ruler size={14} className="text-[#385338]" />
                        <span><strong>Alt:</strong> {char.height}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-700">
                        <Weight size={14} className="text-[#385338]" />
                        <span><strong>Peso:</strong> {char.weight}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-700">
                        <Star size={14} className="text-[#385338]" />
                        <span><strong>Signo:</strong> {char.zodiac}</span>
                      </div>
                      <div className="col-span-2 flex items-center gap-1.5 text-stone-700 pt-1 border-t border-[#d8c2aa]/40">
                        <Sparkles size={14} className="text-[#385338]" />
                        <span><strong>MBTI:</strong> {char.mbti}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-[#f3ccde]/50 p-3 rounded-xl border border-[#32005c]">
                    <h4 className="font-bold text-stone-800 mb-2 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-[#385338]" /> Aparência
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-stone-600">
                      {char.appearance.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#f3ccde]/50 p-3 rounded-xl border border-[#32005c] space-y-3">
                    <div>
                      <h4 className="font-bold text-stone-800 mb-1 flex items-center gap-1.5">
                        <Smile size={14} className="text-[#385338]" /> Gosta
                      </h4>
                      <p className="text-stone-600">{char.likes.join(', ')}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-800 mb-1 flex items-center gap-1.5">
                        <Frown size={14} className="text-red-700" /> Não Gosta
                      </h4>
                      <p className="text-stone-600">{char.dislikes.join(', ')}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                    <p className="font-medium text-amber-900">
                      <strong>Nota Rápida:</strong> {char.shortNote}
                    </p>
                  </div>

                  {char.motto && (
                    <div className="flex items-center gap-2 italic text-stone-600 bg-[#f3ccde]/40 p-2.5 rounded-xl border border-[#32005c]/60">
                      <Quote size={14} className="text-[#385338] shrink-0" />
                      <span>"{char.motto}"</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredCharacters.length === 0 && (
            <div className="text-center py-12 bg-[#f3ccde] rounded-2xl border-2 border-[#d8c2aa] text-stone-500 space-y-2">
              <Users size={36} className="mx-auto text-stone-400" />
              <p className="text-sm font-semibold">Nenhuma ficha criada para este projeto.</p>
              <p className="text-xs text-stone-400">Clique em "Criar Ficha" para adicionar o primeiro personagem.</p>
            </div>
          )}
        </>
      )}

      {/* ABA 2: RELACIONAMENTOS */}
      {activeTab === 'relationships' && (
        <div className="space-y-6">
          <div className="bg-[#FAE6FA] p-4 rounded-2xl border-2 border-[#32005c] flex justify-between items-center shadow-md">
            <div>
              <h3 className="font-bold font-serif text-stone-900 text-base">Mapa de Relacionamentos</h3>
              <p className="text-xs text-stone-600">Defina as ligações entre personagens deste projeto.</p>
            </div>
            <button
              onClick={handleOpenRelCreate}
              disabled={currentProjectCharacters.length < 2}
              className="bg-[#32005c] hover:bg-[#2c422c] disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-transform active:scale-95"
            >
              <Plus size={16} />
              <span>Adicionar Relacionamento</span>
            </button>
          </div>

          {currentProjectCharacters.length < 2 && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-800">
              Crie pelo menos 2 personagens neste projeto para estabelecer relacionamentos.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentProjectRelationships.map((rel) => {
              const char1 = currentProjectCharacters.find((c) => c.id === rel.character1Id);
              const char2 = currentProjectCharacters.find((c) => c.id === rel.character2Id);

              if (!char1 || !char2) return null;

              return (
                <div
                  key={rel.id}
                  className="bg-white border-2 border-[#32005c] rounded-2xl p-5 shadow-md relative space-y-3"
                >
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <button
                      onClick={() => handleOpenRelEdit(rel)}
                      className="p-1 text-stone-500 hover:text-stone-800 rounded-md hover:bg-stone-100"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleRelDelete(rel.id)}
                      className="p-1 text-red-500 hover:text-red-700 rounded-md hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center gap-1 w-24 text-center">
                      <div className="w-12 h-12 rounded-full border border-[#32005c] overflow-hidden bg-stone-100">
                        {char1.imageUrl ? (
                          <img src={char1.imageUrl} alt={char1.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400">N/A</div>
                        )}
                      </div>
                      <span className="text-xs font-bold text-stone-800 truncate max-w-full">{char1.name}</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center gap-1">
                      <span className="px-2 py-0.5 bg-[#FAE6FA] border border-[#32005c] rounded-full text-[10px] font-bold text-[#32005c]">
                        {rel.type}
                      </span>
                      <div className="flex items-center text-stone-400 w-full justify-center">
                        <div className="h-[1px] bg-stone-300 flex-1" />
                        <ArrowRight size={14} className="mx-1 text-stone-400" />
                        <div className="h-[1px] bg-stone-300 flex-1" />
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-1 w-24 text-center">
                      <div className="w-12 h-12 rounded-full border border-[#32005c] overflow-hidden bg-stone-100">
                        {char2.imageUrl ? (
                          <img src={char2.imageUrl} alt={char2.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400">N/A</div>
                        )}
                      </div>
                      <span className="text-xs font-bold text-stone-800 truncate max-w-full">{char2.name}</span>
                    </div>
                  </div>

                  {rel.description && (
                    <p className="text-xs text-stone-600 bg-[#FAE6FA]/50 p-2.5 rounded-xl border border-[#32005c]/40">
                      {rel.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Criar/Editar Personagem */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#f5f5f5] border-2 border-[#32005c] rounded-3xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#32005c] pb-3">
              <h3 className="font-bold font-serif text-lg text-stone-900">
                {editingId ? 'Editar Ficha' : 'Criar Nova Ficha'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-500 hover:text-stone-800">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Nome</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 bg-[#ffffff] border border-[#32005c] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Papel</label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as Character['role'] })
                    }
                    className="w-full p-2 bg-[#ffffff] border border-[#32005c] rounded-lg"
                  >
                    <option value="Protagonista">Protagonista</option>
                    <option value="Aliado">Aliado</option>
                    <option value="Antagonista">Antagonista</option>
                    <option value="Secundário">Secundário</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Idade</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full p-2 bg-[#ffffff] border border-[#32005c] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Altura</label>
                  <input
                    type="text"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full p-2 bg-[#ffffff] border border-[#32005c] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Peso</label>
                  <input
                    type="text"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full p-2 bg-[#ffffff] border border-[#32005c] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Signo</label>
                  <input
                    type="text"
                    value={formData.zodiac}
                    onChange={(e) => setFormData({ ...formData, zodiac: e.target.value })}
                    className="w-full p-2 bg-[#ffffff] border border-[#32005c] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">MBTI</label>
                  <input
                    type="text"
                    value={formData.mbti}
                    onChange={(e) => setFormData({ ...formData, mbti: e.target.value })}
                    className="w-full p-2 bg-[#ffffff] border border-[#32005c] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">URL da Imagem</label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full p-2 bg-[#fffff] border border-[#32005c] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Aparência (separada por vírgulas)</label>
                <input
                  type="text"
                  value={formData.appearance}
                  onChange={(e) => setFormData({ ...formData, appearance: e.target.value })}
                  className="w-full p-2 bg-[#ffffff] border border-[#32005c] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Gosta (vírgulas)</label>
                  <input
                    type="text"
                    value={formData.likes}
                    onChange={(e) => setFormData({ ...formData, likes: e.target.value })}
                    className="w-full p-2 bg-[#ffffff] border border-[#32005c] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Não Gosta (vírgulas)</label>
                  <input
                    type="text"
                    value={formData.dislikes}
                    onChange={(e) => setFormData({ ...formData, dislikes: e.target.value })}
                    className="w-full p-2 bg-[#ffffff] border border-[#32005c] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Lema</label>
                <input
                  type="text"
                  value={formData.motto}
                  onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                  className="w-full p-2 bg-[#ffffff] border border-[#32005c] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Nota Rápida</label>
                <textarea
                  rows={2}
                  value={formData.shortNote}
                  onChange={(e) => setFormData({ ...formData, shortNote: e.target.value })}
                  className="w-full p-2 bg-[#ffffff] border border-[#32005c] rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#d8c2aa]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#32005c] hover:bg-[#f3ccde] text-white rounded-xl font-bold flex items-center gap-1"
                >
                  <Check size={14} /> Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Criar/Editar Relacionamento */}
      {isRelModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#f5f5f5] border-2 border-[#32005c] rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#d8c2aa] pb-3">
              <h3 className="font-bold font-serif text-lg text-stone-900">
                {editingRelId ? 'Editar Relacionamento' : 'Novo Relacionamento'}
              </h3>
              <button onClick={() => setIsRelModalOpen(false)} className="text-stone-500 hover:text-stone-800">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRelSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Personagem 1</label>
                <select
                  value={relFormData.character1Id}
                  onChange={(e) => setRelFormData({ ...relFormData, character1Id: e.target.value })}
                  className="w-full p-2 bg-[#ffffff] border border-[#32005c] rounded-lg"
                >
                  {currentProjectCharacters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Personagem 2</label>
                <select
                  value={relFormData.character2Id}
                  onChange={(e) => setRelFormData({ ...relFormData, character2Id: e.target.value })}
                  className="w-full p-2 bg-[#ffffff] border border-[#32005c] rounded-lg"
                >
                  {currentProjectCharacters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Tipo de Ligação</label>
                <input
                  type="text"
                  placeholder="Ex: Melhores Amigos, Rivais, Romance..."
                  required
                  value={relFormData.type}
                  onChange={(e) => setRelFormData({ ...relFormData, type: e.target.value })}
                  className="w-full p-2 bg-[#ffffff] border border-[#32005c] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Descrição / Detalhes</label>
                <textarea
                  rows={3}
                  placeholder="Explique brevemente a relação entre eles..."
                  value={relFormData.description}
                  onChange={(e) => setRelFormData({ ...relFormData, description: e.target.value })}
                  className="w-full p-2 bg-[#ffffff] border border-[#32005c] rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#d8c2aa]">
                <button
                  type="button"
                  onClick={() => setIsRelModalOpen(false)}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#32005c] hover:bg-[#f3ccde] text-white rounded-xl font-bold flex items-center gap-1"
                >
                  <Check size={14} /> Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}