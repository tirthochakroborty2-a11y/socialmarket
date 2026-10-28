import { Suspense } from "react";
import AdminListingsContent from "@/components/AdminListingsContent";

export const metadata = { title: "Listings — Admin" };

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: "center", color: "#94a3b8" }}>লোড হচ্ছে...</div>}>
      <AdminListingsContent />
    </Suspense>
  );
}
