import { useEffect, useState } from 'react';
import './InviteeName.css';

// Reads ?name=John+and+Jane from the URL and displays a personalised greeting.
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
        <p className="invitee__dear">Dear</p>
        <h2 className="invitee__name">{name}</h2>
        <p className="invitee__message">
          The families of Nkolo and Ntumba would like to invite you to come and
          celebrate their son Yves Nkolo and daughter Grace Ntumba, and would be
          honoured by your presence.
        </p>
        <div className="invitee__decoration">✦</div>
      </div>
    </section>
  );
}
