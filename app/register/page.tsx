import { Suspense } from "react";
import RegisterContent from "@/components/RegisterContent";

export const metadata = {
  title: "রেজিস্টার — SocialMarket",
  description: "নতুন অ্যাকাউন্ট খুলুন SocialMarket-এ",
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ padding: "60px", textAlign: "center" }}>লোড হচ্ছে...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
