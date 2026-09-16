import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QrScanner({ onScan, onClose }) {
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        onScan(decodedText);
        scanner.stop();
      },
      () => {} // erreur de frame, ignorer
    ).catch((err) => console.error('Erreur démarrage scanner:', err));

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [onScan]);

  return (
    <div>
      <div id="qr-reader" style={{ width: '100%', maxWidth: 360 }}></div>
      <button onClick={onClose} style={{ marginTop: 10, width: '100%', padding: 10 }}>
        Annuler
      </button>
    </div>
  );
}