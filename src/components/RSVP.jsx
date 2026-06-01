import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config.js';
import { BilSectionTitle } from './BilingualText.jsx';
import { showNotification } from './Notification.jsx';
import './RSVP.css';

const RSVP_DEADLINE_FR = '20 Septembre 2026';
const RSVP_DEADLINE_EN = '20 September 2026';

/**
 * RSVP — code-based identity flow.
 *
 *  1. Guest receives a PDF invitation containing a 6-character code.
 *  2. They type the code into the input below.
 *  3. We query Firestore for a guest with that `inviteCode`. If found, a
 *     modal opens showing their name and asking attending / declining.
 *  4. Their selection updates the guest record. Success state appears.
 *
 * No name list is ever exposed — the only way to identify a guest is to
 * already hold their personal code.
 */
export default function RSVP() {
  const [code, setCode]                 = useState('');
  const [modalGuest, setModalGuest]     = useState(null);
  const [loading, setLoading]           = useState(false);
  const [submitted, setSubmitted]       = useState(false);
  const [submittedYes, setSubmittedYes] = useState(false);

  // ── Lookup ────────────────────────────────────────────────────────────
  const lookupCode = async (raw) => {
    const trimmed = (raw || '').trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'guests'),
        where('inviteCode', '==', trimmed),
        limit(1),
      );
      const snap = await getDocs(q);
      if (snap.empty) {
        showNotification(
          'Code introuvable. Vérifiez votre invitation. / Code not found. Please check your invitation.',
          'error',
          6000,
        );
        return;
      }
      const docSnap = snap.docs[0];
      const guest   = { id: docSnap.id, ...docSnap.data() };

      if (guest.rsvp && guest.rsvp !== 'pending') {
        showNotification(
          `Vous avez déjà répondu (${guest.name}). Contactez les mariés pour modifier. / You've already responded — contact the couple to change your response.`,
          'warning',
          8000,
        );
        return;
      }

      setModalGuest(guest);
    } catch (err) {
      console.error(err);
      showNotification(
        'Erreur réseau. Veuillez réessayer. / Network error. Please try again.',
        'error',
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────
  const submitRSVP = async (attending) => {
    if (!modalGuest) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'guests', modalGuest.id), {
        rsvp:        attending ? 'attending' : 'not_attending',
        lastUpdated: serverTimestamp(),
      });
      setSubmittedYes(attending);
      setSubmitted(true);
      setModalGuest(null);
      setCode('');
    } catch (err) {
      console.error(err);
      showNotification(
        'Échec de la soumission. Veuillez réessayer. / Failed to submit RSVP.',
        'error',
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Modal close (ESC + body scroll lock) ──────────────────────────────
  useEffect(() => {
    if (!modalGuest) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = e => { if (e.key === 'Escape') setModalGuest(null); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [modalGuest]);

  const onSubmit = (e) => {
    e.preventDefault();
    lookupCode(code);
  };

  // ── Common instructions panel — used in both live + preview ───────────
  const InstructionsPanel = () => (
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
            Trouvez votre code unique sur votre invitation.
          </span>
          <span className="step-en">
            Find your unique code on your invitation.
          </span>
        </li>
        <li>
          <span className="step-fr">
            Saisissez le code dans le champ ci-contre.
          </span>
          <span className="step-en">
            Enter the code in the field opposite.
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
        <span className="rsvp__deadline-label">Date limite / RSVP Deadline</span>
        <span className="rsvp__deadline-date--fr">{RSVP_DEADLINE_FR}</span>
        <span className="rsvp__deadline-date--en">{RSVP_DEADLINE_EN}</span>
      </div>
    </div>
  );

  // ── No Firebase: mock preview ─────────────────────────────────────────
  if (!isFirebaseConfigured) {
    return (
      <section id="rsvp" className="rsvp section">
        <div className="container">
          <BilSectionTitle fr="Confirmation de Présence" en="RSVP" />
          <div className="rsvp__wrap">
            <InstructionsPanel />
            <div className="rsvp__form card">
              <div className="rsvp__form-title">
                <p className="rsvp__form-title--fr">Votre code d'invitation</p>
                <p className="rsvp__form-title--en">Your Invitation Code</p>
              </div>
              <div className="rsvp__sub-wrap">
                <p className="rsvp__sub rsvp__sub--fr">
                  Saisissez le code à six caractères figurant sur votre invitation.
                </p>
                <p className="rsvp__sub rsvp__sub--en">
                  Enter the six-character code printed on your invitation.
                </p>
              </div>
              <div className="rsvp__code-wrap">
                <input
                  className="rsvp__input rsvp__input--code"
                  type="text"
                  placeholder="K7M2X9"
                  defaultValue="K7M2X9"
                  readOnly
                />
                <button className="btn btn-primary rsvp__submit">
                  Confirmer / Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── Live RSVP form ────────────────────────────────────────────────────
  return (
    <section id="rsvp" className="rsvp section">
      <div className="container">
        <BilSectionTitle fr="Confirmation de Présence" en="RSVP" />

        <div className="rsvp__wrap">
          <InstructionsPanel />

          <div className="rsvp__form card">
            {!submitted ? (
              <>
                <div className="rsvp__form-title">
                  <p className="rsvp__form-title--fr">Votre code d'invitation</p>
                  <p className="rsvp__form-title--en">Your Invitation Code</p>
                </div>
                <div className="rsvp__sub-wrap">
                  <p className="rsvp__sub rsvp__sub--fr">
                    Saisissez le code à six caractères figurant sur votre invitation.
                  </p>
                  <p className="rsvp__sub rsvp__sub--en">
                    Enter the six-character code printed on your invitation.
                  </p>
                </div>

                <form className="rsvp__code-wrap" onSubmit={onSubmit}>
                  <input
                    className="rsvp__input rsvp__input--code"
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck="false"
                    maxLength={8}
                    placeholder="K7M2X9"
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    disabled={loading}
                    aria-label="Invitation code"
                  />
                  <button
                    type="submit"
                    className="btn btn-primary rsvp__submit"
                    disabled={loading || code.trim().length < 4}
                  >
                    {loading ? '…' : 'Confirmer / Continue'}
                  </button>
                </form>
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
                  onClick={() => { setSubmitted(false); setCode(''); }}
                >
                  Nouvelle confirmation / Submit another RSVP
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Confirmation modal ─────────────────────────────────────────── */}
      {modalGuest && (
        <div
          className="rsvp-modal__overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => !loading && setModalGuest(null)}
        >
          <div
            className="rsvp-modal__panel"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              className="rsvp-modal__close"
              onClick={() => !loading && setModalGuest(null)}
              aria-label="Close"
            >
              ×
            </button>

            <p className="rsvp-modal__eyebrow">
              Code vérifié / Code verified
            </p>

            <div className="rsvp-modal__greeting">
              <p className="rsvp-modal__greeting--fr">
                Bonjour, <strong>{modalGuest.name}</strong>
              </p>
              <p className="rsvp-modal__greeting--en">
                Hello, <strong>{modalGuest.name}</strong>
              </p>
            </div>

            {modalGuest.partySize > 1 && (
              <p className="rsvp-modal__party">
                Groupe de {modalGuest.partySize} / Party of {modalGuest.partySize}
              </p>
            )}

            <div className="rsvp-modal__question">
              <p className="rsvp-modal__question--fr">
                Serez-vous présent(e) le 03 octobre 2026 ?
              </p>
              <p className="rsvp-modal__question--en">
                Will you be joining us on 03 October 2026?
              </p>
            </div>

            <div className="rsvp-modal__options">
              <button
                className="btn btn-primary rsvp-modal__option"
                onClick={() => submitRSVP(true)}
                disabled={loading}
              >
                ✓ Je serai présent(e) / I'll be there
              </button>
              <button
                className="btn btn-outline rsvp-modal__option"
                onClick={() => submitRSVP(false)}
                disabled={loading}
              >
                ✕ Je décline avec regret / Regretfully decline
              </button>
            </div>

            <p className="rsvp-modal__hint">
              Ce n'est pas vous ? Fermez et vérifiez votre code.<br />
              Not you? Close and check your code.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
