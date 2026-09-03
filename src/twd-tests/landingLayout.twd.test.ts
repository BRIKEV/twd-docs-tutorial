/**
 * SPIKE / THROWAWAY — el caso que faltaba: layout roto SIN cambio de tamaño.
 *
 * /landing-a y /landing-b miden lo mismo por fuera (900x720). Todos los
 * cambios son internos, así que la señal exacta (`size`) no los ve y el
 * veredicto depende solo de la rejilla.
 *
 * Los dos tests usan el MISMO snapshot a propósito: el primero lo crea, el
 * segundo lo compara contra la variante movida y debe fallar.
 */
import { twd, expect, screenDom } from "twd-js";
import { describe, it } from "twd-js/runner";
import { matchLayout } from "../pages/Helloworld/matchLayout";

describe("Landing layout", () => {
  it("captura la referencia de la landing", async () => {
    await twd.visit("/landing-a");
    const target = await screenDom.findByTestId("landing");

    const result = await matchLayout(target, "landing");
    console.log("[spike] A", result.status, result.size, result.hash);
    expect(result.status, result.message).to.not.equal("failed");
  });

  it("detecta los elementos movidos", async () => {
    await twd.visit("/landing-b");
    const target = await screenDom.findByTestId("landing");

    // Mismo nombre de snapshot: se compara B contra la referencia de A.
    const result = await matchLayout(target, "landing");
    console.log("[spike] B", result.status, result.size, result.distance);
    expect(result.status, result.message).to.not.equal("failed");
  });
});
