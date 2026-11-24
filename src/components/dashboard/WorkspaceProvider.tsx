"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from "react";
import { ApiError, apiRequest } from "@/lib/api";
import { useAuthenticatedUser } from "@/components/auth/AuthGuard";

export type Section =
  | "goals"
  | "ideas"
  | "concepts"
  | "events"
  | "profile"
  | "settings"
  | "writing";
interface Document {
  revision: number;
  value: unknown;
}
type Documents = Record<Section, Document>;
interface Store {
  flush: () => Promise<boolean>;
  conflict: Section | null;
  setWritingVisible: (visible: boolean) => void;
  markConflict: (section: Section) => void;
  readSection: (section: Section) => Promise<unknown>;
  resolveSection: (
    section: Section,
    mode: "local" | "remote",
    value?: unknown,
  ) => Promise<unknown>;
  documents: Documents;
  change: (section: Section, update: SetStateAction<unknown>) => void;
}
const Context = createContext<Store | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const user = useAuthenticatedUser()!;
  const [documents, setDocuments] = useState<Documents | null>(null);
  const current = useRef<Documents | null>(null);
  const pending = useRef(new Set<Section>());
  const draining = useRef(false);
  const generation = useRef(0);
  const refreshSequence = useRef(0);
  const conflictRef = useRef<Section | null>(null);
  const [writingVisible, setWritingVisible] = useState(false);
  const [conflict, setConflict] = useState<Section | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const outboxKey = `capitulando:${user.id}:outbox`;
  const persist = useCallback(() => {
    const outbox: Partial<Documents> = {};
    pending.current.forEach((key) => {
      if (current.current) outbox[key] = current.current[key];
    });
    try {
      localStorage.setItem(outboxKey, JSON.stringify(outbox));
    } catch {
      setError(
        "O navegador não conseguiu preservar a cópia de recuperação. Exporte um backup antes de sair.",
      );
    }
  }, [outboxKey]);
  const drain = useCallback(async () => {
    if (draining.current || !current.current || conflictRef.current) return;
    draining.current = true;
    setError("");
    setStatus("Salvando…");
    let savingSection: Section | null = null;
    let retriedClearedWriting = false;
    try {
      for (const section of pending.current) {
        while (pending.current.has(section)) {
          savingSection = section;
          const sent: Document = current.current[section];
          let saved: Document;
          try {
            saved = await apiRequest<Document>(`/workspace/${section}`, {
              method: "PUT",
              body: JSON.stringify(sent),
            });
          } catch (reason) {
            if (
              section === "writing" &&
              !retriedClearedWriting &&
              reason instanceof ApiError &&
              reason.status === 409
            ) {
              const remote = await apiRequest<Documents>("/workspace");
              const recovery = remote.writing.value as {
                content?: string;
                title?: string;
              } | null;
              if (!recovery?.content?.trim() && !recovery?.title?.trim()) {
                retriedClearedWriting = true;
                current.current = {
                  ...current.current,
                  writing: {
                    ...current.current.writing,
                    revision: remote.writing.revision,
                  },
                };
                setDocuments(current.current);
                persist();
                continue;
              }
            }
            throw reason;
          }
          const latest: Document = current.current[section];
          current.current = {
            ...current.current,
            [section]: { revision: saved.revision, value: latest.value },
          };
          if (latest.value === sent.value) pending.current.delete(section);
          setDocuments(current.current);
          persist();
        }
      }
      conflictRef.current = null;
      setConflict(null);
      setStatus("Dados sincronizados");
      window.dispatchEvent(new Event("capitulando:data-changed"));
    } catch (reason) {
      conflictRef.current =
        reason instanceof ApiError && reason.status === 409
          ? savingSection
          : null;
      setConflict(conflictRef.current);
      setStatus("");
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível salvar. Sua cópia de recuperação foi preservada.",
      );
    } finally {
      draining.current = false;
    }
  }, [persist]);
  useEffect(() => {
    let active = true;
    apiRequest<Documents>("/workspace")
      .then((remote) => {
        if (!active) return;
        try {
          const drafts = JSON.parse(
            localStorage.getItem(outboxKey) || "{}",
          ) as Partial<Documents>;
          for (const key of Object.keys(drafts) as Section[]) {
            if (key in remote && drafts[key]) {
              remote[key] = drafts[key]!;
              pending.current.add(key);
            }
          }
        } catch {
          setError(
            "A cópia local de recuperação está inválida; os dados do servidor foram mantidos.",
          );
        }
        current.current = remote;
        setDocuments(remote);
        if (pending.current.size) void drain();
      })
      .catch((reason) => {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : "Não foi possível carregar os dados.",
          );
      });
    return () => {
      active = false;
    };
  }, [outboxKey, drain]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (pending.current.size) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    const retry = () => void drain();
    window.addEventListener("online", retry);
    return () => {
      window.removeEventListener("beforeunload", warn);
      window.removeEventListener("online", retry);
    };
  }, [drain]);
  useEffect(() => {
    const refresh = () => {
      if (pending.current.size || draining.current) return;
      const startedAt = generation.current;
      const sequence = ++refreshSequence.current;
      apiRequest<Documents>("/workspace")
        .then((remote) => {
          // A response started before a local change must never restore an old revision.
          if (
            startedAt === generation.current &&
            sequence === refreshSequence.current &&
            !pending.current.size &&
            !draining.current
          ) {
            for (const section of Object.keys(remote) as Section[]) {
              if (
                current.current &&
                remote[section].revision < current.current[section].revision
              )
                return;
            }
            current.current = remote;
            setDocuments(remote);
          }
        })
        .catch(() => {
          /* Keep the last confirmed data during a temporary outage. */
        });
    };
    window.addEventListener("capitulando:data-changed", refresh);
    return () =>
      window.removeEventListener("capitulando:data-changed", refresh);
  }, []);
  const change = useCallback(
    (section: Section, update: SetStateAction<unknown>) => {
      if (!current.current) return;
      generation.current++;
      const old = current.current[section];
      const value =
        typeof update === "function"
          ? (update as (value: unknown) => unknown)(old.value)
          : update;
      current.current = { ...current.current, [section]: { ...old, value } };
      pending.current.add(section);
      setDocuments(current.current);
      persist();
      void drain();
    },
    [persist, drain],
  );
  const readSection = async (section: Section) =>
    (await apiRequest<Documents>("/workspace"))[section].value;
  const resolveSection = async (
    section: Section,
    mode: "local" | "remote",
    value?: unknown,
  ) => {
    const remote = await apiRequest<Documents>("/workspace");
    if (!current.current)
      throw new Error("Os dados ainda não foram carregados.");
    generation.current++;
    const selected =
      mode === "remote"
        ? remote[section].value
        : (value ?? current.current[section].value);
    current.current = {
      ...current.current,
      [section]: { revision: remote[section].revision, value: selected },
    };
    if (mode === "remote") pending.current.delete(section);
    else pending.current.add(section);
    conflictRef.current = null;
    setConflict(null);
    setError("");
    setDocuments(current.current);
    persist();
    if (mode === "local") {
      await drain();
      if (pending.current.has(section))
        throw new Error(
          "A recuperação mudou novamente. Confira as versões antes de tentar outra vez.",
        );
    }
    return selected;
  };
  return (
    <>
      {conflict === "writing" && !writingVisible ? (
        <div
          role="alert"
          className="border-b border-amber-300 bg-amber-50 p-4 text-amber-950 dark:bg-amber-950 dark:text-amber-100"
        >
          Há uma recuperação de escrita pendente. Abra o Espaço de Escrita e
          escolha a versão para continuar a sincronização.
        </div>
      ) : null}
      {error && conflict !== "writing" && (
        <div
          role="alert"
          className="border-b border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
        >
          <p>{error}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              className="rounded-xl border border-current px-3 py-2 font-bold disabled:opacity-50"
              onClick={async () => {
                if (!conflict) {
                  void drain();
                  return;
                }
                if (
                  !confirm(
                    "Manter sua cópia e substituir os dados desta seção no servidor? Alterações feitas na outra sessão serão substituídas.",
                  )
                )
                  return;
                try {
                  const remote = await apiRequest<Documents>("/workspace");
                  if (!current.current) return;
                  generation.current++;
                  current.current = {
                    ...current.current,
                    [conflict]: {
                      ...current.current[conflict],
                      revision: remote[conflict].revision,
                    },
                  };
                  setDocuments(current.current);
                  persist();
                  conflictRef.current = null;
                  await drain();
                } catch (reason) {
                  setError(
                    reason instanceof Error
                      ? reason.message
                      : "Não foi possível sincronizar. Sua cópia foi preservada.",
                  );
                }
              }}
            >
              {conflict ? "Manter minha cópia" : "Tentar sincronizar"}
            </button>
            <button
              className="rounded-xl border border-current px-3 py-2"
              onClick={async () => {
                if (
                  !confirm(
                    "Recarregar os dados do servidor? As alterações locais não sincronizadas serão descartadas.",
                  )
                )
                  return;
                try {
                  const remote = await apiRequest<Documents>("/workspace");
                  generation.current++;
                  pending.current.clear();
                  current.current = remote;
                  setDocuments(remote);
                  persist();
                  setError("");
                  conflictRef.current = null;
                  setConflict(null);
                } catch (reason) {
                  setError(
                    reason instanceof Error
                      ? reason.message
                      : "Não foi possível recarregar. Sua recuperação foi preservada.",
                  );
                }
              }}
            >
              Usar dados do servidor
            </button>
          </div>
        </div>
      )}
      {documents ? (
        <Context.Provider
          value={{
            documents,
            change,
            conflict,
            setWritingVisible,
            readSection,
            resolveSection,
            markConflict: (section) => {
              conflictRef.current = section;
              setConflict(section);
            },
            flush: async () => {
              await drain();
              for (
                let attempt = 0;
                draining.current && attempt < 200;
                attempt++
              )
                await new Promise((resolve) => setTimeout(resolve, 50));
              return pending.current.size === 0 && !conflictRef.current;
            },
          }}
        >
          <div role="status" aria-live="polite" className="sr-only">
            {status}
          </div>
          {children}
        </Context.Provider>
      ) : (
        <div className="p-8">
          Carregando seus dados…{" "}
          {error && (
            <button onClick={() => window.location.reload()}>
              Tentar novamente
            </button>
          )}
        </div>
      )}
    </>
  );
}
export function useWorkspaceSection<T>(
  section: Section,
  fallback: T,
): [T, Dispatch<SetStateAction<T>>] {
  const context = useContext(Context);
  const change = context?.change;
  const update = useCallback(
    (value: SetStateAction<T>) => {
      if (!change) throw new Error("WorkspaceProvider não encontrado.");
      change(section, value as SetStateAction<unknown>);
    },
    [change, section],
  );
  if (!context) throw new Error("WorkspaceProvider não encontrado.");
  return [(context.documents[section].value as T) ?? fallback, update];
}

export function useWorkspaceSync() {
  const context = useContext(Context);
  if (!context) throw new Error("WorkspaceProvider não encontrado.");
  return context.flush;
}

export function useWorkspaceConflict(section: Section) {
  const context = useContext(Context);
  const setVisible = context?.setWritingVisible;
  useEffect(() => {
    if (section !== "writing" || !setVisible) return;
    setVisible(true);
    return () => setVisible(false);
  }, [section, setVisible]);
  if (!context) throw new Error("WorkspaceProvider não encontrado.");
  return {
    mark: () => context.markConflict(section),
    active: context.conflict === section,
    read: () => context.readSection(section),
    resolve: (mode: "local" | "remote", value?: unknown) =>
      context.resolveSection(section, mode, value),
  };
}
