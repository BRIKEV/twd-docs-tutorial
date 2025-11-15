import { twd, expect, userEvent, screenDom } from "twd-js";
import { describe, it, beforeEach } from "twd-js/runner";
import todoListMock from "./mocks/todoList.json";

describe("Todo List Page", () => {
  beforeEach(() => {
    twd.clearRequestMockRules();
  });

  it("should display the todo list", async () => {
    await twd.mockRequest("getTodoList", {
      method: "GET",
      url: "/api/todos",
      response: todoListMock,
      status: 200,
    });
    await twd.visit("/todos");
    await twd.waitForRequest("getTodoList");
    
    const todo1Title = await screenDom.getByText("Learn TWD");
    twd.should(todo1Title, "be.visible");
    
    const todo2Title = await screenDom.getByText("Build Todo App");
    twd.should(todo2Title, "be.visible");
    
    const todo1Description = await screenDom.getByText("Understand how to use TWD for testing web applications");
    twd.should(todo1Description, "be.visible");
    
    const todo2Description = await screenDom.getByText("Create a todo list application to demonstrate TWD features");
    twd.should(todo2Description, "be.visible");
    
    const todo1Date = await screenDom.getByText("Date: 2024-12-20");
    twd.should(todo1Date, "be.visible");
    
    const todo2Date = await screenDom.getByText("Date: 2024-12-25");
    twd.should(todo2Date, "be.visible");
  });

  it("should create a todo", async () => {
    await twd.mockRequest("createTodo", {
      method: "POST",
      url: "/api/todos",
      response: todoListMock[0],
      status: 200,
    });
    await twd.mockRequest("getTodoList", {
      method: "GET",
      url: "/api/todos",
      response: [],
      status: 200,
    });
    await twd.visit("/todos");
    await twd.waitForRequest("getTodoList");
    
    const noTodosMessage = await screenDom.getByText("No todos yet. Create one above!");
    twd.should(noTodosMessage, "be.visible");
    
    await twd.mockRequest("getTodoList", {
      method: "GET",
      url: "/api/todos",
      response: [
        todoListMock[0]
      ],
      status: 200,
    });
    
    const titleInput = await screenDom.getByLabelText("Title");
    await userEvent.type(titleInput, "Test Todo");
    
    const descriptionInput = await screenDom.getByLabelText("Description");
    await userEvent.type(descriptionInput, "Test Description");
    
    const dateInput = await screenDom.getByLabelText("Date");
    await userEvent.type(dateInput, "2024-12-20");
    
    const submitButton = await screenDom.getByRole("button", { name: "Create Todo" });
    await userEvent.click(submitButton);
    
    await twd.waitForRequest("getTodoList");
    const rule = await twd.waitForRequest("createTodo");
    expect(rule.request).to.deep.equal({
      title: "Test Todo",
      description: "Test Description",
      date: "2024-12-20",
    });

    const todoList = await screenDom.getAllByText(/Learn TWD|Build Todo App|Test Todo/);
    expect(todoList).to.have.length(1);
  });

  it("should delete a todo", async () => {
    await twd.mockRequest("deleteTodo", {
      method: "DELETE",
      url: "/api/todos/1",
      response: null,
      status: 200,
    });
    await twd.mockRequest("getTodoList", {
      method: "GET",
      url: "/api/todos",
      response: todoListMock,
      status: 200,
    });
    await twd.visit("/todos");
    
    // Find the delete button for the first todo (Learn TWD)
    // Since there are multiple delete buttons, we'll get all and use the first one
    // which corresponds to the first todo item
    const deleteButtons = await screenDom.getAllByRole("button", { name: "Delete" });
    const deleteButton = deleteButtons[0];
    
    await twd.mockRequest("getTodoList", {
      method: "GET",
      url: "/api/todos",
      response: todoListMock.filter((todo) => todo.id !== "1"),
      status: 200,
    });
    
    await userEvent.click(deleteButton);
    await twd.waitForRequest("deleteTodo");
    await twd.waitForRequest("getTodoList");
    
    const todoList = await screenDom.getAllByText(/Learn TWD|Build Todo App/);
    expect(todoList).to.have.length(1);
    twd.should(todoList[0], "be.visible");
  });
});