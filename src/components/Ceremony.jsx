import './Venues.css';

const CHURCH_MAP_SRC =
  'https://www.google.com/maps?q=39+Die+Villiers+Street,+Parow+Valley,+Cape+Town&output=embed';
const CHURCH_MAPS_LINK =
  'https://maps.google.com/?q=39+Die+Villiers+Street,+Parow+Valley,+Cape+Town';

export default function Ceremony() {
  return (
    <section id="ceremony" className="venue section">
      <div className="container">
        <h2 className="section-title">Church Consecration</h2>

        <div className="venue__layout">
          {/* Details */}
          <div className="venue__details card">
            <div className="venue__icon">⛪</div>
            <h3 className="venue__name">Capetown Christian Tabernacle</h3>

            <ul className="venue__info-list">
              <li>
                <span className="venue__info-label">Address</span>
                <span>39 Die Villiers Street, Parow Valley, Cape Town</span>
              </li>
              <li>
                <span className="venue__info-label">Date</span>
                <span>Saturday, 03 October 2026</span>
              </li>
              <li>
                <span className="venue__info-label">Time</span>
                <span>10:00 AM</span>
              </li>
            </ul>

            <div className="venue__notice">
              <span className="venue__notice-icon">🕙</span>
              <p>
                Please arrive promptly. The service will begin at{' '}
                <strong>10:00 AM</strong>.
              </p>
            </div>

            <a
              href={CHURCH_MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline venue__directions-btn"
            >
              📍 Get Directions
            </a>
          </div>

          {/* Map */}
          <div className="venue__map-wrap">
            <iframe
              title="Church venue map"
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
