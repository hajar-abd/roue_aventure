import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { activities } from "../src/catalog";
import { STORAGE_KEY } from "../src/storage";

test("draw aligns with the pointer, locks controls, saves statuses and avoids repetition", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("./");
  await page.getByRole("button", { name: "Trouver mon aventure" }).click();
  await expect(
    page.getByRole("button", { name: "Un peu de hasard…" }),
  ).toBeDisabled();
  for (const input of await page.locator(".filters-card input").all())
    await expect(input).toBeDisabled();
  await expect(page.locator("#result-title")).toBeVisible({ timeout: 7000 });
  const title = await page.locator("#result-title").innerText();
  const winnerId = activities.find((activity) => activity.title === title)!.id;
  const wheel = page.getByTestId("wheel");
  const sectorIds = await wheel
    .locator("[data-activity-id]")
    .evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("data-activity-id")),
    );
  expect(new Set(sectorIds).size).toBe(sectorIds.length);
  const actualRotation = await wheel.evaluate((element) => {
    const matrix = new DOMMatrix(getComputedStyle(element).transform);
    return (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI;
  });
  const step = 360 / sectorIds.length;
  const pointedIndex =
    Math.floor(((((-actualRotation + step / 2) % 360) + 360) % 360) / step) %
    sectorIds.length;
  expect(sectorIds[pointedIndex]).toBe(winnerId);
  await page.getByRole("button", { name: "C’est parti", exact: true }).click();
  await expect(page.locator(".result-card .status-badge")).toHaveText("Choisi");
  await page
    .getByRole("button", { name: "Marquer comme réalisée", exact: true })
    .click();
  await expect(page.locator(".result-card .status-badge")).toHaveText(
    "Réalisé",
  );
  await page.reload();
  await expect(page.locator(".history-list")).toContainText(title);
  await expect(page.locator(".history-list .status-badge")).toHaveText(
    "Réalisé",
  );
  await page
    .getByRole("button", { name: `Rouvrir : ${title}`, exact: true })
    .click();
  await expect(page.locator("#result-title")).toHaveText(title);
  await page
    .getByRole("button", { name: "Une autre idée", exact: true })
    .click();
  await expect(page.locator("#result-title")).toBeVisible({ timeout: 7000 });
  expect(await page.locator("#result-title").innerText()).not.toBe(title);
  expect(errors).toEqual([]);
});

test("zero and single matches, saved filters and reduced animation", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("radio", { name: "15 min", exact: true }).check();
  await page.getByRole("radio", { name: "Extérieur", exact: true }).check();
  await page.getByRole("checkbox", { name: "Gourmand", exact: true }).check();
  await expect(
    page.getByText("0 aventure possible", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Aucune idée avec cette combinaison."),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Trouver mon aventure" }),
  ).toHaveCount(0);
  await page.getByRole("checkbox", { name: "Gourmand", exact: true }).uncheck();
  await page.getByRole("checkbox", { name: "Créatif", exact: true }).check();
  await expect(
    page.getByText("1 aventure possible", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Trouver mon aventure" }).click();
  await expect(page.locator("#result-title")).toHaveText(
    "Le cinéma des nuages",
    { timeout: 1500 },
  );
  await page.reload();
  await expect(
    page.getByRole("radio", { name: "15 min", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("checkbox", { name: "Créatif", exact: true }),
  ).toBeChecked();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("checkbox", { name: "Créatif", exact: true }).uncheck();
  await page.getByRole("radio", { name: "Indifférent", exact: true }).check();
  await page.getByRole("button", { name: "Trouver mon aventure" }).click();
  await expect(page.locator("#result-title")).toBeVisible({ timeout: 1500 });
});

test("clipboard fallback is usable and clearing requires confirmation", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", { value: undefined }),
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await page.getByRole("button", { name: "Trouver mon aventure" }).click();
  await expect(page.locator("#result-title")).toBeVisible();
  await page.getByRole("button", { name: "Copier le défi" }).click();
  const copyText = page.getByRole("textbox");
  await expect(copyText).toBeVisible();
  expect(await copyText.inputValue()).toContain(
    await page.locator("#result-title").innerText(),
  );
  expect(await copyText.inputValue()).toContain("Matériel :");
  await page
    .getByRole("button", { name: "Vider l’historique", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Garder mon carnet" }).click();
  await expect(page.locator(".history-list>li")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Vider l’historique", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Vider l’historique", exact: true })
    .click();
  await expect(page.getByText("La première page est à vous.")).toBeVisible();
  await page.reload();
  await expect(page.getByText("La première page est à vous.")).toBeVisible();
});

test("successful clipboard copy provides feedback", async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async (text: string) => {
          document.documentElement.dataset.copiedText = text;
        },
      },
    }),
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await page.getByRole("button", { name: "Trouver mon aventure" }).click();
  await page.getByRole("button", { name: "Copier le défi" }).click();
  await expect(page.getByRole("button", { name: "Défi copié" })).toBeVisible();
  expect(await page.locator("html").getAttribute("data-copied-text")).toContain(
    await page.locator("#result-title").innerText(),
  );
});

test("invalid local data recovers and unavailable storage permits a draw", async ({
  page,
}) => {
  await page.addInitScript(
    (key) => localStorage.setItem(key, "{broken"),
    STORAGE_KEY,
  );
  await page.goto("./");
  await expect(
    page.getByText(/Les données locales étaient invalides/),
  ).toBeVisible();
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error("Storage blocked");
    };
    Storage.prototype.setItem = () => {
      throw new Error("Storage blocked");
    };
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(
    page.getByText(/La sauvegarde locale est indisponible/),
  ).toBeVisible();
  await page.getByRole("button", { name: "Trouver mon aventure" }).click();
  await expect(page.locator("#result-title")).toBeVisible();
  await expect(page.locator(".history-list>li")).toHaveCount(1);
});

test("responsive layout, keyboard focus, accessibility and no external requests", async ({
  page,
}, testInfo) => {
  const externalRequests: string[] = [];
  page.on("request", (request) => {
    if (!request.url().startsWith("http://127.0.0.1:4173"))
      externalRequests.push(request.url());
  });
  await page.goto("./");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Aller au contenu" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("radio", { name: "30 min", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("radio", { name: "15 min", exact: true })).toBeChecked();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: "30 min", exact: true })).toBeChecked();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const initialScan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(initialScan.violations).toEqual([]);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: testInfo.outputPath("accueil.png"),
    fullPage: true,
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Trouver mon aventure" }).click();
  await expect(page.locator("#result-title")).toBeVisible();
  const resultScan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(resultScan.violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("resultat.png"),
    fullPage: true,
  });
  expect(externalRequests).toEqual([]);
});
