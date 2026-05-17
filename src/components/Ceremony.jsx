import { BilSectionTitle, BilPara } from './BilingualText.jsx';
import './Venues.css';

const CHURCH_MAP_SRC =
  'https://www.google.com/maps?q=39+De+Villiers+Street,+Parow+Valley,+Cape+Town&output=embed';
const CHURCH_MAPS_LINK =
  'https://maps.google.com/?q=39+De+Villiers+Street,+Parow+Valley,+Cape+Town';

export default function Ceremony() {
  return (
    <section id="ceremony" className="venue section">
      <div className="container">
        <BilSectionTitle fr="Cérémonie Religieuse" en="Church Consecration" />

        <div className="venue__layout">
          {/* Details */}
          <div className="venue__details card">
            <div className="venue__icon">⛪</div>
            <h3 className="venue__name">Capetown Christian Tabernacle</h3>

            <ul className="venue__info-list">
              <li>
                <span className="venue__info-label">Adresse / Address</span>
                <span>39 De Villiers Street, Parow Valley, Cape Town</span>
              </li>
              <li>
                <span className="venue__info-label">Date</span>
                <span>Samedi / Saturday, 03 Octobre / October 2026</span>
              </li>
              <li>
                <span className="venue__info-label">Heure / Time</span>
                <span>10h00 / 10:00 AM</span>
              </li>
            </ul>

            <div className="venue__notice">
              <span className="venue__notice-icon">🕙</span>
              <BilPara
                fr="Veuillez arriver à l'heure. La cérémonie débutera à 10h00."
                en="Please arrive promptly. The service will begin at 10:00 AM."
              />
            </div>

            <a
              href={CHURCH_MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline venue__directions-btn"
            >
              📍 Obtenir l'itinéraire / Get Directions
            </a>
          </div>

          {/* Map */}
          <div className="venue__map-wrap">
            <iframe
              title="Lieu de la cérémonie / Church venue map"
              src={CHURCH_MAP_SRC}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
