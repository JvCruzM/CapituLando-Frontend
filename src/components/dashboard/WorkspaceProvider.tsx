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
    if (draining.current || !current.current) return;
    draining.current = true;
    setError("");
    setStatus("Salvando…");
    let savingSection: Section | null = null;
    try {
      for (const section of pending.current) {
        while (pending.current.has(section)) {
          savingSection = section;
          const sent: Document = current.current[section];
          const saved: Document = await apiRequest<Document>(
            `/workspace/${section}`,
            { method: "PUT", body: JSON.stringify(sent) },
          );
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
      setConflict(null);
      setStatus("Dados sincronizados");
      window.dispatchEvent(new Event("capitulando:data-changed"));
    } catch (reason) {
      setConflict(
        reason instanceof ApiError && reason.status === 409
          ? savingSection
          : null,
      );
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
  return (
    <>
      {error && (
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
            flush: async () => {
              await drain();
              for (
                let attempt = 0;
                draining.current && attempt < 200;
                attempt++
              )
                await new Promise((resolve) => setTimeout(resolve, 50));
              return pending.current.size === 0;
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
