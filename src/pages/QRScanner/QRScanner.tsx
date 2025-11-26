import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MockedComponent } from 'twd-js';

export default function QRScanner() {
  const [detectedCodes, setDetectedCodes] = useState<string[]>([]);

  const handleScan = (detectedCodes: Array<{ rawValue: string }>) => {
    const newCodes = detectedCodes.map((code) => code.rawValue);
    setDetectedCodes((prev) => {
      const uniqueCodes = new Set([...prev, ...newCodes]);
      return Array.from(uniqueCodes);
    });
  };

  const handleError = (error: Error) => {
    console.error('QR Scanner error:', error);
  };

  const clearCodes = () => {
    setDetectedCodes([]);
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">QR Code Scanner</h1>
      
      <div className="space-y-8">
        {/* QR Scanner */}
        <Card>
          <CardHeader>
            <CardTitle>Scan QR Code</CardTitle>
            <CardDescription>Point your camera at a QR code to scan it</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full max-w-md mx-auto">
              <MockedComponent name="qrScanner">
                <Scanner
                  onScan={handleScan}
                  onError={(error: unknown) => handleError(error as Error)}
                />
              </MockedComponent>
            </div>
          </CardContent>
        </Card>

        {/* Detected Codes */}
        <Card>
          <CardHeader>
            <CardTitle>Detected QR Codes</CardTitle>
            <CardDescription>
              {detectedCodes.length === 0
                ? 'No codes detected yet'
                : `${detectedCodes.length} code(s) detected`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {detectedCodes.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Scan a QR code to see the results here
              </p>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={clearCodes}
                    className="text-sm text-primary hover:underline"
                  >
                    Clear all
                  </button>
                </div>
                <div className="space-y-3">
                  {detectedCodes.map((code, index) => (
                    <div
                      key={index}
                      className="p-4 bg-muted rounded-lg border"
                      data-testid={`detected-code-${index}`}
                    >
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Code #{index + 1}
                      </p>
                      <p className="text-foreground break-all">{code}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

