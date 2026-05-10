import { useNavigate } from "react-router-dom";
import { Hexagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <Card className="w-full max-w-md border-border/50 shadow-lg">
        <CardHeader className="space-y-4 text-center items-center pt-8">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-2">
            <Hexagon size={24} />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight">تدبير</CardTitle>
            <CardDescription className="text-base">مرحباً بعودتك</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="البريد الإلكتروني" 
                required 
                data-testid="input-email"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">كلمة المرور</Label>
                <a href="#" className="text-sm text-primary hover:underline" data-testid="link-forgot-password">
                  نسيت كلمة المرور؟
                </a>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="كلمة المرور" 
                required 
                data-testid="input-password"
                className="h-11"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 text-base font-medium" 
              data-testid="button-submit-login"
            >
              تسجيل الدخول
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
