import { Suspense } from "react";
import SuperAdminDashboardV2 from "@/components/SuperAdminDashboardV2";

export const metadata = { title: "Super Admin — SocialMarket" };

export default function Page() {
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
      <SuperAdminDashboardV2 />
    </Suspense>
  );
}
