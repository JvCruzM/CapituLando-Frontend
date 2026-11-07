import type { ReferenceKind, WorldKind } from "./world-api";
export interface WorldField {
  key: string;
  label: string;
  type?: "textarea" | "url" | "number" | "checkbox";
  ref?: ReferenceKind;
  required?: boolean;
  max?: number;
  default?: string | number | boolean;
}
interface Catalog {
  label: string;
  singular: string;
  action: string;
  description: string;
  fields: WorldField[];
  image?: string;
}
const name: WorldField = {
  key: "name",
  label: "Nome",
  required: true,
  max: 100,
};
const description: WorldField = {
  key: "description",
  label: "Descrição",
  type: "textarea",
};
const appearance: WorldField = {
  key: "appearance",
  label: "Aparência",
  type: "textarea",
};
const habitat: WorldField = {
  key: "habitat",
  label: "Habitat",
  type: "textarea",
};
const image = (key: string): WorldField => ({
  key,
  label: "URL da imagem",
  type: "url",
});
export const worldCatalogs: Record<WorldKind, Catalog> = {
  races: {
    label: "Raças",
    singular: "raça",
    action: "Nova raça",
    description: "Povos, espécies e culturas que habitam sua história.",
    image: "raceImage",
    fields: [
      name,
      description,
      appearance,
      { key: "culture", label: "Cultura", type: "textarea" },
      habitat,
      image("raceImage"),
    ],
  },
  creatures: {
    label: "Criaturas",
    singular: "criatura",
    action: "Nova criatura",
    description: "Fauna, seres fantásticos e seus comportamentos.",
    image: "creatureImage",
    fields: [
      name,
      { key: "race", label: "Raça", ref: "races" },
      description,
      appearance,
      { key: "behavior", label: "Comportamento", type: "textarea" },
      habitat,
      image("creatureImage"),
    ],
  },
  items: {
    label: "Itens",
    singular: "item",
    action: "Novo item",
    description: "Objetos, artefatos e elementos importantes para o enredo.",
    image: "itemImage",
    fields: [
      name,
      { key: "type", label: "Tipo", max: 50 },
      description,
      appearance,
      { key: "origin", label: "Origem", type: "textarea" },
      image("itemImage"),
    ],
  },
  locations: {
    label: "Locais",
    singular: "local",
    action: "Novo local",
    description: "Organize lugares, regiões e os locais que fazem parte deles.",
    image: "locationImage",
    fields: [
      { ...name, max: 150 },
      { key: "type", label: "Tipo", max: 80 },
      { key: "region", label: "Região", max: 100 },
      { key: "climate", label: "Clima", max: 100 },
      {
        key: "parentLocation",
        label: "Local ao qual pertence",
        ref: "locations",
      },
      description,
      image("locationImage"),
    ],
  },
  organizations: {
    label: "Organizações",
    singular: "organização",
    action: "Nova organização",
    description: "Grupos, instituições e os personagens que fazem parte deles.",
    image: "organizationImage",
    fields: [
      { ...name, max: 150 },
      { key: "type", label: "Tipo", max: 100 },
      { key: "headquartersLocation", label: "Sede", ref: "locations" },
      description,
      image("organizationImage"),
    ],
  },
  rules: {
    label: "Regras e lore",
    singular: "regra",
    action: "Nova regra",
    description: "Registre as regras, a magia e a história do seu universo.",
    fields: [
      { key: "title", label: "Título", required: true, max: 150 },
      {
        key: "category",
        label: "Categoria",
        required: true,
        max: 80,
        default: "Lore / História",
      },
      { ...description, required: true },
    ],
  },
  events: {
    label: "Eventos vinculados",
    singular: "evento",
    action: "Novo evento vinculado",
    description:
      "Conecte a cronologia a capítulos, locais e personagens do livro.",
    image: "eventImage",
    fields: [
      { key: "title", label: "Título", required: true, max: 200 },
      { key: "chronologicalDate", label: "Data ou época", max: 100 },
      {
        key: "sequenceOrder",
        label: "Ordem na cronologia",
        type: "number",
        default: 0,
      },
      { key: "location", label: "Local do evento", ref: "locations" },
      { key: "chapter", label: "Capítulo relacionado", ref: "chapters" },
      description,
      image("eventImage"),
    ],
  },
  "character-organizations": {
    label: "Membros",
    singular: "participação",
    action: "Adicionar membro",
    description:
      "Vincule personagens e registre seus papéis nesta organização.",
    fields: [
      {
        key: "organization",
        label: "Organização",
        ref: "organizations",
        required: true,
      },
      {
        key: "character",
        label: "Personagem",
        ref: "characters",
        required: true,
      },
      { key: "role", label: "Papel na organização", max: 100 },
      { key: "joinedAt", label: "Data ou época de entrada", max: 100 },
      {
        key: "isActive",
        label: "Participação ativa",
        type: "checkbox",
        default: true,
      },
    ],
  },
  "event-characters": {
    label: "Personagens envolvidos",
    singular: "participação",
    action: "Adicionar participante",
    description: "Selecione os personagens presentes neste acontecimento.",
    fields: [
      { key: "event", label: "Evento", ref: "events", required: true },
      {
        key: "character",
        label: "Personagem",
        ref: "characters",
        required: true,
      },
    ],
  },
};
