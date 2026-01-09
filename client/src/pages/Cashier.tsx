import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { Coffee, Scan, Calculator, Award, LogOut } from "lucide-react";
import { toast } from "sonner";
import QRScanner from "@/components/QRScanner";

export default function Cashier() {
  const [, setLocation] = useLocation();

  // PIN autentifikasiya yoxlaması - yalnız kassir
  useEffect(() => {
    const cashierAuth = localStorage.getItem("cashierAuth");
    const cashierAuthTime = localStorage.getItem("cashierAuthTime");

    // Session 8 saat sonra bitir
    const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 saat

    const isCashierValid = cashierAuth === "true" && cashierAuthTime && (Date.now() - parseInt(cashierAuthTime)) < SESSION_DURATION;

    if (!isCashierValid) {
      toast.error("Kassir PIN kodu tələb olunur");
      setLocation("/cashier-login");
    }
  }, [setLocation]);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [spentAmount, setSpentAmount] = useState("");
  const [note, setNote] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);

  const utils = trpc.useUtils();

  const cashbackQuery = trpc.cashback.calculate.useQuery(
    { spentAmount: parseFloat(spentAmount) || 0 },
    { enabled: !!spentAmount && parseFloat(spentAmount) > 0 }
  );

  const addBonusMutation = trpc.transaction.create.useMutation({
    onSuccess: () => {
      toast.success("Bonus uğurla əlavə edildi!");
      setPhoneNumber("");
      setSpentAmount("");
      setNote("");
      setSelectedCustomer(null);
    },
    onError: (error: any) => {
      toast.error("Xəta: " + error.message);
    },
  });

  const handleSearchCustomer = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Düzgün telefon nömrəsi daxil edin");
      return;
    }

    try {
      const customer = await utils.client.customer.getByPhone.query({ phoneNumber });
      if (customer) {
        setSelectedCustomer(customer);
        toast.success(`Müştəri tapıldı: ${customer.name}`);
      } else {
        toast.error("Müştəri tapılmadı");
        setSelectedCustomer(null);
      }
    } catch (error: any) {
      toast.error("Xəta: " + error.message);
    }
  };

  const handleAddBonus = () => {
    if (!selectedCustomer) {
      toast.error("Əvvəlcə müştəri axtarın");
      return;
    }

    if (!spentAmount || parseFloat(spentAmount) <= 0) {
      toast.error("Xərclənən məbləği daxil edin");
      return;
    }

    const bonusAmount = cashbackQuery.data?.bonusPoints || 0;

    addBonusMutation.mutate({
      customerId: selectedCustomer.id,
      amount: bonusAmount,
      spentAmount: `${spentAmount} AZN`,
      note: note || `Xərcləmə: ${spentAmount} AZN`,
    });
  };

  const handleQRScan = async (data: string) => {
    try {
      // QR koddan telefon nömrəsi çıxarmaq
      const phoneMatch = data.match(/\+994\d{9}/);
      if (phoneMatch) {
        const phone = phoneMatch[0];
        setPhoneNumber(phone);
        setShowQRScanner(false);
        
        const customer = await utils.client.customer.getByPhone.query({ phoneNumber: phone });
        if (customer) {
          setSelectedCustomer(customer);
          toast.success(`Müştəri tapıldı: ${customer.name}`);
        } else {
          toast.error("Müştəri tapılmadı");
        }
      } else {
        toast.error("QR kodda telefon nömrəsi tapılmadı");
      }
    } catch (error: any) {
      toast.error("Xəta: " + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("cashierAuth");
    localStorage.removeItem("cashierAuthTime");
    toast.success("Çıxış edildi");
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Coffee className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Coffee Lin - Kassir Panel</h1>
                <p className="text-sm text-muted-foreground">Bonus əlavə etmə paneli</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Çıxış
            </Button>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>QR Kod Skan</CardTitle>
              <CardDescription>Müştərinin QR kodunu kameraya tutun</CardDescription>
            </CardHeader>
            <CardContent>
              <QRScanner open={showQRScanner} onScan={handleQRScan} onClose={() => setShowQRScanner(false)} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="container py-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="w-5 h-5" />
              Müştəri Axtarışı
            </CardTitle>
            <CardDescription>
              Telefon nömrəsi ilə müştəri axtarın və ya QR kod skan edin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="phone">Telefon nömrəsi</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+994 XX XXX XX XX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleSearchCustomer}>Axtar</Button>
                <Button variant="outline" onClick={() => setShowQRScanner(true)}>
                  <Scan className="w-4 h-4 mr-2" />
                  QR Skan
                </Button>
              </div>
            </div>

            {selectedCustomer && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-lg">{selectedCustomer.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedCustomer.phoneNumber}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      selectedCustomer.tier === "Platinum"
                        ? "bg-gradient-to-r from-gray-300 to-white"
                        : selectedCustomer.tier === "Gold"
                        ? "bg-gradient-to-r from-yellow-400 to-yellow-200"
                        : "bg-gradient-to-r from-gray-400 to-gray-200"
                    }
                  >
                    <Award className="w-4 h-4 mr-1" />
                    {selectedCustomer.tier}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cari Balans:</span>
                  <span className="text-xl font-bold text-primary">
                    {selectedCustomer.bonusBalance} bonus
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedCustomer && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Cashback Hesablama
              </CardTitle>
              <CardDescription>5% cashback (1 bonus = 10 qəpik)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="amount">Xərclənən məbləğ (AZN)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={spentAmount}
                  onChange={(e) => setSpentAmount(e.target.value)}
                />
              </div>

              {cashbackQuery.data && (
                <div className="p-4 bg-primary/10 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Xərclənən:</span>
                    <span className="font-semibold">{cashbackQuery.data.spentAmount} AZN</span>
                  </div>
                  <div className="flex justify-between">
                    <span>5% Cashback:</span>
                    <span className="font-semibold">
                      {cashbackQuery.data.cashbackAZN.toFixed(2)} AZN
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Əlavə ediləcək bonus:</span>
                    <span className="font-bold text-primary">
                      {cashbackQuery.data.bonusPoints} bonus
                    </span>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="note">Qeyd (isteğe bağlı)</Label>
                <Textarea
                  id="note"
                  placeholder="Əlavə qeyd..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <Button
                onClick={handleAddBonus}
                className="w-full"
                size="lg"
                disabled={!spentAmount || addBonusMutation.isPending}
              >
                {addBonusMutation.isPending ? "Əlavə edilir..." : "Bonus Əlavə Et"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
