import { Suspense } from "react";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import ListingDetail from "@/components/ListingDetail";

export default function ListingPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div style={{ padding: "60px", textAlign: "center", color: "var(--muted)" }}>লোড হচ্ছে...</div>}>
        <ListingDetail />
      </Suspense>
      <Footer />
    </>
  );
}
