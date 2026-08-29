import {render, screen, cleanup } from '@testing-library/react'
import { twd } from "twd-js";
import { describe, it, beforeEach } from "twd-js/runner";
import Helloworld from "../pages/Helloworld/Helloworld";



describe("Hello World Component", () => {
  beforeEach(() => {
    cleanup();
  });
  it("should display the welcome title and counter button", async () => {
    await twd.visit("/testin-library");
    render(<Helloworld />);
    const input = screen.getByText("Welcome to TWD");
    twd.should(input, 'be.visible');
  });
});
