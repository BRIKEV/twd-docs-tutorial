import { describe, it } from "twd-js/runner";
import { twd, screenDom, userEvent, expect } from "twd-js";

describe("Hello World", () => {
  it("should render the hello world component", async () => {
    await twd.visit("/");
    const helloWorld = await screenDom.findByText("Welcome to TWD");
    twd.should(helloWorld, "be.visible");

    const countButton = await screenDom.findByText("Count is 0");
    twd.should(countButton, "be.visible");

    await userEvent.click(countButton);
    twd.should(countButton, "have.text", "Count is 1");

    await userEvent.click(countButton);
    twd.should(countButton, "have.text", "Count is 2");
  });
});