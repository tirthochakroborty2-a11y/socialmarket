import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import FAQContent from "@/components/FAQContent";

export const metadata = {
  title: "সাধারণ প্রশ্ন — SocialMarket",
  description: "SocialMarket সম্পর্কে সব সাধারণ প্রশ্নের উত্তর এক জায়গায়",
};

export default function FAQPage() {
  return (
    <>
      <Header />
      <FAQContent />
      <Footer />
    </>
  );
}
