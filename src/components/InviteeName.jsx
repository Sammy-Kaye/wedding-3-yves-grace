import { useEffect, useState } from 'react';
import './InviteeName.css';

// Reads ?name=Jean+et+Marie from the URL and displays a personalised greeting.
// If no name param is present, the section is hidden.
export default function InviteeName() {
  const [name, setName] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('name');
    if (raw) setName(decodeURIComponent(raw.replace(/\+/g, ' ')));
  }, []);

  if (!name) return null;

  return (
    <section className="invitee section section-alt">
      <div className="container invitee__inner">
        <div className="invitee__decoration">✦</div>

        {/* Dear / Cher·e — French first */}
        <div className="invitee__dear-wrap">
          <p className="invitee__dear invitee__dear--fr">Cher·e</p>
          <p className="invitee__dear invitee__dear--en">Dear</p>
        </div>

        <h2 className="invitee__name">{name}</h2>

        {/* Invitation message — French first */}
        <div className="invitee__message-wrap">
          <p className="invitee__message invitee__message--fr">
            Les familles Nkolo et Ntumba ont l'honneur de vous inviter à venir
            célébrer le mariage de leur fils Yves Nkolo et de leur fille Grace
            Ntumba, et seraient honorés de votre présence.
          </p>
          <p className="invitee__message invitee__message--en">
            The families of Nkolo and Ntumba would like to invite you to come
            and celebrate their son Yves Nkolo and daughter Grace Ntumba, and
            would be honoured by your presence.
          </p>
        </div>

        <div className="invitee__decoration">✦</div>
      </div>
    </section>
  );
}
