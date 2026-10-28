"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Mail,
  Loader2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  KeyRound,
  CheckCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { showToast } from "@/components/Toast";

export default function ForgotPasswordContent() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !email.includes("@")) {
      return setError("সঠিক ইমেইল দিন");
    }

    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (resetError) throw resetError;

      setSent(true);
      showToast("success", "ইমেইল পাঠানো হয়েছে", "Inbox চেক করুন");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "সমস্যা হয়েছে। আবার চেষ্টা করুন");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f97316 0%, #ec4899 40%, #8b5cf6 100%)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
      }}
    >
      {/* Decorative blobs */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.2), transparent 70%)",
          top: -200,
          right: -150,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 450,
          height: 450,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.35), transparent 70%)",
          bottom: -180,
          left: -120,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(249,115,22,0.25), transparent 70%)",
          top: "30%",
          left: "5%",
          pointerEvents: "none",
        }}
      />

      {/* Card */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "440px",
          width: "100%",
          background:
            "linear-gradient(135deg, #f97316 0%, #ec4899 50%, #8b5cf6 100%)",
          borderRadius: "28px",
          padding: "3px",
          boxShadow: "0 40px 100px rgba(0,0,0,0.45), 0 0 60px rgba(249,115,22,0.4)",
        }}
      >
        <div
          style={{
            background: "linear-gradient(160deg, #ffffff 0%, #fff7ed 40%, #fef2f2 100%)",
            borderRadius: "26px",
            padding: "40px 28px 32px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Inner blobs */}
          <div
            style={{
              position: "absolute",
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(249,115,22,0.15), transparent 70%)",
              top: -60,
              right: -60,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 140,
              height: 140,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(236,72,153,0.12), transparent 70%)",
              bottom: -40,
              left: -40,
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", zIndex: 2 }}>
            {/* Back link */}
            <Link
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                color: "#667085",
                fontWeight: 600,
                marginBottom: "20px",
              }}
            >
              <ArrowLeft size={14} /> লগইনে ফিরুন
            </Link>

            {!sent ? (
              <>
                {/* Icon + Title */}
                <div style={{ textAlign: "center", marginBottom: "28px" }}>
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: "22px",
                      background: "linear-gradient(135deg, #f97316 0%, #ec4899 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 18px",
                      boxShadow:
                        "0 15px 35px rgba(249,115,22,0.5), 0 0 0 4px rgba(255,255,255,0.5)",
                      transform: "rotate(-6deg)",
                    }}
                  >
                    <KeyRound
                      size={34}
                      color="#fff"
                      style={{ transform: "rotate(6deg)" }}
                    />
                  </div>

                  <h1
                    style={{
                      fontSize: "24px",
                      fontWeight: 800,
                      background:
                        "linear-gradient(135deg, #f97316 0%, #ec4899 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      marginBottom: "8px",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    পাসওয়ার্ড ভুলে গেছেন?
                  </h1>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#667085",
                      lineHeight: 1.6,
                      maxWidth: "320px",
                      margin: "0 auto",
                    }}
                  >
                    চিন্তা নেই! আপনার ইমেইল দিন, আমরা reset link পাঠাবো।
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div
                    style={{
                      background: "rgba(239,68,68,0.1)",
                      border: "1.5px solid rgba(239,68,68,0.35)",
                      borderRadius: "12px",
                      padding: "11px 14px",
                      marginBottom: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      color: "#ef4444",
                      fontWeight: 600,
                    }}
                  >
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    {error}
                  </div>
                )}

                {/* Form */}
                <form
                  onSubmit={handleSubmit}
                  style={{ display: "flex", flexDirection: "column", gap: "16px" }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: "12px",
                        fontWeight: 800,
                        color: "#344054",
                        marginBottom: "6px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        textTransform: "uppercase",
                        letterSpacing: "0.4px",
                      }}
                    >
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "6px",
                          background: "rgba(249,115,22,0.15)",
                          color: "#f97316",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Mail size={14} />
                      </span>
                      আপনার ইমেইল
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      disabled={loading}
                      style={inputStyle}
                      autoComplete="email"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      marginTop: "6px",
                      padding: "15px",
                      background: loading
                        ? "#94a3b8"
                        : "linear-gradient(135deg, #f97316 0%, #ec4899 55%, #8b5cf6 100%)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "14px",
                      fontWeight: 800,
                      fontSize: "15px",
                      cursor: loading ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      boxShadow: loading
                        ? "none"
                        : "0 12px 30px rgba(249,115,22,0.5), 0 0 0 1px rgba(255,255,255,0.3) inset",
                      transition: "all 0.2s",
                      letterSpacing: "0.3px",
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2
                          size={16}
                          style={{ animation: "spin 1s linear infinite" }}
                        />
                        পাঠানো হচ্ছে...
                      </>
                    ) : (
                      <>
                        Reset link পাঠান <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                <p
                  style={{
                    textAlign: "center",
                    fontSize: "13px",
                    color: "#667085",
                    marginTop: "22px",
                    fontWeight: 500,
                  }}
                >
                  মনে পড়েছে?{" "}
                  <Link
                    href="/login"
                    style={{ color: "#f97316", fontWeight: 800 }}
                  >
                    লগইন করুন
                  </Link>
                </p>
              </>
            ) : (
              /* ===== SUCCESS STATE ===== */
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 24px",
                    boxShadow:
                      "0 15px 40px rgba(16,185,129,0.4), 0 0 0 8px rgba(16,185,129,0.15)",
                  }}
                >
                  <CheckCircle size={40} color="#fff" />
                </div>

                <h1
                  style={{
                    fontSize: "24px",
                    fontWeight: 800,
                    background:
                      "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    marginBottom: "10px",
                    letterSpacing: "-0.5px",
                  }}
                >
                  ইমেইল পাঠানো হয়েছে!
                </h1>

                <p
                  style={{
                    fontSize: "14px",
                    color: "#667085",
                    lineHeight: 1.6,
                    marginBottom: "10px",
                  }}
                >
                  <strong style={{ color: "#101828" }}>{email}</strong>
                  <br />
                  ঠিকানায় reset link পাঠানো হয়েছে।
                </p>

                <div
                  style={{
                    background: "rgba(249,115,22,0.08)",
                    border: "1px solid rgba(249,115,22,0.25)",
                    borderRadius: "12px",
                    padding: "14px",
                    fontSize: "13px",
                    color: "#667085",
                    lineHeight: 1.6,
                    textAlign: "left",
                    marginBottom: "24px",
                  }}
                >
                  <strong style={{ color: "#f97316" }}>📌 পরবর্তী ধাপ:</strong>
                  <br />
                  ১. আপনার inbox চেক করুন
                  <br />
                  ২. Reset link-এ ক্লিক করুন
                  <br />
                  ৩. নতুন password সেট করুন
                  <br />
                  <br />
                  <span style={{ fontSize: "12px" }}>
                    Spam folder-ও চেক করুন। ১০ মিনিটের মধ্যে না পেলে আবার
                    চেষ্টা করুন।
                  </span>
                </div>

                <Link
                  href="/login"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    width: "100%",
                    padding: "14px",
                    background:
                      "linear-gradient(135deg, #f97316 0%, #ec4899 55%, #8b5cf6 100%)",
                    color: "#fff",
                    borderRadius: "12px",
                    fontWeight: 800,
                    fontSize: "14px",
                    boxShadow: "0 12px 30px rgba(249,115,22,0.4)",
                  }}
                >
                  লগইনে ফিরুন <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input::placeholder { color: #98a2b3; }
        input:focus {
          border-color: #f97316 !important;
          background: #fff !important;
          box-shadow: 0 0 0 3px rgba(249,115,22,0.15) !important;
        }
      `}</style>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "1.5px solid #e4e7ec",
  borderRadius: "11px",
  background: "#f9fafb",
  color: "#101828",
  fontSize: "14px",
  outline: "none",
  fontFamily: "inherit",
  transition: "all 0.2s",
};
