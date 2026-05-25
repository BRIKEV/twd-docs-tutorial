# Demo Spec — Delete Confirmation Dialog (RED→GREEN)

Feature: add a confirmation dialog to the delete action on the TodoList page (`src/pages/TodoList/TodoItem.tsx`).

Stack notes:
- App is already running (dev server + JSON server).
- Dialog component is installed at `@/components/ui/dialog`.
- Dialog renders in a portal → query with `screenDomGlobal` (not `screenDom`).
- TWD tests live in `src/twd-tests/`.

---

## Step 1 — RED: write the failing tests

Edit `src/twd-tests/todoList.twd.test.ts` and add the two new tests (replacing the old immediate-delete test):

1. `should open a confirmation dialog and delete the todo when confirmed`
   - Visit `/todos`, click first `Delete` button.
   - Assert a dialog message matching `/are you sure/i` appears (use `screenDomGlobal.findAllByText`).
   - Mock the post-delete `getTodoList` to return the remaining todo.
   - Click the Confirm button.
   - Wait for `deleteTodo` + `getTodoList`.
   - Assert only one todo remains.

2. `should keep the todo when delete confirmation is cancelled`
   - Visit `/todos`, click first `Delete` button.
   - Assert dialog appears.
   - Click the Cancel button.
   - Assert both todos are still visible.

## Step 2 — RED: confirm the tests fail

Run only the two new tests via twd-relay:

```bash
npx twd-relay run \
  --test "should open a confirmation dialog and delete the todo when confirmed" \
  --test "should keep the todo when delete confirmation is cancelled"
```

Expected: both fail (no dialog exists yet — Delete submits immediately).

## Step 3 — GREEN: implement the dialog

Edit `src/pages/TodoList/TodoItem.tsx`:
- Replace the inline `deleteFetcher.Form` submit with a `Delete` button that opens a controlled `Dialog`.
- Dialog content:
  - Title: `Delete todo`
  - Description: `Are you sure you want to delete '<title>'?`
  - Footer: `Cancel` button + `Confirm` button.
- `Confirm` calls `deleteFetcher.submit(null, { method: "delete", action: ... })` programmatically — preserves the existing route action.
- `Cancel` just closes the dialog.

Gotcha already hit during dev: Radix renders `DialogDescription` text in two nodes (visible + a11y). Use `findAllByText(...)[0]` in the test rather than `findByText`.

## Step 4 — GREEN: confirm the two tests pass

```bash
npx twd-relay run \
  --test "should open a confirmation dialog and delete the todo when confirmed" \
  --test "should keep the todo when delete confirmation is cancelled"
```

Expected: both green.

## Step 5 — Regression: run the full suite

```bash
npx twd-relay run
```

Expected: all 6 tests pass (display list, create todo, confirm-delete, cancel-delete, + any prior tests).

---

## Files touched

- `src/twd-tests/todoList.twd.test.ts` — new/updated tests
- `src/pages/TodoList/TodoItem.tsx` — dialog implementation
