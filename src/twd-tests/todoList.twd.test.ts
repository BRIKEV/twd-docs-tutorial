import { twd, expect, userEvent, screenDom } from "twd-js";
import { describe, it, beforeEach } from "twd-js/runner";
import todoListMock from "./mocks/todoList.json";

describe("Todo List Page", () => {
  beforeEach(() => {
    twd.clearRequestMockRules();
  });

  it("should delete a todo", async () => {
    await twd.mockRequest("getTodoList", {
      method: "GET",
      url: "/api/todos",
      response: todoListMock,
      status: 200,
    });
    await twd.mockRequest("deleteTodo", {
      method: "DELETE",
      url: "/api/todos/1",
      response: null,
      status: 204,
    });
    await twd.visit("/todos");
    
    const deleteButtons = await screenDom.getAllByRole("button", { name: "Delete" });
    const firstDeleteButton = deleteButtons[0];
    await twd.mockRequest("getTodoList", {
      method: "GET",
      url: "/api/todos",
      response: todoListMock.filter((todo) => todo.id !== "1"),
      status: 200,
    });
    await userEvent.click(firstDeleteButton);
    await twd.waitForRequest("deleteTodo");
    await twd.waitForRequest("getTodoList");
    const todoList = await screenDom.getAllByText(/Learn TWD|Build Todo App/);
    expect(todoList).to.have.length(1);
    twd.should(todoList[0], "be.visible");
  });
});