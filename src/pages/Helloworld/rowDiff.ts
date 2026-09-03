/**
 * SPIKE / THROWAWAY — diff de filas por contenido, no por posicion.
 *
 * El problema que resuelve: si una seccion de arriba cambia de alto, TODO lo de
 * abajo se desplaza y una comparacion posicional marca la pagina entera como
 * cambiada. Es ruido, no senal.
 *
 * Aqui se trata la pagina como una secuencia de filas y se hace un LCS con
 * tolerancia, igual que `git diff` con lineas: una fila que solo se ha movido
 * se empareja y no se marca. Solo se marcan las que de verdad aparecen,
 * desaparecen o cambian.
 */
import { type Grid, toBits } from './visualSnapshot';

export type RowOp =
  | { op: 'same'; baselineRow: number; currentRow: number }
  | { op: 'changed'; baselineRow: number; currentRow: number; cells: boolean[] }
  | { op: 'added'; currentRow: number }
  | { op: 'removed'; baselineRow: number };

/** Bits de cada fila, como matriz. */
function rows(grid: Grid): boolean[][] {
  const bits = toBits(grid);
  return Array.from({ length: grid.rows }, (_, r) =>
    bits.slice(r * grid.cols, r * grid.cols + grid.cols)
  );
}

function hamming(a: boolean[], b: boolean[]): number {
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
  return d;
}

/**
 * LCS con tolerancia: dos filas se consideran "la misma" si difieren en como
 * mucho `tolerance` celdas. Sin tolerancia, una fila que se desplaza medio
 * pixel deja de emparejar y volvemos al ruido.
 */
export function diffRows(baseline: Grid, current: Grid, tolerance = 2): RowOp[] {
  const a = rows(baseline);
  const b = rows(current);
  const same = (i: number, j: number) => hamming(a[i], b[j]) <= tolerance;

  // Tabla LCS clasica.
  const lcs: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i][j] = same(i, j) ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const ops: RowOp[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (same(i, j)) {
      ops.push({ op: 'same', baselineRow: i, currentRow: j });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      ops.push({ op: 'removed', baselineRow: i });
      i++;
    } else {
      ops.push({ op: 'added', currentRow: j });
      j++;
    }
  }
  while (i < a.length) ops.push({ op: 'removed', baselineRow: i++ });
  while (j < b.length) ops.push({ op: 'added', currentRow: j++ });

  // Un 'removed' pegado a un 'added' es en realidad una fila modificada:
  // se fusionan para poder marcar QUE celdas cambiaron dentro de ella.
  const merged: RowOp[] = [];
  for (let k = 0; k < ops.length; k++) {
    const cur = ops[k];
    const next = ops[k + 1];
    if (cur.op === 'removed' && next?.op === 'added') {
      merged.push({
        op: 'changed',
        baselineRow: cur.baselineRow,
        currentRow: next.currentRow,
        cells: a[cur.baselineRow].map((bit, c) => bit !== b[next.currentRow][c]),
      });
      k++;
    } else {
      merged.push(cur);
    }
  }
  return merged;
}

/** Numero de filas que no se emparejaron: la distancia real de layout. */
export function rowDistance(ops: RowOp[]): number {
  return ops.filter((o) => o.op !== 'same').length;
}
