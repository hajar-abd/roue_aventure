import { describe, expect, it } from "vitest";
import { activities } from "./catalog";
import {
  addToHistory,
  loadState,
  saveState,
  STORAGE_KEY,
  updateStatus,
} from "./storage";
import type { StoragePort } from "./storage";
import { defaultPreferences } from "./types";
import type { HistoryEntry } from "./types";

function memoryStorage(initial?: string): StoragePort {
  const values = new Map<string, string>(
    initial === undefined ? [] : [[STORAGE_KEY, initial]],
  );
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}
const entry = (id: string): HistoryEntry => ({
  id,
  activityId: activities[0].id,
  date: "2026-10-07T12:00:00.000Z",
  status: "propose",
});

describe("local persistence", () => {
  it("restores preferences, dates, order and statuses", () => {
    const storage = memoryStorage();
    const state = {
      preferences: {
        ...defaultPreferences,
        duration: 60 as const,
        categories: ["creatif" as const],
      },
      history: [entry("2"), { ...entry("1"), status: "realise" as const }],
    };
    expect(saveState(state, storage)).toBe(true);
    expect(loadState(storage)).toEqual({ ...state, issue: null });
  });
  it("keeps the latest fifty draws when adding, saving and loading", () => {
    let history: HistoryEntry[] = [];
    for (let i = 0; i < 60; i++)
      history = addToHistory(history, entry(String(i)));
    expect(history).toHaveLength(50);
    expect(history[0].id).toBe("59");
    expect(history[49].id).toBe("10");
    const storage = memoryStorage();
    saveState(
      {
        preferences: defaultPreferences,
        history: [...history, entry("extra")],
      },
      storage,
    );
    expect(loadState(storage).history).toEqual(history);
    const oversized = memoryStorage(
      JSON.stringify({
        version: 1,
        preferences: defaultPreferences,
        history: Array.from({ length: 60 }, (_, i) => entry(String(i))),
      }),
    );
    expect(loadState(oversized).history).toHaveLength(50);
  });
  it("updates only the selected draw, including repeated activities", () => {
    const history = [entry("1"), entry("2")];
    const changed = updateStatus(history, "2", "choisi");
    expect(changed.map((item) => item.status)).toEqual(["propose", "choisi"]);
    expect(history[1].status).toBe("propose");
  });
  it.each([
    "{broken",
    "null",
    "[]",
    '{"version":99}',
    JSON.stringify({
      version: 1,
      preferences: { ...defaultPreferences, duration: -1 },
      history: [],
    }),
    JSON.stringify({
      version: 1,
      preferences: defaultPreferences,
      history: [{ ...entry("1"), date: "yesterday" }],
    }),
    JSON.stringify({
      version: 1,
      preferences: defaultPreferences,
      history: [{ ...entry("1"), activityId: "missing" }],
    }),
    JSON.stringify({
      version: 1,
      preferences: defaultPreferences,
      history: [entry("1"), entry("1")],
    }),
  ])("recovers from invalid data: %s", (raw) => {
    const result = loadState(memoryStorage(raw));
    expect(result.issue).toBe("invalid");
    expect(result.history).toEqual([]);
    expect(result.preferences).toEqual(defaultPreferences);
  });
  it("continues with defaults if storage is blocked or full", () => {
    const storage: StoragePort = {
      getItem: () => {
        throw new Error("Blocked");
      },
      setItem: () => {
        throw new Error("Full");
      },
    };
    expect(loadState(storage).issue).toBe("unavailable");
    expect(
      saveState({ preferences: defaultPreferences, history: [] }, storage),
    ).toBe(false);
  });
  it("persists an empty history while keeping preferences", () => {
    const storage = memoryStorage();
    saveState(
      {
        preferences: { ...defaultPreferences, budget: 15 },
        history: [entry("1")],
      },
      storage,
    );
    const state = loadState(storage);
    saveState({ preferences: state.preferences, history: [] }, storage);
    expect(loadState(storage).history).toEqual([]);
    expect(loadState(storage).preferences.budget).toBe(15);
  });
});
