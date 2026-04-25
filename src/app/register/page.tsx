import { AUTH_PAGE_BANNER_HEIGHT_CLASS } from "@/components/auth/auth-page-banner";
import { AuthNav } from "@/components/auth/AuthNav";
import { CampusBannerStrip } from "@/components/auth/CampusBannerStrip";
import { RegisterForm } from "@/components/auth/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | CUST Sports",
  description:
    "Student registration for CUST Sports Week — email, registration number, gender, and department.",
};

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-svh flex-col bg-slate-100">
      <AuthNav mode="register" />

      <CampusBannerStrip className={AUTH_PAGE_BANNER_HEIGHT_CLASS} priority />

      <main className="flex flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto w-full max-w-xl">
          <RegisterForm />
        </div>
      </main>
    </div>
  );
}
