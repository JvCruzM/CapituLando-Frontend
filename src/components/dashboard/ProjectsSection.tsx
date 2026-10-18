'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, FileCode, Trash2, Eye, X, Edit3, BookOpenCheck, Save } from 'lucide-react';

interface ContentItem { id: string; title: string; content: string; wordCount: number; updatedAt: string; }
interface Project { id: string; title: string; genre: string; description: string; progress: number; chapters: ContentItem[]; drafts: ContentItem[]; }

const DEFAULT_PROJECTS: Project[] = [
  { id: '1', title: 'O Guardião da Floresta', genre: 'Fantasia', description: 'Uma jornada mágica sobre segredos antigos.', progress: 60, chapters: [], drafts: [] },
  { id: '2', title: 'Segredos de Algures', genre: 'Mistério', description: 'Investigação em uma cidade isolada.', progress: 25, chapters: [], drafts: [] },
];

export function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_PROJECTS;
    const saved = localStorage.getItem('capitulando_projects');
    return saved ? JSON.parse(saved) : DEFAULT_PROJECTS;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('capitulando_projects', JSON.stringify(projects));
    }
  }, [projects]);

  const [activeTabMap, setActiveTabMap] = useState<Record<string, 'chapters' | 'drafts'>>({});
  const [readingItem, setReadingItem] = useState<{ projectId: string; type: 'chapters' | 'drafts'; item: ContentItem } | null>(null);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projTitle, setProjTitle] = useState('');
  const [projGenre, setProjGenre] = useState('');
  const [projDesc, setProjDesc] = useState('');

  const handleDeleteItem = (projId: string, itemId: string, type: 'chapters' | 'drafts', e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Eliminar este item?')) setProjects(prev => prev.map(p => p.id === projId ? { ...p, [type]: p[type].filter(i => i.id !== itemId) } : p));
  };

  const handleDeleteProject = (projId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Eliminar este livro inteiro?')) setProjects(prev => prev.filter(p => p.id !== projId));
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-[#fcf8f2] dark:bg-[#1a1120] p-5 rounded-3xl border border-[#4b1d3f]/20 dark:border-[#2e1d3a] flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#f3ccde]/40 dark:bg-[#281832] text-[#4b1d3f] dark:text-pink-300 rounded-2xl border border-[#4b1d3f]/20 dark:border-[#3d224d]"><BookOpen size={24} /></div>
          <div><h2 className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100">Projetos & Livros</h2><p className="text-xs text-stone-600 dark:text-stone-400">Gerencie capítulos e rascunhos.</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => {
          const subTab = activeTabMap[project.id] || 'chapters';
          const items = subTab === 'chapters' ? project.chapters || [] : project.drafts || [];

          return (
            <div key={project.id} className="bg-[#fcf8f2] dark:bg-[#1a1120] border border-[#4b1d3f]/20 dark:border-[#2e1d3a] rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#4b1d3f] dark:bg-[#831843] text-white px-2.5 py-1 rounded-md">{project.genre}</span>
                  <div className="flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setEditingProject(project); setProjTitle(project.title); setProjGenre(project.genre); setProjDesc(project.description || ''); }} className="p-1.5 text-stone-400 hover:text-[#4b1d3f] dark:hover:text-pink-300 rounded-lg"><Edit3 size={15} /></button>
                    <button onClick={(e) => handleDeleteProject(project.id, e)} className="p-1.5 text-red-400 hover:text-red-500 rounded-lg"><Trash2 size={15} /></button>
                  </div>
                </div>
                <h3 className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100">{project.title}</h3>
                {project.description && <p className="text-xs text-stone-600 dark:text-stone-400 italic font-serif">"{project.description}"</p>}
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex border-b border-stone-200 dark:border-[#2e1d3a] text-xs font-bold">
                  {(['chapters', 'drafts'] as const).map((tab) => (
                    <button key={tab} onClick={() => setActiveTabMap({ ...activeTabMap, [project.id]: tab })} className={`pb-2 px-3 border-b-2 flex items-center gap-1.5 ${subTab === tab ? 'border-[#4b1d3f] dark:border-pink-400 text-[#4b1d3f] dark:text-pink-300' : 'border-transparent text-stone-500 dark:text-stone-400'}`}>
                      {tab === 'chapters' ? <FileText size={14} /> : <FileCode size={14} />} {tab === 'chapters' ? 'Capítulos' : 'Rascunhos'} ({project[tab]?.length || 0})
                    </button>
                  ))}
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} onClick={() => { setReadingItem({ projectId: project.id, type: subTab, item }); setEditTitle(item.title); setEditContent(item.content); setIsEditingMode(false); }} className="p-3 bg-white dark:bg-[#24172d] hover:bg-[#f3ccde]/30 dark:hover:bg-[#2d1c38] border border-stone-200 dark:border-[#382245] rounded-2xl flex justify-between items-center text-xs cursor-pointer group transition-colors">
                      <div><h4 className="font-bold text-stone-800 dark:text-stone-200 group-hover:text-[#4b1d3f] dark:group-hover:text-pink-300">{item.title}</h4><p className="text-[10px] text-stone-500 dark:text-stone-400">{item.wordCount} palavras • {item.updatedAt}</p></div>
                      <div className="flex gap-1">
                        <button onClick={(e) => { e.stopPropagation(); setReadingItem({ projectId: project.id, type: subTab, item }); setEditTitle(item.title); setEditContent(item.content); setIsEditingMode(false); }} className="p-1.5 text-stone-400 hover:text-[#4b1d3f]"><Eye size={15} /></button>
                        <button onClick={(e) => handleDeleteItem(project.id, item.id, subTab, e)} className="p-1.5 text-red-400 hover:text-red-500"><Trash2 size={15} /></button>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && <p className="text-center text-xs text-stone-400 py-4 italic font-serif">Nenhum item guardado.</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editingProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#fcf8f2] dark:bg-[#18121e] border border-[#4b1d3f]/30 dark:border-[#2e1d3a] rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 text-stone-900 dark:text-stone-100">
            <div className="flex justify-between items-center border-b border-[#4b1d3f]/20 dark:border-[#2e1d3a] pb-3"><h3 className="font-bold font-serif text-lg">Editar Livro</h3><button onClick={() => setEditingProject(null)}><X size={18} /></button></div>
            <form onSubmit={(e) => { e.preventDefault(); setProjects(prev => prev.map(p => p.id === editingProject.id ? { ...p, title: projTitle, genre: projGenre, description: projDesc } : p)); setEditingProject(null); }} className="space-y-3 text-xs">
              <div><label className="block font-bold mb-1">Título</label><input type="text" required value={projTitle} onChange={e => setProjTitle(e.target.value)} className="w-full p-2.5 bg-white dark:bg-[#221a2b] border rounded-xl" /></div>
              <div><label className="block font-bold mb-1">Género</label><input type="text" required value={projGenre} onChange={e => setProjGenre(e.target.value)} className="w-full p-2.5 bg-white dark:bg-[#221a2b] border rounded-xl" /></div>
              <div><label className="block font-bold mb-1">Descrição</label><textarea rows={3} value={projDesc} onChange={e => setProjDesc(e.target.value)} className="w-full p-2.5 bg-white dark:bg-[#221a2b] border rounded-xl" /></div>
              <div className="flex justify-end gap-2 pt-3 border-t"><button type="button" onClick={() => setEditingProject(null)} className="px-4 py-2 bg-stone-200 dark:bg-stone-800 rounded-xl font-semibold">Cancelar</button><button type="submit" className="px-4 py-2 bg-[#4b1d3f] text-white rounded-xl font-bold flex items-center gap-1"><Save size={16} /> Guardar</button></div>
            </form>
          </div>
        </div>
      )}

      {readingItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 md:p-8">
          <div className="bg-[#fcf8f2] dark:bg-[#1a1120] border border-[#4b1d3f]/30 dark:border-[#2e1d3a] rounded-3xl p-6 md:p-10 w-full max-w-3xl shadow-2xl space-y-6 max-h-[92vh] flex flex-col text-stone-900 dark:text-stone-100">
            <div className="flex justify-between items-center border-b pb-4">
              <div className="flex items-center gap-2.5"><BookOpenCheck size={22} className="text-[#4b1d3f] dark:text-pink-300" /><span className="text-xs uppercase tracking-wider font-bold">Modo Leitura</span></div>
              <div className="flex gap-2">
                <button onClick={() => setIsEditingMode(!isEditingMode)} className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${isEditingMode ? 'bg-amber-100 dark:bg-amber-950 text-amber-900' : 'bg-stone-100 dark:bg-[#281832]'}`}><Edit3 size={14} /> {isEditingMode ? 'Leitor' : 'Editar'}</button>
                <button onClick={() => setReadingItem(null)}><X size={20} /></button>
              </div>
            </div>

            {!isEditingMode ? (
              <div className="flex-grow overflow-y-auto space-y-4 pr-2 pl-1 py-2">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-center pb-2 border-b">{readingItem.item.title}</h2>
                <div className="font-serif text-base md:text-lg leading-relaxed whitespace-pre-wrap pt-2">{readingItem.item.content}</div>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); const wc = editContent.trim().split(/\s+/).length; const ua = new Date().toLocaleDateString('pt-PT'); setProjects(prev => prev.map(p => p.id === readingItem.projectId ? { ...p, [readingItem.type]: p[readingItem.type].map(i => i.id === readingItem.item.id ? { ...i, title: editTitle, content: editContent, wordCount: wc, updatedAt: ua } : i) } : p)); setReadingItem({ ...readingItem, item: { ...readingItem.item, title: editTitle, content: editContent, wordCount: wc, updatedAt: ua } }); setIsEditingMode(false); }} className="flex-grow flex flex-col space-y-4 overflow-y-auto">
                <div><label className="block font-bold text-xs mb-1">Título</label><input type="text" required value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full p-2.5 bg-white dark:bg-[#24172d] border rounded-xl font-bold text-sm" /></div>
                <div className="flex-grow flex flex-col"><label className="block font-bold text-xs mb-1">Conteúdo</label><textarea rows={10} required value={editContent} onChange={e => setEditContent(e.target.value)} className="w-full p-3 bg-white dark:bg-[#24172d] border rounded-xl font-serif text-sm leading-relaxed" /></div>
                <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setIsEditingMode(false)} className="px-4 py-2 bg-stone-200 dark:bg-[#281832] rounded-xl text-xs font-semibold">Cancelar</button><button type="submit" className="px-4 py-2 bg-[#4b1d3f] dark:bg-pink-800 text-white rounded-xl text-xs font-bold">Guardar</button></div>
              </form>
            )}

            <div className="pt-3 border-t flex justify-between items-center text-xs text-stone-500"><span>{readingItem.item.wordCount} palavras</span><span>Guardado a {readingItem.item.updatedAt}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}