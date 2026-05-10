import './Gifts.css';

export default function Gifts() {
  return (
    <section id="gifts" className="gifts section section-alt">
      <div className="container">
        <h2 className="section-title">Gifts</h2>

        <div className="gifts__grid">
          {/* Cash envelopes */}
          <div className="gifts__card card">
            <div className="gifts__icon">💌</div>
            <h3>Cash Gift Envelopes</h3>
            <p>
              If you would like to bless us with a cash gift, envelopes will be
              available at the reception venue on the day.
            </p>
          </div>

          {/* Bank transfer */}
          <div className="gifts__card card">
            <div className="gifts__icon">🏦</div>
            <h3>Bank Transfer</h3>
            <p className="gifts__bank-note">
              You are also welcome to transfer a gift directly to our account:
            </p>

            {/* Banking details placeholder — replace with real details when supplied */}
            <div className="gifts__bank-details gifts__bank-details--placeholder">
              <div className="gifts__bank-row">
                <span className="gifts__bank-label">Account Holder</span>
                <span className="gifts__bank-value gifts__placeholder-text">To be confirmed</span>
              </div>
              <div className="gifts__bank-row">
                <span className="gifts__bank-label">Bank</span>
                <span className="gifts__bank-value gifts__placeholder-text">To be confirmed</span>
              </div>
              <div className="gifts__bank-row">
                <span className="gifts__bank-label">Account Number</span>
                <span className="gifts__bank-value gifts__placeholder-text">To be confirmed</span>
              </div>
              <div className="gifts__bank-row">
                <span className="gifts__bank-label">Branch Code</span>
                <span className="gifts__bank-value gifts__placeholder-text">To be confirmed</span>
              </div>
              <div className="gifts__bank-row">
                <span className="gifts__bank-label">Account Type</span>
                <span className="gifts__bank-value gifts__placeholder-text">To be confirmed</span>
              </div>
              <div className="gifts__bank-row">
                <span className="gifts__bank-label">Reference</span>
                <span className="gifts__bank-value">Your name</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
