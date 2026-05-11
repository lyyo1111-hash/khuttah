import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";

type Task = {
  id: string;
  title: string;
  completed: boolean;
};

type StoredPlan = {
  startDate: string;
  dayCount: number;
  tasksByDate: Record<string, Task[]>;
};

type LegacyStoredPlan = Partial<StoredPlan> & {
  days?: Array<{ isoDate: string; tasks?: Task[] }>;
};

type DayStatus = "empty" | "complete" | "partial" | "none";
type CalendarMode = "gregorian" | "hijri";

type CalendarCell =
  | {
      kind: "empty";
      id: string;
    }
  | {
      kind: "day";
      isoDate: string;
      dayNumber: number;
      hijriDay: string;
      tasks: Task[];
      status: DayStatus;
      isToday: boolean;
      isPast: boolean;
      isSelected: boolean;
    };

const DEFAULT_DAY_COUNT = 14;
const STORAGE_KEY = "fourteen-day-plan-tracker";
const WEEKDAYS = [
  "الأحد",
  "السبت",
  "الجمعة",
  "الخميس",
  "الأربعاء",
  "الثلاثاء",
  "الاثنين",
];
const WEEKDAY_INDEX_BY_DAY = [0, 6, 5, 4, 3, 2, 1];

const monthFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
  month: "long",
  year: "numeric",
});

const hijriMonthFormatter = new Intl.DateTimeFormat(
  "ar-SA-u-ca-islamic-umalqura",
  {
    month: "long",
    year: "numeric",
  },
);

const dateFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const hijriDateFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const hijriDayFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
  day: "numeric",
});

const gregorianDayFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
  day: "numeric",
});

function createTaskId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
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

function getMonthStart(date: Date) {
  return toIsoDate(new Date(date.getFullYear(), date.getMonth(), 1));
}

function addMonths(monthIsoDate: string, amount: number) {
  const date = parseLocalDate(monthIsoDate);
  return getMonthStart(new Date(date.getFullYear(), date.getMonth() + amount, 1));
}

function formatMonth(monthIsoDate: string) {
  return monthFormatter.format(parseLocalDate(monthIsoDate));
}

function formatHijriMonth(monthIsoDate: string) {
  return hijriMonthFormatter.format(parseLocalDate(monthIsoDate));
}

function formatDate(isoDate: string) {
  return dateFormatter.format(parseLocalDate(isoDate));
}

function formatHijriDate(isoDate: string) {
  return hijriDateFormatter.format(parseLocalDate(isoDate));
}

function formatHijriDay(isoDate: string) {
  return hijriDayFormatter.format(parseLocalDate(isoDate));
}

function formatGregorianDay(isoDate: string) {
  return gregorianDayFormatter.format(parseLocalDate(isoDate));
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
        ? tasks.map((task) => normalizeTask(task)).filter((task) => task.title)
        : [];
    });
  }

  if (Array.isArray(plan.days)) {
    plan.days.forEach((day) => {
      if (!day.isoDate) {
        return;
      }

      tasksByDate[day.isoDate] = Array.isArray(day.tasks)
        ? day.tasks.map((task) => normalizeTask(task)).filter((task) => task.title)
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
    startDate: plan.startDate || today,
    dayCount: plan.dayCount || plan.days?.length || DEFAULT_DAY_COUNT,
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

function getDayStatus(tasks: Task[]): DayStatus {
  if (tasks.length === 0) {
    return "empty";
  }

  const completedTasks = tasks.filter((task) => task.completed).length;

  if (completedTasks === tasks.length) {
    return "complete";
  }

  if (completedTasks > 0) {
    return "partial";
  }

  return "none";
}

function getStatusLabel(status: DayStatus) {
  if (status === "complete") {
    return "كل المهام مكتملة";
  }

  if (status === "partial") {
    return "بعض المهام مكتملة";
  }

  if (status === "none") {
    return "لم تنجز أي مهمة";
  }

  return "بدون مهام";
}

function getCalendarCells(
  monthIsoDate: string,
  tasksByDate: Record<string, Task[]>,
  today: string,
  selectedDate: string | null,
): CalendarCell[] {
  const monthDate = parseLocalDate(monthIsoDate);
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingCells = WEEKDAY_INDEX_BY_DAY[firstDay.getDay()];
  const totalCells = Math.ceil((leadingCells + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - leadingCells + 1;

    if (dayNumber < 1 || dayNumber > daysInMonth) {
      return {
        kind: "empty",
        id: `empty-${monthIsoDate}-${index}`,
      };
    }

    const isoDate = toIsoDate(new Date(year, month, dayNumber));
    const tasks = tasksByDate[isoDate] || [];
    const status = getDayStatus(tasks);

    return {
      kind: "day",
      isoDate,
      dayNumber,
      hijriDay: formatHijriDay(isoDate),
      tasks,
      status,
      isToday: isoDate === today,
      isPast: isoDate < today,
      isSelected: isoDate === selectedDate,
    };
  });
}

function App() {
  const today = toIsoDate(new Date());
  const [plan, setPlan] = useState<StoredPlan>(() => loadPlan(today));
  const [visibleMonth, setVisibleMonth] = useState(() => getMonthStart(new Date()));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [taskDraft, setTaskDraft] = useState("");
  const [calendarMode, setCalendarMode] = useState<CalendarMode>("gregorian");
  const taskInputRef = useRef<HTMLInputElement>(null);

  const selectedTasks = selectedDate ? plan.tasksByDate[selectedDate] || [] : [];
  const selectedDateIsPast = Boolean(selectedDate && selectedDate < today);
  const isHijriMode = calendarMode === "hijri";
  const visibleMonthTitle = isHijriMode
    ? formatHijriMonth(visibleMonth)
    : formatMonth(visibleMonth);
  const selectedCompletedTasks = selectedTasks.filter((task) => task.completed).length;
  const selectedProgress = selectedTasks.length
    ? Math.round((selectedCompletedTasks / selectedTasks.length) * 100)
    : 0;

  const calendarCells = useMemo(
    () => getCalendarCells(visibleMonth, plan.tasksByDate, today, selectedDate),
    [visibleMonth, plan.tasksByDate, selectedDate, today],
  );

  const monthStats = useMemo(() => {
    const monthDays = calendarCells.filter(
      (cell): cell is Extract<CalendarCell, { kind: "day" }> =>
        cell.kind === "day",
    );
    const monthTasks = monthDays.flatMap((day) => day.tasks);
    const completedTasks = monthTasks.filter((task) => task.completed).length;

    return {
      totalTasks: monthTasks.length,
      completedTasks,
      progress: monthTasks.length
        ? Math.round((completedTasks / monthTasks.length) * 100)
        : 0,
    };
  }, [calendarCells]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  }, [plan]);

  useEffect(() => {
    if (!selectedDate || selectedDate < today) {
      return;
    }

    if (selectedDate < today) {
      setSelectedDate(null);
      return;
    }

    setTaskDraft("");
    window.setTimeout(() => taskInputRef.current?.focus(), 120);
  }, [selectedDate, today]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedDate(null);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const updateTasksForDay = (
    isoDate: string,
    updater: (tasks: Task[]) => Task[],
  ) => {
    if (isoDate < today) {
      return;
    }

    setPlan((currentPlan) => {
      const nextTasks = updater(currentPlan.tasksByDate[isoDate] || []);
      const nextTasksByDate = { ...currentPlan.tasksByDate };

      if (nextTasks.length > 0) {
        nextTasksByDate[isoDate] = nextTasks;
      } else {
        delete nextTasksByDate[isoDate];
      }

      return {
        ...currentPlan,
        tasksByDate: nextTasksByDate,
      };
    });
  };

  const addTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedDate) {
      return;
    }

    const taskTitle = taskDraft.trim();
    if (!taskTitle) {
      return;
    }

    updateTasksForDay(selectedDate, (tasks) => [
      ...tasks,
      { id: createTaskId(), title: taskTitle, completed: false },
    ]);
    setTaskDraft("");
    window.setTimeout(() => taskInputRef.current?.focus(), 0);
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

  const goToToday = () => {
    setVisibleMonth(getMonthStart(new Date()));
    setSelectedDate(null);
    setPlan((currentPlan) => ({ ...currentPlan, startDate: today }));
    window.setTimeout(() => setSelectedDate(today), 0);
  };

  return (
    <main className="app-page" dir="rtl">
      <section className="phone-container" aria-label="تقويم خطة المهام">
        <header className="calendar-header">
          <div className="top-actions">
            <button
              aria-pressed={isHijriMode}
              className={`text-toggle ${isHijriMode ? "active" : ""}`}
              onClick={() =>
                setCalendarMode((current) =>
                  current === "gregorian" ? "hijri" : "gregorian",
                )
              }
              type="button"
            >
              {isHijriMode ? "ميلادي" : "هجري"}
            </button>
            <button
              aria-label="تحديث والرجوع إلى اليوم"
              className="icon-button"
              onClick={goToToday}
              title="تحديث"
              type="button"
            >
              <RefreshCw size={19} aria-hidden="true" />
            </button>
          </div>

          <div className="month-row">
            <button
              aria-label="الشهر السابق"
              className="icon-button"
              onClick={() => setVisibleMonth((month) => addMonths(month, -1))}
              title="الشهر السابق"
              type="button"
            >
              <ChevronRight size={22} aria-hidden="true" />
            </button>
            <div className="month-title">
              <span>
                <CalendarDays size={18} aria-hidden="true" />
                خطة المهام
              </span>
              <h1>{visibleMonthTitle}</h1>
            </div>
            <button
              aria-label="الشهر التالي"
              className="icon-button"
              onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
              title="الشهر التالي"
              type="button"
            >
              <ChevronLeft size={22} aria-hidden="true" />
            </button>
          </div>

          <div className="month-progress" aria-label="تقدم مهام الشهر">
            <div>
              <span>تقدم الشهر</span>
              <strong>{monthStats.progress}%</strong>
            </div>
            <div className="progress-track" aria-hidden="true">
              <span style={{ width: `${monthStats.progress}%` }} />
            </div>
            <p>
              {monthStats.completedTasks} مكتملة من {monthStats.totalTasks} مهمة
            </p>
          </div>
        </header>

        <div className="weekday-grid" aria-hidden="true">
          {WEEKDAYS.map((weekday) => (
            <span key={weekday}>{weekday}</span>
          ))}
        </div>

        <section className="calendar-grid" aria-label="أيام الشهر">
          {calendarCells.map((cell) => {
            if (cell.kind === "empty") {
              return <span className="calendar-empty-cell" key={cell.id} />;
            }

            const statusLabel = getStatusLabel(cell.status);
            const primaryDay = isHijriMode
              ? cell.hijriDay
              : formatGregorianDay(cell.isoDate);
            const secondaryDay = isHijriMode
              ? formatGregorianDay(cell.isoDate)
              : cell.hijriDay;

            return (
              <button
                aria-label={`${formatDate(cell.isoDate)}، ${formatHijriDate(
                  cell.isoDate,
                )}، ${statusLabel}${
                  cell.isPast ? "، يوم سابق غير قابل للتعديل" : ""
                }`}
                className={`day-cell calendar-day status-${cell.status} ${
                  cell.isToday ? "today" : ""
                } ${cell.isPast ? "past" : ""} ${
                  cell.isSelected ? "selected" : ""
                }`}
                disabled={cell.isPast}
                key={cell.isoDate}
                onClick={() => setSelectedDate(cell.isoDate)}
                type="button"
              >
                <span className="gregorian-day">{primaryDay}</span>
                <span className="hijri-day">{secondaryDay}</span>
                {cell.tasks.length > 0 && (
                  <span className="task-count">{cell.tasks.length}</span>
                )}
              </button>
            );
          })}
        </section>
      </section>

      {selectedDate && !selectedDateIsPast && (
        <div className="sheet-layer">
          <button
            aria-label="إغلاق لوحة المهام"
            className="sheet-backdrop"
            onClick={() => setSelectedDate(null)}
            type="button"
          />
          <aside
            aria-labelledby="sheet-title"
            aria-modal="true"
            className="task-sheet"
            role="dialog"
          >
            <span className="sheet-handle" aria-hidden="true" />

            <div className="sheet-header">
              <div>
                <span className="sheet-kicker">مهام اليوم</span>
                <h2 id="sheet-title">
                  {isHijriMode
                    ? formatHijriDate(selectedDate)
                    : formatDate(selectedDate)}
                </h2>
                <p>
                  {isHijriMode
                    ? formatDate(selectedDate)
                    : formatHijriDate(selectedDate)}
                </p>
              </div>
              <button
                aria-label="إغلاق"
                className="icon-button"
                onClick={() => setSelectedDate(null)}
                title="إغلاق"
                type="button"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="day-progress" aria-label="نسبة تقدم اليوم">
              <div>
                <span>نسبة التقدم</span>
                <strong>{selectedProgress}%</strong>
              </div>
              <div className="progress-track" aria-hidden="true">
                <span style={{ width: `${selectedProgress}%` }} />
              </div>
              <p>
                {selectedCompletedTasks} مكتملة من {selectedTasks.length} مهمة
              </p>
            </div>

            <form className="task-form" onSubmit={addTask}>
              <input
                aria-label="إضافة مهمة"
                onChange={(event) => setTaskDraft(event.target.value)}
                placeholder="أضف مهمة لهذا اليوم"
                ref={taskInputRef}
                value={taskDraft}
              />
              <button disabled={!taskDraft.trim()} type="submit">
                <Plus size={18} aria-hidden="true" />
                إضافة
              </button>
            </form>

            <div className="task-list">
              {selectedTasks.length === 0 ? (
                <p className="empty-tasks">لا توجد مهام لهذا اليوم.</p>
              ) : (
                selectedTasks.map((task) => (
                  <div
                    className={`task-row ${task.completed ? "completed" : ""}`}
                    key={task.id}
                  >
                    <button
                      aria-label={
                        task.completed
                          ? "تحديد المهمة كغير مكتملة"
                          : "تحديد المهمة كمكتملة"
                      }
                      className="task-check"
                      onClick={() => toggleTask(selectedDate, task.id)}
                      type="button"
                    >
                      {task.completed && <Check size={16} aria-hidden="true" />}
                    </button>
                    <span>{task.title}</span>
                    <button
                      aria-label="حذف المهمة"
                      className="delete-button"
                      onClick={() => deleteTask(selectedDate, task.id)}
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
