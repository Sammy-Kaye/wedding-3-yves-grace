import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BilInline } from './BilingualText.jsx';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const handleAnchor = (e, id) => {
    e.preventDefault();
    closeMenu();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        <div className="navbar__logo">Y &amp; G</div>

        <ul className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          <li>
            <a href="#ceremony" onClick={e => handleAnchor(e, 'ceremony')}>
              <BilInline fr="Cérémonie" en="Ceremony" />
            </a>
          </li>
          <li>
            <a href="#reception" onClick={e => handleAnchor(e, 'reception')}>
              <BilInline fr="Réception" en="Reception" />
            </a>
          </li>
          <li>
            <a href="#rsvp" onClick={e => handleAnchor(e, 'rsvp')}>
              RSVP
            </a>
          </li>
          <li>
            <a href="#gifts" onClick={e => handleAnchor(e, 'gifts')}>
              <BilInline fr="Cadeaux" en="Gifts" />
            </a>
          </li>
          <li>
            <Link to="/admin" className="navbar__admin-link" onClick={closeMenu}>
              🔒
            </Link>
          </li>
        </ul>

        <button
          className={`navbar__burger ${menuOpen ? 'navbar__burger--open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
