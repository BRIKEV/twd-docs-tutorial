import { describe, it } from "twd-js/runner";
import { twd, screenDom, userEvent } from "twd-js";

describe("QR Scanner Page", () => {
  it("should display the QR scanner page", async () => {
    twd.mockComponent("qrScanner", ({
      onScan,
    }: {
      onScan: (detectedCodes: Array<{ rawValue: string }>) => void;
    }) => {
      return <div>
        <button onClick={() => onScan([{ rawValue: "1234567890" }])}>QR code scanned mocked</button>
      </div>;
    });
    await twd.visit("/qr-scanner");

    const qrScanner = await screenDom.getByText("QR Code Scanner");
    twd.should(qrScanner, "be.visible");

    const qrScannerHeading = await screenDom.getByText("Scan QR Code");
    twd.should(qrScannerHeading, "be.visible");
    
    let detectedCodes = await screenDom.getByText("No codes detected yet");
    twd.should(detectedCodes, "be.visible");

    const qrCodeScannedButton = await screenDom.getByText("QR code scanned mocked");
    twd.should(qrCodeScannedButton, "be.visible");
    await userEvent.click(qrCodeScannedButton);

    detectedCodes = await screenDom.getByText("1 code(s) detected");
    twd.should(detectedCodes, "be.visible");
    const detectedCode = await screenDom.getByText("1234567890");
    twd.should(detectedCode, "be.visible");
  });
});