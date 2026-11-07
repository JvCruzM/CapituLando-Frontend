import { apiRequest } from "./api";

export type WorldKind =
  | "races"
  | "creatures"
  | "items"
  | "locations"
  | "organizations"
  | "rules"
  | "events"
  | "character-organizations"
  | "event-characters";
export type ReferenceKind = WorldKind | "characters" | "chapters";
export type WorldValue = string | number | boolean | { id: string } | null;
export interface WorldRecord {
  id: string;
  story: { id: string };
  [field: string]: WorldValue | undefined;
}
export const worldText = (record: WorldRecord, field: string) =>
  typeof record[field] === "string" || typeof record[field] === "number"
    ? String(record[field])
    : "";
export const worldReference = (record: WorldRecord, field: string) => {
  const value = record[field];
  return value && typeof value === "object" ? value.id : "";
};
export const worldLabel = (record: WorldRecord) =>
  worldText(record, "name") || worldText(record, "title");
function endpoint(kind: WorldKind) {
  return ["races", "creatures", "items"].includes(kind)
    ? `/${kind}`
    : `/world/${kind}`;
}
export async function loadWorld(
  kind: ReferenceKind,
  storyId: string,
): Promise<WorldRecord[]> {
  if (kind === "chapters")
    return apiRequest<WorldRecord[]>(`/stories/${storyId}/chapters`);
  if (kind === "characters")
    return (await apiRequest<WorldRecord[]>("/characters")).filter(
      (row) => row.story.id === storyId,
    );
  const rows = await apiRequest<WorldRecord[]>(
    `${endpoint(kind)}${["races", "creatures", "items"].includes(kind) ? "" : `?storyId=${storyId}`}`,
  );
  return rows.filter((row) => row.story.id === storyId);
}
export function saveWorld(
  kind: WorldKind,
  storyId: string,
  fields: Record<string, WorldValue>,
  id?: string,
) {
  return apiRequest<WorldRecord>(`${endpoint(kind)}${id ? `/${id}` : ""}`, {
    method: id ? "PUT" : "POST",
    body: JSON.stringify({ ...fields, story: { id: storyId } }),
  });
}
export function deleteWorld(kind: WorldKind, id: string) {
  return apiRequest<void>(`${endpoint(kind)}/${id}`, { method: "DELETE" });
}
