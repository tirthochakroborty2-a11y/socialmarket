"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CheckCircle,
  Clock,
  Shield,
  ArrowRight,
  Package,
  Sparkles,
  Home,
  LayoutDashboard,
} from "lucide-react";

export default function ListingSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const listingId = searchParams.get("id") || "";
  const title = searchParams.get("title") || "আপনার লিস্টিং";

  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main
      style={{
        minHeight: "calc(100vh - 67px)",
        background:
          "linear-gradient(135deg, #f0f4ff 0%, #fef6ff 50%, #f0fdf4 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative blobs */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(16,185,129,0.15), transparent 70%)",
          top: -100,
          left: -100,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(108,99,255,0.15), transparent 70%)",
          bottom: -100,
          right: -100,
          pointerEvents: "none",
        }}
      />

      {/* Confetti dots */}
      {showConfetti && (
        <>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: ["#6C63FF", "#10b981", "#EC4899", "#f59e0b"][i % 4],
                top: "20%",
                left: `${5 + i * 5}%`,
                animation: `confetti${i % 4} 2s ease-out forwards`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </>
      )}

      <div
        style={{
          maxWidth: "540px",
          width: "100%",
          background: "rgba(255,255,255,0.98)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          padding: "3px",
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.15), 0 0 60px rgba(16,185,129,0.2)",
          backgroundImage:
            "linear-gradient(135deg, #10b981 0%, #6C63FF 50%, #EC4899 100%)",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: "22px",
            padding: "48px 32px 40px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Inner decorative */}
          <div
            style={{
              position: "absolute",
              width: 200,
              height: 200,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(16,185,129,0.08), transparent 70%)",
              top: -80,
              right: -80,
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", zIndex: 2 }}>
            {/* Check icon */}
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                boxShadow:
                  "0 20px 40px rgba(16,185,129,0.4), 0 0 0 12px rgba(16,185,129,0.1), 0 0 0 24px rgba(16,185,129,0.05)",
                animation: "pop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
              }}
            >
              <CheckCircle size={52} color="#fff" strokeWidth={2.5} />
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 800,
                background:
                  "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "12px",
                letterSpacing: "-0.5px",
              }}
            >
              🎉 লিস্টিং তৈরি হয়েছে!
            </h1>

            <p
              style={{
                fontSize: "15px",
                color: "#667085",
                lineHeight: 1.6,
                marginBottom: "8px",
              }}
            >
              <strong style={{ color: "#101828" }}>
                "{title.length > 50 ? title.slice(0, 50) + "..." : title}"
              </strong>
            </p>

            <p
              style={{
                fontSize: "14px",
                color: "#667085",
                lineHeight: 1.6,
                marginBottom: "28px",
              }}
            >
              আপনার লিস্টিং সফলভাবে জমা হয়েছে
            </p>

            {/* Status card */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.03))",
                border: "1.5px solid rgba(245,158,11,0.3)",
                borderRadius: "14px",
                padding: "20px",
                marginBottom: "24px",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    background: "#f59e0b",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Clock size={18} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 800,
                      color: "#101828",
                    }}
                  >
                    Admin যাচাই করছে
                  </div>
                  <div style={{ fontSize: "12px", color: "#667085" }}>
                    সাধারণত ১-২৪ ঘণ্টার মধ্যে
                  </div>
                </div>
              </div>

              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  fontSize: "13px",
                  color: "#344054",
                  lineHeight: 1.5,
                }}
              >
                <li style={{ display: "flex", gap: "8px" }}>
                  <span style={{ color: "#10b981", flexShrink: 0 }}>✓</span>
                  Admin আপনার লিস্টিং যাচাই করবেন
                </li>
                <li style={{ display: "flex", gap: "8px" }}>
                  <span style={{ color: "#10b981", flexShrink: 0 }}>✓</span>
                  Approve হলে Browse page-এ দেখা যাবে
                </li>
                <li style={{ display: "flex", gap: "8px" }}>
                  <span style={{ color: "#10b981", flexShrink: 0 }}>✓</span>
                  কোনো সমস্যা হলে reject-এর কারণ দেখতে পাবেন
                </li>
              </ul>
            </div>

            {/* Trust badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.25)",
                borderRadius: "99px",
                padding: "8px 16px",
                fontSize: "12px",
                color: "#10b981",
                fontWeight: 700,
                marginBottom: "28px",
                width: "fit-content",
                margin: "0 auto 28px",
              }}
            >
              <Shield size={14} />
              Escrow-protected লেনদেন
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Link
                href="/dashboard"
                style={{
                  flex: "1 1 200px",
                  padding: "14px",
                  background:
                    "linear-gradient(135deg, #6C63FF 0%, #EC4899 100%)",
                  color: "#fff",
                  borderRadius: "12px",
                  fontWeight: 800,
                  fontSize: "14px",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 8px 20px rgba(108,99,255,0.35)",
                }}
              >
                <LayoutDashboard size={16} />
                ড্যাশবোর্ডে যান
              </Link>
              <Link
                href="/create-listing"
                style={{
                  flex: "1 1 200px",
                  padding: "14px",
                  background: "#fff",
                  color: "#6C63FF",
                  border: "1.5px solid #6C63FF",
                  borderRadius: "12px",
                  fontWeight: 800,
                  fontSize: "14px",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <Sparkles size={16} />
                আরেকটা তৈরি করুন
              </Link>
            </div>

            <Link
              href="/browse"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                marginTop: "20px",
                fontSize: "13px",
                color: "#667085",
                fontWeight: 600,
              }}
            >
              Browse page দেখুন <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pop {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          50% { transform: scale(1.1) rotate(10deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes confetti0 {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(400px) rotate(720deg); opacity: 0; }
        }
        @keyframes confetti1 {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(400px) rotate(-720deg); opacity: 0; }
        }
        @keyframes confetti2 {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(500px) rotate(540deg); opacity: 0; }
        }
        @keyframes confetti3 {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(350px) rotate(-540deg); opacity: 0; }
        }
        @media (max-width: 480px) {
          h1 { font-size: 22px !important; }
        }
      `}</style>
    </main>
  );
}
