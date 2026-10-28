"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Ban,
  CheckCircle,
  Trash2,
  Loader2,
  AlertCircle,
  X,
  Wallet,
  Crown,
  Shield,
  User,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth";
import { showToast } from "@/components/Toast";

interface Profile {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "superadmin";
  coin_balance: number;
  is_banned: boolean;
  created_at: string;
}

export default function AdminUsersContent() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [users, setUsers] = useState<Profile[]>([]);
  const [filtered, setFiltered] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin" | "superadmin">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    type: "ban" | "unban" | "delete";
    user: Profile;
  } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || (profile?.role !== "admin" && profile?.role !== "superadmin")) {
      router.push("/admin/login");
    }
  }, [user, profile, authLoading]);

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
    if (user && (profile?.role === "admin" || profile?.role === "superadmin")) {
      fetchUsers();
    }
  }, [user, profile]);

  useEffect(() => {
    let r = users;
    if (roleFilter !== "all") r = r.filter((u) => u.role === roleFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
      );
    }
    setFiltered(r);
  }, [users, search, roleFilter]);

  const handleBanToggle = async (targetUser: Profile) => {
    setActionLoading(targetUser.id);
    try {
      const newVal = !targetUser.is_banned;
      const { error } = await supabase
        .from("profiles")
        .update({ is_banned: newVal })
        .eq("id", targetUser.id);
      if (error) throw error;
      showToast("success", newVal ? "User banned" : "User unbanned");
      fetchUsers();
    } catch (err: any) {
      showToast("error", "সমস্যা", err?.message);
    } finally {
      setActionLoading(null);
      setConfirmModal(null);
    }
  };

  const handleDelete = async (targetUser: Profile) => {
    setActionLoading(targetUser.id);
    try {
      const { error } = await supabase.from("profiles").delete().eq("id", targetUser.id);
      if (error) throw error;
      showToast("success", "User deleted");
      fetchUsers();
    } catch (err: any) {
      showToast("error", "সমস্যা", err?.message);
    } finally {
      setActionLoading(null);
      setConfirmModal(null);
    }
  };

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin" || u.role === "superadmin").length,
    banned: users.filter((u) => u.is_banned).length,
  };

  return (
    <AdminLayout title="User Management" subtitle={`${users.length} জন user`}>
      {/* Stats */}
      <div
        className="users-stats"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <MiniStat icon={<Users size={18} />} value={stats.total} label="মোট Users" color="#6C63FF" />
        <MiniStat icon={<Shield size={18} />} value={stats.admins} label="Admins" color="#10b981" />
        <MiniStat icon={<Ban size={18} />} value={stats.banned} label="Banned" color="#ef4444" />
      </div>

      {/* Search + filter */}
      <div
        style={{
          background: "#151d2e",
          border: "1.5px solid #253049",
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
            border: "1px solid #253049",
          }}
        >
          <Search size={16} color="#64748b" />
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
              fontSize: "13px",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", display: "flex" }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {(["all", "user", "admin", "superadmin"] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            style={{
              padding: "8px 14px",
              background: roleFilter === r ? "#6C63FF" : "#0b1120",
              color: roleFilter === r ? "#fff" : "#94a3b8",
              border: "1px solid #253049",
              borderRadius: "10px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {r === "all" ? "সব" : r}
          </button>
        ))}
      </div>

      {/* Users list */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>লোড হচ্ছে...</div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            background: "#151d2e",
            border: "1.5px dashed #253049",
            borderRadius: "14px",
            padding: "60px 20px",
            textAlign: "center",
            color: "#64748b",
          }}
        >
          কোনো user পাওয়া যায়নি
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filtered.map((u) => (
            <UserRow
              key={u.id}
              user={u}
              isCurrentUser={u.id === user?.id}
              loading={actionLoading === u.id}
              onBanToggle={() => setConfirmModal({ type: u.is_banned ? "unban" : "ban", user: u })}
              onDelete={() => setConfirmModal({ type: "delete", user: u })}
            />
          ))}
        </div>
      )}

      {/* Confirm modal */}
      {confirmModal && (
        <ConfirmDialog
          title={
            confirmModal.type === "delete"
              ? "User delete করবেন?"
              : confirmModal.type === "ban"
              ? "User ban করবেন?"
              : "User unban করবেন?"
          }
          message={
            confirmModal.type === "delete"
              ? `"${confirmModal.user.name}" কে স্থায়ীভাবে delete করা হবে। এটা undo করা যাবে না।`
              : confirmModal.type === "ban"
              ? `"${confirmModal.user.name}" আর লগইন করতে পারবেন না।`
              : `"${confirmModal.user.name}" আবার লগইন করতে পারবেন।`
          }
          danger={confirmModal.type === "delete" || confirmModal.type === "ban"}
          loading={!!actionLoading}
          onCancel={() => setConfirmModal(null)}
          onConfirm={() => {
            if (confirmModal.type === "delete") handleDelete(confirmModal.user);
            else handleBanToggle(confirmModal.user);
          }}
        />
      )}
    </AdminLayout>
  );
}

function UserRow({
  user,
  isCurrentUser,
  loading,
  onBanToggle,
  onDelete,
}: {
  user: Profile;
  isCurrentUser: boolean;
  loading: boolean;
  onBanToggle: () => void;
  onDelete: () => void;
}) {
  const roleMeta = {
    user: { label: "User", color: "#10b981", icon: User },
    admin: { label: "Admin", color: "#6C63FF", icon: Shield },
    superadmin: { label: "Super", color: "#EC4899", icon: Crown },
  }[user.role];

  const Icon = roleMeta.icon;

  return (
    <div
      style={{
        background: "#151d2e",
        border: "1px solid #253049",
        borderRadius: "12px",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        flexWrap: "wrap",
        opacity: user.is_banned ? 0.6 : 1,
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6C63FF, #EC4899)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: "15px",
          flexShrink: 0,
        }}
      >
        {(user.name || "U").charAt(0).toUpperCase()}
      </div>

      <div style={{ flex: 1, minWidth: 180 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#f1f5f9" }}>
            {user.name || "Unnamed"}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "3px",
              padding: "1px 6px",
              borderRadius: "4px",
              background: `${roleMeta.color}20`,
              color: roleMeta.color,
              fontSize: "9px",
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            <Icon size={9} />
            {roleMeta.label}
          </span>
          {user.is_banned && (
            <span
              style={{
                padding: "1px 6px",
                borderRadius: "4px",
                background: "rgba(239,68,68,0.15)",
                color: "#ef4444",
                fontSize: "9px",
                fontWeight: 800,
                textTransform: "uppercase",
              }}
            >
              Banned
            </span>
          )}
        </div>
        <div style={{ fontSize: "12px", color: "#94a3b8" }}>{user.email}</div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          fontSize: "12px",
          color: "#94a3b8",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Wallet size={12} />
          <span style={{ fontWeight: 700, color: "#10b981" }}>
            ৳ {Number(user.coin_balance).toLocaleString()}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
        <button
          onClick={onBanToggle}
          disabled={loading || isCurrentUser}
          title={user.is_banned ? "Unban" : "Ban"}
          style={{
            padding: "8px",
            background: user.is_banned ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
            color: user.is_banned ? "#10b981" : "#f59e0b",
            border: "none",
            borderRadius: "8px",
            cursor: loading || isCurrentUser ? "not-allowed" : "pointer",
            display: "flex",
            opacity: isCurrentUser ? 0.4 : 1,
          }}
        >
          {loading ? (
            <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
          ) : user.is_banned ? (
            <CheckCircle size={14} />
          ) : (
            <Ban size={14} />
          )}
        </button>
        <button
          onClick={onDelete}
          disabled={loading || isCurrentUser}
          title="Delete"
          style={{
            padding: "8px",
            background: "rgba(239,68,68,0.15)",
            color: "#ef4444",
            border: "none",
            borderRadius: "8px",
            cursor: loading || isCurrentUser ? "not-allowed" : "pointer",
            display: "flex",
            opacity: isCurrentUser ? 0.4 : 1,
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function MiniStat({ icon, value, label, color }: { icon: React.ReactNode; value: number; label: string; color: string }) {
  return (
    <div
      style={{
        background: "#151d2e",
        border: "1.5px solid #253049",
        borderRadius: "12px",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
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
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "18px", fontWeight: 800, color: "#f1f5f9" }}>{value}</div>
        <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 600 }}>{label}</div>
      </div>
    </div>
  );
}

function ConfirmDialog({
  title,
  message,
  danger,
  loading,
  onCancel,
  onConfirm,
}: {
  title: string;
  message: string;
  danger: boolean;
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
        background: "rgba(0,0,0,0.7)",
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
          border: "1.5px solid #253049",
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
            background: danger ? "rgba(239,68,68,0.15)" : "rgba(108,99,255,0.15)",
            color: danger ? "#ef4444" : "#6C63FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <AlertCircle size={28} />
        </div>
        <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#f1f5f9", marginBottom: "8px", textAlign: "center" }}>
          {title}
        </h2>
        <p style={{ fontSize: "13px", color: "#94a3b8", textAlign: "center", marginBottom: "24px", lineHeight: 1.5 }}>
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
              background: danger ? "#ef4444" : "linear-gradient(135deg,#6C63FF,#5A52D5)",
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
              <>
                <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                প্রসেসিং...
              </>
            ) : (
              "নিশ্চিত করুন"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
