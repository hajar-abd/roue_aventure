export const companions = ["solo", "duo", "groupe"] as const;
export const categories = [
  "creatif",
  "decouverte",
  "gourmand",
  "detente",
  "mouvement",
] as const;
export const durations = [15, 30, 60, 120] as const;
export const budgets = [0, 5, 15, 30] as const;
export type Companion = (typeof companions)[number];
export type Category = (typeof categories)[number];
export type Place = "interieur" | "exterieur";
export interface Activity {
  id: string;
  title: string;
  description: string;
  duration: number;
  budget: number;
  companions: Companion[];
  place: Place;
  categories: Category[];
  materials: string;
  steps: [string, string, string];
}
export interface Preferences {
  duration: (typeof durations)[number];
  budget: (typeof budgets)[number];
  companion: Companion;
  place: Place | "indifferent";
  categories: Category[];
}
export type Status = "propose" | "choisi" | "realise";
export interface HistoryEntry {
  id: string;
  activityId: string;
  date: string;
  status: Status;
}
export const categoryLabels: Record<Category, string> = {
  creatif: "Créatif",
  decouverte: "Découverte",
  gourmand: "Gourmand",
  detente: "Détente",
  mouvement: "Mouvement",
};
export const statusLabels: Record<Status, string> = {
  propose: "Proposé",
  choisi: "Choisi",
  realise: "Réalisé",
};
export const defaultPreferences: Preferences = {
  duration: 30,
  budget: 0,
  companion: "solo",
  place: "indifferent",
  categories: [],
};
