import { Suspense } from "react";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import WalletContent from "@/components/WalletContent";

export const metadata = {
  title: "ওয়ালেট — SocialMarket",
  description: "আপনার coin balance, লেনদেন এবং withdraw",
};

export default function WalletPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div style={{ padding: "60px", textAlign: "center", color: "var(--muted)" }}>লোড হচ্ছে...</div>}>
        <WalletContent />
      </Suspense>
      <Footer />
    </>
  );
}
