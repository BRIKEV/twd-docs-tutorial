# TWD (Test While Developing) Context

## Overview
TWD is an in-browser test runner. Tests run in the browser (not Node.js). Syntax is similar to Jest/Cypress.

## Core Rules

1. Imports — use in every TWD test file:
   import { twd, userEvent, screenDom, expect } from "twd-js";
   import { describe, it, beforeEach, afterEach } from "twd-js/runner";

2. File naming: *.twd.test.ts or *.twd.test.tsx

3. Async/Await:
   - twd.get() and twd.getAll() are async. Always await them.
   - userEvent methods (click, type) are async. Always await them.
   - Test functions passed to it() should be async.

4. Assertions:
   - Use .should(assertion, value) on elements from twd.get().
   - Common: "have.text", "contain.text", "be.visible", "have.value", "have.class", "be.disabled", "have.attr".
   - Use Chai expect for non-element assertions.

## Common Patterns

### Basic test structure
   import { twd, userEvent, screenDom, expect } from "twd-js";
   import { describe, it, beforeEach } from "twd-js/runner";

   describe("Feature Name", () => {
     beforeEach(() => {
       twd.clearRequestMockRules();
       twd.clearComponentMocks();
     });
     it("should perform an action", async () => { /* test logic */ });
   });

### Selecting elements
   Preferred: screenDom (Testing Library)
     const heading = screenDom.getByRole("heading", { name: "Welcome" });
     const submitBtn = screenDom.getByRole("button", { name: "Submit" });
     const emailInput = screenDom.getByLabelText("Email Address");
     // For modals/portals: use screenDomGlobal instead

   Fallback: twd.get() with CSS selectors
     const container = await twd.get(".custom-container");

### Interactions (userEvent)
   const user = userEvent.setup();
   await user.click(btn);
   await user.type(input, "text");
   // With twd.get(): use .el for raw DOM — await user.click(rawBtn.el);

### Navigation
   await twd.visit("/path");

### Assertions
   message.should("have.text", "Success");
   message.should("contain.text", "saved");
   message.should("be.visible"); message.should("not.be.visible");
   input.should("have.value", "test@example.com");
   message.should("have.class", "success-alert");
   button.should("be.disabled"); button.should("be.enabled");
   checkbox.should("be.checked");
   element.should("have.attr", "type", "submit");
   await twd.url().should("contain.url", "/dashboard");

### Mocking requests
   Define mocks BEFORE the action that triggers the request.
   await twd.mockRequest("getUser", { method: "GET", url: "/api/user", response: { id: 1, name: "John" }, status: 200 });
   await twd.waitForRequest("getUser");

### Component mocking
   // In component: wrap with <MockedComponent name="Chart"><Chart /></MockedComponent>
   // In test:
   twd.mockComponent("Chart", () => <div>Mocked</div>);

### Module stubbing (Sinon)
   Tests run in the browser, so use Sinon for stubs/spies.
   ESM constraint: named exports (export const foo = ...) are IMMUTABLE and CANNOT be stubbed.
   Solution: wrap in an object and export as default.

   // hooks/useAuth.ts — CORRECT (stubbable)
   import { useAuth0 } from "@auth0/auth0-react";
   const useAuth = () => useAuth0();
   export default { useAuth };

   // hooks/useAuth.ts — WRONG (not stubbable)
   export const useAuth = () => useAuth0();

   // In test:
   import authSession from '../hooks/useAuth';
   import Sinon from 'sinon';
   Sinon.stub(authSession, 'useAuth').returns({ isAuthenticated: true, ... });
   // Clean up in beforeEach: Sinon.restore();

## Do's and Don'ts
   DO: await twd.get(); await userEvent actions; use .el when passing twd.get() result to userEvent.
   DO: Clear mocks in beforeEach: twd.clearRequestMockRules(); twd.clearComponentMocks();
   DO: Mock requests BEFORE twd.visit() or triggering the request.
   DON'T: use cy.get or cy.visit (not Cypress); use global describe/it — always import from "twd-js/runner".
   DON'T: assume Node.js (fs, path) is available — tests run in browser.
   DON'T: try to stub named exports (export const fn = ...) — ESM makes them immutable. Wrap in an object and export default.
   DO: use Sinon for module stubs/spies. Always call Sinon.restore() in beforeEach.