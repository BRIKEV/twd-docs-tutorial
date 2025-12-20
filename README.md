# TWD + React Router v7 (Data Mode)

This repo demonstrates React Router v7 in data mode, tested end‑to‑end with TWD (`twd-js`). The app uses route loaders/actions for data, and TWD provides a browser‑native test runner you can use interactively during development or headlessly in CI.

For an overview of React Router data mode, see the [API and mode availability](https://reactrouter.com/start/modes#api--mode-availability-table).

## Quick Start

- Install deps

```bash
npm install
```

- Start dev server + mock API (json‑server)

```bash
npm run serve:dev
```

Open the app at the Vite URL printed in the terminal. In dev, the TWD sidebar appears automatically and discovers tests from `.twd.test.ts(x)` files.

## Where TWD Lives

- Tests: [src/twd-tests](src/twd-tests)
  - Examples: [src/twd-tests/helloWorld.twd.test.ts](src/twd-tests/helloWorld.twd.test.ts), [src/twd-tests/qrScanner.twd.test.tsx](src/twd-tests/qrScanner.twd.test.tsx), [src/twd-tests/todoList.twd.test.ts](src/twd-tests/todoList.twd.test.ts)
- Dev wiring: TWD is initialized in [src/main.tsx](src/main.tsx) with `initTWD()` and `import.meta.glob("./**/*.twd.test.ts")` so tests are auto‑discovered in development.

### TWD Test Basics

Common helpers used in this repo:

```ts
import { describe, it } from "twd-js/runner";
import { twd, screenDom, userEvent, expect } from "twd-js";

describe("Example", () => {
  it("navigates and asserts", async () => {
    await twd.visit("/");
    const title = await screenDom.getByText("Welcome to TWD");
    twd.should(title, "be.visible");
  });

  it("mocks requests", async () => {
    await twd.mockRequest("getTodoList", { method: "GET", url: "/api/todos", response: [], status: 200 });
    await twd.visit("/todos");
    await twd.waitForRequest("getTodoList");
  });

  it("mocks components", async () => {
    twd.mockComponent("qrScanner", ({ onScan }) => (
      <button onClick={() => onScan([{ rawValue: "123" }])}>Mock scan</button>
    ));
    await twd.visit("/qr-scanner");
  });
});
```

## Running Tests

### Interactive (recommended during development)
- Use `npm run serve:dev` and open the app.
- Trigger tests from the TWD sidebar in the browser (run all or individual tests).

### Headless CI with coverage
Run Vite with coverage instrumentation and the mock API, then execute the TWD CI runner:

```bash
# Terminal 1: mock API
npm run serve

# Terminal 2: Vite dev server with coverage env
npm run dev:ci

# Terminal 3: headless TWD runner (uses Puppeteer)
npm run test:ci

# Optional: generate coverage reports into ./coverage
npm run collect:coverage:html
# or
npm run collect:coverage:lcov
npm run collect:coverage:text
```

Notes:
- `dev:ci` sets `CI=true` so `vite-plugin-istanbul` instruments code. The CI runner writes `.nyc_output/out.json`; the `collect:coverage:*` scripts turn that into reports.
- The CI runner opens the dev server at `http://localhost:5173` and executes all discovered tests.

## Running the App Only

If you just want to browse the app without tests:

```bash
npm run serve:dev
```

## Tools

- **React Router**: declarative routing with loaders/actions.
- **json-server**: mock REST API ([data/data.json](data/data.json), [data/routes.json](data/routes.json)).
- **twd-js**: interactive and headless testing for web apps.
- **Vite + vite-plugin-istanbul**: dev server and coverage instrumentation.
- **Puppeteer + NYC**: headless browser execution and coverage reporting.

Explore the app routes and loaders in [src/AppRoutes.tsx](src/AppRoutes.tsx). TWD enables fast, realistic tests without extra state or request management libraries.

