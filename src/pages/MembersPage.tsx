import { useState } from "react";
import { Search, Plus, Edit2, Mail, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Member {
  id: number;
  name: string;
  role: string;
  email: string;
  status: "نشط" | "غير نشط";
}

const SAMPLE_MEMBERS: Member[] = [
  { id: 1, name: "أحمد محمد", role: "مدير المشروع", email: "ahmed@company.com", status: "نشط" },
  { id: 2, name: "سارة علي", role: "مطوّرة واجهات", email: "sara@company.com", status: "نشط" },
  { id: 3, name: "محمد خالد", role: "مطوّر خلفية", email: "mohammed@company.com", status: "غير نشط" },
  { id: 4, name: "فاطمة حسن", role: "مصممة UX", email: "fatima@company.com", status: "نشط" },
];

const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return '#' + '00000'.substring(0, 6 - c.length) + c;
};

export function MembersPage() {
  const [search, setSearch] = useState("");

  const filteredMembers = SAMPLE_MEMBERS.filter(member => 
    member.name.toLowerCase().includes(search.toLowerCase()) || 
    member.role.toLowerCase().includes(search.toLowerCase()) ||
    member.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">الأعضاء</h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button data-testid="button-add-member">
              <Plus className="ml-2 h-4 w-4" />
              إضافة عضو
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة عضو جديد</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">الاسم</Label>
                <Input id="name" placeholder="أدخل اسم العضو" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">الدور</Label>
                <Input id="role" placeholder="مثال: مطور، مصمم" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" type="email" placeholder="email@example.com" dir="ltr" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">الحالة</Label>
                <Select defaultValue="نشط" dir="rtl">
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="نشط">نشط</SelectItem>
                    <SelectItem value="غير نشط">غير نشط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">إلغاء</Button>
              </DialogClose>
              <Button type="submit" data-testid="button-save-member">حفظ</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="البحث عن عضو..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10"
          data-testid="input-search-members"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="overflow-hidden" data-testid={`member-card-${member.id}`}>
            <CardContent className="p-0">
              <div className="p-6 flex flex-col items-center text-center">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold text-white mb-4 shadow-sm"
                  style={{ backgroundColor: stringToColor(member.name) }}
                >
                  {member.name.split(" ").map(n => n[0]).join("")}
                </div>
                <h3 className="font-bold text-lg mb-1">{member.name}</h3>
                <Badge 
                  variant="secondary" 
                  className={`mb-4 ${member.status === 'نشط' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}
                >
                  {member.status}
                </Badge>
                
                <div className="w-full space-y-2 text-sm text-muted-foreground text-right mt-2">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span>{member.role}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="truncate" dir="ltr">{member.email}</span>
                  </div>
                </div>
              </div>
              <div className="bg-muted/50 p-3 flex justify-end border-t border-border">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 gap-1">
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>تعديل</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]" dir="rtl">
                    <DialogHeader>
                      <DialogTitle>تعديل بيانات العضو</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor={`name-${member.id}`}>الاسم</Label>
                        <Input id={`name-${member.id}`} defaultValue={member.name} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`role-${member.id}`}>الدور</Label>
                        <Input id={`role-${member.id}`} defaultValue={member.role} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`email-${member.id}`}>البريد الإلكتروني</Label>
                        <Input id={`email-${member.id}`} defaultValue={member.email} dir="ltr" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`status-${member.id}`}>الحالة</Label>
                        <Select defaultValue={member.status} dir="rtl">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="نشط">نشط</SelectItem>
                            <SelectItem value="غير نشط">غير نشط</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="secondary">إلغاء</Button>
                      </DialogClose>
                      <Button type="submit">حفظ التغييرات</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredMembers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          لم يتم العثور على أعضاء تطابق بحثك.
        </div>
      )}
    </div>
  );
}
