import { Suspense } from "react";
import AdminLoginContent from "@/components/AdminLoginContent";

export const metadata = {
  title: "Admin Login — SocialMarket",
};

export default function AdminLoginPage() {
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
      <AdminLoginContent />
    </Suspense>
  );
}
