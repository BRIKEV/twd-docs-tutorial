# TWD Project Patterns

## Project Configuration

- **Framework**: React + React Router
- **Vite base path**: /
- **Dev server port**: 5173
- **App URL**: http://localhost:5173
- **Dev command**: npm run serve:dev
- **Default branch**: main
- **Entry point**: src/main.tsx
- **Public folder**: public/
- **Closing run**: full suite

### Runner Commands

twd-cli drives its own headless browser — only the dev server has to be up (`npm run serve:dev`).

```bash
# Run all tests
npm run test:ci

# Run specific tests by name (matches "suite > test", case-insensitive; repeatable)
npx twd-cli run --test "should render the list"
npx twd-cli run --test "should create" --test "should show the error"

# Only the tests this branch added or changed
npx twd-cli run --changed-since origin/main

# Record a run to video (one clip per matched test, needs ffmpeg)
npx twd-cli run --record --test "should render the list"
```

Every run writes `.twd/report/`: `run.json` (the result), `summary.md` and `index.html`. The folder is replaced on each run.

## Standard Imports

```typescript
import { twd, userEvent, screenDom, expect } from "twd-js";
import { describe, it, beforeEach, afterEach } from "twd-js/runner";
```

## Visit Paths

```typescript
await twd.visit("/");
await twd.visit("/todos");
```

## Standard beforeEach / afterEach

```typescript
beforeEach(() => {
  twd.clearRequestMockRules();
  twd.clearComponentMocks();
});

afterEach(() => {
  twd.clearRequestMockRules();
});
```

## API Service Types

Service/API types are located in: `src/api/`

Read files in this folder to understand endpoint URLs and response shapes when writing mock data.

## CSS / Component Library

- **Library**: shadcn/ui (Radix UI + Tailwind)
- **Docs**: https://ui.shadcn.com/docs

When writing tests, refer to library docs for correct ARIA roles and component structure.

## Portals and Dialogs

Use `screenDomGlobal` instead of `screenDom` for elements rendered in portals (modals, dropdowns, tooltips):

```typescript
import { screenDomGlobal } from "twd-js";
const modal = screenDomGlobal.getByRole("dialog");
```
