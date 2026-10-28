import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import SupportContent from "@/components/SupportContent";

export const metadata = {
  title: "সাপোর্ট — SocialMarket",
  description: "SocialMarket সাপোর্ট টিমের সাথে যোগাযোগ করুন",
};

export default function SupportPage() {
  return (
    <>
      <Header />
      <SupportContent />
      <Footer />
    </>
  );
}
