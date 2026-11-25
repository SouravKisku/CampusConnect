import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, Moon, Settings, ShieldCheck, Sun, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Logo } from "./Logo";
import { Avatar } from "./ui";
import { cn, homePath } from "../lib/utils";

// Only modules that exist are listed. Each new module adds its entry here.
function useNav() {
  const { user } = useAuth();
  const items = [
    user?.role === "admin"
      ? { to: "/admin", label: "Admin", icon: ShieldCheck }
      : { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/profile", label: "My profile", icon: UserRound },
    { to: "/settings", label: "Settings", icon: Settings },
  ];
  return items;
}

function ThemeButton() {
  const { resolved, toggle } = useTheme();
  return (
    <button onClick={toggle} aria-label={`Switch to ${resolved === "dark" ? "light" : "dark"} theme`} className="rounded-lg p-2 text-muted hover:bg-sunken hover:text-ink">
      {resolved === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}

function ProfileMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  if (!user) return null;
  const go = (to: string) => { setOpen(false); navigate(to); };
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} aria-label="Account menu" className="rounded-full">
        <Avatar name={user.fullName} src={user.avatar?.url} size={36} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-surface shadow-lg">
          <div className="border-b border-line px-3 py-2.5">
            <p className="truncate text-sm font-medium">{user.fullName}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <button role="menuitem" onClick={() => go("/profile")} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-sunken"><UserRound className="h-4 w-4" /> My profile</button>
          <button role="menuitem" onClick={() => go("/settings")} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-sunken"><Settings className="h-4 w-4" /> Settings</button>
          <button role="menuitem" onClick={() => logout().then(() => navigate("/login"))} className="flex w-full items-center gap-2 border-t border-line px-3 py-2 text-sm text-danger hover:bg-sunken"><LogOut className="h-4 w-4" /> Log out</button>
        </div>
      )}
    </div>
  );
}

export function AppShell() {
  const { user } = useAuth();
  const nav = useNav();
  if (!user) return null;

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface p-4 lg:flex">
        <div className="px-2 py-2"><Logo to={homePath(user.role)} /></div>
        <nav className="mt-6 flex flex-1 flex-col gap-1" aria-label="Main">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium", isActive ? "bg-brand-soft text-brand" : "text-muted hover:bg-sunken hover:text-ink")
              }
            >
              <Icon className="h-5 w-5" /> {label}
            </NavLink>
          ))}
        </nav>
        <NavLink to="/profile" className="flex items-center gap-3 rounded-lg p-2 hover:bg-sunken">
          <Avatar name={user.fullName} src={user.avatar?.url} size={36} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{user.fullName}</span>
            <span className="block truncate text-xs capitalize text-muted">{user.role}</span>
          </span>
        </NavLink>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-bg/85 px-4 backdrop-blur lg:justify-end lg:px-8">
          <div className="lg:hidden"><Logo to={homePath(user.role)} /></div>
          <div className="flex items-center gap-1">
            <ThemeButton />
            <ProfileMenu />
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 lg:px-8 lg:pb-12">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface lg:hidden">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end className={({ isActive }) => cn("flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium", isActive ? "text-brand" : "text-muted")}>
            <Icon className="h-5 w-5" /> {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
