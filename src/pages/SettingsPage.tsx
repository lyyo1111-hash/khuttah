import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export function SettingsPage() {
  const [workspaceName, setWorkspaceName] = useState("شركتي");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">الإعدادات</h1>
        <p className="text-muted-foreground">إدارة إعدادات مساحة العمل والتفضيلات الخاصة بك.</p>
      </div>

      <div className="space-y-6">
        {/* Section 1: General */}
        <Card>
          <CardHeader>
            <CardTitle>عام</CardTitle>
            <CardDescription>الإعدادات الأساسية لمساحة العمل.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">اسم مساحة العمل</Label>
              <Input 
                id="workspace-name" 
                value={workspaceName} 
                onChange={(e) => setWorkspaceName(e.target.value)} 
                data-testid="input-workspace-name"
                className="max-w-md"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-endpoint">API Endpoint</Label>
              <Input 
                id="api-endpoint" 
                placeholder="https://api.example.com" 
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                data-testid="input-api-endpoint"
                className="max-w-md"
                dir="ltr"
              />
            </div>
            <Button data-testid="button-save-general">حفظ التغييرات</Button>
          </CardContent>
        </Card>

        {/* Section 2: Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>الإشعارات</CardTitle>
            <CardDescription>تحكم في كيفية تلقي الإشعارات.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">تفعيل الإشعارات</Label>
                <p className="text-sm text-muted-foreground">استلام الإشعارات داخل التطبيق.</p>
              </div>
              <Switch 
                checked={notifications} 
                onCheckedChange={setNotifications} 
                data-testid="switch-notifications"
                dir="ltr"
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">إشعارات البريد الإلكتروني</Label>
                <p className="text-sm text-muted-foreground">استلام ملخص يومي عبر البريد الإلكتروني.</p>
              </div>
              <Switch 
                checked={emailNotifications} 
                onCheckedChange={setEmailNotifications} 
                data-testid="switch-email-notifications"
                dir="ltr"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 3: About */}
        <Card>
          <CardHeader>
            <CardTitle>حول التطبيق</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 max-w-sm">
              <div className="text-sm text-muted-foreground">إصدار التطبيق</div>
              <div className="text-sm font-medium" data-testid="text-app-version">1.0.0</div>
              
              <div className="text-sm text-muted-foreground">الثيم الحالي</div>
              <div className="text-sm font-medium" data-testid="text-current-theme">داكن</div>
            </div>
            <div className="pt-4 text-sm text-muted-foreground border-t border-border mt-4">
              تدبير — منصة إدارة الفريق
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
