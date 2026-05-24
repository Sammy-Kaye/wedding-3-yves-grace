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
        {/* Names — big, at the top */}
        <h1 className="hero__names">Yves &amp; Grace</h1>

        {/* Couple photo */}
        <div className="hero__photo-wrap">
          <img
            src="/images/couple.jpeg"
            alt="Yves Nkolo & Grace Ntumba"
            className="hero__photo"
          />
        </div>

        {/* Invitation text — French first, both always visible */}
        <div className="hero__tagline-wrap">
          <p className="hero__tagline hero__tagline--fr">
            Avec une immense joie et beaucoup d'amour, les familles Nkolo et Ntumba ont l'honneur
            de vous inviter à célébrer l'union de leur fils bien-aimé, Yves Nkolo, et de leur fille, Grace Ntumba.
          </p>
          <p className="hero__tagline hero__tagline--en">
            With immense joy and love, the families of Nkolo and Ntumba invite you to witness and celebrate
            the wedding of their beloved son, Yves Nkolo, and daughter, Grace Ntumba.
          </p>

          <p className="hero__tagline hero__tagline--fr hero__tagline--second">
            Venez partager avec nous cette merveilleuse célébration remplie d'amour, de bonheur et de précieux souvenirs.
          </p>
          <p className="hero__tagline hero__tagline--en">
            Join us as we celebrate this beautiful union and share in a day filled with love, happiness, and cherished memories.
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
