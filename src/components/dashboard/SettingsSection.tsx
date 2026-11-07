"use client";
import { useState, type FormEvent, type ChangeEvent } from "react";
import {
  Settings as SettingsIcon,
  UserRound,
  Palette,
  Bell,
  Database,
  Download,
  Upload,
  Trash2,
  Save,
} from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { LegacyRecovery } from "./LegacyRecovery";
import { apiRequest } from "@/lib/api";
import { useAuthenticatedUser } from "@/components/auth/AuthGuard";
import { useWorkspaceSection, useWorkspaceSync } from "./WorkspaceProvider";
interface Settings {
  themeMode: string;
  fontSize: string;
  dailyReminder: boolean;
  reminderTime: string;
  goalAlerts: boolean;
}
export function SettingsSection() {
  const user = useAuthenticatedUser()!;
  const { theme } = useTheme();
  const [saved, setSettings] = useWorkspaceSection<Partial<Settings>>(
    "settings",
    {},
  );
  const [profile, setProfile] = useWorkspaceSection<{
    name?: string;
    [key: string]: unknown;
  }>("profile", {});
  const flush = useWorkspaceSync();
  const [form, setForm] = useState<Settings>({
    themeMode: theme,
    fontSize: "md",
    dailyReminder: false,
    reminderTime: "20:00",
    goalAlerts: true,
    ...saved,
  });
  const [name, setName] = useState(profile.name || user.displayName);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [emailChanged, setEmailChanged] = useState(false);
  const run = async (action: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      await action();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Não foi possível concluir.",
      );
    } finally {
      setBusy(false);
    }
  };
  const save = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => {
      setSettings(form);
      setProfile({ ...profile, name: name.trim() });
      if (!(await flush()))
        throw new Error(
          "Existem alterações pendentes. Tente sincronizar antes de continuar.",
        );
      if (email.trim().toLowerCase() !== user.email) {
        await apiRequest("/auth/change-email", {
          method: "POST",
          body: JSON.stringify({
            email: email.trim(),
            currentPassword: password,
          }),
        });
        sessionStorage.removeItem("capitulando_access_token");
        sessionStorage.removeItem("capitulando_user");
        setEmailChanged(true);
        setMessage(
          "Confirme o novo e-mail e entre novamente. Seus dados foram preservados.",
        );
      } else setMessage("Configurações salvas e sincronizadas.");
      setPassword("");
    });
  };
  const exportData = () =>
    void run(async () => {
      if (!(await flush()))
        throw new Error(
          "Sincronize as alterações pendentes antes de exportar.",
        );
      const backup = await apiRequest<{
        records: Record<string, { id: string }[]>;
        workspace: Record<string, { revision: number; value: unknown }>;
      }>("/backup");
      const localDraft = localStorage.getItem(`capitulando:${user.id}:writing`);
      if (localDraft) {
        const recovery = JSON.parse(localDraft);
        if (
          recovery.projectId &&
          !backup.records.Story.some((story) => story.id === recovery.projectId)
        ) {
          delete recovery.projectId;
          delete recovery.chapterId;
        }
        backup.workspace.writing = { revision: 0, value: recovery };
      }
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `capitulando-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage("Backup completo exportado.");
    });
  const clearRecovery = () => {
    const prefix = `capitulando:${user.id}:`;
    Object.keys(localStorage)
      .filter((key) => key.startsWith(prefix))
      .forEach((key) => localStorage.removeItem(key));
  };
  const importData = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    void run(async () => {
      if (file.size > 25_000_000)
        throw new Error("O backup deve ter no máximo 25 MB.");
      const backup = JSON.parse(await file.text());
      if (backup.schemaVersion !== 1 || !backup.records || !backup.workspace)
        throw new Error("Formato de backup incompatível.");
      if (
        !confirm(
          "Restaurar este backup substituindo o conteúdo desta conta? Exporte o conteúdo atual antes de continuar.",
        )
      )
        return;
      if (!(await flush()))
        throw new Error("Sincronize as alterações antes de restaurar.");
      await apiRequest("/backup", {
        method: "POST",
        body: JSON.stringify(backup),
      });
      clearRecovery();
      window.location.reload();
    });
  };
  const clearData = () =>
    void run(async () => {
      if (
        !confirm(
          "Apagar livros, capítulos, personagens, metas, ideias, universo e timeline desta conta? Esta ação não pode ser desfeita. Exporte um backup primeiro.",
        )
      )
        return;
      if (!(await flush()))
        throw new Error("Sincronize as alterações antes de apagar.");
      await apiRequest("/backup", { method: "DELETE" });
      clearRecovery();
      window.location.reload();
    });
  const box =
    "rounded-3xl border-2 border-[#4b1d3f]/20 dark:border-[#382b47] p-5 sm:p-6 bg-[#fcf8f2] dark:bg-[#1a1321] shadow-sm space-y-5 min-w-0";
  const field =
    "mt-2 block w-full rounded-xl border border-[#4b1d3f]/20 dark:border-[#382b47] bg-white dark:bg-[#221a2b] px-4 py-3 text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-[#b88ba8] disabled:opacity-60";
  const heading =
    "flex items-center gap-2 font-serif text-lg font-bold text-[#4b1d3f] dark:text-pink-200";
  const button =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b88ba8]";
  return (
    <div className="space-y-6 text-stone-800 dark:text-stone-200">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-[#f3ccde]/60 dark:bg-[#382b47] p-3 text-[#4b1d3f] dark:text-pink-200">
          <SettingsIcon size={24} />
        </div>
        <div>
          <h2 className="font-serif text-2xl font-bold">Configurações</h2>
          <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">
            Deixe seu espaço de escrita com a sua cara.
          </p>
        </div>
      </div>
      {message && (
        <p
          role="status"
          className="rounded-2xl border border-[#4b1d3f]/20 dark:border-[#382b47] bg-[#f3ccde]/40 dark:bg-[#221a2b] p-4 text-sm"
        >
          {message}{" "}
          {emailChanged && (
            <a href="/login" className="font-bold underline">
              Entrar
            </a>
          )}
        </p>
      )}
      <form onSubmit={save} className="space-y-6">
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <fieldset
            disabled={busy || emailChanged}
            className={box}
            aria-labelledby="settings-account"
          >
            <h3 id="settings-account" className={heading}>
              <UserRound size={20} /> Sua conta
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Atualize como você aparece e o endereço usado para entrar.
            </p>
            <label className="block text-xs font-bold">
              Nome de exibição
              <input
                className={field}
                required
                maxLength={100}
                autoComplete="nickname"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="block text-xs font-bold">
              E-mail
              <input
                className={field}
                required
                type="email"
                autoComplete="email"
                maxLength={320}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            {email.trim().toLowerCase() !== user.email && (
              <label className="block text-xs font-bold">
                Senha atual para alterar o e-mail
                <input
                  className={field}
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span className="mt-2 block font-normal text-stone-600 dark:text-stone-400">
                  O novo endereço precisará ser confirmado.
                </span>
              </label>
            )}
          </fieldset>
          <fieldset
            disabled={busy || emailChanged}
            className={box}
            aria-labelledby="settings-appearance"
          >
            <h3 id="settings-appearance" className={heading}>
              <Palette size={20} /> Aparência
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Escolha a combinação mais confortável para escrever.
            </p>
            <label className="block text-xs font-bold">
              Tema
              <select
                className={field}
                value={form.themeMode}
                onChange={(e) =>
                  setForm({ ...form, themeMode: e.target.value })
                }
              >
                <option value="system">Sistema</option>
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
              </select>
            </label>
            <label className="block text-xs font-bold">
              Tamanho da fonte
              <select
                className={field}
                value={form.fontSize}
                onChange={(e) => setForm({ ...form, fontSize: e.target.value })}
              >
                <option value="sm">Pequeno</option>
                <option value="md">Médio</option>
                <option value="lg">Grande</option>
              </select>
            </label>
          </fieldset>
        </div>
        <fieldset
          disabled={busy || emailChanged}
          className={box}
          aria-labelledby="settings-reminders"
        >
          <h3 id="settings-reminders" className={heading}>
            <Bell size={20} /> Lembretes e metas
          </h3>
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-white dark:bg-[#221a2b] p-4 text-xs">
            <span>
              <span className="block font-bold">
                Lembrete diário enquanto o aplicativo estiver aberto
              </span>
              <span className="mt-1 block text-stone-600 dark:text-stone-400">
                Reserve um momento para continuar sua história.
              </span>
            </span>
            <input
              className="h-5 w-5 shrink-0 accent-[#4b1d3f] dark:accent-pink-400"
              type="checkbox"
              checked={form.dailyReminder}
              onChange={(e) =>
                setForm({ ...form, dailyReminder: e.target.checked })
              }
            />
          </label>
          {form.dailyReminder && (
            <label className="block max-w-xs text-xs font-bold">
              Horário
              <input
                className={field}
                type="time"
                required
                value={form.reminderTime}
                onChange={(e) =>
                  setForm({ ...form, reminderTime: e.target.value })
                }
              />
            </label>
          )}
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-white dark:bg-[#221a2b] p-4 text-xs">
            <span className="font-bold">
              Mostrar aviso ao concluir uma meta
            </span>
            <input
              className="h-5 w-5 shrink-0 accent-[#4b1d3f] dark:accent-pink-400"
              type="checkbox"
              checked={form.goalAlerts}
              onChange={(e) =>
                setForm({ ...form, goalAlerts: e.target.checked })
              }
            />
          </label>
        </fieldset>
        <div className="flex justify-end">
          <button
            className={`${button} bg-[#4b1d3f] hover:bg-[#38142f] dark:bg-pink-800 dark:hover:bg-pink-900 text-white shadow-sm`}
            disabled={busy || emailChanged}
          >
            <Save size={16} />
            {busy ? "Salvando…" : "Salvar configurações"}
          </button>
        </div>
      </form>
      <LegacyRecovery />
      <fieldset
        disabled={busy || emailChanged}
        className={box}
        aria-labelledby="settings-backup"
      >
        <h3 id="settings-backup" className={heading}>
          <Database size={20} /> Backup e dados da conta
        </h3>
        <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-400">
          Guarde uma cópia dos seus livros, capítulos, personagens,
          relacionamentos, metas, ideias, universo, timeline, perfil e
          preferências. Senhas e sessões não são exportadas.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#4b1d3f]/10 dark:border-[#382b47] bg-white dark:bg-[#221a2b] p-4 space-y-3">
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Baixe seus dados para guardar uma cópia de segurança.
            </p>
            <button
              onClick={exportData}
              className={`${button} bg-[#f3ccde]/60 dark:bg-[#382b47] text-[#4b1d3f] dark:text-pink-200 hover:bg-[#f3ccde]`}
            >
              <Download size={16} />
              Exportar backup completo
            </button>
          </div>
          <div className="rounded-2xl border border-[#4b1d3f]/10 dark:border-[#382b47] bg-white dark:bg-[#221a2b] p-4 space-y-3">
            <label className="block text-xs font-bold">
              <span className="flex items-center gap-2">
                <Upload size={16} />
                Restaurar backup
              </span>
              <input
                className="mt-3 block w-full min-w-0 text-xs file:mr-3 file:rounded-xl file:border-0 file:bg-[#f3ccde]/60 file:px-3 file:py-2 file:text-xs file:font-bold file:text-[#4b1d3f] disabled:opacity-50"
                type="file"
                accept=".json,application/json"
                onChange={importData}
              />
            </label>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              A restauração substitui o conteúdo atual desta conta.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-[#4b1d3f]/10 dark:border-[#382b47] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-stone-600 dark:text-stone-400">
            Para recomeçar, exporte seu backup antes de apagar os dados.
          </p>
          <button
            onClick={clearData}
            className={`${button} shrink-0 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40`}
          >
            <Trash2 size={16} />
            Apagar conteúdo desta conta
          </button>
        </div>
      </fieldset>
    </div>
  );
}
