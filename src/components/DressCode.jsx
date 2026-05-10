import './DressCode.css';

export default function DressCode() {
  return (
    <section id="dress-code" className="dresscode section">
      <div className="container">
        <h2 className="section-title">Dress Code</h2>
        <div className="dresscode__inner">
          <div className="dresscode__icon">👗</div>
          <p className="dresscode__message">
            We kindly ask all guests to dress decently and modestly.
          </p>
          <p className="dresscode__detail">
            Smart casual or formal attire is appreciated.
          </p>
        </div>
      </div>
    </section>
  );
}
