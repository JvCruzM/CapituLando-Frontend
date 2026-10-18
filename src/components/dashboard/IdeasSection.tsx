'use client';

import React, { useState, useEffect } from 'react';
import { Lightbulb, Plus, Trash2, Edit2, X, Check, Sparkles, BookOpen, User, Globe, ShieldAlert, BookmarkPlus } from 'lucide-react';

interface Idea {
  id: string;
  projectId: string;
  content: string;
  category?: 'Geral' | 'Nomes' | 'Mundo' | 'Personagens' | 'Regras';
  createdAt: string;
}

interface ProjectMinimal {
  id: string;
  title: string;
  genre: string;
}

const DEFAULT_PROJECTS: ProjectMinimal[] = [
  { id: '1', title: 'O Guardião da Floresta', genre: 'Fantasia' },
  { id: '2', title: 'Segredos de Algures', genre: 'Mistério' },
];

const SUGGESTIONS_DATABASE: Record<string, { names: string[]; personalities: string[]; worlds: string[]; rules: string[]; }> = {
  Fantasia: {
    names: [
      'Aurelius Vance', 'Elowen Vale', 'Kaelen Vane', 'Thalia Solis', 'Zephyr Nightshade',
      'Lysander Vane', 'Isolde Brightwood', 'Gideon Blackwood', 'Rowan Sterling', 'Valerie Frost',
      'Caspian Draven', 'Lyra Moonwhisper', 'Orion Ashworth', 'Seraphina Cross', 'Dorian Nightshade',
      'Aelin Fireheart', 'Balthazar Thorne', 'Evadne Starling', 'Morrigan Crowe', 'Sylvester Vance'
    ],
    personalities: [
      'Guardião estóico com medo secreto de falhar.', 
      'Mago prodígio impulsivo que atua sem pensar.',
      'Antigo cavaleiro desonrado em busca de redenção.',
      'Erudita cética que acaba por descobrir magia ancestral.',
      'Ladrão carismático com um código moral estrito e inegociável.',
      'Sacerdotisa exilada atormentada por visões do futuro.',
      'Príncipe herdeiro rebelde disfarçado de mercenário.',
      'Alquimista excêntrico obcecado por criar a poção da imortalidade.',
      'Caçador de monstros solitário que protege criaturas mágicas.',
      'Nómada silencioso que guarda um segredo sobre o fim dos deuses.'
    ],
    worlds: [
      'Vales Sussurrantes: Floresta antiga onde as árvores guardam memórias dos mortos.', 
      'Cidade de Quartzo: Fortaleza escavada numa montanha flutuante de cristais.',
      'Ilhas Nebulosas: Arquipélago onde o tempo flui a velocidades diferentes.',
      'Reino Subterrâneo de Oros: Cidades iluminadas por fungos bioluminescentes.',
      'Deserto de Cinzas: Terras áridas onde impérios antigos foram sepultados.',
      'Arquipélago dos Ventos: Ilhas ligadas apenas por pontes de corda e magia aérea.',
      'Pantanal de Lótus: Pântano místico cujas flores concedem visões proféticas.',
      'Cidadela de Aço: Metrópole industrial onde a tecnologia substituiu a magia.'
    ],
    rules: [
      'A magia exige um sacrifício físico ou emocional proporcional à sua intensidade.', 
      'Espelhos purificados refletem e aprisionam seres espirituais e sombras.',
      'Nenhum mortal pode pronunciar o verdadeiro nome dos deuses sem enlouquecer.',
      'A luz do sol pleno anula temporariamente qualquer feitiço de ilusão.',
      'O sangue de dragão consumido concede poder mas corrompe a alma do utilizador.',
      'Objectos encantados perdem o seu poder se forem tocados por ferro frio.',
      'Toda a promessa feita sob a lua nova torna-se um contrato mágico vinculativo.',
      'A morte de um monarca liberta um cataclismo elemental na região.'
    ],
  },
  Mistério: {
    names: [
      'Inspector Arthur Pendelton', 'Clara Sterling', 'Devon Hayes', 'Sloane Vance',
      'Julian Vance', 'Victoria Cross', 'Marcus Sterling', 'Beatrice Thorne',
      'Nathaniel Drake', 'Evelyn Reed', 'Oliver Sterling', 'Genevieve DuPont'
    ],
    personalities: [
      'Detetive metódico obcecado por pequenos detalhes e padrões.', 
      'Jornalista destemida em busca da verdade por trás da corporação.',
      'Antigo médico forense com métodos pouco ortodoxos e cínicos.',
      'Psicólogo criminal brilhante que compreende a mente dos assassinos.',
      'Investigador particular cínico viciado em café e segredos alheios.',
      'Arquivista silencioso que descobre pistas esquecidas em documentos antigos.'
    ],
    worlds: [
      'Vila de Algures: Cidade costeira isolada envolta em nevoeiro perpétuo.', 
      'Hotel Beira-Mar: Antigo edifício vitoriano abandonado após um homicídio irresoluto.',
      'Distrito Financeiro de Metro-City: Arranha-céus corporativos repletos de corrupção.',
      'Mansão Blackwood: Propriedade isolada com passagens secretas e cofres ocultos.',
      'Bairro Antigo: Ruas de paralelepípedos onde os segredos dos anos 70 ainda vivem.'
    ],
    rules: [
      'O culpado deixa sempre um objeto pessoal ou assinatura no local do crime.', 
      'Ninguém fala sobre a fatídica noite de 1998 na cidade.',
      'Todas as provas recolhidas sem mandado judicial perdem validade legal.',
      'Testemunhas oculares sob ameaça mudam sempre o seu testemunho após 48 horas.',
      'O sistema de câmaras de segurança da cidade desliga-se exatamente à meia-noite.'
    ],
  },
  Geral: {
    names: [
      'Gabriel Santos', 'Elena Rostova', 'Lucas Vane', 'Mateus Silva', 'Beatriz Costa',
      'Rafael Mendes', 'Sofia Alencar', 'Diego Ramos', 'Carolina Lima', 'Thiago Farias'
    ],
    personalities: [
      'Idealista inabalável que tenta salvar todos ao seu redor.', 
      'Estrategista frio e calculista focado estritamente no bem maior.',
      'Artista boémio que documenta a história através de pinturas e diários.',
      'Líder nato relutante que carrega o peso das escolhas do grupo.'
    ],
    worlds: [
      'A Capital do Vale: Centro de comércio murado entre colinas verdes.', 
      'Distrito Esquecido: Zona industrial abandonada dominada por fações rivais.',
      'Estação Fronteiriça: Ponto de encontro entre diferentes culturas e reinos.'
    ],
    rules: [
      'Toda a aliança política exige um contrato assinado em presença de testemunhas.', 
      'Segredos públicos perdem o seu valor estratégico após 7 dias de divulgação.',
      'Nenhum cidadão pode circular após o toque de recolher sem salvo-conduto.'
    ],
  },
};

export function IdeasSection() {
  const [projects] = useState<ProjectMinimal[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_PROJECTS;
    const saved = localStorage.getItem('capitulando_projects');
    return saved ? JSON.parse(saved) : DEFAULT_PROJECTS;
  });

  const [ideas, setIdeas] = useState<Idea[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('capitulando_ideas');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('capitulando_ideas', JSON.stringify(ideas));
    }
  }, [ideas]);

  const [selectedProjectId, setSelectedProjectId] = useState(() => projects[0]?.id || '1');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIdeaId, setEditingIdeaId] = useState<string | null>(null);
  const [ideaContent, setIdeaContent] = useState('');
  const [ideaCategory, setIdeaCategory] = useState<Idea['category']>('Geral');
  const [currentSuggestion, setCurrentSuggestion] = useState<{ type: string; text: string } | null>(null);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const currentGenre = selectedProject?.genre || 'Fantasia';
  const projectIdeas = ideas.filter((i) => i.projectId === selectedProjectId);

  const handleGenerateSuggestion = (type: 'names' | 'personalities' | 'worlds' | 'rules') => {
    const db = SUGGESTIONS_DATABASE[currentGenre] || SUGGESTIONS_DATABASE['Geral'];
    const list = db[type] || SUGGESTIONS_DATABASE['Geral'][type];
    const text = list[Math.floor(Math.random() * list.length)];
    const labels: Record<string, string> = { names: 'Nome', personalities: 'Personalidade', worlds: 'Mundo / Local', rules: 'Regra' };
    setCurrentSuggestion({ type: `Sugestão de ${labels[type]}`, text });
  };

  const handleSaveSuggestionAsIdea = () => {
    if (!currentSuggestion) return;
    const newIdea: Idea = {
      id: Date.now().toString(),
      projectId: selectedProjectId,
      content: `${currentSuggestion.type}: ${currentSuggestion.text}`,
      category: 'Geral',
      createdAt: new Date().toLocaleDateString('pt-PT'),
    };
    setIdeas((prev) => [newIdea, ...prev]);
  };

  const handleOpenModal = (idea?: Idea) => {
    if (idea) {
      setEditingIdeaId(idea.id);
      setIdeaContent(idea.content);
      setIdeaCategory(idea.category || 'Geral');
    } else {
      setEditingIdeaId(null);
      setIdeaContent('');
      setIdeaCategory('Geral');
    }
    setIsModalOpen(true);
  };

  const handleSaveIdea = (e: React.FormEvent) => {
    e.preventDefault();
    const newIdea: Idea = {
      id: editingIdeaId || Date.now().toString(),
      projectId: selectedProjectId,
      content: ideaContent,
      category: ideaCategory,
      createdAt: new Date().toLocaleDateString('pt-PT'),
    };
    setIdeas((prev) => editingIdeaId ? prev.map((i) => (i.id === editingIdeaId ? newIdea : i)) : [newIdea, ...prev]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* CABEÇALHO */}
      <div className="bg-[#fcf8f2] dark:bg-[#1a1321] p-5 rounded-3xl border border-[#4b1d3f]/20 dark:border-[#382b47] flex flex-col md:flex-row justify-between items-center gap-4 shadow-xs transition-colors duration-300">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#f3ccde]/40 dark:bg-[#2a2035] text-[#4b1d3f] dark:text-pink-300 rounded-2xl border border-[#4b1d3f]/20 dark:border-[#382b47]">
            <Lightbulb size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100">Bloco de Ideias & Gerador Criativo</h2>
            <p className="text-xs text-stone-600 dark:text-stone-400">Anote pensamentos e obtenha dezenas de inspirações automáticas.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 bg-white dark:bg-[#221a2b] px-3.5 py-2 rounded-xl border border-[#4b1d3f]/20 dark:border-[#382b47] shadow-xs flex-1 md:flex-none">
            <BookOpen size={16} className="text-[#4b1d3f] dark:text-pink-300 shrink-0" />
            <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className="bg-transparent text-xs font-bold text-stone-800 dark:text-stone-200 focus:outline-none cursor-pointer w-full">
              {projects.map((p) => <option key={p.id} value={p.id} className="bg-[#fcf8f2] dark:bg-[#221a2b] text-stone-900 dark:text-stone-100">{p.title} ({p.genre || 'Fantasia'})</option>)}
            </select>
          </div>
          <button onClick={() => handleOpenModal()} className="bg-[#4b1d3f] hover:bg-[#38142f] dark:bg-pink-800 dark:hover:bg-pink-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm shrink-0 transition-all">
            <Plus size={16} /> Nova Ideia
          </button>
        </div>
      </div>

      {/* GERADOR CRIATIVO */}
      <div className="bg-[#fcf8f2] dark:bg-[#1a1321] border border-[#4b1d3f]/20 dark:border-[#382b47] rounded-3xl p-6 shadow-xs space-y-4 transition-colors duration-300">
        <div className="flex items-center gap-2 border-b border-[#4b1d3f]/10 dark:border-[#382b47] pb-3">
          <Sparkles size={18} className="text-[#4b1d3f] dark:text-pink-300" />
          <h3 className="font-bold font-serif text-stone-900 dark:text-stone-100 text-sm md:text-base">Gerador de Inspiração ({currentGenre})</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { type: 'names' as const, label: 'Nomes', icon: User },
            { type: 'personalities' as const, label: 'Personalidade', icon: Sparkles },
            { type: 'worlds' as const, label: 'Mundos', icon: Globe },
            { type: 'rules' as const, label: 'Regras', icon: ShieldAlert },
          ].map(({ type, label, icon: Icon }) => (
            <button key={type} onClick={() => handleGenerateSuggestion(type)} className="p-3 bg-white dark:bg-[#221a2b] hover:bg-[#f3ccde]/30 dark:hover:bg-[#2a2035] border border-stone-200 dark:border-[#382b47] rounded-2xl text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center justify-center gap-2 shadow-xs transition-all">
              <Icon size={16} className="text-[#4b1d3f] dark:text-pink-300" /> {label}
            </button>
          ))}
        </div>

        {currentSuggestion && (
          <div className="bg-[#f3ccde]/30 dark:bg-[#221a2b] border border-[#4b1d3f]/30 dark:border-[#382b47] p-4 rounded-2xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#4b1d3f] dark:text-pink-300 bg-white dark:bg-[#1a1321] px-2.5 py-0.5 rounded-full border border-[#4b1d3f]/20 dark:border-[#382b47]">{currentSuggestion.type}</span>
              <button onClick={handleSaveSuggestionAsIdea} className="text-xs font-bold text-[#4b1d3f] dark:text-pink-300 hover:underline flex items-center gap-1 bg-white dark:bg-[#1a1321] px-3 py-1 rounded-xl border border-[#4b1d3f]/20 dark:border-[#382b47] shadow-xs"><BookmarkPlus size={14} /> Salvar no Bloco</button>
            </div>
            <p className="text-xs font-serif italic text-stone-800 dark:text-stone-200 leading-relaxed">"{currentSuggestion.text}"</p>
          </div>
        )}
      </div>

      {/* LISTA DE NOTAS */}
      <div className="space-y-4">
        <h3 className="font-bold font-serif text-stone-900 dark:text-stone-100 text-base flex items-center gap-2">
          <Lightbulb size={18} className="text-[#4b1d3f] dark:text-pink-300" /> Notas do Projeto ({projectIdeas.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projectIdeas.map((idea) => (
            <div key={idea.id} className="bg-[#fcf8f2] dark:bg-[#1a1321] border border-[#4b1d3f]/20 dark:border-[#382b47] rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all">
              <div className="flex justify-between items-start gap-2">
                <p className="text-xs text-stone-800 dark:text-stone-200 italic font-serif leading-relaxed">"{idea.content}"</p>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleOpenModal(idea)} className="p-1.5 text-stone-400 hover:text-[#4b1d3f] dark:hover:text-pink-300 rounded-lg transition-colors"><Edit2 size={14} /></button>
                  <button onClick={() => setIdeas((prev) => prev.filter((i) => i.id !== idea.id))} className="p-1.5 text-red-400 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="flex justify-between items-center text-[10px] text-stone-500 dark:text-stone-400 border-t border-stone-200 dark:border-[#382b47] pt-3">
                <span className="font-bold uppercase tracking-wider text-[#4b1d3f] dark:text-pink-300 bg-white dark:bg-[#221a2b] px-2 py-0.5 rounded border border-[#4b1d3f]/15 dark:border-[#382b47]">{idea.category || 'Geral'}</span>
                <span>{idea.createdAt}</span>
              </div>
            </div>
          ))}
        </div>

        {projectIdeas.length === 0 && (
          <div className="text-center py-12 bg-[#fcf8f2] dark:bg-[#1a1321] rounded-3xl border border-dashed border-[#4b1d3f]/20 dark:border-[#382b47] text-stone-500 dark:text-stone-400 space-y-2">
            <Lightbulb size={32} className="mx-auto text-stone-400 dark:text-stone-600" />
            <p className="text-xs font-semibold">Nenhuma ideia anotada ainda. Use o gerador acima ou clique em "Nova Ideia".</p>
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#fcf8f2] dark:bg-[#1a1321] border border-[#4b1d3f]/30 dark:border-[#382b47] rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 text-stone-900 dark:text-stone-100">
            <div className="flex justify-between items-center border-b border-[#4b1d3f]/20 dark:border-[#382b47] pb-3">
              <h3 className="font-bold font-serif text-lg">{editingIdeaId ? 'Editar Ideia' : 'Nova Ideia'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveIdea} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Categoria</label>
                <select value={ideaCategory} onChange={(e) => setIdeaCategory(e.target.value as Idea['category'])} className="w-full p-2.5 bg-white dark:bg-[#221a2b] border border-stone-300 dark:border-[#382b47] rounded-xl text-stone-800 dark:text-stone-100 focus:outline-none">
                  <option value="Geral">Geral</option>
                  <option value="Nomes">Nomes</option>
                  <option value="Mundo">Mundo / Cenário</option>
                  <option value="Personagens">Personagens</option>
                  <option value="Regras">Regras do Universo</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Anotação / Insight</label>
                <textarea rows={4} required placeholder="Escreva o seu pensamento..." value={ideaContent} onChange={(e) => setIdeaContent(e.target.value)} className="w-full p-2.5 bg-white dark:bg-[#221a2b] border border-stone-300 dark:border-[#382b47] rounded-xl text-stone-800 dark:text-stone-100 focus:outline-none resize-y" />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#4b1d3f]/20 dark:border-[#382b47]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-xl font-semibold">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-[#4b1d3f] dark:bg-pink-800 text-white rounded-xl font-bold flex items-center gap-1"><Check size={16} /> Guardar Ideia</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}