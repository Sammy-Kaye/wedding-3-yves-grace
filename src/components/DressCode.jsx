import { BilSectionTitle } from './BilingualText.jsx';
import './DressCode.css';

export default function DressCode() {
  return (
    <section id="dress-code" className="dresscode section">
      <div className="container">
        <BilSectionTitle fr="Code Vestimentaire" en="Dress Code" />
        <div className="dresscode__inner">
          <div className="dresscode__icon">👗</div>
          <div className="dresscode__message-wrap">
            <p className="dresscode__message dresscode__message--fr">
              Nous vous prions de vous habiller décemment et modestement.
            </p>
            <p className="dresscode__message dresscode__message--en">
              We kindly ask all guests to dress decently and modestly.
            </p>
          </div>
          <div className="dresscode__detail-wrap">
            <p className="dresscode__detail dresscode__detail--fr">
              Tenue décontractée chic ou formelle appréciée.
            </p>
            <p className="dresscode__detail dresscode__detail--en">
              Smart casual or formal attire is appreciated.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
