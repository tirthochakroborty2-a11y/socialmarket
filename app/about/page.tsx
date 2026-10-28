import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import AboutContent from "@/components/AboutContent";

export const metadata = {
  title: "আমাদের সম্পর্কে — SocialMarket",
  description: "SocialMarket-এর মিশন, গল্প, টিম এবং অর্জন সম্পর্কে জানুন",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <AboutContent />
      <Footer />
    </>
  );
}
