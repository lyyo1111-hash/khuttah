import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, CheckSquare, Users, Zap, Settings, Hexagon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Outlet } from "react-router-dom";

const pageTitles: Record<string, string> = {
  "/dashboard": "لوحة التحكم",
  "/tasks": "المهام",
  "/members": "الأعضاء",
  "/automation": "الأتمتة",
  "/settings": "الإعدادات",
};

const navLinks = [
  { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/tasks", label: "المهام", icon: CheckSquare },
  { href: "/members", label: "الأعضاء", icon: Users },
  { href: "/automation", label: "الأتمتة", icon: Zap },
];

export function AppLayout() {
  const location = useLocation();
  const currentTitle = pageTitles[location.pathname] ?? "";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" dir="rtl">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link
            to="/dashboard"
            data-testid="topbar-logo"
            className="flex items-center gap-2.5 shrink-0 group"
          >
            <div className="w-7 h-7 rounded-md bg-primary/15 flex items-center justify-center text-primary transition-colors group-hover:bg-primary/25">
              <Hexagon size={15} />
            </div>
            <span className="text-base font-bold tracking-tight">تدبير</span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1" aria-label="التنقل الرئيسي">
            {navLinks.map((link) => {
              const isActive = location.pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  data-testid={`nav-link-${link.href.replace("/", "")}`}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <link.icon size={15} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Settings */}
          <Link
            to="/settings"
            data-testid="nav-link-settings"
            className={`p-2 rounded-md transition-colors shrink-0 ${
              location.pathname === "/settings"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
            aria-label="الإعدادات"
          >
            <Settings size={17} />
          </Link>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 w-full">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="py-10"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
