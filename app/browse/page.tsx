import { Suspense } from "react";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import BrowseContent from "@/components/BrowseContent";

export default function BrowsePage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div style={{ padding: "60px", textAlign: "center", color: "var(--muted)" }}>লোড হচ্ছে...</div>}>
        <BrowseContent />
      </Suspense>
      <Footer />
    </>
  );
}
