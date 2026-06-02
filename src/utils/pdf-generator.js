/**
 * pdf-generator — produces personalised invitation PDFs from a blank
 * background image + a guest record.
 *
 * Public API:
 *   generateOne(guest, lang)                  → triggers a single PDF download
 *   generateBulk(guests, lang, onProgress)    → triggers a ZIP download
 *   checkTemplatesAvailable()                 → { fr, en } booleans
 *
 * Approach: the design lives as a flat PNG (everything baked in except
 * the name + code). We build a fresh PDF page sized to the image, draw
 * the image full-bleed, then draw the name + code in Cinzel on top.
 */

import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

const BACKGROUNDS = {
  en: '/templates/invitation-bg-en.png',
  fr: '/templates/invitation-bg-fr.png',
};

const FONT_URL = '/fonts/Cinzel-VariableFont_wght.ttf';

// Brand colour from the design (#aa998f) in pdf-lib's 0–1 rgb space.
const TEXT_COLOR = rgb(0xaa / 255, 0x99 / 255, 0x8f / 255);

/**
 * Layout constants — all expressed as fractions of the background image
 * so the same numbers work regardless of export resolution.
 *
 * Origin: top-left, y grows downward (we flip to PDF coords at draw time).
 * Tune these visually until name + code sit perfectly in the card.
 */
const LAYOUT = {
  name: {
    centerX:  0.245,  // horizontal centre of the card
    centerY:  0.495,  // vertical position of the name line
    fontSize: 0.032,  // as fraction of image height
    maxWidth: 0.40,   // shrink-to-fit if name exceeds this width
  },
  code: {
    centerX:  0.245,
    centerY:  0.575,
    fontSize: 0.028,
    maxWidth: 0.40,
  },
};

/* ── Resource fetching with caching ─────────────────────────────────── */

const bgCache   = new Map();
const fontCache = new Map();

async function fetchBytes(url, cache) {
  if (cache.has(url)) return cache.get(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);
  const buf = await res.arrayBuffer();
  cache.set(url, buf);
  return buf;
}

/* ── Background availability check ──────────────────────────────────── */

export async function checkTemplatesAvailable() {
  const result = {};
  for (const [lang, url] of Object.entries(BACKGROUNDS)) {
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
  const bgUrl   = BACKGROUNDS[lang];
  const bgBuf   = await fetchBytes(bgUrl, bgCache);
  const fontBuf = await fetchBytes(FONT_URL, fontCache);

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const bgImage = await pdfDoc.embedPng(bgBuf);
  const font    = await pdfDoc.embedFont(fontBuf, { subset: true });

  // Use the image's native dimensions as the page size (in PDF points).
  // For a 300 DPI export this gives a physically large but proportional
  // page; viewers scale to fit. Aspect ratio is preserved, no distortion.
  const pageW = bgImage.width;
  const pageH = bgImage.height;
  const page  = pdfDoc.addPage([pageW, pageH]);

  page.drawImage(bgImage, { x: 0, y: 0, width: pageW, height: pageH });

  drawCentered(page, font, guest.name?.toUpperCase() || '', LAYOUT.name, pageW, pageH);
  drawCentered(page, font, guest.inviteCode || '',         LAYOUT.code, pageW, pageH);

  return pdfDoc.save();
}

/**
 * Draws `text` horizontally centred on (centerX, centerY) using the
 * fractional LAYOUT spec. Auto-shrinks if the text exceeds maxWidth.
 */
function drawCentered(page, font, text, spec, pageW, pageH) {
  if (!text) return;
  const maxWidthPx = spec.maxWidth * pageW;
  let size = spec.fontSize * pageH;

  // Shrink-to-fit loop — pdf-lib gives exact width at a given size.
  let width = font.widthOfTextAtSize(text, size);
  while (width > maxWidthPx && size > 4) {
    size *= 0.95;
    width = font.widthOfTextAtSize(text, size);
  }

  const cx = spec.centerX * pageW;
  const cy = spec.centerY * pageH; // top-left origin
  // pdf-lib's drawText origin is the baseline. Convert (cx, cy) where cy
  // is the top-left-origin centre of the text into a PDF baseline.
  const ascent  = font.heightAtSize(size, { descender: false });
  const x = cx - width / 2;
  const y = pageH - cy - ascent / 2;

  page.drawText(text, { x, y, size, font, color: TEXT_COLOR });
}

/* ── Public: single guest ───────────────────────────────────────────── */

export async function generateOne(guest, lang) {
  if (!guest?.inviteCode) throw new Error(`${guest?.name || 'Guest'} has no invite code yet.`);
  const bytes = await buildOne(guest, lang);
  const filename = sanitiseFilename(`Invitation - ${guest.name} - ${guest.inviteCode}.pdf`);
  triggerDownload(bytes, filename, 'application/pdf');
}

/* ── Public: bulk ZIP ───────────────────────────────────────────────── */

export async function generateBulk(guests, lang, onProgress) {
  if (!guests?.length) throw new Error('No guests provided.');

  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();

  for (let i = 0; i < guests.length; i++) {
    const g = guests[i];
    if (!g.inviteCode) continue;
    onProgress?.({ current: i + 1, total: guests.length, name: g.name });
    try {
      const bytes = await buildOne(g, lang);
      zip.file(sanitiseFilename(`${g.inviteCode} - ${g.name}.pdf`), bytes);
    } catch (err) {
      console.error(`Failed to generate for ${g.name}:`, err);
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const dateStamp = new Date().toISOString().slice(0, 10);
  triggerDownload(blob, `invitations-${lang}-${dateStamp}.zip`, 'application/zip');
}

/* ── Helpers ────────────────────────────────────────────────────────── */

function sanitiseFilename(name) {
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
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
