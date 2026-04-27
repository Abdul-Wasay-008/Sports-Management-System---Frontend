"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  CalendarClock,
  ClipboardList,
  Gavel,
  LayoutDashboard,
  Medal,
  ShieldUser,
  Trophy,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { clearAuthToken, decodeAuthRole, getAuthToken } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/games", label: "Games", icon: Medal },
  { href: "/dashboard/registrations", label: "My Registrations", icon: ClipboardList },
  { href: "/dashboard/schedule", label: "Schedule", icon: CalendarClock },
  { href: "/dashboard/rules", label: "Rules", icon: Gavel },
  { href: "/dashboard/committee", label: "Committee", icon: ShieldUser },
  { href: "/dashboard/managers", label: "Game Managers", icon: UsersRound },
  { href: "/dashboard/results", label: "Results", icon: Trophy },
  { href: "/dashboard/stats", label: "Statistics", icon: BarChart3 },
] satisfies Array<{ href: string; label: string; icon: LucideIcon }>;

export function DashboardShell({
  title,
  children,
  subtitle,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    if (decodeAuthRole(token) === "admin") {
      router.replace("/admin");
    }
  }, [router]);

  return (
    <div className="min-h-svh bg-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-brand-950/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-brand-amber-500 to-amber-600 text-brand-950 shadow-md shadow-amber-500/20">
              <TrophyIcon className="h-4 w-4" />
            </span>
            <span className="font-heading text-sm font-semibold tracking-wide text-white sm:text-base">
              CUST Sports
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/notifications"
              aria-label="Notifications"
              className="rounded-lg border border-white/20 p-2 text-white hover:bg-white/10"
            >
              <Bell className="h-4 w-4" />
            </Link>
            <button
              type="button"
              className="rounded-lg border border-white/20 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10"
              onClick={() => {
                clearAuthToken();
                router.push("/login");
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-brand-900 text-brand-amber-300"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main>
          <div className="mb-5">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-brand-900">
              {title}
            </h1>
            {subtitle ? <p className="mt-1 text-slate-600">{subtitle}</p> : null}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M8 4h8v2a4 4 0 0 1-4 4 4 4 0 0 1-4-4V4Z" fill="currentColor" />
      <path
        d="M8 6H5a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4M16 6h3a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 10v4M9 18h6M10 14h4M9.5 18v2h5V18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
