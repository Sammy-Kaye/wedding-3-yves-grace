// Shared toast notification component
// Usage: import { showNotification } from './Notification'
//        showNotification('Message', 'success' | 'error' | 'warning' | 'info')

const COLOURS = {
  success: '#7A9A74',
  error:   '#dc3545',
  warning: '#e0a020',
  info:    '#C9A0A0',
};

export function showNotification(message, type = 'info', duration = 5000) {
  let container = document.getElementById('notification-root');
  if (!container) return;

  const el = document.createElement('div');
  el.style.cssText = `
    background: ${COLOURS[type] || COLOURS.info};
    color: #fff;
    padding: 14px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-family: 'Montserrat', sans-serif;
    font-size: 13px;
    line-height: 1.5;
    pointer-events: all;
    animation: slideInRight 0.3s ease forwards;
    min-width: 260px;
  `;

  const text = document.createElement('span');
  text.textContent = message;
  el.appendChild(text);

  const close = document.createElement('button');
  close.innerHTML = '&times;';
  close.style.cssText = `
    background: none; border: none; color: #fff;
    font-size: 20px; cursor: pointer; padding: 0; line-height: 1; opacity: 0.85;
  `;
  close.onclick = () => remove(el);
  el.appendChild(close);

  container.appendChild(el);

  if (duration > 0) setTimeout(() => remove(el), duration);
}

function remove(el) {
  if (!el || !el.parentNode) return;
  el.style.animation = 'slideOutRight 0.3s ease forwards';
  setTimeout(() => el.parentNode?.removeChild(el), 300);
}

export default function NotificationRoot() {
  return <div id="notification-root" />;
}
