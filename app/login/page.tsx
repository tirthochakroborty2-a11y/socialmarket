import { Suspense } from "react";
import LoginContent from "@/components/LoginContent";

export const metadata = {
  title: "লগইন — SocialMarket",
  description: "আপনার SocialMarket অ্যাকাউন্টে লগইন করুন",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: "60px", textAlign: "center", color: "var(--muted)" }}>লোড হচ্ছে...</div>}>
      <LoginContent />
    </Suspense>
  );
}
