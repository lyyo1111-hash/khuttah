import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  CircleAlert,
  ListTodo,
  Minus,
  Plus,
  Trash2,
  X,
} from "lucide-react";

type Task = {
  id: string;
  title: string;
  completed: boolean;
};

type PlanDay = {
  dayNumber: number;
  isoDate: string;
  tasks: Task[];
};

type StoredPlan = {
  startDate: string;
  dayCount: number;
  tasksByDate: Record<string, Task[]>;
};

type LegacyStoredPlan = Partial<StoredPlan> & {
  days?: Array<{ isoDate: string; tasks?: Task[] }>;
};

type Filter = "all" | "completed" | "incomplete";
type DayStatus = "complete" | "incomplete" | "idle";

const DEFAULT_DAY_COUNT = 14;
const MIN_DAY_COUNT = 1;
const MAX_DAY_COUNT = 60;
const STORAGE_KEY = "fourteen-day-plan-tracker";

const dateFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const weekdayFormatter = new Intl.DateTimeFormat("ar-SA", {
  weekday: "long",
});

function createTaskId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clampDayCount(value: number) {
  if (!Number.isFinite(value)) {
    return DEFAULT_DAY_COUNT;
  }

  return Math.min(MAX_DAY_COUNT, Math.max(MIN_DAY_COUNT, Math.round(value)));
}

function toIsoDate(date: Date) {
  const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const timezoneOffset = localDate.getTimezoneOffset() * 60_000;
  return new Date(localDate.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function parseLocalDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(isoDate: string, amount: number) {
  const date = parseLocalDate(isoDate);
  date.setDate(date.getDate() + amount);
  return toIsoDate(date);
}

function formatDate(isoDate: string) {
  return dateFormatter.format(parseLocalDate(isoDate));
}

function formatWeekday(isoDate: string) {
  return weekdayFormatter.format(parseLocalDate(isoDate));
}

function normalizeTask(task: Partial<Task>): Task {
  return {
    id: task.id || createTaskId(),
    title: task.title || "",
    completed: Boolean(task.completed),
  };
}

function normalizeTasksByDate(plan: LegacyStoredPlan) {
  const tasksByDate: Record<string, Task[]> = {};

  if (plan.tasksByDate && typeof plan.tasksByDate === "object") {
    Object.entries(plan.tasksByDate).forEach(([isoDate, tasks]) => {
      tasksByDate[isoDate] = Array.isArray(tasks)
        ? tasks.map((task) => normalizeTask(task))
        : [];
    });
  }

  if (Array.isArray(plan.days)) {
    plan.days.forEach((day) => {
      if (!day.isoDate) {
        return;
      }

      tasksByDate[day.isoDate] = Array.isArray(day.tasks)
        ? day.tasks.map((task) => normalizeTask(task))
        : [];
    });
  }

  return tasksByDate;
}

function createEmptyPlan(today: string): StoredPlan {
  return {
    startDate: today,
    dayCount: DEFAULT_DAY_COUNT,
    tasksByDate: {},
  };
}

function normalizeStoredPlan(plan: LegacyStoredPlan, today: string): StoredPlan {
  return {
    startDate: today,
    dayCount: clampDayCount(plan.dayCount || plan.days?.length || DEFAULT_DAY_COUNT),
    tasksByDate: normalizeTasksByDate(plan),
  };
}

function loadPlan(today: string): StoredPlan {
  if (typeof window === "undefined") {
    return createEmptyPlan(today);
  }

  try {
    const storedPlan = window.localStorage.getItem(STORAGE_KEY);
    if (!storedPlan) {
      return createEmptyPlan(today);
    }

    return normalizeStoredPlan(JSON.parse(storedPlan), today);
  } catch {
    return createEmptyPlan(today);
  }
}

function getVisibleDays(plan: StoredPlan): PlanDay[] {
  return Array.from({ length: plan.dayCount }, (_, index) => {
    const isoDate = addDays(plan.startDate, index);

    return {
      dayNumber: index + 1,
      isoDate,
      tasks: plan.tasksByDate[isoDate] || [],
    };
  });
}

function getDayStatus(day: PlanDay, today: string): DayStatus {
  if (day.isoDate > today || day.tasks.length === 0) {
    return "idle";
  }

  return day.tasks.every((task) => task.completed) ? "complete" : "incomplete";
}

function getDayStatusLabel(day: PlanDay, today: string) {
  const status = getDayStatus(day, today);

  if (status === "complete") {
    return "مكتمل";
  }

  if (status === "incomplete") {
    return "غير مكتمل";
  }

  return day.tasks.length === 0 ? "بدون مهام" : "لم يبدأ";
}

function renderStatusIcon(status: DayStatus) {
  if (status === "complete") {
    return <CheckCircle2 size={22} aria-hidden="true" />;
  }

  if (status === "incomplete") {
    return <CircleAlert size={22} aria-hidden="true" />;
  }

  return <Circle size={22} aria-hidden="true" />;
}

function App() {
  const today = toIsoDate(new Date());
  const [plan, setPlan] = useState<StoredPlan>(() => loadPlan(today));
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [drawerDraft, setDrawerDraft] = useState("");
  const taskInputRef = useRef<HTMLInputElement>(null);

  const days = useMemo(() => getVisibleDays(plan), [plan]);
  const selectedDay = days.find((day) => day.isoDate === selectedDate) || null;
  const planEndDate = addDays(plan.startDate, plan.dayCount - 1);

  useEffect(() => {
    if (plan.startDate !== today) {
      setPlan((currentPlan) => ({ ...currentPlan, startDate: today }));
    }
  }, [plan.startDate, today]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  }, [plan]);

  useEffect(() => {
    if (selectedDate && !days.some((day) => day.isoDate === selectedDate)) {
      setSelectedDate(null);
    }
  }, [days, selectedDate]);

  useEffect(() => {
    if (!selectedDate) {
      return;
    }

    setDrawerDraft("");
    window.setTimeout(() => taskInputRef.current?.focus(), 120);
  }, [selectedDate]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedDate(null);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const stats = useMemo(() => {
    const allTasks = days.flatMap((day) => day.tasks);
    const completedTasks = allTasks.filter((task) => task.completed).length;
    const completedDays = days.filter(
      (day) => getDayStatus(day, today) === "complete",
    ).length;
    const incompleteDays = days.filter(
      (day) => getDayStatus(day, today) === "incomplete",
    ).length;

    return {
      totalTasks: allTasks.length,
      completedTasks,
      completedDays,
      incompleteDays,
      progress: allTasks.length
        ? Math.round((completedTasks / allTasks.length) * 100)
        : 0,
    };
  }, [days, today]);

  const filteredDays = useMemo(
    () =>
      days.filter((day) => {
        const status = getDayStatus(day, today);

        if (filter === "completed") {
          return status === "complete";
        }

        if (filter === "incomplete") {
          return status === "incomplete";
        }

        return true;
      }),
    [days, filter, today],
  );

  const filterOptions: Array<{ id: Filter; label: string; count: number }> = [
    { id: "all", label: "الكل", count: days.length },
    { id: "completed", label: "المكتمل", count: stats.completedDays },
    { id: "incomplete", label: "غير المكتمل", count: stats.incompleteDays },
  ];

  const updateDayCount = (nextDayCount: number) => {
    setPlan((currentPlan) => ({
      ...currentPlan,
      startDate: today,
      dayCount: clampDayCount(nextDayCount),
    }));
  };

  const updateTasksForDay = (
    isoDate: string,
    updater: (tasks: Task[]) => Task[],
  ) => {
    setPlan((currentPlan) => ({
      ...currentPlan,
      startDate: today,
      tasksByDate: {
        ...currentPlan.tasksByDate,
        [isoDate]: updater(currentPlan.tasksByDate[isoDate] || []),
      },
    }));
  };

  const openDayDrawer = (isoDate: string) => {
    setSelectedDate(isoDate);
  };

  const addTask = (isoDate: string) => {
    const taskTitle = drawerDraft.trim();
    if (!taskTitle) {
      return;
    }

    updateTasksForDay(isoDate, (tasks) => [
      ...tasks,
      { id: createTaskId(), title: taskTitle, completed: false },
    ]);
    setDrawerDraft("");
    window.setTimeout(() => taskInputRef.current?.focus(), 0);
  };

  const updateTaskTitle = (isoDate: string, taskId: string, title: string) => {
    updateTasksForDay(isoDate, (tasks) =>
      tasks.map((task) => (task.id === taskId ? { ...task, title } : task)),
    );
  };

  const toggleTask = (isoDate: string, taskId: string) => {
    updateTasksForDay(isoDate, (tasks) =>
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const deleteTask = (isoDate: string, taskId: string) => {
    updateTasksForDay(isoDate, (tasks) =>
      tasks.filter((task) => task.id !== taskId),
    );
  };

  return (
    <main className="app-shell" dir="rtl">
      <header className="app-header">
        <div className="header-content">
          <div className="title-block">
            <span className="eyebrow">
              <CalendarDays size={18} aria-hidden="true" />
              يبدأ من اليوم
            </span>
            <h1> خُطّة </h1>
            <p>
              {formatDate(plan.startDate)} - {formatDate(planEndDate)}
            </p>
          </div>

          <section className="progress-card" aria-label="نسبة إنجاز الخطة">
            <div className="progress-card-top">
              <span>التقدم الكلي</span>
              <strong>{stats.progress}%</strong>
            </div>
            <div className="progress-track" aria-hidden="true">
              <span
                className="progress-fill"
                style={{ width: `${stats.progress}%` }}
              />
            </div>
            <div className="progress-meta">
              <span>{stats.completedTasks} مكتملة</span>
              <span>{stats.totalTasks} مهمة</span>
            </div>
          </section>
        </div>
      </header>

      <section className="dashboard-bar" aria-label="إعدادات وملخص الخطة">
        <div className="metric-card">
          <span>الأيام</span>
          <strong>{plan.dayCount}</strong>
        </div>
        <div className="metric-card">
          <span>المكتمل</span>
          <strong>{stats.completedDays}</strong>
        </div>
        <div className="metric-card">
          <span>غير المكتمل</span>
          <strong>{stats.incompleteDays}</strong>
        </div>
        <div className="days-control">
          <span>عدد الأيام</span>
          <div className="stepper">
            <button
              aria-label="تقليل عدد الأيام"
              onClick={() => updateDayCount(plan.dayCount - 1)}
              type="button"
            >
              <Minus size={16} aria-hidden="true" />
            </button>
            <input
              aria-label="عدد أيام الخطة"
              max={MAX_DAY_COUNT}
              min={MIN_DAY_COUNT}
              onChange={(event) => updateDayCount(Number(event.target.value))}
              type="number"
              value={plan.dayCount}
            />
            <button
              aria-label="زيادة عدد الأيام"
              onClick={() => updateDayCount(plan.dayCount + 1)}
              type="button"
            >
              <Plus size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      <section className="planner-controls" aria-label="فلترة الأيام">
        <div className="segmented-control">
          {filterOptions.map((option) => (
            <button
              className={filter === option.id ? "active" : ""}
              key={option.id}
              onClick={() => setFilter(option.id)}
              type="button"
            >
              <span>{option.label}</span>
              <strong>{option.count}</strong>
            </button>
          ))}
        </div>
      </section>

      <section className="timeline-grid" aria-label="أيام الخطة">
        {filteredDays.map((day) => {
          const status = getDayStatus(day, today);
          const statusLabel = getDayStatusLabel(day, today);

          return (
            <article className={`day-card status-${status}`} key={day.isoDate}>
              <div className="day-card-top">
                <span className="day-number">اليوم {day.dayNumber}</span>
                <span
                  aria-label={statusLabel}
                  className={`status-icon ${status}`}
                  role="img"
                  title={statusLabel}
                >
                  {renderStatusIcon(status)}
                </span>
              </div>

              <div className="day-card-main">
                <h2>{formatWeekday(day.isoDate)}</h2>
                <p>{formatDate(day.isoDate)}</p>
              </div>

              <div className="day-actions">
                <button
                  aria-label={`عرض مهام اليوم ${day.dayNumber}`}
                  className="icon-button"
                  onClick={() => openDayDrawer(day.isoDate)}
                  title="عرض المهام"
                  type="button"
                >
                  <ListTodo size={19} aria-hidden="true" />
                </button>
                <button
                  aria-label={`إضافة مهمة لليوم ${day.dayNumber}`}
                  className="icon-button primary"
                  onClick={() => openDayDrawer(day.isoDate)}
                  title="إضافة مهمة"
                  type="button"
                >
                  <Plus size={19} aria-hidden="true" />
                </button>
              </div>
            </article>
          );
        })}
      </section>

      {filteredDays.length === 0 && (
        <p className="filter-empty">لا توجد أيام ضمن هذه الفلترة.</p>
      )}

      {selectedDay && (
        <div className="drawer-layer">
          <button
            aria-label="إغلاق درج المهام"
            className="drawer-backdrop"
            onClick={() => setSelectedDate(null)}
            type="button"
          />
          <aside
            aria-labelledby="drawer-title"
            aria-modal="true"
            className="task-drawer"
            role="dialog"
          >
            <div className="drawer-header">
              <div>
                <span>اليوم {selectedDay.dayNumber}</span>
                <h2 id="drawer-title">{formatWeekday(selectedDay.isoDate)}</h2>
                <p>{formatDate(selectedDay.isoDate)}</p>
              </div>
              <button
                aria-label="إغلاق"
                className="drawer-close"
                onClick={() => setSelectedDate(null)}
                type="button"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <form
              className="drawer-add-form"
              onSubmit={(event) => {
                event.preventDefault();
                addTask(selectedDay.isoDate);
              }}
            >
              <input
                aria-label="مهمة جديدة"
                onChange={(event) => setDrawerDraft(event.target.value)}
                placeholder="اكتب مهمة جديدة"
                ref={taskInputRef}
                value={drawerDraft}
              />
              <button disabled={!drawerDraft.trim()} type="submit">
                <Plus size={18} aria-hidden="true" />
                إضافة
              </button>
            </form>

            <div className="drawer-task-list">
              {selectedDay.tasks.length === 0 ? (
                <p className="drawer-empty">لا توجد مهام لهذا اليوم.</p>
              ) : (
                selectedDay.tasks.map((task) => (
                  <div
                    className={`drawer-task-row ${
                      task.completed ? "completed" : ""
                    }`}
                    key={task.id}
                  >
                    <label className="checkbox-wrap">
                      <input
                        checked={task.completed}
                        onChange={() => toggleTask(selectedDay.isoDate, task.id)}
                        type="checkbox"
                      />
                      <span />
                    </label>
                    <input
                      aria-label="تعديل المهمة"
                      className="drawer-task-input"
                      onChange={(event) =>
                        updateTaskTitle(
                          selectedDay.isoDate,
                          task.id,
                          event.target.value,
                        )
                      }
                      placeholder="مهمة بدون عنوان"
                      value={task.title}
                    />
                    <button
                      aria-label="حذف المهمة"
                      className="delete-button"
                      onClick={() => deleteTask(selectedDay.isoDate, task.id)}
                      title="حذف المهمة"
                      type="button"
                    >
                      <Trash2 size={18} aria-hidden="true" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

export default App;
