import './Venues.css';

const RECEPTION_MAP_SRC =
  'https://www.google.com/maps?q=Kirstenbosch+National+Botanical+Garden,+Rhodes+Drive,+Newlands,+Cape+Town&output=embed';
const RECEPTION_MAPS_LINK =
  'https://maps.google.com/?q=Kirstenbosch+National+Botanical+Garden,+Rhodes+Drive,+Newlands,+Cape+Town';

export default function Reception() {
  return (
    <section id="reception" className="venue section section-alt">
      <div className="container">
        <h2 className="section-title">Reception</h2>

        <div className="venue__layout venue__layout--reversed">
          {/* Map */}
          <div className="venue__map-wrap">
            <iframe
              title="Reception venue map"
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
                <span className="venue__info-label">Address</span>
                <span>Rhodes Drive, Newlands, Cape Town, 7735</span>
              </li>
              <li>
                <span className="venue__info-label">Date</span>
                <span>Saturday, 03 October 2026</span>
              </li>
              <li>
                <span className="venue__info-label">Arrival</span>
                <span>15:30 (3:30 PM)</span>
              </li>
              <li>
                <span className="venue__info-label">End time</span>
                <span>No later than 19:30 (7:30 PM)</span>
              </li>
            </ul>

            <div className="venue__notice">
              <span className="venue__notice-icon">🕞</span>
              <p>
                Please arrive on time. The reception begins at{' '}
                <strong>15:30</strong>.
              </p>
            </div>

            <div className="venue__notice venue__notice--soft">
              <span className="venue__notice-icon">🚫</span>
              <p>
                Kindly note that this is an <strong>adults-only</strong>{' '}
                reception. We appreciate your understanding.
              </p>
            </div>

            <a
              href={RECEPTION_MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline venue__directions-btn"
            >
              📍 Get Directions
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
