import { Suspense } from "react";
import AdminPaymentsContent from "@/components/AdminPaymentsContent";

export const metadata = { title: "Payments — Admin" };

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: "center", color: "#94a3b8" }}>লোড হচ্ছে...</div>}>
      <AdminPaymentsContent />
    </Suspense>
  );
}
