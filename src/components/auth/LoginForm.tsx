"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { apiRequest, ApiError } from "@/lib/api";
import { decodeAuthRole, saveAuthToken } from "@/lib/auth";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const isCust = normalizedEmail.endsWith("@cust.pk");
    const isAdminEmail = normalizedEmail === "wasay7757@gmail.com";
    if (!isCust && !isAdminEmail) {
      toast.error("Use your @cust.pk university email, or administrator credentials if provided.");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await apiRequest<{
        token: string;
        message: string;
      }>("/auth/login", "POST", {
        email: email.trim(),
        password,
      });

      saveAuthToken(data.token);
      toast.success(data.message || "Login successful.");
      const role = decodeAuthRole(data.token);
      if (role === "admin") router.push("/admin");
      else if (role === "team_manager") router.push("/team-manager");
      else router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Unable to sign in right now. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
          Welcome back
        </h1>
        <p className="mt-2 text-slate-600">
          Sign in with your university email and password. The same login is used
          for students, team managers, game managers, and administrators — your
          dashboard depends on your role.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-900/5 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-brand-900">
              University Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="BCS223139@cust.pk"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-slate-900 outline-none ring-brand-amber-500/30 transition placeholder:text-slate-400 focus:border-brand-amber-500 focus:bg-white focus:ring-4"
            />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label htmlFor="login-password" className="text-sm font-medium text-brand-900">
                Password
              </label>
              <button
                type="button"
                className="text-xs font-medium text-brand-amber-600 hover:text-brand-amber-700"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-slate-900 outline-none ring-brand-amber-500/30 transition placeholder:text-slate-400 focus:border-brand-amber-500 focus:bg-white focus:ring-4"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-linear-to-r from-brand-amber-500 to-amber-600 py-3.5 text-base font-semibold text-brand-950 shadow-md shadow-amber-500/25 transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-amber-500"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          New student?{" "}
          <Link
            href="/register"
            className="font-semibold text-brand-amber-600 hover:text-brand-amber-700"
          >
            Create an account
          </Link>
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 text-sm text-slate-600">
        <p className="font-medium text-brand-900">Team managers, game managers &amp; admins</p>
        <p className="mt-1">
          Accounts are normally created by an administrator. If you were given
          credentials, use the same sign-in page — no separate staff login.
        </p>
      </div>

      <p className="mt-8 text-center text-xs text-slate-500">
        <Link href="/" className="font-medium text-slate-600 hover:text-brand-900">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
