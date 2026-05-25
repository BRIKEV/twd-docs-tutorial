import { twd, expect, userEvent, screenDom } from "twd-js";
import { describe, it, beforeEach } from "twd-js/runner";
import todoListMock from "./mocks/todoList.json";

describe("Todo List Page", () => {
  // beforeEach(() => {
  //   twd.clearRequestMockRules();
  // });

  it("should delete a todo", async () => {
    // await twd.mockRequest("getTodoList", {
    //   method: "GET",
    //   url: "/api/todos",
    //   response: todoListMock,
    //   status: 200,
    // });
    await twd.visit("/todos");
  });
});