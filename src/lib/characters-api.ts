import { apiRequest } from "@/lib/api";

export interface CharacterRecord {
  id: string;
  story: { id: string };
  name: string;
  role?: string | null;
  age?: number | null;
  height?: string | null;
  weight?: string | null;
  zodiac?: string | null;
  bloodType?: string | null;
  mbti?: string | null;
  characterImage?: string | null;
  imageFit?: "cover" | "contain" | null;
  imagePosition?: string | null;
  appearance?: string | null;
  likes?: string | null;
  dislikes?: string | null;
  drinks?: string | null;
  motto?: string | null;
  notes?: string | null;
}

export interface CharacterInput {
  story: { id: string };
  name: string;
  role: string;
  age: number;
  height: string;
  weight: string;
  zodiac: string;
  bloodType: string;
  mbti: string;
  characterImage?: string;
  imageFit: "cover" | "contain";
  imagePosition: string;
  appearance: string;
  likes: string;
  dislikes: string;
  drinks: string;
  motto: string;
  notes: string;
}

export interface CharacterRelationship {
  id: string;
  storyId: string;
  sourceCharacterId: string;
  targetCharacterId: string;
  type: string;
  description?: string | null;
  level: number;
}

export interface CharacterRelationshipInput {
  sourceCharacterId: string;
  targetCharacterId: string;
  type: string;
  description: string;
  level?: number;
}

export function loadCharacters() {
  return apiRequest<CharacterRecord[]>("/characters");
}

export function createCharacter(input: CharacterInput) {
  return apiRequest<CharacterRecord>("/characters", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateCharacter(id: string, input: CharacterInput) {
  return apiRequest<CharacterRecord>(`/characters/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteCharacter(id: string) {
  return apiRequest<void>(`/characters/${id}`, { method: "DELETE" });
}

export function loadCharacterRelationships(storyId: string) {
  return apiRequest<CharacterRelationship[]>(
    `/stories/${storyId}/character-relationships`,
  );
}

export function createCharacterRelationship(
  storyId: string,
  input: CharacterRelationshipInput,
) {
  return apiRequest<CharacterRelationship>(
    `/stories/${storyId}/character-relationships`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function updateCharacterRelationship(
  storyId: string,
  id: string,
  input: CharacterRelationshipInput,
) {
  return apiRequest<CharacterRelationship>(
    `/stories/${storyId}/character-relationships/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    },
  );
}

export function deleteCharacterRelationship(storyId: string, id: string) {
  return apiRequest<void>(`/stories/${storyId}/character-relationships/${id}`, {
    method: "DELETE",
  });
}
