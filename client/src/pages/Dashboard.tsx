import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { Coffee, LogOut, Award, TrendingUp, QrCode as QrCodeIcon, UserCog } from "lucide-react";
import { toast } from "sonner";
import QRCode from "react-qr-code";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState<string>("");

  useEffect(() => {
    const id = localStorage.getItem("customerId");
    const name = localStorage.getItem("customerName");
    
    if (!id) {
      setLocation("/");
      return;
    }
    
    setCustomerId(parseInt(id));
    setCustomerName(name || "");
  }, [setLocation]);

  const { data: customer, isLoading } = trpc.customer.getById.useQuery(
    { id: customerId! },
    { enabled: !!customerId }
  );

  const { data: transactions } = trpc.transaction.getByCustomerId.useQuery(
    { customerId: customerId! },
    { enabled: !!customerId }
  );

  // Tier info hesablama
  const tierInfo = customer
    ? {
        current: customer.tier,
        next: customer.bonusBalance >= 200 ? null : customer.bonusBalance >= 100 ? "Platinum" : "Gold",
        pointsToNext: customer.bonusBalance >= 200 ? 0 : customer.bonusBalance >= 100 ? 200 - customer.bonusBalance : 100 - customer.bonusBalance,
      }
    : null;

  const handleLogout = () => {
    localStorage.removeItem("customerId");
    localStorage.removeItem("customerName");
    setLocation("/");
    toast.success("Çıxış edildi");
  };

  if (isLoading || !customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Platinum":
        return "bg-gradient-to-r from-gray-300 to-white text-gray-800";
      case "Gold":
        return "bg-gradient-to-r from-yellow-400 to-yellow-200 text-yellow-900";
      case "Silver":
        return "bg-gradient-to-r from-gray-400 to-gray-200 text-gray-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const bonusInAzn = (customer.bonusBalance * 0.1).toFixed(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Coffee className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Coffee Lin</h1>
              <p className="text-sm text-muted-foreground">Bonus Proqramı</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setLocation("/admin")}>
              <UserCog className="w-4 h-4 mr-2" />
              Admin
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Çıxış
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-6 space-y-6 max-w-2xl">
        {/* Welcome Card */}
        <Card>
          <CardHeader>
            <CardTitle>Xoş gəlmisiniz, {customerName}!</CardTitle>
            <CardDescription>Telefon: {customer.phoneNumber}</CardDescription>
          </CardHeader>
        </Card>

        {/* Bonus Balance Card */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Bonus Balansınız</span>
              <Badge className={getTierColor(customer.tier)} variant="secondary">
                <Award className="w-4 h-4 mr-1" />
                {customer.tier}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="text-5xl font-bold text-primary">
                {customer.bonusBalance}
              </div>
              <div className="text-2xl text-muted-foreground">
                ≈ {bonusInAzn} AZN
              </div>
              <p className="text-sm text-muted-foreground">
                1 bonus = 10 qəpik
              </p>
            </div>

            {tierInfo && tierInfo.next && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium">
                    {tierInfo.next}-a qədər
                  </span>
                  <span className="text-primary font-bold">
                    {tierInfo.pointsToNext} bonus
                  </span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${
                        ((customer.bonusBalance /
                          (customer.bonusBalance + tierInfo.pointsToNext)) *
                          100)
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* QR Code Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCodeIcon className="w-5 h-5" />
              QR Kodunuz
            </CardTitle>
            <CardDescription>
              Kafedə bu QR kodu göstərərək bonus əlavə edə bilərsiniz
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <QRCode
                value={`COFFEE_LIN:${customer.id}:${customer.phoneNumber}`}
                size={200}
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Son Əməliyyatlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions && transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((tx) => (
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
                            year: "numeric",
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
              <p className="text-center text-muted-foreground py-8">
                Hələ əməliyyat yoxdur
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
