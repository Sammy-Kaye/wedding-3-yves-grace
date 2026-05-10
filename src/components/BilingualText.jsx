// ============================================================
// BilingualText — French First, Same Priority
//
// French is displayed first in Cormorant Garamond (the site's
// heading/elegance font). English follows immediately below in
// Montserrat. Both are always visible — no toggle, no slider.
//
// Usage:
//   <BilHeading fr="Cérémonie" en="Ceremony" level={2} />
//   <BilPara fr="Texte français…" en="English text…" />
//   <BilInline fr="Cadeaux" en="Gifts" />   ← for nav/labels
// ============================================================

import './BilingualText.css';

/** Stacked heading — h2 / h3 etc. French italic serif, English small-caps sans. */
export function BilHeading({ fr, en, level = 2, className = '' }) {
  const Tag = `h${level}`;
  return (
    <div className={`bil-heading ${className}`}>
      <Tag className="bil-fr">{fr}</Tag>
      <span className="bil-en bil-en--heading">{en}</span>
    </div>
  );
}

/** Stacked paragraph — French then English. */
export function BilPara({ fr, en, className = '' }) {
  return (
    <div className={`bil-para ${className}`}>
      <p className="bil-fr bil-fr--para">{fr}</p>
      <p className="bil-en bil-en--para">{en}</p>
    </div>
  );
}

/** Inline "FR / EN" — for short labels, nav links, button text. */
export function BilInline({ fr, en }) {
  return (
    <span className="bil-inline">
      <span className="bil-fr">{fr}</span>
      <span className="bil-sep"> / </span>
      <span className="bil-en">{en}</span>
    </span>
  );
}

/** Section title with built-in ::after decorative line. */
export function BilSectionTitle({ fr, en }) {
  return (
    <div className="section-title bil-section-title">
      <BilHeading fr={fr} en={en} level={2} />
    </div>
  );
}
