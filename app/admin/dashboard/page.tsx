import { Suspense } from "react";
import AdminDashboardContent from "@/components/AdminDashboardContent";

export const metadata = {
  title: "Admin Dashboard — SocialMarket",
};

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "#0b1120",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#94a3b8",
          }}
        >
          লোড হচ্ছে...
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
