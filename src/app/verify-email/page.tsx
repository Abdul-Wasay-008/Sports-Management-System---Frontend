import { AUTH_PAGE_BANNER_HEIGHT_CLASS } from "@/components/auth/auth-page-banner";
import { AuthNav } from "@/components/auth/AuthNav";
import { CampusBannerStrip } from "@/components/auth/CampusBannerStrip";
import { EmailVerificationForm } from "@/components/auth/EmailVerificationForm";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Verify Email | CUST Sports",
  description: "Enter your one-time verification code to confirm your email address.",
};

export default function VerifyEmailPage() {
  return (
    <div className="relative flex min-h-svh flex-col bg-slate-100">
      <AuthNav mode="verify-email" />

      <CampusBannerStrip className={AUTH_PAGE_BANNER_HEIGHT_CLASS} priority />

      <main className="flex flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto w-full max-w-xl">
          <Suspense fallback={null}>
            <EmailVerificationForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
