import { useState, useRef, useCallback } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase/config.js";
import { BilSectionTitle } from "./BilingualText.jsx";
import { showNotification } from "./Notification.jsx";
import "./RSVP.css";

const RSVP_DEADLINE_FR = "20 Septembre 2026";
const RSVP_DEADLINE_EN = "20 September 2026";

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export default function RSVP() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [currentGuest, setCurrentGuest] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedYes, setSubmittedYes] = useState(false);
  const [loading, setLoading] = useState(false);

  const allGuestsRef = useRef([]);
  const loadedRef = useRef(false);

  const ensureGuestsLoaded = async () => {
    if (loadedRef.current) return;
    const snap = await getDocs(collection(db, "guests"));
    allGuestsRef.current = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    loadedRef.current = true;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const search = useCallback(
    debounce(async (term) => {
      if (term.length < 1) {
        setResults([]);
        setShowResults(false);
        return;
      }
      await ensureGuestsLoaded();
      const t = term.toLowerCase();
      const matches = allGuestsRef.current
        .filter((g) => {
          const name = (g.name || "").toLowerCase();
          const terms = Array.isArray(g.searchTerms)
            ? g.searchTerms.join(" ").toLowerCase()
            : (g.searchTerms || "").toLowerCase();
          return name.includes(t) || terms.includes(t);
        })
        .slice(0, 8);
      setResults(matches);
      setShowResults(true);
    }, 300),
    [],
  );

  const handleInput = (e) => {
    setQuery(e.target.value);
    setCurrentGuest(null);
    search(e.target.value.trim());
  };

  const selectGuest = async (guest) => {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, "guests", guest.id));
      if (!snap.exists()) {
        showNotification(
          "Invité introuvable. Veuillez contacter les mariés. / Guest not found.",
          "error",
        );
        return;
      }
      const fresh = { id: snap.id, ...snap.data() };
      setQuery(fresh.name);
      setShowResults(false);
      setResults([]);

      if (fresh.rsvp !== "pending") {
        showNotification(
          `${fresh.name} a déjà confirmé sa présence. / has already submitted an RSVP.`,
          "warning",
          7000,
        );
        return;
      }
      setCurrentGuest(fresh);
    } catch {
      showNotification(
        "Erreur de chargement. Veuillez réessayer. / Could not load guest.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const submitRSVP = async (attending) => {
    if (!currentGuest) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "guests", currentGuest.id), {
        rsvp: attending ? "attending" : "not_attending",
        lastUpdated: serverTimestamp(),
      });
      setSubmittedYes(attending);
      setSubmitted(true);
      setCurrentGuest(null);
      setQuery("");
    } catch {
      showNotification(
        "Échec de la soumission. Veuillez réessayer. / Failed to submit RSVP.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  // ── No Firebase: mock preview (shows real UI with a demo guest) ───────────
  if (!isFirebaseConfigured) {
    return (
      <section id="rsvp" className="rsvp section">
        <div className="container">
          <BilSectionTitle fr="Confirmation de Présence" en="RSVP" />
          <div className="rsvp__wrap">
            {/* Instructions — identical to live */}
            <div className="rsvp__instructions">
              <div className="rsvp__instructions-title">
                <p className="rsvp__instructions-title--fr">
                  Comment confirmer votre présence
                </p>
                <p className="rsvp__instructions-title--en">How to RSVP</p>
              </div>
              <ol className="rsvp__steps">
                <li>
                  <span className="step-fr">
                    Recherchez votre nom tel qu'il figure sur votre invitation.
                  </span>
                  <span className="step-en">
                    Search for your name exactly as written on your invitation.
                  </span>
                </li>
                <li>
                  <span className="step-fr">
                    Sélectionnez votre nom dans la liste.
                  </span>
                  <span className="step-en">
                    Select your name from the list.
                  </span>
                </li>
                <li>
                  <span className="step-fr">
                    Confirmez votre présence ou votre absence.
                  </span>
                  <span className="step-en">
                    Confirm whether you will be attending.
                  </span>
                </li>
              </ol>
              <div className="rsvp__deadline">
                <span className="rsvp__deadline-label">
                  Date limite / RSVP Deadline
                </span>
                <span className="rsvp__deadline-date--fr">
                  {RSVP_DEADLINE_FR}
                </span>
                <span className="rsvp__deadline-date--en">
                  {RSVP_DEADLINE_EN}
                </span>
              </div>
            </div>

            {/* Mock form — pre-filled with demo guest */}
            <div className="rsvp__form card">
              <div className="rsvp__form-title">
                <p className="rsvp__form-title--fr">Trouvez votre invitation</p>
                <p className="rsvp__form-title--en">Find Your Invitation</p>
              </div>
              <div className="rsvp__sub-wrap">
                <p className="rsvp__sub rsvp__sub--fr">
                  Entrez votre nom tel qu'il figure sur votre invitation.
                </p>
                <p className="rsvp__sub rsvp__sub--en">
                  Enter your name exactly as it appears on your invitation.
                </p>
              </div>

              <div className="rsvp__search-wrap">
                <input
                  className="rsvp__input"
                  type="text"
                  placeholder="Rechercher votre nom… / Search your name…"
                  defaultValue="Sam Kaye"
                  readOnly
                />
              </div>

              {/* Static mock guest confirmation panel */}
              <div className="rsvp__guest-confirm">
                <div className="rsvp__greeting-wrap">
                  <p className="rsvp__greeting rsvp__greeting--fr">
                    Bonjour, <strong>Sam Kaye</strong> !
                  </p>
                  <p className="rsvp__greeting rsvp__greeting--en">
                    Hello, <strong>Sam Kaye</strong>!
                  </p>
                </div>
                <div className="rsvp__question-wrap">
                  <p className="rsvp__question rsvp__question--fr">
                    Serez-vous présent(e) le 03 octobre 2026 ?
                  </p>
                  <p className="rsvp__question rsvp__question--en">
                    Will you be joining us on 03 October 2026?
                  </p>
                </div>
                <div className="rsvp__options">
                  <button className="btn btn-primary rsvp__option">
                    ✓ Je serai présent(e) ! / I'll be there!
                  </button>
                  <button className="btn btn-outline rsvp__option">
                    ✕ Je décline avec regret / Regretfully decline
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── Full RSVP form ────────────────────────────────────────────────────────
  return (
    <section id="rsvp" className="rsvp section">
      <div className="container">
        <BilSectionTitle fr="Confirmation de Présence" en="RSVP" />

        <div className="rsvp__wrap">
          {/* Instructions */}
          <div className="rsvp__instructions">
            <div className="rsvp__instructions-title">
              <p className="rsvp__instructions-title--fr">
                Comment confirmer votre présence
              </p>
              <p className="rsvp__instructions-title--en">How to RSVP</p>
            </div>
            <ol className="rsvp__steps">
              <li>
                <span className="step-fr">
                  Recherchez votre nom tel qu'il figure sur votre invitation.
                </span>
                <span className="step-en">
                  Search for your name exactly as written on your invitation.
                </span>
              </li>
              <li>
                <span className="step-fr">
                  Sélectionnez votre nom dans la liste.
                </span>
                <span className="step-en">Select your name from the list.</span>
              </li>
              <li>
                <span className="step-fr">
                  Confirmez votre présence ou votre absence.
                </span>
                <span className="step-en">
                  Confirm whether you will be attending.
                </span>
              </li>
            </ol>
            <div className="rsvp__deadline">
              <span className="rsvp__deadline-label">
                Date limite / RSVP Deadline
              </span>
              <span className="rsvp__deadline-date--fr">
                {RSVP_DEADLINE_FR}
              </span>
              <span className="rsvp__deadline-date--en">
                {RSVP_DEADLINE_EN}
              </span>
            </div>
          </div>

          {/* Form */}
          <div className="rsvp__form card">
            {!submitted ? (
              <>
                <div className="rsvp__form-title">
                  <p className="rsvp__form-title--fr">
                    Trouvez votre invitation
                  </p>
                  <p className="rsvp__form-title--en">Find Your Invitation</p>
                </div>
                <div className="rsvp__sub-wrap">
                  <p className="rsvp__sub rsvp__sub--fr">
                    Entrez votre nom tel qu'il figure sur votre invitation.
                  </p>
                  <p className="rsvp__sub rsvp__sub--en">
                    Enter your name exactly as it appears on your invitation.
                  </p>
                </div>

                <div className="rsvp__search-wrap">
                  <input
                    className="rsvp__input"
                    type="text"
                    placeholder="Rechercher votre nom… / Search your name…"
                    value={query}
                    onChange={handleInput}
                    autoComplete="off"
                    disabled={loading}
                  />
                  {showResults && (
                    <ul className="rsvp__results">
                      {results.length === 0 ? (
                        <li className="rsvp__no-result">
                          <span className="step-fr">
                            Aucun résultat. Vérifiez l'orthographe ou contactez
                            les mariés.
                          </span>
                          <span className="step-en">
                            No match found. Check spelling or contact the
                            couple.
                          </span>
                        </li>
                      ) : (
                        results.map((g) => (
                          <li
                            key={g.id}
                            className="rsvp__result-item"
                            onClick={() => selectGuest(g)}
                          >
                            {g.name}
                            {g.partySize > 1 && (
                              <span className="rsvp__party-size">
                                Groupe de / Party of {g.partySize}
                              </span>
                            )}
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>

                {currentGuest && (
                  <div className="rsvp__guest-confirm">
                    <div className="rsvp__greeting-wrap">
                      <p className="rsvp__greeting rsvp__greeting--fr">
                        Bonjour, <strong>{currentGuest.name}</strong> !
                      </p>
                      <p className="rsvp__greeting rsvp__greeting--en">
                        Hello, <strong>{currentGuest.name}</strong>!
                      </p>
                    </div>
                    <div className="rsvp__question-wrap">
                      <p className="rsvp__question rsvp__question--fr">
                        Serez-vous présent(e) le 03 octobre 2026 ?
                      </p>
                      <p className="rsvp__question rsvp__question--en">
                        Will you be joining us on 03 October 2026?
                      </p>
                    </div>
                    <div className="rsvp__options">
                      <button
                        className="btn btn-primary rsvp__option"
                        onClick={() => submitRSVP(true)}
                        disabled={loading}
                      >
                        ✓ Je serai présent(e) ! / I'll be there!
                      </button>
                      <button
                        className="btn btn-outline rsvp__option"
                        onClick={() => submitRSVP(false)}
                        disabled={loading}
                      >
                        ✕ Je décline avec regret / Regretfully decline
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="rsvp__success">
                {submittedYes ? (
                  <>
                    <div className="rsvp__success-icon">🎉</div>
                    <div className="rsvp__success-text">
                      <p className="rs-fr">À bientôt !</p>
                      <p className="rs-en">We'll see you there!</p>
                    </div>
                    <div className="rsvp__success-sub">
                      <p className="rs-fr">
                        Votre confirmation a été enregistrée. Nous avons hâte de
                        célébrer avec vous le 03 octobre 2026.
                      </p>
                      <p className="rs-en">
                        Your RSVP has been recorded. We can't wait to celebrate
                        with you on 03 October 2026.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rsvp__success-icon">💌</div>
                    <div className="rsvp__success-text">
                      <p className="rs-fr">Merci de nous avoir informés.</p>
                      <p className="rs-en">Thank you for letting us know.</p>
                    </div>
                    <div className="rsvp__success-sub">
                      <p className="rs-fr">
                        Nous sommes désolés que vous ne puissiez pas être des
                        nôtres. Vous serez dans nos pensées ce jour-là.
                      </p>
                      <p className="rs-en">
                        We're sorry you won't be able to make it. You'll be in
                        our thoughts on the day.
                      </p>
                    </div>
                  </>
                )}
                <button
                  className="btn btn-outline rsvp__reset"
                  onClick={() => setSubmitted(false)}
                >
                  Nouvelle confirmation / Submit another RSVP
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
