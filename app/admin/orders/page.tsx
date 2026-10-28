import { Suspense } from "react";
import AdminOrdersContent from "@/components/AdminOrdersContent";

export const metadata = { title: "Orders — Admin" };

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: "center", color: "#94a3b8" }}>লোড হচ্ছে...</div>}>
      <AdminOrdersContent />
    </Suspense>
  );
}
