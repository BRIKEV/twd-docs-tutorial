import { describe, it } from "twd-js/runner";
import { twd, screenDom, userEvent, expect } from "twd-js";
import { virtual } from "@guidepup/virtual-screen-reader";

describe("Screen Reader", () => {
  it("finds the button via quick-nav", async () => {
    await twd.visit("/");
    await virtual.start({ container: document.getElementById("root")!, displayCursor: true });

    await virtual.perform(virtual.commands.moveToNextHeading);
    const heading = await virtual.lastSpokenPhrase();
    console.log("FIRST HEADING:", heading);

    await virtual.perform(virtual.commands.moveToNextLink);
    await virtual.next();
    await virtual.next();
    await virtual.next();
    await virtual.perform(virtual.commands.moveToNextNavigation);
    const button = await virtual.lastSpokenPhrase();
    console.log("FIRST BUTTON:", button);

    await virtual.stop();

    expect(heading).to.contain("Welcome to TWD");
    expect(button).to.contain("Count is");
  });
});