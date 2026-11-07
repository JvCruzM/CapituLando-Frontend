"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Edit2, Plus, Search, Trash2, BookOpen } from "lucide-react";
import {
  deleteWorld,
  loadWorld,
  saveWorld,
  worldLabel,
  worldReference,
  worldText,
  type ReferenceKind,
  type WorldKind,
  type WorldRecord,
  type WorldValue,
} from "@/lib/world-api";
import { worldCatalogs } from "@/lib/world-fields";
import { WorldDialog } from "./WorldDialog";

const input =
  "mt-2 block w-full rounded-xl border border-[#4b1d3f]/20 bg-white p-3 text-sm text-stone-900 dark:border-[#382b47] dark:bg-[#221a2b] dark:text-stone-100";
const primary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#4b1d3f] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#38142f] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-pink-800 dark:hover:bg-pink-900";

export function WorldCatalog({
  kind,
  storyId,
  parentId,
}: {
  kind: WorldKind;
  storyId: string;
  parentId?: string;
}) {
  const config = worldCatalogs[kind];
  const parentField =
    kind === "character-organizations"
      ? "organization"
      : kind === "event-characters"
        ? "event"
        : "";
  const [pool, setPool] = useState<
    Partial<Record<ReferenceKind, WorldRecord[]>>
  >({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<WorldRecord | "new" | null>(null);
  const [viewing, setViewing] = useState<WorldRecord | null>(null);
  const [form, setForm] = useState<Record<string, string | number | boolean>>(
    {},
  );
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const recordName = useCallback(
    (row: WorldRecord) => {
      if (kind === "character-organizations" || kind === "event-characters")
        return (
          worldLabel(
            (pool.characters || []).find(
              (character) => character.id === worldReference(row, "character"),
            ) || row,
          ) || "Personagem"
        );
      return worldLabel(row);
    },
    [kind, pool.characters],
  );
  useEffect(() => {
    let active = true;
    const kinds = [
      ...new Set<ReferenceKind>([
        kind,
        ...config.fields.flatMap((field) => (field.ref ? [field.ref] : [])),
      ]),
    ];
    Promise.all(
      kinds.map(
        async (resource) =>
          [resource, await loadWorld(resource, storyId)] as const,
      ),
    )
      .then((entries) => {
        if (active) {
          setPool(Object.fromEntries(entries));
          setLoadError("");
          setLoading(false);
        }
      })
      .catch((reason) => {
        if (active) {
          setLoadError(
            reason instanceof Error
              ? reason.message
              : "Não foi possível carregar os registros.",
          );
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [kind, storyId, config, attempt]);
  const records = (pool[kind] || []).filter(
    (row) => !parentId || worldReference(row, parentField) === parentId,
  );
  const filtered = records
    .filter((row) =>
      `${recordName(row)} ${worldText(row, "description")} ${worldText(row, "type")} ${worldText(row, "category")}`
        .toLocaleLowerCase("pt-BR")
        .includes(query.toLocaleLowerCase("pt-BR")),
    )
    .sort((a, b) =>
      kind === "events"
        ? Number(a.sequenceOrder || 0) - Number(b.sequenceOrder || 0)
        : recordName(a).localeCompare(recordName(b), "pt-BR"),
    );
  const labelForReference = (
    row: WorldRecord,
    field: string,
    resource: ReferenceKind,
  ) =>
    worldLabel(
      (pool[resource] || []).find(
        (candidate) => candidate.id === worldReference(row, field),
      ) || row,
    );
  const open = (row?: WorldRecord) => {
    const values: Record<string, string | number | boolean> = {};
    for (const field of config.fields)
      values[field.key] = row
        ? field.ref
          ? worldReference(row, field.key)
          : typeof row[field.key] === "boolean"
            ? Boolean(row[field.key])
            : worldText(row, field.key)
        : (field.default ?? "");
    if (parentId) values[parentField] = parentId;
    setForm(values);
    setEditing(row || "new");
    setError("");
    setNotice("");
  };
  const optionsFor = (resource: ReferenceKind, field: string) =>
    (pool[resource] || []).filter((candidate) => {
      if (editing === "new" || !editing || field !== "parentLocation")
        return true;
      const visited = new Set<string>();
      let ancestor: WorldRecord | undefined = candidate;
      while (ancestor) {
        if (ancestor.id === editing.id || visited.has(ancestor.id))
          return false;
        visited.add(ancestor.id);
        const parent = worldReference(ancestor, "parentLocation");
        ancestor = (pool.locations || []).find(
          (location) => location.id === parent,
        );
      }
      return true;
    });
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      const fields: Record<string, WorldValue> = {};
      for (const field of config.fields) {
        const value = form[field.key];
        fields[field.key] = field.ref
          ? value
            ? { id: String(value) }
            : null
          : field.type === "checkbox"
            ? Boolean(value)
            : field.type === "number"
              ? value === ""
                ? null
                : Number(value)
              : String(value ?? "").trim();
      }
      const saved = await saveWorld(
        kind,
        storyId,
        fields,
        editing && editing !== "new" ? editing.id : undefined,
      );
      setPool((previous) => ({
        ...previous,
        [kind]: [
          ...(previous[kind] || []).filter((row) => row.id !== saved.id),
          saved,
        ],
      }));
      if (viewing?.id === saved.id) setViewing(saved);
      setEditing(null);
      setNotice("Registro salvo.");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível salvar. Seu formulário foi preservado.",
      );
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };
  const remove = async (row: WorldRecord) => {
    if (
      inFlight.current ||
      !confirm(
        `Excluir ${recordName(row)}? Os demais registros vinculados precisam ser desvinculados primeiro.`,
      )
    )
      return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await deleteWorld(kind, row.id);
      setPool((previous) => ({
        ...previous,
        [kind]: (previous[kind] || []).filter((item) => item.id !== row.id),
      }));
      if (viewing?.id === row.id) setViewing(null);
      setNotice("Registro excluído.");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Não foi possível excluir.",
      );
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };
  const displayError = (message: string) => (
    <p
      role="alert"
      className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-100"
    >
      {message}
    </p>
  );
  return (
    <section className="space-y-4" aria-label={config.label}>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#4b1d3f]/20 bg-[#fcf8f2] p-4 dark:border-[#382b47] dark:bg-[#1a1321]">
        <div>
          <h3 className="font-serif text-lg font-bold">
            {config.label}{" "}
            <span className="text-sm text-stone-600 dark:text-stone-400">
              ({records.length})
            </span>
          </h3>
          <p className="mt-1 text-xs text-stone-600 dark:text-stone-300">
            {config.description}
          </p>
        </div>
        <button
          className={primary}
          disabled={busy || loading || Boolean(loadError)}
          onClick={() => open()}
        >
          <Plus size={16} />
          {config.action}
        </button>
      </div>
      {loadError && (
        <div className="space-y-2">
          {displayError(loadError)}
          <button
            className={primary}
            onClick={() => {
              setLoading(true);
              setAttempt((value) => value + 1);
            }}
          >
            Tentar carregar novamente
          </button>
        </div>
      )}
      {error && !editing && displayError(error)}
      {notice && (
        <p role="status" className="text-sm text-[#4b1d3f] dark:text-pink-200">
          {notice}
        </p>
      )}
      {!parentId && (
        <label className="relative block">
          <Search
            size={16}
            aria-hidden="true"
            className="absolute left-3 top-3 text-stone-600 dark:text-stone-400"
          />
          <span className="sr-only">
            Pesquisar {config.label.toLocaleLowerCase("pt-BR")}
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Pesquisar ${config.label.toLocaleLowerCase("pt-BR")}…`}
            className={`${input} pl-9`}
          />
        </label>
      )}
      {loading ? (
        <p role="status" className="p-5 text-sm">
          Carregando {config.label.toLocaleLowerCase("pt-BR")}…
        </p>
      ) : !loadError && filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#4b1d3f]/25 p-8 text-center text-sm text-stone-600 dark:border-[#382b47] dark:text-stone-300">
          Nenhum registro encontrado para este livro.
        </p>
      ) : (
        <div
          className={`grid gap-4 ${parentId ? "" : "sm:grid-cols-2 xl:grid-cols-3"}`}
        >
          {filtered.map((row) => (
            <article
              key={row.id}
              className="overflow-hidden rounded-3xl border border-[#4b1d3f]/20 bg-[#fcf8f2] shadow-sm dark:border-[#382b47] dark:bg-[#1a1321]"
            >
              {config.image && worldText(row, config.image) && (
                <div className="relative h-40 bg-stone-100 dark:bg-[#221a2b]">
                  <Image
                    src={worldText(row, config.image)}
                    alt={recordName(row)}
                    fill
                    sizes="(max-width: 640px) 100vw, 400px"
                    unoptimized
                    className="object-cover"
                  />
                </div>
              )}
              <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-serif text-lg font-bold">
                    {recordName(row)}
                  </h4>
                  <div className="flex shrink-0 gap-2">
                    <button
                      aria-label={`Editar ${recordName(row)}`}
                      disabled={busy}
                      onClick={() => open(row)}
                      className="rounded-lg p-1 text-stone-600 dark:text-stone-300"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      aria-label={`Excluir ${recordName(row)}`}
                      disabled={busy}
                      onClick={() => void remove(row)}
                      className="rounded-lg p-1 text-red-700 dark:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {worldText(row, "description") && (
                  <p className="line-clamp-3 whitespace-pre-wrap text-sm text-stone-600 dark:text-stone-300">
                    {worldText(row, "description")}
                  </p>
                )}
                {config.fields
                  .filter(
                    (field) =>
                      field.key !== parentField &&
                      (field.ref ||
                        [
                          "type",
                          "category",
                          "chronologicalDate",
                          "role",
                          "joinedAt",
                          "isActive",
                        ].includes(field.key)),
                  )
                  .map((field) => {
                    const value = field.ref
                      ? worldReference(row, field.key)
                        ? labelForReference(row, field.key, field.ref)
                        : ""
                      : field.type === "checkbox"
                        ? row[field.key]
                          ? "Sim"
                          : "Não"
                        : worldText(row, field.key);
                    return value ? (
                      <p
                        key={field.key}
                        className="text-xs text-stone-600 dark:text-stone-300"
                      >
                        <span className="font-bold">{field.label}:</span>{" "}
                        {value}
                      </p>
                    ) : null;
                  })}
                {!parentId && (
                  <button
                    onClick={() => {
                      setViewing(row);
                      setError("");
                    }}
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#4b1d3f] underline dark:text-pink-200"
                  >
                    <BookOpen size={14} />
                    Ver detalhes de {recordName(row)}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      {viewing && (
        <WorldDialog
          title={recordName(viewing)}
          onClose={() => setViewing(null)}
        >
          <dl className="space-y-4">
            {config.fields
              .filter((field) => field.type !== "url")
              .map((field) => {
                const value = field.ref
                  ? worldReference(viewing, field.key)
                    ? labelForReference(viewing, field.key, field.ref)
                    : ""
                  : worldText(viewing, field.key);
                return value ? (
                  <div key={field.key}>
                    <dt className="text-xs font-bold text-[#4b1d3f] dark:text-pink-200">
                      {field.label}
                    </dt>
                    <dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed">
                      {value}
                    </dd>
                  </div>
                ) : null;
              })}
          </dl>
          {kind === "organizations" && (
            <div className="mt-6">
              <WorldCatalog
                key={viewing.id}
                kind="character-organizations"
                storyId={storyId}
                parentId={viewing.id}
              />
            </div>
          )}
          {kind === "events" && (
            <div className="mt-6">
              <WorldCatalog
                key={viewing.id}
                kind="event-characters"
                storyId={storyId}
                parentId={viewing.id}
              />
            </div>
          )}
        </WorldDialog>
      )}
      {editing && (
        <WorldDialog
          title={
            editing === "new" ? config.action : `Editar ${config.singular}`
          }
          busy={busy}
          onClose={() => {
            setEditing(null);
            setError("");
          }}
        >
          <form onSubmit={(event) => void save(event)}>
            {error && displayError(error)}
            <fieldset disabled={busy} className="space-y-4">
              {config.fields
                .filter((field) => !(parentId && field.key === parentField))
                .map((field) => (
                  <label
                    key={field.key}
                    className={`block text-xs font-bold ${field.type === "checkbox" ? "flex items-center gap-3" : ""}`}
                  >
                    {field.label}
                    {field.required ? " *" : ""}
                    {field.ref ? (
                      <>
                        <select
                          className={input}
                          required={field.required}
                          value={String(form[field.key] ?? "")}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              [field.key]: event.target.value,
                            })
                          }
                        >
                          <option value="">
                            {field.required ? "Selecione" : "Sem vínculo"}
                          </option>
                          {optionsFor(field.ref, field.key).map((option) => (
                            <option key={option.id} value={option.id}>
                              {worldLabel(option)}
                            </option>
                          ))}
                        </select>
                        {(pool[field.ref] || []).length === 0 && (
                          <span className="mt-2 block font-normal text-stone-600 dark:text-stone-300">
                            Cadastre{" "}
                            {field.ref === "races"
                              ? "uma raça em Universo / Mundo"
                              : field.ref === "characters"
                                ? "uma ficha na aba Personagens"
                                : field.ref === "chapters"
                                  ? "um capítulo no Espaço de Escrita"
                                  : "os registros relacionados neste livro"}{" "}
                            para selecionar aqui.
                          </span>
                        )}
                      </>
                    ) : field.type === "checkbox" ? (
                      <input
                        type="checkbox"
                        checked={Boolean(form[field.key])}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            [field.key]: event.target.checked,
                          })
                        }
                        className="h-5 w-5 accent-[#4b1d3f] dark:accent-pink-400"
                      />
                    ) : field.type === "textarea" ? (
                      <textarea
                        className={input}
                        rows={3}
                        maxLength={field.max || 100000}
                        required={field.required}
                        value={String(form[field.key] ?? "")}
                        onChange={(event) =>
                          setForm({ ...form, [field.key]: event.target.value })
                        }
                      />
                    ) : (
                      <input
                        className={input}
                        type={field.type || "text"}
                        required={field.required}
                        maxLength={
                          field.max || (field.type === "url" ? 2000000 : 1000)
                        }
                        min={field.type === "number" ? 0 : undefined}
                        max={field.type === "number" ? 2147483647 : undefined}
                        step={field.type === "number" ? 1 : undefined}
                        value={String(form[field.key] ?? "")}
                        onChange={(event) =>
                          setForm({ ...form, [field.key]: event.target.value })
                        }
                      />
                    )}
                  </label>
                ))}
              <div className="flex justify-end gap-3 border-t border-[#4b1d3f]/15 pt-4 dark:border-[#382b47]">
                <button
                  type="button"
                  className="rounded-xl border border-[#4b1d3f]/20 px-4 py-2 text-xs dark:border-[#382b47]"
                  onClick={() => {
                    setEditing(null);
                    setError("");
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className={primary}>
                  {busy ? "Salvando…" : "Salvar registro"}
                </button>
              </div>
            </fieldset>
          </form>
        </WorldDialog>
      )}
    </section>
  );
}
