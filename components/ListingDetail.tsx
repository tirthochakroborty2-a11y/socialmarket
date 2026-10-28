"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Play,
  ThumbsUp,
  Music2,
  Shield,
  Users,
  Calendar,
  CheckCircle,
  MessageCircle,
  ShoppingCart,
  X,
  AlertCircle,
  Loader2,
  Link as LinkIcon,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth";
import { showToast } from "@/components/Toast";

interface Listing {
  id: string;
  seller_id: string;
  title: string;
  platform: "youtube" | "facebook" | "tiktok";
  account_link: string;
  price: number;
  followers: number;
  description: string;
  images: string[];
  status: string;
  handover_method: string;
  is_monetized: boolean;
  country: string;
  created_at: string;
}

interface Seller {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
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

const platformLabels = {
  youtube: "YouTube",
  facebook: "Facebook",
  tiktok: "TikTok",
};

export default function ListingDetail() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const listingId = params.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [buying, setBuying] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: listingData } = await supabase
        .from("listings")
        .select("*")
        .eq("id", listingId)
        .single();

      if (!listingData) {
        setLoading(false);
        return;
      }
      setListing(listingData);

      const { data: sellerData } = await supabase
        .from("profiles")
        .select("id, name, email, avatar_url")
        .eq("id", listingData.seller_id)
        .single();
      setSeller(sellerData);

      setLoading(false);
    };
    fetchData();
  }, [listingId]);

  const handleBuyClick = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (user.id === listing?.seller_id) {
      showToast("error", "ত্রুটি", "আপনি নিজের listing কিনতে পারবেন না");
      return;
    }
    if ((profile?.coin_balance || 0) < (listing?.price || 0)) {
      showToast("error", "ব্যালেন্স কম", "আপনার ওয়ালেটে পর্যাপ্ত balance নেই");
      return;
    }
    setShowBuyModal(true);
  };

  const confirmBuy = async () => {
    if (!listing || !user) return;
    setBuying(true);

    try {
      // 1. Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          listing_id: listing.id,
          buyer_id: user.id,
          seller_id: listing.seller_id,
          amount: listing.price,
          commission: listing.price * 0.05,
          status: "paid",
        })
        .select()
        .single();

      if (orderError || !order) throw orderError;

      // 2. Deduct from buyer balance
      const newBalance = (profile?.coin_balance || 0) - listing.price;
      const { error: balError } = await supabase
        .from("profiles")
        .update({ coin_balance: newBalance })
        .eq("id", user.id);
      if (balError) throw balError;

      // 3. Wallet transaction
      await supabase.from("wallet_transactions").insert({
        user_id: user.id,
        type: "debit",
        amount: listing.price,
        reason: `Order #${order.id.slice(0, 8)} - ${listing.title}`,
        status: "completed",
      });

      // 4. Update listing status
      await supabase.from("listings").update({ status: "reserved" }).eq("id", listing.id);

      // 5. Find an admin
      const { data: adminProfile } = await supabase
        .from("profiles")
        .select("id")
        .in("role", ["admin", "superadmin"])
        .limit(1)
        .single();

      // 6. Create deal conversation
      const { data: deal } = await supabase
        .from("deal_conversations")
        .insert({
          order_id: order.id,
          buyer_id: user.id,
          seller_id: listing.seller_id,
          admin_id: adminProfile?.id || null,
        })
        .select()
        .single();

      // 7. Welcome message
      if (deal && adminProfile) {
        await supabase.from("deal_messages").insert({
          deal_id: deal.id,
          sender_id: adminProfile.id,
          sender_role: "admin",
          message:
            "স্বাগতম! এই গ্রুপে buyer, seller এবং admin আছেন। টাকা escrow-তে সুরক্ষিত আছে। যেকোনো সমস্যায় এখানে জানান।",
        });
      }

      showToast("success", "অর্ডার সফল!", "Deal chat-এ redirect করা হচ্ছে...");
      setTimeout(() => router.push(`/deal/${order.id}`), 1000);
    } catch (err) {
      console.error(err);
      showToast("error", "সমস্যা হয়েছে", "আবার চেষ্টা করুন");
      setBuying(false);
    }
  };

  const handleMessageClick = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (user.id === listing?.seller_id) {
      showToast("error", "ত্রুটি", "নিজেকে message পাঠানো যাবে না");
      return;
    }
    router.push(`/messages?to=${listing?.seller_id}`);
  };

  if (loading) {
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

  if (!listing) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center" }}>
        <AlertCircle
          size={48}
          color="var(--muted)"
          style={{ marginBottom: "16px" }}
        />
        <h2 style={{ color: "var(--text)", marginBottom: "8px" }}>
          Listing পাওয়া যায়নি
        </h2>
        <Link
          href="/browse"
          className="btn-primary"
          style={{ marginTop: "20px", display: "inline-block" }}
        >
          ব্রাউজে ফিরুন
        </Link>
      </div>
    );
  }

  const Icon = platformIcons[listing.platform];
  const color = platformColors[listing.platform];

  return (
    <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 20px 60px" }}>
      {/* Breadcrumb */}
      <div
        style={{
          fontSize: "13px",
          color: "var(--muted)",
          marginBottom: "20px",
        }}
      >
        <Link href="/" style={{ color: "var(--muted)" }}>
          হোম
        </Link>
        {" / "}
        <Link href="/browse" style={{ color: "var(--muted)" }}>
          ব্রাউজ
        </Link>
        {" / "}
        <span style={{ color: "var(--text)" }}>
          {listing.title.slice(0, 40)}...
        </span>
      </div>

      <div
        className="detail-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 400px",
          gap: "28px",
          alignItems: "start",
        }}
      >
        {/* ===== LEFT COLUMN ===== */}
        <div>
          {/* Image Gallery */}
          <div
            style={{
              background: "var(--card)",
              border: "1.5px solid var(--border)",
              borderRadius: "16px",
              overflow: "hidden",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                height: 380,
                background: `linear-gradient(135deg, ${color}18, ${color}35)`,
                color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              {listing.images && listing.images[activeImage] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={listing.images[activeImage]}
                  alt={listing.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <Icon size={120} />
              )}
            </div>

            {/* Thumbnails */}
            {listing.images && listing.images.length > 1 && (
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  padding: "12px",
                  overflowX: "auto",
                }}
              >
                {listing.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: "8px",
                      overflow: "hidden",
                      border:
                        activeImage === i
                          ? "2px solid var(--primary)"
                          : "1.5px solid var(--border)",
                      cursor: "pointer",
                      padding: 0,
                      background: "transparent",
                      flexShrink: 0,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title + Platform */}
          <div
            style={{
              background: "var(--card)",
              border: "1.5px solid var(--border)",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "12px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: `${color}15`,
                  color: color,
                  padding: "5px 12px",
                  borderRadius: "99px",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                <Icon size={14} />
                {platformLabels[listing.platform]}
              </span>
              {listing.is_monetized && (
                <span
                  style={{
                    background: "#10b981",
                    color: "#fff",
                    padding: "5px 12px",
                    borderRadius: "99px",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  ✓ Monetized
                </span>
              )}
            </div>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: "var(--text)",
                lineHeight: 1.3,
              }}
            >
              {listing.title}
            </h1>
          </div>

          {/* Stats */}
          <div
            style={{
              background: "var(--card)",
              border: "1.5px solid var(--border)",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "20px",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
            }}
          >
            <StatItem
              icon={<Users size={20} />}
              label="ফলোয়ার"
              value={listing.followers.toLocaleString()}
            />
            <StatItem
              icon={<Calendar size={20} />}
              label="যোগ হয়েছে"
              value={new Date(listing.created_at).toLocaleDateString("bn-BD")}
            />
            <StatItem
              icon={<CheckCircle size={20} />}
              label="Monetized"
              value={listing.is_monetized ? "হ্যাঁ" : "না"}
            />
          </div>

          {/* Description + Account Link */}
          <div
            style={{
              background: "var(--card)",
              border: "1.5px solid var(--border)",
              borderRadius: "16px",
              padding: "24px",
            }}
          >
            <h2
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "var(--text)",
                marginBottom: "12px",
              }}
            >
              বিবরণ
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "var(--muted)",
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
              }}
            >
              {listing.description || "কোনো বিবরণ দেওয়া হয়নি।"}
            </p>

            {/* ✅ Account Link (সবাই দেখতে পাবে) */}
            {listing.account_link && (
              <div
                style={{
                  marginTop: "20px",
                  paddingTop: "20px",
                  borderTop: "1px solid var(--border)",
                }}
              >
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "var(--text)",
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <LinkIcon size={14} />
                  অ্যাকাউন্ট লিংক
                </h3>
                <a
                  href={listing.account_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: `${color}10`,
                    color: color,
                    padding: "10px 14px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 700,
                    border: `1.5px solid ${color}40`,
                    wordBreak: "break-all",
                    maxWidth: "100%",
                    transition: "all 0.2s",
                  }}
                >
                  <LinkIcon size={14} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                    {listing.account_link}
                  </span>
                  <ExternalLink size={12} style={{ flexShrink: 0, opacity: 0.7 }} />
                </a>
                <p
                  style={{
                    fontSize: "11px",
                    color: "var(--muted)",
                    marginTop: "6px",
                  }}
                >
                  🔒 সরাসরি লিংকে ক্লিক করে অ্যাকাউন্ট দেখতে পারেন — তবে লেনদেন group chat-এ করুন
                </p>
              </div>
            )}

            <div
              style={{
                marginTop: "20px",
                paddingTop: "20px",
                borderTop: "1px solid var(--border)",
              }}
            >
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "var(--text)",
                  marginBottom: "8px",
                }}
              >
                হ্যান্ডওভার পদ্ধতি
              </h3>
              <span
                style={{
                  background: "var(--bg)",
                  color: "var(--text)",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  border: "1px solid var(--border)",
                }}
              >
                {listing.handover_method || "Backup code"}
              </span>
            </div>
          </div>
        </div>

        {/* ===== RIGHT COLUMN (Sticky) ===== */}
        <div style={{ position: "sticky", top: "90px" }}>
          {/* Price Card */}
          <div
            style={{
              background: "var(--card)",
              border: "1.5px solid var(--border)",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "4px" }}
            >
              মূল্য
            </div>
            <div
              style={{
                fontSize: "36px",
                fontWeight: 800,
                color: "var(--primary)",
                marginBottom: "20px",
              }}
            >
              ৳ {listing.price.toLocaleString()}
            </div>

            <button
              onClick={handleBuyClick}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #6C63FF, #5A52D5)",
                color: "#fff",
                border: "none",
                fontWeight: 700,
                fontSize: "15px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginBottom: "10px",
                boxShadow: "0 6px 20px rgba(108,99,255,0.3)",
              }}
            >
              <ShoppingCart size={18} />
              এখনই কিনুন
            </button>

            <button
              onClick={handleMessageClick}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                background: "var(--bg)",
                color: "var(--text)",
                border: "1.5px solid var(--border)",
                fontWeight: 700,
                fontSize: "15px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <MessageCircle size={18} />
              সেলারকে মেসেজ
            </button>

            {/* Escrow Notice */}
            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.3)",
                borderRadius: "10px",
                display: "flex",
                gap: "10px",
                alignItems: "flex-start",
              }}
            >
              <Shield
                size={18}
                color="#10b981"
                style={{ flexShrink: 0, marginTop: "1px" }}
              />
              <div style={{ fontSize: "12px", color: "var(--text)", lineHeight: 1.5 }}>
                <strong>Escrow সুরক্ষা:</strong> টাকা ৭২ ঘণ্টা escrow-তে থাকবে।
                Confirm করার পরেই সেলার পাবেন।
              </div>
            </div>
          </div>

          {/* Seller Info */}
          <div
            style={{
              background: "var(--card)",
              border: "1.5px solid var(--border)",
              borderRadius: "16px",
              padding: "20px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: "var(--muted)",
                marginBottom: "12px",
                fontWeight: 600,
              }}
            >
              বিক্রেতা
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #6C63FF, #5A52D5)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "18px",
                }}
              >
                {seller?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    color: "var(--text)",
                    fontSize: "14px",
                  }}
                >
                  {seller?.name || "Unknown"}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <CheckCircle size={12} color="#10b981" />
                  Verified Seller
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== LOGIN MODAL ===== */}
      {showLoginModal && (
        <Modal onClose={() => setShowLoginModal(false)}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(108,99,255,0.1)",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <ShoppingCart size={32} />
            </div>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 800,
                color: "var(--text)",
                marginBottom: "8px",
              }}
            >
              লগইন প্রয়োজন
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "var(--muted)",
                marginBottom: "24px",
              }}
            >
              কিনতে হলে আগে লগইন করুন
            </p>
            <Link
              href={`/login?redirect=/listing/${listing.id}`}
              style={{
                display: "block",
                padding: "12px",
                background: "linear-gradient(135deg, #6C63FF, #5A52D5)",
                color: "#fff",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "14px",
                marginBottom: "8px",
              }}
            >
              লগইন করুন
            </Link>
            <button
              onClick={() => setShowLoginModal(false)}
              style={{
                width: "100%",
                padding: "12px",
                background: "transparent",
                color: "var(--muted)",
                border: "none",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              বাতিল
            </button>
          </div>
        </Modal>
      )}

      {/* ===== BUY MODAL ===== */}
      {showBuyModal && (
        <Modal onClose={() => !buying && setShowBuyModal(false)}>
          <div>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 800,
                color: "var(--text)",
                marginBottom: "20px",
              }}
            >
              অর্ডার নিশ্চিত করুন
            </h2>

            <div
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "16px",
              }}
            >
              <Row label="Listing" value={listing.title} />
              <Row label="মূল্য" value={`৳ ${listing.price.toLocaleString()}`} bold />
              <Row
                label="আপনার ব্যালেন্স"
                value={`৳ ${(profile?.coin_balance || 0).toLocaleString()}`}
                color={
                  (profile?.coin_balance || 0) >= listing.price
                    ? "#10b981"
                    : "#ef4444"
                }
              />
            </div>

            <div
              style={{
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.3)",
                borderRadius: "10px",
                padding: "12px",
                marginBottom: "20px",
                fontSize: "13px",
                color: "var(--text)",
                display: "flex",
                gap: "8px",
              }}
            >
              <Shield
                size={16}
                color="#10b981"
                style={{ flexShrink: 0, marginTop: "2px" }}
              />
              <div>
                টাকা escrow-তে থাকবে। Deal chat-এ admin, buyer, seller একসাথে কথা বলতে পারবেন।
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowBuyModal(false)}
                disabled={buying}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "var(--bg)",
                  color: "var(--text)",
                  border: "1.5px solid var(--border)",
                  borderRadius: "10px",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: buying ? "not-allowed" : "pointer",
                }}
              >
                বাতিল
              </button>
              <button
                onClick={confirmBuy}
                disabled={buying}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "linear-gradient(135deg, #6C63FF, #5A52D5)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: buying ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  opacity: buying ? 0.7 : 1,
                }}
              >
                {buying ? (
                  <>
                    <Loader2
                      size={16}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                    প্রসেসিং...
                  </>
                ) : (
                  "নিশ্চিত করুন"
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 900px) {
          .detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

/* ===== HELPERS ===== */

function StatItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "10px",
          background: "rgba(108,99,255,0.1)",
          color: "var(--primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600 }}>
          {label}
        </div>
        <div
          style={{ fontSize: "14px", color: "var(--text)", fontWeight: 700 }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  color,
}: {
  label: string;
  value: string;
  bold?: boolean;
  color?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "12px",
        marginBottom: "8px",
      }}
    >
      <span style={{ fontSize: "13px", color: "var(--muted)" }}>{label}</span>
      <span
        style={{
          fontSize: "13px",
          fontWeight: bold ? 800 : 600,
          color: color || "var(--text)",
          textAlign: "right",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: "200px",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--card)",
          borderRadius: "18px",
          padding: "28px",
          maxWidth: "440px",
          width: "100%",
          position: "relative",
          border: "1.5px solid var(--border)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--muted)",
          }}
        >
          <X size={16} />
        </button>
        {children}
      </div>
    </div>
  );
}
