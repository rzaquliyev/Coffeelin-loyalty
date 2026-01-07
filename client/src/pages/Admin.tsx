import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
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
import { getLoginUrl } from "@/const";

export default function Admin() {
  const { user, loading } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [spentAmount, setSpentAmount] = useState("");
  const [note, setNote] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const utils = trpc.useUtils();

  const { data: allCustomers } = trpc.customer.getAll.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  const { data: allTransactions } = trpc.transaction.getAll.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  const cashbackQuery = trpc.loyalty.calculateCashback.useQuery(
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
      utils.customer.getAll.invalidate();
      utils.transaction.getAll.invalidate();
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
      type: "earned",
      amount: bonusAmount,
      spentAmount: `${spentAmount} AZN`,
      note: note || `Xərcləmə: ${spentAmount} AZN`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Paneli</CardTitle>
            <CardDescription>Daxil olmaq üçün giriş edin</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => (window.location.href = getLoginUrl())} className="w-full">
              Giriş et
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Giriş qadağandır</CardTitle>
            <CardDescription>Bu səhifəyə yalnız adminlər daxil ola bilər</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

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
              <p className="text-sm text-muted-foreground">İşçi: {user.name}</p>
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
                  <div className="flex items-end">
                    <Button onClick={handleSearchCustomer}>Axtar</Button>
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
                            {cashbackQuery.data.cashbackAzn.toFixed(2)} AZN
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
                    {allCustomers.map((customer) => (
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
    </div>
  );
}
