import { useEffect, useState } from 'react';
import { showNotification } from './Notification.jsx';
import './PdfGenerationModal.css';

/**
 * PdfGenerationModal
 *
 * Two modes:
 *   - mode="single"  — `guest` is a single Firestore record. Picks language,
 *                       generates one PDF, closes.
 *   - mode="bulk"    — `guests` is the currently filtered list, `allGuests`
 *                       is the full list. Lets admin choose scope + language,
 *                       runs sequential generation with progress, downloads
 *                       a ZIP, closes.
 *
 * Lazy-imports the heavy PDF utilities so the admin route stays light
 * until the user actually opens this modal.
 */
export default function PdfGenerationModal({
  mode,            // 'single' | 'bulk'
  guest,           // required for single
  guests,          // for bulk — the currently filtered list
  allGuests,       // for bulk — the full list (for the "All" scope option)
  onClose,
}) {
  const [lang, setLang]                       = useState('fr');
  const [scope, setScope]                     = useState('filtered'); // bulk only
  const [templatesAvail, setTemplatesAvail]   = useState(null);       // null = checking
  const [busy, setBusy]                       = useState(false);
  const [progress, setProgress]               = useState(null);       // { current, total, name }
  const [error, setError]                     = useState('');

  // Block body scroll + ESC to close (only when idle)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = e => { if (e.key === 'Escape' && !busy) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [busy, onClose]);

  // Check template availability on open
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { checkTemplatesAvailable } = await import('../utils/pdf-generator.js');
        const result = await checkTemplatesAvailable();
        if (!cancelled) setTemplatesAvail(result);
      } catch (err) {
        console.error(err);
        if (!cancelled) setTemplatesAvail({ fr: false, en: false });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const bulkPool = scope === 'all' ? (allGuests || guests) : guests;

  const handleGenerate = async () => {
    setError('');
    setBusy(true);
    try {
      const { generateOne, generateBulk } = await import('../utils/pdf-generator.js');
      if (mode === 'single') {
        await generateOne(guest, lang);
        showNotification(`Generated invitation for ${guest.name}`, 'success', 3500);
        onClose();
      } else {
        await generateBulk(bulkPool, lang, setProgress);
        showNotification(`Generated ${bulkPool.length} invitations`, 'success', 4000);
        onClose();
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Generation failed. See console for details.');
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────
  const templatesChecking = templatesAvail === null;
  const langAvail         = templatesAvail?.[lang] ?? false;
  const canGenerate       = !busy && !templatesChecking && langAvail
                          && (mode === 'single' ? !!guest?.inviteCode : bulkPool?.length > 0);

  return (
    <div
      className="pdfgen-modal__overlay"
      role="dialog"
      aria-modal="true"
      onClick={() => !busy && onClose()}
    >
      <div className="pdfgen-modal__panel" onClick={e => e.stopPropagation()}>
        <button
          type="button"
          className="pdfgen-modal__close"
          onClick={() => !busy && onClose()}
          aria-label="Close"
          disabled={busy}
        >×</button>

        <h2 className="pdfgen-modal__title">
          {mode === 'single' ? 'Generate Invitation' : 'Generate Invitations'}
        </h2>

        {mode === 'single' && (
          <p className="pdfgen-modal__subtitle">
            For <strong>{guest?.name}</strong>
            {guest?.inviteCode && (
              <> · code <span className="pdfgen-modal__code">{guest.inviteCode}</span></>
            )}
          </p>
        )}
        {mode === 'bulk' && (
          <p className="pdfgen-modal__subtitle">
            Generating a personalised PDF for each guest, then bundling into one ZIP.
          </p>
        )}

        {/* Language picker */}
        <div className="pdfgen-modal__group">
          <label className="pdfgen-modal__label">Language</label>
          <div className="pdfgen-modal__choices">
            <button
              type="button"
              className={`pdfgen-choice ${lang === 'fr' ? 'is-active' : ''}`}
              onClick={() => setLang('fr')}
              disabled={busy}
            >
              <span className="pdfgen-choice__title">Français</span>
              <span className="pdfgen-choice__sub">French invitation</span>
              {templatesAvail && !templatesAvail.fr && (
                <span className="pdfgen-choice__missing">Template missing</span>
              )}
            </button>
            <button
              type="button"
              className={`pdfgen-choice ${lang === 'en' ? 'is-active' : ''}`}
              onClick={() => setLang('en')}
              disabled={busy}
            >
              <span className="pdfgen-choice__title">English</span>
              <span className="pdfgen-choice__sub">English invitation</span>
              {templatesAvail && !templatesAvail.en && (
                <span className="pdfgen-choice__missing">Template missing</span>
              )}
            </button>
          </div>
        </div>

        {/* Scope picker (bulk only) */}
        {mode === 'bulk' && (
          <div className="pdfgen-modal__group">
            <label className="pdfgen-modal__label">Who to generate for</label>
            <div className="pdfgen-modal__choices">
              <button
                type="button"
                className={`pdfgen-choice ${scope === 'filtered' ? 'is-active' : ''}`}
                onClick={() => setScope('filtered')}
                disabled={busy}
              >
                <span className="pdfgen-choice__title">Currently filtered</span>
                <span className="pdfgen-choice__sub">
                  {guests?.length || 0} guest{guests?.length === 1 ? '' : 's'}
                </span>
              </button>
              <button
                type="button"
                className={`pdfgen-choice ${scope === 'all' ? 'is-active' : ''}`}
                onClick={() => setScope('all')}
                disabled={busy}
              >
                <span className="pdfgen-choice__title">Every guest</span>
                <span className="pdfgen-choice__sub">
                  {(allGuests || guests)?.length || 0} guest{(allGuests || guests)?.length === 1 ? '' : 's'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* States */}
        {templatesChecking && (
          <p className="pdfgen-modal__hint">Checking templates…</p>
        )}

        {templatesAvail && !langAvail && (
          <div className="pdfgen-modal__warning">
            The {lang === 'fr' ? 'French' : 'English'} template hasn't been uploaded yet.
            Drop <code>invitation-{lang}.pdf</code> into <code>public/templates/</code> in the repo,
            redeploy, and try again.
          </div>
        )}

        {error && (
          <div className="pdfgen-modal__error">
            {error}
          </div>
        )}

        {/* Progress */}
        {progress && (
          <div className="pdfgen-modal__progress">
            <div className="pdfgen-modal__progress-bar">
              <div
                className="pdfgen-modal__progress-fill"
                style={{ width: `${Math.round((progress.current / progress.total) * 100)}%` }}
              />
            </div>
            <p className="pdfgen-modal__progress-text">
              {progress.current} / {progress.total} — {progress.name}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="pdfgen-modal__actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={!canGenerate}
          >
            {busy ? 'Generating…' : (mode === 'single' ? 'Download PDF' : 'Download ZIP')}
          </button>
        </div>
      </div>
    </div>
  );
}
