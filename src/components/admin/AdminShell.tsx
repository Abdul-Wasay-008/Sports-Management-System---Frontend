"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  Medal,
  Trophy,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { clearAuthToken, decodeAuthRole, getAuthToken } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: UsersRound },
  { href: "/admin/games", label: "Games", icon: Medal },
  { href: "/admin/registrations", label: "Registrations", icon: ClipboardList },
  { href: "/admin/stats", label: "Statistics", icon: BarChart3 },
] satisfies Array<{ href: string; label: string; icon: LucideIcon }>;

export function AdminShell({
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
    const role = decodeAuthRole(token);
    if (role !== "admin") {
      router.replace(role === "team_manager" ? "/team-manager" : "/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-svh bg-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-brand-950/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-brand-amber-500 to-amber-600 text-brand-950 shadow-md shadow-amber-500/20">
              <Trophy className="h-4 w-4" />
            </span>
            <span className="font-heading text-sm font-semibold tracking-wide text-white sm:text-base">
              CUST Sports Admin
            </span>
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
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    active ? "bg-brand-900 text-brand-amber-300" : "text-slate-700 hover:bg-slate-100"
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
            <h1 className="font-heading text-3xl font-bold tracking-tight text-brand-900">{title}</h1>
            {subtitle ? <p className="mt-1 text-slate-600">{subtitle}</p> : null}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
