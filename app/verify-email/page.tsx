import { Suspense } from "react";
import VerifyEmailContent from "@/components/VerifyEmailContent";

export const metadata = {
  title: "ইমেইল যাচাই — SocialMarket",
  description: "আপনার ইমেইল যাচাই করুন",
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div style={{ padding: "60px", textAlign: "center", color: "var(--muted)" }}>লোড হচ্ছে...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
