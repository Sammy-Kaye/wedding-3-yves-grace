import { BilSectionTitle, BilPara } from './BilingualText.jsx';
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
            <BilPara
              fr="Si vous souhaitez nous offrir un cadeau en espèces, des enveloppes seront disponibles au lieu de la réception le jour J."
              en="If you would like to bless us with a cash gift, envelopes will be available at the reception venue on the day."
            />
          </div>

          {/* Bank transfer */}
          <div className="gifts__card card">
            <div className="gifts__icon">🏦</div>
            <div className="gifts__card-title">
              <p className="gifts__title--fr">Virement bancaire</p>
              <p className="gifts__title--en">Bank Transfer</p>
            </div>
            <div className="gifts__bank-note-wrap">
              <p className="gifts__bank-note gifts__bank-note--fr">
                Vous pouvez également nous envoyer un cadeau directement sur notre compte :
              </p>
              <p className="gifts__bank-note gifts__bank-note--en">
                You are also welcome to transfer a gift directly to our account:
              </p>
            </div>

            {/* Banking details — replace placeholder text when details are supplied */}
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
                <span className="gifts__bank-label">Numéro de compte / Account No.</span>
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
