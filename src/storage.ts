import { activityById } from "./catalog";
import {
  budgets,
  categories,
  companions,
  defaultPreferences,
  durations,
} from "./types";
import type { HistoryEntry, Preferences, Status } from "./types";

export const STORAGE_KEY = "petites-aventures:v1";
export interface SavedState {
  preferences: Preferences;
  history: HistoryEntry[];
}
export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export type StorageIssue = "unavailable" | "invalid" | null;
const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

function validPreferences(value: unknown): value is Preferences {
  if (!isObject(value)) return false;
  return (
    durations.includes(value.duration as Preferences["duration"]) &&
    budgets.includes(value.budget as Preferences["budget"]) &&
    companions.includes(value.companion as Preferences["companion"]) &&
    ["interieur", "exterieur", "indifferent"].includes(value.place as string) &&
    Array.isArray(value.categories) &&
    value.categories.every((category) => categories.includes(category)) &&
    new Set(value.categories).size === value.categories.length
  );
}

function validEntry(value: unknown): value is HistoryEntry {
  return (
    isObject(value) &&
    typeof value.id === "string" &&
    value.id.length > 0 &&
    value.id.length <= 100 &&
    typeof value.activityId === "string" &&
    activityById.has(value.activityId) &&
    typeof value.date === "string" &&
    /^\d{4}-\d{2}-\d{2}T/.test(value.date) &&
    Number.isFinite(Date.parse(value.date)) &&
    ["propose", "choisi", "realise"].includes(value.status as string)
  );
}

export function loadState(
  storage?: StoragePort,
): SavedState & { issue: StorageIssue } {
  const fallback = {
    preferences: { ...defaultPreferences, categories: [] },
    history: [],
    issue: null,
  } satisfies SavedState & { issue: StorageIssue };
  try {
    const raw = (storage ?? window.localStorage).getItem(STORAGE_KEY);
    if (raw === null) return fallback;
    const data: unknown = JSON.parse(raw);
    if (
      !isObject(data) ||
      data.version !== 1 ||
      !validPreferences(data.preferences) ||
      !Array.isArray(data.history) ||
      !data.history.every(validEntry) ||
      new Set(data.history.map((entry) => entry.id)).size !==
        data.history.length
    ) {
      return { ...fallback, issue: "invalid" };
    }
    return {
      preferences: data.preferences,
      history: data.history.slice(0, 50),
      issue: null,
    };
  } catch (error) {
    return {
      ...fallback,
      issue: error instanceof SyntaxError ? "invalid" : "unavailable",
    };
  }
}

export function saveState(state: SavedState, storage?: StoragePort): boolean {
  try {
    (storage ?? window.localStorage).setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        ...state,
        history: state.history.slice(0, 50),
      }),
    );
    return true;
  } catch {
    return false;
  }
}

export function addToHistory(
  history: HistoryEntry[],
  entry: HistoryEntry,
): HistoryEntry[] {
  return [entry, ...history.filter((item) => item.id !== entry.id)].slice(
    0,
    50,
  );
}

export function updateStatus(
  history: HistoryEntry[],
  id: string,
  status: Status,
): HistoryEntry[] {
  return history.map((entry) =>
    entry.id === id ? { ...entry, status } : entry,
  );
}
