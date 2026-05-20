import { expect } from "twd-js";
import { describe, it } from "twd-js/runner";
import type { ActionFunctionArgs } from "react-router";
import { todoActions } from "@/pages/TodoList/action";

const buildArgs = (method: string): ActionFunctionArgs => {
  const formData = new FormData();
  formData.append("_noop", "1");
  const request = new Request("http://localhost/todos", {
    method,
    body: formData,
  });
  return { request, params: {}, context: {} } as unknown as ActionFunctionArgs;
};

describe("todoActions (unit)", () => {
  it("returns null when the request method has no handler (PUT)", async () => {
    const result = await todoActions(buildArgs("PUT"));

    expect(result).to.equal(null);
  });

  it("returns null when the request method has no handler (PATCH)", async () => {
    const result = await todoActions(buildArgs("PATCH"));

    expect(result).to.equal(null);
  });
});
