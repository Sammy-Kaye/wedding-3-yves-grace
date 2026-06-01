import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  collection, getDocs, doc, addDoc, updateDoc, deleteDoc,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged,
} from 'firebase/auth';
import { db, auth, isFirebaseConfigured } from '../firebase/config.js';
import { showNotification } from '../components/Notification.jsx';
import NotificationRoot from '../components/Notification.jsx';
import './Admin.css';

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateSearchTerms(name) {
  // Stores alternative name orderings so guests can search by first or last name
  const parts = name.trim().toLowerCase().split(/\s+/);
  const terms = new Set();
  terms.add(name.toLowerCase());
  parts.forEach(p => terms.add(p));
  // reversed e.g. "Grace Ntumba" → also "Ntumba Grace"
  if (parts.length > 1) terms.add([...parts].reverse().join(' '));
  return [...terms];
}

// 31-char alphabet — no I, L, O, 0, 1 (visually confusable in print)
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH   = 6;

function makeCode() {
  let s = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    s += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return s;
}

/**
 * Generate a code that doesn't collide with any code already used in the
 * given list of guests. Retries up to 50 times before giving up.
 */
function generateUniqueCode(existingGuests) {
  const used = new Set(existingGuests.map(g => g.inviteCode).filter(Boolean));
  for (let i = 0; i < 50; i++) {
    const code = makeCode();
    if (!used.has(code)) return code;
  }
  // Statistically impossible with a 6-char/31-char alphabet, but throw if so
  throw new Error('Could not find an unused invite code after 50 tries.');
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, colour }) {
  return (
    <div className="admin-stat" style={{ borderTopColor: colour }}>
      <span className="admin-stat__value">{value}</span>
      <span className="admin-stat__label">{label}</span>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="admin-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="admin-modal">
        <div className="admin-modal__header">
          <h2>{title}</h2>
          <button className="admin-modal__close" onClick={onClose}>×</button>
        </div>
        <div className="admin-modal__body">{children}</div>
      </div>
    </div>
  );
}

// ── Main Admin Component ──────────────────────────────────────────────────────

export default function Admin() {
  const [user,         setUser]         = useState(null);
  const [authLoading,  setAuthLoading]  = useState(true);
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [loginError,   setLoginError]   = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [guests,       setGuests]       = useState([]);
  const [dataLoading,  setDataLoading]  = useState(false);
  const [searchTerm,   setSearchTerm]   = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [showAddModal,  setShowAddModal]  = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGuest,  setEditingGuest]  = useState(null);

  // Form state
  const emptyForm = { name: '', email: '', partySize: 1, notes: '' };
  const [form, setForm] = useState(emptyForm);

  // ── Auth ────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (user) loadGuests();
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setLoginError('Incorrect email or password. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => signOut(auth);

  // ── Data ────────────────────────────────────────────────────────────────────

  const loadGuests = useCallback(async () => {
    setDataLoading(true);
    try {
      const q = query(collection(db, 'guests'), orderBy('name'));
      const snap = await getDocs(q);
      setGuests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      showNotification('Failed to load guests.', 'error');
    } finally {
      setDataLoading(false);
    }
  }, []);

  // ── CRUD ────────────────────────────────────────────────────────────────────

  const handleAddGuest = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return showNotification('Name is required.', 'warning');
    const partySize = parseInt(form.partySize, 10);
    if (isNaN(partySize) || partySize < 1)
      return showNotification('Party size must be at least 1.', 'warning');

    // Check for duplicate name
    if (guests.some(g => g.name.toLowerCase() === form.name.trim().toLowerCase())) {
      return showNotification('A guest with this name already exists.', 'warning');
    }

    try {
      const inviteCode = generateUniqueCode(guests);
      await addDoc(collection(db, 'guests'), {
        name:        form.name.trim(),
        email:       form.email.trim() || null,
        partySize,
        notes:       form.notes.trim() || null,
        searchTerms: generateSearchTerms(form.name.trim()),
        inviteCode,
        rsvp:        'pending',
        createdAt:   serverTimestamp(),
        lastUpdated: serverTimestamp(),
      });
      showNotification(`${form.name.trim()} added with code ${inviteCode}`, 'success', 6000);
      setForm(emptyForm);
      setShowAddModal(false);
      loadGuests();
    } catch {
      showNotification('Failed to add guest.', 'error');
    }
  };

  const openEdit = (guest) => {
    setEditingGuest(guest);
    setForm({
      name:      guest.name,
      email:     guest.email || '',
      partySize: guest.partySize || 1,
      notes:     guest.notes || '',
    });
    setShowEditModal(true);
  };

  const handleEditGuest = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return showNotification('Name is required.', 'warning');
    const partySize = parseInt(form.partySize, 10);
    if (isNaN(partySize) || partySize < 1)
      return showNotification('Party size must be at least 1.', 'warning');

    try {
      await updateDoc(doc(db, 'guests', editingGuest.id), {
        name:        form.name.trim(),
        email:       form.email.trim() || null,
        partySize,
        notes:       form.notes.trim() || null,
        searchTerms: generateSearchTerms(form.name.trim()),
        lastUpdated: serverTimestamp(),
      });
      showNotification('Guest updated.', 'success');
      setShowEditModal(false);
      setEditingGuest(null);
      setForm(emptyForm);
      loadGuests();
    } catch {
      showNotification('Failed to update guest.', 'error');
    }
  };

  const handleDeleteGuest = async (guest) => {
    if (!window.confirm(`Delete ${guest.name}? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, 'guests', guest.id));
      showNotification(`${guest.name} deleted.`, 'success');
      loadGuests();
    } catch {
      showNotification('Failed to delete guest.', 'error');
    }
  };

  const handleResetRsvp = async (guest) => {
    if (!window.confirm(`Reset RSVP for ${guest.name}? This will set them back to pending.`)) return;
    try {
      await updateDoc(doc(db, 'guests', guest.id), {
        rsvp:        'pending',
        lastUpdated: serverTimestamp(),
      });
      showNotification(`${guest.name}'s RSVP has been reset to pending.`, 'success');
      loadGuests();
    } catch {
      showNotification('Failed to reset RSVP.', 'error');
    }
  };

  // ── Export ──────────────────────────────────────────────────────────────────

  const escapeCsv = v => {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const downloadCsv = (rows, filename) => {
    const csv  = rows.map(r => r.map(escapeCsv).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  /** Full guest list with invite codes — for mail-merging into PDF invitations. */
  const exportAllWithCodes = () => {
    if (!guests.length) return showNotification('No guests to export.', 'warning');
    const rows = [
      ['Name', 'InviteCode', 'PartySize', 'Email', 'Status', 'Notes'],
      ...guests.map(g => [
        g.name,
        g.inviteCode || '',
        g.partySize || 1,
        g.email || '',
        g.rsvp || 'pending',
        g.notes || '',
      ]),
    ];
    downloadCsv(rows, 'wedding-guests-all.csv');
    showNotification('Exported all guests with codes', 'success');
  };

  /** Attending guests only — for catering / seating headcount. */
  const exportAttendingCSV = () => {
    const attending = guests.filter(g => g.rsvp === 'attending');
    if (!attending.length) return showNotification('No attending guests to export.', 'warning');
    const rows = [
      ['Name', 'Email', 'Party Size', 'Notes'],
      ...attending.map(g => [g.name, g.email || '', g.partySize || 1, g.notes || '']),
    ];
    downloadCsv(rows, 'wedding-guests-attending.csv');
    showNotification('Exported attending guests', 'success');
  };

  // ── Filtered guests list ────────────────────────────────────────────────────

  const filtered = guests.filter(g => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      g.name.toLowerCase().includes(term) ||
      (g.email || '').toLowerCase().includes(term) ||
      (g.inviteCode || '').toLowerCase().includes(term);
    const matchesFilter = filterStatus === 'all' || g.rsvp === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // ── Copy code to clipboard ──────────────────────────────────────────────────

  const copyCode = async (code) => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      showNotification(`Copied code ${code}`, 'success', 2000);
    } catch {
      showNotification('Could not copy. Please copy manually.', 'warning');
    }
  };

  // ── Stats ───────────────────────────────────────────────────────────────────

  const total       = guests.reduce((s, g) => s + (g.partySize || 1), 0);
  const attending   = guests.filter(g => g.rsvp === 'attending').reduce((s, g) => s + (g.partySize || 1), 0);
  const notAtt      = guests.filter(g => g.rsvp === 'not_attending').reduce((s, g) => s + (g.partySize || 1), 0);
  const pending     = guests.filter(g => g.rsvp === 'pending').reduce((s, g) => s + (g.partySize || 1), 0);

  // ── Shared form fields ──────────────────────────────────────────────────────

  const GuestForm = ({ onSubmit, submitLabel }) => (
    <form onSubmit={onSubmit} className="admin-form">
      <div className="admin-form__group">
        <label>Guest Name *</label>
        <input
          type="text" required
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Full name as it appears on the invite"
        />
      </div>
      <div className="admin-form__group">
        <label>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          placeholder="guest@email.com"
        />
      </div>
      <div className="admin-form__group">
        <label>Party Size *</label>
        <input
          type="number" required min="1"
          value={form.partySize}
          onChange={e => setForm(f => ({ ...f, partySize: e.target.value }))}
        />
      </div>
      <div className="admin-form__group">
        <label>Notes</label>
        <textarea
          rows={3}
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          placeholder="Optional notes…"
        />
      </div>
      <div className="admin-form__actions">
        <button type="submit" className="btn btn-primary">{submitLabel}</button>
      </div>
    </form>
  );

  // ── Status badge helper ──────────────────────────────────────────────────────

  const StatusBadge = ({ status }) => {
    const map = {
      attending:     { label: 'Attending',     cls: 'badge--attending' },
      not_attending: { label: 'Not Attending', cls: 'badge--not-attending' },
      pending:       { label: 'Pending',       cls: 'badge--pending' },
    };
    const { label, cls } = map[status] || map.pending;
    return <span className={`badge ${cls}`}>{label}</span>;
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  if (!isFirebaseConfigured) {
    return (
      <>
        <NotificationRoot />
        <div className="admin-login-page">
          <div className="admin-login-card">
            <Link to="/" className="admin-login-back">← Back to wedding site</Link>
            <h1>Admin Panel</h1>
            <p>Yves &amp; Grace — Wedding Dashboard</p>
            <div style={{ marginTop: 24, padding: '20px', background: 'var(--ivory)', borderRadius: 'var(--radius)', borderLeft: '3px solid var(--blush-deep)' }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.8 }}>
                <strong>Firebase not configured.</strong><br />
                Copy <code>.env.example</code> to <code>.env</code> and add your
                Firebase project credentials to enable the admin dashboard and RSVP system.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (authLoading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading__spinner" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <NotificationRoot />
        <div className="admin-login-page">
          <div className="admin-login-card">
            <Link to="/" className="admin-login-back">← Back to wedding site</Link>
            <h1>Admin Login</h1>
            <p>Yves &amp; Grace — Wedding Dashboard</p>
            <form onSubmit={handleLogin} className="admin-form">
              <div className="admin-form__group">
                <label>Email</label>
                <input
                  type="email" required autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@email.com"
                />
              </div>
              <div className="admin-form__group">
                <label>Password</label>
                <input
                  type="password" required autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              {loginError && <p className="admin-login-error">{loginError}</p>}
              <div className="admin-form__actions">
                <button type="submit" className="btn btn-primary" disabled={loginLoading}>
                  {loginLoading ? 'Logging in…' : 'Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NotificationRoot />
      <div className="admin-page">
        {/* Header */}
        <header className="admin-header">
          <div className="admin-header__inner">
            <div>
              <h1>Wedding Dashboard</h1>
              <p>Yves Nkolo &amp; Grace Ntumba · 03 October 2026</p>
            </div>
            <div className="admin-header__actions">
              <Link to="/" className="btn btn-outline btn-sm">View Site</Link>
              <button className="btn btn-sage btn-sm" onClick={loadGuests}>Refresh</button>
              <button className="btn btn-danger btn-sm" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </header>

        <div className="admin-body container">
          {/* Stats */}
          <div className="admin-stats">
            <StatCard label="Total Invited" value={total}     colour="var(--blush-deep)" />
            <StatCard label="Attending"     value={attending} colour="var(--sage-deep)" />
            <StatCard label="Not Attending" value={notAtt}    colour="#dc3545" />
            <StatCard label="Pending"       value={pending}   colour="#e0a020" />
          </div>

          {/* Toolbar */}
          <div className="admin-toolbar">
            <div className="admin-toolbar__left">
              <input
                className="admin-search"
                type="text"
                placeholder="Search by name, email, or code…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <select
                className="admin-filter"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="attending">Attending</option>
                <option value="not_attending">Not Attending</option>
              </select>
            </div>
            <div className="admin-toolbar__right">
              <button className="btn btn-primary btn-sm" onClick={() => { setForm(emptyForm); setShowAddModal(true); }}>
                + Add Guest
              </button>
              <button className="btn btn-sage btn-sm" onClick={exportAllWithCodes} title="Mail-merge source: every guest with their invite code">
                Export All
              </button>
              <button className="btn btn-outline btn-sm" onClick={exportAttendingCSV} title="Catering / seating headcount">
                Export Attending
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="admin-table-wrap">
            {dataLoading ? (
              <div className="admin-loading"><div className="admin-loading__spinner" /></div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Code</th>
                    <th>Email</th>
                    <th>Party</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="admin-table__empty">
                        {guests.length === 0 ? 'No guests yet. Add your first guest.' : 'No guests match your search.'}
                      </td>
                    </tr>
                  ) : (
                    filtered.map(g => (
                      <tr key={g.id}>
                        <td className="admin-table__name">{g.name}</td>
                        <td className="admin-table__code">
                          {g.inviteCode ? (
                            <button
                              className="admin-code-chip"
                              title="Click to copy"
                              onClick={() => copyCode(g.inviteCode)}
                            >
                              <span className="admin-code-chip__text">{g.inviteCode}</span>
                              <svg className="admin-code-chip__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                              </svg>
                            </button>
                          ) : (
                            <span className="admin-code-missing">—</span>
                          )}
                        </td>
                        <td className="admin-table__email">{g.email || '—'}</td>
                        <td style={{ textAlign: 'center' }}>{g.partySize || 1}</td>
                        <td><StatusBadge status={g.rsvp} /></td>
                        <td className="admin-table__date">
                          {g.lastUpdated?.toDate
                            ? new Date(g.lastUpdated.toDate()).toLocaleDateString('en-ZA')
                            : '—'}
                        </td>
                        <td>
                          <div className="admin-table__actions">
                            <button
                              className="admin-action-btn"
                              title="Edit / Modifier"
                              aria-label="Edit guest"
                              onClick={() => openEdit(g)}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              className="admin-action-btn"
                              title="Reset RSVP / Réinitialiser"
                              aria-label="Reset RSVP"
                              onClick={() => handleResetRsvp(g)}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <polyline points="1 4 1 10 7 10" />
                                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                              </svg>
                            </button>
                            <button
                              className="admin-action-btn admin-action-btn--danger"
                              title="Delete / Supprimer"
                              aria-label="Delete guest"
                              onClick={() => handleDeleteGuest(g)}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6M14 11v6" />
                                <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          <p className="admin-count">
            Showing {filtered.length} of {guests.length} guests
          </p>
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <Modal title="Add Guest" onClose={() => setShowAddModal(false)}>
            <GuestForm onSubmit={handleAddGuest} submitLabel="Add Guest" />
          </Modal>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <Modal title={`Edit — ${editingGuest?.name}`} onClose={() => setShowEditModal(false)}>
            <GuestForm onSubmit={handleEditGuest} submitLabel="Save Changes" />
          </Modal>
        )}
      </div>
    </>
  );
}
