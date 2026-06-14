import { expect, test, beforeAll, beforeEach, afterEach, afterAll } from 'vitest'
import { render } from 'vitest-browser-react'
import { RouterProvider } from 'react-router'
import { worker } from './mocks/browser'
import { resetTodos } from './mocks/handlers'
import router from '@/AppRoutes'

// Start the MSW worker once; reset request handlers + store between tests.
beforeAll(() => worker.start({ onUnhandledRequest: 'error' }))
beforeEach(() => router.navigate('/todos'))
afterEach(() => {
  worker.resetHandlers()
  resetTodos()
})
afterAll(() => worker.stop())

test('displays the todo list loaded from the API', async () => {
  const { getByText } = await render(<RouterProvider router={router} />)

  await expect.element(getByText('Learn TWD')).toBeInTheDocument()
  await expect.element(getByText('Build Todo App')).toBeInTheDocument()
  await expect
    .element(getByText('Understand how to use TWD for testing web applications'))
    .toBeInTheDocument()
})

test('creates a new todo', async () => {
  const { getByText, getByLabelText, getByRole } = await render(<RouterProvider router={router} />)

  // wait for the initial load before interacting
  await expect.element(getByText('Learn TWD')).toBeInTheDocument()

  await getByLabelText('Title').fill('Test Todo')
  await getByLabelText('Description').fill('Test Description')
  await getByLabelText('Date').fill('2024-12-20')
  await getByRole('button', { name: 'Create Todo' }).click()

  // react-router revalidates the loader after the action; new item appears
  await expect.element(getByText('Test Todo')).toBeInTheDocument()
  await expect.element(getByText('Test Description')).toBeInTheDocument()
})

test('deletes a todo', async () => {
  const { getByText, getByTestId } = await render(<RouterProvider router={router} />)

  await expect.element(getByText('Learn TWD')).toBeInTheDocument()

  await getByTestId('delete-todo-1').click()

  await expect.element(getByText('Learn TWD')).not.toBeInTheDocument()
  await expect.element(getByText('Build Todo App')).toBeInTheDocument()
})
