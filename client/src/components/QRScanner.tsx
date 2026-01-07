import { useState } from "react";
import { QrReader } from "react-qr-reader";
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
  const [scanning, setScanning] = useState(true);

  const handleScan = (result: any) => {
    if (result) {
      const scannedData = result?.text || result;
      if (scannedData) {
        setScanning(false);
        onScan(scannedData);
        onClose();
      }
    }
  };

  const handleError = (error: any) => {
    console.error("QR Scanner error:", error);
    setError("Kamera açıla bilmədi. Lütfən kamera icazəsi verin və ya başqa cihaz istifadə edin.");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
            <div className="relative">
              {scanning && (
                <div className="rounded-lg overflow-hidden border-2 border-primary">
                  <QrReader
                    onResult={handleScan}
                    constraints={{ facingMode: "environment" }}
                    containerStyle={{ width: "100%" }}
                    videoStyle={{ width: "100%" }}
                  />
                </div>
              )}
              
              <div className="mt-4 text-center text-sm text-muted-foreground">
                <p>QR kodu kamera görüş sahəsinə yerləşdirin</p>
                <p className="mt-1">Avtomatik olaraq oxunacaq</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Bağla
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
