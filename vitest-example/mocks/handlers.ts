import { http, HttpResponse } from 'msw'
import type { Todo } from '@/api/todos'
import { seedTodos } from './data'

// matches the axios baseURL in src/api/todos.ts
const BASE = 'http://localhost:3001/api'

// In-memory store so the handlers behave like a real server:
// GET reflects current state, POST appends, DELETE removes.
let todos: Todo[] = structuredClone(seedTodos)

export function resetTodos() {
  todos = structuredClone(seedTodos)
}

export const handlers = [
  http.get(`${BASE}/todos`, () => HttpResponse.json(todos)),

  http.post(`${BASE}/todos`, async ({ request }) => {
    const body = (await request.json()) as Omit<Todo, 'id'>
    const newTodo: Todo = { id: String(todos.length + 1), ...body }
    todos.push(newTodo)
    return HttpResponse.json(newTodo, { status: 201 })
  }),

  http.delete(`${BASE}/todos/:id`, ({ params }) => {
    todos = todos.filter((todo) => todo.id !== params.id)
    return new HttpResponse(null, { status: 204 })
  }),
]
