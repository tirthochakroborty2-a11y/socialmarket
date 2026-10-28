"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Sparkle,
  Mail,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  RotateCw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { showToast } from "@/components/Toast";

export default function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const supabase = createClient();

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => {
      setResendTimer((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // only digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");

    // Auto-focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (newOtp.every((d) => d !== "")) {
      verifyOtp(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newOtp = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);

    if (pasted.length === 6) {
      verifyOtp(pasted);
    } else {
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const verifyOtp = async (code: string) => {
    if (!email) {
      setError("ইমেইল পাওয়া যায়নি। আবার রেজিস্টার করুন।");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "signup",
      });

      if (verifyError) throw verifyError;

      showToast("success", "সফল!", "ইমেইল যাচাই সম্পন্ন হয়েছে");
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      const msg = err?.message?.toLowerCase() || "";
      if (msg.includes("expired")) {
        setError("OTP মেয়াদ শেষ। নতুন code পাঠান।");
      } else if (msg.includes("invalid")) {
        setError("ভুল OTP। আবার চেষ্টা করুন।");
      } else {
        setError(err?.message || "যাচাই ব্যর্থ হয়েছে");
      }
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      showToast("error", "ত্রুটি", "ইমেইল পাওয়া যায়নি");
      return;
    }
    setResending(true);

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (resendError) throw resendError;

      showToast("success", "OTP পাঠানো হয়েছে", "ইমেইল চেক করুন");
      setResendTimer(60);
    } catch (err: any) {
      showToast("error", "সমস্যা", err?.message || "আবার চেষ্টা করুন");
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.every((d) => d !== "")) {
      verifyOtp(otp.join(""));
    } else {
      setError("সম্পূর্ণ ৬ ডিজিটের code দিন");
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #667eea 0%, #764ba2 35%, #6C63FF 60%, #EC4899 100%)",
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
          background: "radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%)",
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
          background: "radial-gradient(circle, rgba(16,185,129,0.25), transparent 70%)",
          bottom: -180,
          left: -120,
          pointerEvents: "none",
        }}
      />

      {/* Card */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "460px",
          width: "100%",
          background: "linear-gradient(135deg, #6C63FF 0%, #EC4899 55%, #F59E0B 100%)",
          borderRadius: "28px",
          padding: "3px",
          boxShadow: "0 40px 100px rgba(0,0,0,0.4), 0 0 60px rgba(108,99,255,0.4)",
        }}
      >
        <div
          style={{
            background: "linear-gradient(160deg, #ffffff 0%, #fef6ff 40%, #f0f4ff 100%)",
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
              background: "radial-gradient(circle, rgba(108,99,255,0.15), transparent 70%)",
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

            {/* Icon */}
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "22px",
                  background: "linear-gradient(135deg, #6C63FF 0%, #EC4899 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 18px",
                  boxShadow:
                    "0 15px 35px rgba(108,99,255,0.45), 0 0 0 4px rgba(255,255,255,0.5)",
                  transform: "rotate(-6deg)",
                }}
              >
                <Mail size={34} color="#fff" style={{ transform: "rotate(6deg)" }} />
              </div>

              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #6C63FF 0%, #EC4899 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: "8px",
                  letterSpacing: "-0.5px",
                }}
              >
                ইমেইল যাচাই করুন
              </h1>
              <p style={{ fontSize: "13px", color: "#667085", lineHeight: 1.6 }}>
                <strong style={{ color: "#101828" }}>{email || "আপনার ইমেইল"}</strong>
                <br />
                ঠিকানায় ৬-ডিজিটের code পাঠানো হয়েছে
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

            {/* OTP inputs */}
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  justifyContent: "center",
                  marginBottom: "24px",
                }}
              >
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    disabled={loading}
                    style={{
                      width: "48px",
                      height: "56px",
                      textAlign: "center",
                      fontSize: "24px",
                      fontWeight: 800,
                      color: "#101828",
                      background: digit ? "rgba(108,99,255,0.08)" : "#f9fafb",
                      border: digit
                        ? "2px solid #6C63FF"
                        : "1.5px solid #e4e7ec",
                      borderRadius: "12px",
                      outline: "none",
                      fontFamily: "inherit",
                      transition: "all 0.2s",
                      boxShadow: digit ? "0 0 0 3px rgba(108,99,255,0.15)" : "none",
                    }}
                  />
                ))}
              </div>

              {/* Submit button (shown if all digits filled but auto-submit failed) */}
              {otp.every((d) => d !== "") && (
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: loading
                      ? "#94a3b8"
                      : "linear-gradient(135deg, #6C63FF 0%, #EC4899 55%, #F59E0B 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    fontWeight: 800,
                    fontSize: "15px",
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: loading
                      ? "none"
                      : "0 12px 30px rgba(108,99,255,0.5)",
                    marginBottom: "16px",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                      যাচাই হচ্ছে...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      যাচাই করুন
                    </>
                  )}
                </button>
              )}
            </form>

            {/* Loading indicator when verifying via auto-submit */}
            {loading && !otp.every((d) => d !== "") && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  fontSize: "13px",
                  color: "#6C63FF",
                  fontWeight: 600,
                  marginBottom: "16px",
                }}
              >
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                যাচাই হচ্ছে...
              </div>
            )}

            {/* Resend */}
            <div
              style={{
                textAlign: "center",
                fontSize: "13px",
                color: "#667085",
                marginBottom: "20px",
              }}
            >
              code পাননি?{" "}
              {resendTimer > 0 ? (
                <span style={{ color: "#98a2b3", fontWeight: 700 }}>
                  আবার পাঠান ({resendTimer}s)
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#6C63FF",
                    fontWeight: 800,
                    cursor: resending ? "not-allowed" : "pointer",
                    fontSize: "13px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: 0,
                  }}
                >
                  {resending ? (
                    <>
                      <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
                      পাঠানো হচ্ছে...
                    </>
                  ) : (
                    <>
                      <RotateCw size={12} />
                      আবার পাঠান
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Help text */}
            <div
              style={{
                background: "rgba(108,99,255,0.06)",
                border: "1px solid rgba(108,99,255,0.2)",
                borderRadius: "10px",
                padding: "10px 14px",
                fontSize: "12px",
                color: "#667085",
                lineHeight: 1.5,
                textAlign: "center",
              }}
            >
              💡 Spam folder-ও চেক করুন। ৫ মিনিটের বেশি হলে resend করুন।
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input::placeholder { color: #98a2b3; }
        @media (max-width: 480px) {
          input[type="text"][inputmode="numeric"] {
            width: 42px !important;
            height: 50px !important;
            font-size: 20px !important;
          }
        }
      `}</style>
    </main>
  );
}
