import { AUTH_PAGE_BANNER_HEIGHT_CLASS } from "@/components/auth/auth-page-banner";
import { AuthNav } from "@/components/auth/AuthNav";
import { CampusBannerStrip } from "@/components/auth/CampusBannerStrip";
import { LoginForm } from "@/components/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in | CUST Sports",
  description: "Sign in to the CUST Sports management platform with your university email.",
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-svh flex-col bg-slate-100">
      <AuthNav mode="login" />

      <CampusBannerStrip className={AUTH_PAGE_BANNER_HEIGHT_CLASS} priority />

      <main className="flex flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto w-full max-w-xl">
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
