import { useEffect, useState } from 'react';
import { BilSectionTitle } from './BilingualText.jsx';
import './Countdown.css';

const WEDDING_DATE = new Date('2026-10-03T10:00:00+02:00'); // SAST

const UNITS = [
  { fr: 'Jours',    en: 'Days',    key: 'days' },
  { fr: 'Heures',   en: 'Hours',   key: 'hours' },
  { fr: 'Minutes',  en: 'Minutes', key: 'minutes' },
  { fr: 'Secondes', en: 'Seconds', key: 'seconds' },
];

function getTimeLeft() {
  const diff = WEDDING_DATE - Date.now();
  if (diff <= 0) return null;
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="countdown section section-alt" id="countdown">
      <div className="container">
        <BilSectionTitle fr="Compte à Rebours" en="Counting Down" />
        {timeLeft ? (
          <div className="countdown__grid">
            {UNITS.map(({ fr, en, key }) => (
              <div className="countdown__unit" key={key}>
                <span className="countdown__number">
                  {String(timeLeft[key]).padStart(2, '0')}
                </span>
                <span className="countdown__label countdown__label--fr">{fr}</span>
                <span className="countdown__label countdown__label--en">{en}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="countdown__done-wrap">
            <p className="countdown__done countdown__done--fr">
              Le grand jour est arrivé — célébrons !
            </p>
            <p className="countdown__done countdown__done--en">
              The wedding day is here — celebrate!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
