"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Sparkle,
  CheckCircle,
  AlertCircle,
  Shield,
  Zap,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { showToast } from "@/components/Toast";

export default function RegisterContent() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const strength = (() => {
    const pw = form.password;
    let s = 0;
    if (pw.length >= 6) s++;
    if (pw.length >= 10) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  })();

  const strengthColors = ["#ef4444", "#f59e0b", "#f59e0b", "#10b981", "#10b981"];
  const strengthLabels = ["খুব দুর্বল", "দুর্বল", "মাঝারি", "ভালো", "শক্তিশালী"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("আপনার নাম লিখুন");
    if (!form.email.trim() || !form.email.includes("@")) return setError("সঠিক ইমেইল দিন");
    if (form.password.length < 6) return setError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
    if (form.password !== form.confirmPassword) return setError("পাসওয়ার্ড মিলছে না");

    setLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: { data: { name: form.name.trim() } },
      });

      if (signUpError) throw signUpError;

      showToast("success", "অ্যাকাউন্ট তৈরি হয়েছে!", "ইমেইল যাচাই করুন");
      router.push(`/verify-email?email=${encodeURIComponent(form.email.trim())}`);
    } catch (err: any) {
      const msg = err?.message || "রেজিস্ট্রেশন ব্যর্থ";
      if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("registered")) {
        setError("এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে");
      } else {
        setError(msg);
      }
      setLoading(false);
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
          background: "radial-gradient(circle, rgba(236,72,153,0.35), transparent 70%)",
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
          background: "radial-gradient(circle, rgba(16,185,129,0.25), transparent 70%)",
          top: "50%",
          left: "8%",
          pointerEvents: "none",
        }}
      />

      {/* ===== MAIN CARD ===== */}
      <div
        className="reg-card"
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "460px",
          width: "100%",
          background: "linear-gradient(135deg, #6C63FF 0%, #EC4899 55%, #F59E0B 100%)",
          borderRadius: "28px",
          padding: "3px",
          boxShadow:
            "0 40px 100px rgba(0,0,0,0.4), 0 0 60px rgba(108,99,255,0.4)",
        }}
      >
        {/* INNER colorful card */}
        <div
          style={{
            background:
              "linear-gradient(160deg, #ffffff 0%, #fef6ff 40%, #f0f4ff 100%)",
            borderRadius: "26px",
            padding: "36px 28px 32px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Inner decorative blobs */}
          <div
            style={{
              position: "absolute",
              width: 180,
              height: 180,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(108,99,255,0.15), transparent 70%)",
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
              background:
                "radial-gradient(circle, rgba(236,72,153,0.12), transparent 70%)",
              bottom: -40,
              left: -40,
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", zIndex: 2 }}>
            {/* Logo + Title */}
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: "20px",
                  background:
                    "linear-gradient(135deg, #6C63FF 0%, #EC4899 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 18px",
                  boxShadow:
                    "0 15px 35px rgba(108,99,255,0.45), 0 0 0 4px rgba(255,255,255,0.5)",
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
                {/* Online dot */}
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
                  background:
                    "linear-gradient(135deg, #6C63FF 0%, #EC4899 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: "6px",
                  letterSpacing: "-0.7px",
                }}
              >
                নতুন অ্যাকাউন্ট
              </h1>
              <p
                style={{
                  fontSize: "13px",
                  color: "#667085",
                  fontWeight: 500,
                }}
              >
                কয়েক সেকেন্ডে শুরু করুন
              </p>
            </div>

            {/* Feature chips */}
            <div
              style={{
                display: "flex",
                gap: "6px",
                justifyContent: "center",
                marginBottom: "22px",
                flexWrap: "wrap",
              }}
            >
              <Chip icon={<Shield size={11} />} text="Escrow" color="#6C63FF" />
              <Chip icon={<Zap size={11} />} text="দ্রুত" color="#f59e0b" />
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
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <Field label="পূর্ণ নাম" icon={<User size={14} />} color="#6C63FF">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="আপনার নাম"
                  style={inputStyle}
                  disabled={loading}
                />
              </Field>

              <Field label="ইমেইল" icon={<Mail size={14} />} color="#ec4899">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  style={inputStyle}
                  disabled={loading}
                />
              </Field>

              <Field label="পাসওয়ার্ড" icon={<Lock size={14} />} color="#f59e0b">
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="কমপক্ষে ৬ অক্ষর"
                    style={{ ...inputStyle, paddingRight: "42px" }}
                    disabled={loading}
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

              {form.password && (
                <div style={{ marginTop: "-6px" }}>
                  <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        style={{
                          height: 4,
                          flex: 1,
                          borderRadius: 2,
                          background:
                            i <= strength
                              ? strengthColors[Math.max(0, strength - 1)]
                              : "#e4e7ec",
                          transition: "background 0.2s",
                        }}
                      />
                    ))}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color:
                        strength >= 3
                          ? "#10b981"
                          : strength >= 2
                          ? "#f59e0b"
                          : "#ef4444",
                      fontWeight: 700,
                    }}
                  >
                    {strengthLabels[Math.max(0, Math.min(4, strength - 1))] || ""}
                  </div>
                </div>
              )}

              <Field
                label="পাসওয়ার্ড নিশ্চিত"
                icon={<Lock size={14} />}
                color="#10b981"
              >
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm({ ...form, confirmPassword: e.target.value })
                    }
                    placeholder="আবার লিখুন"
                    style={{
                      ...inputStyle,
                      paddingRight: "42px",
                      borderColor:
                        form.confirmPassword &&
                        form.password !== form.confirmPassword
                          ? "#ef4444"
                          : undefined,
                    }}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    style={eyeButtonStyle}
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#10b981",
                      marginTop: "4px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontWeight: 700,
                    }}
                  >
                    <CheckCircle size={12} /> পাসওয়ার্ড মিলেছে
                  </div>
                )}
              </Field>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: "10px",
                  padding: "15px",
                  background: loading
                    ? "#94a3b8"
                    : "linear-gradient(135deg, #6C63FF 0%, #EC4899 55%, #F59E0B 100%)",
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
                    : "0 12px 30px rgba(108,99,255,0.5), 0 0 0 1px rgba(255,255,255,0.3) inset",
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
                    তৈরি হচ্ছে...
                  </>
                ) : (
                  "অ্যাকাউন্ট তৈরি করুন"
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

            {/* Google button */}
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
              Google দিয়ে সাইন আপ
            </button>

            <p
              style={{
                textAlign: "center",
                fontSize: "13px",
                color: "#667085",
                marginTop: "22px",
                fontWeight: 500,
              }}
            >
              আগে থেকেই আছে?{" "}
              <Link
                href="/login"
                style={{
                  color: "#6C63FF",
                  fontWeight: 800,
                }}
              >
                লগইন করুন
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
        .reg-card input:focus {
          border-color: #6C63FF !important;
          background: #fff !important;
          box-shadow: 0 0 0 3px rgba(108,99,255,0.15) !important;
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
