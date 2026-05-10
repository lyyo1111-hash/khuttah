import { useState } from "react";
import { Search, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type TaskStatus = "معلّق" | "مُرسل" | "مُنجز";
type TaskPriority = "منخفض" | "متوسط" | "مرتفع" | "عاجل";

interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate: string;
}

const SAMPLE_TASKS: Task[] = [
  { id: 1, title: "مراجعة التقرير الشهري", status: "مُنجز", priority: "متوسط", assignee: "أحمد محمد", dueDate: "2023-11-15" },
  { id: 2, title: "إصلاح خطأ في صفحة تسجيل الدخول", status: "معلّق", priority: "عاجل", assignee: "سارة علي", dueDate: "2023-11-16" },
  { id: 3, title: "تحديث قاعدة البيانات", status: "مُرسل", priority: "مرتفع", assignee: "محمد خالد", dueDate: "2023-11-18" },
  { id: 4, title: "إعداد اجتماع الفريق الأسبوعي", status: "معلّق", priority: "منخفض", assignee: "فاطمة حسن", dueDate: "2023-11-20" },
  { id: 5, title: "كتابة وثائق API", status: "مُرسل", priority: "متوسط", assignee: "أحمد محمد", dueDate: "2023-11-22" },
  { id: 6, title: "تصميم واجهة المستخدم الجديدة", status: "معلّق", priority: "مرتفع", assignee: "سارة علي", dueDate: "2023-11-25" },
];

const statusColors: Record<TaskStatus, string> = {
  "معلّق": "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  "مُرسل": "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  "مُنجز": "bg-green-500/10 text-green-500 hover:bg-green-500/20",
};

const priorityColors: Record<TaskPriority, string> = {
  "منخفض": "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20",
  "متوسط": "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  "مرتفع": "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
  "عاجل": "bg-red-500/10 text-red-500 hover:bg-red-500/20",
};

export function TasksPage() {
  const [search, setSearch] = useState("");

  const filteredTasks = SAMPLE_TASKS.filter(task => 
    task.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">المهام</h1>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="البحث في المهام..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10"
          data-testid="input-search-tasks"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="hover:border-primary/50 transition-colors" data-testid={`task-card-${task.id}`}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg line-clamp-2" title={task.title}>{task.title}</h3>
              </div>
              <div className="flex gap-2 mb-6">
                <Badge variant="secondary" className={statusColors[task.status]}>
                  {task.status}
                </Badge>
                <Badge variant="secondary" className={priorityColors[task.priority]}>
                  {task.priority}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-xs font-medium text-accent-foreground">
                    {task.assignee.split(" ").map(n => n[0]).join("")}
                  </div>
                  <span>{task.assignee}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{task.dueDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredTasks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          لم يتم العثور على مهام تطابق بحثك.
        </div>
      )}
    </div>
  );
}
