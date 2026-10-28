import { Suspense } from "react";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileContent from "@/components/ProfileContent";

export const metadata = {
  title: "প্রোফাইল — SocialMarket",
  description: "আপনার প্রোফাইল এবং সেটিংস",
};

export default function ProfilePage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div style={{ padding: "60px", textAlign: "center", color: "var(--muted)" }}>লোড হচ্ছে...</div>}>
        <ProfileContent />
      </Suspense>
      <Footer />
    </>
  );
}
