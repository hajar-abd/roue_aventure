import { describe, expect, it } from "vitest";
import { activities } from "./catalog";
import {
  calculateRotation,
  filterActivities,
  relaxationSuggestions,
  sectorAtPointer,
  selectDraw,
} from "./logic";
import {
  budgets,
  categories,
  companions,
  defaultPreferences,
  durations,
} from "./types";
import type { Preferences } from "./types";

function seededRandom(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
}

describe("catalogue", () => {
  it("contains at least fifty complete, distinct activities and many short indoor free ideas", () => {
    expect(activities.length).toBeGreaterThanOrEqual(50);
    expect(new Set(activities.map((activity) => activity.id)).size).toBe(
      activities.length,
    );
    for (const activity of activities) {
      expect(activity.title.length).toBeGreaterThan(3);
      expect(activity.description.length).toBeGreaterThan(20);
      expect(activity.materials.length).toBeGreaterThan(10);
      expect(activity.steps).toHaveLength(3);
      expect(activity.steps.every((step) => step.length > 10)).toBe(true);
      expect(activity.companions.length).toBeGreaterThan(0);
      expect(activity.categories.length).toBeGreaterThan(0);
      expect(activity.duration).toBeGreaterThan(0);
      expect(activity.budget).toBeGreaterThanOrEqual(0);
    }
    expect(
      activities.filter(
        (activity) =>
          activity.duration <= 15 &&
          activity.budget === 0 &&
          activity.place === "interieur",
      ).length,
    ).toBeGreaterThanOrEqual(15);
  });
});

describe("filters", () => {
  it("respects both ceilings and all filters across every supported combination", () => {
    for (const duration of durations)
      for (const budget of budgets)
        for (const companion of companions) {
          for (const place of [
            "interieur",
            "exterieur",
            "indifferent",
          ] as const) {
            for (let mask = 0; mask < 2 ** categories.length; mask++) {
              const selected = categories.filter(
                (_, index) => mask & (1 << index),
              );
              const preferences: Preferences = {
                duration,
                budget,
                companion,
                place,
                categories: selected,
              };
              const result = filterActivities(activities, preferences);
              const expected = activities.filter(
                (activity) =>
                  !(
                    activity.duration > duration ||
                    activity.budget > budget ||
                    !activity.companions.includes(companion) ||
                    (place !== "indifferent" && activity.place !== place) ||
                    (selected.length &&
                      !selected.some((category) =>
                        activity.categories.includes(category),
                      ))
                  ),
              );
              expect(result.map((activity) => activity.id)).toEqual(
                expected.map((activity) => activity.id),
              );
            }
          }
        }
  });
  it("combines selected categories with OR, not AND", () => {
    const preferences: Preferences = {
      ...defaultPreferences,
      categories: ["gourmand", "mouvement"],
    };
    const result = filterActivities(activities, preferences);
    expect(
      result.some(
        (activity) =>
          activity.categories.includes("gourmand") &&
          !activity.categories.includes("mouvement"),
      ),
    ).toBe(true);
    expect(
      result.some(
        (activity) =>
          activity.categories.includes("mouvement") &&
          !activity.categories.includes("gourmand"),
      ),
    ).toBe(true);
  });
  it("handles no match and one match without modifying preferences", () => {
    const preferences: Preferences = {
      duration: 15,
      budget: 0,
      companion: "solo",
      place: "exterieur",
      categories: ["gourmand"],
    };
    expect(filterActivities(activities, preferences)).toEqual([]);
    expect(relaxationSuggestions(activities, preferences)).toContain(
      "Essayez « Indifférent » pour le lieu.",
    );
    expect(preferences.place).toBe("exterieur");
    expect(
      filterActivities(activities, { ...preferences, categories: ["creatif"] }),
    ).toHaveLength(1);
  });
});

describe("draw and geometry", () => {
  it("samples up to eight unique compatible sectors and avoids the last result", () => {
    const compatible = filterActivities(activities, defaultPreferences);
    const rng = seededRandom(1234);
    for (let attempt = 0; attempt < 200; attempt++) {
      const draw = selectDraw(
        [...compatible, compatible[0]],
        compatible[0].id,
        rng,
      );
      expect(draw.sectors).toHaveLength(8);
      expect(new Set(draw.sectors.map((activity) => activity.id)).size).toBe(8);
      expect(
        draw.sectors.every((activity) => compatible.includes(activity)),
      ).toBe(true);
      expect(draw.sectors.map((activity) => activity.id)).not.toContain(
        compatible[0].id,
      );
      expect(draw.winner).toBe(draw.sectors[draw.winnerIndex]);
    }
  });
  it("handles zero, one, two and fewer than eight candidates", () => {
    expect(selectDraw([]).winner).toBeUndefined();
    expect(selectDraw([]).winnerIndex).toBe(-1);
    const one = selectDraw([activities[0]], activities[0].id, () => 0);
    expect(one.winner).toEqual(activities[0]);
    expect(one.sectors).toHaveLength(1);
    expect(
      selectDraw(activities.slice(0, 2), activities[0].id, () => 0).winner,
    ).toEqual(activities[1]);
    expect(
      selectDraw(activities.slice(0, 5), undefined, () => 0).sectors,
    ).toHaveLength(5);
  });
  it("lands the winning sector center exactly at twelve o’clock for repeated spins", () => {
    let current = 0;
    for (let repeat = 0; repeat < 20; repeat++)
      for (let count = 1; count <= 8; count++) {
        for (let winner = 0; winner < count; winner++) {
          const rotation = calculateRotation(current, winner, count);
          expect(rotation - current).toBeGreaterThanOrEqual(1800);
          expect(sectorAtPointer(rotation, count)).toBe(winner);
          const angle = (rotation + (winner * 360) / count) / 360;
          expect(Math.abs(angle - Math.round(angle))).toBeLessThan(1e-8);
          current = rotation;
        }
      }
  });
  it("rejects invalid geometry", () => {
    expect(() => calculateRotation(0, 0, 0)).toThrow(RangeError);
    expect(() => calculateRotation(0, 8, 8)).toThrow(RangeError);
    expect(sectorAtPointer(0, 0)).toBe(-1);
  });
  it("gives every displayed index an equal range in the random draw", () => {
    for (let winner = 0; winner < 8; winner++) {
      let call = 0;
      const draw = selectDraw(activities.slice(0, 8), undefined, () =>
        ++call <= 8 ? 0 : (winner + 0.5) / 8,
      );
      expect(draw.winnerIndex).toBe(winner);
    }
  });
  it("does not mutate candidates and has a balanced deterministic sample", () => {
    const pool = activities.slice(0, 12);
    const original = [...pool];
    const counts = new Map(pool.map((activity) => [activity.id, 0]));
    const rng = seededRandom(89);
    for (let i = 0; i < 12000; i++) {
      const winner = selectDraw(pool, undefined, rng).winner!;
      counts.set(winner.id, counts.get(winner.id)! + 1);
    }
    expect(pool).toEqual(original);
    for (const count of counts.values()) {
      expect(count).toBeGreaterThan(850);
      expect(count).toBeLessThan(1150);
    }
  });
});
