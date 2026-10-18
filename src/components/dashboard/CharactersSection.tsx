'use client';

import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Edit2, Trash2, Calendar, Ruler, Weight, Sparkles, Star,
  Paperclip, X, Heart, Users, BookOpen, Image as ImageIcon, Link as LinkIcon
} from 'lucide-react';

interface Character {
  id: string; projectId: string; name: string; role: 'Protagonista' | 'Aliado' | 'Antagonista' | 'Secundário';
  age: number; height: string; weight: string; zodiac: string; bloodType: string; mbti: string; imageUrl?: string;
  imageFit?: 'cover' | 'contain'; imagePosition?: string;
  appearance: string[]; likes: string[]; dislikes: string[]; drinks: string[]; motto: string; shortNote: string;
}

interface Relationship {
  id: string; projectId: string; character1Id: string; character2Id: string; type: string; description: string;
}

interface ProjectMinimal { id: string; title: string; }

const DEFAULT_PROJECTS: ProjectMinimal[] = [
  { id: '1', title: 'O Guardião da Floresta' },
  { id: '2', title: 'Segredos de Algures' },
];

export function CharactersSection() {
  const [activeTab, setActiveTab] = useState<'characters' | 'relationships'>('characters');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todos');

  const [projects] = useState<ProjectMinimal[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_PROJECTS;
    const saved = localStorage.getItem('capitulando_projects');
    return saved ? JSON.parse(saved) : DEFAULT_PROJECTS;
  });

  const [selectedProjectId, setSelectedProjectId] = useState(() => projects[0]?.id || '1');

  // Gestão nativa de localStorage para personagens
  const [characters, setCharacters] = useState<Character[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('capitulando_characters');
    return saved ? JSON.parse(saved) : [];
  });

  // Gestão nativa de localStorage para relacionamentos
  const [relationships, setRelationships] = useState<Relationship[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('capitulando_relationships');
    return saved ? JSON.parse(saved) : [];
  });

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isRelModalOpen, setIsRelModalOpen] = useState(false);
  const [editingRelId, setEditingRelId] = useState<string | null>(null);

  const initialCharData = {
    name: '', role: 'Protagonista' as Character['role'], age: 20, height: '', weight: '', zodiac: '', bloodType: '', mbti: '',
    imageUrl: '', imageFit: 'cover' as 'cover' | 'contain', imagePosition: 'center',
    appearance: '', likes: '', dislikes: '', drinks: '', motto: '', shortNote: ''
  };
  const [formData, setFormData] = useState(initialCharData);
  const [imgInputType, setImgInputType] = useState<'link' | 'file'>('link');
  const [relFormData, setRelFormData] = useState({ character1Id: '', character2Id: '', type: '', description: '' });

  const currentChars = characters.filter((c) => (c.projectId || '1') === selectedProjectId);
  const currentRels = relationships.filter((r) => (r.projectId || '1') === selectedProjectId);

  const handleOpenCharModal = (char?: Character) => {
    if (char) {
      setEditingId(char.id);
      setFormData({
        ...char,
        bloodType: char.bloodType || '',
        appearance: char.appearance ? char.appearance.join(', ') : '',
        likes: char.likes ? char.likes.join(', ') : '',
        dislikes: char.dislikes ? char.dislikes.join(', ') : '',
        drinks: char.drinks ? char.drinks.join(', ') : '',
        imageUrl: char.imageUrl || '',
        imageFit: char.imageFit || 'cover',
        imagePosition: char.imagePosition || 'center'
      });
    } else {
      setEditingId(null);
      setFormData(initialCharData);
    }
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChar = (e: React.FormEvent) => {
    e.preventDefault();
    const splitArr = (str: string) => str ? str.split(',').map((s) => s.trim()).filter(Boolean) : [];
    const formatted: Character = {
      ...formData,
      id: editingId || Date.now().toString(),
      projectId: selectedProjectId,
      name: formData.name || 'Sem nome',
      age: Number(formData.age) || 0,
      imageUrl: formData.imageUrl || undefined,
      appearance: splitArr(formData.appearance),
      likes: splitArr(formData.likes),
      dislikes: splitArr(formData.dislikes),
      drinks: splitArr(formData.drinks),
    };
    setCharacters((prev) => editingId ? prev.map((c) => c.id === editingId ? formatted : c) : [formatted, ...prev]);
    setIsModalOpen(false);
  };

  const handleDeleteChar = (id: string) => {
    if (confirm('Eliminar esta ficha?')) {
      setCharacters((prev) => prev.filter((c) => c.id !== id));
      setRelationships((prev) => prev.filter((r) => r.character1Id !== id && r.character2Id !== id));
    }
  };

  const handleOpenRelModal = (rel?: Relationship) => {
    if (rel) {
      setEditingRelId(rel.id);
      setRelFormData({ character1Id: rel.character1Id, character2Id: rel.character2Id, type: rel.type, description: rel.description });
    } else {
      setEditingRelId(null);
      setRelFormData({ character1Id: currentChars[0]?.id || '', character2Id: currentChars[1]?.id || currentChars[0]?.id || '', type: '', description: '' });
    }
    setIsRelModalOpen(true);
  };

  const handleSaveRel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!relFormData.character1Id || !relFormData.character2Id) return;
    const newRel: Relationship = { ...relFormData, id: editingRelId || Date.now().toString(), projectId: selectedProjectId, type: relFormData.type || 'Indefinido' };
    setRelationships((prev) => editingRelId ? prev.map((r) => r.id === editingRelId ? newRel : r) : [newRel, ...prev]);
    setIsRelModalOpen(false);
  };

  const filteredChars = currentChars.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) && (filter === 'Todos' || c.role === filter));

  return (
    <div className="space-y-4 font-sans text-stone-900 dark:text-stone-100">
      {/* NAVEGAÇÃO SUPERIOR */}
      <div className="flex flex-wrap justify-between items-center border-b border-[#4b1d3f]/20 dark:border-[#2e1d3a] pb-2 gap-2">
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('characters')} className={`pb-1 px-2.5 font-bold text-xs flex items-center gap-1.5 border-b-2 transition-colors ${activeTab === 'characters' ? 'border-[#4b1d3f] dark:border-pink-300 text-[#4b1d3f] dark:text-pink-300' : 'border-transparent text-stone-500'}`}>
            <Users size={14} /> Fichas ({currentChars.length})
          </button>
          <button onClick={() => setActiveTab('relationships')} className={`pb-1 px-2.5 font-bold text-xs flex items-center gap-1.5 border-b-2 transition-colors ${activeTab === 'relationships' ? 'border-[#4b1d3f] dark:border-pink-300 text-[#4b1d3f] dark:text-pink-300' : 'border-transparent text-stone-500'}`}>
            <Heart size={14} /> Relacionamentos ({currentRels.length})
          </button>
        </div>
        <div className="flex items-center gap-1.5 bg-[#fcf8f2] dark:bg-[#1a1120] px-2.5 py-1 rounded-xl border border-[#4b1d3f]/20 dark:border-[#2e1d3a]">
          <BookOpen size={14} className="text-[#4b1d3f] dark:text-pink-300" />
          <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer">
            {projects.map((p) => <option key={p.id} value={p.id} className="dark:bg-[#1a1120]">{p.title}</option>)}
          </select>
        </div>
      </div>

      {activeTab === 'characters' && (
        <>
          {/* BARRA DE PESQUISA */}
          <div className="bg-[#fcf8f2] dark:bg-[#1a1321] p-3 rounded-2xl border border-[#4b1d3f]/20 dark:border-[#382b47] flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
              <input type="text" placeholder="Pesquisar ficha..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-[#221a2b] border border-[#4b1d3f]/20 dark:border-[#382b47] rounded-xl text-xs focus:outline-none" />
            </div>
            <div className="flex flex-wrap gap-1">
              {['Todos', 'Protagonista', 'Aliado', 'Antagonista', 'Secundário'].map((cat) => (
                <button key={cat} onClick={() => setFilter(cat)} className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${filter === cat ? 'bg-[#4b1d3f] text-white dark:bg-pink-800' : 'bg-white/80 dark:bg-[#221a2b] text-stone-700 dark:text-stone-300'}`}>{cat}</button>
              ))}
            </div>
            <button onClick={() => handleOpenCharModal()} className="bg-[#4b1d3f] hover:bg-[#38142f] dark:bg-pink-800 dark:hover:bg-pink-900 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-all"><Plus size={14} /> Criar Ficha</button>
          </div>

          {/* GRELHA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredChars.map((char) => (
              <div key={char.id} className="relative bg-[#fcf8f2] dark:bg-[#1a1321] border-2 border-[#4b1d3f]/15 dark:border-[#382b47] rounded-3xl p-5 shadow-xs space-y-3 flex flex-col justify-between transition-colors duration-300">
                <div className="absolute top-4 right-4 flex gap-1 z-10">
                  <button onClick={() => handleOpenCharModal(char)} className="p-1 bg-white/80 dark:bg-[#221a2b] border border-stone-200 dark:border-[#382b47] rounded-lg text-stone-600 dark:text-stone-300 hover:text-[#4b1d3f]"><Edit2 size={13} /></button>
                  <button onClick={() => handleDeleteChar(char.id)} className="p-1 bg-white/80 dark:bg-[#221a2b] border border-stone-200 dark:border-[#382b47] rounded-lg text-red-500 hover:text-red-700"><Trash2 size={13} /></button>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="relative bg-white dark:bg-[#221a2b] p-1.5 pb-5 rounded-md shadow-xs border border-stone-200 dark:border-[#382b47] shrink-0 w-28">
                      <Paperclip size={14} className="absolute -top-2 left-1/2 -translate-x-1/2 text-stone-400" />
                      <div className="aspect-[3/4] w-full overflow-hidden bg-stone-100 dark:bg-[#1a1321] border border-stone-200 dark:border-[#382b47] rounded-xs">
                        {char.imageUrl ? (
                          <img src={char.imageUrl} alt={char.name} style={{ objectFit: char.imageFit || 'cover', objectPosition: char.imagePosition || 'center' }} className="w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400">Sem foto</div>
                        )}
                      </div>
                      <div className="mt-1.5 text-center">
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#4b1d3f] dark:bg-pink-800 text-white rounded-md">{char.role}</span>
                      </div>
                    </div>

                    <div className="flex-grow space-y-2 pr-12">
                      <h3 className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100 leading-tight">{char.name}</h3>
                      <div className="bg-white/80 dark:bg-[#221a2b] p-2.5 rounded-2xl border border-stone-200/80 dark:border-[#382b47] grid grid-cols-2 gap-1.5 text-[11px] font-serif text-stone-800 dark:text-stone-200">
                        <span><Calendar size={11} className="inline mr-1 text-[#4b1d3f] dark:text-pink-300" />{char.age} anos</span>
                        <span><Ruler size={11} className="inline mr-1 text-[#4b1d3f] dark:text-pink-300" />{char.height || '-'}</span>
                        <span><Weight size={11} className="inline mr-1 text-[#4b1d3f] dark:text-pink-300" />{char.weight || '-'}</span>
                        <span><Star size={11} className="inline mr-1 text-[#4b1d3f] dark:text-pink-300" />{char.zodiac || '-'}</span>
                        <span className="col-span-2 pt-1 border-t border-stone-100 dark:border-[#382b47]"><Sparkles size={11} className="inline mr-1 text-[#4b1d3f] dark:text-pink-300" />MBTI: {char.mbti || '-'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-white/80 dark:bg-[#221a2b] p-2.5 rounded-2xl border border-stone-200/80 dark:border-[#382b47]">
                      <h4 className="font-bold text-[10px] text-[#4b1d3f] dark:text-pink-300 uppercase tracking-wider mb-0.5">APARÊNCIA</h4>
                      <p className="text-stone-700 dark:text-stone-300 line-clamp-2">{char.appearance.join(', ') || '-'}</p>
                    </div>
                    <div className="bg-white/80 dark:bg-[#221a2b] p-2.5 rounded-2xl border border-stone-200/80 dark:border-[#382b47] space-y-0.5">
                      <div><strong className="text-[10px] text-[#4b1d3f] dark:text-pink-300">Gosta:</strong> <span className="text-stone-700 dark:text-stone-300 truncate block">{char.likes.join(', ') || '-'}</span></div>
                      <div><strong className="text-[10px] text-red-600 dark:text-red-400">Não Gosta:</strong> <span className="text-stone-700 dark:text-stone-300 truncate block">{char.dislikes.join(', ') || '-'}</span></div>
                    </div>
                  </div>

                  <div className="bg-[#FFF8D6] dark:bg-[#2a2212] text-stone-900 dark:text-amber-100 p-2.5 rounded-2xl border border-amber-200/80 dark:border-amber-900/40 text-[11px] font-serif shadow-2xs">
                    <strong className="text-amber-900 dark:text-amber-300">Nota:</strong> {char.shortNote || 'Sem notas.'}
                  </div>
                </div>

                {char.motto && (
                  <div className="p-2 bg-white/70 dark:bg-[#221a2b] rounded-2xl border border-stone-200/80 dark:border-[#382b47] text-center text-[11px] font-serif italic text-stone-800 dark:text-stone-200 truncate">
                    "{char.motto}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* MAPA DE RELACIONAMENTOS */}
      {activeTab === 'relationships' && (
        <div className="space-y-4">
          <div className="bg-[#fcf8f2] dark:bg-[#1a1321] p-3 rounded-2xl border border-[#4b1d3f]/20 dark:border-[#382b47] flex justify-between items-center">
            <h3 className="font-bold text-xs text-stone-900 dark:text-stone-100 font-serif">Mapa de Relacionamentos</h3>
            <button onClick={() => handleOpenRelModal()} disabled={currentChars.length < 2} className="bg-[#4b1d3f] hover:bg-[#38142f] dark:bg-pink-800 disabled:opacity-50 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"><Plus size={14} /> Adicionar Relacionamento</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentRels.map((rel) => {
              const c1 = currentChars.find((c) => c.id === rel.character1Id);
              const c2 = currentChars.find((c) => c.id === rel.character2Id);
              if (!c1 || !c2) return null;
              return (
                <div key={rel.id} className="bg-[#fcf8f2] dark:bg-[#1a1321] border-2 border-[#4b1d3f]/15 dark:border-[#382b47] rounded-2xl p-3 space-y-2 relative shadow-xs">
                  <div className="absolute top-2 right-2 flex gap-1 z-10">
                    <button onClick={() => handleOpenRelModal(rel)} className="p-1 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"><Edit2 size={13} /></button>
                    <button onClick={() => setRelationships((prev) => prev.filter((r) => r.id !== rel.id))} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs gap-2 px-1">
                    <div className="flex items-center gap-2 max-w-[110px]">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-[#4b1d3f]/20 shrink-0 shadow-xs">
                        {c1.imageUrl ? <img src={c1.imageUrl} alt={c1.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[8px] text-stone-400">-</div>}
                      </div>
                      <span className="font-bold truncate text-[11px]">{c1.name}</span>
                    </div>

                    <span className="px-2.5 py-0.5 bg-[#4b1d3f] dark:bg-pink-800 text-white rounded-md text-[10px] font-bold shrink-0">{rel.type}</span>

                    <div className="flex items-center gap-2 max-w-[110px] flex-row-reverse text-right">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-[#4b1d3f]/20 shrink-0 shadow-xs">
                        {c2.imageUrl ? <img src={c2.imageUrl} alt={c2.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[8px] text-stone-400">-</div>}
                      </div>
                      <span className="font-bold truncate text-[11px]">{c2.name}</span>
                    </div>
                  </div>

                  {rel.description && <p className="text-[11px] text-stone-700 dark:text-stone-300 bg-white/80 dark:bg-[#221a2b] p-2 rounded-xl border border-stone-200 dark:border-[#382b47]">{rel.description}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL FICHA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#fcf8f2] dark:bg-[#1a1321] border border-[#4b1d3f]/30 dark:border-[#382b47] rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-3 text-stone-900 dark:text-stone-100 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b border-[#4b1d3f]/20 dark:border-[#382b47] pb-3">
              <h3 className="font-bold text-sm font-serif">{editingId ? 'Editar Ficha' : 'Criar Nova Ficha'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={16} /></button>
            </div>
            
            <form onSubmit={handleSaveChar} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Nome" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="p-2.5 bg-white dark:bg-[#221a2b] border border-stone-300 dark:border-[#382b47] rounded-xl text-stone-900 dark:text-stone-100" />
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as Character['role'] })} className="p-2.5 bg-white dark:bg-[#221a2b] border border-stone-300 dark:border-[#382b47] rounded-xl text-stone-900 dark:text-stone-100">
                  {['Protagonista', 'Aliado', 'Antagonista', 'Secundário'].map((r) => <option key={r} value={r} className="dark:bg-[#221a2b]">{r}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <input type="number" placeholder="Idade" value={formData.age} onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })} className="p-2.5 bg-white dark:bg-[#221a2b] border border-stone-300 dark:border-[#382b47] rounded-xl text-stone-900 dark:text-stone-100" />
                <input type="text" placeholder="Altura" value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} className="p-2.5 bg-white dark:bg-[#221a2b] border border-stone-300 dark:border-[#382b47] rounded-xl text-stone-900 dark:text-stone-100" />
                <input type="text" placeholder="Peso" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} className="p-2.5 bg-white dark:bg-[#221a2b] border border-stone-300 dark:border-[#382b47] rounded-xl text-stone-900 dark:text-stone-100" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Signo" value={formData.zodiac} onChange={(e) => setFormData({ ...formData, zodiac: e.target.value })} className="p-2.5 bg-white dark:bg-[#221a2b] border border-stone-300 dark:border-[#382b47] rounded-xl text-stone-900 dark:text-stone-100" />
                <input type="text" placeholder="MBTI" value={formData.mbti} onChange={(e) => setFormData({ ...formData, mbti: e.target.value })} className="p-2.5 bg-white dark:bg-[#221a2b] border border-stone-300 dark:border-[#382b47] rounded-xl text-stone-900 dark:text-stone-100" />
              </div>

              <div className="space-y-1.5 p-3 bg-white/60 dark:bg-[#221a2b]/50 rounded-2xl border border-stone-300 dark:border-[#382b47]">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Fotografia</span>
                  <div className="flex gap-1 text-[10px]">
                    <button type="button" onClick={() => setImgInputType('link')} className={`px-2 py-0.5 rounded ${imgInputType === 'link' ? 'bg-[#4b1d3f] text-white' : ''}`}><LinkIcon size={10} className="inline mr-0.5" />Link</button>
                    <button type="button" onClick={() => setImgInputType('file')} className={`px-2 py-0.5 rounded ${imgInputType === 'file' ? 'bg-[#4b1d3f] text-white' : ''}`}><ImageIcon size={10} className="inline mr-0.5" />Galeria</button>
                  </div>
                </div>
                {imgInputType === 'link' ? (
                  <input type="url" placeholder="URL da imagem..." value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full p-2.5 bg-white dark:bg-[#221a2b] border border-stone-300 dark:border-[#382b47] rounded-xl text-stone-900 dark:text-stone-100" />
                ) : (
                  <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#4b1d3f] file:text-white file:cursor-pointer" />
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <select value={formData.imageFit} onChange={(e) => setFormData({ ...formData, imageFit: e.target.value as 'cover' | 'contain' })} className="w-full p-2 bg-white dark:bg-[#221a2b] border border-stone-300 dark:border-[#382b47] rounded-xl text-[11px]">
                    <option value="cover">Preencher (Cover)</option>
                    <option value="contain">Ajustar Completo (Contain)</option>
                  </select>
                  <select value={formData.imagePosition} onChange={(e) => setFormData({ ...formData, imagePosition: e.target.value })} className="w-full p-2 bg-white dark:bg-[#221a2b] border border-stone-300 dark:border-[#382b47] rounded-xl text-[11px]">
                    <option value="center">Centro</option>
                    <option value="top">Topo</option>
                    <option value="bottom">Fundo</option>
                  </select>
                </div>
              </div>

              <input type="text" placeholder="Aparência (separada por vírgulas)" value={formData.appearance} onChange={(e) => setFormData({ ...formData, appearance: e.target.value })} className="w-full p-2.5 bg-white dark:bg-[#221a2b] border border-stone-300 dark:border-[#382b47] rounded-xl text-stone-900 dark:text-stone-100" />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Gosta (vírgulas)" value={formData.likes} onChange={(e) => setFormData({ ...formData, likes: e.target.value })} className="p-2.5 bg-white dark:bg-[#221a2b] border border-stone-300 dark:border-[#382b47] rounded-xl text-stone-900 dark:text-stone-100" />
                <input type="text" placeholder="Não Gosta (vírgulas)" value={formData.dislikes} onChange={(e) => setFormData({ ...formData, dislikes: e.target.value })} className="p-2.5 bg-white dark:bg-[#221a2b] border border-stone-300 dark:border-[#382b47] rounded-xl text-stone-900 dark:text-stone-100" />
              </div>
              <input type="text" placeholder="Frase / Lema" value={formData.motto} onChange={(e) => setFormData({ ...formData, motto: e.target.value })} className="w-full p-2.5 bg-white dark:bg-[#221a2b] border border-stone-300 dark:border-[#382b47] rounded-xl text-stone-900 dark:text-stone-100" />
              <textarea placeholder="Nota Rápida" rows={2} value={formData.shortNote} onChange={(e) => setFormData({ ...formData, shortNote: e.target.value })} className="w-full p-2.5 bg-white dark:bg-[#221a2b] border border-stone-300 dark:border-[#382b47] rounded-xl text-stone-900 dark:text-stone-100" />

              <div className="flex justify-end gap-2 pt-3 border-t border-[#4b1d3f]/20 dark:border-[#382b47]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-stone-200 dark:bg-stone-800 rounded-xl font-semibold">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-[#4b1d3f] dark:bg-pink-800 text-white rounded-xl font-bold">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RELACIONAMENTO */}
      {isRelModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#fcf8f2] dark:bg-[#1a1321] border border-[#4b1d3f]/30 dark:border-[#382b47] rounded-3xl p-5 w-full max-w-sm space-y-3 text-xs text-stone-900 dark:text-stone-100 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#4b1d3f]/20 dark:border-[#382b47] pb-3">
              <h3 className="font-bold">{editingRelId ? 'Editar Relacionamento' : 'Novo Relacionamento'}</h3>
              <button onClick={() => setIsRelModalOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSaveRel} className="space-y-2.5">
              <select value={relFormData.character1Id} onChange={(e) => setRelFormData({ ...relFormData, character1Id: e.target.value })} className="w-full p-2.5 bg-white dark:bg-[#221a2b] border border-stone-300 dark:border-[#382b47] rounded-xl">
                {currentChars.map((c) => <option key={c.id} value={c.id} className="dark:bg-[#221a2b]">{c.name}</option>)}
              </select>
              <select value={relFormData.character2Id} onChange={(e) => setRelFormData({ ...relFormData, character2Id: e.target.value })} className="w-full p-2.5 bg-white dark:bg-[#221a2b] border border-stone-300 dark:border-[#382b47] rounded-xl">
                {currentChars.map((c) => <option key={c.id} value={c.id} className="dark:bg-[#221a2b]">{c.name}</option>)}
              </select>
              <input type="text" placeholder="Tipo de Ligação" required value={relFormData.type} onChange={(e) => setRelFormData({ ...relFormData, type: e.target.value })} className="w-full p-2.5 bg-white dark:bg-[#221a2b] border border-stone-300 dark:border-[#382b47] rounded-xl" />
              <textarea placeholder="Descrição" rows={2} value={relFormData.description} onChange={(e) => setRelFormData({ ...relFormData, description: e.target.value })} className="w-full p-2.5 bg-white dark:bg-[#221a2b] border border-stone-300 dark:border-[#382b47] rounded-xl" />
              <div className="flex justify-end gap-2 pt-3 border-t border-[#4b1d3f]/20 dark:border-[#382b47]">
                <button type="button" onClick={() => setIsRelModalOpen(false)} className="px-4 py-2 bg-stone-200 dark:bg-stone-800 rounded-xl font-semibold">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-[#4b1d3f] dark:bg-pink-800 text-white rounded-xl font-bold">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}