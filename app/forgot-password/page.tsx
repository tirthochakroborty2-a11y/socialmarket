import { Suspense } from "react";
import ForgotPasswordContent from "@/components/ForgotPasswordContent";

export const metadata = {
  title: "পাসওয়ার্ড রিসেট — SocialMarket",
  description: "আপনার পাসওয়ার্ড রিসেট করুন",
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div style={{ padding: "60px", textAlign: "center", color: "var(--muted)" }}>লোড হচ্ছে...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
