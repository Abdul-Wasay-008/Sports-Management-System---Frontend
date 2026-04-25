"use client";

import Link from "next/link";
import { useState } from "react";
import { DEPARTMENTS } from "@/data/departments";

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    if (!gender) {
      alert("Please select your gender.");
      return;
    }
    console.log("register", {
      email,
      registrationNumber,
      gender,
      department,
      password: "***",
    });
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <p className="mb-2 inline-flex rounded-full border border-brand-amber-500/30 bg-brand-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-amber-700">
          Student registration
        </p>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
          Create your account
        </h1>
        <p className="mt-2 text-slate-600">
          Use your university email, registration number, gender, and department to
          create your account. Authentication protects your profile and registrations.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-900/5 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium text-brand-900">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              id="reg-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="BCS223139@cust.edu.pk"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-slate-900 outline-none ring-brand-amber-500/30 transition placeholder:text-slate-400 focus:border-brand-amber-500 focus:bg-white focus:ring-4"
            />
          </div>

          <div>
            <label
              htmlFor="reg-number"
              className="mb-1.5 block text-sm font-medium text-brand-900"
            >
              Registration number <span className="text-red-600">*</span>
            </label>
            <input
              id="reg-number"
              name="registrationNumber"
              type="text"
              autoComplete="off"
              required
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              placeholder="e.g. BCS223139"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-slate-900 outline-none ring-brand-amber-500/30 transition placeholder:text-slate-400 focus:border-brand-amber-500 focus:bg-white focus:ring-4"
            />
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-brand-900">
              Gender <span className="text-red-600">*</span>
            </legend>
            <div className="flex flex-wrap gap-3">
              {(
                [
                  { value: "male" as const, label: "Male" },
                  { value: "female" as const, label: "Female" },
                ] satisfies { value: "male" | "female"; label: string }[]
              ).map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${gender === opt.value
                    ? "border-brand-amber-500 bg-brand-amber-500/10 text-brand-900 ring-2 ring-brand-amber-500/30"
                    : "border-slate-200 bg-slate-50/80 text-slate-700 hover:border-slate-300"
                    }`}
                >
                  <input
                    type="radio"
                    name="gender"
                    value={opt.value}
                    checked={gender === opt.value}
                    onChange={() => setGender(opt.value)}
                    className="h-4 w-4 border-slate-300 text-brand-amber-600 focus:ring-brand-amber-500"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              Events can be grouped by gender to keep registrations and participation
              organized.
            </p>
          </fieldset>

          <div>
            <label htmlFor="reg-dept" className="mb-1.5 block text-sm font-medium text-brand-900">
              Department <span className="text-red-600">*</span>
            </label>
            <select
              id="reg-dept"
              name="department"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-slate-900 outline-none ring-brand-amber-500/30 transition focus:border-brand-amber-500 focus:bg-white focus:ring-4"
            >
              <option value="">Select your department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-slate-500">
              Select your department to route registrations and team coordination
              correctly.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-2">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Set your password
            </p>
            <div className="space-y-4">
              <div>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <label htmlFor="reg-password" className="text-sm font-medium text-brand-900">
                    Password <span className="text-red-600">*</span>
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
                  id="reg-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-slate-900 outline-none ring-brand-amber-500/30 transition placeholder:text-slate-400 focus:border-brand-amber-500 focus:bg-white focus:ring-4"
                />
              </div>
              <div>
                <label htmlFor="reg-confirm" className="mb-1.5 block text-sm font-medium text-brand-900">
                  Confirm password <span className="text-red-600">*</span>
                </label>
                <input
                  id="reg-confirm"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-slate-900 outline-none ring-brand-amber-500/30 transition placeholder:text-slate-400 focus:border-brand-amber-500 focus:bg-white focus:ring-4"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-linear-to-r from-brand-amber-500 to-amber-600 py-3.5 text-base font-semibold text-brand-950 shadow-md shadow-amber-500/25 transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-amber-500"
          >
            Create account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-amber-600 hover:text-brand-amber-700">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-amber-200/80 bg-amber-50/60 p-5 text-sm text-amber-950">
        <p className="font-medium">Not a student?</p>
        <p className="mt-1 text-amber-900/90">
          Team managers, game managers, and administrators receive accounts from the
          system administrator — use the sign-in page when you have your credentials.
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
