import Link from "next/link";
import { Sparkle, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{ background: "#2D2D3F", color: "#e5e7eb", marginTop: "60px" }}>
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "50px 20px 24px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "32px",
        }}
      >
        {/* COLUMN 1: BRAND */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                background: "linear-gradient(135deg, #6C63FF, #5A52D5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkle size={18} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontSize: "18px", fontWeight: 800 }}>
              <span style={{ color: "#fff" }}>Social</span>
              <span style={{ color: "#8B85FF" }}>Market</span>
            </span>
          </div>
          <p style={{ fontSize: "14px", lineHeight: 1.6, color: "#9ca3af" }}>
            বাংলাদেশের সবচেয়ে নিরাপদ সোশ্যাল মিডিয়া অ্যাকাউন্ট কেনাবেচার প্ল্যাটফর্ম। Escrow সুরক্ষা সহ।
          </p>
        </div>

        {/* COLUMN 2: QUICK LINKS */}
        <div>
          <h4 style={{ color: "#fff", fontSize: "15px", fontWeight: 700, marginBottom: "14px" }}>দ্রুত লিংক</h4>
          <FooterLink href="/">হোম</FooterLink>
          <FooterLink href="/browse">ব্রাউজ</FooterLink>
          <FooterLink href="/about">আমাদের সম্পর্কে</FooterLink>
          <FooterLink href="/faq">FAQ</FooterLink>
          <FooterLink href="/support">সাপোর্ট</FooterLink>
        </div>

        {/* COLUMN 3: CATEGORIES */}
        <div>
          <h4 style={{ color: "#fff", fontSize: "15px", fontWeight: 700, marginBottom: "14px" }}>ক্যাটাগরি</h4>
          <FooterLink href="/browse?platform=youtube">YouTube</FooterLink>
          <FooterLink href="/browse?platform=facebook">Facebook</FooterLink>
          <FooterLink href="/browse?platform=tiktok">TikTok</FooterLink>
        </div>

        {/* COLUMN 4: CONTACT */}
        <div>
          <h4 style={{ color: "#fff", fontSize: "15px", fontWeight: 700, marginBottom: "14px" }}>যোগাযোগ</h4>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", marginBottom: "10px", color: "#9ca3af" }}>
            <Mail size={16} /> support@socialmarket.com
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", marginBottom: "10px", color: "#9ca3af" }}>
            <Phone size={16} /> +880 1572-972953
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#9ca3af" }}>
            <MapPin size={16} /> Dhaka, Bangladesh
          </div>
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid #3d3d52",
          padding: "20px",
          textAlign: "center",
          fontSize: "13px",
          color: "#9ca3af",
        }}
      >
        © ২০২৬ সোশ্যালমার্কেট। সব অধিকার সংরক্ষিত।
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        color: "#9ca3af",
        fontSize: "14px",
        marginBottom: "8px",
        transition: "color 0.2s",
      }}
    >
      {children}
    </Link>
  );
}
