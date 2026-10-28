"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Wallet,
  Package,
  ShoppingBag,
  Camera,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Crown,
  Info,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth";
import { showToast } from "@/components/Toast";

type Tab = "info" | "password" | "danger";

export default function ProfileContent() {
  const router = useRouter();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const supabase = createClient();

  const [tab, setTab] = useState<Tab>("info");
  const [name, setName] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoError, setInfoError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [stats, setStats] = useState({ listings: 0, purchases: 0, sales: 0 });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/profile");
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (profile?.name) setName(profile.name);
  }, [profile]);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      const { count: listingsCount } = await supabase
        .from("listings")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", user.id);

      const { count: purchasesCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("buyer_id", user.id);

      const { count: salesCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", user.id);

      setStats({
        listings: listingsCount || 0,
        purchases: purchasesCount || 0,
        sales: salesCount || 0,
      });
    };

    fetchStats();
  }, [user]);

  const displayName =
    profile?.name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";
  const displayEmail = profile?.email || user?.email || "";
  const displayRole = profile?.role || "user";
  const displayBalance = Number(profile?.coin_balance || 0);

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoError("");

    if (!name.trim() || name.trim().length < 2) {
      return setInfoError("নাম কমপক্ষে ২ অক্ষরের হতে হবে");
    }

    setSavingInfo(true);
    try {
      const { error } = await supabase.from("profiles").upsert(
        {
          id: user!.id,
          name: name.trim(),
          email: user!.email,
        },
        { onConflict: "id" }
      );

      if (error) throw error;

      await refreshProfile();
      showToast("success", "সফল!", "নাম আপডেট হয়েছে");
    } catch (err: any) {
      setInfoError(err?.message || "সমস্যা হয়েছে");
    } finally {
      setSavingInfo(false);
    }
  };

  const handleAvatarUpload = async (files: FileList | null) => {
    if (!files || !files[0] || !user) return;
    const file = files[0];

    if (!file.type.startsWith("image/")) {
      showToast("error", "ত্রুটি", "শুধু ছবি আপলোড করুন");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast("error", "ত্রুটি", "ছবি ২MB এর কম হতে হবে");
      return;
    }

    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${ext}`;

      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split("/avatars/")[1];
        if (oldPath) {
          await supabase.storage.from("avatars").remove([oldPath]);
        }
      }

      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const { error: updateErr } = await supabase
        .from("profiles")
        .update({ avatar_url: urlData.publicUrl })
        .eq("id", user.id);

      if (updateErr) throw updateErr;

      await refreshProfile();
      showToast("success", "সফল!", "ছবি আপডেট হয়েছে");
    } catch (err: any) {
      console.error(err);
      showToast("error", "সমস্যা", err?.message || "আবার চেষ্টা করুন");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!currentPassword) return setPasswordError("বর্তমান পাসওয়ার্ড দিন");
    if (newPassword.length < 6)
      return setPasswordError("নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষর");
    if (newPassword !== confirmPassword)
      return setPasswordError("পাসওয়ার্ড মিলছে না");

    setSavingPassword(true);
    try {
      const { error: authErr } = await supabase.auth.signInWithPassword({
        email: user!.email!,
        password: currentPassword,
      });

      if (authErr) {
        setPasswordError("বর্তমান পাসওয়ার্ড ভুল");
        setSavingPassword(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      showToast("success", "সফল!", "পাসওয়ার্ড আপডেট হয়েছে");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err?.message || "সমস্যা হয়েছে");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (authLoading || !user) {
    return (
      <div
        style={{
          padding: "80px 20px",
          textAlign: "center",
          color: "var(--muted)",
        }}
      >
        লোড হচ্ছে...
      </div>
    );
  }

  const initial = displayName.charAt(0).toUpperCase();
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString("bn-BD", {
        year: "numeric",
        month: "long",
      })
    : "N/A";

  return (
    <main
      style={{
        background: "var(--bg)",
        minHeight: "100vh",
        paddingBottom: "60px",
      }}
    >
      <section
        style={{
          background:
            "linear-gradient(135deg, #6C63FF 0%, #5A52D5 50%, #EC4899 100%)",
          padding: "40px 20px 100px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            top: -150,
            right: -100,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            bottom: -80,
            left: "10%",
          }}
        />

        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            position: "relative",
            zIndex: 2,
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: "#fff",
              marginBottom: "4px",
            }}
          >
            আমার প্রোফাইল
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)" }}>
            আপনার তথ্য এবং সেটিংস
          </p>
        </div>
      </section>

      <div
        style={{
          maxWidth: "1000px",
          margin: "-70px auto 0",
          padding: "0 20px",
          position: "relative",
          zIndex: 3,
        }}
      >
        <div
          style={{
            background: "var(--card)",
            border: "1.5px solid var(--border)",
            borderRadius: "20px",
            padding: "32px 28px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
            marginBottom: "20px",
          }}
        >
          <div
            className="profile-header"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: profile?.avatar_url
                    ? "transparent"
                    : "linear-gradient(135deg, #6C63FF, #EC4899)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "38px",
                  overflow: "hidden",
                  border: "4px solid var(--card)",
                  boxShadow: "0 8px 25px rgba(108,99,255,0.3)",
                }}
              >
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  initial
                )}
              </div>

              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleAvatarUpload(e.target.files)}
                style={{ display: "none" }}
              />
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "var(--primary)",
                  color: "#fff",
                  border: "2px solid var(--card)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: uploadingAvatar ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 10px rgba(108,99,255,0.4)",
                }}
              >
                {uploadingAvatar ? (
                  <Loader2
                    size={14}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                ) : (
                  <Camera size={14} />
                )}
              </button>
            </div>

            <div style={{ flex: 1, minWidth: 220 }}>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "var(--text)",
                  marginBottom: "4px",
                }}
              >
                {displayName}
              </h2>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  color: "var(--muted)",
                  marginBottom: "10px",
                  wordBreak: "break-all",
                }}
              >
                <Mail size={14} style={{ flexShrink: 0 }} />
                {displayEmail || "no email"}
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {displayRole === "superadmin" && (
                  <RoleBadge
                    icon={<Crown size={12} />}
                    label="Super Admin"
                    color="#EC4899"
                  />
                )}
                {displayRole === "admin" && (
                  <RoleBadge
                    icon={<Shield size={12} />}
                    label="Admin"
                    color="#6C63FF"
                  />
                )}
                {displayRole === "user" && (
                  <RoleBadge
                    icon={<User size={12} />}
                    label="User"
                    color="#10b981"
                  />
                )}
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    color: "var(--muted)",
                    padding: "3px 10px",
                    borderRadius: "99px",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  <Calendar size={11} />
                  যোগ দিয়েছেন {memberSince}
                </span>
              </div>
            </div>

            <div
              className="profile-stats"
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <MiniStat
                icon={<Package size={16} />}
                value={stats.listings}
                label="লিস্টিং"
                color="#6C63FF"
              />
              <MiniStat
                icon={<ShoppingBag size={16} />}
                value={stats.purchases}
                label="কেনা"
                color="#f59e0b"
              />
              <MiniStat
                icon={<Wallet size={16} />}
                value={stats.sales}
                label="বেচা"
                color="#10b981"
              />
            </div>
          </div>
        </div>

        <div
          style={{
            background: "var(--card)",
            border: "1.5px solid var(--border)",
            borderRadius: "16px",
            padding: "6px",
            display: "flex",
            gap: "4px",
            marginBottom: "20px",
            overflowX: "auto",
          }}
        >
          {(
            [
              { v: "info", label: "তথ্য", icon: <User size={14} /> },
              { v: "password", label: "পাসওয়ার্ড", icon: <Lock size={14} /> },
              {
                v: "danger",
                label: "Danger Zone",
                icon: <AlertCircle size={14} />,
              },
            ] as const
          ).map((t) => (
            <button
              key={t.v}
              onClick={() => setTab(t.v)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 18px",
                borderRadius: "10px",
                border: "none",
                background: tab === t.v ? "var(--primary)" : "transparent",
                color: tab === t.v ? "#fff" : "var(--text)",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div
          style={{
            background: "var(--card)",
            border: "1.5px solid var(--border)",
            borderRadius: "16px",
            padding: "28px",
          }}
        >
          {tab === "info" && (
            <form onSubmit={handleSaveInfo}>
              {infoError && <ErrorBox message={infoError} />}

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                }}
              >
                <div>
                  <FieldLabel>পূর্ণ নাম</FieldLabel>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={savingInfo}
                    placeholder="আপনার নাম"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <FieldLabel>ইমেইল</FieldLabel>
                  <input
                    type="email"
                    value={displayEmail}
                    disabled
                    style={{
                      ...inputStyle,
                      opacity: 0.7,
                      cursor: "not-allowed",
                    }}
                  />
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--muted)",
                      marginTop: "6px",
                    }}
                  >
                    ইমেইল পরিবর্তন করা যাবে না
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(108,99,255,0.06)",
                    border: "1px solid rgba(108,99,255,0.2)",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <Wallet size={16} color="var(--primary)" />
                  <div style={{ fontSize: "13px", color: "var(--text)" }}>
                    বর্তমান ব্যালেন্স:{" "}
                    <strong>৳ {displayBalance.toLocaleString()}</strong>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingInfo}
                  style={{
                    alignSelf: "flex-start",
                    padding: "12px 24px",
                    background: savingInfo
                      ? "#94a3b8"
                      : "linear-gradient(135deg, #6C63FF, #5A52D5)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: savingInfo ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: savingInfo
                      ? "none"
                      : "0 6px 20px rgba(108,99,255,0.3)",
                  }}
                >
                  {savingInfo ? (
                    <>
                      <Loader2
                        size={16}
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                      সেভ হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Save size={16} /> সেভ করুন
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {tab === "password" && (
            <form onSubmit={handleSavePassword}>
              {passwordError && <ErrorBox message={passwordError} />}

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                  maxWidth: "500px",
                }}
              >
                <div>
                  <FieldLabel>বর্তমান পাসওয়ার্ড</FieldLabel>
                  <PasswordInput
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    show={showCurrent}
                    setShow={setShowCurrent}
                    disabled={savingPassword}
                    placeholder="বর্তমান পাসওয়ার্ড"
                  />
                </div>

                <div>
                  <FieldLabel>নতুন পাসওয়ার্ড</FieldLabel>
                  <PasswordInput
                    value={newPassword}
                    onChange={setNewPassword}
                    show={showNew}
                    setShow={setShowNew}
                    disabled={savingPassword}
                    placeholder="কমপক্ষে ৬ অক্ষর"
                  />
                </div>

                <div>
                  <FieldLabel>নতুন পাসওয়ার্ড নিশ্চিত</FieldLabel>
                  <PasswordInput
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    show={showConfirm}
                    setShow={setShowConfirm}
                    disabled={savingPassword}
                    placeholder="আবার লিখুন"
                  />
                  {confirmPassword && newPassword === confirmPassword && (
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#10b981",
                        marginTop: "6px",
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
                  disabled={savingPassword}
                  style={{
                    alignSelf: "flex-start",
                    padding: "12px 24px",
                    background: savingPassword
                      ? "#94a3b8"
                      : "linear-gradient(135deg, #6C63FF, #5A52D5)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: savingPassword ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: savingPassword
                      ? "none"
                      : "0 6px 20px rgba(108,99,255,0.3)",
                  }}
                >
                  {savingPassword ? (
                    <>
                      <Loader2
                        size={16}
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                      আপডেট হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Lock size={16} /> পাসওয়ার্ড আপডেট
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {tab === "danger" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  background: "rgba(239,68,68,0.05)",
                  border: "1.5px solid rgba(239,68,68,0.3)",
                  borderRadius: "12px",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "10px",
                      background: "rgba(239,68,68,0.15)",
                      color: "#ef4444",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <LogOut size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontSize: "15px",
                        fontWeight: 800,
                        color: "var(--text)",
                        marginBottom: "4px",
                      }}
                    >
                      লগআউট করুন
                    </h3>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "var(--muted)",
                        marginBottom: "12px",
                        lineHeight: 1.5,
                      }}
                    >
                      সব ডিভাইস থেকে লগআউট হয়ে যাবে। আবার লগইন করতে পারবেন।
                    </p>
                    <button
                      onClick={handleLogout}
                      style={{
                        padding: "10px 20px",
                        background: "#ef4444",
                        color: "#fff",
                        border: "none",
                        borderRadius: "10px",
                        fontWeight: 700,
                        fontSize: "13px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <LogOut size={14} /> লগআউট
                    </button>
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "var(--bg)",
                  border: "1.5px solid var(--border)",
                  borderRadius: "12px",
                  padding: "16px",
                  display: "flex",
                  gap: "10px",
                  fontSize: "12px",
                  color: "var(--muted)",
                  lineHeight: 1.6,
                }}
              >
                <Info
                  size={16}
                  style={{
                    flexShrink: 0,
                    marginTop: "2px",
                    color: "var(--primary)",
                  }}
                />
                <div>
                  <strong style={{ color: "var(--text)" }}>Account ID:</strong>{" "}
                  {user.id.slice(0, 16)}...
                  <br />
                  <strong style={{ color: "var(--text)" }}>Role:</strong>{" "}
                  {displayRole}
                  <br />
                  <strong style={{ color: "var(--text)" }}>
                    Member since:
                  </strong>{" "}
                  {memberSince}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input::placeholder { color: #98a2b3; }
        input:focus {
          border-color: #6C63FF !important;
          box-shadow: 0 0 0 3px rgba(108,99,255,0.15) !important;
        }
        @media (max-width: 640px) {
          .profile-header { flex-direction: column; text-align: center; }
          .profile-stats { justify-content: center; }
        }
      `}</style>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "1.5px solid var(--border)",
  borderRadius: "10px",
  background: "var(--bg)",
  color: "var(--text)",
  fontSize: "14px",
  outline: "none",
  fontFamily: "inherit",
  transition: "all 0.2s",
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        display: "block",
        fontSize: "12px",
        fontWeight: 700,
        color: "var(--text)",
        marginBottom: "6px",
        textTransform: "uppercase",
        letterSpacing: "0.3px",
      }}
    >
      {children}
    </label>
  );
}

function PasswordInput({
  value,
  onChange,
  show,
  setShow,
  disabled,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  setShow: (v: boolean) => void;
  disabled: boolean;
  placeholder: string;
}) {
  return (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        style={{ ...inputStyle, paddingRight: "42px" }}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        style={{
          position: "absolute",
          right: "10px",
          top: "50%",
          transform: "translateY(-50%)",
          background: "transparent",
          border: "none",
          color: "var(--muted)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          padding: "4px",
        }}
        tabIndex={-1}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function MiniStat({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div
      style={{
        background: `${color}10`,
        border: `1.5px solid ${color}30`,
        borderRadius: "10px",
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        minWidth: 100,
      }}
    >
      <div style={{ color }}>{icon}</div>
      <div>
        <div
          style={{ fontSize: "16px", fontWeight: 800, color: "var(--text)" }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: "10px",
            color: "var(--muted)",
            fontWeight: 600,
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

function RoleBadge({
  icon,
  label,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        background: `${color}15`,
        border: `1.5px solid ${color}40`,
        color: color,
        padding: "3px 10px",
        borderRadius: "99px",
        fontSize: "11px",
        fontWeight: 700,
      }}
    >
      {icon}
      {label}
    </span>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div
      style={{
        background: "rgba(239,68,68,0.08)",
        border: "1.5px solid rgba(239,68,68,0.3)",
        borderRadius: "10px",
        padding: "10px 14px",
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
      {message}
    </div>
  );
}
