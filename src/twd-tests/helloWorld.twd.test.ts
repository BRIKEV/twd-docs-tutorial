import { twd, userEvent, screenDom, expect } from "twd-js";
import { describe, it } from "twd-js/runner";

/**
 * A TWD test is composed of three parts:
 * 1. Setup the test
 * 2. Navigation or interactions
 * 3. Assertions
 * 
 * The methods comes from the runner and has the same structure as any other test framework.
 * The methods are:
 *  - describe
 *  - it
 *  - beforeEach
 *  - afterEach
 */

describe("Hello World Page", () => {
  it("should display the welcome title and counter button", async () => {
    // 1. setup the test
    //  - visit the page
    //  - mock request
    //  - handle auth or third party modules mocks
    await twd.visit("/");

    // 2. Navigation or interactions
    // selectors comes from testing library
    const title = await screenDom.getByText("Welcome to TWD");
    // 3. Assertions
    twd.should(title, 'be.visible');

    const counterButton = await screenDom.getByText("Count is 0");
    twd.should(counterButton, 'be.visible');
    // expect(counterButton).not.to.be.null;

    await userEvent.click(counterButton);
    twd.should(counterButton, 'have.text', 'Count is 1');

    await userEvent.click(counterButton);
    twd.should(counterButton, 'have.text', 'Count is 2');

    await userEvent.click(counterButton);
    twd.should(counterButton, 'have.text', 'Count is 3');
  });
});