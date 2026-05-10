import { useState } from "react";
import { Mail, Plus, Pencil, Trash2, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EmailAutomation {
  id: string;
  name: string;
  trigger: string;
  emailTarget: string;
  subject?: string;
  message?: string;
  enabled: boolean;
  lastExecution: string;
}

const TRIGGERS: Record<string, string> = {
  task_created: "عند إنشاء مهمة جديدة",
  deadline_approaching: "قبل موعد التسليم بيوم",
  task_completed: "عند إنجاز المهمة",
  member_added: "عند إضافة عضو جديد",
  task_overdue: "عند تأخر المهمة",
};

const INITIAL_AUTOMATIONS: EmailAutomation[] = [
  {
    id: "1",
    name: "إشعار إنشاء المهمة",
    trigger: "task_created",
    emailTarget: "الفريق بأكمله",
    enabled: true,
    lastExecution: "منذ ساعتين",
  },
  {
    id: "2",
    name: "تذكير قبل الموعد النهائي",
    trigger: "deadline_approaching",
    emailTarget: "المسؤول عن المهمة",
    enabled: true,
    lastExecution: "منذ يوم",
  },
  {
    id: "3",
    name: "إشعار إنجاز المهمة للمدير",
    trigger: "task_completed",
    emailTarget: "مدير المشروع",
    enabled: false,
    lastExecution: "لم يتم التنفيذ بعد",
  },
];

const EMPTY_FORM = {
  name: "",
  trigger: "",
  emailTarget: "",
  subject: "",
  message: "",
};
export function AutomationPage() {
  const [automations, setAutomations] = useState<EmailAutomation[]>(INITIAL_AUTOMATIONS);
  const [editingAutomation, setEditingAutomation] = useState<EmailAutomation | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const toggleAutomation = (id: string, checked: boolean) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: checked } : a))
    );
  };

const openEdit = (automation: EmailAutomation) => {
  setEditingAutomation(automation);

  setForm({
    name: automation.name || "",
    trigger: automation.trigger || "",
    emailTarget: automation.emailTarget || "",
    subject: automation.subject || "",
    message: automation.message || "",
  });
};

  const saveEdit = async () => {
  if (!editingAutomation) return;

  const { error } = await supabase
    .from("automations")
    .update({
      name: form.name,
      trigger: form.trigger,
      email: form.emailTarget,
      subject: form.subject,
      message: form.message,
    })
    .eq("id", editingAutomation.id);

  if (error) {
    alert(error.message);
    return;
  }

  setAutomations((prev) =>
    prev.map((a) =>
      a.id === editingAutomation.id
        ? {
            ...a,
            ...form,
          }
        : a
    )
  );

  setEditingAutomation(null);
  setForm(EMPTY_FORM);
};

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setIsAddDialogOpen(true);
  };

  const saveAdd = async () => {
  if (!form.name || !form.trigger || !form.emailTarget) return;

  const { data, error } = await supabase
    .from("automations")
    .insert([
      {
        name: form.name,
        trigger: form.trigger,
        email: form.emailTarget,
      },
    ])
    .select();

if (error) {
  console.error(error);
  alert(error.message);
  return;
}

  const newAutomation = {
    id: data[0].id,
    name: form.name,
    trigger: form.trigger,
    emailTarget: form.emailTarget,
    enabled: false,
    lastExecution: "لم يتم التنفيذ بعد",
  };

  setAutomations((prev) => [...prev, newAutomation]);

  setIsAddDialogOpen(false);
  setForm(EMPTY_FORM);

  alert("تمت إضافة الأتمتة بنجاح");
};

  const confirmDelete = () => {
    if (!deleteId) return;
    setAutomations((prev) => prev.filter((a) => a.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">الأتمتة</h1>
          <p className="text-muted-foreground text-sm">
            أتمتة إشعارات البريد الإلكتروني تلقائياً بناءً على أحداث مساحة العمل.
          </p>
        </div>
        <Button
          onClick={openAdd}
          data-testid="button-add-automation"
          className="gap-2 shrink-0"
        >
          <Plus size={16} />
          إضافة أتمتة
        </Button>
      </div>

      {/* Email Automation Section */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <div className="p-1.5 rounded-md bg-primary/10 text-primary">
            <Mail size={16} />
          </div>
          <h2 className="font-semibold text-base">أتمتة البريد الإلكتروني</h2>
          <Badge variant="secondary" className="text-xs">
            {automations.filter((a) => a.enabled).length} مفعّلة
          </Badge>
        </div>

        {automations.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <Mail className="mx-auto mb-3 opacity-30" size={32} />
              <p className="text-sm">لا توجد أتمتة بعد. أضف أول أتمتة لك.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {automations.map((automation) => (
              <Card
                key={automation.id}
                data-testid={`automation-card-${automation.id}`}
                className="transition-colors hover:border-border/80"
              >
                <CardContent className="py-5 px-6">
                  <div className="flex items-center gap-4">
                    {/* Status Icon */}
                    <div className="shrink-0">
                      {automation.enabled ? (
                        <CheckCircle2 size={18} className="text-emerald-500" />
                      ) : (
                        <XCircle size={18} className="text-muted-foreground/50" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{automation.name}</span>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            automation.enabled
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {automation.enabled ? "مفعّل" : "معطّل"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>
                          <span className="opacity-60">التشغيل: </span>
                          {TRIGGERS[automation.trigger] ?? automation.trigger}
                        </span>
                        <span>
                          <span className="opacity-60">المستهدف: </span>
                          {automation.emailTarget}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {automation.lastExecution}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch
                        checked={automation.enabled}
                        onCheckedChange={(checked) => toggleAutomation(automation.id, checked)}
                        dir="ltr"
                        data-testid={`switch-automation-${automation.id}`}
                        aria-label="تفعيل أو تعطيل"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => openEdit(automation)}
                        data-testid={`button-edit-automation-${automation.id}`}
                        aria-label="تعديل"
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteId(automation.id)}
                        data-testid={`button-delete-automation-${automation.id}`}
                        aria-label="حذف"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
<Dialog
  open={!!editingAutomation}
  onOpenChange={(open) => !open && setEditingAutomation(null)}
>
  <DialogContent dir="rtl" className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>تعديل الأتمتة</DialogTitle>
    </DialogHeader>

    <div className="space-y-4 py-2">

      <div className="space-y-1.5">
        <Label htmlFor="edit-name">اسم الأتمتة</Label>
        <Input
          id="edit-name"
          value={form.name}
          onChange={(e) =>
            setForm((f) => ({ ...f, name: e.target.value }))
          }
          placeholder="مثال: إشعار إنشاء المهمة"
          data-testid="input-edit-name"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-trigger">التشغيل</Label>

        <Select
          value={form.trigger}
          onValueChange={(v) =>
            setForm((f) => ({ ...f, trigger: v }))
          }
        >
          <SelectTrigger
            id="edit-trigger"
            data-testid="select-edit-trigger"
          >
            <SelectValue placeholder="اختر الحدث..." />
          </SelectTrigger>

          <SelectContent dir="rtl">
            {Object.entries(TRIGGERS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-target">البريد المستهدف</Label>

        <Input
          id="edit-target"
          type="email"
          value={form.emailTarget}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              emailTarget: e.target.value,
            }))
          }
          placeholder="example@email.com"
          data-testid="input-edit-target"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-subject">عنوان الرسالة</Label>

        <Input
          id="edit-subject"
          value={form.subject}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              subject: e.target.value,
            }))
          }
          placeholder="مثال: تم إنشاء مهمة جديدة"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-message">نص الرسالة</Label>

        <Textarea
          id="edit-message"
          value={form.message}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              message: e.target.value,
            }))
          }
          placeholder="اكتب محتوى الرسالة هنا..."
          rows={5}
        />
      </div>

    </div>

    <DialogFooter className="gap-2">
      <Button
        variant="outline"
        onClick={() => setEditingAutomation(null)}
      >
        إلغاء
      </Button>

      <Button
        onClick={saveEdit}
        data-testid="button-save-edit"
      >
        حفظ التغييرات
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

      {/* Add Dialog */}
<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
  <DialogContent dir="rtl" className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>إضافة أتمتة جديدة</DialogTitle>
    </DialogHeader>

    <div className="space-y-4 py-2">

      {/* اسم الأتمتة */}
      <div className="space-y-1.5">
        <Label htmlFor="add-name">اسم الأتمتة</Label>
        <Input
          id="add-name"
          value={form.name}
          onChange={(e) =>
            setForm((f) => ({ ...f, name: e.target.value }))
          }
          placeholder="مثال: إرسال مهمة للمصمم"
          data-testid="input-add-name"
        />
      </div>

      {/* نوع التشغيل */}
      <div className="space-y-1.5">
        <Label htmlFor="add-trigger">نوع التشغيل</Label>

        <Select
          value={form.trigger}
          onValueChange={(v) =>
            setForm((f) => ({ ...f, trigger: v }))
          }
        >
          <SelectTrigger
            id="add-trigger"
            data-testid="select-add-trigger"
          >
            <SelectValue placeholder="اختر الحدث..." />
          </SelectTrigger>

          <SelectContent dir="rtl">
            {Object.entries(TRIGGERS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* البريد المستهدف */}
      <div className="space-y-1.5">
        <Label htmlFor="add-target">البريد المستهدف</Label>

        <Input
          id="add-target"
          type="email"
          value={form.emailTarget}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              emailTarget: e.target.value,
            }))
          }
          placeholder="example@email.com"
          data-testid="input-add-target"
        />
      </div>

      {/* عنوان الرسالة */}
      <div className="space-y-1.5">
        <Label htmlFor="add-subject">عنوان الرسالة</Label>

        <Input
          id="add-subject"
          value={form.subject}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              subject: e.target.value,
            }))
          }
          placeholder="مثال: لديك مهمة جديدة"
        />
      </div>

      {/* نص الرسالة */}
      <div className="space-y-1.5">
        <Label htmlFor="add-message">نص الرسالة</Label>

        <Textarea
          id="add-message"
          value={form.message}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              message: e.target.value,
            }))
          }
          placeholder="اكتب الرسالة التي سيتم إرسالها..."
          rows={5}
        />
      </div>
    </div>

    <DialogFooter className="gap-2">
      <Button
        variant="outline"
        onClick={() => setIsAddDialogOpen(false)}
      >
        إلغاء
      </Button>

      <Button
        onClick={saveAdd}
        disabled={
          !form.name ||
          !form.trigger ||
          !form.emailTarget ||
          !form.subject ||
          !form.message
        }
        data-testid="button-save-add"
      >
        إضافة
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الأتمتة</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه الأتمتة؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
