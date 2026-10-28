"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  ThumbsUp,
  Music2,
  Search,
  Inbox,
  Filter,
  ArrowRight,
  X,
  Wallet,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth";

interface Order {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  commission: number;
  status: string;
  created_at: string;
  listings?: {
    title: string;
    platform: string;
    images: string[];
  } | null;
}

const platformColors: Record<string, string> = {
  youtube: "#FF0000",
  facebook: "#1877F2",
  tiktok: "#000000",
};

const platformIcons: Record<string, any> = {
  youtube: Play,
  facebook: ThumbsUp,
  tiktok: Music2,
};

type FilterTab = "all" | "buyer" | "seller" | "completed" | "pending";

export default function MyOrdersContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/orders");
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      setLoading(true);

      const { data } = await supabase
        .from("orders")
        .select("*")
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (!data) {
        setLoading(false);
        return;
      }

      // Fetch listing info
      const listingIds = [...new Set(data.map((o) => o.listing_id))];
      let listingsMap: Record<string, any> = {};

      if (listingIds.length > 0) {
        const { data: listingsData } = await supabase
          .from("listings")
          .select("id, title, platform, images")
          .in("id", listingIds);

        (listingsData || []).forEach((l) => {
          listingsMap[l.id] = l;
        });
      }

      setOrders(
        data.map((o) => ({
          ...o,
          listings: listingsMap[o.listing_id] || null,
        }))
      );
      setLoading(false);
    };

    fetchOrders();
  }, [user]);

  // Stats
  const buyerOrders = orders.filter((o) => o.buyer_id === user?.id);
  const sellerOrders = orders.filter((o) => o.seller_id === user?.id);
  const completedOrders = orders.filter((o) => o.status === "completed");
  const pendingOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "paid" || o.status === "delivered"
  );
  const disputedOrders = orders.filter((o) => o.status === "disputed");

  // Filter
  const filteredOrders = orders.filter((o) => {
    // Tab filter
    if (tab === "buyer" && o.buyer_id !== user?.id) return false;
    if (tab === "seller" && o.seller_id !== user?.id) return false;
    if (tab === "completed" && o.status !== "completed") return false;
    if (tab === "pending" && !["pending", "paid", "delivered"].includes(o.status))
      return false;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      const title = o.listings?.title?.toLowerCase() || "";
      const id = o.id.toLowerCase();
      if (!title.includes(q) && !id.includes(q)) return false;
    }

    return true;
  });

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

  return (
    <main
      style={{
        background: "var(--bg)",
        minHeight: "100vh",
        paddingBottom: "60px",
      }}
    >
      {/* HERO */}
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
            left: "20%",
          }}
        />

        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "8px",
            }}
          >
            <Package size={26} color="#fff" />
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#fff" }}>
              আমার অর্ডার
            </h1>
          </div>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)" }}>
            সব কেনা, বেচা এবং চলমান অর্ডার এক জায়গায়
          </p>
        </div>
      </section>

      {/* MAIN */}
      <div
        style={{
          maxWidth: "1100px",
          margin: "-70px auto 0",
          padding: "0 20px",
          position: "relative",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* STATS CARDS */}
        <div
          className="stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
          }}
        >
          <StatCard
            icon={<ShoppingBag size={22} />}
            value={buyerOrders.length}
            label="কেনা"
            color="#6C63FF"
            onClick={() => setTab("buyer")}
          />
          <StatCard
            icon={<TrendingUp size={22} />}
            value={sellerOrders.length}
            label="বেচা"
            color="#f59e0b"
            onClick={() => setTab("seller")}
          />
          <StatCard
            icon={<Clock size={22} />}
            value={pendingOrders.length}
            label="চলমান"
            color="#06b6d4"
            onClick={() => setTab("pending")}
          />
          <StatCard
            icon={<CheckCircle size={22} />}
            value={completedOrders.length}
            label="সম্পন্ন"
            color="#10b981"
            onClick={() => setTab("completed")}
          />
        </div>

        {/* SEARCH + TABS */}
        <div
          style={{
            background: "var(--card)",
            border: "1.5px solid var(--border)",
            borderRadius: "16px",
            padding: "16px",
          }}
        >
          {/* Search */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 14px",
              background: "var(--bg)",
              border: "1.5px solid var(--border)",
              borderRadius: "10px",
              marginBottom: "14px",
            }}
          >
            <Search size={16} color="var(--muted)" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Order ID বা listing শিরোনাম খুঁজুন..."
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                color: "var(--text)",
                fontSize: "14px",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--muted)",
                  cursor: "pointer",
                  display: "flex",
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: "6px",
              overflowX: "auto",
              paddingBottom: "2px",
            }}
          >
            {(
              [
                { v: "all", label: "সব", count: orders.length },
                { v: "buyer", label: "কেনা", count: buyerOrders.length },
                { v: "seller", label: "বেচা", count: sellerOrders.length },
                { v: "pending", label: "চলমান", count: pendingOrders.length },
                { v: "completed", label: "সম্পন্ন", count: completedOrders.length },
              ] as const
            ).map((t) => (
              <button
                key={t.v}
                onClick={() => setTab(t.v)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "10px",
                  border:
                    tab === t.v
                      ? "1.5px solid var(--primary)"
                      : "1.5px solid var(--border)",
                  background:
                    tab === t.v ? "rgba(108,99,255,0.1)" : "transparent",
                  color: tab === t.v ? "var(--primary)" : "var(--text)",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s",
                }}
              >
                {t.label}
                <span
                  style={{
                    background:
                      tab === t.v ? "var(--primary)" : "var(--bg)",
                    color: tab === t.v ? "#fff" : "var(--muted)",
                    padding: "1px 7px",
                    borderRadius: 99,
                    fontSize: "10px",
                    fontWeight: 800,
                  }}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* DISPUTED BANNER */}
        {disputedOrders.length > 0 && (
          <div
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1.5px solid rgba(239,68,68,0.3)",
              borderRadius: "12px",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "13px",
              color: "#ef4444",
              fontWeight: 700,
            }}
          >
            <AlertCircle size={18} />
            {disputedOrders.length}টি অর্ডারে dispute চলছে —{" "}
            <Link
              href={`/orders/${disputedOrders[0].id}`}
              style={{ color: "#ef4444", textDecoration: "underline" }}
            >
              দেখুন
            </Link>
          </div>
        )}

        {/* ORDER LIST */}
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px",
              color: "var(--muted)",
            }}
          >
            লোড হচ্ছে...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div
            style={{
              background: "var(--card)",
              border: "1.5px dashed var(--border)",
              borderRadius: "16px",
              padding: "60px 20px",
              textAlign: "center",
              color: "var(--muted)",
            }}
          >
            <Inbox size={56} style={{ opacity: 0.4, marginBottom: "12px" }} />
            <div
              style={{
                fontSize: "16px",
                fontWeight: 800,
                color: "var(--text)",
                marginBottom: "6px",
              }}
            >
              কোনো অর্ডার নেই
            </div>
            <div style={{ fontSize: "13px", marginBottom: "20px" }}>
              {tab === "seller"
                ? "আপনার listing বিক্রি হলে এখানে দেখাবে"
                : "Browse page থেকে listing কিনুন"}
            </div>
            <Link
              href={tab === "seller" ? "/create-listing" : "/browse"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "var(--primary)",
                color: "#fff",
                padding: "12px 24px",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "13px",
                boxShadow: "0 4px 14px rgba(108,99,255,0.3)",
              }}
            >
              {tab === "seller" ? "Listing তৈরি করুন" : "ব্রাউজ করুন"}
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                userId={user.id}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}

function StatCard({
  icon,
  value,
  label,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "var(--card)",
        border: "1.5px solid var(--border)",
        borderRadius: "16px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "12px",
        cursor: "pointer",
        boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
        transition: "all 0.2s",
        textAlign: "left",
        width: "100%",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "12px",
          background: `${color}15`,
          color: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontSize: "24px",
            fontWeight: 800,
            color: "var(--text)",
            lineHeight: 1,
            marginBottom: "4px",
          }}
        >
          {value}
        </div>
        <div style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 600 }}>
          {label}
        </div>
      </div>
    </button>
  );
}

function OrderCard({ order, userId }: { order: Order; userId: string }) {
  const PlatformIcon = platformIcons[order.listings?.platform || "youtube"] || Play;
  const color = platformColors[order.listings?.platform || "youtube"] || "#6C63FF";
  const isBuyer = order.buyer_id === userId;

  const statusStyles: Record<string, { text: string; color: string; bg: string }> = {
    pending: { text: "Pending", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    paid: { text: "Paid", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
    delivered: {
      text: "Delivered",
      color: "#06b6d4",
      bg: "rgba(6,182,212,0.1)",
    },
    completed: {
      text: "Completed",
      color: "#10b981",
      bg: "rgba(16,185,129,0.1)",
    },
    disputed: { text: "Disputed", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
    cancelled: {
      text: "Cancelled",
      color: "#98a2b3",
      bg: "rgba(152,162,179,0.1)",
    },
  };
  const s = statusStyles[order.status] || statusStyles.pending;

  return (
    <Link
      href={`/orders/${order.id}`}
      style={{
        background: "var(--card)",
        border: "1.5px solid var(--border)",
        borderRadius: "16px",
        padding: "18px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        textDecoration: "none",
        transition: "all 0.2s",
        flexWrap: "wrap",
      }}
      className="order-card"
    >
      {/* Icon */}
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: "14px",
          background: `${color}15`,
          color: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <PlatformIcon size={28} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 200 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "4px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              background: isBuyer ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
              color: isBuyer ? "#10b981" : "#f59e0b",
              padding: "2px 8px",
              borderRadius: "5px",
            }}
          >
            {isBuyer ? "কিনেছি" : "বেচেছি"}
          </span>
          <span
            style={{
              fontSize: "11px",
              color: "var(--muted)",
              fontWeight: 600,
            }}
          >
            #{order.id.slice(0, 8)}
          </span>
        </div>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "var(--text)",
            marginBottom: "2px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {order.listings?.title || "Listing"}
        </div>
        <div style={{ fontSize: "11px", color: "var(--muted)" }}>
          {new Date(order.created_at).toLocaleDateString("bn-BD", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Amount */}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div
          style={{
            fontSize: "18px",
            fontWeight: 800,
            color: "var(--primary)",
            marginBottom: "4px",
          }}
        >
          ৳ {Number(order.amount).toLocaleString()}
        </div>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 800,
            background: s.bg,
            color: s.color,
            padding: "3px 9px",
            borderRadius: "5px",
            textTransform: "uppercase",
          }}
        >
          {s.text}
        </span>
      </div>

      {/* Arrow */}
      <ArrowRight size={18} color="var(--muted)" style={{ flexShrink: 0 }} />

      <style>{`
        .order-card:hover {
          transform: translateY(-2px);
          border-color: var(--primary) !important;
          box-shadow: 0 8px 20px rgba(108,99,255,0.1);
        }
      `}</style>
    </Link>
  );
}
