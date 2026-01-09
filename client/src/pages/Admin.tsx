import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Coffee, Scan, Calculator, Award, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";
import QRScanner from "@/components/QRScanner";

export default function Admin() {
  const [, setLocation] = useLocation();

  // PIN autentifikasiya yoxlaması - yalnız admin
  useEffect(() => {
    const adminAuth = localStorage.getItem("adminAuth");
    const adminAuthTime = localStorage.getItem("adminAuthTime");

    // Session 8 saat sonra bitir
    const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 saat

    const isAdminValid = adminAuth === "true" && adminAuthTime && (Date.now() - parseInt(adminAuthTime)) < SESSION_DURATION;

    if (!isAdminValid) {
      toast.error("Admin PIN kodu tələb olunur");
      setLocation("/admin-login");
    }
  }, [setLocation]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [spentAmount, setSpentAmount] = useState("");
  const [note, setNote] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [manualBonusAmount, setManualBonusAmount] = useState("");
  const [manualNote, setManualNote] = useState("");

  const utils = trpc.useUtils();

  const { data: allCustomers } = trpc.customer.list.useQuery();

  const { data: allTransactions } = trpc.transaction.list.useQuery();

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
      utils.customer.list.invalidate();
      utils.transaction.list.invalidate();
    },
    onError: (error: any) => {
      toast.error("Xəta: " + error.message);
    },
  });

  const manualBonusMutation = trpc.transaction.create.useMutation({
    onSuccess: () => {
      toast.success("Bonus uğurla yeniləndi!");
      setManualBonusAmount("");
      setManualNote("");
      utils.customer.getById.invalidate({ id: selectedCustomer.id });
      utils.customer.list.invalidate();
      utils.transaction.list.invalidate();
      // Müştəri məlumatlarını yenilə
      handleSearchCustomer();
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

  const handleManualBonus = (action: "add" | "deduct") => {
    if (!selectedCustomer) {
      toast.error("Əvvəlcə müştəri axtarın");
      return;
    }

    if (!manualBonusAmount || parseFloat(manualBonusAmount) <= 0) {
      toast.error("Bonus miqdarını daxil edin");
      return;
    }

    const amount = parseFloat(manualBonusAmount);
    const finalAmount = action === "deduct" ? -amount : amount;
    const type = action === "deduct" ? "redeemed" : "earned";

    manualBonusMutation.mutate({
      customerId: selectedCustomer.id,
      amount: Math.abs(finalAmount),
      note: manualNote || (action === "deduct" ? "Admin tərəfindən azaldıldı" : "Admin tərəfindən əlavə edildi"),
      spentAmount: undefined,
      type: type as "earned" | "redeemed",
    });
  };

  const handleQRScan = async (data: string) => {
    try {
      // QR koddan telefon nömrəsi və ya PassKit Member ID çıxarmaq
      // PassKit QR kod formatı: passkit://member/{memberId}
      let searchValue = data;
      
      if (data.includes("passkit://") || data.includes("member/")) {
        // PassKit Member ID ilə axtarış
        const memberId = data.split("/").pop() || data;
        toast.info("PassKit Member ID ilə axtarılır...");
        // TODO: PassKit Member ID ilə müştəri axtarışı
        // const customer = await utils.client.customer.getByPassKitId.query({ passkitMemberId: memberId });
        toast.error("PassKit inteqrasiya hələ aktiv deyil. Telefon nömrəsi ilə axtarın.");
        return;
      } else if (data.startsWith("+") || /^\d+$/.test(data)) {
        // Telefon nömrəsi
        searchValue = data;
      } else {
        // JSON format və ya başqa format
        try {
          const parsed = JSON.parse(data);
          searchValue = parsed.phone || parsed.phoneNumber || parsed.memberId || data;
        } catch {
          searchValue = data;
        }
      }

      setPhoneNumber(searchValue);
      const customer = await utils.client.customer.getByPhone.query({ phoneNumber: searchValue });
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

  // PIN autentifikasiya artıq useEffect-də yoxlanılır

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Coffee className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Coffee Lin - Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Admin Panel</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        <Tabs defaultValue="add-bonus" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="add-bonus">
              <Scan className="w-4 h-4 mr-2" />
              Bonus Əlavə Et
            </TabsTrigger>
            <TabsTrigger value="customers">
              <Users className="w-4 h-4 mr-2" />
              Müştərilər
            </TabsTrigger>
            <TabsTrigger value="transactions">
              <TrendingUp className="w-4 h-4 mr-2" />
              Əməliyyatlar
            </TabsTrigger>
          </TabsList>

          {/* Add Bonus Tab */}
          <TabsContent value="add-bonus" className="space-y-4">
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
              <>
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

                {/* Manual Bonus Əlave/Azaltma */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Əlave Bonus Əlave/Azaltma
                    </CardTitle>
                    <CardDescription>
                      Müştəriyə istədiyiniz miqdarda bonus əlavə edin və ya azaldın
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="manualBonus">Bonus miqdarı</Label>
                      <Input
                        id="manualBonus"
                        type="number"
                        placeholder="0"
                        value={manualBonusAmount}
                        onChange={(e) => setManualBonusAmount(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Müsbət ədəd əlavə edir, mənfi ədəd azaldır
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="manualNote">Qeyd</Label>
                      <Textarea
                        id="manualNote"
                        placeholder="Səbəb qeyd edin..."
                        value={manualNote}
                        onChange={(e) => setManualNote(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => handleManualBonus("add")}
                        className="w-full"
                        disabled={!manualBonusAmount || parseFloat(manualBonusAmount) <= 0 || manualBonusMutation.isPending}
                        variant="default"
                      >
                        {manualBonusMutation.isPending ? "Əlavə edilir..." : "Bonus Əlavə Et"}
                      </Button>
                      <Button
                        onClick={() => handleManualBonus("deduct")}
                        className="w-full"
                        disabled={!manualBonusAmount || parseFloat(manualBonusAmount) <= 0 || manualBonusMutation.isPending}
                        variant="destructive"
                      >
                        {manualBonusMutation.isPending ? "Azaldılır..." : "Bonus Azalt"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle>Bütün Müştərilər</CardTitle>
                <CardDescription>
                  Toplam: {allCustomers?.length || 0} müştəri
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allCustomers && allCustomers.length > 0 ? (
                  <div className="space-y-3">
                    {allCustomers.map((customer: any) => (
                      <div key={customer.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{customer.name}</p>
                            <p className="text-sm text-muted-foreground">{customer.phoneNumber}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary">{customer.tier}</Badge>
                            <p className="text-sm font-bold text-primary mt-1">
                              {customer.bonusBalance} bonus
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">Müştəri yoxdur</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Son Əməliyyatlar</CardTitle>
                <CardDescription>
                  Toplam: {allTransactions?.length || 0} əməliyyat
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allTransactions && allTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {allTransactions.slice(0, 20).map((tx) => (
                      <div key={tx.id}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {tx.type === "earned" ? "Bonus əlavə edildi" : "Bonus istifadə edildi"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(tx.createdAt).toLocaleDateString("az-AZ", {
                                day: "numeric",
                                month: "long",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            {tx.note && (
                              <p className="text-xs text-muted-foreground">{tx.note}</p>
                            )}
                          </div>
                          <div
                            className={`text-lg font-bold ${
                              tx.type === "earned" ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {tx.type === "earned" ? "+" : "-"}
                            {tx.amount}
                          </div>
                        </div>
                        <Separator className="mt-3" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">Əməliyyat yoxdur</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        open={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={handleQRScan}
      />
    </div>
  );
}
