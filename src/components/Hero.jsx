import { BilPara } from './BilingualText.jsx';
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
        {/* Couple photo — replace src once supplied by the couple */}
        <div className="hero__photo-wrap">
          <div className="hero__photo-placeholder">
            <span>Yves &amp; Grace</span>
            <small>Photo à venir / Photo coming soon</small>
          </div>
        </div>

        {/* Pre-heading — French first */}
        <div className="hero__pre-wrap">
          <p className="hero__pre hero__pre--fr">
            Les familles Nkolo et Ntumba
          </p>
          <p className="hero__pre hero__pre--en">
            The families of Nkolo and Ntumba
          </p>
        </div>

        <h1 className="hero__names">Yves &amp; Grace</h1>

        {/* Tagline — bilingual stacked */}
        <div className="hero__tagline-wrap">
          <p className="hero__tagline hero__tagline--fr">
            ont l'honneur de vous inviter à venir célébrer leur mariage
          </p>
          <p className="hero__tagline hero__tagline--en">
            would be honoured by your presence as they celebrate their marriage
          </p>
        </div>

        <div className="hero__date-badge">
          <span className="hero__date">03 Octobre / October 2026</span>
          <span className="hero__dot">·</span>
          <span className="hero__location">Le Cap / Cape Town, Afrique du Sud / South Africa</span>
        </div>

        <a href="#rsvp" className="btn btn-primary hero__cta" onClick={handleRsvp}>
          Confirmer / RSVP
        </a>
      </div>

      <div className="hero__scroll-hint">
        <span>Défiler / Scroll</span>
        <div className="hero__scroll-line" />
      </div>
    </header>
  );
}
