/**
 * Layout snapshots with twd.matchLayout.
 *
 * /landing-a is the reference. The other two variants move things around the
 * way a CSS change would: "b" also changes the page height, "c" only reorders
 * so the page still measures the same and the verdict rests on the grid alone.
 *
 * All three share one snapshot on purpose: the first writes the reference and
 * the other two are compared against it, so they are MEANT to fail. They are
 * skipped to keep the suite green; drop the `.skip` on either one and run
 * `npx twd-cli run` to see the failure and the diff map.
 *
 * Layout snapshots are decided by twd-cli, so in the sidebar these are skipped
 * unless the plugin is configured with twdSnapshot({ debug: true }).
 */
import { twd, screenDom } from "twd-js";
import { describe, it } from "twd-js/runner";

const SNAPSHOT = "landing";

describe("Landing layout", () => {
  it("should record the layout of the landing page", async () => {
    await twd.visit("/landing-a");
    await twd.matchLayout(await screenDom.findByTestId("landing"), SNAPSHOT);
  });

  it.skip("should detect a reorder that keeps the page height", async () => {
    await twd.visit("/landing-c");
    await twd.matchLayout(await screenDom.findByTestId("landing"), SNAPSHOT);
  });

  it.skip("should detect moved elements that change the page height", async () => {
    await twd.visit("/landing-b");
    await twd.matchLayout(await screenDom.findByTestId("landing"), SNAPSHOT);
  });
});
