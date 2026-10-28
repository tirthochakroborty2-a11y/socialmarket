import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider } from "@/lib/auth";
import ToastContainer from "@/components/Toast";

export const metadata: Metadata = {
  title: "SocialMarket — Buy & Sell Social Accounts",
  description: "সোশ্যাল অ্যাকাউন্ট কিনুন ও বিক্রি করুন নিরাপদে",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <ToastContainer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
