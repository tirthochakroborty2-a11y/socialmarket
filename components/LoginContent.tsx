"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Sparkle,
  AlertCircle,
  ArrowRight,
  Shield,
  Zap,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { showToast } from "@/components/Toast";

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const supabase = createClient();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim() || !form.email.includes("@")) {
      return setError("সঠিক ইমেইল দিন");
    }
    if (!form.password) {
      return setError("পাসওয়ার্ড দিন");
    }

    setLoading(true);

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });

      if (loginError) throw loginError;

      showToast("success", "স্বাগতম!", "সফলভাবে লগইন হয়েছে");
      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      const msg = err?.message?.toLowerCase() || "";
      if (msg.includes("invalid login") || msg.includes("invalid credentials")) {
        setError("ইমেইল বা পাসওয়ার্ড ভুল");
      } else if (msg.includes("email not confirmed")) {
        setError("ইমেইল এখনো যাচাই করা হয়নি। Verify করুন।");
      } else {
        setError(err?.message || "লগইন ব্যর্থ হয়েছে");
      }
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #1e3a8a 0%, #4f46e5 30%, #7c3aed 60%, #6C63FF 100%)",
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
          background: "radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%)",
          top: -200,
          left: -150,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 450,
          height: 450,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.4), transparent 70%)",
          bottom: -180,
          right: -120,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,182,212,0.25), transparent 70%)",
          top: "40%",
          right: "10%",
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
            "linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #06b6d4 100%)",
          borderRadius: "28px",
          padding: "3px",
          boxShadow: "0 40px 100px rgba(0,0,0,0.45), 0 0 60px rgba(79,70,229,0.4)",
        }}
      >
        <div
          style={{
            background: "linear-gradient(160deg, #ffffff 0%, #f5f7ff 40%, #eff6ff 100%)",
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
              background: "radial-gradient(circle, rgba(79,70,229,0.15), transparent 70%)",
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
              background: "radial-gradient(circle, rgba(6,182,212,0.15), transparent 70%)",
              bottom: -40,
              left: -40,
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", zIndex: 2 }}>
            {/* Icon + Title */}
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: "20px",
                  background: "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 18px",
                  boxShadow:
                    "0 15px 35px rgba(79,70,229,0.5), 0 0 0 4px rgba(255,255,255,0.5)",
                  position: "relative",
                  transform: "rotate(-6deg)",
                }}
              >
                <Sparkle
                  size={32}
                  color="#fff"
                  fill="#fff"
                  style={{ transform: "rotate(6deg)" }}
                />
                <div
                  style={{
                    position: "absolute",
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    border: "3px solid #fff",
                    bottom: -3,
                    right: -3,
                    boxShadow: "0 2px 8px rgba(16,185,129,0.5)",
                  }}
                />
              </div>

              <h1
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: "6px",
                  letterSpacing: "-0.5px",
                }}
              >
                স্বাগতম ফিরে
              </h1>
              <p style={{ fontSize: "13px", color: "#667085", fontWeight: 500 }}>
                আপনার অ্যাকাউন্টে লগইন করুন
              </p>
            </div>

            {/* Feature chips */}
            <div
              style={{
                display: "flex",
                gap: "6px",
                justifyContent: "center",
                marginBottom: "24px",
                flexWrap: "wrap",
              }}
            >
              <Chip icon={<Shield size={11} />} text="Escrow" color="#4f46e5" />
              <Chip icon={<Zap size={11} />} text="দ্রুত" color="#06b6d4" />
              <Chip icon={<Users size={11} />} text="Admin Chat" color="#10b981" />
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
              <Field label="ইমেইল" icon={<Mail size={14} />} color="#4f46e5">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  style={inputStyle}
                  disabled={loading}
                  autoComplete="email"
                />
              </Field>

              <Field label="পাসওয়ার্ড" icon={<Lock size={14} />} color="#06b6d4">
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="আপনার পাসওয়ার্ড"
                    style={{ ...inputStyle, paddingRight: "42px" }}
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={eyeButtonStyle}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>

              {/* Forgot password */}
              <div style={{ textAlign: "right", marginTop: "-8px" }}>
                <Link
                  href="/forgot-password"
                  style={{
                    fontSize: "13px",
                    color: "#4f46e5",
                    fontWeight: 700,
                  }}
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: "6px",
                  padding: "15px",
                  background: loading
                    ? "#94a3b8"
                    : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #06b6d4 100%)",
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
                    : "0 12px 30px rgba(79,70,229,0.5), 0 0 0 1px rgba(255,255,255,0.3) inset",
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
                    লগইন হচ্ছে...
                  </>
                ) : (
                  <>
                    লগইন করুন <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                margin: "20px 0",
              }}
            >
              <div style={{ flex: 1, height: 1, background: "#e4e7ec" }} />
              <span
                style={{
                  fontSize: "11px",
                  color: "#98a2b3",
                  fontWeight: 700,
                }}
              >
                অথবা
              </span>
              <div style={{ flex: 1, height: 1, background: "#e4e7ec" }} />
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={() =>
                showToast("info", "শীঘ্রই আসছে", "Google login এখনো চালু হয়নি")
              }
              style={{
                width: "100%",
                padding: "12px",
                background: "#fff",
                color: "#101828",
                border: "1.5px solid #e4e7ec",
                borderRadius: "12px",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                transition: "all 0.2s",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google দিয়ে লগইন
            </button>

            {/* Register link */}
            <p
              style={{
                textAlign: "center",
                fontSize: "13px",
                color: "#667085",
                marginTop: "22px",
                fontWeight: 500,
              }}
            >
              নতুন ব্যবহারকারী?{" "}
              <Link
                href="/register"
                style={{
                  color: "#4f46e5",
                  fontWeight: 800,
                }}
              >
                রেজিস্টার করুন
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input::placeholder { color: #98a2b3; }
        .login-card input:focus {
          border-color: #4f46e5 !important;
          background: #fff !important;
          box-shadow: 0 0 0 3px rgba(79,70,229,0.15) !important;
        }
        @media (max-width: 480px) {
          .reg-card { padding: 2px !important; }
          .reg-card > div { padding: 28px 20px 24px !important; }
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

const eyeButtonStyle: React.CSSProperties = {
  position: "absolute",
  right: "10px",
  top: "50%",
  transform: "translateY(-50%)",
  background: "transparent",
  border: "none",
  color: "#98a2b3",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  padding: "4px",
};

function Field({
  label,
  icon,
  color,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  color?: string;
  children: React.ReactNode;
}) {
  return (
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
        {icon && (
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: "6px",
              background: `${color}20`,
              color: color,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </span>
        )}
        {label}
      </label>
      {children}
    </div>
  );
}

function Chip({
  icon,
  text,
  color,
}: {
  icon: React.ReactNode;
  text: string;
  color: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        background: `${color}15`,
        border: `1px solid ${color}45`,
        color: color,
        padding: "5px 11px",
        borderRadius: "99px",
        fontSize: "11px",
        fontWeight: 800,
      }}
    >
      {icon}
      {text}
    </span>
  );
}
