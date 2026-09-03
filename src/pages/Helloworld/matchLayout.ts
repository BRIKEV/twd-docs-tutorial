/**
 * SPIKE / THROWAWAY — ciclo de snapshot contra disco vía el plugin de Vite.
 *
 * Primera ejecución: no hay referencia -> la escribe y pasa (como jest).
 * Siguientes: compara hashes. Si difiere, guarda `<name>.failed.png` al lado
 * con las celdas que cambiaron marcadas en rojo.
 * para poder mirar los dos y decidir si el .snap de texto basta o hace falta PNG.
 */
import type { Grid } from './visualSnapshot';
import { diffRows, rowDistance } from './rowDiff';
import {
  MARK_CHANGED,
  MARK_NEW_AREA,
  annotateRowDiff,
  annotateSizeChange,
  captureNode,
  printDiff,
  printGrid,
  withLegend,
} from './visualSnapshot';

const ENDPOINT = '/__twd_snapshot';

type Snap = { hash: string; size: string; grid: Grid };

/** Formato legible: cabecera parseable + preview ASCII para leerlo en un PR. */
function serialize(hash: string, size: string, grid: Grid): string {
  const gridHex = grid.cells.map((g) => Math.round(g).toString(16).padStart(2, '0')).join('');
  const preview = printGrid(grid)
    .split('\n')
    .map((line) => (line ? `# ${line}` : ''))
    .join('\n');

  return [
    `hash ${hash}`,
    `size ${size}`,
    `rows ${grid.rows}`,
    `cols ${grid.cols}`,
    `grid ${gridHex}`,
    ``,
    `# preview (# = filled, . = empty)`,
    preview,
  ].join('\n');
}

function parse(text: string): Snap {
  const get = (key: string) => text.match(new RegExp(`^${key} (.+)$`, 'm'))?.[1] ?? '';
  const gridHex = get('grid');
  const cells: number[] = [];
  for (let i = 0; i < gridHex.length; i += 2) cells.push(parseInt(gridHex.slice(i, i + 2), 16));
  const cols = Number(get('cols')) || 16;
  const rows = Number(get('rows')) || cells.length / cols;
  return { hash: get('hash'), size: get('size'), grid: { cells, rows, cols } };
}

async function write(name: string, body: Record<string, string>) {
  const res = await fetch(`${ENDPOINT}?name=${encodeURIComponent(name)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

export type LayoutResult = {
  status: 'written' | 'passed' | 'failed';
  /** Listo para pasarlo como mensaje a expect(). Vacio si no ha fallado. */
  message: string;
  hash: string;
  size: string;
  distance?: number;
  baseline?: Snap;
  written?: string[];
};

const DIR = '__twd_snapshots__';

const dims = (size: string) => {
  const [w, h] = size.split('x').map(Number);
  return { w, h };
};

function failureMessage(
  name: string,
  hash: string,
  size: string,
  prev: Snap,
  distance: number,
  grid: Grid
) {
  const widthChanged = dims(prev.size).w !== dims(size).w;
  return [
    ``,
    widthChanged
      ? `Layout snapshot "${name}" changed - the block WIDTH changed`
      : prev.size !== size
        ? `Layout snapshot "${name}" changed - the block height changed`
        : `Layout snapshot "${name}" changed - ${distance} cells differ`,
    ``,
    `  expected  ${prev.hash}   ${prev.size}`,
    `  actual    ${hash}   ${size}`,
    ``,
    `  X = changed    ~ = new row    # = filled    . = empty`,
    printDiff(prev.grid, grid)
      .split('\n')
      .map((l) => (l ? `  ${l}` : ''))
      .join('\n'),
    ...(grid.rows < prev.grid.rows
      ? [`  (${prev.grid.rows - grid.rows} rows missing compared to the reference)`, ``]
      : []),
    ...(widthChanged
      ? [
          `  Note: the width changed, so the grid rescales (cell = width/${grid.cols});`,
          `  marked cells are indicative, not one-to-one.`,
          ``,
        ]
      : []),
    `  Reference:  ${DIR}/${name}.snap`,
    `  Capture:    ${DIR}/${name}.failed.png`,
    ``,
    `  Review:  npx twd-cli --snapshot "${name}"`,
    `  Accept:  npx twd-cli --snapshot "${name}" --update-snapshots`,
    ``,
  ].join('\n');
}

export async function matchLayout(el: HTMLElement, name: string): Promise<LayoutResult> {
  const shot = await captureNode(el);
  const size = shot.debug.cssSize;

  const baseline = await (await fetch(`${ENDPOINT}?name=${encodeURIComponent(name)}`)).json();

  if (!baseline.exists) {
    // Solo el .snap: el PNG de referencia no sobrevive a un checkout limpio,
    // asi que el preview del fallo se construye con los bits, no con imagenes.
    const res = await write(name, { snap: serialize(shot.hash, size, shot.grid) });
    return { status: 'written', message: '', hash: shot.hash, size, written: res.written };
  }

  const prev = parse(baseline.snap);
  const ops = diffRows(prev.grid, shot.grid);
  const distance = rowDistance(ops);

  // Un cambio de tamano ES un cambio de layout, aunque los bits no se muevan:
  // un texto de 20px cabe entero dentro de una celda y no mueve su promedio.
  if (distance === 0 && prev.size === size) {
    return { status: 'passed', message: '', hash: shot.hash, size, distance, baseline: prev };
  }

  // Falla: no tocamos la referencia, guardamos el actual al lado para comparar.
  // Siempre se marcan las celdas: si el ancho cambio, la rejilla se reescala y
  // se marca casi todo, que es justo el mensaje correcto ("se movio entero").
  // Si ademas cambio el tamano, una cinta arriba con esperado -> actual.
  const ref = dims(prev.size);
  const sameWidth = ref.w === dims(size).w;
  const hasNewArea = sameWidth && shot.grid.rows > prev.grid.rows;

  let canvas = annotateRowDiff(shot.canvas, shot.grid, ops, prev.size !== size);
  canvas = withLegend(canvas, [
    { ...MARK_CHANGED, label: 'changed' },
    ...(hasNewArea ? [{ ...MARK_NEW_AREA, label: 'new area' }] : []),
  ]);
  if (prev.size !== size) canvas = annotateSizeChange(canvas, ref.w, ref.h, dims(size));
  const res = await write(name, { png: canvas.toDataURL('image/png'), suffix: '.failed' });
  return {
    status: 'failed',
    message: failureMessage(name, shot.hash, size, prev, distance, shot.grid),
    hash: shot.hash,
    size,
    distance,
    baseline: prev,
    written: res.written,
  };
}
