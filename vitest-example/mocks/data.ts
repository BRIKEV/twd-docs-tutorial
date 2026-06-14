import type { Todo } from '@/api/todos'

// Seed data used to reset the in-memory store between tests.
export const seedTodos: Todo[] = [
  {
    id: '1',
    title: 'Learn TWD',
    description: 'Understand how to use TWD for testing web applications',
    date: '2024-12-20',
  },
  {
    id: '2',
    title: 'Build Todo App',
    description: 'Create a todo list application to demonstrate TWD features',
    date: '2024-12-25',
  },
]
