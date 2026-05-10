import { motion } from "framer-motion";
import { CheckSquare, Users, Bell, PlusCircle, CheckCircle2, Zap, AlertCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { title: "عدد المهام", value: "24", icon: CheckSquare },
  { title: "عدد الأعضاء", value: "8", icon: Users },
  { title: "عدد الإشعارات", value: "5", icon: Bell },
];

const activities = [
  { text: "تم إنشاء مهمة جديدة: مراجعة التقرير الشهري", time: "منذ دقيقتين", icon: PlusCircle },
  { text: "انضم عضو جديد: أحمد محمد", time: "منذ ساعة", icon: Users },
  { text: "تم تحديث حالة المهمة إلى مُنجز", time: "منذ 3 ساعات", icon: CheckCircle2 },
  { text: "تم تفعيل أتمتة البريد الإلكتروني", time: "منذ يوم", icon: Zap },
  { text: "تم إضافة مهمة عاجلة: إصلاح خطأ في النظام", time: "منذ يومين", icon: AlertCircle },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">لوحة التحكم</h1>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-3"
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={i} variants={item}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid={`stat-${i}`}>{stat.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>النشاط الأخير</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {activities.map((activity, i) => {
                const Icon = activity.icon;
                return (
                  <div key={i} className="flex items-start gap-4">
                    <div className="mt-0.5 bg-primary/10 p-2 rounded-full text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.text}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3 ml-1" />
                        {activity.time}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
