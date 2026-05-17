import { BilSectionTitle } from './BilingualText.jsx';
import './Gifts.css';

export default function Gifts() {
  return (
    <section id="gifts" className="gifts section section-alt">
      <div className="container">
        <BilSectionTitle fr="Cadeaux" en="Gifts" />

        <div className="gifts__grid">
          {/* Cash envelopes */}
          <div className="gifts__card card">
            <div className="gifts__icon">💌</div>
            <div className="gifts__card-title">
              <p className="gifts__title--fr">Enveloppes de cadeaux en espèces</p>
              <p className="gifts__title--en">Cash Gift Envelopes</p>
            </div>
            <div className="gifts__body">
              <p className="gifts__body--fr">
                Nous apprécierions sincèrement les enveloppes comme forme de cadeau privilégiée.
              </p>
              <p className="gifts__body--en">
                We would sincerely appreciate envelopes as our preferred form of gifts.
              </p>
            </div>
          </div>

          {/* Bank transfer */}
          <div className="gifts__card card">
            <div className="gifts__icon">🏦</div>
            <div className="gifts__card-title">
              <p className="gifts__title--fr">Virement bancaire</p>
              <p className="gifts__title--en">Bank Transfer</p>
            </div>
            <div className="gifts__body">
              <p className="gifts__body--fr">
                Pour ceux qui souhaiteraient nous faire parvenir leurs présents par virement bancaire,
                nous avons mis nos coordonnées bancaires ci-dessous à votre disposition.
              </p>
              <p className="gifts__body--en">
                For those who may wish to send us their gifts through a bank transfer, we have kindly
                provided our bank details below for your convenience.
              </p>
            </div>

            {/* Banking details — real account info */}
            <div className="gifts__bank-details">
              <div className="gifts__bank-row">
                <span className="gifts__bank-label">Titulaire / Account Holder</span>
                <span className="gifts__bank-value">Yves Nkolo</span>
              </div>
              <div className="gifts__bank-row">
                <span className="gifts__bank-label">Banque / Bank</span>
                <span className="gifts__bank-value">FNB — First National Bank</span>
              </div>
              <div className="gifts__bank-row">
                <span className="gifts__bank-label">Type de compte / Account Type</span>
                <span className="gifts__bank-value">Savings Account</span>
              </div>
              <div className="gifts__bank-row">
                <span className="gifts__bank-label">Numéro / Account No.</span>
                <span className="gifts__bank-value">63125399443</span>
              </div>
              <div className="gifts__bank-row">
                <span className="gifts__bank-label">Code guichet / Branch Code</span>
                <span className="gifts__bank-value">250655</span>
              </div>
              <div className="gifts__bank-row">
                <span className="gifts__bank-label">Référence / Reference</span>
                <span className="gifts__bank-value">Votre nom / Your name</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
