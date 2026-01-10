import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, X } from "lucide-react";

interface QRScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export default function QRScanner({ open, onClose, onScan }: QRScannerProps) {
  const [error, setError] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrCodeRegionId = "qr-reader";

  useEffect(() => {
    if (open && !isScanning) {
      // DOM element-in render olmasını gözləyirik
      const timer = setTimeout(() => {
        startScanner();
      }, 100);

      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    }

    return () => {
      stopScanner();
    };
  }, [open]);

  const startScanner = async () => {
    try {
      setError("");
      setIsScanning(true);

      // DOM element-in mövcudluğunu yoxlayırıq
      const element = document.getElementById(qrCodeRegionId);
      if (!element) {
        throw new Error(`HTML Element with id=${qrCodeRegionId} not found`);
      }

      // Html5Qrcode instance yaradırıq
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(qrCodeRegionId);
      }

      const qrCodeSuccessCallback = (decodedText: string) => {
        console.log("QR kod oxundu:", decodedText);
        onScan(decodedText);
        stopScanner();
        onClose();
      };

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      // Arxa kamera ilə başlatmaq
      await scannerRef.current.start(
        { facingMode: "environment" },
        config,
        qrCodeSuccessCallback,
        (errorMessage) => {
          // Hər frame-də xəta mesajı gəlir, bunu ignore edirik
          // console.log("QR scan error:", errorMessage);
        }
      );
    } catch (err: any) {
      console.error("Kamera başlatma xətası:", err);
      setError(
        "Kamera açıla bilmədi. Lütfən brauzerdə kamera icazəsi verin və səhifəni yeniləyin."
      );
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error("Scanner dayandırma xətası:", err);
      }
    }
    setIsScanning(false);
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            QR Kod Skan Et
          </DialogTitle>
          <DialogDescription>
            Müştərinin QR kodunu kameraya tutun
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div
                id={qrCodeRegionId}
                className="rounded-lg overflow-hidden border-2 border-primary"
                style={{ width: "100%" }}
              />

              <div className="text-center text-sm text-muted-foreground">
                <p>QR kodu kamera görüş sahəsinə yerləşdirin</p>
                <p className="mt-1">Avtomatik olaraq oxunacaq</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              <X className="w-4 h-4 mr-2" />
              Bağla
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
