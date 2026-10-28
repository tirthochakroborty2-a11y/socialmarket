import { Suspense } from "react";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import DealChat from "@/components/DealChat";

export const metadata = {
  title: "Deal Chat — SocialMarket",
  description: "Buyer, Seller এবং Admin-এর মধ্যে গ্রুপ চ্যাট",
};

export default function DealPage() {
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
        <DealChat />
      </Suspense>
      <Footer />
    </>
  );
}
