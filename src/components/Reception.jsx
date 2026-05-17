import { BilSectionTitle, BilPara } from './BilingualText.jsx';
import './Venues.css';

const RECEPTION_MAP_SRC =
  'https://www.google.com/maps?q=Kirstenbosch+National+Botanical+Garden,+Rhodes+Drive,+Newlands,+Cape+Town&output=embed';
const RECEPTION_MAPS_LINK =
  'https://maps.google.com/?q=Kirstenbosch+National+Botanical+Garden,+Rhodes+Drive,+Newlands,+Cape+Town';

export default function Reception() {
  return (
    <section id="reception" className="venue section section-alt">
      <div className="container">
        <BilSectionTitle fr="Réception" en="Reception" />

        <div className="venue__layout venue__layout--reversed">
          {/* Map */}
          <div className="venue__map-wrap">
            <iframe
              title="Lieu de la réception / Reception venue map"
              src={RECEPTION_MAP_SRC}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Details */}
          <div className="venue__details card">
            <div className="venue__icon">🌿</div>
            <h3 className="venue__name">Kirstenbosch National Botanical Garden</h3>

            <ul className="venue__info-list">
              <li>
                <span className="venue__info-label">Adresse / Address</span>
                <span>Rhodes Drive, Newlands, Cape Town, 7735</span>
              </li>
              <li>
                <span className="venue__info-label">Arrivée / Arrival</span>
                <span>15h30 (3:30 PM)</span>
              </li>
              <li>
                <span className="venue__info-label">Fin / End time</span>
                <span>Au plus tard 19h30 / No later than 7:30 PM</span>
              </li>
            </ul>

            <div className="venue__notice">
              <span className="venue__notice-icon">🕞</span>
              <BilPara
                fr="Veuillez arriver à l'heure. La réception commence à 15h30."
                en="Please arrive on time. The reception begins at 3:30 PM."
              />
            </div>

            <div className="venue__notice venue__notice--soft">
              <span className="venue__notice-icon">🚫</span>
              <BilPara
                fr="Veuillez noter qu'aucun enfant n'est autorisé à cette réception réservée aux adultes. Nous vous remercions de votre compréhension."
                en="Kindly note that No Kids are allowed as this is an adults-only reception. We appreciate your understanding."
              />
            </div>

            <a
              href={RECEPTION_MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline venue__directions-btn"
            >
              📍 Obtenir l'itinéraire / Get Directions
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
