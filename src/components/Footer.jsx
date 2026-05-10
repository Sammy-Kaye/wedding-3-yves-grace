import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__monogram">Y &amp; G</div>
        <p className="footer__names">Yves Nkolo &amp; Grace Ntumba</p>
        <p className="footer__date">03 October 2026 · Cape Town, South Africa</p>
        <p className="footer__closing">
          With love and gratitude, we look forward to celebrating with you.
        </p>
        <p className="footer__copy">© 2026 Yves &amp; Grace. All rights reserved.</p>
      </div>
    </footer>
  );
}
