import { Suspense } from "react";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import ListingSuccess from "@/components/ListingSuccess";

export const metadata = {
  title: "লিস্টিং তৈরি হয়েছে — SocialMarket",
};

export default function SuccessPage() {
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
        <ListingSuccess />
      </Suspense>
      <Footer />
    </>
  );
}
