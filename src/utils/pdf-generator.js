/**
 * pdf-generator — produces personalised invitation PDFs from a blank
 * template + a guest record.
 *
 * Public API:
 *   generateOne(guest, lang)                  → triggers a single PDF download
 *   generateBulk(guests, lang, onProgress)    → triggers a ZIP download
 *
 * All work runs client-side in the browser. Lazy-imported so pdf-lib /
 * fontkit weight never reaches the public site bundle.
 *
 * Coordinate logic relies on pdf-markers.js to find {{NAME}}/{{CODE}}
 * positions in the template. Fonts (CormorantGaramond) are bundled in
 * public/fonts/ and embedded so French accents + special chars render.
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { locateMarkers } from './pdf-markers.js';

const TEMPLATES = {
  fr: '/templates/invitation-fr.pdf',
  en: '/templates/invitation-en.pdf',
};

const FONTS = {
  italic:  '/fonts/CormorantGaramond-Italic.ttf',
  regular: '/fonts/CormorantGaramond-Regular.ttf',
};

/* ── Resource fetching with caching ─────────────────────────────────── */

const templateCache = new Map();
const fontCache     = new Map();

async function fetchBytes(url, cache) {
  if (cache.has(url)) return cache.get(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);
  const buf = await res.arrayBuffer();
  cache.set(url, buf);
  return buf;
}

/* ── Template availability check ────────────────────────────────────── */

/**
 * Returns { fr: boolean, en: boolean } indicating whether each template
 * file currently exists in /public. Used by the modal to show a clear
 * "templates not uploaded yet" state when the client hasn't dropped them
 * in yet.
 */
export async function checkTemplatesAvailable() {
  const result = {};
  for (const [lang, url] of Object.entries(TEMPLATES)) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      result[lang] = res.ok;
    } catch {
      result[lang] = false;
    }
  }
  return result;
}

/* ── Core: build one personalised PDF as Uint8Array ─────────────────── */

async function buildOne(guest, lang) {
  const templateUrl  = TEMPLATES[lang];
  const templateBuf  = await fetchBytes(templateUrl, templateCache);
  const markers      = await locateMarkers(templateUrl);

  // Load the template fresh each time — pdf-lib mutates the document so
  // we can't reuse a single PDFDocument across guests.
  const pdfDoc = await PDFDocument.load(templateBuf);
  pdfDoc.registerFontkit(fontkit);

  // Embed Cormorant if available; fall back to Helvetica if a font is
  // missing — we'd rather produce a working PDF than crash mid-batch.
  let italicFont, regularFont;
  try {
    const italicBuf  = await fetchBytes(FONTS.italic, fontCache);
    italicFont       = await pdfDoc.embedFont(italicBuf, { subset: true });
  } catch {
    italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  }
  try {
    const regularBuf = await fetchBytes(FONTS.regular, fontCache);
    regularFont      = await pdfDoc.embedFont(regularBuf, { subset: true });
  } catch {
    regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  }

  const page = pdfDoc.getPage(markers.name.pageIndex);

  // For each marker: white-out the placeholder visible in the template,
  // then draw the real value at the same baseline / size.
  const overwrite = (marker, text, font) => {
    // Tiny padding around the marker so we definitely cover the glyphs
    const pad = Math.max(2, marker.fontSize * 0.15);
    page.drawRectangle({
      x:      marker.x - pad,
      y:      marker.y - pad,
      width:  marker.width  + pad * 2,
      height: marker.height + pad * 2,
      color:  rgb(1, 1, 1),
    });
    page.drawText(text, {
      x:    marker.x,
      y:    marker.y,
      size: marker.fontSize,
      font,
      color: rgb(0.24, 0.21, 0.19), // matches site --charcoal in PDF gamma
    });
  };

  overwrite(markers.name, guest.name,        italicFont);
  overwrite(markers.code, guest.inviteCode,  regularFont);

  return pdfDoc.save();
}

/* ── Public: single guest ───────────────────────────────────────────── */

/**
 * Generates and triggers a download of a single guest's invitation.
 *
 * @param {object} guest    Firestore guest record (must have `name`, `inviteCode`)
 * @param {'fr'|'en'} lang
 */
export async function generateOne(guest, lang) {
  if (!guest?.inviteCode) throw new Error(`${guest?.name || 'Guest'} has no invite code yet.`);
  const bytes = await buildOne(guest, lang);
  const filename = sanitiseFilename(`Invitation - ${guest.name} - ${guest.inviteCode}.pdf`);
  triggerDownload(bytes, filename, 'application/pdf');
}

/* ── Public: bulk ZIP ───────────────────────────────────────────────── */

/**
 * Generates a ZIP archive of all given guests' invitations.
 *
 * @param {Array}  guests       List of guest records to generate for
 * @param {'fr'|'en'} lang
 * @param {Function?} onProgress Called as ({ current, total, name }) for each guest
 */
export async function generateBulk(guests, lang, onProgress) {
  if (!guests?.length) throw new Error('No guests provided.');

  // jszip is heavy — only pull it in when we actually need it
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();

  for (let i = 0; i < guests.length; i++) {
    const g = guests[i];
    if (!g.inviteCode) continue; // skip guests with no code yet
    onProgress?.({ current: i + 1, total: guests.length, name: g.name });
    try {
      const bytes = await buildOne(g, lang);
      zip.file(sanitiseFilename(`${g.inviteCode} - ${g.name}.pdf`), bytes);
    } catch (err) {
      console.error(`Failed to generate for ${g.name}:`, err);
      // Keep going — one bad guest shouldn't sink the whole batch
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const dateStamp = new Date().toISOString().slice(0, 10);
  triggerDownload(blob, `invitations-${lang}-${dateStamp}.zip`, 'application/zip');
}

/* ── Helpers ────────────────────────────────────────────────────────── */

function sanitiseFilename(name) {
  // Strip characters that Windows / macOS reject in filenames
  return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '').trim();
}

function triggerDownload(data, filename, mimeType) {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Defer revoke so the browser actually gets the click event
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
