'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Share2,
  X,
  Check,
  FileText,
  ArrowLeft,
  Save,
} from 'lucide-react';

interface Chapter {
  id: string;
  number: number;
  title: string;
  content: string;
  wordCount: number;
  status: 'Rascunho' | 'Em revisão' | 'Concluído';
}

interface Project {
  id: string;
  title: string;
  genre: string;
  description: string;
  status: 'Em progresso' | 'Em planeamento' | 'Concluído';
  progress: number;
  chapters?: Chapter[];
}

const DEFAULT_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'O Guardião da Floresta',
    genre: 'Fantasia',
    description: 'Uma jornada mágica sobre segredos antigos e guardiões da natureza.',
    status: 'Em progresso',
    progress: 60,
    chapters: [
      {
        id: 'c1',
        number: 1,
        title: 'o chamado da floresta',
        content: 'O vento sobrava de forma fria e angustiante naquela de abril....',
        wordCount: 11,
        status: 'Rascunho',
      },
    ],
  },
  {
    id: '2',
    title: 'Segredos de Algures',
    genre: 'Mistério',
    description: 'Investigação em uma cidade isolada onde nada é o que parece.',
    status: 'Em planeamento',
    progress: 25,
    chapters: [],
  },
];

export function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('capitulando_projects');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed.map((p: Project) => ({
            ...p,
            chapters: p.chapters || [],
          }));
        } catch (e) {
          console.error('Erro ao ler projetos do localStorage', e);
        }
      }
    }
    return DEFAULT_PROJECTS;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('capitulando_projects', JSON.stringify(projects));
    }
  }, [projects]);

  const [activeProject, setActiveProject] = useState<Project | null>(null);

  // Modal de Projeto
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  const [projectForm, setProjectForm] = useState({
    title: '',
    genre: '',
    description: '',
    status: 'Em progresso' as Project['status'],
    progress: 0,
  });

  // Modal de Capítulo
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);

  const [chapterForm, setChapterForm] = useState({
    number: 1,
    title: '',
    content: '',
    status: 'Rascunho' as Chapter['status'],
  });

  // HANDLERS DE PROJETO
  const handleOpenCreateProject = () => {
    setEditingProjectId(null);
    setProjectForm({
      title: '',
      genre: 'Fantasia',
      description: '',
      status: 'Em progresso',
      progress: 10,
    });
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProject = (project: Project) => {
    setEditingProjectId(project.id);
    setProjectForm({
      title: project.title,
      genre: project.genre,
      description: project.description,
      status: project.status,
      progress: project.progress,
    });
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProjectId) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === editingProjectId
            ? { ...p, ...projectForm, chapters: p.chapters || [] }
            : p
        )
      );
      if (activeProject && activeProject.id === editingProjectId) {
        setActiveProject((prev) =>
          prev ? { ...prev, ...projectForm } : null
        );
      }
    } else {
      const newProj: Project = {
        id: Date.now().toString(),
        title: projectForm.title || 'Sem título',
        genre: projectForm.genre || 'Geral',
        description: projectForm.description || '',
        status: projectForm.status,
        progress: projectForm.progress || 0,
        chapters: [],
      };
      setProjects((prev) => [newProj, ...prev]);
    }

    setIsProjectModalOpen(false);
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('Tem certeza de que deseja excluir este projeto?')) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (activeProject?.id === id) {
        setActiveProject(null);
      }
    }
  };

  const handleShareProject = (project: Project) => {
    const chaptersList = project.chapters || [];
    const totalWords = chaptersList.reduce((acc, c) => acc + c.wordCount, 0);
    const textToShare = `📚 Livro: ${project.title}\n✨ Género: ${project.genre}\n📝 Sinopse: ${project.description}\n📊 Progresso: ${project.progress}% (${chaptersList.length} capítulos, ${totalWords} palavras) - Status: ${project.status}`;

    navigator.clipboard.writeText(textToShare);
    alert('Informações do projeto copiadas para a área de transferência!');
  };

  // HANDLERS DE CAPÍTULOS
  const handleOpenCreateChapter = () => {
    if (!activeProject) return;
    const currentChapters = activeProject.chapters || [];
    setEditingChapterId(null);
    setChapterForm({
      number: currentChapters.length + 1,
      title: '',
      content: '',
      status: 'Rascunho',
    });
    setIsChapterModalOpen(true);
  };

  const handleOpenEditChapter = (chapter: Chapter) => {
    setEditingChapterId(chapter.id);
    setChapterForm({
      number: chapter.number,
      title: chapter.title,
      content: chapter.content,
      status: chapter.status,
    });
    setIsChapterModalOpen(true);
  };

  const handleSaveChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;

    const currentChapters = activeProject.chapters || [];
    const words = chapterForm.content.trim() ? chapterForm.content.trim().split(/\s+/).length : 0;

    let updatedChapters: Chapter[];

    if (editingChapterId) {
      updatedChapters = currentChapters.map((c) =>
        c.id === editingChapterId
          ? {
              ...c,
              number: Number(chapterForm.number),
              title: chapterForm.title || `Capítulo ${chapterForm.number}`,
              content: chapterForm.content,
              wordCount: words,
              status: chapterForm.status,
            }
          : c
      );
    } else {
      const newChap: Chapter = {
        id: Date.now().toString(),
        number: Number(chapterForm.number),
        title: chapterForm.title || `Capítulo ${chapterForm.number}`,
        content: chapterForm.content,
        wordCount: words,
        status: chapterForm.status,
      };
      updatedChapters = [...currentChapters, newChap];
    }

    updatedChapters.sort((a, b) => a.number - b.number);

    const updatedProject = { ...activeProject, chapters: updatedChapters };

    setProjects((prev) =>
      prev.map((p) => (p.id === activeProject.id ? updatedProject : p))
    );
    setActiveProject(updatedProject);
    setIsChapterModalOpen(false);
  };

  const handleDeleteChapter = (chapterId: string) => {
    if (!activeProject) return;
    const currentChapters = activeProject.chapters || [];
    if (confirm('Tem certeza de que deseja excluir este capítulo?')) {
      const updatedChapters = currentChapters.filter((c) => c.id !== chapterId);
      const updatedProject = { ...activeProject, chapters: updatedChapters };

      setProjects((prev) =>
        prev.map((p) => (p.id === activeProject.id ? updatedProject : p))
      );
      setActiveProject(updatedProject);
    }
  };

  // VISTA INTERNA DO PROJETO SELECIONADO
  if (activeProject) {
    const chaptersList = activeProject.chapters || [];
    const totalWords = chaptersList.reduce((acc, c) => acc + c.wordCount, 0);

    return (
      <div className="space-y-6 font-sans">
        {/* Barra de Navegação Interna */}
        <div className="bg-[#f7eee3] p-4 rounded-2xl border-2 border-[#d8c2aa] flex items-center justify-between shadow-md">
          <button
            onClick={() => setActiveProject(null)}
            className="flex items-center gap-2 text-xs font-bold text-[#385338] hover:text-[#2c422c] transition-colors bg-[#ebd9c6] px-3 py-2 rounded-xl border border-[#d8c2aa]"
          >
            <ArrowLeft size={16} />
            <span>Voltar aos Projetos</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenEditProject(activeProject)}
              className="px-4 py-2 bg-white hover:bg-stone-100 rounded-xl border-2 border-[#d8c2aa] text-stone-800 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors active:scale-95"
            >
              <Edit2 size={14} className="text-[#385338]" />
              <span>Editar Dados</span>
            </button>
            <button
              onClick={handleOpenCreateChapter}
              className="bg-[#385338] hover:bg-[#2c422c] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
            >
              <Plus size={16} />
              <span>Novo Capítulo</span>
            </button>
          </div>
        </div>

        {/* Detalhes do Projeto */}
        <div className="bg-[#ffffff] border-2 border-[#d8c2aa] rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="inline-block px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-md text-[10px] font-bold uppercase">
                {activeProject.genre}
              </span>
              <h2 className="text-2xl font-bold font-serif text-stone-900 mt-1">
                {activeProject.title}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-[#385338] bg-[#f7eee3] px-3 py-1 rounded-full border border-[#d8c2aa]">
                {activeProject.status}
              </span>
            </div>
          </div>

          <p className="text-xs text-stone-600 italic">
            "{activeProject.description || 'Sem sinopse definida.'}"
          </p>

          <div className="grid grid-cols-3 gap-3 bg-[#f7eee3]/70 p-3 rounded-2xl border border-[#d8c2aa] text-center text-xs">
            <div>
              <span className="block text-[10px] text-stone-500 font-medium">Total Capítulos</span>
              <span className="font-bold text-stone-800">{chaptersList.length}</span>
            </div>
            <div className="border-x border-[#d8c2aa]">
              <span className="block text-[10px] text-stone-500 font-medium">Total Palavras</span>
              <span className="font-bold text-stone-800">{totalWords.toLocaleString()}</span>
            </div>
            <div>
              <span className="block text-[10px] text-stone-500 font-medium">Progresso</span>
              <span className="font-bold text-[#385338]">{activeProject.progress}%</span>
            </div>
          </div>
        </div>

        {/* Lista de Capítulos */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
            <FileText size={20} className="text-[#385338]" /> Capítulos do Livro
          </h3>

          {chaptersList.length === 0 ? (
            <div className="text-center py-12 bg-[#f7eee3] rounded-3xl border-2 border-dashed border-[#d8c2aa] text-stone-500 space-y-2">
              <BookOpen size={36} className="mx-auto text-stone-400" />
              <p className="text-sm font-semibold">Nenhum capítulo escrito ainda.</p>
              <button
                onClick={handleOpenCreateChapter}
                className="text-xs text-[#385338] font-bold underline hover:text-[#2c422c]"
              >
                Escreva o primeiro capítulo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {chaptersList.map((chap) => (
                <div
                  key={chap.id}
                  className="bg-white border-2 border-[#d8c2aa] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow space-y-3"
                >
                  <div className="flex justify-between items-center border-b border-[#d8c2aa]/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 bg-[#385338] text-white rounded-lg flex items-center justify-center font-bold text-xs">
                        {chap.number}
                      </span>
                      <h4 className="font-bold text-stone-900 text-sm font-serif">{chap.title}</h4>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-semibold bg-[#f7eee3] px-2 py-0.5 rounded border border-[#d8c2aa] text-stone-700">
                        {chap.wordCount} palavras
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded text-amber-900 bg-amber-50 border border-amber-200">
                        {chap.status}
                      </span>
                      <button
                        onClick={() => handleOpenEditChapter(chap)}
                        className="p-1 text-stone-600 hover:text-stone-900 hover:bg-[#f7eee3] rounded-md transition-colors"
                        title="Editar Capítulo"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteChapter(chap.id)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                        title="Excluir Capítulo"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-3 italic font-serif leading-relaxed">
                    {chap.content || 'Capítulo sem texto preenchido.'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de Criar / Editar Capítulo */}
        {isChapterModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#f7eee3] border-2 border-[#d8c2aa] rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-[#d8c2aa] pb-3">
                <h3 className="font-bold font-serif text-lg text-stone-900">
                  {editingChapterId ? 'Editar Capítulo' : 'Novo Capítulo'}
                </h3>
                <button onClick={() => setIsChapterModalOpen(false)} className="text-stone-500 hover:text-stone-800">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveChapter} className="space-y-3 text-xs">
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-3">
                    <label className="block font-bold text-stone-700 mb-1">Nº Capítulo</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={chapterForm.number}
                      onChange={(e) => setChapterForm({ ...chapterForm, number: Number(e.target.value) })}
                      className="w-full p-2.5 bg-white border border-[#d8c2aa] rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#385338]"
                    />
                  </div>
                  <div className="col-span-6">
                    <label className="block font-bold text-stone-700 mb-1">Título do Capítulo</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: O Chamado das Árvores"
                      value={chapterForm.title}
                      onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                      className="w-full p-2.5 bg-white border border-[#d8c2aa] rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#385338]"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block font-bold text-stone-700 mb-1">Status</label>
                    <select
                      value={chapterForm.status}
                      onChange={(e) => setChapterForm({ ...chapterForm, status: e.target.value as Chapter['status'] })}
                      className="w-full p-2.5 bg-white border border-[#d8c2aa] rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#385338]"
                    >
                      <option value="Rascunho">Rascunho</option>
                      <option value="Em revisão">Em revisão</option>
                      <option value="Concluído">Concluído</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Texto do Capítulo</label>
                  <textarea
                    rows={12}
                    placeholder="Escreva a sua história aqui..."
                    value={chapterForm.content}
                    onChange={(e) => setChapterForm({ ...chapterForm, content: e.target.value })}
                    className="w-full p-3 bg-white border border-[#d8c2aa] rounded-xl text-stone-800 font-serif leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#385338]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#d8c2aa]">
                  <button
                    type="button"
                    onClick={() => setIsChapterModalOpen(false)}
                    className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#385338] hover:bg-[#2c422c] text-white rounded-xl font-bold flex items-center gap-1 shadow-sm"
                  >
                    <Save size={16} /> Salvar Capítulo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Criar / Editar Projeto */}
        {isProjectModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#f7eee3] border-2 border-[#d8c2aa] rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-[#d8c2aa] pb-3">
                <h3 className="font-bold font-serif text-lg text-stone-900">
                  {editingProjectId ? 'Editar Projeto' : 'Novo Projeto'}
                </h3>
                <button onClick={() => setIsProjectModalOpen(false)} className="text-stone-500 hover:text-stone-800">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveProject} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Título do Livro</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: O Guardião da Floresta"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#d8c2aa] rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#385338]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Género</label>
                    <input
                      type="text"
                      placeholder="Ex: Fantasia, Mistério..."
                      value={projectForm.genre}
                      onChange={(e) => setProjectForm({ ...projectForm, genre: e.target.value })}
                      className="w-full p-2.5 bg-white border border-[#d8c2aa] rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#385338]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Status</label>
                    <select
                      value={projectForm.status}
                      onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value as Project['status'] })}
                      className="w-full p-2.5 bg-white border border-[#d8c2aa] rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#385338]"
                    >
                      <option value="Em planeamento">Em planeamento</option>
                      <option value="Em progresso">Em progresso</option>
                      <option value="Concluído">Concluído</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Progresso Estimado (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={projectForm.progress}
                    onChange={(e) => setProjectForm({ ...projectForm, progress: Number(e.target.value) })}
                    className="w-full p-2.5 bg-white border border-[#d8c2aa] rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#385338]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Sinopse / Descrição</label>
                  <textarea
                    rows={3}
                    placeholder="Escreva uma breve sinopse do livro..."
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#d8c2aa] rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#385338]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#d8c2aa]">
                  <button
                    type="button"
                    onClick={() => setIsProjectModalOpen(false)}
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

  // VISTA PRINCIPAL (LISTA DE PROJETOS)
  return (
    <div className="space-y-6 font-sans">
      <div className="bg-[#f7eee3] p-5 rounded-2xl border-2 border-[#d8c2aa] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#ebd9c6] text-[#385338] rounded-xl border border-[#d8c2aa]">
            <BookOpen size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-stone-900">
              Projetos & Livros
            </h2>
            <p className="text-xs text-stone-600">
              Acompanhe o progresso de cada manuscrito, edite capítulos e partilhe a sua obra.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreateProject}
          className="bg-[#385338] hover:bg-[#2c422c] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
        >
          <Plus size={16} />
          <span>Novo Projeto</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => {
          const chaptersList = project.chapters || [];
          const totalWords = chaptersList.reduce((acc, c) => acc + c.wordCount, 0);

          return (
            <div
              key={project.id}
              className="bg-[#ffffff] border-2 border-[#d8c2aa] rounded-3xl p-6 shadow-lg space-y-5 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-5 right-5 flex items-center gap-2">
                <button
                  onClick={() => handleShareProject(project)}
                  title="Partilhar Projeto"
                  className="p-1.5 bg-[#f7eee3] hover:bg-[#ebd9c6] rounded-lg border border-[#d8c2aa] text-stone-700 transition-colors shadow-sm"
                >
                  <Share2 size={15} />
                </button>
                <button
                  onClick={() => handleOpenEditProject(project)}
                  title="Editar Projeto"
                  className="p-1.5 bg-[#f7eee3] hover:bg-[#ebd9c6] rounded-lg border border-[#d8c2aa] text-stone-700 transition-colors shadow-sm"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  title="Excluir Projeto"
                  className="p-1.5 bg-[#f7eee3] hover:bg-red-100 rounded-lg border border-[#d8c2aa] text-red-600 transition-colors shadow-sm"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="space-y-2 pr-28">
                <span className="inline-block px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-md text-[10px] font-bold uppercase tracking-wider">
                  {project.genre}
                </span>
                <h3 className="text-xl font-bold font-serif text-stone-900">
                  {project.title}
                </h3>
                <p className="text-xs text-stone-600 italic line-clamp-2">
                  "{project.description || 'Sem sinopse definida.'}"
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-[#f7eee3]/70 p-3 rounded-2xl border border-[#d8c2aa] text-center text-xs">
                <div>
                  <span className="block text-[10px] text-stone-500 font-medium">Capítulos</span>
                  <span className="font-bold text-stone-800">{chaptersList.length}</span>
                </div>
                <div className="border-x border-[#d8c2aa]">
                  <span className="block text-[10px] text-stone-500 font-medium">Palavras</span>
                  <span className="font-bold text-stone-800">{totalWords.toLocaleString()}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-stone-500 font-medium">Status</span>
                  <span className="font-bold text-[#385338]">{project.status}</span>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-stone-700">
                    <span>Progresso Geral</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden border border-[#d8c2aa]/40">
                    <div
                      className="h-full bg-[#385338] rounded-full transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => setActiveProject(project)}
                  className="w-full bg-[#f7eee3] hover:bg-[#ebd9c6] text-[#385338] border border-[#d8c2aa] py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <FileText size={15} />
                  <span>Ver / Gerir Capítulos ({chaptersList.length})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-16 bg-[#f7eee3] rounded-3xl border-2 border-dashed border-[#d8c2aa] text-stone-500 space-y-2">
          <BookOpen size={40} className="mx-auto text-stone-400" />
          <p className="text-sm font-semibold">Nenhum projeto registrado.</p>
          <p className="text-xs text-stone-400">Clique em "Novo Projeto" para começar a escrever a sua história.</p>
        </div>
      )}

      {isProjectModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#f7eee3] border-2 border-[#d8c2aa] rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#d8c2aa] pb-3">
              <h3 className="font-bold font-serif text-lg text-stone-900">
                {editingProjectId ? 'Editar Projeto' : 'Novo Projeto'}
              </h3>
              <button onClick={() => setIsProjectModalOpen(false)} className="text-stone-500 hover:text-stone-800">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Título do Livro</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: O Guardião da Floresta"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#d8c2aa] rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#385338]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Género</label>
                  <input
                    type="text"
                    placeholder="Ex: Fantasia, Mistério..."
                    value={projectForm.genre}
                    onChange={(e) => setProjectForm({ ...projectForm, genre: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#d8c2aa] rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#385338]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Status</label>
                  <select
                    value={projectForm.status}
                    onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value as Project['status'] })}
                    className="w-full p-2.5 bg-white border border-[#d8c2aa] rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#385338]"
                  >
                    <option value="Em planeamento">Em planeamento</option>
                    <option value="Em progresso">Em progresso</option>
                    <option value="Concluído">Concluído</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Progresso Estimado (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={projectForm.progress}
                  onChange={(e) => setProjectForm({ ...projectForm, progress: Number(e.target.value) })}
                  className="w-full p-2.5 bg-white border border-[#d8c2aa] rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#385338]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Sinopse / Descrição</label>
                <textarea
                  rows={3}
                  placeholder="Escreva uma breve sinopse do livro..."
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#d8c2aa] rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#385338]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#d8c2aa]">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
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