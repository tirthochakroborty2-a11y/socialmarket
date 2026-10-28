"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Crown,
  Plus,
  Shield,
  Users,
  Package,
  ShoppingCart,
  AlertTriangle,
  Wallet,
  ArrowDownToLine,
  LayoutDashboard,
  LogOut,
  Home,
  Bell,
  TrendingUp,
  ChevronDown,
  Search,
  Activity,
  Eye,
  CheckCircle,
  RefreshCw,
  User,
  Menu,
  X,
  ArrowRight,
  DollarSign,
  Ban,
  Trash2,
  UserPlus,
  Mail,
  Calendar,
  Play,
  ThumbsUp,
  Music2,
  Loader2,
  Phone,
  Link as LinkIcon,
  ExternalLink,
  Crown as CrownIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth";
import { showToast } from "@/components/Toast";

const SUPER_ADMIN_EMAIL = "tirthochakroborty2@gmail.com";

type Section =
  | "overview"
  | "users"
  | "admins"
  | "listings"
  | "orders"
  | "disputes"
  | "payments"
  | "withdraws";

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

export default function SuperAdminDashboardV2() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [section, setSection] = useState<Section>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalListings: 0,
    pendingListings: 0,
    totalOrders: 0,
    completedOrders: 0,
    openDisputes: 0,
    pendingPayments: 0,
    pendingWithdraws: 0,
    totalRevenue: 0,
    totalBalance: 0,
  });

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // AUTH GUARD
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = "/admin/login";
      return;
    }
    if (profile) {
      if (
        profile.role !== "superadmin" ||
        profile.email !== SUPER_ADMIN_EMAIL
      ) {
        showToast("error", "Access denied", "শুধু Super Admin");
        window.location.href = "/admin/login";
      }
    }
  }, [user, profile, authLoading]);

  const fetchAll = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    const { data: profilesData } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    const users = profilesData || [];
    const admins = users.filter(
      (u) => u.role === "admin" || u.role === "superadmin"
    );
    const totalBalance = users.reduce(
      (s, u) => s + Number(u.coin_balance || 0),
      0
    );

    const [
      { count: lCount },
      { count: pLCount },
      { count: oCount },
      { count: cOCount },
      { count: dCount },
      { count: pPCount },
      { count: pWCount },
    ] = await Promise.all([
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
      (s, o) => s + Number(o.commission || 0),
      0
    );

    setStats({
      totalUsers: users.filter((u) => u.role === "user").length,
      totalAdmins: admins.length,
      totalListings: lCount || 0,
      pendingListings: pLCount || 0,
      totalOrders: oCount || 0,
      completedOrders: cOCount || 0,
      openDisputes: dCount || 0,
      pendingPayments: pPCount || 0,
      pendingWithdraws: pWCount || 0,
      totalRevenue,
      totalBalance,
    });

    const { data: roData } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6);
    setRecentOrders(roData || []);

    const { data: raData } = await supabase
      .from("wallet_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6);
    setRecentActivity(raData || []);

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    if (
      user &&
      profile?.role === "superadmin" &&
      profile?.email === SUPER_ADMIN_EMAIL
    ) {
      fetchAll();
    }
  }, [user, profile, refreshTrigger]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  const notificationCount =
    stats.pendingListings +
    stats.pendingPayments +
    stats.pendingWithdraws +
    stats.openDisputes;

  if (
    authLoading ||
    loading ||
    !profile ||
    profile.role !== "superadmin" ||
    profile.email !== SUPER_ADMIN_EMAIL
  ) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0b1120",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
        }}
      >
        লোড হচ্ছে...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b1120",
        color: "#f1f5f9",
        fontFamily: "inherit",
      }}
    >
      {/* ========== NAVBAR ========== */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "linear-gradient(90deg, #1e0b1e 0%, #0f0b1e 100%)",
          borderBottom: "1px solid rgba(236,72,153,0.3)",
          backdropFilter: "blur(20px)",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            background: "transparent",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            display: "none",
            padding: 4,
          }}
          className="sa-hamburger"
        >
          <Menu size={22} />
        </button>

        <Link
          href="/superadmin/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #EC4899, #F59E0B)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(236,72,153,0.5)",
            }}
          >
            <Crown size={20} color="#fff" />
          </div>
          <div className="sa-logo-text">
            <div
              style={{
                fontSize: "15px",
                fontWeight: 800,
                color: "#f1f5f9",
                lineHeight: 1.2,
              }}
            >
              Super Admin
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "#f472b6",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              SocialMarket
            </div>
          </div>
        </Link>

        <div style={{ flex: 1 }} />

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            style={{
              width: 38,
              height: 38,
              borderRadius: "10px",
              border: "1px solid rgba(236,72,153,0.2)",
              background: "rgba(0,0,0,0.3)",
              color: "#f472b6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              position: "relative",
            }}
          >
            <Bell size={18} />
            {notificationCount > 0 && (
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
                  border: "2px solid #0b1120",
                }}
              >
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div
              style={{
                position: "absolute",
                top: "46px",
                right: 0,
                width: 320,
                background: "#151d2e",
                border: "1.5px solid rgba(236,72,153,0.3)",
                borderRadius: "12px",
                padding: "8px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                zIndex: 200,
              }}
            >
              <div
                style={{
                  padding: "10px 12px",
                  borderBottom: "1px solid rgba(236,72,153,0.15)",
                  fontSize: "13px",
                  fontWeight: 800,
                  color: "#f1f5f9",
                }}
              >
                🔔 Notifications ({notificationCount})
              </div>
              <NotifItem
                icon={<Package size={14} />}
                label="Pending Listings"
                value={stats.pendingListings}
                color="#f59e0b"
                onClick={() => {
                  setSection("listings");
                  setNotificationsOpen(false);
                }}
              />
              <NotifItem
                icon={<Wallet size={14} />}
                label="Pending Payments"
                value={stats.pendingPayments}
                color="#8b5cf6"
                onClick={() => {
                  setSection("payments");
                  setNotificationsOpen(false);
                }}
              />
              <NotifItem
                icon={<ArrowDownToLine size={14} />}
                label="Pending Withdraws"
                value={stats.pendingWithdraws}
                color="#3b82f6"
                onClick={() => {
                  setSection("withdraws");
                  setNotificationsOpen(false);
                }}
              />
              <NotifItem
                icon={<AlertTriangle size={14} />}
                label="Open Disputes"
                value={stats.openDisputes}
                color="#ef4444"
                onClick={() => {
                  setSection("disputes");
                  setNotificationsOpen(false);
                }}
              />
            </div>
          )}
        </div>

        <button
          onClick={() => fetchAll(true)}
          disabled={refreshing}
          style={{
            width: 38,
            height: 38,
            borderRadius: "10px",
            border: "1px solid rgba(236,72,153,0.2)",
            background: "rgba(0,0,0,0.3)",
            color: "#f472b6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: refreshing ? "not-allowed" : "pointer",
          }}
        >
          <RefreshCw
            size={16}
            style={refreshing ? { animation: "spin 1s linear infinite" } : {}}
          />
        </button>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 10px 4px 4px",
              borderRadius: "10px",
              border: "1px solid rgba(236,72,153,0.2)",
              background: "rgba(0,0,0,0.3)",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #EC4899, #F59E0B)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "13px",
              }}
            >
              {profile?.name?.charAt(0).toUpperCase() || "S"}
            </div>
            <ChevronDown size={14} color="#f472b6" />
          </button>

          {profileMenuOpen && (
            <div
              style={{
                position: "absolute",
                top: "46px",
                right: 0,
                minWidth: 220,
                background: "#151d2e",
                border: "1.5px solid rgba(236,72,153,0.3)",
                borderRadius: "12px",
                padding: "8px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                zIndex: 200,
              }}
            >
              <div
                style={{
                  padding: "10px 12px",
                  borderBottom: "1px solid rgba(236,72,153,0.15)",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 800,
                    color: "#f1f5f9",
                  }}
                >
                  {profile?.name}
                </div>
                <div style={{ fontSize: "11px", color: "#f472b6" }}>
                  {profile?.email}
                </div>
              </div>
              <Link
                href="/"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#f1f5f9",
                }}
              >
                <Home size={14} /> সাইটে ফিরুন
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "none",
                  background: "transparent",
                  color: "#f87171",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <LogOut size={14} /> লগআউট
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ========== MAIN ========== */}
      <div style={{ display: "flex", minHeight: "calc(100vh - 63px)" }}>
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              zIndex: 98,
            }}
            className="sa-overlay"
          />
        )}

        <aside
          style={{
            width: 240,
            background: "linear-gradient(180deg, #151d2e 0%, #0f1826 100%)",
            borderRight: "1px solid rgba(236,72,153,0.15)",
            padding: "16px 10px",
            position: "sticky",
            top: 63,
            height: "calc(100vh - 63px)",
            overflowY: "auto",
            flexShrink: 0,
          }}
          className={`sa-sidebar ${sidebarOpen ? "open" : ""}`}
        >
          <div
            style={{
              padding: "0 8px",
              fontSize: "10px",
              color: "#64748b",
              fontWeight: 800,
              textTransform: "uppercase",
              marginBottom: "10px",
              letterSpacing: "0.5px",
            }}
          >
            Monitor
          </div>

          {[
            {
              key: "overview" as Section,
              icon: LayoutDashboard,
              label: "Overview",
            },
            {
              key: "users" as Section,
              icon: Users,
              label: "Users",
              badge: stats.totalUsers,
            },
            {
              key: "admins" as Section,
              icon: Crown,
              label: "Admins",
              badge: stats.totalAdmins,
            },
            {
              key: "listings" as Section,
              icon: Package,
              label: "Listings",
              badge: stats.pendingListings,
            },
            {
              key: "orders" as Section,
              icon: ShoppingCart,
              label: "Orders",
              badge: stats.totalOrders,
            },
            {
              key: "disputes" as Section,
              icon: AlertTriangle,
              label: "Disputes",
              badge: stats.openDisputes,
            },
            {
              key: "payments" as Section,
              icon: Wallet,
              label: "Payments",
              badge: stats.pendingPayments,
            },
            {
              key: "withdraws" as Section,
              icon: ArrowDownToLine,
              label: "Withdraws",
              badge: stats.pendingWithdraws,
            },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = section === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setSection(item.key);
                  setSidebarOpen(false);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  marginBottom: "2px",
                  border: "none",
                  background: isActive
                    ? "linear-gradient(135deg, #EC4899, #F59E0B)"
                    : "transparent",
                  color: isActive ? "#fff" : "#94a3b8",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                }}
              >
                <Icon size={16} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    style={{
                      minWidth: 20,
                      height: 20,
                      borderRadius: 10,
                      background: isActive
                        ? "rgba(255,255,255,0.3)"
                        : "rgba(239,68,68,0.15)",
                      color: isActive ? "#fff" : "#ef4444",
                      fontSize: "10px",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 6px",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div
            style={{
              height: 1,
              background: "rgba(236,72,153,0.15)",
              margin: "12px 6px",
            }}
          />

          <div
            style={{
              padding: "0 8px",
              fontSize: "10px",
              color: "#64748b",
              fontWeight: 800,
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            Quick Links
          </div>

          <Link
            href="/admin/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "10px",
              marginBottom: "2px",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 600,
              color: "#94a3b8",
            }}
          >
            <Shield size={16} />
            Admin Panel
          </Link>

          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "10px",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 600,
              color: "#94a3b8",
            }}
          >
            <Home size={16} />
            Main Site
          </Link>
        </aside>

        <div
          style={{ flex: 1, padding: "24px", minWidth: 0 }}
          className="sa-content"
        >
          {section === "overview" && (
            <OverviewSection
              stats={stats}
              recentOrders={recentOrders}
              recentActivity={recentActivity}
              onNavigate={setSection}
            />
          )}
          {section === "users" && (
            <UsersSection
              currentUserId={user?.id || ""}
              onViewDetails={setSelectedUserId}
              onRefresh={() => setRefreshTrigger((p) => p + 1)}
            />
          )}
          {section === "admins" && (
            <AdminsSection
              currentUserId={user?.id || ""}
              onViewDetails={setSelectedUserId}
              onRefresh={() => setRefreshTrigger((p) => p + 1)}
            />
          )}
          {section === "listings" && <ListingsSection />}
          {section === "orders" && <OrdersSection />}
          {section === "disputes" && <DisputesSection />}
          {section === "payments" && <PaymentsSection />}
          {section === "withdraws" && <WithdrawsSection />}
        </div>
      </div>

      {selectedUserId && (
        <UserDetailsModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onRefresh={() => {
            setRefreshTrigger((p) => p + 1);
          }}
        />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .sa-hamburger { display: flex !important; }
          .sa-logo-text { display: none; }
          .sa-sidebar {
            position: fixed !important;
            left: -260px;
            top: 63px !important;
            z-index: 99;
            transition: left 0.3s;
          }
          .sa-sidebar.open { left: 0 !important; }
          .sa-content { padding: 16px !important; }
        }
      `}</style>
    </div>
  );
}

/* ============ NOTIF ITEM ============ */
function NotifItem({
  icon,
  label,
  value,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 12px",
        borderRadius: "8px",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        textAlign: "left",
        color: "#f1f5f9",
        fontSize: "12px",
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "8px",
          background: `${color}20`,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <span style={{ flex: 1, fontWeight: 600 }}>{label}</span>
      <span
        style={{
          minWidth: 20,
          height: 20,
          borderRadius: 10,
          background:
            value > 0 ? "rgba(239,68,68,0.2)" : "rgba(148,163,184,0.1)",
          color: value > 0 ? "#ef4444" : "#64748b",
          fontSize: "10px",
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 6px",
        }}
      >
        {value}
      </span>
    </button>
  );
}

/* ============ OVERVIEW ============ */
function OverviewSection({
  stats,
  recentOrders,
  recentActivity,
  onNavigate,
}: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        <BigStat
          icon={<Users size={22} />}
          value={stats.totalUsers}
          label="Total Users"
          sub={`${stats.totalAdmins} admins`}
          color="#6C63FF"
          onClick={() => onNavigate("users")}
        />
        <BigStat
          icon={<Package size={22} />}
          value={stats.totalListings}
          label="Total Listings"
          sub={`${stats.pendingListings} pending`}
          color="#10b981"
          onClick={() => onNavigate("listings")}
        />
        <BigStat
          icon={<ShoppingCart size={22} />}
          value={stats.totalOrders}
          label="Total Orders"
          sub={`${stats.completedOrders} completed`}
          color="#f59e0b"
          onClick={() => onNavigate("orders")}
        />
        <BigStat
          icon={<DollarSign size={22} />}
          value={`৳${stats.totalRevenue.toLocaleString()}`}
          label="Revenue"
          sub="Commission থেকে"
          color="#EC4899"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "16px",
        }}
        className="money-3"
      >
        <GradientCard
          title="মোট Revenue"
          value={`৳${stats.totalRevenue.toLocaleString()}`}
          sub="Platform commission"
          icon={<TrendingUp size={20} />}
          gradient="linear-gradient(135deg, #10b981, #059669)"
        />
        <GradientCard
          title="User Balance"
          value={`৳${stats.totalBalance.toLocaleString()}`}
          sub="সব wallet-এ মোট"
          icon={<Wallet size={20} />}
          gradient="linear-gradient(135deg, #6C63FF, #5A52D5)"
        />
        <GradientCard
          title="Open Disputes"
          value={String(stats.openDisputes)}
          sub={stats.openDisputes > 0 ? "সতর্কতা প্রয়োজন" : "সব ঠিক আছে"}
          icon={<AlertTriangle size={20} />}
          gradient={
            stats.openDisputes > 0
              ? "linear-gradient(135deg, #ef4444, #dc2626)"
              : "linear-gradient(135deg, #EC4899, #F59E0B)"
          }
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px",
        }}
        className="alerts-4"
      >
        <AlertCard
          icon={<Package size={18} />}
          title="Listings"
          value={stats.pendingListings}
          color="#f59e0b"
          onClick={() => onNavigate("listings")}
        />
        <AlertCard
          icon={<Wallet size={18} />}
          title="Payments"
          value={stats.pendingPayments}
          color="#8b5cf6"
          onClick={() => onNavigate("payments")}
        />
        <AlertCard
          icon={<ArrowDownToLine size={18} />}
          title="Withdraws"
          value={stats.pendingWithdraws}
          color="#3b82f6"
          onClick={() => onNavigate("withdraws")}
        />
        <AlertCard
          icon={<AlertTriangle size={18} />}
          title="Disputes"
          value={stats.openDisputes}
          color="#ef4444"
          onClick={() => onNavigate("disputes")}
        />
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
        className="recent-2"
      >
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
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ShoppingCart size={16} color="#f59e0b" />
              <h3
                style={{ fontSize: "14px", fontWeight: 800, color: "#f1f5f9" }}
              >
                Recent Orders
              </h3>
            </div>
            <button
              onClick={() => onNavigate("orders")}
              style={{
                background: "transparent",
                border: "none",
                color: "#6C63FF",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              সব দেখুন <ArrowRight size={12} />
            </button>
          </div>
          {recentOrders.length === 0 ? (
            <EmptyMini />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {recentOrders.slice(0, 5).map((o: any) => (
                <div
                  key={o.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 10px",
                    background: "#0b1120",
                    borderRadius: "8px",
                    border: "1px solid #253049",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "6px",
                      background: "rgba(245,158,11,0.15)",
                      color: "#f59e0b",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <ShoppingCart size={12} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#f1f5f9",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      #{o.id.slice(0, 8)}
                    </div>
                    <div style={{ fontSize: "9px", color: "#64748b" }}>
                      {o.status}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      color: "#f59e0b",
                    }}
                  >
                    ৳{Number(o.amount).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <Activity size={16} color="#10b981" />
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#f1f5f9" }}>
              Recent Activity
            </h3>
          </div>
          {recentActivity.length === 0 ? (
            <EmptyMini />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {recentActivity.slice(0, 5).map((a: any) => (
                <div
                  key={a.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 10px",
                    background: "#0b1120",
                    borderRadius: "8px",
                    border: "1px solid #253049",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "6px",
                      background:
                        a.type === "credit"
                          ? "rgba(16,185,129,0.15)"
                          : "rgba(239,68,68,0.15)",
                      color: a.type === "credit" ? "#10b981" : "#ef4444",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {a.type === "credit" ? (
                      <TrendingUp size={12} />
                    ) : (
                      <TrendingUp size={12} style={{ transform: "rotate(180deg)" }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#f1f5f9",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {a.reason?.slice(0, 28) || "Transaction"}
                    </div>
                    <div style={{ fontSize: "9px", color: "#64748b" }}>
                      {a.status}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      color: a.type === "credit" ? "#10b981" : "#ef4444",
                    }}
                  >
                    {a.type === "credit" ? "+" : "-"}৳
                    {Number(a.amount).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .money-3 { grid-template-columns: 1fr !important; }
          .alerts-4 { grid-template-columns: 1fr 1fr !important; }
          .recent-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

/* ============ USERS SECTION (with View Details) ============ */
function UsersSection({
  currentUserId,
  onViewDetails,
  onRefresh,
}: {
  currentUserId: string;
  onViewDetails: (id: string) => void;
  onRefresh: () => void;
}) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin" | "superadmin">("all");
  const supabase = createClient();

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const toggleBan = async (u: any) => {
    if (u.id === currentUserId) return;
    setActionLoading(u.id);
    try {
      await supabase
        .from("profiles")
        .update({ is_banned: !u.is_banned })
        .eq("id", u.id);
      showToast("success", u.is_banned ? "Unbanned" : "Banned");
      fetchUsers();
      onRefresh();
    } catch (err: any) {
      showToast("error", "সমস্যা", err?.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <SectionHeader
        icon={<Users size={20} />}
        title="User Management"
        count={users.length}
      />

      <div
        style={{
          background: "#151d2e",
          border: "1.5px solid #253049",
          borderRadius: "12px",
          padding: "12px",
          marginBottom: "16px",
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            flex: "1 1 260px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 12px",
            background: "#0b1120",
            borderRadius: "8px",
            border: "1px solid #253049",
          }}
        >
          <Search size={14} color="#64748b" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name বা email খুঁজুন..."
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              color: "#f1f5f9",
              fontSize: "12px",
            }}
          />
        </div>
        {(["all", "user", "admin", "superadmin"] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            style={{
              padding: "6px 12px",
              background: roleFilter === r ? "#EC4899" : "#0b1120",
              color: roleFilter === r ? "#fff" : "#94a3b8",
              border: "1px solid #253049",
              borderRadius: "8px",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {r === "all" ? "সব" : r}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingBox />
      ) : filtered.length === 0 ? (
        <EmptyBox text="কোনো user পাওয়া যায়নি" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filtered.map((u) => (
            <div
              key={u.id}
              style={{
                background: "#151d2e",
                border: `1.5px solid ${
                  u.is_banned
                    ? "rgba(239,68,68,0.4)"
                    : u.role === "superadmin"
                    ? "rgba(236,72,153,0.4)"
                    : u.role === "admin"
                    ? "rgba(108,99,255,0.3)"
                    : "#253049"
                }`,
                borderRadius: "10px",
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
                opacity: u.is_banned ? 0.7 : 1,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background:
                    u.role === "superadmin"
                      ? "linear-gradient(135deg, #EC4899, #F59E0B)"
                      : "linear-gradient(135deg, #6C63FF, #EC4899)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "14px",
                  flexShrink: 0,
                }}
              >
                {(u.name || "U").charAt(0).toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 200 }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#f1f5f9",
                    display: "flex",
                    gap: "6px",
                    alignItems: "center",
                    flexWrap: "wrap",
                    marginBottom: "2px",
                  }}
                >
                  {u.name}
                  {u.role === "superadmin" && (
                    <span style={roleBadgeStyle("#EC4899")}>👑 SUPER</span>
                  )}
                  {u.role === "admin" && (
                    <span style={roleBadgeStyle("#6C63FF")}>🛡️ ADMIN</span>
                  )}
                  {u.is_banned && (
                    <span style={roleBadgeStyle("#ef4444")}>BANNED</span>
                  )}
                  {u.id === currentUserId && (
                    <span style={roleBadgeStyle("#10b981")}>YOU</span>
                  )}
                </div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>
                  {u.email}
                </div>
              </div>

              <div
                style={{
                  fontSize: "13px",
                  color: "#10b981",
                  fontWeight: 800,
                  minWidth: 80,
                  textAlign: "right",
                }}
              >
                ৳ {Number(u.coin_balance).toLocaleString()}
              </div>

              <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                <button
                  onClick={() => onViewDetails(u.id)}
                  style={{
                    padding: "6px 12px",
                    background: "rgba(108,99,255,0.15)",
                    color: "#6C63FF",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "10px",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Eye size={12} /> DETAILS
                </button>
                {u.id !== currentUserId && (
                  <button
                    onClick={() => toggleBan(u)}
                    disabled={actionLoading === u.id}
                    style={{
                      padding: "6px 12px",
                      background: u.is_banned
                        ? "rgba(16,185,129,0.15)"
                        : "rgba(239,68,68,0.15)",
                      color: u.is_banned ? "#10b981" : "#ef4444",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "10px",
                      fontWeight: 800,
                      cursor: actionLoading === u.id ? "not-allowed" : "pointer",
                    }}
                  >
                    {u.is_banned ? "UNBAN" : "BAN"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============ ADMINS SECTION (with Add/Remove/Delete) ============ */
function AdminsSection({
  currentUserId,
  onViewDetails,
  onRefresh,
}: {
  currentUserId: string;
  onViewDetails: (id: string) => void;
  onRefresh: () => void;
}) {
  const [admins, setAdmins] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    type: "demote" | "delete";
    user: any;
  } | null>(null);
  const supabase = createClient();

  const fetchAdmins = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    const list = data || [];
    setAllUsers(list);
    setAdmins(list.filter((u: any) => u.role === "admin" || u.role === "superadmin"));
    setLoading(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const filtered = admins.filter(
    (u) =>
      !search.trim() ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const promoteUser = async (targetUser: any) => {
    setActionLoading(targetUser.id);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", targetUser.id);
      if (error) throw error;
      showToast("success", `${targetUser.name} admin হয়েছেন`);
      setShowAddModal(false);
      fetchAdmins();
      onRefresh();
    } catch (err: any) {
      showToast("error", "সমস্যা", err?.message);
    } finally {
      setActionLoading(null);
    }
  };

  const demoteAdmin = async (targetUser: any) => {
    setActionLoading(targetUser.id);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: "user" })
        .eq("id", targetUser.id);
      if (error) throw error;
      showToast("success", `${targetUser.name} user হয়েছেন`);
      setConfirmModal(null);
      fetchAdmins();
      onRefresh();
    } catch (err: any) {
      showToast("error", "সমস্যা", err?.message);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (targetUser: any) => {
    setActionLoading(targetUser.id);
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", targetUser.id);
      if (error) throw error;
      showToast("success", "Deleted");
      setConfirmModal(null);
      fetchAdmins();
      onRefresh();
    } catch (err: any) {
      showToast("error", "সমস্যা", err?.message);
    } finally {
      setActionLoading(null);
    }
  };

  const availableUsers = allUsers.filter((u: any) => u.role === "user");

  return (
    <div>
      <SectionHeader
        icon={<Crown size={20} />}
        title="Admin Management"
        count={admins.length}
      />

      <div
        style={{
          background: "#151d2e",
          border: "1.5px solid #253049",
          borderRadius: "12px",
          padding: "12px",
          marginBottom: "16px",
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            flex: "1 1 260px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 12px",
            background: "#0b1120",
            borderRadius: "8px",
            border: "1px solid #253049",
          }}
        >
          <Search size={14} color="#64748b" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Admin খুঁজুন..."
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              color: "#f1f5f9",
              fontSize: "12px",
            }}
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: "8px 16px",
            background: "linear-gradient(135deg, #EC4899, #F59E0B)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 4px 14px rgba(236,72,153,0.4)",
          }}
        >
          <UserPlus size={14} /> নতুন Admin যোগ করুন
        </button>
      </div>

      {loading ? (
        <LoadingBox />
      ) : filtered.length === 0 ? (
        <EmptyBox text="কোনো admin নেই" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filtered.map((u) => {
            const isSelf = u.id === currentUserId;
            const isSuper = u.role === "superadmin";
            return (
              <div
                key={u.id}
                style={{
                  background: "#151d2e",
                  border: `1.5px solid ${
                    isSuper ? "rgba(236,72,153,0.4)" : "rgba(108,99,255,0.3)"
                  }`,
                  borderRadius: "10px",
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: isSuper
                      ? "linear-gradient(135deg, #EC4899, #F59E0B)"
                      : "linear-gradient(135deg, #6C63FF, #EC4899)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "14px",
                    flexShrink: 0,
                  }}
                >
                  {(u.name || "A").charAt(0).toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: 200 }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#f1f5f9",
                      display: "flex",
                      gap: "6px",
                      alignItems: "center",
                      flexWrap: "wrap",
                      marginBottom: "2px",
                    }}
                  >
                    {u.name}
                    {isSuper && (
                      <span style={roleBadgeStyle("#EC4899")}>👑 SUPER</span>
                    )}
                    {u.role === "admin" && (
                      <span style={roleBadgeStyle("#6C63FF")}>🛡️ ADMIN</span>
                    )}
                    {isSelf && <span style={roleBadgeStyle("#10b981")}>YOU</span>}
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>
                    {u.email}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "13px",
                    color: "#10b981",
                    fontWeight: 800,
                    minWidth: 80,
                    textAlign: "right",
                  }}
                >
                  ৳ {Number(u.coin_balance).toLocaleString()}
                </div>

                <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                  <button
                    onClick={() => onViewDetails(u.id)}
                    style={{
                      padding: "6px 12px",
                      background: "rgba(108,99,255,0.15)",
                      color: "#6C63FF",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "10px",
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Eye size={12} /> VIEW
                  </button>
                  {!isSuper && !isSelf && (
                    <>
                      <button
                        onClick={() => setConfirmModal({ type: "demote", user: u })}
                        disabled={actionLoading === u.id}
                        style={{
                          padding: "6px 12px",
                          background: "rgba(245,158,11,0.15)",
                          color: "#f59e0b",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "10px",
                          fontWeight: 800,
                          cursor: actionLoading === u.id ? "not-allowed" : "pointer",
                        }}
                      >
                        DEMOTE
                      </button>
                      <button
                        onClick={() => setConfirmModal({ type: "delete", user: u })}
                        disabled={actionLoading === u.id}
                        style={{
                          padding: "6px 10px",
                          background: "rgba(239,68,68,0.15)",
                          color: "#ef4444",
                          border: "none",
                          borderRadius: "6px",
                          cursor: actionLoading === u.id ? "not-allowed" : "pointer",
                          display: "flex",
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <AddAdminModal
          users={availableUsers}
          onClose={() => setShowAddModal(false)}
          onAdd={promoteUser}
          loading={!!actionLoading}
        />
      )}

      {confirmModal && (
        <ConfirmDialog
          title={
            confirmModal.type === "demote" ? "Demote to user?" : "Delete user?"
          }
          message={
            confirmModal.type === "demote"
              ? `${confirmModal.user.name}-কে user বানানো হবে।`
              : `${confirmModal.user.name}-কে delete করা হবে। এটা undo হবে না।`
          }
          loading={!!actionLoading}
          onCancel={() => setConfirmModal(null)}
          onConfirm={() => {
            if (confirmModal.type === "demote") demoteAdmin(confirmModal.user);
            else deleteUser(confirmModal.user);
          }}
        />
      )}
    </div>
  );
}

/* ============ LISTINGS SECTION ============ */
function ListingsSection() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const supabase = createClient();

  const fetchListings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });
    setListings(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const filtered =
    filter === "all" ? listings : listings.filter((l) => l.status === filter);

  const updateStatus = async (id: string, status: string) => {
    setActionLoading(id);
    try {
      await supabase.from("listings").update({ status }).eq("id", id);
      showToast("success", `${status}`);
      fetchListings();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <SectionHeader
        icon={<Package size={20} />}
        title="Listing Management"
        count={listings.length}
      />
      <div
        style={{
          display: "flex",
          gap: "6px",
          marginBottom: "16px",
          flexWrap: "wrap",
        }}
      >
        {["pending", "active", "sold", "rejected", "all"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "8px 14px",
              background: filter === f ? "#EC4899" : "#151d2e",
              color: filter === f ? "#fff" : "#94a3b8",
              border: "1px solid #253049",
              borderRadius: "8px",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {f} ({f === "all" ? listings.length : listings.filter((l) => l.status === f).length})
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingBox />
      ) : filtered.length === 0 ? (
        <EmptyBox text="কোনো listing নেই" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filtered.map((l) => (
            <div
              key={l.id}
              style={{
                background: "#151d2e",
                border: "1.5px solid #253049",
                borderRadius: "10px",
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: 200 }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#f1f5f9",
                    marginBottom: "2px",
                  }}
                >
                  {l.title}
                </div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>
                  ৳{Number(l.price).toLocaleString()} · {l.followers} followers
                </div>
              </div>
              <span
                style={{
                  fontSize: "9px",
                  padding: "3px 8px",
                  borderRadius: "4px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  background:
                    l.status === "active"
                      ? "rgba(16,185,129,0.15)"
                      : l.status === "pending"
                      ? "rgba(245,158,11,0.15)"
                      : "rgba(239,68,68,0.15)",
                  color:
                    l.status === "active"
                      ? "#10b981"
                      : l.status === "pending"
                      ? "#f59e0b"
                      : "#ef4444",
                }}
              >
                {l.status}
              </span>
              {l.status === "pending" && (
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={() => updateStatus(l.id, "active")}
                    disabled={actionLoading === l.id}
                    style={{
                      padding: "6px 12px",
                      background: "rgba(16,185,129,0.15)",
                      color: "#10b981",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "10px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    APPROVE
                  </button>
                  <button
                    onClick={() => updateStatus(l.id, "rejected")}
                    disabled={actionLoading === l.id}
                    style={{
                      padding: "6px 12px",
                      background: "rgba(239,68,68,0.15)",
                      color: "#ef4444",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "10px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    REJECT
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============ ORDERS SECTION ============ */
function OrdersSection() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      setOrders(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = orders.filter(
    (o) => !search.trim() || o.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <SectionHeader
        icon={<ShoppingCart size={20} />}
        title="Order Monitor"
        count={orders.length}
      />
      <SearchBar value={search} onChange={setSearch} placeholder="Order ID..." />
      {loading ? (
        <LoadingBox />
      ) : filtered.length === 0 ? (
        <EmptyBox text="কোনো order নেই" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filtered.map((o) => (
            <div
              key={o.id}
              style={{
                background: "#151d2e",
                border: "1.5px solid #253049",
                borderRadius: "10px",
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#f1f5f9",
                  }}
                >
                  #{o.id.slice(0, 8)}
                </div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>
                  {new Date(o.created_at).toLocaleString("bn-BD")}
                </div>
              </div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 800,
                  color: "#f59e0b",
                }}
              >
                ৳{Number(o.amount).toLocaleString()}
              </div>
              <span
                style={{
                  fontSize: "9px",
                  padding: "3px 8px",
                  borderRadius: "4px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  background:
                    o.status === "completed"
                      ? "rgba(16,185,129,0.15)"
                      : o.status === "disputed"
                      ? "rgba(239,68,68,0.15)"
                      : "rgba(59,130,246,0.15)",
                  color:
                    o.status === "completed"
                      ? "#10b981"
                      : o.status === "disputed"
                      ? "#ef4444"
                      : "#3b82f6",
                }}
              >
                {o.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============ DISPUTES ============ */
function DisputesSection() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("disputes")
        .select("*")
        .order("created_at", { ascending: false });
      setDisputes(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div>
      <SectionHeader
        icon={<AlertTriangle size={20} />}
        title="Disputes"
        count={disputes.filter((d) => d.status === "open").length}
      />
      {loading ? (
        <LoadingBox />
      ) : disputes.length === 0 ? (
        <EmptyBox text="কোনো dispute নেই ✅" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {disputes.map((d) => (
            <div
              key={d.id}
              style={{
                background: "#151d2e",
                border: `1.5px solid ${
                  d.status === "open" ? "rgba(239,68,68,0.4)" : "#253049"
                }`,
                borderLeft: `4px solid ${
                  d.status === "open" ? "#ef4444" : "#10b981"
                }`,
                borderRadius: "10px",
                padding: "14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <AlertTriangle size={16} color="#ef4444" />
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#f1f5f9",
                  }}
                >
                  Order #{d.order_id.slice(0, 8)}
                </span>
                <span
                  style={{
                    fontSize: "9px",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    background:
                      d.status === "open"
                        ? "rgba(239,68,68,0.2)"
                        : "rgba(16,185,129,0.2)",
                    color: d.status === "open" ? "#ef4444" : "#10b981",
                  }}
                >
                  {d.status}
                </span>
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#cbd5e1",
                  background: "#0b1120",
                  padding: "10px",
                  borderRadius: "6px",
                  lineHeight: 1.5,
                }}
              >
                {d.reason}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============ PAYMENTS ============ */
function PaymentsSection() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const supabase = createClient();

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("type", "credit")
      .not("payment_method", "is", null)
      .order("created_at", { ascending: false });
    setPayments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
  }, []);

  const approve = async (p: any) => {
    setActionLoading(p.id);
    try {
      const { data: prof } = await supabase
        .from("profiles")
        .select("coin_balance")
        .eq("id", p.user_id)
        .single();
      const newBal = Number(prof?.coin_balance || 0) + Number(p.amount);
      await supabase
        .from("profiles")
        .update({ coin_balance: newBal })
        .eq("id", p.user_id);
      await supabase
        .from("wallet_transactions")
        .update({ status: "completed" })
        .eq("id", p.id);
      showToast("success", `৳${p.amount} added`);
      fetch();
    } finally {
      setActionLoading(null);
    }
  };

  const reject = async (p: any) => {
    setActionLoading(p.id);
    try {
      await supabase
        .from("wallet_transactions")
        .update({ status: "failed" })
        .eq("id", p.id);
      showToast("success", "Rejected");
      fetch();
    } finally {
      setActionLoading(null);
    }
  };

  const pending = payments.filter((p) => p.status === "pending");

  return (
    <div>
      <SectionHeader
        icon={<Wallet size={20} />}
        title="Payment Requests"
        count={pending.length}
      />
      {loading ? (
        <LoadingBox />
      ) : payments.length === 0 ? (
        <EmptyBox text="কোনো payment request নেই" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {payments.map((p) => (
            <div
              key={p.id}
              style={{
                background: "#151d2e",
                border: `1.5px solid ${
                  p.status === "pending" ? "rgba(245,158,11,0.4)" : "#253049"
                }`,
                borderRadius: "10px",
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: 200 }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 800,
                    color: "#f1f5f9",
                  }}
                >
                  ৳{Number(p.amount).toLocaleString()}
                </div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>
                  {p.payment_method?.toUpperCase()} · {p.phone}
                </div>
                <div style={{ fontSize: "10px", color: "#94a3b8" }}>
                  TXN: {p.txn_ref}
                </div>
              </div>
              <span
                style={{
                  fontSize: "9px",
                  padding: "3px 8px",
                  borderRadius: "4px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  background:
                    p.status === "pending"
                      ? "rgba(245,158,11,0.15)"
                      : p.status === "completed"
                      ? "rgba(16,185,129,0.15)"
                      : "rgba(239,68,68,0.15)",
                  color:
                    p.status === "pending"
                      ? "#f59e0b"
                      : p.status === "completed"
                      ? "#10b981"
                      : "#ef4444",
                }}
              >
                {p.status}
              </span>
              {p.status === "pending" && (
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={() => approve(p)}
                    disabled={actionLoading === p.id}
                    style={{
                      padding: "6px 12px",
                      background: "rgba(16,185,129,0.15)",
                      color: "#10b981",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "10px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    APPROVE
                  </button>
                  <button
                    onClick={() => reject(p)}
                    disabled={actionLoading === p.id}
                    style={{
                      padding: "6px 12px",
                      background: "rgba(239,68,68,0.15)",
                      color: "#ef4444",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "10px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    REJECT
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============ WITHDRAWS ============ */
function WithdrawsSection() {
  const [withdraws, setWithdraws] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("type", "debit")
        .not("payment_method", "is", null)
        .order("created_at", { ascending: false });
      setWithdraws(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const pending = withdraws.filter((w) => w.status === "pending");

  return (
    <div>
      <SectionHeader
        icon={<ArrowDownToLine size={20} />}
        title="Withdraw Requests"
        count={pending.length}
      />
      {loading ? (
        <LoadingBox />
      ) : withdraws.length === 0 ? (
        <EmptyBox text="কোনো withdraw request নেই" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {withdraws.map((w) => (
            <div
              key={w.id}
              style={{
                background: "#151d2e",
                border: `1.5px solid ${
                  w.status === "pending" ? "rgba(59,130,246,0.4)" : "#253049"
                }`,
                borderRadius: "10px",
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 800,
                    color: "#f1f5f9",
                  }}
                >
                  ৳{Number(w.amount).toLocaleString()}
                </div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>
                  {w.payment_method?.toUpperCase()} · {w.phone}
                </div>
              </div>
              <span
                style={{
                  fontSize: "9px",
                  padding: "3px 8px",
                  borderRadius: "4px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  background:
                    w.status === "pending"
                      ? "rgba(245,158,11,0.15)"
                      : "rgba(16,185,129,0.15)",
                  color: w.status === "pending" ? "#f59e0b" : "#10b981",
                }}
              >
                {w.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============ USER DETAILS MODAL ============ */
function UserDetailsModal({
  userId,
  onClose,
  onRefresh,
}: {
  userId: string;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [user, setUser] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"listings" | "orders" | "wallet">(
    "listings"
  );
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data: userData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      setUser(userData);

      const { data: listingsData } = await supabase
        .from("listings")
        .select("*")
        .eq("seller_id", userId)
        .order("created_at", { ascending: false });
      setListings(listingsData || []);

      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order("created_at", { ascending: false });
      setOrders(ordersData || []);

      const { data: txData } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(30);
      setTransactions(txData || []);

      setLoading(false);
    };
    fetch();
  }, [userId]);

  const toggleBan = async () => {
    if (!user) return;
    setActionLoading(user.id);
    try {
      await supabase
        .from("profiles")
        .update({ is_banned: !user.is_banned })
        .eq("id", user.id);
      showToast("success", user.is_banned ? "Unbanned" : "Banned");
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setUser(data);
      onRefresh();
    } finally {
      setActionLoading(null);
    }
  };

  const changeRole = async (newRole: string) => {
    if (!user) return;
    setActionLoading(user.id);
    try {
      await supabase.from("profiles").update({ role: newRole }).eq("id", user.id);
      showToast("success", `Role → ${newRole}`);
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setUser(data);
      onRefresh();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
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
          background: "#151d2e",
          border: "1.5px solid rgba(236,72,153,0.3)",
          borderRadius: "18px",
          width: "100%",
          maxWidth: "700px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid rgba(236,72,153,0.15)",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            background: "linear-gradient(135deg, rgba(236,72,153,0.1), transparent)",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background:
                user?.role === "superadmin"
                  ? "linear-gradient(135deg, #EC4899, #F59E0B)"
                  : "linear-gradient(135deg, #6C63FF, #EC4899)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "22px",
              flexShrink: 0,
            }}
          >
            {(user?.name || "U").charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "18px",
                fontWeight: 800,
                color: "#f1f5f9",
                marginBottom: "2px",
              }}
            >
              {user?.name || "User"}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#94a3b8",
                display: "flex",
                gap: "6px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Mail size={11} /> {user?.email}
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "#64748b",
                display: "flex",
                gap: "6px",
                alignItems: "center",
                marginTop: "2px",
              }}
            >
              <Calendar size={10} /> Joined{" "}
              {user?.created_at &&
                new Date(user.created_at).toLocaleDateString("bn-BD")}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#94a3b8",
              cursor: "pointer",
              display: "flex",
              padding: 8,
              borderRadius: "8px",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Stats + Actions */}
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid rgba(236,72,153,0.15)",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "10px",
          }}
        >
          <MiniStat label="Role" value={user?.role || "user"} color="#EC4899" />
          <MiniStat
            label="Balance"
            value={`৳${Number(user?.coin_balance || 0).toLocaleString()}`}
            color="#10b981"
          />
          <MiniStat
            label="Status"
            value={user?.is_banned ? "Banned" : "Active"}
            color={user?.is_banned ? "#ef4444" : "#10b981"}
          />
          <MiniStat label="Listings" value={String(listings.length)} color="#6C63FF" />
        </div>

        {/* Action buttons */}
        <div
          style={{
            padding: "12px 20px",
            borderBottom: "1px solid rgba(236,72,153,0.15)",
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={toggleBan}
            disabled={!!actionLoading || user?.role === "superadmin"}
            style={{
              padding: "8px 14px",
              background: user?.is_banned
                ? "rgba(16,185,129,0.15)"
                : "rgba(239,68,68,0.15)",
              color: user?.is_banned ? "#10b981" : "#ef4444",
              border: "none",
              borderRadius: "8px",
              fontSize: "11px",
              fontWeight: 800,
              cursor:
                actionLoading || user?.role === "superadmin"
                  ? "not-allowed"
                  : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Ban size={12} /> {user?.is_banned ? "Unban" : "Ban User"}
          </button>
          {user?.role === "user" && (
            <button
              onClick={() => changeRole("admin")}
              disabled={!!actionLoading}
              style={{
                padding: "8px 14px",
                background: "rgba(108,99,255,0.15)",
                color: "#6C63FF",
                border: "none",
                borderRadius: "8px",
                fontSize: "11px",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Crown size={12} /> Make Admin
            </button>
          )}
          {user?.role === "admin" && (
            <button
              onClick={() => changeRole("user")}
              disabled={!!actionLoading}
              style={{
                padding: "8px 14px",
                background: "rgba(245,158,11,0.15)",
                color: "#f59e0b",
                border: "none",
                borderRadius: "8px",
                fontSize: "11px",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Shield size={12} /> Demote to User
            </button>
          )}
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid rgba(236,72,153,0.15)",
            padding: "0 20px",
          }}
        >
          {(["listings", "orders", "wallet"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                padding: "12px 16px",
                background: "transparent",
                border: "none",
                borderBottom:
                  activeTab === t
                    ? "2px solid #EC4899"
                    : "2px solid transparent",
                color: activeTab === t ? "#EC4899" : "#94a3b8",
                fontWeight: 700,
                fontSize: "12px",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {t} (
              {t === "listings"
                ? listings.length
                : t === "orders"
                ? orders.length
                : transactions.length}
              )
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {loading ? (
            <LoadingBox />
          ) : activeTab === "listings" ? (
            listings.length === 0 ? (
              <EmptyBox text="কোনো listing নেই" />
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                {listings.map((l) => (
                  <div
                    key={l.id}
                    style={{
                      background: "#0b1120",
                      border: "1px solid #253049",
                      borderRadius: "8px",
                      padding: "10px 12px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#f1f5f9",
                        marginBottom: "2px",
                      }}
                    >
                      {l.title}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#64748b",
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span>৳{Number(l.price).toLocaleString()}</span>
                      <span>·</span>
                      <span>{l.platform}</span>
                      <span>·</span>
                      <span style={{ textTransform: "capitalize" }}>{l.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : activeTab === "orders" ? (
            orders.length === 0 ? (
              <EmptyBox text="কোনো order নেই" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {orders.map((o) => (
                  <div
                    key={o.id}
                    style={{
                      background: "#0b1120",
                      border: "1px solid #253049",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#f1f5f9",
                        }}
                      >
                        #{o.id.slice(0, 8)}
                      </div>
                      <div style={{ fontSize: "9px", color: "#64748b" }}>
                        {o.buyer_id === userId ? "Buyer" : "Seller"}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 800,
                          color: "#f59e0b",
                        }}
                      >
                        ৳{Number(o.amount).toLocaleString()}
                      </div>
                      <div style={{ fontSize: "9px", color: "#64748b" }}>
                        {o.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : transactions.length === 0 ? (
            <EmptyBox text="কোনো transaction নেই" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {transactions.map((t) => (
                <div
                  key={t.id}
                  style={{
                    background: "#0b1120",
                    border: "1px solid #253049",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#f1f5f9",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t.reason}
                    </div>
                    <div style={{ fontSize: "9px", color: "#64748b" }}>
                      {t.status}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 800,
                      color: t.type === "credit" ? "#10b981" : "#ef4444",
                    }}
                  >
                    {t.type === "credit" ? "+" : "-"}৳
                    {Number(t.amount).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============ SHARED HELPERS ============ */
const roleBadgeStyle = (color: string): React.CSSProperties => ({
  fontSize: "9px",
  padding: "2px 6px",
  borderRadius: "4px",
  fontWeight: 800,
  background: `${color}20`,
  color,
});

function MiniStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      style={{
        background: `${color}10`,
        border: `1px solid ${color}30`,
        borderRadius: "8px",
        padding: "8px 10px",
      }}
    >
      <div style={{ fontSize: "9px", color: "#64748b", fontWeight: 700 }}>
        {label}
      </div>
      <div style={{ fontSize: "12px", fontWeight: 800, color }}>
        {value}
      </div>
    </div>
  );
}

function AddAdminModal({
  users,
  onClose,
  onAdd,
  loading,
}: {
  users: any[];
  onClose: () => void;
  onAdd: (u: any) => void;
  loading: boolean;
}) {
  const [search, setSearch] = useState("");
  const filtered = users.filter(
    (u) =>
      !search.trim() ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
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
          background: "#151d2e",
          border: "1.5px solid rgba(236,72,153,0.3)",
          borderRadius: "18px",
          padding: "24px",
          maxWidth: "520px",
          width: "100%",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <UserPlus size={20} color="#EC4899" />
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 800,
                color: "#f1f5f9",
              }}
            >
              নতুন Admin যোগ করুন
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#64748b",
              cursor: "pointer",
              display: "flex",
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 14px",
            background: "#0b1120",
            borderRadius: "10px",
            border: "1px solid rgba(236,72,153,0.2)",
            marginBottom: "16px",
          }}
        >
          <Search size={16} color="#64748b" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="User খুঁজুন..."
            autoFocus
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              color: "#f1f5f9",
              fontSize: "13px",
            }}
          />
        </div>

        <div style={{ flex: 1, overflowY: "auto", marginBottom: "16px" }}>
          {filtered.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              কোনো user পাওয়া যায়নি
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {filtered.map((u) => (
                <button
                  key={u.id}
                  onClick={() => onAdd(u)}
                  disabled={loading}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px",
                    background: "#0b1120",
                    border: "1px solid rgba(108,99,255,0.2)",
                    borderRadius: "8px",
                    cursor: loading ? "not-allowed" : "pointer",
                    textAlign: "left",
                    width: "100%",
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
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#f1f5f9",
                      }}
                    >
                      {u.name}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#64748b",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {u.email}
                    </div>
                  </div>
                  {loading ? (
                    <Loader2
                      size={16}
                      style={{
                        animation: "spin 1s linear infinite",
                        color: "#EC4899",
                      }}
                    />
                  ) : (
                    <Plus size={16} color="#EC4899" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          style={{
            padding: "12px",
            background: "rgba(255,255,255,0.05)",
            color: "#f1f5f9",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          বাতিল
        </button>
      </div>
    </div>
  );
}

function ConfirmDialog({
  title,
  message,
  loading,
  onCancel,
  onConfirm,
}: {
  title: string;
  message: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
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
          background: "#151d2e",
          border: "1.5px solid rgba(239,68,68,0.3)",
          borderRadius: "18px",
          padding: "28px",
          maxWidth: "440px",
          width: "100%",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "rgba(239,68,68,0.15)",
            color: "#ef4444",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <AlertTriangle size={28} />
        </div>
        <h2
          style={{
            fontSize: "18px",
            fontWeight: 800,
            color: "#f1f5f9",
            marginBottom: "8px",
            textAlign: "center",
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontSize: "13px",
            color: "#94a3b8",
            textAlign: "center",
            marginBottom: "24px",
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px",
              background: "#0b1120",
              color: "#f1f5f9",
              border: "1.5px solid #253049",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "13px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            বাতিল
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px",
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontWeight: 800,
              fontSize: "13px",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            {loading ? (
              <Loader2
                size={14}
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              "নিশ্চিত"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function BigStat({
  icon,
  value,
  label,
  sub,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  sub?: string;
  color: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#151d2e",
        border: "1.5px solid #253049",
        borderRadius: "14px",
        padding: "18px",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "12px",
          background: `${color}15`,
          color,
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
          fontSize: "24px",
          fontWeight: 800,
          color: "#f1f5f9",
          marginBottom: "2px",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: "12px", color: "#f1f5f9", fontWeight: 600 }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function GradientCard({
  title,
  value,
  sub,
  icon,
  gradient,
}: {
  title: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <div
      style={{
        background: gradient,
        borderRadius: "16px",
        padding: "22px",
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "10px",
            opacity: 0.9,
          }}
        >
          {icon}
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            {title}
          </div>
        </div>
        <div
          style={{
            fontSize: "26px",
            fontWeight: 800,
            letterSpacing: "-0.5px",
          }}
        >
          {value}
        </div>
        <div style={{ fontSize: "11px", opacity: 0.85, marginTop: "4px" }}>
          {sub}
        </div>
      </div>
    </div>
  );
}

function AlertCard({
  icon,
  title,
  value,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "#151d2e",
        border: `1.5px solid ${value > 0 ? `${color}50` : "#253049"}`,
        borderRadius: "12px",
        padding: "14px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        textAlign: "left",
        width: "100%",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "10px",
          background: `${color}15`,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {icon}
        {value > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              minWidth: 16,
              height: 16,
              borderRadius: 8,
              background: "#ef4444",
              color: "#fff",
              fontSize: "9px",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
              border: "2px solid #151d2e",
            }}
          >
            {value}
          </span>
        )}
      </div>
      <div>
        <div style={{ fontSize: "16px", fontWeight: 800, color: "#f1f5f9" }}>
          {value}
        </div>
        <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 600 }}>
          {title}
        </div>
      </div>
    </button>
  );
}

function SectionHeader({
  icon,
  title,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
}) {
  return (
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
          background: "rgba(236,72,153,0.15)",
          color: "#EC4899",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <h2
        style={{
          fontSize: "18px",
          fontWeight: 800,
          color: "#f1f5f9",
          flex: 1,
        }}
      >
        {title}
      </h2>
      <span
        style={{
          padding: "4px 10px",
          background: "rgba(236,72,153,0.15)",
          color: "#EC4899",
          borderRadius: "6px",
          fontSize: "11px",
          fontWeight: 800,
        }}
      >
        {count}
      </span>
    </div>
  );
}

function SearchBar({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 14px",
        background: "#151d2e",
        borderRadius: "10px",
        border: "1px solid #253049",
        marginBottom: "16px",
      }}
    >
      <Search size={15} color="#64748b" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          background: "transparent",
          color: "#f1f5f9",
          fontSize: "13px",
        }}
      />
    </div>
  );
}

function LoadingBox() {
  return (
    <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>
      লোড হচ্ছে...
    </div>
  );
}

function EmptyBox({ text }: { text: string }) {
  return (
    <div
      style={{
        background: "#151d2e",
        border: "1.5px dashed #253049",
        borderRadius: "12px",
        padding: "50px 20px",
        textAlign: "center",
        color: "#64748b",
        fontSize: "13px",
      }}
    >
      {text}
    </div>
  );
}

function EmptyMini() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "30px",
        color: "#64748b",
        fontSize: "12px",
      }}
    >
      ডাটা নেই
    </div>
  );
}
