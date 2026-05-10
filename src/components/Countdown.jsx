import { useEffect, useState } from 'react';
import './Countdown.css';

const WEDDING_DATE = new Date('2026-10-03T10:00:00+02:00'); // SAST

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
        <h2 className="section-title">Counting Down</h2>
        {timeLeft ? (
          <div className="countdown__grid">
            {[
              { label: 'Days',    value: timeLeft.days },
              { label: 'Hours',   value: timeLeft.hours },
              { label: 'Minutes', value: timeLeft.minutes },
              { label: 'Seconds', value: timeLeft.seconds },
            ].map(({ label, value }) => (
              <div className="countdown__unit" key={label}>
                <span className="countdown__number">
                  {String(value).padStart(2, '0')}
                </span>
                <span className="countdown__label">{label}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="countdown__done">
            The wedding day has arrived — celebrate!
          </p>
        )}
      </div>
    </section>
  );
}
