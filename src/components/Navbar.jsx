import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BilInline } from './BilingualText.jsx';
import './Navbar.css';

/**
 * Section IDs in the order they appear on the page.
 * Used by scroll-spy to know which nav link to highlight.
 * The first id that's currently in the viewport's top half wins.
 */
const SECTION_IDS = ['ceremony', 'reception', 'rsvp', 'gifts'];

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [activeId, setActiveId]     = useState('');

  // Scroll-spy: shrink navbar after 60px AND track which section is in view
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);

      // Pick the section closest to the top of the viewport (within 200px)
      const viewportAnchor = 200;
      let current = '';
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const { top } = el.getBoundingClientRect();
        if (top - viewportAnchor < 0) current = id;
      }
      setActiveId(current);
    };
    onScroll(); // run once on mount
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const handleAnchor = (e, id) => {
    e.preventDefault();
    closeMenu();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const isActive = id => activeId === id;

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        <a
          href="#home"
          className="navbar__logo"
          onClick={e => handleAnchor(e, 'home')}
          aria-label="Back to top"
        >
          Y <span className="navbar__logo-amp">&amp;</span> G
        </a>

        <ul className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          <li>
            <a
              href="#ceremony"
              className={isActive('ceremony') ? 'is-active' : ''}
              onClick={e => handleAnchor(e, 'ceremony')}
            >
              <BilInline fr="Cérémonie" en="Ceremony" />
            </a>
          </li>
          <li>
            <a
              href="#reception"
              className={isActive('reception') ? 'is-active' : ''}
              onClick={e => handleAnchor(e, 'reception')}
            >
              <BilInline fr="Réception" en="Reception" />
            </a>
          </li>
          <li>
            <a
              href="#rsvp"
              className={isActive('rsvp') ? 'is-active' : ''}
              onClick={e => handleAnchor(e, 'rsvp')}
            >
              RSVP
            </a>
          </li>
          <li>
            <a
              href="#gifts"
              className={isActive('gifts') ? 'is-active' : ''}
              onClick={e => handleAnchor(e, 'gifts')}
            >
              <BilInline fr="Cadeaux" en="Gifts" />
            </a>
          </li>
          <li>
            <Link to="/admin" className="navbar__admin-link" onClick={closeMenu} aria-label="Admin">
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
