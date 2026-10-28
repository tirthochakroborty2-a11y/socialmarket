import { Suspense } from "react";
import AdminDisputesContent from "@/components/AdminDisputesContent";

export const metadata = { title: "Disputes — Admin" };

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: "center", color: "#94a3b8" }}>লোড হচ্ছে...</div>}>
      <AdminDisputesContent />
    </Suspense>
  );
}
