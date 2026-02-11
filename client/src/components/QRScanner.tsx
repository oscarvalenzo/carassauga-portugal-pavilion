import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Scan } from 'lucide-react';

interface QRScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerIdRef = useRef(`qr-reader-${Date.now()}`);

  const startScanner = async () => {
    const readerId = readerIdRef.current;
    let html5QrCode: Html5Qrcode | null = null;

    const initializeCamera = async () => {
      setLoading(true);
      setError(null);
      
      try {
        html5QrCode = new Html5Qrcode(readerId);
        scannerRef.current = html5QrCode;

        console.log('Requesting camera access...');
        const cameras = await Html5Qrcode.getCameras();
        console.log('Available cameras:', cameras);
        
        if (cameras && cameras.length > 0) {
          // Prefer back camera
          const backCamera = cameras.find((camera) =>
            camera.label.toLowerCase().includes('back')
          );
          const cameraId = backCamera?.id || cameras[0].id;
          console.log('Using camera:', cameraId);

          try {
            await html5QrCode.start(
              cameraId,
              {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
              },
              async (decodedText) => {
                // QR code successfully scanned
                console.log('QR Code scanned:', decodedText);
                if (scannerRef.current) {
                  try {
                    await scannerRef.current.stop();
                    scannerRef.current.clear();
                  } catch (err) {
                    console.error('Error stopping scanner:', err);
                  }
                  scannerRef.current = null;
                }
                setScanning(false);
                onScan(decodedText);
              },
              (errorMessage) => {
                // Ignore scanning errors (no QR code in view)
                // Only log if it's not a common "not found" error
                if (!errorMessage.includes('NotFoundException')) {
                  console.debug('Scanning error:', errorMessage);
                }
              }
            );

            setScanning(true);
            setError(null);
            setLoading(false);
            console.log('Camera started successfully');
          } catch (startError: any) {
            console.error('Error starting camera:', startError);
            setError(startError.message || 'Failed to start camera. Please check permissions.');
            setLoading(false);
          }
        } else {
          console.error('No cameras found');
          setError('No camera found on this device');
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error initializing QR scanner:', err);
        const errorMessage = err.message || 'Failed to access camera.';
        if (errorMessage.includes('Permission')) {
          setError('Camera permission denied. Please enable camera access in your browser settings.');
        } else if (errorMessage.includes('NotFoundError') || errorMessage.includes('DevicesNotFoundError')) {
          setError('No camera found on this device.');
        } else {
          setError(`Failed to access camera: ${errorMessage}`);
        }
        setLoading(false);
      }
    };

    return initializeCamera();
  };

  useEffect(() => {
    startScanner();

    return () => {
      // Cleanup on unmount
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
        scannerRef.current.clear();
        scannerRef.current = null;
      }
      setScanning(false);
    };
  }, [onScan]);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleClose = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      scannerRef.current = null;
    }
    setScanning(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex flex-col animate-fadeIn">
      {/* Header - Apple Style */}
      <div className="relative px-6 py-16 flex items-center justify-between z-10">
        <div>
          <h2 className="font-sf-display text-sf-3xl text-white font-bold tracking-tight mb-2">Scan QR Code</h2>
          <p className="font-sf-text text-sf-sm text-white/70 font-medium tracking-tight">Position the code within the frame</p>
        </div>
        <button
          onClick={handleClose}
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all shadow-lg"
          aria-label="Close scanner"
        >
          <X size={24} className="text-white" strokeWidth={2.5} />
        </button>
      </div>

      {/* Scanner View */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {loading ? (
          <div className="text-center text-white">
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
              <Camera size={48} className="text-primary" strokeWidth={2} />
            </div>
            <h3 className="font-sf-display text-sf-xl font-bold mb-3 tracking-tight">Initializing Camera...</h3>
            <p className="font-sf-text text-sf-sm text-white/70 font-medium tracking-tight max-w-sm mx-auto">
              Please allow camera access when prompted
            </p>
          </div>
        ) : error ? (
          <div className="text-center text-white">
            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Camera size={48} className="text-red-400" strokeWidth={2} />
            </div>
            <h3 className="font-sf-display text-sf-xl font-bold mb-3 tracking-tight">Camera Access Required</h3>
            <p className="font-sf-text text-sf-sm text-white/70 font-medium tracking-tight max-w-sm mx-auto mb-4">{error}</p>
            <div className="space-y-3">
              <button
                onClick={async () => {
                  // Stop any existing scanner
                  await stopScanner();
                  // Reset state and restart
                  setError(null);
                  setLoading(true);
                  await startScanner();
                }}
                className="bg-white/10 backdrop-blur-xl text-white px-8 py-4 rounded-full font-sf-text font-bold text-sf-sm hover:bg-white/20 active:scale-95 transition-all shadow-lg"
              >
                Try Again
              </button>
              <button
                onClick={handleClose}
                className="block w-full mt-3 bg-white/5 backdrop-blur-xl text-white/70 px-8 py-4 rounded-full font-sf-text font-medium text-sf-sm hover:bg-white/10 active:scale-95 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="relative w-full max-w-md">
            <div
              id={readerIdRef.current}
              className="w-full rounded-3xl overflow-hidden shadow-2xl bg-black"
              style={{ minHeight: '400px' }}
            />
            {/* Scanner Overlay */}
            {scanning && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
                <div className="absolute top-4 right-4 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
                <div className="absolute bottom-4 left-4 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
                <div className="absolute bottom-4 right-4 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-2xl" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instructions - Apple Style */}
      <div className="px-6 py-10 bg-white/5 backdrop-blur-xl border-t border-white/10">
        <div className="flex items-start gap-4">
          <Scan size={24} className="text-primary flex-shrink-0 mt-1" strokeWidth={2} />
          <div>
            <h3 className="font-sf-text font-bold text-white mb-3 text-sf-base tracking-tight">How to scan</h3>
            <ul className="font-sf-text text-sf-sm text-white/70 space-y-2 font-medium tracking-tight">
              <li>• Find QR codes at food stations and activities</li>
              <li>• Hold your phone steady over the code</li>
              <li>• Earn points and unlock badges instantly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
