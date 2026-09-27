'use client';

import React, { useState } from 'react';
import { Character } from '@/types/character';
import { Plus, Search, Heart, User, Sparkles, X, Edit2, Trash2 } from 'lucide-react';

const INITIAL_CHARACTERS: Character[] = [
  {
    id: '1',
    name: 'Anya Silva',
    role: 'Protagonista',
    age: 23,
    mbti: 'INFJ',
    motivation: 'Salvar sua terra natal e descobrir a verdade sobre a magia arcaica.',
    avatarText: 'A',
    relationship: {
      target: 'Ben',
      type: 'Amigo',
      level: 4,
    },
    notes: 'Possui uma marca misteriosa no pulso esquerdo.'
  },
  {
    id: '2',
    name: 'Ben Thorne',
    role: 'Aliado',
    age: 25,
    mbti: 'ESTP',
    motivation: 'Proteger Anya e pagar uma dívida do passado.',
    avatarText: 'B',
    relationship: {
      target: 'Anya',
      type: 'Guardião',
      level: 5,
    },
    notes: 'Especialista em combate corporal e rastreamento.'
  }
];

export function CharactersSection() {
  const [characters, setCharacters] = useState<Character[]>(INITIAL_CHARACTERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  // Formulário State
  const [formData, setFormData] = useState<Partial<Character>>({
    name: '',
    role: 'Protagonista',
    age: 20,
    mbti: 'INTJ',
    motivation: '',
    relationship: { target: '', type: 'Amigo', level: 3 }
  });

  const filteredCharacters = characters.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.motivation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'Todos' || c.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleOpenModal = (char?: Character) => {
    if (char) {
      setSelectedCharacter(char);
      setFormData(char);
    } else {
      setSelectedCharacter(null);
      setFormData({
        name: '',
        role: 'Protagonista',
        age: 20,
        mbti: 'INTJ',
        motivation: '',
        relationship: { target: '', type: 'Amigo', level: 3 }
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (selectedCharacter) {
      setCharacters(characters.map((c) => c.id === selectedCharacter.id ? { ...c, ...formData } as Character : c));
    } else {
      const newChar: Character = {
        id: Date.now().toString(),
        name: formData.name || 'Sem nome',
        role: formData.role || 'Secundário',
        age: Number(formData.age) || 18,
        mbti: formData.mbti || 'N/A',
        motivation: formData.motivation || '',
        avatarText: (formData.name || 'C').charAt(0).toUpperCase(),
        relationship: formData.relationship || { target: 'Nenhum', type: 'Neutro', level: 3 }
      };
      setCharacters([...characters, newChar]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja eliminar este personagem?')) {
      setCharacters(characters.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Ações / Filtros */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-cozy-card border border-cozy-card-border p-4 rounded-xl shadow-sm">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 text-stone-500" size={18} />
          <input
            type="text"
            placeholder="Pesquisar personagem..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/60 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cozy-green-light"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['Todos', 'Protagonista', 'Aliado', 'Antagonista', 'Secundário'].map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterRole === role
                  ? 'bg-cozy-green-dark text-white'
                  : 'bg-white/50 text-stone-700 hover:bg-white'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-cozy-green-dark text-white px-4 py-2 rounded-lg hover:bg-cozy-green-light transition-colors text-sm font-semibold shadow-sm"
        >
          <Plus size={18} />
          Novo Personagem
        </button>
      </div>

      {/* Grid de Cards de Personagens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCharacters.map((char) => (
          <div
            key={char.id}
            className="bg-cozy-card border border-cozy-card-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-200 border border-amber-300 rounded-lg flex items-center justify-center text-xl font-bold text-cozy-brown shadow-inner">
                    {char.avatarText}
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-800 text-lg">{char.name}</h3>
                    <span className="inline-block px-2 py-0.5 bg-stone-200 text-stone-700 text-xs rounded-full font-medium">
                      {char.role}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenModal(char)}
                    className="p-1 text-stone-500 hover:text-stone-800"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(char.id)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Atributos */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-white/40 p-2.5 rounded-lg border border-cozy-card-border/60">
                <div><span className="font-semibold text-stone-600">Idade:</span> {char.age} anos</div>
                <div><span className="font-semibold text-stone-600">MBTI:</span> {char.mbti}</div>
              </div>

              {/* Motivação */}
              <div className="mt-3">
                <span className="text-xs font-semibold text-stone-600 block">Motivação:</span>
                <p className="text-xs text-stone-700 italic mt-0.5 line-clamp-2">
                  "{char.motivation}"
                </p>
              </div>
            </div>

            {/* Relacionamento */}
            <div className="mt-4 pt-3 border-t border-stone-200/80 flex justify-between items-center text-xs">
              <span className="text-stone-600">
                Relação: <strong>{char.relationship.target}</strong> ({char.relationship.type})
              </span>
              <div className="flex text-red-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Heart
                    key={star}
                    size={14}
                    fill={star <= char.relationship.level ? '#ef4444' : 'none'}
                    className={star <= char.relationship.level ? 'text-red-500' : 'text-stone-300'}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Adicionar / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-cozy-card border border-cozy-card-border rounded-xl w-full max-w-lg p-6 shadow-xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-stone-500 hover:text-stone-800"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-cozy-brown mb-4">
              {selectedCharacter ? 'Editar Personagem' : 'Novo Personagem'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Nome</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cozy-green-light"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Papel</label>
                  <select
                    value={formData.role || 'Protagonista'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cozy-green-light"
                  >
                    <option value="Protagonista">Protagonista</option>
                    <option value="Aliado">Aliado</option>
                    <option value="Antagonista">Antagonista</option>
                    <option value="Secundário">Secundário</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Idade</label>
                  <input
                    type="number"
                    value={formData.age || ''}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cozy-green-light"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">MBTI</label>
                  <input
                    type="text"
                    value={formData.mbti || ''}
                    onChange={(e) => setFormData({ ...formData, mbti: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cozy-green-light"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Motivação / Arco</label>
                <textarea
                  rows={2}
                  value={formData.motivation || ''}
                  onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cozy-green-light"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700 text-sm hover:bg-white/60"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cozy-green-dark text-white rounded-lg text-sm font-semibold hover:bg-cozy-green-light"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}