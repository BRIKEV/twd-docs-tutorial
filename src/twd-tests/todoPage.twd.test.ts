import { describe, it, beforeEach } from "twd-js/runner";
import { twd, screenDom, userEvent, expect } from "twd-js";
import todoList from "./mocks/todoList.json";

describe("Todo Page", () => {
  beforeEach(() => {
    twd.clearRequestMockRules();
  });

  it("should render the todo page", async () => {
    // setup the todo list
    // use await always,
    // add the mockRequest always before the action! in this case visit
    await twd.mockRequest("todoList", {
      method: "GET",
      response: todoList,
      url: "/api/todos",
      status: 200,
    })
    await twd.visit("/todos");
    // good practice
    await twd.waitForRequest("todoList");
    const todoListHeading = await screenDom.findByRole('heading', {
      name: "Todo List"
    });
    twd.should(todoListHeading, "be.visible");

    const card1Title = await screenDom.findByText("Learn TWD");
    const card1Description = await screenDom.findByText("Understand how to use TWD for testing web applications");
    const card1Date = await screenDom.findByText("Date: 2024-12-20");
    twd.should(card1Title, "be.visible");
    twd.should(card1Description, "be.visible");
    twd.should(card1Date, "be.visible");
    const card2Title = await screenDom.findByText("Build Todo App");
    const card2Description = await screenDom.findByText("Create a todo list application to demonstrate TWD features");
    const card2Date = await screenDom.findByText("Date: 2024-12-25");
    twd.should(card2Title, "be.visible");
    twd.should(card2Description, "be.visible");
    twd.should(card2Date, "be.visible");
  });

  it("should add a new todo", async () => {
    // setup the todo list
    await twd.mockRequest("todoList", {
      method: "GET",
      response: [],
      url: "/api/todos",
      status: 200,
    });
    await twd.mockRequest("createTodo", {
      method: "POST",
      response: todoList[0],
      url: "/api/todos",
      status: 201,
    });
    await twd.visit("/todos");
    await twd.waitForRequest("todoList");
    const noTodosHeading = await screenDom.findByText("No todos yet. Create one above!");
    twd.should(noTodosHeading, "be.visible");
    await twd.mockRequest("todoList", {
      method: "GET",
      response: [todoList[0]],
      url: "/api/todos",
      status: 200,
    });
    // complete the form
    const titleInput = await screenDom.findByLabelText("Title");
    await userEvent.type(titleInput, "New Todo");
    const descriptionInput = await screenDom.findByLabelText("Description");
    await userEvent.type(descriptionInput, "New Todo Description");
    const dateInput = await screenDom.findByLabelText("Date");
    await userEvent.type(dateInput, "2024-12-26");
    const createTodoButton = await screenDom.findByText("Create Todo");
    await userEvent.click(createTodoButton);
    const rule = await twd.waitForRequest("createTodo");
    expect(rule.request).to.deep.equal({
      date: "2024-12-26",
      description: "New Todo Description",
      title: "New Todo",
    });
  });

  it("should delete a todo", async () => {
    // setup the todo list
    await twd.mockRequest("todoList", {
      method: "GET",
      response: todoList,
      url: "/api/todos",
      status: 200,
    });
    await twd.mockRequest("deleteTodo", {
      method: "DELETE",
      response: null,
      url: "/api/todos/1",
      status: 204,
    });
    await twd.visit("/todos");
    await twd.waitForRequest("todoList");
    await twd.mockRequest("todoList", {
      method: "GET",
      response: todoList.filter(todo => todo.id !== "1"),
      url: "/api/todos",
      status: 200,
    });
    const deleteButton = await screenDom.findByRole("button", {
      name: "Delete Todo Learn TWD",
    });
    twd.should(deleteButton, "be.visible");
    await userEvent.click(deleteButton);
    await twd.waitForRequests(["deleteTodo", "todoList"]);
  });
});
