"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle,
  KeyRound,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { showToast } from "@/components/Toast";

export default function ResetPasswordContent() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validSession, setValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setValidSession(!!data.session);
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      return setError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
    }
    if (password !== confirmPassword) {
      return setError("পাসওয়ার্ড মিলছে না");
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) throw updateError;

      showToast("success", "সফল!", "পাসওয়ার্ড আপডেট হয়েছে");
      setTimeout(() => router.push("/login"), 800);
    } catch (err: any) {
      setError(err?.message || "আপডেট ব্যর্থ হয়েছে");
      setLoading(false);
    }
  };

  // Invalid session
  if (validSession === false) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #f97316 0%, #ec4899 40%, #8b5cf6 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "440px",
            width: "100%",
            background: "linear-gradient(135deg, #f97316, #ec4899, #8b5cf6)",
            borderRadius: "28px",
            padding: "3px",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "26px",
              padding: "40px 28px",
              textAlign: "center",
            }}
          >
            <AlertCircle
              size={48}
              color="#ef4444"
              style={{ margin: "0 auto 16px" }}
            />
            <h1 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "12px" }}>
              Invalid Reset Link
            </h1>
            <p style={{ fontSize: "14px", color: "#667085", marginBottom: "24px" }}>
              Link-টি মেয়াদোত্তীর্ণ বা ব্যবহার করা হয়েছে। আবার চেষ্টা করুন।
            </p>
            <Link
              href="/forgot-password"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "linear-gradient(135deg, #f97316, #ec4899)",
                color: "#fff",
                padding: "12px 24px",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              নতুন link চাই <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </main>
    );
  }

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
          position: "relative",
          zIndex: 2,
          maxWidth: "440px",
          width: "100%",
          background: "linear-gradient(135deg, #f97316, #ec4899, #8b5cf6)",
          borderRadius: "28px",
          padding: "3px",
          boxShadow: "0 40px 100px rgba(0,0,0,0.45)",
        }}
      >
        <div
          style={{
            background: "linear-gradient(160deg, #ffffff, #fff7ed, #fef2f2)",
            borderRadius: "26px",
            padding: "40px 28px 32px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "relative", zIndex: 2 }}>
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
                  boxShadow: "0 15px 35px rgba(249,115,22,0.5)",
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
                  background: "linear-gradient(135deg, #f97316 0%, #ec4899 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: "6px",
                }}
              >
                নতুন পাসওয়ার্ড
              </h1>
              <p style={{ fontSize: "13px", color: "#667085" }}>
                শক্তিশালী একটা নতুন পাসওয়ার্ড দিন
              </p>
            </div>

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

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>
                  <span style={iconBoxStyle}>
                    <Lock size={14} />
                  </span>
                  নতুন পাসওয়ার্ড
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="কমপক্ষে ৬ অক্ষর"
                    disabled={loading}
                    style={{ ...inputStyle, paddingRight: "42px" }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={eyeStyle}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={labelStyle}>
                  <span style={iconBoxStyle}>
                    <Lock size={14} />
                  </span>
                  পাসওয়ার্ড নিশ্চিত
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="আবার লিখুন"
                  disabled={loading}
                  style={inputStyle}
                />
                {confirmPassword && password === confirmPassword && (
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
              </div>

              <button
                type="submit"
                disabled={loading || validSession === null}
                style={{
                  marginTop: "6px",
                  padding: "15px",
                  background:
                    loading || validSession === null
                      ? "#94a3b8"
                      : "linear-gradient(135deg, #f97316 0%, #ec4899 55%, #8b5cf6 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "14px",
                  fontWeight: 800,
                  fontSize: "15px",
                  cursor:
                    loading || validSession === null ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow:
                    loading || validSession === null
                      ? "none"
                      : "0 12px 30px rgba(249,115,22,0.5)",
                }}
              >
                {loading ? (
                  <>
                    <Loader2
                      size={16}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                    আপডেট হচ্ছে...
                  </>
                ) : (
                  <>
                    পাসওয়ার্ড আপডেট করুন <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
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

const labelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 800,
  color: "#344054",
  marginBottom: "6px",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.4px",
};

const iconBoxStyle: React.CSSProperties = {
  width: 22,
  height: 22,
  borderRadius: "6px",
  background: "rgba(249,115,22,0.15)",
  color: "#f97316",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const eyeStyle: React.CSSProperties = {
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
