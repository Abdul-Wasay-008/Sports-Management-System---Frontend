"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { apiRequest, ApiError } from "@/lib/api";
import { saveAuthToken } from "@/lib/auth";

const OTP_LENGTH = 5;

export function EmailVerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const email = searchParams.get("email")?.trim() ?? "";

  function updateOtpAt(index: number, value: string) {
    const next = [...otp];
    next[index] = value;
    setOtp(next);
  }

  function handleChange(index: number, rawValue: string) {
    const value = rawValue.replace(/\D/g, "").slice(-1);
    updateOtpAt(index, value);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const previousIndex = index - 1;
      inputRefs.current[previousIndex]?.focus();
      updateOtpAt(previousIndex, "");
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!digits) return;

    const next = Array(OTP_LENGTH).fill("");
    digits.split("").forEach((digit, i) => {
      next[i] = digit;
    });
    setOtp(next);

    const nextFocusIndex = Math.min(digits.length, OTP_LENGTH - 1);
    inputRefs.current[nextFocusIndex]?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      toast.error("Missing email context. Please register again.");
      return;
    }
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) {
      toast.error("Please enter the 5-digit verification code.");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await apiRequest<{
        message: string;
        token: string;
      }>("/auth/verify-email", "POST", {
        email,
        otp: code,
      });
      saveAuthToken(data.token);
      toast.success(data.message || "Email verified successfully.");
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Unable to verify code right now. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendCode() {
    if (!email) {
      toast.error("Missing email context. Please register again.");
      return;
    }

    setIsResending(true);
    try {
      const data = await apiRequest<{ message: string }>("/auth/resend-otp", "POST", {
        email,
      });
      toast.success(data.message || "Verification code resent.");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Unable to resend code right now.");
      }
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <p className="mb-2 inline-flex rounded-full border border-brand-amber-500/30 bg-brand-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-amber-700">
          Email verification
        </p>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
          Verify your email
        </h1>
        <p className="mt-2 text-slate-600">
          Enter the 5-digit code sent to your university email to activate your
          account.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-900/5 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-brand-900">
              Verification code
            </label>
            <div className="flex items-center justify-center gap-2 sm:gap-2.5">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  aria-label={`OTP digit ${i + 1}`}
                  className="h-12 w-12 rounded-xl border border-slate-200 bg-slate-50/80 text-center text-lg font-semibold text-slate-900 outline-none ring-brand-amber-500/30 transition focus:border-brand-amber-500 focus:bg-white focus:ring-4 sm:h-14 sm:w-14 sm:text-xl"
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              You can type each digit or paste the full code.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-linear-to-r from-brand-amber-500 to-amber-600 py-3.5 text-base font-semibold text-brand-950 shadow-md shadow-amber-500/25 transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-amber-500"
          >
            {isSubmitting ? "Verifying..." : "Verify email"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between gap-3 text-sm">
          <button
            type="button"
            disabled={isResending}
            className="font-medium text-brand-amber-600 hover:text-brand-amber-700"
            onClick={handleResendCode}
          >
            {isResending ? "Sending..." : "Resend code"}
          </button>
          <Link href="/register" className="font-medium text-slate-600 hover:text-brand-900">
            Change email
          </Link>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-slate-500">
        <Link href="/" className="font-medium text-slate-600 hover:text-brand-900">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
