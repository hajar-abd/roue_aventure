import { budgets, categories, categoryLabels, durations } from "./types";
import type { Preferences } from "./types";
import { Icon } from "./Icons";

export default function Filters({
  preferences,
  onChange,
  disabled,
  count,
}: {
  preferences: Preferences;
  onChange: (next: Preferences) => void;
  disabled: boolean;
  count: number;
}) {
  function update<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    onChange({ ...preferences, [key]: value });
  }
  return (
    <aside className="filters-card" aria-labelledby="filters-title">
      <div className="section-eyebrow">
        <span className="step-number">01</span> À votre mesure
      </div>
      <h2 id="filters-title">De quoi avez-vous envie ?</h2>
      <p className="muted filters-intro">
        On fait avec le temps et les envies du moment.
      </p>
      <div className="filters-fields">
        <fieldset disabled={disabled}>
          <legend>
            <Icon name="clock" size={17} /> Votre temps <span>au maximum</span>
          </legend>
          <div className="choice-grid four">
            {durations.map((duration) => (
              <label className="choice" key={duration}>
                <input
                  type="radio"
                  name="duration"
                  value={duration}
                  checked={preferences.duration === duration}
                  onChange={() => update("duration", duration)}
                />
                <span>{duration === 120 ? "2 h" : `${duration} min`}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset disabled={disabled}>
          <legend>
            <Icon name="coin" size={17} /> Votre budget{" "}
            <span>par personne, max.</span>
          </legend>
          <div className="choice-grid four">
            {budgets.map((budget) => (
              <label className="choice" key={budget}>
                <input
                  type="radio"
                  name="budget"
                  value={budget}
                  checked={preferences.budget === budget}
                  onChange={() => update("budget", budget)}
                />
                <span>{budget === 0 ? "Gratuit" : `${budget} €`}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset disabled={disabled}>
          <legend>Avec qui ?</legend>
          <div className="choice-grid three">
            {(
              [
                ["solo", "Seul"],
                ["duo", "À deux"],
                ["groupe", "En groupe"],
              ] as const
            ).map(([value, label]) => (
              <label className="choice" key={value}>
                <input
                  type="radio"
                  name="companion"
                  checked={preferences.companion === value}
                  onChange={() => update("companion", value)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset disabled={disabled}>
          <legend>Plutôt où ?</legend>
          <div className="choice-grid three">
            {(
              [
                ["interieur", "Intérieur"],
                ["exterieur", "Extérieur"],
                ["indifferent", "Indifférent"],
              ] as const
            ).map(([value, label]) => (
              <label className="choice" key={value}>
                <input
                  type="radio"
                  name="place"
                  checked={preferences.place === value}
                  onChange={() => update("place", value)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset disabled={disabled}>
          <legend>
            Une envie en particulier ? <span>facultatif</span>
          </legend>
          <div className="category-choices">
            {categories.map((category) => (
              <label className="choice category-choice" key={category}>
                <input
                  type="checkbox"
                  checked={preferences.categories.includes(category)}
                  onChange={() =>
                    update(
                      "categories",
                      preferences.categories.includes(category)
                        ? preferences.categories.filter(
                            (item) => item !== category,
                          )
                        : [...preferences.categories, category],
                    )
                  }
                />
                <span>
                  <span className="check-box" aria-hidden="true">
                    {preferences.categories.includes(category) && (
                      <Icon name="check" size={12} />
                    )}
                  </span>
                  {categoryLabels[category]}
                </span>
              </label>
            ))}
          </div>
          <p className="field-help">
            Plusieurs envies ? Une seule suffit pour qu’une idée vous
            corresponde.
          </p>
        </fieldset>
      </div>
      <p className="compatible-count" role="status">
        <span className={`status-dot ${count ? "" : "empty"}`} />
        <strong>
          {count} {count > 1 ? "aventures possibles" : "aventure possible"}
        </strong>
        <span>avec vos critères</span>
      </p>
    </aside>
  );
}
