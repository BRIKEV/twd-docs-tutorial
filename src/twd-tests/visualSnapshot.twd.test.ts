/** SPIKE / THROWAWAY — matchLayout con el expect de TWD (chai). */
import { twd, expect, screenDom, userEvent } from "twd-js";
import { describe, it } from "twd-js/runner";
import { matchLayout } from "../pages/Helloworld/matchLayout";

describe("Visual snapshot spike", () => {
  it("el layout de la home no cambia", async () => {
    await twd.visit("/");
    const target = await screenDom.findByTestId("snapshot-target");

    const result = await matchLayout(target, "helloworld");
    // El 2o argumento de chai es el mensaje que se ve al fallar.
    expect(result.status, result.message).to.not.equal("failed");
  });

  it("detecta que se ha roto el layout", async () => {
    await twd.visit("/");
    const target = await screenDom.findByTestId("snapshot-target");

    const input = await screenDom.findByTestId("note-input");
    await userEvent.type(input, "visual testing spike");
    await userEvent.click(await screenDom.findByTestId("add-note"));

    // Este DEBE fallar: mira el mensaje en el sidebar.
    const result = await matchLayout(target, "helloworld");
    expect(result.status, result.message).to.not.equal("failed");
  });
});
