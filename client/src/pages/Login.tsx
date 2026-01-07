import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Coffee } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [, setLocation] = useLocation();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [isNewCustomer, setIsNewCustomer] = useState(false);

  const [isChecking, setIsChecking] = useState(false);
  const utils = trpc.useUtils();

  const checkCustomerQuery = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Zəhmət olmasa düzgün telefon nömrəsi daxil edin");
      return;
    }

    setIsChecking(true);
    try {
      const data = await utils.client.customer.getByPhone.query({ phoneNumber });
      if (data) {
        localStorage.setItem("customerId", data.id.toString());
        localStorage.setItem("customerName", data.name);
        setLocation("/dashboard");
        toast.success(`Xoş gəlmisiniz, ${data.name}!`);
      } else {
        setIsNewCustomer(true);
      }
    } catch (error: any) {
      toast.error("Xəta baş verdi: " + error.message);
    } finally {
      setIsChecking(false);
    }
  };

  const createCustomer = trpc.customer.create.useMutation({
    onSuccess: () => {
      checkCustomerQuery();
    },
    onError: (error: any) => {
      toast.error("Qeydiyyat zamanı xəta: " + error.message);
    },
  });

  const handleLogin = () => {
    checkCustomerQuery();
  };

  const handleRegister = () => {
    if (!name || name.trim().length === 0) {
      toast.error("Zəhmət olmasa adınızı daxil edin");
      return;
    }

    createCustomer.mutate({
      phoneNumber,
      name: name.trim(),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Coffee className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold">Coffee Lin</CardTitle>
          <CardDescription className="text-base">
            {isNewCustomer ? "Yeni hesab yaradın" : "Bonus proqramına daxil olun"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isNewCustomer ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon nömrəsi</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+994 XX XXX XX XX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="text-lg"
                />
              </div>
              <Button
                onClick={handleLogin}
                className="w-full"
                size="lg"
                disabled={isChecking}
              >
                {isChecking ? "Yoxlanılır..." : "Daxil ol"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Adınız</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ad Soyad"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>Telefon nömrəsi</Label>
                <Input
                  type="tel"
                  value={phoneNumber}
                  disabled
                  className="text-lg bg-muted"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setIsNewCustomer(false);
                    setName("");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Geri
                </Button>
                <Button
                  onClick={handleRegister}
                  className="flex-1"
                  disabled={createCustomer.isPending}
                >
                  {createCustomer.isPending ? "Yaradılır..." : "Qeydiyyat"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
