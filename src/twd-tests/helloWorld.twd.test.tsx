import { twd, screenDom } from "twd-js";
import { describe, it } from "twd-js/runner";
import { twdMockComponent } from "./componentMocks";

interface CounterButtonProps {
  count: number;
  setCount: (count: number) => void;
}

describe("Hello World Page", () => {
  it("should display the welcome title and counter button", async () => {
    twdMockComponent<CounterButtonProps>("CounterButton", ({ count, setCount }) => (
      <button onClick={() => setCount(count + 2)}>Mock CounterButton</button>
    ));
    await twd.visit("/");
    const button = await screenDom.getByText("Mock CounterButton");
    console.log(button);

    // const title = await screenDom.getByText("Welcome to TWD");
    // twd.should(title, 'be.visible');

    // const counterButton = await screenDom.getByText("Count is 0");
    // twd.should(counterButton, 'be.visible');

    // await userEvent.click(counterButton);
    // twd.should(counterButton, 'have.text', 'Count is 1');

    // await userEvent.click(counterButton);
    // twd.should(counterButton, 'have.text', 'Count is 2');

    // await userEvent.click(counterButton);
    // twd.should(counterButton, 'have.text', 'Count is 3');
  });
});