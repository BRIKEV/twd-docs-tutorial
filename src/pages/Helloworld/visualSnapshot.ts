/**
 * SPIKE / THROWAWAY — visual snapshot capture POC.
 *
 * Question being probed: can we capture a DOM node to pixels *inside the browser*,
 * faithfully and deterministically, using only native APIs (no html2canvas)?
 *
 * Pipeline: DOM node -> clone w/ inlined computed styles -> <svg><foreignObject>
 *        -> data: URI -> <img> -> canvas.drawImage -> ImageData -> 64-bit hash
 *
 * Known limits of this approach (part of what we're measuring):
 *  - Web fonts do NOT load inside an SVG-as-image. Text falls back unless fonts
 *    are inlined as base64 @font-face rules.
 *  - External <img>/background-image URLs do NOT load either.
 *  - ::before / ::after pseudo-elements are not cloned.
 */

export type Grid = { cells: number[]; rows: number; cols: number };

/** Bit por celda: por encima de la media global de la captura. */
export function toBits(grid: Grid): boolean[] {
  const mean = grid.cells.reduce((a, b) => a + b, 0) / grid.cells.length;
  return grid.cells.map((g) => g >= mean);
}

/** Copy every resolved computed style onto the clone, so CSS vars + stylesheets survive. */
function inlineStyles(source: Element, clone: Element) {
  const computed = getComputedStyle(source);
  const target = (clone as HTMLElement).style;

  for (let i = 0; i < computed.length; i++) {
    const prop = computed.item(i);
    target.setProperty(prop, computed.getPropertyValue(prop));
  }

  const sourceKids = source.children;
  const cloneKids = clone.children;
  for (let i = 0; i < sourceKids.length; i++) {
    inlineStyles(sourceKids[i], cloneKids[i]);
  }
}

/** Rasterize a DOM node into a canvas + its pixel buffer. */
export async function captureNode(el: HTMLElement) {
  const { width, height } = el.getBoundingClientRect();
  // Pinned to CSS pixels (dpr = 1) so a retina laptop and CI agree.
  const w = Math.ceil(width);
  const h = Math.ceil(height);

  const clone = el.cloneNode(true) as HTMLElement;
  inlineStyles(el, clone);
  clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
    `<foreignObject x="0" y="0" width="100%" height="100%">` +
    new XMLSerializer().serializeToString(clone) +
    `</foreignObject></svg>`;

  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await img.decode();

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  // Sin esto el canvas queda transparente donde el nodo no pinta fondo propio,
  // y el transparente se lee como negro: el hash acaba viendo solo el texto.
  const background = resolveBackground(el);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0);

  // data: URIs don't taint the canvas, so this read is allowed.
  const imageData = ctx.getImageData(0, 0, w, h);

  const { hash, grid } = averageHash(canvas, background);

  return {
    canvas,
    imageData,
    hash,
    grid,
    background,
    debug: {
      cssSize: `${w}x${h}`,
      svgBytes: svg.length,
      imgSize: `${img.naturalWidth}x${img.naturalHeight}`,
      svg, // kept so tests can check what actually got serialized
      opaquePixels: countOpaque(imageData),
      distinctColors: countDistinct(imageData),
    },
  };
}

/** How many pixels actually got painted? 0 => the SVG rendered nothing. */
function countOpaque(imageData: ImageData): number {
  let n = 0;
  for (let i = 3; i < imageData.data.length; i += 4) {
    if (imageData.data[i] > 0) n++;
  }
  return n;
}

/** 1 distinct color => flat fill, i.e. nothing meaningful was drawn. */
function countDistinct(imageData: ImageData): number {
  const seen = new Set<number>();
  const d = imageData.data;
  for (let i = 0; i < d.length && seen.size < 100; i += 4) {
    seen.add((d[i] << 24) | (d[i + 1] << 16) | (d[i + 2] << 8) | d[i + 3]);
  }
  return seen.size;
}

/** Dibuja los bits del hash. `#` = 1, `.` = 0. Coincide con el veredicto. */
export function printGrid(grid: Grid): string {
  const bits = toBits(grid);
  let out = '';
  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) out += (bits[row * grid.cols + col] ? '#' : '.') + ' ';
    out += '\n';
  }
  return out;
}

/**
 * Hash perceptual con rejilla ANCLADA: la celda es cuadrada (ancho/8) y el
 * numero de filas sale del alto. Asi, si el bloque crece por abajo, las filas
 * de arriba siguen muestreando exactamente la misma franja de pagina.
 * (Una rejilla 8x8 fija se estira al cambiar el alto y desalinea todo.)
 */
const COLS = 16;

function averageHash(canvas: HTMLCanvasElement, background: string): { hash: string; grid: Grid } {
  const cell = canvas.width / COLS;
  // Altura de destino FRACCIONARIA: si se redondea, la imagen se comprime al
  // numero de filas y volvemos a desalinear. Asi la escala vertical es igual
  // que la horizontal y cada fila cubre siempre la misma franja de pagina.
  const exactRows = canvas.height / cell;
  const rows = Math.max(1, Math.ceil(exactRows));

  const small = document.createElement('canvas');
  small.width = COLS;
  small.height = rows;
  const ctx = small.getContext('2d')!;
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, COLS, rows);
  ctx.drawImage(canvas, 0, 0, COLS, exactRows);

  const { data } = ctx.getImageData(0, 0, COLS, rows);
  const cells: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    cells.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }

  const grid: Grid = { cells, rows, cols: COLS };
  const bits = toBits(grid).map((b) => (b ? '1' : '0')).join('');

  let hex = '';
  for (let i = 0; i < bits.length; i += 4) {
    hex += parseInt(bits.slice(i, i + 4).padEnd(4, '0'), 2).toString(16);
  }
  return { hash: hex, grid };
}

/**
 * Exact pixel comparison — how many pixels differ between two captures.
 * Returns -1 if the captures aren't the same size (can't compare).
 * This is the ground truth the 8x8 hash is a lossy summary of.
 */
export function pixelDiff(a: ImageData, b: ImageData): number {
  if (a.width !== b.width || a.height !== b.height) return -1;
  let differing = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    if (
      a.data[i] !== b.data[i] ||
      a.data[i + 1] !== b.data[i + 1] ||
      a.data[i + 2] !== b.data[i + 2] ||
      a.data[i + 3] !== b.data[i + 3]
    ) {
      differing++;
    }
  }
  return differing;
}

/** Hamming distance between two hashes. 0 = identical, >5 = probably a real change. */
export function hashDistance(a: string, b: string): number {
  let distance = 0;
  for (let i = 0; i < a.length; i++) {
    let xor = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    while (xor) {
      distance += xor & 1;
      xor >>= 1;
    }
  }
  return distance;
}

/** Primer fondo opaco subiendo por los ancestros. */
function resolveBackground(el: HTMLElement): string {
  let node: HTMLElement | null = el;
  while (node) {
    const bg = getComputedStyle(node).backgroundColor;
    if (bg && bg !== 'transparent' && !bg.startsWith('rgba(0, 0, 0, 0)')) return bg;
    node = node.parentElement;
  }
  return '#ffffff';
}


/**
 * Preview del fallo en texto. `X` = celda que cambio, `~` = fila que no existia
 * en la referencia (el bloque crecio).
 */
export function printDiff(baseline: Grid, current: Grid): string {
  const a = toBits(baseline);
  const b = toBits(current);
  let out = '';
  for (let row = 0; row < current.rows; row++) {
    for (let col = 0; col < current.cols; col++) {
      const i = row * current.cols + col;
      if (row >= baseline.rows) out += '~ ';
      else out += (a[i] !== b[i] ? 'X' : b[i] ? '#' : '.') + ' ';
    }
    out += '\n';
  }
  return out;
}

export const MARK_CHANGED = { fill: 'rgba(255, 0, 0, 0.3)', stroke: 'rgba(220, 0, 0, 0.9)' };
export const MARK_NEW_AREA = { fill: 'rgba(255, 150, 0, 0.25)', stroke: 'rgba(220, 120, 0, 0.9)' };

/**
 * Copia el canvas y marca las celdas que cambiaron.
 * `markNewArea` solo tiene sentido a ancho constante: si el ancho cambia, la
 * celda cambia de tamano y un bloque que ENCOGE puede ganar filas, con lo que
 * "zona nueva" confundiria. En ese caso todo se marca como cambio.
 */
export function annotateChanges(
  canvas: HTMLCanvasElement,
  baseline: Grid,
  current: Grid,
  markNewArea = true
): HTMLCanvasElement {
  const out = document.createElement('canvas');
  out.width = canvas.width;
  out.height = canvas.height;

  const ctx = out.getContext('2d')!;
  ctx.drawImage(canvas, 0, 0);

  const before = toBits(baseline);
  const after = toBits(current);
  const cellW = canvas.width / current.cols;
  const cellH = canvas.height / current.rows;
  ctx.lineWidth = 2;

  for (let row = 0; row < current.rows; row++) {
    for (let col = 0; col < current.cols; col++) {
      const i = row * current.cols + col;
      const isNewRow = row >= baseline.rows;
      if (!isNewRow && before[i] === after[i]) continue;

      const mark = isNewRow && markNewArea ? MARK_NEW_AREA : MARK_CHANGED;
      ctx.fillStyle = mark.fill;
      ctx.strokeStyle = mark.stroke;
      ctx.fillRect(col * cellW, row * cellH, cellW, cellH);
      ctx.strokeRect(col * cellW, row * cellH, cellW, cellH);
    }
  }
  return out;
}

/** Banda inferior explicando que significa cada color. */
export function withLegend(
  canvas: HTMLCanvasElement,
  entries: { fill: string; stroke: string; label: string }[]
): HTMLCanvasElement {
  const band = 30;
  const out = document.createElement('canvas');
  out.width = canvas.width;
  out.height = canvas.height + band;

  const ctx = out.getContext('2d')!;
  ctx.drawImage(canvas, 0, 0);
  ctx.fillStyle = 'rgb(245, 245, 245)';
  ctx.fillRect(0, canvas.height, out.width, band);
  ctx.font = '12px monospace';

  let x = 8;
  const y = canvas.height + 10;
  for (const entry of entries) {
    ctx.fillStyle = entry.fill;
    ctx.strokeStyle = entry.stroke;
    ctx.lineWidth = 1.5;
    ctx.fillRect(x, y, 13, 13);
    ctx.strokeRect(x, y, 13, 13);
    x += 19;

    ctx.fillStyle = 'rgb(60, 60, 60)';
    ctx.fillText(entry.label, x, y + 11);
    x += ctx.measureText(entry.label).width + 20;
  }
  return out;
}

/** Distancia en celdas. Las filas que solo existen en una de las dos cuentan enteras. */
export function gridDistance(a: Grid, b: Grid): number {
  const bitsA = toBits(a);
  const bitsB = toBits(b);
  const shared = Math.min(a.rows, b.rows);
  let distance = Math.abs(a.rows - b.rows) * COLS;
  for (let i = 0; i < shared * COLS; i++) if (bitsA[i] !== bitsB[i]) distance++;
  return distance;
}

/**
 * Cinta superior con el cambio de tamano. Se probo dibujar el contorno del
 * tamano esperado como rectangulo y confunde: deja un area blanca enorme que
 * parece contenido. El dato en una banda ocupa 26px y se lee de un vistazo.
 */
export function annotateSizeChange(
  canvas: HTMLCanvasElement,
  refWidth: number,
  refHeight: number,
  actual: { w: number; h: number }
): HTMLCanvasElement {
  const band = 26;
  const label = `expected ${refWidth}x${refHeight}   ->   actual ${actual.w}x${actual.h}`;

  const out = document.createElement('canvas');
  const ctx0 = out.getContext('2d')!;
  ctx0.font = 'bold 13px monospace';
  out.width = Math.max(canvas.width, Math.ceil(ctx0.measureText(label).width) + 16);
  out.height = canvas.height + band;

  const ctx = out.getContext('2d')!;
  ctx.fillStyle = 'rgb(255, 235, 235)';
  ctx.fillRect(0, 0, out.width, band);
  ctx.font = 'bold 13px monospace';
  ctx.fillStyle = 'rgb(190, 0, 0)';
  ctx.fillText(label, 8, 18);

  ctx.drawImage(canvas, 0, band);
  return out;
}
