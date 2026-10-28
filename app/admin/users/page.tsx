import { Suspense } from "react";
import AdminUsersContent from "@/components/AdminUsersContent";

export const metadata = { title: "Users — Admin" };

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: "center", color: "#94a3b8" }}>লোড হচ্ছে...</div>}>
      <AdminUsersContent />
    </Suspense>
  );
}
