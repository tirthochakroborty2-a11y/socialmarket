"use client";

import Link from "next/link";
import {
  Shield,
  Target,
  Users,
  TrendingUp,
  CheckCircle,
  Heart,
  Zap,
  Globe,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function AboutContent() {
  return (
    <main style={{ paddingBottom: "60px" }}>
      {/* ===== HERO ===== */}
      <section
        style={{
          background: "linear-gradient(135deg, #6C63FF 0%, #5A52D5 100%)",
          padding: "80px 20px",
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
            top: -80,
            right: -60,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 220,
            height: 220,
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
            <Sparkles size={14} />
            আমাদের সম্পর্কে
          </div>

          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1.2,
              marginBottom: "16px",
              letterSpacing: "-1px",
            }}
          >
            বাংলাদেশের সবচেয়ে বিশ্বস্ত <br />
            সোশ্যাল অ্যাকাউন্ট মার্কেটপ্লেস
          </h1>

          <p
            style={{
              fontSize: "16px",
              color: "rgba(255,255,255,0.9)",
              lineHeight: 1.6,
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            ২০২৪ সাল থেকে আমরা হাজারো বাংলাদেশি ক্রেতা-বিক্রেতাকে নিরাপদে সোশ্যাল মিডিয়া অ্যাকাউন্ট কেনাবেচায় সাহায্য করছি।
          </p>
        </div>
      </section>

      {/* ===== CONTENT WRAPPER ===== */}
      <div
        className="about-wrapper"
        style={{
          maxWidth: "1100px",
          margin: "-40px auto 0",
          padding: "0 20px",
          position: "relative",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          gap: "32px",
        }}
      >
        {/* ===== MISSION SECTION ===== */}
        <section
          style={{
            background: "var(--card)",
            border: "1.5px solid var(--border)",
            borderRadius: "20px",
            padding: "40px 32px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
          }}
        >
          <div
            className="mission-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "32px",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "14px",
                  background: "rgba(108,99,255,0.12)",
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <Target size={28} />
              </div>
              <h2
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  color: "var(--text)",
                  marginBottom: "14px",
                }}
              >
                আমাদের মিশন
              </h2>
              <p
                style={{
                  fontSize: "15px",
                  color: "var(--muted)",
                  lineHeight: 1.7,
                  marginBottom: "16px",
                }}
              >
                বাংলাদেশে হাজারো তরুণ ও উদ্যোক্তা আছেন যারা সোশ্যাল মিডিয়া অ্যাকাউন্ট কিনে বা বিক্রি করে তাদের স্বপ্ন পূরণ করতে চান। কিন্তু প্রতারণা, ভুয়া লেনদেন আর অনিরাপত্তার ভয়ে অনেকেই পিছিয়ে পড়েন।
              </p>
              <p
                style={{
                  fontSize: "15px",
                  color: "var(--muted)",
                  lineHeight: 1.7,
                }}
              >
                SocialMarket সেই সমস্যার সমাধান। Escrow সিস্টেম আর ২৪/৭ admin monitor-এর মাধ্যমে আমরা নিশ্চিত করি প্রতিটি লেনদেন ১০০% নিরাপদ।
              </p>
            </div>

            <div
              style={{
                background: "linear-gradient(135deg, rgba(108,99,255,0.1), rgba(108,99,255,0.05))",
                border: "1.5px solid rgba(108,99,255,0.2)",
                borderRadius: "16px",
                padding: "28px",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "var(--text)",
                  marginBottom: "20px",
                }}
              >
                আমাদের প্রতিশ্রুতি
              </h3>
              <CommitmentList
                items={[
                  "প্রতিটি লেনদেন escrow-তে সুরক্ষিত",
                  "৭২ ঘণ্টা পর্যন্ত dispute window",
                  "Admin-সহ গ্রুপ chat-এ সব লেনদেন",
                  "ভেরিফাইড seller সিস্টেম",
                  "২৪/৭ বাংলা সাপোর্ট",
                ]}
              />
            </div>
          </div>
        </section>

        {/* ===== STATS ===== */}
        <section
          style={{
            background: "var(--card)",
            border: "1.5px solid var(--border)",
            borderRadius: "20px",
            padding: "40px 32px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
          }}
        >
          <div
            className="about-stats-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "20px",
            }}
          >
            <StatCard icon={<Users size={24} />} value="10,000+" label="বিশ্বস্ত ব্যবহারকারী" color="#6C63FF" />
            <StatCard icon={<CheckCircle size={24} />} value="25,000+" label="সফল লেনদেন" color="#10b981" />
            <StatCard icon={<TrendingUp size={24} />} value="99.9%" label="সফলতার হার" color="#f59e0b" />
            <StatCard icon={<Globe size={24} />} value="64" label="জেলা থেকে ব্যবহারকারী" color="#ec4899" />
          </div>
        </section>

        {/* ===== STORY ===== */}
        <section
          style={{
            background: "var(--card)",
            border: "1.5px solid var(--border)",
            borderRadius: "20px",
            padding: "40px 32px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ maxWidth: "750px", margin: "0 auto" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "14px",
                background: "rgba(236,72,153,0.12)",
                color: "#ec4899",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <Heart size={28} />
            </div>
            <h2
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "var(--text)",
                marginBottom: "20px",
              }}
            >
              আমাদের গল্প
            </h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                fontSize: "15px",
                color: "var(--muted)",
                lineHeight: 1.8,
              }}
            >
              <p>
                SocialMarket-এর যাত্রা শুরু হয়েছিল একটা সহজ প্রশ্ন থেকে — "কেন সোশ্যাল অ্যাকাউন্ট কেনাবেচা করতে গিয়ে মানুষ প্রতারিত হয়?"
              </p>
              <p>
                ২০২৪ সালে কয়েকজন তরুণ টেক-উদ্যোক্তা মিলে সিদ্ধান্ত নিলেন এমন একটা প্ল্যাটফর্ম বানাবেন যেখানে escrow-ভিত্তিক নিরাপদ লেনদেন সম্ভব। শুরুটা ছিল ছোট — মাত্র ১০ জন ব্যবহারকারী নিয়ে।
              </p>
              <p>
                আজ ১০,০০০+ ব্যবহারকারী আমাদের উপর ভরসা রাখেন। ২৫,০০০+ সফল লেনদেন সম্পন্ন হয়েছে কোনো বড় dispute ছাড়াই। এটাই আমাদের সবচেয়ে বড় অর্জন।
              </p>
              <p>
                আমরা বিশ্বাস করি — সোশ্যাল মিডিয়া শুধু বিনোদন না, এটা একটা সম্পদ। এবং এই সম্পদের সঠিক মূল্য নির্ধারণ ও নিরাপদ হস্তান্তর সবার অধিকার।
              </p>
            </div>
          </div>
        </section>

        {/* ===== WHY CHOOSE US ===== */}
        <section
          style={{
            background: "var(--card)",
            border: "1.5px solid var(--border)",
            borderRadius: "20px",
            padding: "40px 32px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h2
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "var(--text)",
                marginBottom: "8px",
              }}
            >
              কেন আমাদের বেছে নেবেন?
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "15px" }}>
              যা আমাদের অন্যদের থেকে আলাদা করে
            </p>
          </div>

          <div
            className="features-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
            }}
          >
            <FeatureBox
              icon={<Shield size={24} />}
              title="Escrow সুরক্ষা"
              desc="টাকা ৭২ ঘণ্টা escrow-তে। Confirm না করলে seller পাবেন না।"
              color="#6C63FF"
            />
            <FeatureBox
              icon={<Users size={24} />}
              title="Admin Group Chat"
              desc="প্রতিটি deal-এ buyer, seller, admin — তিনজন একসাথে।"
              color="#10b981"
            />
            <FeatureBox
              icon={<Zap size={24} />}
              title="দ্রুত হস্তান্তর"
              desc="গড়ে ২ ঘণ্টায় সম্পন্ন। Live chat-এ যেকোনো সাহায্য।"
              color="#f59e0b"
            />
            <FeatureBox
              icon={<CheckCircle size={24} />}
              title="ভেরিফাইড Seller"
              desc="সব seller KYC ভেরিফাইড। প্রতারকদের কোনো জায়গা নেই।"
              color="#ec4899"
            />
            <FeatureBox
              icon={<TrendingUp size={24} />}
              title="সেরা বাজারদর"
              desc="প্রতিযোগিতামূলক দামে কেনাবেচা। স্বচ্ছ commission।"
              color="#8b5cf6"
            />
            <FeatureBox
              icon={<Globe size={24} />}
              title="সারাদেশে সেবা"
              desc="৬৪ জেলার হাজারো ক্রেতা-বিক্রেতা এক প্ল্যাটফর্মে।"
              color="#06b6d4"
            />
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section
          style={{
            background: "linear-gradient(135deg, #6C63FF 0%, #EC4899 100%)",
            borderRadius: "20px",
            padding: "50px 32px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.1)",
              top: -80,
              right: -40,
            }}
          />
          <div style={{ position: "relative", zIndex: 2 }}>
            <h2
              style={{
                fontSize: "clamp(24px, 4vw, 32px)",
                fontWeight: 800,
                color: "#fff",
                marginBottom: "12px",
              }}
            >
              আমাদের সাথে যুক্ত হোন
            </h2>
            <p
              style={{
                fontSize: "15px",
                color: "rgba(255,255,255,0.9)",
                marginBottom: "24px",
                maxWidth: "500px",
                margin: "0 auto 24px",
              }}
            >
              ১০,০০০+ ব্যবহারকারীর বিশ্বস্ত পরিবারে আপনিও স্বাগতম
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href="/browse"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#fff",
                  color: "#6C63FF",
                  padding: "13px 26px",
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "15px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                }}
              >
                ব্রাউজ করুন <ArrowRight size={16} />
              </Link>
              <Link
                href="/support"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(255,255,255,0.15)",
                  border: "1.5px solid rgba(255,255,255,0.4)",
                  color: "#fff",
                  padding: "13px 26px",
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "15px",
                }}
              >
                যোগাযোগ করুন
              </Link>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mission-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          .about-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .about-wrapper { padding: 0 16px !important; }
          .about-wrapper > section { padding: 28px 20px !important; }
        }
        @media (max-width: 480px) {
          .about-stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}

/* ===== HELPER COMPONENTS ===== */

function CommitmentList({ items }: { items: string[] }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "14px", color: "var(--text)" }}>
          <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0, marginTop: "2px" }} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "24px 16px",
        border: "1.5px solid var(--border)",
        borderRadius: "14px",
        background: "var(--bg)",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "12px",
          background: `${color}15`,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 12px",
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--text)", marginBottom: "4px" }}>
        {value}
      </div>
      <div style={{ fontSize: "13px", color: "var(--muted)", fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function FeatureBox({
  icon,
  title,
  desc,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <div
      style={{
        padding: "24px 20px",
        border: "1.5px solid var(--border)",
        borderRadius: "14px",
        background: "var(--bg)",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "10px",
          background: `${color}15`,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "14px",
        }}
      >
        {icon}
      </div>
      <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)", marginBottom: "8px" }}>
        {title}
      </h3>
      <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>{desc}</p>
    </div>
  );
}
