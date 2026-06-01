/**
 * pdf-markers — locates {{NAME}} and {{CODE}} placeholders in an invitation
 * template using pdfjs-dist, returning the page/x/y/size/font info needed
 * to overwrite them with real text.
 *
 * Returns a promise resolving to:
 *   {
 *     name: { pageIndex, x, y, width, height, fontSize },
 *     code: { pageIndex, x, y, width, height, fontSize }
 *   }
 *
 * Cached per-URL — the same template will only be parsed once per session.
 *
 * Used by pdf-generator.js. Lazy-loaded — never imported by the public site.
 */

import * as pdfjsLib from 'pdfjs-dist';
// Vite serves the worker from node_modules with the ?url query param
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

const NAME_MARKER = '{{NAME}}';
const CODE_MARKER = '{{CODE}}';

// Module-level cache — first parse of each template URL is kept for reuse
const cache = new Map();

/**
 * Load a PDF template and find the {{NAME}} and {{CODE}} marker positions.
 *
 * @param {string} url — path to the template PDF (e.g. '/templates/invitation-fr.pdf')
 * @returns {Promise<{ name: Marker, code: Marker } | null>}
 *          null if the template fails to load (e.g. file doesn't exist).
 *          Throws if the template loads but the markers can't be found —
 *          that's a configuration error the user must see.
 */
export async function locateMarkers(url) {
  if (cache.has(url)) return cache.get(url);

  // Fetch the template — fail gracefully if it's not there yet
  const res = await fetch(url);
  if (!res.ok) return null;
  const buf = await res.arrayBuffer();

  const pdf  = await pdfjsLib.getDocument({ data: buf }).promise;
  const page = await pdf.getPage(1); // single-page invitations
  const viewport = page.getViewport({ scale: 1 });
  const content  = await page.getTextContent();

  const markers = { name: null, code: null };

  for (const item of content.items) {
    if (!item.str) continue;
    const trimmed = item.str.trim();

    // pdfjs gives us the transform matrix [a, b, c, d, e, f]
    //   e, f  = x, y of the text item (PDF coords, baseline)
    //   a     = horizontal scale ≈ font size in PDF units
    // We also pull width and height from the item itself.
    const x        = item.transform[4];
    const baselineY = item.transform[5];
    const fontSize = Math.abs(item.transform[0]) || Math.abs(item.transform[3]);
    const width    = item.width  || 0;
    const height   = item.height || fontSize;

    // pdfjs reports y from PDF origin (bottom-left), in user-space.
    // pdf-lib uses the same coord system, so we can pass these straight through.
    // We just translate baseline → bottom-of-bbox by subtracting nothing —
    // the baseline IS where pdf-lib expects to draw text.
    const marker = {
      pageIndex: 0,
      x,
      y: baselineY,
      width,
      height,
      fontSize,
      pageHeight: viewport.height, // for pdf-lib coord conversion if ever needed
    };

    if (trimmed.includes(NAME_MARKER) && !markers.name) {
      markers.name = marker;
    } else if (trimmed.includes(CODE_MARKER) && !markers.code) {
      markers.code = marker;
    }
  }

  if (!markers.name || !markers.code) {
    const missing = [];
    if (!markers.name) missing.push('{{NAME}}');
    if (!markers.code) missing.push('{{CODE}}');
    throw new Error(
      `Template ${url} is missing required marker${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}. ` +
      'Open the template, type the markers exactly where the personalised text should go, save, and try again.'
    );
  }

  cache.set(url, markers);
  return markers;
}

/** Manually flush the cache — used when uploading a new template version */
export function clearMarkerCache() {
  cache.clear();
}
