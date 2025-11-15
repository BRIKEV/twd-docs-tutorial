import { twd, userEvent, screenDom } from "twd-js";
import { describe, it } from "twd-js/runner";

describe("Hello World Page", () => {
  it("should display the welcome title and counter button", async () => {
    await twd.visit("/");
    
    const title = await screenDom.getByText("Welcome to TWD");
    twd.should(title, 'be.visible');
    
    const counterButton = await screenDom.getByText("Count is 0");
    twd.should(counterButton, 'be.visible');
    
    await userEvent.click(counterButton);
    twd.should(counterButton, 'have.text', 'Count is 1');
    
    await userEvent.click(counterButton);
    twd.should(counterButton, 'have.text', 'Count is 2');
    
    await userEvent.click(counterButton);
    twd.should(counterButton, 'have.text', 'Count is 3');
  });
});