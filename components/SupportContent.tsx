"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Send,
  Clock,
  HelpCircle,
  CheckCircle,
  Loader2,
  ArrowRight,
  Shield,
} from "lucide-react";
import { showToast } from "@/components/Toast";

const CONTACT_METHODS = [
  {
    icon: Mail,
    title: "ইমেইল",
    value: "support@socialmarket.com",
    desc: "সাধারণত ২৪ ঘণ্টায় উত্তর",
    color: "#6C63FF",
    href: "mailto:support@socialmarket.com",
  },
  {
    icon: Phone,
    title: "ফোন",
    value: "+880 1572-972953",
    desc: "শনি-বৃহস্পতি, সকাল ৯টা - রাত ৯টা",
    color: "#10b981",
    href: "tel:+8801572972953",
  },
  {
    icon: MessageCircle,
    title: "লাইভ চ্যাট",
    value: "২৪/৭ উপলব্ধ",
    desc: "দ্রুততম উত্তর পেতে",
    color: "#ec4899",
    href: "#chat",
  },
];

const SUBJECTS = [
  "সাধারণ জিজ্ঞাসা",
  "অর্ডার সমস্যা",
  "পেমেন্ট সমস্যা",
  "Wallet / Withdraw",
  "Account সম্পর্কিত",
  "Dispute / অভিযোগ",
  "অন্যান্য",
];

const FAQ_LINKS = [
  "Escrow সিস্টেম কীভাবে কাজ করে?",
  "কীভাবে coin কিনবো?",
  "Withdraw করতে কত সময় লাগে?",
  "Dispute হলে কী হবে?",
];

export default function SupportContent() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: SUBJECTS[0],
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      showToast("error", "ত্রুটি", "সব ঘর পূরণ করুন");
      return;
    }

    setSending(true);

    // Simulate sending (in real app: save to DB or send email)
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setSending(false);
    setSent(true);
    showToast("success", "বার্তা পাঠানো হয়েছে", "আমরা শীঘ্রই যোগাযোগ করবো");
  };

  const resetForm = () => {
    setForm({ name: "", email: "", subject: SUBJECTS[0], message: "" });
    setSent(false);
  };

  return (
    <main style={{ paddingBottom: "60px" }}>
      {/* ===== HERO ===== */}
      <section
        style={{
          background: "linear-gradient(135deg, #6C63FF 0%, #5A52D5 100%)",
          padding: "70px 20px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            top: -100,
            right: -60,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            bottom: -60,
            left: -40,
          }}
        />

        <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              padding: "8px 16px",
              borderRadius: "99px",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 600,
              marginBottom: "20px",
            }}
          >
            <Shield size={14} />
            ২৪/৭ সাপোর্ট
          </div>

          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 44px)",
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1.2,
              marginBottom: "16px",
              letterSpacing: "-1px",
            }}
          >
            কীভাবে সাহায্য করতে পারি?
          </h1>
          <p
            style={{
              fontSize: "15px",
              color: "rgba(255,255,255,0.9)",
              maxWidth: "550px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            আমাদের টিম সবসময় আপনার পাশে আছে। যেকোনো সমস্যা বা প্রশ্নে যোগাযোগ করুন।
          </p>
        </div>
      </section>

      {/* ===== CONTENT WRAPPER ===== */}
      <div
        className="support-wrapper"
        style={{
          maxWidth: "1100px",
          margin: "-40px auto 0",
          padding: "0 20px",
          position: "relative",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          gap: "28px",
        }}
      >
        {/* ===== CONTACT METHODS ===== */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}
          className="contact-grid"
        >
          {CONTACT_METHODS.map((method, i) => {
            const Icon = method.icon;
            return (
              <a
                key={i}
                href={method.href}
                style={{
                  background: "var(--card)",
                  border: "1.5px solid var(--border)",
                  borderRadius: "16px",
                  padding: "24px",
                  textDecoration: "none",
                  transition: "all 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
                className="contact-card"
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "12px",
                    background: `${method.color}15`,
                    color: method.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={22} />
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 600, marginBottom: "2px" }}>
                    {method.title}
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>
                    {method.value}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--muted)" }}>{method.desc}</div>
                </div>
              </a>
            );
          })}
        </section>

        {/* ===== TWO COLUMN: FORM + SIDEBAR ===== */}
        <div
          className="form-sidebar-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr",
            gap: "24px",
          }}
        >
          {/* ===== CONTACT FORM ===== */}
          <section
            style={{
              background: "var(--card)",
              border: "1.5px solid var(--border)",
              borderRadius: "16px",
              padding: "32px",
            }}
          >
            {sent ? (
              <div style={{ textAlign: "center", padding: "30px 0" }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "rgba(16,185,129,0.1)",
                    color: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                  }}
                >
                  <CheckCircle size={36} />
                </div>
                <h2
                  style={{
                    fontSize: "22px",
                    fontWeight: 800,
                    color: "var(--text)",
                    marginBottom: "10px",
                  }}
                >
                  বার্তা পাঠানো হয়েছে!
                </h2>
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--muted)",
                    marginBottom: "24px",
                    lineHeight: 1.6,
                  }}
                >
                  আমরা ২৪ ঘণ্টার মধ্যে আপনার ইমেইলে উত্তর দেবো। ধৈর্য ধরার জন্য ধন্যবাদ।
                </p>
                <button
                  onClick={resetForm}
                  style={{
                    padding: "12px 24px",
                    background: "var(--primary)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  আরেকটা বার্তা পাঠান
                </button>
              </div>
            ) : (
              <>
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: 800,
                    color: "var(--text)",
                    marginBottom: "6px",
                  }}
                >
                  বার্তা পাঠান
                </h2>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--muted)",
                    marginBottom: "24px",
                  }}
                >
                  নিচের form পূরণ করুন, আমরা দ্রুত যোগাযোগ করবো
                </p>

                <form
                  onSubmit={handleSubmit}
                  style={{ display: "flex", flexDirection: "column", gap: "16px" }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }} className="form-row">
                    <Field label="আপনার নাম">
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="আপনার পূর্ণ নাম"
                        style={inputStyle}
                      />
                    </Field>
                    <Field label="ইমেইল">
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="you@example.com"
                        style={inputStyle}
                      />
                    </Field>
                  </div>

                  <Field label="বিষয়">
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      style={{ ...inputStyle, cursor: "pointer" }}
                    >
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="বার্তা">
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="আপনার সমস্যা বা প্রশ্ন বিস্তারিত লিখুন..."
                      rows={6}
                      style={{ ...inputStyle, resize: "vertical", minHeight: "120px", fontFamily: "inherit" }}
                    />
                  </Field>

                  <button
                    type="submit"
                    disabled={sending}
                    style={{
                      padding: "14px",
                      background: sending
                        ? "var(--muted)"
                        : "linear-gradient(135deg, #6C63FF, #5A52D5)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: 700,
                      fontSize: "14px",
                      cursor: sending ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      boxShadow: "0 6px 20px rgba(108,99,255,0.25)",
                    }}
                  >
                    {sending ? (
                      <>
                        <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                        পাঠানো হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        বার্তা পাঠান
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </section>

          {/* ===== SIDEBAR ===== */}
          <aside style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Quick FAQ */}
            <div
              style={{
                background: "var(--card)",
                border: "1.5px solid var(--border)",
                borderRadius: "16px",
                padding: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    background: "rgba(108,99,255,0.1)",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <HelpCircle size={18} />
                </div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)" }}>
                  দ্রুত উত্তর
                </h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                {FAQ_LINKS.map((q, i) => (
                  <Link
                    key={i}
                    href="/faq"
                    style={{
                      fontSize: "13px",
                      color: "var(--text)",
                      padding: "10px 12px",
                      background: "var(--bg)",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <span>{q}</span>
                    <ArrowRight size={14} color="var(--muted)" style={{ flexShrink: 0 }} />
                  </Link>
                ))}
              </div>
              <Link
                href="/faq"
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "var(--primary)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                সব FAQ দেখুন <ArrowRight size={14} />
              </Link>
            </div>

            {/* Response Time */}
            <div
              style={{
                background: "var(--card)",
                border: "1.5px solid var(--border)",
                borderRadius: "16px",
                padding: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "14px",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    background: "rgba(16,185,129,0.1)",
                    color: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Clock size={18} />
                </div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)" }}>
                  রেসপন্স টাইম
                </h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <ResponseRow label="ইমেইল" value="২৪ ঘণ্টা" />
                <ResponseRow label="Live Chat" value="তাৎক্ষণিক" />
                <ResponseRow label="ফোন" value="সরাসরি" />
                <ResponseRow label="Dispute" value="৬ ঘণ্টা" />
              </div>
            </div>

            {/* Address */}
            <div
              style={{
                background: "var(--card)",
                border: "1.5px solid var(--border)",
                borderRadius: "16px",
                padding: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    background: "rgba(236,72,153,0.1)",
                    color: "#ec4899",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <MapPin size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>
                    অফিস
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.5 }}>
                    House 12, Road 5, Dhanmondi
                    <br />
                    Dhaka 1205, Bangladesh
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .contact-card:hover {
          transform: translateY(-3px);
          border-color: var(--primary) !important;
          box-shadow: 0 10px 25px rgba(108,99,255,0.12);
        }
        @media (max-width: 900px) {
          .form-sidebar-grid { grid-template-columns: 1fr !important; }
          .contact-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .support-wrapper { padding: 0 16px !important; }
          .form-row { grid-template-columns: 1fr !important; }
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
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "13px",
          fontWeight: 600,
          color: "var(--text)",
          marginBottom: "6px",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function ResponseRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
      <span style={{ color: "var(--muted)" }}>{label}</span>
      <span style={{ color: "var(--text)", fontWeight: 600 }}>{value}</span>
    </div>
  );
}
