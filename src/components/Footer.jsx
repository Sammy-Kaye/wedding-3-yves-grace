import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__monogram">Y &amp; G</div>
        <p className="footer__names">Yves Nkolo &amp; Grace Ntumba</p>
        <p className="footer__date">03 Octobre / October 2026 · Le Cap / Cape Town, Afrique du Sud / South Africa</p>

        <div className="footer__closing-wrap">
          <p className="footer__closing footer__closing--fr">
            Avec amour et gratitude, nous nous réjouissons de vous accueillir.
          </p>
          <p className="footer__closing footer__closing--en">
            With love and gratitude, we look forward to celebrating with you.
          </p>
        </div>

        <p className="footer__copy">© 2026 Yves &amp; Grace. Tous droits réservés. / All rights reserved.</p>
      </div>
    </footer>
  );
}
