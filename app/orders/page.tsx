import { Suspense } from "react";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import MyOrdersContent from "@/components/MyOrdersContent";

export const metadata = {
  title: "আমার অর্ডার — SocialMarket",
  description: "আপনার সব কেনা-বেচার অর্ডার দেখুন",
};

export default function MyOrdersPage() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <div style={{ padding: "60px", textAlign: "center", color: "var(--muted)" }}>
            লোড হচ্ছে...
          </div>
        }
      >
        <MyOrdersContent />
      </Suspense>
      <Footer />
    </>
  );
}
