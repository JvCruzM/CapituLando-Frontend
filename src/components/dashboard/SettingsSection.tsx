'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, User, Moon, Sun, Bell, Database, Download, Upload, 
  Trash2, Save, Check, ShieldCheck, KeyRound, Monitor 
} from 'lucide-react';

export function SettingsSection() {
  // --- ESTADOS DA CONTA ---
  const [userName, setUserName] = useState(() => {
    if (typeof window === 'undefined') return 'Escritor(a)';
    try {
      const userRaw = sessionStorage.getItem('capitulando_user');
      const currentUserName = localStorage.getItem('capitulando_user_name') || '';
      if (userRaw) {
        const userObj = JSON.parse(userRaw);
        return userObj.name || userObj.username || currentUserName || 'Escritor(a)';
      }
      return currentUserName || 'Escritor(a)';
    } catch {
      return 'Escritor(a)';
    }
  });

  const [userEmail, setUserEmail] = useState(() => {
    if (typeof window === 'undefined') return 'autor@capitulando.com';
    try {
      const userRaw = sessionStorage.getItem('capitulando_user');
      if (userRaw) {
        const userObj = JSON.parse(userRaw);
        return userObj.email || 'autor@capitulando.com';
      }
      return 'autor@capitulando.com';
    } catch {
      return 'autor@capitulando.com';
    }
  });

  // --- PREFERÊNCIAS DE INTERFACE ---
  const [themeMode, setThemeMode] = useState<'system' | 'light' | 'dark'>('system');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');

  // --- NOTIFICAÇÕES & LEMBRETES ---
  const [dailyReminder, setDailyReminder] = useState(true);
  const [reminderTime, setReminderTime] = useState('20:00');
  const [goalAlerts, setGoalAlerts] = useState(true);

  // --- ESTADOS DE FEEDBACK ---
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // CARREGA OS DADOS INICIAIS DO UTILIZADOR E PREFERÊNCIAS
  useEffect(() => {
    if (typeof window !== 'undefined') {

      // Carrega preferências salvas
      const savedSettings = localStorage.getItem('capitulando_settings');
      if (savedSettings) {
        try {
          const config = JSON.parse(savedSettings);
          setThemeMode(config.themeMode || 'system');
          setFontSize(config.fontSize || 'md');
          setDailyReminder(config.dailyReminder ?? true);
          setReminderTime(config.reminderTime || '20:00');
          setGoalAlerts(config.goalAlerts ?? true);
        } catch (e) {
          console.warn('Erro ao carregar configurações salvas', e);
        }
      }
    }
  }, []);

  // SALVAR CONFIGURAÇÕES
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      const config = {
        themeMode,
        fontSize,
        dailyReminder,
        reminderTime,
        goalAlerts,
      };

      localStorage.setItem('capitulando_settings', JSON.stringify(config));
      localStorage.setItem('capitulando_user_name', userName);

      // Atualiza também o objeto da sessão se existir
      const userRaw = sessionStorage.getItem('capitulando_user');
      if (userRaw) {
        try {
          const userObj = JSON.parse(userRaw);
          userObj.name = userName;
          userObj.email = userEmail;
          sessionStorage.setItem('capitulando_user', JSON.stringify(userObj));
        } catch (e) {}
      }
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // EXPORTAR BACKUP DOS DADOS
  const handleExportData = () => {
    if (typeof window === 'undefined') return;

    const dataBackup = {
      projects: JSON.parse(localStorage.getItem('capitulando_projects') || '[]'),
      concepts: JSON.parse(localStorage.getItem('capitulando_universe_concepts') || '[]'),
      events: JSON.parse(localStorage.getItem('capitulando_timeline_events') || '[]'),
      profile: JSON.parse(localStorage.getItem('capitulando_author_profile') || '{}'),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(dataBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_capitulando_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // IMPORTAR BACKUP DE FICHEIRO JSON
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);

        if (json.projects) localStorage.setItem('capitulando_projects', JSON.stringify(json.projects));
        if (json.concepts) localStorage.setItem('capitulando_universe_concepts', JSON.stringify(json.concepts));
        if (json.events) localStorage.setItem('capitulando_timeline_events', JSON.stringify(json.events));
        if (json.profile) localStorage.setItem('capitulando_author_profile', JSON.stringify(json.profile));

        setImportStatus('Backup restaurado com sucesso! Recarregue a página para ver as alterações.');
        setTimeout(() => setImportStatus(null), 4000);
      } catch (err) {
        setImportStatus('Erro ao ler o ficheiro de backup. Certifique-se de usar um ficheiro .json válido.');
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  // LIMPAR DADOS DA APLICAÇÃO
  const handleClearData = () => {
    if (confirm('Tem a certeza de que deseja apagar todos os dados guardados localmente? Esta ação não pode ser desfeita.')) {
      localStorage.removeItem('capitulando_projects');
      localStorage.removeItem('capitulando_universe_concepts');
      localStorage.removeItem('capitulando_timeline_events');
      localStorage.removeItem('capitulando_author_profile');
      localStorage.removeItem('capitulando_writing_space');
      alert('Dados limpos com sucesso!');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* CABEÇALHO */}
      <div className="bg-[#f3ccde]/60 dark:bg-[#221a2b] p-5 rounded-2xl border-2 border-[#4b1d3f]/20 dark:border-[#382b47] flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#f3ccde] dark:bg-[#2a2035] text-[#4b1d3f] dark:text-pink-300 rounded-xl border border-[#4b1d3f]/30">
            <Settings size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100">Configurações da Conta & Sistema</h2>
            <p className="text-xs text-stone-600 dark:text-stone-400">Personalize a sua experiência, lembretes e gerencie os seus dados locais.</p>
          </div>
        </div>
      </div>

      {/* ALERTA DE SUCESSO */}
      {savedSuccess && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
          <Check size={18} /> <span>Configurações atualizadas com sucesso!</span>
        </div>
      )}

      {importStatus && (
        <div className="bg-amber-100 border border-amber-300 text-amber-900 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
          <Database size={18} /> <span>{importStatus}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* 1. DADOS DA CONTA */}
        <div className="bg-white dark:bg-[#1a1321] border-2 border-[#4b1d3f]/20 dark:border-[#382b47] rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 border-b border-[#4b1d3f]/15 dark:border-[#382b47] pb-3 flex items-center gap-2">
            <User size={18} className="text-[#4b1d3f] dark:text-pink-400" />
            <span>Dados da Conta (Integração Login)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Nome de Exibição</label>
              <input 
                type="text" 
                value={userName} 
                onChange={(e) => setUserName(e.target.value)} 
                className="w-full p-2.5 bg-stone-50 dark:bg-[#221a2b] border border-stone-200 dark:border-[#382b47] rounded-xl text-stone-800 dark:text-stone-100 focus:outline-none" 
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">E-mail Registo</label>
              <input 
                type="email" 
                value={userEmail} 
                onChange={(e) => setUserEmail(e.target.value)} 
                className="w-full p-2.5 bg-stone-50 dark:bg-[#221a2b] border border-stone-200 dark:border-[#382b47] rounded-xl text-stone-800 dark:text-stone-100 focus:outline-none" 
              />
            </div>
          </div>
        </div>

        {/* 2. PREFERÊNCIAS DE INTERFACE & TEMA */}
        <div className="bg-white dark:bg-[#1a1321] border-2 border-[#4b1d3f]/20 dark:border-[#382b47] rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 border-b border-[#4b1d3f]/15 dark:border-[#382b47] pb-3 flex items-center gap-2">
            <Monitor size={18} className="text-[#4b1d3f] dark:text-pink-400" />
            <span>Aparência & Apresentação</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* TEMA */}
            <div className="space-y-2">
              <label className="block font-bold text-stone-700 dark:text-stone-300">Modo de Aparição</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setThemeMode('light')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1 font-bold ${themeMode === 'light' ? 'bg-[#4b1d3f] text-white border-[#4b1d3f]' : 'bg-stone-50 dark:bg-[#221a2b] text-stone-700 dark:text-stone-300 border-stone-200 dark:border-[#382b47]'}`}
                >
                  <Sun size={18} /> Claro
                </button>
                <button
                  type="button"
                  onClick={() => setThemeMode('dark')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1 font-bold ${themeMode === 'dark' ? 'bg-[#4b1d3f] text-white border-[#4b1d3f]' : 'bg-stone-50 dark:bg-[#221a2b] text-stone-700 dark:text-stone-300 border-stone-200 dark:border-[#382b47]'}`}
                >
                  <Moon size={18} /> Escuro
                </button>
                <button
                  type="button"
                  onClick={() => setThemeMode('system')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1 font-bold ${themeMode === 'system' ? 'bg-[#4b1d3f] text-white border-[#4b1d3f]' : 'bg-stone-50 dark:bg-[#221a2b] text-stone-700 dark:text-stone-300 border-stone-200 dark:border-[#382b47]'}`}
                >
                  <Monitor size={18} /> Sistema
                </button>
              </div>
            </div>

            {/* TAMANHO DE FONTE DA APLICAÇÃO */}
            <div className="space-y-2">
              <label className="block font-bold text-stone-700 dark:text-stone-300">Tamanho Padrão da Fonte</label>
              <div className="grid grid-cols-3 gap-2">
                {(['sm', 'md', 'lg'] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setFontSize(size)}
                    className={`p-3 rounded-2xl border font-bold capitalize ${fontSize === size ? 'bg-[#4b1d3f] text-white border-[#4b1d3f]' : 'bg-stone-50 dark:bg-[#221a2b] text-stone-700 dark:text-stone-300 border-stone-200 dark:border-[#382b47]'}`}
                  >
                    {size === 'sm' ? 'Pequeno' : size === 'md' ? 'Médio' : 'Grande'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. LEMBRETES & NOTIFICAÇÕES */}
        <div className="bg-white dark:bg-[#1a1321] border-2 border-[#4b1d3f]/20 dark:border-[#382b47] rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 border-b border-[#4b1d3f]/15 dark:border-[#382b47] pb-3 flex items-center gap-2">
            <Bell size={18} className="text-[#4b1d3f] dark:text-pink-400" />
            <span>Hábitos & Notificações de Escrita</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-stone-50 dark:bg-[#221a2b] border border-stone-200 dark:border-[#382b47] rounded-2xl">
              <div>
                <p className="font-bold text-stone-800 dark:text-stone-200">Lembrete Diário de Escrita</p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">Receba um alerta suave para manter o seu hábito diário ativo.</p>
              </div>
              <input 
                type="checkbox" 
                checked={dailyReminder} 
                onChange={(e) => setDailyReminder(e.target.checked)} 
                className="w-4 h-4 accent-[#4b1d3f] cursor-pointer" 
              />
            </div>

            {dailyReminder && (
              <div className="flex items-center justify-between p-3 bg-stone-50 dark:bg-[#221a2b] border border-stone-200 dark:border-[#382b47] rounded-2xl">
                <span className="font-bold text-stone-800 dark:text-stone-200">Horário do Lembrete</span>
                <input 
                  type="time" 
                  value={reminderTime} 
                  onChange={(e) => setReminderTime(e.target.value)} 
                  className="p-1.5 bg-white dark:bg-[#1a1321] border border-stone-300 dark:border-[#382b47] rounded-xl text-stone-800 dark:text-stone-200 font-bold"
                />
              </div>
            )}
          </div>
        </div>

        {/* 4. GESTÃO DE DADOS LOCAL & BACKUP */}
        <div className="bg-white dark:bg-[#1a1321] border-2 border-[#4b1d3f]/20 dark:border-[#382b47] rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 border-b border-[#4b1d3f]/15 dark:border-[#382b47] pb-3 flex items-center gap-2">
            <Database size={18} className="text-[#4b1d3f] dark:text-pink-400" />
            <span>Gerenciamento de Dados & Cópias de Segurança</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <button
              type="button"
              onClick={handleExportData}
              className="p-3 bg-stone-50 dark:bg-[#221a2b] hover:bg-[#f3ccde]/40 border border-stone-200 dark:border-[#382b47] rounded-2xl flex items-center justify-center gap-2 font-bold text-stone-800 dark:text-stone-200 transition-colors"
            >
              <Download size={16} className="text-[#4b1d3f] dark:text-pink-400" />
              <span>Exportar Backup (.JSON)</span>
            </button>

            <label className="p-3 bg-stone-50 dark:bg-[#221a2b] hover:bg-[#f3ccde]/40 border border-stone-200 dark:border-[#382b47] rounded-2xl flex items-center justify-center gap-2 font-bold text-stone-800 dark:text-stone-200 cursor-pointer transition-colors">
              <Upload size={16} className="text-[#4b1d3f] dark:text-pink-400" />
              <span>Importar Backup</span>
              <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
            </label>

            <button
              type="button"
              onClick={handleClearData}
              className="p-3 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 border border-red-200 dark:border-red-900/40 rounded-2xl flex items-center justify-center gap-2 font-bold text-red-600 dark:text-red-300 transition-colors"
            >
              <Trash2 size={16} />
              <span>Resetar Dados Locais</span>
            </button>
          </div>
        </div>

        {/* BOTAO SALVAR */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-3 bg-[#4b1d3f] hover:bg-[#38142f] dark:bg-pink-800 dark:hover:bg-pink-900 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            <Save size={16} />
            <span>Salvar Todas as Configurações</span>
          </button>
        </div>
      </form>
    </div>
  );
}