import { Suspense } from "react";
import ResetPasswordContent from "@/components/ResetPasswordContent";

export const metadata = {
  title: "নতুন পাসওয়ার্ড — SocialMarket",
  description: "নতুন পাসওয়ার্ড সেট করুন",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ padding: "60px", textAlign: "center", color: "var(--muted)" }}>লোড হচ্ছে...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
