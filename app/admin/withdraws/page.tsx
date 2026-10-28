import { Suspense } from "react";
import AdminWithdrawsContent from "@/components/AdminWithdrawsContent";

export const metadata = { title: "Withdraws — Admin" };

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: "center", color: "#94a3b8" }}>লোড হচ্ছে...</div>}>
      <AdminWithdrawsContent />
    </Suspense>
  );
}
