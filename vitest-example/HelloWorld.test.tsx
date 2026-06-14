import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import { RouterProvider } from "react-router";
import router from '../src/AppRoutes';
import { userEvent } from 'vitest/browser';

test('renders name', async () => {
  const { getByText } = await render(
    <RouterProvider router={router} />
  )
  const title = getByText('Welcome to TWD')
  expect(title).toBeInTheDocument()
  const counterButton = getByText('Count is 0')
  expect(counterButton).toBeInTheDocument()
  await userEvent.click(counterButton)
})
