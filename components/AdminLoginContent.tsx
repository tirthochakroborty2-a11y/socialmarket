"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Crown,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { showToast } from "@/components/Toast";

type Mode = "admin" | "superadmin";

const SUPER_ADMIN_EMAIL = "tirthochakroborty2@gmail.com";

export default function AdminLoginContent() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // If already logged in as admin, redirect
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "superadmin") {
        window.location.href = "/superadmin/dashboard";
      } else if (profile?.role === "admin") {
        window.location.href = "/admin/dashboard";
      }
    };
    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      return setError("ইমেইল ও পাসওয়ার্ড দিন");
    }

    if (
      mode === "superadmin" &&
      email.trim().toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()
    ) {
      return setError("Super Admin access restricted");
    }

    setLoading(true);

    try {
      // Step 1: Sign in
      const { error: signInErr, data: authData } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInErr) throw signInErr;

      if (!authData.user) {
        throw new Error("User not found after login");
      }

      // Step 2: Fetch profile
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("role, email, name")
        .eq("id", authData.user.id)
        .single();

      if (profileErr) {
        console.error("Profile fetch error:", profileErr);
        await supabase.auth.signOut();
        throw new Error("Profile পাওয়া যায়নি — DB check করুন");
      }

      // Step 3: Validate role
      if (!profile) {
        await supabase.auth.signOut();
        throw new Error("Profile missing");
      }

      if (mode === "superadmin") {
        if (profile.role !== "superadmin") {
          await supabase.auth.signOut();
          setError(`এই account superadmin নয় (role: ${profile.role})`);
          setLoading(false);
          return;
        }
        // Super Admin redirect
        showToast("success", "স্বাগতম Super Admin!", "Dashboard-এ redirect হচ্ছে...");
        setTimeout(() => {
          window.location.href = "/superadmin/dashboard";
        }, 500);
      } else {
        if (profile.role !== "admin" && profile.role !== "superadmin") {
          await supabase.auth.signOut();
          setError(`এই account admin নয় (role: ${profile.role})`);
          setLoading(false);
          return;
        }
        // Admin redirect
        const target = profile.role === "superadmin" 
          ? "/superadmin/dashboard" 
          : "/admin/dashboard";
        showToast("success", "স্বাগতম Admin!", "Dashboard-এ redirect হচ্ছে...");
        setTimeout(() => {
          window.location.href = target;
        }, 500);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const msg = err?.message?.toLowerCase() || "";
      if (msg.includes("invalid login") || msg.includes("invalid credentials")) {
        setError("ইমেইল বা পাসওয়ার্ড ভুল");
      } else {
        setError(err?.message || "লগইন ব্যর্থ");
      }
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0b1120 0%, #151d2e 50%, #1e1b4b 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        position: "relative",
        overflow: "hidden",
        fontFamily: "inherit",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(108,99,255,0.15), transparent 70%)",
          top: -200,
          left: -150,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(236,72,153,0.1), transparent 70%)",
          bottom: -150,
          right: -100,
          pointerEvents: "none",
        }}
      />

      <Link
        href="/"
        style={{
          position: "absolute",
          top: "24px",
          left: "24px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          color: "#94a3b8",
          fontSize: "13px",
          fontWeight: 600,
          textDecoration: "none",
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.1)",
          padding: "8px 14px",
          borderRadius: "10px",
          zIndex: 10,
        }}
      >
        <ArrowLeft size={14} />
        সাইটে ফিরুন
      </Link>

      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "440px",
          width: "100%",
          background: "rgba(21,29,46,0.9)",
          backdropFilter: "blur(20px)",
          border: "1.5px solid rgba(108,99,255,0.3)",
          borderRadius: "24px",
          padding: "40px 32px",
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.5), 0 0 100px rgba(108,99,255,0.2)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "20px",
              background:
                mode === "superadmin"
                  ? "linear-gradient(135deg, #EC4899, #F59E0B)"
                  : "linear-gradient(135deg, #6C63FF, #5A52D5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow:
                mode === "superadmin"
                  ? "0 15px 40px rgba(236,72,153,0.5), 0 0 0 4px rgba(236,72,153,0.15)"
                  : "0 15px 40px rgba(108,99,255,0.5), 0 0 0 4px rgba(108,99,255,0.15)",
              transition: "all 0.3s",
            }}
          >
            {mode === "superadmin" ? (
              <Crown size={34} color="#fff" />
            ) : (
              <Shield size={34} color="#fff" />
            )}
          </div>

          <h1
            style={{
              fontSize: "26px",
              fontWeight: 800,
              color: "#f1f5f9",
              marginBottom: "6px",
              letterSpacing: "-0.5px",
            }}
          >
            {mode === "superadmin" ? "Super Admin" : "Admin Panel"}
          </h1>
          <p style={{ fontSize: "13px", color: "#94a3b8" }}>
            আপনার admin account দিয়ে লগইন করুন
          </p>
        </div>

        <div
          style={{
            display: "flex",
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            padding: "4px",
            marginBottom: "24px",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode("admin");
              setError("");
            }}
            style={{
              flex: 1,
              padding: "10px",
              border: "none",
              borderRadius: "9px",
              background:
                mode === "admin"
                  ? "linear-gradient(135deg, #6C63FF, #5A52D5)"
                  : "transparent",
              color: mode === "admin" ? "#fff" : "#94a3b8",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transition: "all 0.2s",
            }}
          >
            <Shield size={14} />
            Admin
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("superadmin");
              setError("");
            }}
            style={{
              flex: 1,
              padding: "10px",
              border: "none",
              borderRadius: "9px",
              background:
                mode === "superadmin"
                  ? "linear-gradient(135deg, #EC4899, #F59E0B)"
                  : "transparent",
              color: mode === "superadmin" ? "#fff" : "#94a3b8",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transition: "all 0.2s",
            }}
          >
            <Crown size={14} />
            Super Admin
          </button>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1.5px solid rgba(239,68,68,0.3)",
              borderRadius: "10px",
              padding: "10px 14px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              color: "#f87171",
              fontWeight: 600,
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "14px" }}
        >
          <div>
            <label
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#cbd5e1",
                marginBottom: "6px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.3px",
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "6px",
                  background: "rgba(108,99,255,0.15)",
                  color: "#6C63FF",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Mail size={12} />
              </span>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1.5px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                background: "rgba(0,0,0,0.3)",
                color: "#f1f5f9",
                fontSize: "14px",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#cbd5e1",
                marginBottom: "6px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.3px",
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "6px",
                  background: "rgba(236,72,153,0.15)",
                  color: "#EC4899",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Lock size={12} />
              </span>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px 42px 12px 14px",
                  border: "1.5px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  background: "rgba(0,0,0,0.3)",
                  color: "#f1f5f9",
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  display: "flex",
                  padding: "4px",
                }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "8px",
              padding: "14px",
              background: loading
                ? "#475569"
                : mode === "superadmin"
                ? "linear-gradient(135deg, #EC4899, #F59E0B)"
                : "linear-gradient(135deg, #6C63FF, #5A52D5)",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              fontWeight: 800,
              fontSize: "14px",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow:
                mode === "superadmin"
                  ? "0 10px 30px rgba(236,72,153,0.4)"
                  : "0 10px 30px rgba(108,99,255,0.4)",
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
                {mode === "superadmin" ? (
                  <Crown size={16} />
                ) : (
                  <Shield size={16} />
                )}
                লগইন করুন
              </>
            )}
          </button>
        </form>

        <div
          style={{
            marginTop: "24px",
            paddingTop: "20px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            textAlign: "center",
            fontSize: "11px",
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          <Lock size={11} />
          Restricted access — শুধু authorized admin
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input::placeholder { color: #475569; }
        input:focus {
          border-color: rgba(108,99,255,0.5) !important;
          box-shadow: 0 0 0 3px rgba(108,99,255,0.15) !important;
        }
      `}</style>
    </main>
  );
}
