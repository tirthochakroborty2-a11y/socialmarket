"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Crown,
  Users,
  Shield,
  Wallet,
  TrendingUp,
  Search,
  Plus,
  Loader2,
  AlertCircle,
  X,
  UserPlus,
  Trash2,
  LayoutDashboard,
  Package,
  ShoppingCart,
  ArrowRight,
  LogOut,
  Home,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth";
import { showToast } from "@/components/Toast";

const SUPER_ADMIN_EMAIL = "tirthochakroborty2@gmail.com";

interface Profile {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "superadmin";
  coin_balance: number;
  is_banned: boolean;
  created_at: string;
}

type Tab = "overview" | "admins";

export default function SuperAdminDashboardContent() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [tab, setTab] = useState<Tab>("overview");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filtered, setFiltered] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    type: "promote" | "demote" | "delete";
    user: Profile;
  } | null>(null);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalListings: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalBalance: 0,
  });

  // ✅ Strict auth guard
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

  const fetchAll = async () => {
    setLoading(true);

    const { data: profilesData } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    setProfiles(profilesData || []);

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
      { count: oCount },
      { data: completedOrders },
    ] = await Promise.all([
      supabase.from("listings").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("commission").eq("status", "completed"),
    ]);

    const totalRevenue = (completedOrders || []).reduce(
      (s, o) => s + Number(o.commission || 0),
      0
    );

    setStats({
      totalUsers: users.filter((u) => u.role === "user").length,
      totalAdmins: admins.length,
      totalListings: lCount || 0,
      totalOrders: oCount || 0,
      totalRevenue,
      totalBalance,
    });

    setLoading(false);
  };

  useEffect(() => {
    if (
      user &&
      profile?.role === "superadmin" &&
      profile?.email === SUPER_ADMIN_EMAIL
    ) {
      fetchAll();
    }
  }, [user, profile]);

  useEffect(() => {
    let r = profiles;
    if (tab === "admins")
      r = r.filter((u) => u.role === "admin" || u.role === "superadmin");
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
      );
    }
    setFiltered(r);
  }, [profiles, search, tab]);

  const promoteToAdmin = async (targetUser: Profile) => {
    setActionLoading(targetUser.id);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", targetUser.id);
      if (error) throw error;
      showToast("success", `${targetUser.name} admin হয়েছেন`);
      fetchAll();
    } catch (err: any) {
      showToast("error", "সমস্যা", err?.message);
    } finally {
      setActionLoading(null);
      setConfirmModal(null);
      setShowAddAdminModal(false);
    }
  };

  const demoteToUser = async (targetUser: Profile) => {
    setActionLoading(targetUser.id);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: "user" })
        .eq("id", targetUser.id);
      if (error) throw error;
      showToast("success", `${targetUser.name} user হয়েছেন`);
      fetchAll();
    } catch (err: any) {
      showToast("error", "সমস্যা", err?.message);
    } finally {
      setActionLoading(null);
      setConfirmModal(null);
    }
  };

  const deleteUser = async (targetUser: Profile) => {
    setActionLoading(targetUser.id);
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", targetUser.id);
      if (error) throw error;
      showToast("success", "User deleted");
      fetchAll();
    } catch (err: any) {
      showToast("error", "সমস্যা", err?.message);
    } finally {
      setActionLoading(null);
      setConfirmModal(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

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

  const adminUsers = profiles.filter(
    (u) => u.role === "admin" || u.role === "superadmin"
  );
  const regularUsers = profiles.filter(
    (u) => u.role === "user" && !u.is_banned
  );

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#0b1120",
        color: "#f1f5f9",
        fontFamily: "inherit",
      }}
    >
      {/* ===== SIDEBAR ===== */}
      <aside
        style={{
          width: 260,
          background: "linear-gradient(180deg, #1e0b1e, #0f0b1e)",
          borderRight: "1px solid rgba(236,72,153,0.2)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
        }}
        className="super-sidebar"
      >
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid rgba(236,72,153,0.2)",
          }}
        >
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
            <div>
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
                Root Access
              </div>
            </div>
          </Link>
        </div>

        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid rgba(236,72,153,0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #EC4899, #F59E0B)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              {profile?.name?.charAt(0).toUpperCase() || "S"}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
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
                {profile?.name}
              </div>
              <div style={{ fontSize: "10px", color: "#f472b6" }}>
                {profile?.email}
              </div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          <NavItem
            href="/superadmin/dashboard"
            icon={LayoutDashboard}
            label="Dashboard"
            active
          />
          <div
            style={{
              height: 1,
              background: "rgba(236,72,153,0.15)",
              margin: "10px 6px",
            }}
          />
          <div
            style={{
              fontSize: "10px",
              color: "#64748b",
              fontWeight: 700,
              padding: "6px 12px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Admin Panel
          </div>
          <NavItem href="/admin/dashboard" icon={Shield} label="Admin Home" />
          <NavItem href="/admin/users" icon={Users} label="Users" />
          <NavItem href="/admin/listings" icon={Package} label="Listings" />
          <NavItem href="/admin/orders" icon={ShoppingCart} label="Orders" />
          <NavItem href="/admin/payments" icon={Wallet} label="Payments" />
          <NavItem href="/admin/withdraws" icon={TrendingUp} label="Withdraws" />
        </nav>

        <div
          style={{
            padding: "12px 10px",
            borderTop: "1px solid rgba(236,72,153,0.2)",
          }}
        >
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
              marginBottom: "4px",
            }}
          >
            <Home size={16} />
            সাইটে ফিরুন
          </Link>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "10px",
              border: "none",
              background: "rgba(239,68,68,0.1)",
              color: "#f87171",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <LogOut size={16} />
            লগআউট
          </button>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <div
        style={{ flex: 1, marginLeft: 260, minHeight: "100vh" }}
        className="super-main"
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            background: "rgba(11,17,32,0.95)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(236,72,153,0.2)",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "2px",
              }}
            >
              <Crown size={18} color="#EC4899" />
              <h1
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  color: "#f1f5f9",
                }}
              >
                Super Admin Dashboard
              </h1>
            </div>
            <p style={{ fontSize: "12px", color: "#f472b6" }}>
              System-wide control panel
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            {(["overview", "admins"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: "10px 18px",
                  background:
                    tab === t
                      ? "linear-gradient(135deg, #EC4899, #F59E0B)"
                      : "rgba(236,72,153,0.1)",
                  color: tab === t ? "#fff" : "#f472b6",
                  border: "1px solid rgba(236,72,153,0.3)",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {t === "overview" ? "Overview" : "Admin Management"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: "24px" }}>
          {tab === "overview" && (
            <OverviewTab stats={stats} adminUsers={adminUsers} />
          )}
          {tab === "admins" && (
            <AdminsTab
              profiles={filtered}
              loading={loading}
              search={search}
              setSearch={setSearch}
              actionLoading={actionLoading}
              currentUserId={user?.id}
              onPromote={() => setShowAddAdminModal(true)}
              onDemote={(u: Profile) =>
                setConfirmModal({ type: "demote", user: u })
              }
              onDelete={(u: Profile) =>
                setConfirmModal({ type: "delete", user: u })
              }
            />
          )}
        </div>
      </div>

      {showAddAdminModal && (
        <AddAdminModal
          users={regularUsers}
          onClose={() => setShowAddAdminModal(false)}
          onAdd={(u: Profile) => promoteToAdmin(u)}
          loading={!!actionLoading}
        />
      )}

      {confirmModal && (
        <ConfirmDialog
          title={
            confirmModal.type === "demote"
              ? "Demote to user?"
              : "Delete user?"
          }
          message={
            confirmModal.type === "demote"
              ? `${confirmModal.user.name}-কে user বানানো হবে। Admin access থাকবে না।`
              : `${confirmModal.user.name}-কে সম্পূর্ণ delete করা হবে। এটা undo হবে না।`
          }
          loading={!!actionLoading}
          onCancel={() => setConfirmModal(null)}
          onConfirm={() => {
            if (confirmModal.type === "demote")
              demoteToUser(confirmModal.user);
            else deleteUser(confirmModal.user);
          }}
        />
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 900px) {
          .super-sidebar { left: -260px !important; }
          .super-main { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: any;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
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
        color: active ? "#fff" : "#94a3b8",
        background: active
          ? "linear-gradient(135deg, #EC4899, #F59E0B)"
          : "transparent",
      }}
    >
      <Icon size={16} />
      {label}
    </Link>
  );
}

function OverviewTab({
  stats,
  adminUsers,
}: {
  stats: any;
  adminUsers: Profile[];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        <StatCard
          icon={<Users size={20} />}
          value={stats.totalUsers}
          label="মোট Users"
          color="#6C63FF"
        />
        <StatCard
          icon={<Shield size={20} />}
          value={stats.totalAdmins}
          label="Admins"
          color="#EC4899"
        />
        <StatCard
          icon={<Package size={20} />}
          value={stats.totalListings}
          label="Listings"
          color="#10b981"
        />
        <StatCard
          icon={<ShoppingCart size={20} />}
          value={stats.totalOrders}
          label="Orders"
          color="#f59e0b"
        />
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
        className="money-2"
      >
        <div
          style={{
            background: "linear-gradient(135deg, #EC4899, #F59E0B)",
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
            <div
              style={{
                fontSize: "12px",
                opacity: 0.9,
                marginBottom: "6px",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              মোট Revenue (Commission)
            </div>
            <div
              style={{
                fontSize: "32px",
                fontWeight: 800,
                letterSpacing: "-1px",
              }}
            >
              ৳ {stats.totalRevenue.toLocaleString()}
            </div>
            <div
              style={{ fontSize: "12px", opacity: 0.85, marginTop: "6px" }}
            >
              Completed orders থেকে
            </div>
          </div>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, #6C63FF, #5A52D5)",
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
            <div
              style={{
                fontSize: "12px",
                opacity: 0.9,
                marginBottom: "6px",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              মোট User Balance
            </div>
            <div
              style={{
                fontSize: "32px",
                fontWeight: 800,
                letterSpacing: "-1px",
              }}
            >
              ৳ {stats.totalBalance.toLocaleString()}
            </div>
            <div
              style={{ fontSize: "12px", opacity: 0.85, marginTop: "6px" }}
            >
              সব wallet-এ মোট
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          background: "#151d2e",
          border: "1.5px solid rgba(236,72,153,0.25)",
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
          <div
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Crown size={18} color="#EC4899" />
            <h3
              style={{
                fontSize: "15px",
                fontWeight: 800,
                color: "#f1f5f9",
              }}
            >
              Active Admins
            </h3>
          </div>
          <span
            style={{ fontSize: "11px", color: "#f472b6", fontWeight: 700 }}
          >
            {adminUsers.length} জন
          </span>
        </div>

        {adminUsers.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "30px",
              color: "#64748b",
              fontSize: "13px",
            }}
          >
            কোনো admin নেই
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          >
            {adminUsers.map((u) => (
              <div
                key={u.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px",
                  background: "#0b1120",
                  borderRadius: "8px",
                  border: "1px solid rgba(236,72,153,0.15)",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background:
                      u.role === "superadmin"
                        ? "linear-gradient(135deg, #EC4899, #F59E0B)"
                        : "linear-gradient(135deg, #6C63FF, #EC4899)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "12px",
                  }}
                >
                  {u.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#f1f5f9",
                    }}
                  >
                    {u.name}
                  </div>
                  <div style={{ fontSize: "10px", color: "#64748b" }}>
                    {u.email}
                  </div>
                </div>
                {u.role === "superadmin" && (
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: "4px",
                      background: "rgba(236,72,153,0.2)",
                      color: "#EC4899",
                      textTransform: "uppercase",
                    }}
                  >
                    Super
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminsTab({
  profiles,
  loading,
  search,
  setSearch,
  actionLoading,
  currentUserId,
  onPromote,
  onDemote,
  onDelete,
}: any) {
  return (
    <div>
      <div
        style={{
          background: "#151d2e",
          border: "1.5px solid rgba(236,72,153,0.25)",
          borderRadius: "14px",
          padding: "14px",
          marginBottom: "16px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            flex: "1 1 260px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 14px",
            background: "#0b1120",
            borderRadius: "10px",
            border: "1px solid rgba(236,72,153,0.2)",
          }}
        >
          <Search size={16} color="#64748b" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Admin name বা email..."
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
        <button
          onClick={onPromote}
          style={{
            padding: "10px 20px",
            background: "linear-gradient(135deg, #EC4899, #F59E0B)",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 4px 14px rgba(236,72,153,0.4)",
          }}
        >
          <UserPlus size={14} />
          নতুন Admin যোগ করুন
        </button>
      </div>

      {loading ? (
        <div
          style={{ textAlign: "center", padding: "60px", color: "#64748b" }}
        >
          লোড হচ্ছে...
        </div>
      ) : profiles.length === 0 ? (
        <div
          style={{
            background: "#151d2e",
            border: "1.5px dashed rgba(236,72,153,0.2)",
            borderRadius: "14px",
            padding: "60px 20px",
            textAlign: "center",
            color: "#64748b",
          }}
        >
          কোনো admin পাওয়া যায়নি
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {profiles.map((u: Profile) => {
            const isSelf = u.id === currentUserId;
            const isSuperAdmin = u.role === "superadmin";
            const isLoad = actionLoading === u.id;

            return (
              <div
                key={u.id}
                style={{
                  background: "#151d2e",
                  border: `1.5px solid ${
                    isSuperAdmin
                      ? "rgba(236,72,153,0.4)"
                      : "rgba(108,99,255,0.3)"
                  }`,
                  borderRadius: "12px",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: isSuperAdmin
                      ? "linear-gradient(135deg, #EC4899, #F59E0B)"
                      : "linear-gradient(135deg, #6C63FF, #EC4899)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "16px",
                    flexShrink: 0,
                  }}
                >
                  {u.name?.charAt(0).toUpperCase() || "A"}
                </div>

                <div style={{ flex: 1, minWidth: 180 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginBottom: "2px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#f1f5f9",
                      }}
                    >
                      {u.name || "Unnamed"}
                    </span>
                    {isSuperAdmin ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px",
                          padding: "1px 8px",
                          borderRadius: "4px",
                          background: "rgba(236,72,153,0.2)",
                          color: "#EC4899",
                          fontSize: "9px",
                          fontWeight: 800,
                          textTransform: "uppercase",
                        }}
                      >
                        <Crown size={9} /> Super
                      </span>
                    ) : (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px",
                          padding: "1px 8px",
                          borderRadius: "4px",
                          background: "rgba(108,99,255,0.2)",
                          color: "#6C63FF",
                          fontSize: "9px",
                          fontWeight: 800,
                          textTransform: "uppercase",
                        }}
                      >
                        <Shield size={9} /> Admin
                      </span>
                    )}
                    {isSelf && (
                      <span
                        style={{
                          fontSize: "9px",
                          color: "#10b981",
                          fontWeight: 800,
                        }}
                      >
                        YOU
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    {u.email}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    color: "#10b981",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  ৳ {Number(u.coin_balance).toLocaleString()}
                </div>

                {!isSuperAdmin && !isSelf && (
                  <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                    <button
                      onClick={() => onDemote(u)}
                      disabled={isLoad}
                      title="Demote to user"
                      style={{
                        padding: "8px 12px",
                        background: "rgba(245,158,11,0.15)",
                        color: "#f59e0b",
                        border: "1px solid rgba(245,158,11,0.3)",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: 700,
                        cursor: isLoad ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {isLoad ? (
                        <Loader2
                          size={12}
                          style={{ animation: "spin 1s linear infinite" }}
                        />
                      ) : (
                        <XCircle size={12} />
                      )}
                      Demote
                    </button>
                    <button
                      onClick={() => onDelete(u)}
                      disabled={isLoad}
                      title="Delete"
                      style={{
                        padding: "8px",
                        background: "rgba(239,68,68,0.15)",
                        color: "#ef4444",
                        border: "none",
                        borderRadius: "8px",
                        cursor: isLoad ? "not-allowed" : "pointer",
                        display: "flex",
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AddAdminModal({
  users,
  onClose,
  onAdd,
  loading,
}: {
  users: Profile[];
  onClose: () => void;
  onAdd: (u: Profile) => void;
  loading: boolean;
}) {
  const [search, setSearch] = useState("");
  const filtered = users.filter(
    (u) =>
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
          <div
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
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

        <div
          style={{ flex: 1, overflowY: "auto", marginBottom: "16px" }}
        >
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
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
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
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #6C63FF, #EC4899)",
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
          <AlertCircle size={28} />
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

function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <div
      style={{
        background: "#151d2e",
        border: "1.5px solid #253049",
        borderRadius: "14px",
        padding: "18px",
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
    </div>
  );
}
