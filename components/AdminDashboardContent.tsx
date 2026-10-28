"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Package,
  ShoppingCart,
  AlertTriangle,
  Wallet,
  ArrowRight,
  ArrowDownToLine,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth";

export default function AdminDashboardContent() {
  const { user, profile, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    pendingListings: 0,
    totalOrders: 0,
    completedOrders: 0,
    openDisputes: 0,
    pendingPayments: 0,
    pendingWithdraws: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Strict auth guard
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      window.location.href = "/admin/login";
      return;
    }

    if (profile) {
      // Superadmin → superadmin dashboard
      if (profile.role === "superadmin") {
        window.location.href = "/superadmin/dashboard";
        return;
      }
      // Not admin → login
      if (profile.role !== "admin") {
        window.location.href = "/admin/login";
        return;
      }
    }
  }, [user, profile, authLoading]);

  useEffect(() => {
    if (!user || profile?.role !== "admin") return;

    const fetchStats = async () => {
      setLoading(true);

      const [
        { count: totalUsers },
        { count: totalListings },
        { count: pendingListings },
        { count: totalOrders },
        { count: completedOrders },
        { count: openDisputes },
        { count: pendingPayments },
        { count: pendingWithdraws },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("listings").select("*", { count: "exact", head: true }),
        supabase
          .from("listings")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("status", "completed"),
        supabase
          .from("disputes")
          .select("*", { count: "exact", head: true })
          .eq("status", "open"),
        supabase
          .from("wallet_transactions")
          .select("*", { count: "exact", head: true })
          .eq("type", "credit")
          .eq("status", "pending"),
        supabase
          .from("wallet_transactions")
          .select("*", { count: "exact", head: true })
          .eq("type", "debit")
          .eq("status", "pending"),
      ]);

      const { data: completedData } = await supabase
        .from("orders")
        .select("commission")
        .eq("status", "completed");

      const totalRevenue = (completedData || []).reduce(
        (sum, o) => sum + Number(o.commission || 0),
        0
      );

      setStats({
        totalUsers: totalUsers || 0,
        totalListings: totalListings || 0,
        pendingListings: pendingListings || 0,
        totalOrders: totalOrders || 0,
        completedOrders: completedOrders || 0,
        openDisputes: openDisputes || 0,
        pendingPayments: pendingPayments || 0,
        pendingWithdraws: pendingWithdraws || 0,
        totalRevenue,
      });

      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      setRecentOrders(ordersData || []);

      const { data: usersData } = await supabase
        .from("profiles")
        .select("id, name, email, role, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      setRecentUsers(usersData || []);

      setLoading(false);
    };

    fetchStats();
  }, [user, profile]);

  if (authLoading || loading || !profile || profile.role !== "admin") {
    return (
      <AdminLayout title="Overview" subtitle="লোড হচ্ছে...">
        <div
          style={{
            textAlign: "center",
            padding: "80px",
            color: "#94a3b8",
          }}
        >
          লোড হচ্ছে...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Dashboard Overview"
      subtitle="সাইটের সম্পূর্ণ অবস্থা এক নজরে"
    >
      {/* ===== STATS GRID ===== */}
      <div
        className="stats-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <StatCard
          icon={<Users size={20} />}
          value={stats.totalUsers}
          label="মোট Users"
          color="#6C63FF"
          href="/admin/users"
        />
        <StatCard
          icon={<Package size={20} />}
          value={stats.totalListings}
          label="মোট Listings"
          color="#10b981"
          href="/admin/listings"
          badge={
            stats.pendingListings > 0
              ? `${stats.pendingListings} pending`
              : undefined
          }
        />
        <StatCard
          icon={<ShoppingCart size={20} />}
          value={stats.totalOrders}
          label="মোট Orders"
          color="#f59e0b"
          href="/admin/orders"
          badge={
            stats.completedOrders > 0
              ? `${stats.completedOrders} completed`
              : undefined
          }
        />
        <StatCard
          icon={<Wallet size={20} />}
          value={`৳ ${stats.totalRevenue.toLocaleString()}`}
          label="মোট Revenue"
          color="#EC4899"
        />
      </div>

      {/* ===== ALERT ROW ===== */}
      <div
        className="alert-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <AlertCard
          icon={<Package size={20} />}
          title="Pending Listings"
          value={stats.pendingListings}
          color="#f59e0b"
          href="/admin/listings"
          hint="Approval-এর অপেক্ষায়"
        />
        <AlertCard
          icon={<ArrowDownToLine size={20} />}
          title="Pending Withdraws"
          value={stats.pendingWithdraws}
          color="#3b82f6"
          href="/admin/withdraws"
          hint="Withdrawal request"
        />
        <AlertCard
          icon={<Wallet size={20} />}
          title="Pending Payments"
          value={stats.pendingPayments}
          color="#8b5cf6"
          href="/admin/payments"
          hint="Coin purchase request"
        />
      </div>

      {/* ===== DISPUTE BANNER ===== */}
      {stats.openDisputes > 0 && (
        <Link
          href="/admin/disputes"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "rgba(239,68,68,0.1)",
            border: "1.5px solid rgba(239,68,68,0.4)",
            borderRadius: "14px",
            padding: "16px 20px",
            marginBottom: "24px",
            textDecoration: "none",
            color: "#f87171",
            fontWeight: 700,
            fontSize: "14px",
          }}
        >
          <AlertTriangle size={22} />
          <div style={{ flex: 1 }}>
            {stats.openDisputes}টি অর্ডারে Dispute চলছে — এখনই দেখুন
          </div>
          <ArrowRight size={18} />
        </Link>
      )}

      {/* ===== TWO COLUMN: Recent Orders + Users ===== */}
      <div
        className="recent-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
        }}
      >
        {/* Recent Orders */}
        <div
          style={{
            background: "#151d2e",
            border: "1.5px solid #253049",
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
            <h3
              style={{
                fontSize: "15px",
                fontWeight: 800,
                color: "#f1f5f9",
              }}
            >
              সাম্প্রতিক Orders
            </h3>
            <Link
              href="/admin/orders"
              style={{
                fontSize: "12px",
                color: "#6C63FF",
                fontWeight: 700,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              সব দেখুন <ArrowRight size={12} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "30px",
                color: "#64748b",
                fontSize: "12px",
              }}
            >
              এখনো কোনো order নেই
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {recentOrders.map((o) => (
                <Link
                  key={o.id}
                  href={`/admin/orders`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px",
                    background: "#0b1120",
                    borderRadius: "8px",
                    textDecoration: "none",
                    border: "1px solid #253049",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "8px",
                      background: "rgba(108,99,255,0.15)",
                      color: "#6C63FF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <ShoppingCart size={14} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#f1f5f9",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      #{o.id.slice(0, 8)}
                    </div>
                    <div style={{ fontSize: "10px", color: "#64748b" }}>
                      {new Date(o.created_at).toLocaleDateString("bn-BD")}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 800,
                        color: "#6C63FF",
                      }}
                    >
                      ৳ {Number(o.amount).toLocaleString()}
                    </div>
                    <div
                      style={{
                        fontSize: "9px",
                        color: "#94a3b8",
                        textTransform: "capitalize",
                      }}
                    >
                      {o.status}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div
          style={{
            background: "#151d2e",
            border: "1.5px solid #253049",
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
            <h3
              style={{
                fontSize: "15px",
                fontWeight: 800,
                color: "#f1f5f9",
              }}
            >
              সাম্প্রতিক Users
            </h3>
            <Link
              href="/admin/users"
              style={{
                fontSize: "12px",
                color: "#6C63FF",
                fontWeight: 700,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              সব দেখুন <ArrowRight size={12} />
            </Link>
          </div>

          {recentUsers.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "30px",
                color: "#64748b",
                fontSize: "12px",
              }}
            >
              এখনো কোনো user নেই
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {recentUsers.map((u) => (
                <div
                  key={u.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px",
                    background: "#0b1120",
                    borderRadius: "8px",
                    border: "1px solid #253049",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #6C63FF, #EC4899)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "12px",
                      flexShrink: 0,
                    }}
                  >
                    {(u.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#f1f5f9",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {u.name || "User"}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#64748b",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {u.email}
                    </div>
                  </div>
                  {u.role !== "user" && (
                    <span
                      style={{
                        fontSize: "9px",
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background:
                          u.role === "superadmin"
                            ? "rgba(236,72,153,0.15)"
                            : "rgba(108,99,255,0.15)",
                        color:
                          u.role === "superadmin" ? "#EC4899" : "#6C63FF",
                        textTransform: "uppercase",
                      }}
                    >
                      {u.role}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .alert-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 900px) {
          .recent-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: 1fr !important; }
          .alert-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AdminLayout>
  );
}

function StatCard({
  icon,
  value,
  label,
  color,
  href,
  badge,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
  href?: string;
  badge?: string;
}) {
  const content = (
    <div
      style={{
        background: "#151d2e",
        border: "1.5px solid #253049",
        borderRadius: "14px",
        padding: "18px",
        cursor: href ? "pointer" : "default",
        transition: "all 0.2s",
        position: "relative",
        height: "100%",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "10px",
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
      <div
        style={{
          fontSize: "22px",
          fontWeight: 800,
          color: "#f1f5f9",
          marginBottom: "2px",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>
        {label}
      </div>
      {badge && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            fontSize: "9px",
            fontWeight: 700,
            padding: "2px 7px",
            borderRadius: "4px",
            background: "rgba(245,158,11,0.15)",
            color: "#f59e0b",
          }}
        >
          {badge}
        </div>
      )}
    </div>
  );

  return href ? (
    <Link href={href} style={{ textDecoration: "none" }}>
      {content}
    </Link>
  ) : (
    content
  );
}

function AlertCard({
  icon,
  title,
  value,
  color,
  href,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
  href: string;
  hint: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        background: "#151d2e",
        border: `1.5px solid ${value > 0 ? `${color}50` : "#253049"}`,
        borderRadius: "14px",
        padding: "16px",
        textDecoration: "none",
        transition: "all 0.2s",
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
          flexShrink: 0,
          position: "relative",
        }}
      >
        {icon}
        {value > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              background: "#ef4444",
              color: "#fff",
              fontSize: "10px",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 5px",
              border: "2px solid #151d2e",
            }}
          >
            {value}
          </span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "#f1f5f9",
            marginBottom: "2px",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: "10px", color: "#64748b" }}>{hint}</div>
      </div>
      <ArrowRight size={16} color="#64748b" />
    </Link>
  );
}
