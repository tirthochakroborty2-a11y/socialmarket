import { Suspense } from "react";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import DashboardContent from "@/components/DashboardContent";

export const metadata = {
  title: "ড্যাশবোর্ড — SocialMarket",
  description: "আপনার ড্যাশবোর্ড",
};

export default function DashboardPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div style={{ padding: "60px", textAlign: "center", color: "var(--muted)" }}>লোড হচ্ছে...</div>}>
        <DashboardContent />
      </Suspense>
      <Footer />
    </>
  );
}
