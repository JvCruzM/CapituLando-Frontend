export interface Character {
  id: string;
  name: string;
  role: string; // ex: Protagonista, Antagonista, Secundário
  age: number;
  mbti: string;
  motivation: string;
  avatarText: string;
  relationship: {
    target: string;
    type: string; // ex: Amigo, Rival, Aliado
    level: number; // 1 a 5 (corações)
  };
  notes?: string;
}