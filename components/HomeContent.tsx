"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Search,
  Shield,
  Zap,
  TrendingUp,
  Headphones,
  ArrowRight,
  Users,
  CheckCircle,
  Play,
  ThumbsUp,
  Music2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Listing {
  id: string;
  title: string;
  platform: "youtube" | "facebook" | "tiktok";
  price: number;
  followers: number;
  images: string[];
}

const platformColors = {
  youtube: "#FF0000",
  facebook: "#1877F2",
  tiktok: "#000000",
};

const platformIcons = {
  youtube: Play,
  facebook: ThumbsUp,
  tiktok: Music2,
};

export default function HomeContent() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchListings = async () => {
      const { data } = await supabase
        .from("listings")
        .select("id, title, platform, price, followers, images")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(4);
      setListings(data || []);
      setLoading(false);
    };
    fetchListings();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/browse?q=${encodeURIComponent(search)}`);
  };

  return (
    <main style={{ paddingBottom: "60px" }}>
      {/* ============================================ */}
      {/* HERO SECTION - Full width gradient */}
      {/* ============================================ */}
      <section
        style={{
          background: "linear-gradient(135deg, #6C63FF 0%, #5A52D5 100%)",
          padding: "80px 20px 100px",
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
            right: -50,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            bottom: -50,
            left: -30,
          }}
        />

        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            textAlign: "center",
            position: "relative",
            zIndex: 2,
          }}
        >
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
              marginBottom: "24px",
            }}
          >
            <Shield size={14} />
            100% Escrow Protected
          </div>

          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1.15,
              marginBottom: "20px",
              letterSpacing: "-1px",
            }}
          >
            সোশ্যাল অ্যাকাউন্ট <br />
            কিনুন ও বিক্রি করুন
          </h1>

          <p
            style={{
              fontSize: "clamp(15px, 2vw, 19px)",
              color: "rgba(255,255,255,0.9)",
              marginBottom: "36px",
              maxWidth: "600px",
              margin: "0 auto 36px",
              lineHeight: 1.6,
            }}
          >
            বাংলাদেশের সবচেয়ে নিরাপদ প্ল্যাটফর্মে YouTube, Facebook, TikTok অ্যাকাউন্ট কেনাবেচা করুন। Escrow সুরক্ষা সহ।
          </p>

          <form
            onSubmit={handleSearch}
            style={{
              display: "flex",
              maxWidth: "640px",
              margin: "0 auto",
              background: "#fff",
              borderRadius: "14px",
              padding: "6px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", paddingLeft: "16px" }}>
              <Search size={20} color="#667085" />
            </div>
            <input
              type="text"
              placeholder="YouTube, Facebook বা TikTok খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                padding: "14px 16px",
                fontSize: "15px",
                background: "transparent",
                color: "#101828",
              }}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{ borderRadius: "10px", padding: "12px 24px" }}
            >
              খুঁজুন
            </button>
          </form>
        </div>
      </section>

      {/* ============================================ */}
      {/* MAIN CONTENT WRAPPER - সব sections এখানে */}
      {/* ============================================ */}
      <div
        className="content-wrapper"
        style={{
          maxWidth: "1200px",
          margin: "-50px auto 0",
          padding: "0 20px",
          position: "relative",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          gap: "40px",
        }}
      >
        {/* ========== STATS SECTION ========== */}
        <section
          className="bordered-section"
          style={{
            background: "var(--card)",
            border: "1.5px solid var(--border)",
            borderRadius: "20px",
            padding: "40px 32px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
          }}
        >
          <div
            className="stats-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "16px",
            }}
          >
            <StatBox value="10,000+" label="বিশ্বস্ত ব্যবহারকারী" icon={<Users size={22} />} />
            <StatBox value="25,000+" label="সফল লেনদেন" icon={<CheckCircle size={22} />} />
            <StatBox value="99.9%" label="সফলতার হার" icon={<TrendingUp size={22} />} />
            <StatBox value="24/7" label="সাপোর্ট" icon={<Headphones size={22} />} />
          </div>
        </section>

        {/* ========== FEATURED LISTINGS ========== */}
        <section
          className="bordered-section"
          style={{
            background: "var(--card)",
            border: "1.5px solid var(--border)",
            borderRadius: "20px",
            padding: "40px 32px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginBottom: "28px",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <h2 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text)", marginBottom: "6px" }}>
                ফিচার্ড লিস্টিং
              </h2>
              <p style={{ color: "var(--muted)", fontSize: "14px" }}>
                সবচেয়ে জনপ্রিয় অ্যাকাউন্টগুলো এখনই দেখুন
              </p>
            </div>
            <Link
              href="/browse"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "var(--primary)",
                fontWeight: 700,
                fontSize: "14px",
                padding: "8px 14px",
                border: "1.5px solid var(--border)",
                borderRadius: "10px",
                background: "var(--bg)",
              }}
            >
              সব দেখুন <ArrowRight size={15} />
            </Link>
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px", color: "var(--muted)" }}>
              লোড হচ্ছে...
            </div>
          ) : listings.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "var(--muted)",
                border: "1.5px dashed var(--border)",
                borderRadius: "14px",
              }}
            >
              <p style={{ fontSize: "15px", marginBottom: "6px", fontWeight: 600 }}>
                এখনো কোনো listing নেই
              </p>
              <p style={{ fontSize: "13px" }}>
                প্রথম listing তৈরি করুন এবং আপনার অ্যাকাউন্ট বিক্রি করুন!
              </p>
            </div>
          ) : (
            <div
              className="listings-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "18px",
              }}
            >
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </section>

        {/* ========== FEATURES SECTION ========== */}
        <section
          className="bordered-section"
          style={{
            background: "var(--card)",
            border: "1.5px solid var(--border)",
            borderRadius: "20px",
            padding: "40px 32px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h2 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text)", marginBottom: "8px" }}>
              কেন আমাদের বেছে নেবেন?
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "14px" }}>
              আমরা নিশ্চিত করি সম্পূর্ণ নিরাপদ ও ঝামেলামুক্ত লেনদেন
            </p>
          </div>

          <div
            className="features-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "20px",
            }}
          >
            <FeatureCard
              icon={<Shield size={24} />}
              title="Escrow সুরক্ষা"
              desc="আপনার টাকা ৭২ ঘণ্টা পর্যন্ত সুরক্ষিত থাকে।"
              color="#6C63FF"
            />
            <FeatureCard
              icon={<Zap size={24} />}
              title="দ্রুত হ্যান্ডওভার"
              desc="গড়ে ২ ঘণ্টায় হ্যান্ডওভার সম্পন্ন হয়।"
              color="#f59e0b"
            />
            <FeatureCard
              icon={<TrendingUp size={24} />}
              title="সেরা দাম"
              desc="সবচেয়ে প্রতিযোগিতামূলক দামে কেনাবেচা।"
              color="#10b981"
            />
            <FeatureCard
              icon={<Headphones size={24} />}
              title="২৪/৭ সাপোর্ট"
              desc="যেকোনো সময় টিম আপনার পাশে আছে।"
              color="#ec4899"
            />
          </div>
        </section>

        {/* ========== CTA BANNER ========== */}
        <section
          style={{
            background: "linear-gradient(135deg, #6C63FF 0%, #EC4899 100%)",
            borderRadius: "20px",
            padding: "50px 32px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            border: "1.5px solid rgba(255,255,255,0.2)",
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
                fontSize: "clamp(24px, 4vw, 34px)",
                fontWeight: 800,
                color: "#fff",
                marginBottom: "12px",
                letterSpacing: "-0.5px",
              }}
            >
              আপনার অ্যাকাউন্ট বিক্রি করুন
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
              কয়েক মিনিটে listing তৈরি করুন এবং হাজারো ক্রেতার কাছে পৌঁছে যান
            </p>
            <Link
              href="/create-listing"
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
              বিক্রি শুরু করুন <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </div>

      {/* RESPONSIVE STYLES */}
      <style>{`
        @media (max-width: 1024px) {
          .listings-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .features-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .content-wrapper { gap: 28px !important; margin-top: -40px !important; }
          .bordered-section { padding: 28px 20px !important; }
        }
        @media (max-width: 640px) {
          .listings-grid { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </main>
  );
}

/* ========== HELPER COMPONENTS ========== */

function StatBox({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "16px 12px",
        border: "1.5px solid var(--border)",
        borderRadius: "14px",
        background: "var(--bg)",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "12px",
          background: "rgba(108,99,255,0.12)",
          color: "var(--primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 10px",
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text)", marginBottom: "4px" }}>
        {value}
      </div>
      <div style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  const Icon = platformIcons[listing.platform];
  const color = platformColors[listing.platform];

  return (
    <Link
      href={`/listing/${listing.id}`}
      style={{
        display: "block",
        overflow: "hidden",
        borderTop: `4px solid ${color}`,
        border: "1.5px solid var(--border)",
        borderTopColor: color,
        borderRadius: "14px",
        background: "var(--bg)",
        transition: "all 0.25s ease",
      }}
      className="listing-card"
    >
      <div
        style={{
          height: 120,
          background: `linear-gradient(135deg, ${color}18, ${color}35)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
        }}
      >
        <Icon size={44} />
      </div>
      <div style={{ padding: "14px" }}>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "var(--text)",
            marginBottom: "8px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "38px",
          }}
        >
          {listing.title}
        </div>
        <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "12px" }}>
          {listing.followers.toLocaleString()} followers
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "10px",
            borderTop: "1px solid var(--border)",
          }}
        >
          <span style={{ fontSize: "17px", fontWeight: 800, color: "var(--primary)" }}>
            ৳ {listing.price.toLocaleString()}
          </span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "var(--primary)",
              background: "rgba(108,99,255,0.1)",
              padding: "4px 10px",
              borderRadius: "6px",
            }}
          >
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}

function FeatureCard({
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
        padding: "20px",
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
          marginBottom: "14px",
        }}
      >
        {icon}
      </div>
      <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)", marginBottom: "8px" }}>
        {title}
      </h3>
      <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>
        {desc}
      </p>
    </div>
  );
}
