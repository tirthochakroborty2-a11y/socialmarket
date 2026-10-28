"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Wallet,
  Package,
  ShoppingBag,
  TrendingUp,
  Plus,
  Shield,
  ArrowRight,
  User,
  Inbox,
  Clock,
  CheckCircle,
  Play,
  ThumbsUp,
  Music2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth";

interface Order {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  status: string;
  created_at: string;
  listings?: { title: string; platform: string } | null;
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

type Tab = "overview" | "purchases" | "sales" | "listings";

export default function DashboardContent() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [tab, setTab] = useState<Tab>("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Auth protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/dashboard");
    }
  }, [user, authLoading]);

  // Fetch data
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);

      // Orders (both buyer and seller)
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*, listings(title, platform)")
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      // My listings
      const { data: listingsData } = await supabase
        .from("listings")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      setOrders(ordersData || []);
      setMyListings(listingsData || []);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (authLoading || !user) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center", color: "var(--muted)" }}>
        লোড হচ্ছে...
      </div>
    );
  }

  const purchases = orders.filter((o) => o.buyer_id === user.id);
  const sales = orders.filter((o) => o.seller_id === user.id);
  const activeListings = myListings.filter((l) => l.status === "active");
  const totalEarned = sales
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + Number(o.amount), 0);
  const totalSpent = purchases
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.amount), 0);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        paddingBottom: "60px",
      }}
    >
      {/* Hero strip with gradient */}
      <section
        style={{
          background:
            "linear-gradient(135deg, #6C63FF 0%, #5A52D5 50%, #EC4899 100%)",
          padding: "40px 20px 80px",
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
            background: "rgba(255,255,255,0.1)",
            top: -100,
            right: -50,
          }}
        />
        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "20px",
                  background: "rgba(255,255,255,0.25)",
                  backdropFilter: "blur(10px)",
                  border: "2px solid rgba(255,255,255,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "26px",
                }}
              >
                {profile?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h1
                  style={{
                    fontSize: "24px",
                    fontWeight: 800,
                    color: "#fff",
                    marginBottom: "4px",
                  }}
                >
                  স্বাগতম, {profile?.name || "User"}!
                </h1>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)" }}>
                  {profile?.email}
                  {profile?.role === "superadmin" && (
                    <span
                      style={{
                        marginLeft: "8px",
                        background: "rgba(255,255,255,0.2)",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        fontWeight: 700,
                        fontSize: "11px",
                      }}
                    >
                      👑 SUPER ADMIN
                    </span>
                  )}
                  {profile?.role === "admin" && (
                    <span
                      style={{
                        marginLeft: "8px",
                        background: "rgba(255,255,255,0.2)",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        fontWeight: 700,
                        fontSize: "11px",
                      }}
                    >
                      🛡️ ADMIN
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <Link
                href="/create-listing"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#fff",
                  color: "#6C63FF",
                  padding: "11px 20px",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "14px",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
                }}
              >
                <Plus size={16} /> নতুন Listing
              </Link>
              <Link
                href="/wallet"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                  border: "1.5px solid rgba(255,255,255,0.4)",
                  color: "#fff",
                  padding: "11px 20px",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                <Wallet size={16} /> ওয়ালেট
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats cards - overlapping the hero */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "-50px auto 0",
          padding: "0 20px",
          position: "relative",
          zIndex: 3,
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
          <StatCard
            icon={<Wallet size={22} />}
            value={`৳ ${(profile?.coin_balance || 0).toLocaleString()}`}
            label="ব্যালেন্স"
            color="#6C63FF"
            href="/wallet"
          />
          <StatCard
            icon={<Package size={22} />}
            value={String(activeListings.length)}
            label="সক্রিয় Listing"
            color="#10b981"
            onClick={() => setTab("listings")}
          />
          <StatCard
            icon={<ShoppingBag size={22} />}
            value={String(purchases.length)}
            label="মোট কেনা"
            color="#f59e0b"
            onClick={() => setTab("purchases")}
          />
          <StatCard
            icon={<TrendingUp size={22} />}
            value={`৳ ${totalEarned.toLocaleString()}`}
            label="মোট আয়"
            color="#ec4899"
            onClick={() => setTab("sales")}
          />
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "32px auto 0",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            background: "var(--card)",
            border: "1.5px solid var(--border)",
            borderRadius: "14px",
            padding: "6px",
            display: "flex",
            gap: "4px",
            marginBottom: "24px",
            overflowX: "auto",
          }}
        >
          {(
            [
              { v: "overview", label: "ওভারভিউ", icon: <User size={14} /> },
              { v: "purchases", label: "কেনা", icon: <ShoppingBag size={14} /> },
              { v: "sales", label: "বেচা", icon: <TrendingUp size={14} /> },
              { v: "listings", label: "লিস্টিং", icon: <Package size={14} /> },
            ] as const
          ).map((t) => (
            <button
              key={t.v}
              onClick={() => setTab(t.v)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 16px",
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

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "var(--muted)" }}>
            লোড হচ্ছে...
          </div>
        ) : (
          <>
            {tab === "overview" && (
              <OverviewTab
                purchases={purchases}
                sales={sales}
                listings={myListings}
                totalSpent={totalSpent}
                totalEarned={totalEarned}
              />
            )}
            {tab === "purchases" && <OrdersTab orders={purchases} role="buyer" />}
            {tab === "sales" && <OrdersTab orders={sales} role="seller" />}
            {tab === "listings" && <ListingsTab listings={myListings} />}
          </>
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

/* ============ STAT CARD ============ */
function StatCard({
  icon,
  value,
  label,
  color,
  href,
  onClick,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
  href?: string;
  onClick?: () => void;
}) {
  const content = (
    <div
      style={{
        background: "var(--card)",
        border: "1.5px solid var(--border)",
        borderRadius: "16px",
        padding: "20px",
        cursor: href || onClick ? "pointer" : "default",
        transition: "all 0.2s",
        boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
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
          marginBottom: "12px",
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--text)", marginBottom: "2px" }}>
        {value}
      </div>
      <div style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 600 }}>{label}</div>
    </div>
  );

  if (href) return <Link href={href}>{content}</Link>;
  if (onClick)
    return (
      <div onClick={onClick} role="button" tabIndex={0}>
        {content}
      </div>
    );
  return content;
}

/* ============ OVERVIEW TAB ============ */
function OverviewTab({
  purchases,
  sales,
  listings,
  totalSpent,
  totalEarned,
}: {
  purchases: Order[];
  sales: Order[];
  listings: any[];
  totalSpent: number;
  totalEarned: number;
}) {
  const recentOrders = [...purchases, ...sales]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Money summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
        }}
        className="money-grid"
      >
        <div
          style={{
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            borderRadius: "16px",
            padding: "24px",
            color: "#fff",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              top: -40,
              right: -40,
            }}
          />
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ fontSize: "12px", opacity: 0.9, marginBottom: "6px", fontWeight: 600 }}>
              মোট আয়
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800 }}>
              ৳ {totalEarned.toLocaleString()}
            </div>
            <div style={{ fontSize: "12px", opacity: 0.85, marginTop: "4px" }}>
              {sales.filter((s) => s.status === "completed").length}টি সফল বিক্রয়
            </div>
          </div>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            borderRadius: "16px",
            padding: "24px",
            color: "#fff",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              top: -40,
              right: -40,
            }}
          />
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ fontSize: "12px", opacity: 0.9, marginBottom: "6px", fontWeight: 600 }}>
              মোট খরচ
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800 }}>
              ৳ {totalSpent.toLocaleString()}
            </div>
            <div style={{ fontSize: "12px", opacity: 0.85, marginTop: "4px" }}>
              {purchases.length}টি অর্ডার
            </div>
          </div>
        </div>
      </div>

      {/* Recent orders */}
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
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text)" }}>
            সাম্প্রতিক অর্ডার
          </h3>
          {recentOrders.length > 0 && (
            <span style={{ fontSize: "12px", color: "var(--muted)" }}>
              শেষ {recentOrders.length}টি
            </span>
          )}
        </div>
        {recentOrders.length === 0 ? (
          <EmptyMini icon={<Inbox size={32} />} message="এখনো কোনো অর্ডার নেই" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {recentOrders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============ ORDERS TAB ============ */
function OrdersTab({ orders, role }: { orders: Order[]; role: "buyer" | "seller" }) {
  if (orders.length === 0) {
    return (
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
        <Inbox size={48} style={{ marginBottom: "12px", opacity: 0.5 }} />
        <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>
          {role === "buyer" ? "এখনো কোনো কেনাকাটা নেই" : "এখনো কোনো বিক্রয় নেই"}
        </div>
        <div style={{ fontSize: "13px" }}>
          {role === "buyer" ? "Browse page থেকে পছন্দের listing কিনুন" : "নতুন listing তৈরি করুন"}
        </div>
        <Link
          href={role === "buyer" ? "/browse" : "/create-listing"}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            marginTop: "16px",
            background: "var(--primary)",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "13px",
          }}
        >
          {role === "buyer" ? "ব্রাউজ করুন" : "Listing তৈরি"} <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1.5px solid var(--border)",
        borderRadius: "16px",
        padding: "20px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {orders.map((order) => (
          <OrderRow key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}

/* ============ LISTINGS TAB ============ */
function ListingsTab({ listings }: { listings: any[] }) {
  if (listings.length === 0) {
    return (
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
        <Package size={48} style={{ marginBottom: "12px", opacity: 0.5 }} />
        <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>
          এখনো কোনো listing নেই
        </div>
        <div style={{ fontSize: "13px", marginBottom: "16px" }}>
          আপনার প্রথম listing তৈরি করুন
        </div>
        <Link
          href="/create-listing"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "var(--primary)",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "13px",
          }}
        >
          <Plus size={14} /> Listing তৈরি করুন
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: "16px",
      }}
    >
      {listings.map((listing) => (
        <Link
          key={listing.id}
          href={`/listing/${listing.id}`}
          style={{
            background: "var(--card)",
            border: "1.5px solid var(--border)",
            borderRadius: "14px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            transition: "all 0.2s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                background: `${platformColors[listing.platform]}15`,
                color: platformColors[listing.platform],
                padding: "3px 9px",
                borderRadius: "6px",
                textTransform: "capitalize",
              }}
            >
              {listing.platform}
            </span>
            <StatusBadge status={listing.status} />
          </div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "var(--text)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: "38px",
            }}
          >
            {listing.title}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--primary)" }}>
              ৳ {Number(listing.price).toLocaleString()}
            </span>
            <span style={{ fontSize: "12px", color: "var(--muted)" }}>
              {Number(listing.followers).toLocaleString()} followers
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

/* ============ ORDER ROW ============ */
function OrderRow({ order }: { order: Order }) {
  const PlatformIcon = platformIcons[order.listings?.platform || "youtube"] || Play;
  const color = platformColors[order.listings?.platform || "youtube"] || "#6C63FF";

  return (
    <Link
      href={`/orders/${order.id}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "12px",
        borderRadius: "10px",
        background: "var(--bg)",
        border: "1px solid var(--border)",
        transition: "all 0.2s",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "10px",
          background: `${color}15`,
          color: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <PlatformIcon size={20} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "13px",
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
          #{order.id.slice(0, 8)} · {new Date(order.created_at).toLocaleDateString("bn-BD")}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--primary)" }}>
          ৳ {Number(order.amount).toLocaleString()}
        </div>
        <StatusBadge status={order.status} small />
      </div>
    </Link>
  );
}

/* ============ HELPERS ============ */
function StatusBadge({ status, small }: { status: string; small?: boolean }) {
  const colors: Record<string, { bg: string; fg: string }> = {
    pending: { bg: "#f59e0b15", fg: "#f59e0b" },
    active: { bg: "#10b98115", fg: "#10b981" },
    paid: { bg: "#3b82f615", fg: "#3b82f6" },
    reserved: { bg: "#8b5cf615", fg: "#8b5cf6" },
    delivered: { bg: "#06b6d415", fg: "#06b6d4" },
    completed: { bg: "#10b98120", fg: "#10b981" },
    disputed: { bg: "#ef444415", fg: "#ef4444" },
    cancelled: { bg: "#98a2b315", fg: "#98a2b3" },
    rejected: { bg: "#ef444415", fg: "#ef4444" },
    sold: { bg: "#10b98115", fg: "#10b981" },
  };
  const c = colors[status] || colors.pending;
  return (
    <span
      style={{
        fontSize: small ? "9px" : "11px",
        fontWeight: 700,
        background: c.bg,
        color: c.fg,
        padding: small ? "2px 6px" : "3px 9px",
        borderRadius: "5px",
        textTransform: "capitalize",
      }}
    >
      {status}
    </span>
  );
}

function EmptyMini({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "30px 20px",
        color: "var(--muted)",
        opacity: 0.7,
      }}
    >
      {icon}
      <div style={{ fontSize: "13px", marginTop: "8px" }}>{message}</div>
    </div>
  );
}
