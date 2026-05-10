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
                Si vous souhaitez nous offrir un cadeau en espèces, des enveloppes
                seront disponibles au lieu de la réception le jour J.
              </p>
              <p className="gifts__body--en">
                If you would like to bless us with a cash gift, envelopes will be
                available at the reception venue on the day.
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
                Vous pouvez également nous faire parvenir un cadeau directement
                sur notre compte :
              </p>
              <p className="gifts__body--en">
                You are also welcome to transfer a gift directly to our account:
              </p>
            </div>

            {/* Banking details — swap placeholder values once couple supplies them */}
            <div className="gifts__bank-details gifts__bank-details--placeholder">
              <div className="gifts__bank-row">
                <span className="gifts__bank-label">Titulaire / Account Holder</span>
                <span className="gifts__bank-value gifts__placeholder-text">À confirmer / To be confirmed</span>
              </div>
              <div className="gifts__bank-row">
                <span className="gifts__bank-label">Banque / Bank</span>
                <span className="gifts__bank-value gifts__placeholder-text">À confirmer / To be confirmed</span>
              </div>
              <div className="gifts__bank-row">
                <span className="gifts__bank-label">Numéro / Account No.</span>
                <span className="gifts__bank-value gifts__placeholder-text">À confirmer / To be confirmed</span>
              </div>
              <div className="gifts__bank-row">
                <span className="gifts__bank-label">Code guichet / Branch Code</span>
                <span className="gifts__bank-value gifts__placeholder-text">À confirmer / To be confirmed</span>
              </div>
              <div className="gifts__bank-row">
                <span className="gifts__bank-label">Type de compte / Account Type</span>
                <span className="gifts__bank-value gifts__placeholder-text">À confirmer / To be confirmed</span>
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
