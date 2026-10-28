"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Play,
  ThumbsUp,
  Music2,
  Loader2,
  CheckCircle,
  Upload,
  X,
  AlertCircle,
  Shield,
  Sparkles,
  DollarSign,
  Check,
  Link as LinkIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth";
import { showToast } from "@/components/Toast";

type Platform = "youtube" | "facebook" | "tiktok";
type HandoverMethod = "Backup code" | "Live relay" | "2FA off";

const PLATFORMS = [
  {
    value: "youtube" as Platform,
    label: "YouTube",
    icon: Play,
    color: "#FF0000",
    gradient: "linear-gradient(135deg, #ff4b4b, #cc0000)",
  },
  {
    value: "facebook" as Platform,
    label: "Facebook",
    icon: ThumbsUp,
    color: "#1877F2",
    gradient: "linear-gradient(135deg, #4a9eff, #1877F2)",
  },
  {
    value: "tiktok" as Platform,
    label: "TikTok",
    icon: Music2,
    color: "#000000",
    gradient: "linear-gradient(135deg, #444, #000)",
  },
];

const HANDOVER_METHODS: {
  value: HandoverMethod;
  label: string;
  desc: string;
}[] = [
  {
    value: "Backup code",
    label: "Backup Code",
    desc: "Seller backup code দিয়ে handover করবে",
  },
  {
    value: "Live relay",
    label: "Live Relay",
    desc: "Live chat-এ ধাপে ধাপে handover",
  },
  {
    value: "2FA off",
    label: "2FA Off",
    desc: "2FA বন্ধ করে তারপর handover",
  },
];

interface FormData {
  platform: Platform | "";
  account_link: string;
  title: string;
  price: string;
  followers: string;
  country: string;
  description: string;
  is_monetized: boolean;
  handover_method: HandoverMethod | "";
  images: File[];
}

export default function CreateListingContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [form, setForm] = useState<FormData>({
    platform: "",
    account_link: "",
    title: "",
    price: "",
    followers: "",
    country: "Bangladesh",
    description: "",
    is_monetized: false,
    handover_method: "",
    images: [],
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/create-listing");
    }
  }, [user, authLoading]);

  useEffect(() => {
    const urls = form.images.map((file) => URL.createObjectURL(file));
    setImagePreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [form.images]);

  const updateField = <K extends keyof FormData>(
    key: K,
    value: FormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );
    const total = form.images.length + newFiles.length;

    if (total > 5) {
      setError("সর্বোচ্চ ৫টি ছবি আপলোড করা যাবে");
      return;
    }

    for (const file of newFiles) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} ফাইলটি ৫MB এর বেশি`);
        return;
      }
    }

    updateField("images", [...form.images, ...newFiles]);
  };

  const removeImage = (index: number) => {
    updateField(
      "images",
      form.images.filter((_, i) => i !== index)
    );
  };

  const validate = (): string | null => {
    if (!form.platform) return "প্ল্যাটফর্ম নির্বাচন করুন";
    if (!form.account_link.trim()) return "অ্যাকাউন্ট লিংক দিন";
    if (!form.title.trim()) return "শিরোনাম দিন";
    if (Number(form.price) <= 0) return "সঠিক দাম দিন";
    if (Number(form.followers) < 0) return "সঠিক ফলোয়ার সংখ্যা দিন";
    if (!form.handover_method) return "হ্যান্ডওভার পদ্ধতি নির্বাচন করুন";
    if (form.images.length === 0) return "কমপক্ষে ১টি ছবি আপলোড করুন";
    if (form.description.trim().length < 20)
      return "বিবরণ কমপক্ষে ২০ অক্ষরের হতে হবে";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Upload images
      const uploadedUrls: string[] = [];
      for (const file of form.images) {
        const ext = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("listing-images")
          .upload(fileName, file, { cacheControl: "3600", upsert: false });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("listing-images")
          .getPublicUrl(fileName);

        uploadedUrls.push(urlData.publicUrl);
      }

      // Insert listing — capture data
      const { data, error: insertError } = await supabase
        .from("listings")
        .insert({
          seller_id: user.id,
          title: form.title.trim(),
          platform: form.platform,
          account_link: form.account_link.trim(),
          price: Number(form.price),
          followers: Number(form.followers),
          country: form.country,
          description: form.description.trim(),
          is_monetized: form.is_monetized,
          handover_method: form.handover_method,
          images: uploadedUrls,
          status: "pending",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      showToast(
        "success",
        "লিস্টিং তৈরি হয়েছে!",
        "Admin approve করলে সক্রিয় হবে"
      );

      // Redirect to success page
      const successUrl = `/create-listing/success?id=${data?.id || ""}&title=${encodeURIComponent(form.title.trim())}`;
      setTimeout(() => router.push(successUrl), 600);
    } catch (err: any) {
      console.error("SUBMIT ERROR:", {
        message: err?.message,
        code: err?.code,
        details: err?.details,
        hint: err?.hint,
      });
      setError(err?.message || "সমস্যা হয়েছে, আবার চেষ্টা করুন");
      setSubmitting(false);
    }
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

  const selectedPlatform = PLATFORMS.find((p) => p.value === form.platform);
  const accentColor = selectedPlatform?.color || "#6C63FF";
  const accentGradient =
    selectedPlatform?.gradient || "linear-gradient(135deg, #6C63FF, #5A52D5)";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        padding: "32px 20px 60px",
      }}
    >
      <div style={{ maxWidth: "880px", margin: "0 auto" }}>
        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(108,99,255,0.1)",
              color: "var(--primary)",
              padding: "6px 14px",
              borderRadius: "99px",
              fontSize: "12px",
              fontWeight: 700,
              marginBottom: "14px",
            }}
          >
            <Sparkles size={12} />
            নতুন Listing তৈরি করুন
          </div>
          <h1
            style={{
              fontSize: "clamp(22px, 4vw, 28px)",
              fontWeight: 800,
              color: "var(--text)",
              marginBottom: "6px",
              letterSpacing: "-0.5px",
            }}
          >
            আপনার অ্যাকাউন্ট বিক্রি করুন
          </h1>
          <p style={{ fontSize: "13px", color: "var(--muted)" }}>
            নিচের তথ্য পূরণ করুন এবং Submit করুন
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1.5px solid rgba(239,68,68,0.3)",
              borderRadius: "12px",
              padding: "12px 16px",
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

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* BOX 1: PLATFORM */}
            <SectionBox number={1} title="প্ল্যাটফর্ম ও লিংক">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "10px",
                  marginBottom: "16px",
                }}
              >
                {PLATFORMS.map((p) => {
                  const Icon = p.icon;
                  const active = form.platform === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => updateField("platform", p.value)}
                      style={{
                        padding: "18px 12px",
                        borderRadius: "12px",
                        border: active
                          ? `2px solid ${p.color}`
                          : "2px solid var(--border)",
                        background: active ? `${p.color}10` : "var(--bg)",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "8px",
                        transition: "all 0.2s",
                        transform: active ? "scale(1.02)" : "scale(1)",
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "12px",
                          background: p.gradient,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          boxShadow: active ? `0 8px 20px ${p.color}50` : "none",
                        }}
                      >
                        <Icon size={22} />
                      </div>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: active ? p.color : "var(--text)",
                        }}
                      >
                        {p.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <Field
                label="অ্যাকাউন্ট লিংক"
                required
                hint="সবাই এই লিংক দেখতে পাবে"
              >
                <div style={{ position: "relative" }}>
                  <LinkIcon
                    size={16}
                    color="var(--muted)"
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    type="url"
                    value={form.account_link}
                    onChange={(e) => updateField("account_link", e.target.value)}
                    placeholder="https://youtube.com/@yourchannel"
                    style={{ ...inputStyle, paddingLeft: "38px" }}
                  />
                </div>
              </Field>
            </SectionBox>

            {/* BOX 2: DETAILS */}
            <SectionBox number={2} title="বিবরণ">
              <Field label="শিরোনাম" required>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="যেমন: Monetized YouTube Channel 50K Subs"
                  style={inputStyle}
                  maxLength={120}
                />
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--muted)",
                    textAlign: "right",
                    marginTop: "4px",
                  }}
                >
                  {form.title.length}/120
                </div>
              </Field>

              <div
                className="form-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <Field label="দাম (৳)" required>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => updateField("price", e.target.value)}
                    placeholder="5000"
                    style={inputStyle}
                    min={1}
                  />
                </Field>
                <Field label="ফলোয়ার" required>
                  <input
                    type="number"
                    value={form.followers}
                    onChange={(e) => updateField("followers", e.target.value)}
                    placeholder="50000"
                    style={inputStyle}
                    min={0}
                  />
                </Field>
              </div>

              <Field label="দেশ">
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => updateField("country", e.target.value)}
                  placeholder="Bangladesh"
                  style={inputStyle}
                />
              </Field>

              <div
                style={{
                  marginTop: "4px",
                  padding: "14px 16px",
                  background: form.is_monetized
                    ? "rgba(16,185,129,0.08)"
                    : "var(--bg)",
                  border: form.is_monetized
                    ? "1.5px solid rgba(16,185,129,0.4)"
                    : "1.5px solid var(--border)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onClick={() =>
                  updateField("is_monetized", !form.is_monetized)
                }
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "8px",
                      background: form.is_monetized
                        ? "#10b981"
                        : "var(--border)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {form.is_monetized ? (
                      <Check size={18} />
                    ) : (
                      <DollarSign size={16} />
                    )}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "var(--text)",
                      }}
                    >
                      Monetized
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                      অ্যাকাউন্ট কি monetized?
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 12,
                    background: form.is_monetized
                      ? "#10b981"
                      : "var(--border)",
                    position: "relative",
                    transition: "background 0.2s",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: "#fff",
                      top: 3,
                      left: form.is_monetized ? 23 : 3,
                      transition: "left 0.2s",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    }}
                  />
                </div>
              </div>
            </SectionBox>

            {/* BOX 3: HANDOVER */}
            <SectionBox number={3} title="হ্যান্ডওভার পদ্ধতি">
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--muted)",
                  marginBottom: "14px",
                  marginTop: "-8px",
                }}
              >
                আপনি কীভাবে buyer-কে অ্যাকাউন্ট হস্তান্তর করবেন?
              </p>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {HANDOVER_METHODS.map((m) => {
                  const active = form.handover_method === m.value;
                  return (
                    <div
                      key={m.value}
                      onClick={() =>
                        updateField("handover_method", m.value)
                      }
                      style={{
                        padding: "14px",
                        borderRadius: "10px",
                        border: active
                          ? `2px solid ${accentColor}`
                          : "1.5px solid var(--border)",
                        background: active
                          ? `${accentColor}08`
                          : "var(--bg)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        transition: "all 0.2s",
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          border: active
                            ? `6px solid ${accentColor}`
                            : "2px solid var(--border)",
                          background: "#fff",
                          flexShrink: 0,
                          transition: "all 0.2s",
                        }}
                      />
                      <div>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "var(--text)",
                          }}
                        >
                          {m.label}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--muted)",
                            marginTop: "2px",
                          }}
                        >
                          {m.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  marginTop: "14px",
                  background: "rgba(108,99,255,0.06)",
                  border: "1px solid rgba(108,99,255,0.2)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  display: "flex",
                  gap: "10px",
                  fontSize: "12px",
                  color: "var(--muted)",
                  lineHeight: 1.5,
                }}
              >
                <Shield
                  size={16}
                  color="#6C63FF"
                  style={{ flexShrink: 0, marginTop: "1px" }}
                />
                <div>
                  <strong style={{ color: "var(--text)" }}>
                    Escrow-protected:
                  </strong>{" "}
                  Buyer টাকা দিলে সেটা escrow-তে থাকবে। আপনি handover complete
                  করলে এবং buyer confirm করলে টাকা আপনার wallet-এ যাবে।
                </div>
              </div>
            </SectionBox>

            {/* BOX 4: IMAGES + DESCRIPTION */}
            <SectionBox number={4} title="ছবি ও বিবরণ">
              <Field label="ছবি (১-৫টি)" required>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageUpload(e.target.files)}
                  style={{ display: "none" }}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: "2px dashed var(--border)",
                    borderRadius: "12px",
                    padding: "28px 20px",
                    textAlign: "center",
                    cursor: "pointer",
                    background: "var(--bg)",
                    transition: "all 0.2s",
                  }}
                >
                  <Upload
                    size={28}
                    color="var(--primary)"
                    style={{ margin: "0 auto 8px", display: "block" }}
                  />
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "var(--text)",
                    }}
                  >
                    ক্লিক করুন বা ছবি টেনে আনুন
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--muted)",
                      marginTop: "4px",
                    }}
                  >
                    সর্বোচ্চ ৫টি · প্রতিটি ৫MB · JPG, PNG
                  </div>
                </div>
              </Field>

              {imagePreviews.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(100px, 1fr))",
                    gap: "10px",
                    marginBottom: "16px",
                  }}
                >
                  {imagePreviews.map((url, i) => (
                    <div
                      key={i}
                      style={{
                        position: "relative",
                        aspectRatio: "1",
                        borderRadius: "10px",
                        overflow: "hidden",
                        border: "1.5px solid var(--border)",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: "rgba(0,0,0,0.7)",
                          border: "none",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <Field label="বিবরণ" required>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="অ্যাকাউন্ট সম্পর্কে বিস্তারিত লিখুন — কনটেন্ট, engagement, growth history, monetization status ইত্যাদি..."
                  rows={5}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    minHeight: "110px",
                    fontFamily: "inherit",
                  }}
                />
                <div
                  style={{
                    fontSize: "11px",
                    color:
                      form.description.length < 20
                        ? "#ef4444"
                        : "var(--muted)",
                    textAlign: "right",
                    marginTop: "4px",
                  }}
                >
                  {form.description.length} / সর্বনিম্ন ২০ অক্ষর
                </div>
              </Field>
            </SectionBox>
          </div>

          {/* SUBMIT */}
          <div style={{ marginTop: "20px" }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                padding: "16px",
                background: submitting ? "#94a3b8" : accentGradient,
                color: "#fff",
                border: "none",
                borderRadius: "14px",
                fontWeight: 800,
                fontSize: "16px",
                cursor: submitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                boxShadow: submitting
                  ? "none"
                  : `0 10px 25px ${accentColor}40`,
                letterSpacing: "0.3px",
              }}
            >
              {submitting ? (
                <>
                  <Loader2
                    size={18}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  তৈরি হচ্ছে...
                </>
              ) : (
                <>
                  <CheckCircle size={18} /> Listing Submit করুন
                </>
              )}
            </button>
          </div>
        </form>

        {/* INFO */}
        <div
          style={{
            marginTop: "16px",
            padding: "12px 16px",
            background: "var(--card)",
            border: "1.5px solid var(--border)",
            borderRadius: "12px",
            display: "flex",
            gap: "10px",
            fontSize: "12px",
            color: "var(--muted)",
            lineHeight: 1.6,
          }}
        >
          <AlertCircle
            size={16}
            color="var(--primary)"
            style={{ flexShrink: 0, marginTop: "2px" }}
          />
          <div>
            Submit করার পর listing{" "}
            <strong style={{ color: "var(--text)" }}>pending</strong>{" "}
            status-এ যাবে। Admin approve করলে{" "}
            <strong style={{ color: "var(--text)" }}>browse page</strong>-এ
            দেখা যাবে।
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input::placeholder, textarea::placeholder { color: #98a2b3; }
        input:focus, textarea:focus {
          border-color: ${accentColor} !important;
          box-shadow: 0 0 0 3px ${accentColor}20 !important;
        }
        @media (max-width: 500px) {
          .form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}

/* ============ HELPERS ============ */

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

function SectionBox({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: "var(--card)",
        border: "1.5px solid var(--border)",
        borderRadius: "18px",
        padding: "24px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "18px",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "10px",
            background: "linear-gradient(135deg, #6C63FF, #EC4899)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: "14px",
            boxShadow: "0 4px 12px rgba(108,99,255,0.3)",
          }}
        >
          {number}
        </div>
        <h2
          style={{
            fontSize: "17px",
            fontWeight: 800,
            color: "var(--text)",
            margin: 0,
          }}
        >
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "6px",
        }}
      >
        <label
          style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}
        >
          {label}
          {required && (
            <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>
          )}
        </label>
        {hint && (
          <span style={{ fontSize: "11px", color: "var(--muted)" }}>
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
