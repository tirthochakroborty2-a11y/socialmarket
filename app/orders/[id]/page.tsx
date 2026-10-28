import { Suspense } from "react";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import OrderDetail from "@/components/OrderDetail";

export const metadata = {
  title: "অর্ডার ট্র্যাকিং — SocialMarket",
  description: "আপনার অর্ডারের অবস্থা দেখুন",
};

export default function OrderPage() {
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
        <OrderDetail />
      </Suspense>
      <Footer />
    </>
  );
}
