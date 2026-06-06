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

        {/* Contact block — for guests who need help with their RSVP, code, etc. */}
        <div className="footer__contact-wrap">
          <p className="footer__contact-intro footer__contact-intro--fr">
            Pour plus d'informations, veuillez contacter
          </p>
          <p className="footer__contact-intro footer__contact-intro--en">
            For more information, please contact
          </p>
          <ul className="footer__contact-list">
            <li>
              <span className="footer__contact-name">Br Arthur</span>
              <a className="footer__contact-phone" href="tel:+27795293393">+27 79 529 3393</a>
            </li>
            <li>
              <span className="footer__contact-name">Br Joel</span>
              <a className="footer__contact-phone" href="tel:+27823858565">+27 82 385 8565</a>
            </li>
          </ul>
        </div>

        <p className="footer__copy">© 2026 Yves &amp; Grace. Tous droits réservés. / All rights reserved.</p>
      </div>
    </footer>
  );
}
