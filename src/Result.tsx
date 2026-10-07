import { useEffect, useRef, useState } from "react";
import { activityText } from "./logic";
import { categoryLabels, statusLabels } from "./types";
import type { Activity, HistoryEntry, Status } from "./types";
import { Icon } from "./Icons";

export default function Result({
  activity,
  entry,
  onStatus,
  onAgain,
  disabled,
  canDraw,
}: {
  activity: Activity;
  entry: HistoryEntry;
  onStatus: (status: Status) => void;
  onAgain: () => void;
  disabled: boolean;
  canDraw: boolean;
}) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "manual">(
    "idle",
  );
  const textArea = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (copyState === "manual") {
      textArea.current?.focus();
      textArea.current?.select();
    }
  }, [copyState]);
  async function copy() {
    try {
      if (!navigator.clipboard?.writeText)
        throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(activityText(activity));
      setCopyState("copied");
    } catch {
      setCopyState("manual");
    }
  }
  return (
    <article
      className="result-card"
      aria-labelledby="result-title"
      aria-busy={disabled}
    >
      <div className="result-topline">
        <span className="section-eyebrow">
          <Icon name="spark" size={17} /> Votre petite aventure
        </span>
        <span className={`status-badge ${entry.status}`}>
          {statusLabels[entry.status]}
        </span>
      </div>
      <h2 id="result-title" tabIndex={-1}>
        {activity.title}
      </h2>
      <p className="result-description">{activity.description}</p>
      <div className="result-meta">
        <span>
          <Icon name="clock" size={17} />
          {activity.duration} min
        </span>
        <span>
          <Icon name="coin" size={17} />
          {activity.budget === 0
            ? "Gratuit"
            : `${activity.budget} € / personne`}
        </span>
        <span>
          <Icon name="leaf" size={17} />
          {activity.place === "interieur" ? "À l’intérieur" : "À l’extérieur"}
        </span>
      </div>
      <div className="result-body">
        <div className="materials">
          <h3>Dans votre sac</h3>
          <p>{activity.materials}</p>
          <div className="result-tags">
            {activity.categories.map((category) => (
              <span key={category}>{categoryLabels[category]}</span>
            ))}
          </div>
        </div>
        <div className="steps">
          <h3>On se lance ?</h3>
          <ol>
            {activity.steps.map((step, index) => (
              <li key={step}>
                <span aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="result-actions">
        {entry.status === "propose" && (
          <button
            className="button primary"
            disabled={disabled}
            onClick={() => onStatus("choisi")}
          >
            C’est parti
            <Icon name="arrow" size={18} />
          </button>
        )}
        {entry.status === "choisi" && (
          <button
            className="button primary"
            disabled={disabled}
            onClick={() => onStatus("realise")}
          >
            Marquer comme réalisée
            <Icon name="check" size={18} />
          </button>
        )}
        {entry.status === "realise" && (
          <span className="completed-note">
            <Icon name="check" />
            Une petite aventure de plus.
          </span>
        )}
        <button
          className="button secondary"
          disabled={disabled || !canDraw}
          onClick={onAgain}
        >
          <Icon name="refresh" size={17} />
          Une autre idée
        </button>
        <button
          className="button text-button"
          disabled={disabled}
          onClick={copy}
        >
          <Icon name={copyState === "copied" ? "check" : "copy"} size={17} />
          {copyState === "copied" ? "Défi copié" : "Copier le défi"}
        </button>
      </div>
      <span className="sr-only" role="status">
        {copyState === "copied"
          ? "Le défi a été copié dans le presse-papiers."
          : copyState === "manual"
            ? "Copie automatique indisponible. Le texte est prêt à sélectionner."
            : ""}
      </span>
      {copyState === "manual" && (
        <div className="copy-fallback">
          <label htmlFor="copy-text">
            Copie automatique indisponible. Copiez ce texte avec Ctrl+C, Cmd+C
            ou le menu de votre téléphone.
          </label>
          <textarea
            ref={textArea}
            id="copy-text"
            readOnly
            value={activityText(activity)}
            rows={8}
          />
        </div>
      )}
      <p className="budget-note">
        Durées indicatives. Budgets estimatifs, prix non vérifiés. « Gratuit »
        suppose que le matériel est déjà disponible.
      </p>
    </article>
  );
}
