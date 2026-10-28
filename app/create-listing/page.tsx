import { Suspense } from "react";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import CreateListingContent from "@/components/CreateListingContent";

export const metadata = {
  title: "নতুন Listing — SocialMarket",
  description: "আপনার সোশ্যাল মিডিয়া অ্যাকাউন্ট বিক্রি করুন",
};

export default function CreateListingPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div style={{ padding: "60px", textAlign: "center", color: "var(--muted)" }}>লোড হচ্ছে...</div>}>
        <CreateListingContent />
      </Suspense>
      <Footer />
    </>
  );
}
