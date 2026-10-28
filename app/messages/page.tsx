import { Suspense } from "react";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import MessagesContent from "@/components/MessagesContent";

export const metadata = {
  title: "মেসেজ — SocialMarket",
  description: "সেলার ও ক্রেতার সাথে সরাসরি চ্যাট",
};

export default function MessagesPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div style={{ padding: "60px", textAlign: "center", color: "var(--muted)" }}>লোড হচ্ছে...</div>}>
        <MessagesContent />
      </Suspense>
      <Footer />
    </>
  );
}
