import './Hero.css';

export default function Hero() {
  const handleRsvp = (e) => {
    e.preventDefault();
    document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header id="home" className="hero">
      <div className="hero__overlay" />

      <div className="hero__content fade-in">
        {/* Couple photo — replace src once supplied */}
        <div className="hero__photo-wrap">
          <div className="hero__photo-placeholder">
            <span>Yves &amp; Grace</span>
            <small>Photo coming soon</small>
          </div>
        </div>

        <p className="hero__pre">The families of Nkolo and Ntumba</p>
        <h1 className="hero__names">Yves &amp; Grace</h1>
        <p className="hero__tagline">
          would be honoured by your presence as they celebrate their marriage
        </p>

        <div className="hero__date-badge">
          <span className="hero__date">03 October 2026</span>
          <span className="hero__dot">·</span>
          <span className="hero__location">Cape Town, South Africa</span>
        </div>

        <a href="#rsvp" className="btn btn-primary hero__cta" onClick={handleRsvp}>
          RSVP
        </a>
      </div>

      <div className="hero__scroll-hint">
        <span>Scroll</span>
        <div className="hero__scroll-line" />
      </div>
    </header>
  );
}
