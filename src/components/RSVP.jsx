import { useState, useRef, useCallback } from 'react';
import {
  collection, getDocs, doc, getDoc, updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { showNotification } from './Notification.jsx';
import './RSVP.css';

const RSVP_DEADLINE = '20 September 2026';

// Debounce helper
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export default function RSVP() {
  const [query,        setQuery]        = useState('');
  const [results,      setResults]      = useState([]);
  const [showResults,  setShowResults]  = useState(false);
  const [currentGuest, setCurrentGuest] = useState(null);
  const [submitted,    setSubmitted]    = useState(false);
  const [submittedYes, setSubmittedYes] = useState(false);
  const [loading,      setLoading]      = useState(false);

  const allGuestsRef  = useRef([]);
  const loadedRef     = useRef(false);

  // Load full guest list once on first search keystroke
  const ensureGuestsLoaded = async () => {
    if (loadedRef.current) return;
    const snap = await getDocs(collection(db, 'guests'));
    allGuestsRef.current = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    loadedRef.current = true;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const search = useCallback(
    debounce(async (term) => {
      if (term.length < 1) { setResults([]); setShowResults(false); return; }
      await ensureGuestsLoaded();
      const t = term.toLowerCase();
      const matches = allGuestsRef.current.filter(g => {
        const name  = (g.name  || '').toLowerCase();
        const terms = Array.isArray(g.searchTerms)
          ? g.searchTerms.join(' ').toLowerCase()
          : (g.searchTerms || '').toLowerCase();
        return name.includes(t) || terms.includes(t);
      }).slice(0, 8);
      setResults(matches);
      setShowResults(true);
    }, 300),
    []
  );

  const handleInput = (e) => {
    setQuery(e.target.value);
    setCurrentGuest(null);
    search(e.target.value.trim());
  };

  const selectGuest = async (guest) => {
    setLoading(true);
    try {
      // Fetch fresh data from Firestore
      const snap = await getDoc(doc(db, 'guests', guest.id));
      if (!snap.exists()) {
        showNotification('Guest not found. Please contact the couple.', 'error');
        return;
      }
      const fresh = { id: snap.id, ...snap.data() };
      setQuery(fresh.name);
      setShowResults(false);
      setResults([]);

      if (fresh.rsvp !== 'pending') {
        showNotification(
          `${fresh.name} has already submitted an RSVP. Contact the couple to make changes.`,
          'warning', 7000
        );
        return;
      }
      setCurrentGuest(fresh);
    } catch {
      showNotification('Could not load guest. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const submitRSVP = async (attending) => {
    if (!currentGuest) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'guests', currentGuest.id), {
        rsvp:        attending ? 'attending' : 'not_attending',
        lastUpdated: serverTimestamp(),
      });
      setSubmittedYes(attending);
      setSubmitted(true);
      setCurrentGuest(null);
      setQuery('');
    } catch {
      showNotification('Failed to submit RSVP. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="rsvp" className="rsvp section">
      <div className="container">
        <h2 className="section-title">RSVP</h2>

        <div className="rsvp__wrap">
          {/* Instructions */}
          <div className="rsvp__instructions">
            <h3>How to RSVP</h3>
            <ol className="rsvp__steps">
              <li>Search for your name below exactly as written on your invitation.</li>
              <li>Select your name from the list.</li>
              <li>Confirm whether you will be attending.</li>
            </ol>
            <div className="rsvp__deadline">
              <span className="rsvp__deadline-label">RSVP Deadline</span>
              <span className="rsvp__deadline-date">{RSVP_DEADLINE}</span>
            </div>
          </div>

          {/* Form */}
          <div className="rsvp__form card">
            {!submitted ? (
              <>
                <h3>Find Your Invitation</h3>
                <p className="rsvp__sub">
                  Enter your name exactly as it appears on your invitation.
                </p>

                <div className="rsvp__search-wrap">
                  <input
                    className="rsvp__input"
                    type="text"
                    placeholder="Search your name…"
                    value={query}
                    onChange={handleInput}
                    autoComplete="off"
                    disabled={loading}
                  />
                  {showResults && (
                    <ul className="rsvp__results">
                      {results.length === 0 ? (
                        <li className="rsvp__no-result">
                          No match found. Check spelling or contact the couple.
                        </li>
                      ) : (
                        results.map(g => (
                          <li
                            key={g.id}
                            className="rsvp__result-item"
                            onClick={() => selectGuest(g)}
                          >
                            {g.name}
                            {g.partySize > 1 && (
                              <span className="rsvp__party-size">
                                Party of {g.partySize}
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
                    <p className="rsvp__greeting">
                      Hello, <strong>{currentGuest.name}</strong>!
                    </p>
                    <p className="rsvp__question">
                      Will you be joining us on 03 October 2026?
                    </p>
                    <div className="rsvp__options">
                      <button
                        className="btn btn-primary rsvp__option"
                        onClick={() => submitRSVP(true)}
                        disabled={loading}
                      >
                        ✓ I'll be there!
                      </button>
                      <button
                        className="btn btn-outline rsvp__option"
                        onClick={() => submitRSVP(false)}
                        disabled={loading}
                      >
                        ✕ Regretfully decline
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
                    <h3>We'll see you there!</h3>
                    <p>
                      Your RSVP has been recorded. We can't wait to celebrate
                      with you on 03 October 2026.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="rsvp__success-icon">💌</div>
                    <h3>Thank you for letting us know.</h3>
                    <p>
                      We're sorry you won't be able to make it. You'll be in
                      our thoughts on the day.
                    </p>
                  </>
                )}
                <button
                  className="btn btn-outline rsvp__reset"
                  onClick={() => setSubmitted(false)}
                >
                  Submit another RSVP
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
