import { expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import QRScanner from '@/pages/QRScanner/QRScanner'

// The real <Scanner> needs camera access (getUserMedia), which isn't
// available in a headless CI browser. Replace it with a fake that fires
// onScan when clicked. QRScanner wraps it in <MockedComponent>, which
// renders its children when no twd runtime is present.
vi.mock('@yudiel/react-qr-scanner', () => ({
  Scanner: ({ onScan }: { onScan: (codes: Array<{ rawValue: string }>) => void }) => (
    <button onClick={() => onScan([{ rawValue: '1234567890' }])}>QR code scanned mocked</button>
  ),
}))

test('renders the scanner page in its empty state', async () => {
  const screen = await render(<QRScanner />)

  await expect.element(screen.getByText('QR Code Scanner')).toBeInTheDocument()
  await expect.element(screen.getByText('Scan QR Code')).toBeInTheDocument()
  await expect.element(screen.getByText('No codes detected yet')).toBeInTheDocument()
})

test('records a detected QR code', async () => {
  const screen = await render(<QRScanner />)

  await screen.getByText('QR code scanned mocked').click()

  await expect.element(screen.getByText('1 code(s) detected')).toBeInTheDocument()
  await expect.element(screen.getByText('1234567890')).toBeInTheDocument()
})
