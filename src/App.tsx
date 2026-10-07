import { useEffect, useRef, useState } from "react";
import { activities, activityById } from "./catalog";
import {
  calculateRotation,
  filterActivities,
  relaxationSuggestions,
  selectDraw,
} from "./logic";
import { addToHistory, loadState, saveState, updateStatus } from "./storage";
import { statusLabels } from "./types";
import type { Activity, HistoryEntry, Preferences, Status } from "./types";
import Filters from "./Filters";
import Wheel from "./Wheel";
import Result from "./Result";
import { Icon } from "./Icons";

function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default function App() {
  const [initial] = useState(() => loadState());
  const [preferences, setPreferences] = useState(initial.preferences);
  const [history, setHistory] = useState(initial.history);
  const [storageIssue, setStorageIssue] = useState(initial.issue);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [drawSectors, setDrawSectors] = useState<Activity[] | null>(null);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const spinLock = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const resultSection = useRef<HTMLDivElement>(null);
  const clearDialog = useRef<HTMLDialogElement>(null);
  const reducedMotion = useReducedMotion();
  const compatible = filterActivities(activities, preferences);
  const sectors = drawSectors ?? compatible.slice(0, 8);
  const activeEntry = history.find((entry) => entry.id === activeId);
  const activeActivity = activeEntry
    ? activityById.get(activeEntry.activityId)
    : undefined;

  useEffect(() => {
    if (!saveState({ preferences, history })) setStorageIssue("unavailable");
  }, [preferences, history]);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (activeId && !spinning) {
      resultSection.current
        ?.querySelector<HTMLElement>("h2")
        ?.focus({ preventScroll: true });
      resultSection.current?.scrollIntoView({
        behavior: reducedMotion ? "instant" : "smooth",
        block: "nearest",
      });
    }
  }, [activeId, spinning, reducedMotion]);

  function changePreferences(next: Preferences) {
    if (spinLock.current) return;
    setPreferences(next);
    setDrawSectors(null);
    setRotation(0);
    setActiveId(null);
    setAnnouncement("");
  }

  function spin() {
    if (spinLock.current) return;
    const draw = selectDraw(compatible, history[0]?.activityId);
    if (!draw.winner) return;
    spinLock.current = true;
    setSpinning(true);
    setActiveId(null);
    setDrawSectors(draw.sectors);
    setAnnouncement(
      draw.sectors.length === 1
        ? "Une idée vous attend."
        : "La roue tourne. Votre aventure arrive.",
    );
    setRotation(
      draw.sectors.length === 1
        ? 0
        : calculateRotation(rotation, draw.winnerIndex, draw.sectors.length),
    );
    const winner = draw.winner;
    timer.current = setTimeout(
      () => {
        const entry: HistoryEntry = {
          id: `${Date.now()}-${crypto.getRandomValues(new Uint32Array(2)).join("-")}`,
          activityId: winner.id,
          date: new Date().toISOString(),
          status: "propose",
        };
        setHistory((previous) => addToHistory(previous, entry));
        setActiveId(entry.id);
        setSpinning(false);
        spinLock.current = false;
        setAnnouncement(
          `Votre aventure : ${winner.title}. ${winner.duration} minutes, ${winner.budget === 0 ? "gratuit" : `${winner.budget} euros par personne`}.`,
        );
      },
      reducedMotion || draw.sectors.length === 1 ? 160 : 3700,
    );
  }

  function mark(id: string, status: Status) {
    setHistory((previous) => updateStatus(previous, id, status));
    setAnnouncement(
      status === "choisi"
        ? "Aventure choisie. À vous de jouer !"
        : "Aventure marquée comme réalisée.",
    );
  }

  function reopen(entry: HistoryEntry) {
    const activity = activityById.get(entry.activityId);
    if (!activity || spinning) return;
    setDrawSectors([activity]);
    setRotation(0);
    setActiveId(entry.id);
    setAnnouncement(
      `Fiche rouverte : ${activity.title}. Statut : ${statusLabels[entry.status]}.`,
    );
    resultSection.current?.scrollIntoView({
      behavior: reducedMotion ? "instant" : "smooth",
      block: "nearest",
    });
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Aller au contenu
      </a>
      <header className="site-header">
        <a href="#" className="brand" aria-label="petites aventures, accueil">
          <Icon name="compass" size={34} />
          <span>
            petites aventures<span className="brand-dot">.</span>
          </span>
        </a>
        <a className="notebook-link" href="#carnet">
          <Icon name="history" size={17} />
          <span>Mon carnet</span>
          {history.length > 0 && (
            <span className="history-count">{history.length}</span>
          )}
        </a>
      </header>
      <main id="main" tabIndex={-1}>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-kicker">
            <span />
            LE QUOTIDIEN, AUTREMENT
          </div>
          <h1 id="hero-title">
            Une petite aventure
            <br />
            <em>commence ici.</em>
          </h1>
          <p>Un peu de temps, un budget et une idée à découvrir.</p>
          <div className="hero-flourish" aria-hidden="true">
            <Icon name="spark" size={44} />
            <span>
              Pas besoin d’aller loin
              <br />
              pour sortir de l’ordinaire.
            </span>
          </div>
        </section>
        {storageIssue && (
          <p className="storage-notice" role="status">
            {storageIssue === "invalid"
              ? "Les données locales étaient invalides. Un carnet neuf a été ouvert ; vous pouvez continuer."
              : "La sauvegarde locale est indisponible. Vos choix restent accessibles pendant cette session, mais seront perdus à la fermeture."}
          </p>
        )}
        <section className="adventure-layout" aria-label="Choisir une aventure">
          <Filters
            preferences={preferences}
            onChange={changePreferences}
            disabled={spinning}
            count={compatible.length}
          />
          <div className="wheel-panel">
            <div className="wheel-heading">
              <span className="section-eyebrow">
                <span className="step-number">02</span> Une place au hasard
              </span>
              <h2>Laissez-vous surprendre.</h2>
              <p>
                {spinning
                  ? "Votre prochaine petite histoire se prépare…"
                  : "Quelques idées, un tour de roue. Et pourquoi pas ?"}
              </p>
            </div>
            <Wheel
              sectors={sectors}
              rotation={rotation}
              spinning={spinning}
              reducedMotion={reducedMotion}
            />
            {compatible.length === 0 ? (
              <div className="no-results" role="status">
                <h3>Aucune idée avec cette combinaison.</h3>
                <p>
                  Un petit ajustement peut ouvrir de nouvelles possibilités :
                </p>
                <ul>
                  {relaxationSuggestions(activities, preferences).map(
                    (suggestion) => (
                      <li key={suggestion}>{suggestion}</li>
                    ),
                  )}
                </ul>
                <p>Vos filtres restent à votre main.</p>
              </div>
            ) : (
              <>
                <button
                  className="button primary spin-button"
                  onClick={spin}
                  disabled={spinning}
                >
                  <Icon name={spinning ? "refresh" : "spark"} size={20} />
                  {spinning ? "Un peu de hasard…" : "Trouver mon aventure"}
                  {!spinning && <Icon name="arrow" size={20} />}
                </button>
                <p className="wheel-footnote">
                  {sectors.length === 1
                    ? "Une seule possibilité : elle se dévoile sans faire tourner la roue."
                    : "Le hasard propose. Vous décidez."}
                </p>
              </>
            )}
            {sectors.length > 0 && (
              <details className="wheel-ideas">
                <summary>Les {sectors.length} idées sur la roue</summary>
                <ul>
                  {sectors.map((activity) => (
                    <li key={activity.id}>{activity.title}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        </section>
        <div
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {announcement}
        </div>
        <div ref={resultSection} className="result-section" id="resultat">
          {activeEntry && activeActivity && (
            <Result
              key={activeEntry.id}
              activity={activeActivity}
              entry={activeEntry}
              onStatus={(status) => mark(activeEntry.id, status)}
              onAgain={spin}
              disabled={spinning}
              canDraw={compatible.length > 0}
            />
          )}
        </div>
        <div className="little-note">
          <Icon name="leaf" size={21} />
          <p>
            Les meilleures histoires commencent parfois par un tout petit{" "}
            <em>« pourquoi pas ».</em>
          </p>
        </div>
        <section
          className="history-section"
          id="carnet"
          aria-labelledby="history-title"
        >
          <div className="history-heading">
            <div>
              <span className="section-eyebrow">
                LES PETITS MOMENTS COMPTENT
              </span>
              <h2 id="history-title">
                Votre carnet d’aventures<span>.</span>
              </h2>
              <p>
                Les idées piochées, celles tentées, et celles à garder pour plus
                tard.
              </p>
            </div>
            {history.length > 0 && (
              <button
                className="button text-button clear-button"
                disabled={spinning}
                onClick={() => clearDialog.current?.showModal()}
              >
                Vider l’historique
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <div className="empty-history">
              <span className="empty-icon">
                <Icon name="history" size={28} />
              </span>
              <div>
                <h3>La première page est à vous.</h3>
                <p>Tournez la roue : vos aventures viendront se poser ici.</p>
              </div>
              <span className="empty-dashes" aria-hidden="true">
                — — —
              </span>
            </div>
          ) : (
            <ol className="history-list">
              {history.map((entry) => {
                const activity = activityById.get(entry.activityId)!;
                return (
                  <li key={entry.id}>
                    <span
                      className={`history-marker ${entry.status}`}
                      aria-hidden="true"
                    >
                      <Icon
                        name={entry.status === "realise" ? "check" : "leaf"}
                        size={20}
                      />
                    </span>
                    <div className="history-item-main">
                      <button
                        className="history-title"
                        disabled={spinning}
                        onClick={() => reopen(entry)}
                        aria-label={`Rouvrir : ${activity.title}`}
                      >
                        {activity.title}
                        <Icon name="arrow" size={16} />
                      </button>
                      <div className="history-item-meta">
                        <time dateTime={entry.date}>
                          {dateFormat.format(new Date(entry.date))}
                        </time>
                        <span>{activity.duration} min</span>
                        <span>
                          {activity.budget === 0
                            ? "Gratuit"
                            : `${activity.budget} € / pers.`}
                        </span>
                      </div>
                    </div>
                    <span className={`status-badge ${entry.status}`}>
                      {statusLabels[entry.status]}
                    </span>
                    {entry.status !== "realise" && (
                      <button
                        className="button history-done"
                        disabled={spinning}
                        onClick={() => mark(entry.id, "realise")}
                        aria-label={`Marquer « ${activity.title} » comme réalisée`}
                      >
                        <Icon name="check" size={17} />
                        <span>Réalisée</span>
                      </button>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
          <p className="local-note">
            <span className="status-dot" />
            Votre carnet reste dans ce navigateur. Sans compte, sans envoi de
            données. Les 50 derniers tirages sont conservés.
          </p>
        </section>
      </main>
      <footer className="site-footer">
        <a className="brand footer-brand" href="#">
          <Icon name="compass" size={25} />
          <span>petites aventures.</span>
        </a>
        <span>{activities.length} façons de changer un peu le quotidien.</span>
        <span>À votre rythme. Tout simplement.</span>
      </footer>
      <dialog
        ref={clearDialog}
        aria-labelledby="clear-title"
        aria-describedby="clear-description"
      >
        <form method="dialog">
          <button className="dialog-close button" aria-label="Fermer">
            <Icon name="close" />
          </button>
          <span className="section-eyebrow">UNE NOUVELLE PAGE</span>
          <h2 id="clear-title">Vider votre carnet ?</h2>
          <p id="clear-description">
            Les {history.length} tirages et leurs statuts seront supprimés de ce
            navigateur. Vos préférences seront conservées.
          </p>
          <div className="dialog-actions">
            <button className="button secondary" autoFocus>
              Garder mon carnet
            </button>
            <button
              className="button primary"
              onClick={() => {
                setHistory([]);
                setActiveId(null);
                setAnnouncement("L’historique a été vidé.");
              }}
            >
              Vider l’historique
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
