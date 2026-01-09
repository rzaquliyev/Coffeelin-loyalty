import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coffee, Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface AdminLoginProps {
  role: "admin" | "cashier";
}

export default function AdminLogin({ role }: AdminLoginProps) {
  const [, setLocation] = useLocation();
  const [pin, setPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyPinMutation = trpc.auth.verifyPin.useMutation({
    onSuccess: (data: { valid: boolean; role: string }) => {
      if (data.valid) {
        // PIN düzgündür, session-a saxla
        localStorage.setItem(`${role}Auth`, "true");
        localStorage.setItem(`${role}AuthTime`, Date.now().toString());
        toast.success(`${role === "admin" ? "Admin" : "Kassir"} panelə xoş gəlmisiniz!`);
        setLocation("/admin");
      } else {
        toast.error("Yanlış PIN kod");
        setPin("");
      }
      setIsVerifying(false);
    },
    onError: (error: any) => {
      toast.error("Xəta: " + error.message);
      setIsVerifying(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pin.length !== 4) {
      toast.error("PIN kod 4 rəqəmdən ibarət olmalıdır");
      return;
    }

    setIsVerifying(true);
    verifyPinMutation.mutate({ pin, role });
  };

  const handlePinChange = (value: string) => {
    // Yalnız rəqəmlərə icazə ver və maksimum 4 rəqəm
    const numericValue = value.replace(/\D/g, "").slice(0, 4);
    setPin(numericValue);
  };

  const roleTitle = role === "admin" ? "Admin Panel" : "Kassir Panel";
  const roleDescription = role === "admin" 
    ? "Admin panelə daxil olmaq üçün PIN kodunuzu daxil edin"
    : "Kassir panelinə daxil olmaq üçün PIN kodunuzu daxil edin";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Coffee className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold">{roleTitle}</CardTitle>
          <CardDescription className="text-base">
            {roleDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pin" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                PIN Kod (4 rəqəm)
              </Label>
              <Input
                id="pin"
                type="password"
                inputMode="numeric"
                placeholder="••••"
                value={pin}
                onChange={(e) => handlePinChange(e.target.value)}
                className="text-center text-2xl tracking-widest"
                maxLength={4}
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isVerifying || pin.length !== 4}
            >
              {isVerifying ? "Yoxlanılır..." : "Daxil ol"}
            </Button>
          </form>

          <div className="pt-4 border-t">
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Əsas səhifəyə qayıt
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
