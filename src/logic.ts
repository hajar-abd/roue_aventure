import type { Activity, Preferences } from "./types";

export type Random = () => number;
export const random: Random = () =>
  crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;

export function filterActivities(
  catalog: Activity[],
  preferences: Preferences,
): Activity[] {
  return catalog.filter(
    (activity) =>
      activity.duration <= preferences.duration &&
      activity.budget <= preferences.budget &&
      activity.companions.includes(preferences.companion) &&
      (preferences.place === "indifferent" ||
        activity.place === preferences.place) &&
      (preferences.categories.length === 0 ||
        preferences.categories.some((category) =>
          activity.categories.includes(category),
        )),
  );
}

export function selectDraw(
  compatible: Activity[],
  lastId?: string,
  rng: Random = random,
) {
  const unique = [
    ...new Map(compatible.map((activity) => [activity.id, activity])).values(),
  ];
  const pool =
    unique.length > 1
      ? unique.filter((activity) => activity.id !== lastId)
      : unique;
  // Partial Fisher–Yates gives every candidate the same chance to appear.
  const count = Math.min(8, pool.length);
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(rng() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const sectors = pool.slice(0, count);
  const winnerIndex = sectors.length ? Math.floor(rng() * sectors.length) : -1;
  return {
    sectors,
    winnerIndex,
    winner: sectors[winnerIndex] as Activity | undefined,
  };
}

export const modulo = (value: number, divisor: number) =>
  ((value % divisor) + divisor) % divisor;

// Sector zero is centered at twelve o'clock; positive rotation is clockwise.
export function calculateRotation(
  current: number,
  winnerIndex: number,
  count: number,
): number {
  if (
    !Number.isInteger(count) ||
    count < 1 ||
    winnerIndex < 0 ||
    winnerIndex >= count ||
    !Number.isInteger(winnerIndex)
  ) {
    throw new RangeError("Invalid wheel sector");
  }
  const target = modulo((-winnerIndex * 360) / count, 360);
  return current + 5 * 360 + modulo(target - current, 360);
}

export function sectorAtPointer(rotation: number, count: number): number {
  if (count < 1) return -1;
  return (
    Math.floor(modulo(-rotation + 180 / count, 360) / (360 / count)) % count
  );
}

export function relaxationSuggestions(
  catalog: Activity[],
  preferences: Preferences,
): string[] {
  const suggestions: string[] = [];
  if (
    preferences.duration < 120 &&
    filterActivities(catalog, { ...preferences, duration: 120 }).length
  )
    suggestions.push("Accordez-vous davantage de temps.");
  if (
    preferences.budget < 30 &&
    filterActivities(catalog, { ...preferences, budget: 30 }).length
  )
    suggestions.push("Essayez un plafond de budget plus élevé.");
  if (
    preferences.place !== "indifferent" &&
    filterActivities(catalog, { ...preferences, place: "indifferent" }).length
  )
    suggestions.push("Essayez « Indifférent » pour le lieu.");
  if (
    preferences.categories.length &&
    filterActivities(catalog, { ...preferences, categories: [] }).length
  )
    suggestions.push(
      "Décochez vos envies pour explorer toutes les catégories.",
    );
  return suggestions.length
    ? suggestions
    : [
        "Essayez de combiner plus de temps, un lieu indifférent ou moins de contraintes d’envies.",
      ];
}

export function activityText(activity: Activity): string {
  return `${activity.title}\n\n${activity.description}\n\nDurée : ${activity.duration} min\nBudget estimatif : ${activity.budget === 0 ? "gratuit, matériel déjà disponible" : `${activity.budget} € par personne (prix non vérifiés)`}\nMatériel : ${activity.materials}\n\n${activity.steps.map((step, index) => `${index + 1}. ${step}`).join("\n")}\n\nUne idée de petites aventures.`;
}
