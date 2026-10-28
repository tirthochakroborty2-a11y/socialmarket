"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ArrowDownToLine,
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  X,
  Copy,
  Check,
  Phone,
  User,
  Smartphone,
  Wallet,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth";
import { showToast } from "@/components/Toast";

interface Withdraw {
  id: string;
  user_id: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  phone: string | null;
  payment_method: string | null;
  created_at: string;
}

interface Profile {
  id: string;
  name: string;
  email: string;
  coin_balance: number;
}

type StatusFilter = "pending" | "completed" | "failed" | "all";

export default function AdminWithdrawsContent() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [withdraws, setWithdraws] = useState<Withdraw[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [filtered, setFiltered] = useState<Withdraw[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    type: "approve" | "reject";
    withdraw: Withdraw;
  } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || (profile?.role !== "admin" && profile?.role !== "superadmin")) {
      router.push("/admin/login");
    }
  }, [user, profile, authLoading]);

  const fetchWithdraws = async () => {
    setLoading(true);

    // Debit transactions with payment_method = withdrawal
    const { data } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("type", "debit")
      .not("payment_method", "is", null)
      .not("phone", "is", null)
      .order("created_at", { ascending: false });

    const withdrawData = data || [];
    setWithdraws(withdrawData);

    const userIds = [...new Set(withdrawData.map((w) => w.user_id))];
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, name, email, coin_balance")
        .in("id", userIds);

      const map: Record<string, Profile> = {};
      (profilesData || []).forEach((p: any) => {
        map[p.id] = p;
      });
      setProfiles(map);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (user && (profile?.role === "admin" || profile?.role === "superadmin")) {
      fetchWithdraws();
    }
  }, [user, profile]);

  useEffect(() => {
    let r = withdraws;
    if (statusFilter !== "all") r = r.filter((w) => w.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((w) => {
        const prof = profiles[w.user_id];
        return (
          w.id.toLowerCase().includes(q) ||
          w.phone?.includes(q) ||
          prof?.name?.toLowerCase().includes(q) ||
          prof?.email?.toLowerCase().includes(q)
        );
      });
    }
    setFiltered(r);
  }, [withdraws, search, statusFilter, profiles]);

  // Approve = mark as completed (money already deducted from user balance)
  const handleApprove = async (w: Withdraw) => {
    setActionLoading(w.id);
    try {
      await supabase
        .from("wallet_transactions")
        .update({ status: "completed" })
        .eq("id", w.id);

      showToast("success", "Approved!", `৳${w.amount} পাঠান ${w.phone}-এ`);
      fetchWithdraws();
    } catch (err: any) {
      showToast("error", "সমস্যা", err?.message);
    } finally {
      setActionLoading(null);
      setConfirmModal(null);
    }
  };

  // Reject = refund the money (add back to user balance)
  const handleReject = async (w: Withdraw) => {
    setActionLoading(w.id);
    try {
      // Refund to user
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("coin_balance")
        .eq("id", w.user_id)
        .single();

      const newBalance = Number(userProfile?.coin_balance || 0) + Number(w.amount);
      await supabase.from("profiles").update({ coin_balance: newBalance }).eq("id", w.user_id);

      await supabase.from("wallet_transactions").update({ status: "failed" }).eq("id", w.id);

      // Add refund transaction
      await supabase.from("wallet_transactions").insert({
        user_id: w.user_id,
        type: "credit",
        amount: w.amount,
        reason: `Withdraw rejected - Refund #${w.id.slice(0, 8)}`,
        status: "completed",
      });

      showToast("success", "Rejected + refunded");
      fetchWithdraws();
    } catch (err: any) {
      showToast("error", "সমস্যা", err?.message);
    } finally {
      setActionLoading(null);
      setConfirmModal(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const stats = {
    pending: withdraws.filter((w) => w.status === "pending").length,
    completed: withdraws.filter((w) => w.status === "completed").length,
    totalPaid: withdraws
      .filter((w) => w.status === "completed")
      .reduce((s, w) => s + Number(w.amount), 0),
    totalPending: withdraws
      .filter((w) => w.status === "pending")
      .reduce((s, w) => s + Number(w.amount), 0),
  };

  return (
    <AdminLayout title="Withdrawal Requests" subtitle={`${stats.pending}টি pending withdraw`}>
      {/* Stats */}
      <div
        className="withdraws-stats"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <MiniStat icon={<AlertCircle size={18} />} value={stats.pending} label="Pending" color="#f59e0b" />
        <MiniStat
          icon={<Wallet size={18} />}
          value={`৳${stats.totalPending.toLocaleString()}`}
          label="Pending Amount"
          color="#f97316"
        />
        <MiniStat icon={<CheckCircle size={18} />} value={stats.completed} label="Completed" color="#10b981" />
        <MiniStat
          icon={<ArrowDownToLine size={18} />}
          value={`৳${stats.totalPaid.toLocaleString()}`}
          label="Total Paid Out"
          color="#6C63FF"
        />
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
            placeholder="Phone, name বা email..."
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

        {(["pending", "completed", "failed", "all"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: "8px 14px",
              background: statusFilter === s ? "#6C63FF" : "#0b1120",
              color: statusFilter === s ? "#fff" : "#94a3b8",
              border: "1px solid #253049",
              borderRadius: "10px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {s === "all" ? "সব" : s}
          </button>
        ))}
      </div>

      {/* Withdraws list */}
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
          কোনো withdraw request নেই
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map((w) => {
            const prof = profiles[w.user_id];
            return (
              <div
                key={w.id}
                style={{
                  background: "#151d2e",
                  border: "1px solid #253049",
                  borderLeft:
                    w.status === "pending"
                      ? "4px solid #f59e0b"
                      : w.status === "completed"
                      ? "4px solid #10b981"
                      : "4px solid #ef4444",
                  borderRadius: "12px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "12px",
                    marginBottom: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "10px",
                        background: "rgba(249,115,22,0.15)",
                        color: "#f97316",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <ArrowDownToLine size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 800, color: "#f1f5f9" }}>
                        ৳ {Number(w.amount).toLocaleString()}
                      </div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                        {new Date(w.created_at).toLocaleString("bn-BD")}
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: "5px",
                      fontSize: "10px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      background:
                        w.status === "pending"
                          ? "rgba(245,158,11,0.15)"
                          : w.status === "completed"
                          ? "rgba(16,185,129,0.15)"
                          : "rgba(239,68,68,0.15)",
                      color:
                        w.status === "pending"
                          ? "#f59e0b"
                          : w.status === "completed"
                          ? "#10b981"
                          : "#ef4444",
                    }}
                  >
                    {w.status}
                  </span>
                </div>

                {/* Info */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "10px",
                    marginBottom: "12px",
                  }}
                >
                  <InfoBox icon={<User size={12} />} label="User" value={`${prof?.name || "N/A"}\n${prof?.email || ""}`} />
                  <InfoBox
                    icon={<Smartphone size={12} />}
                    label="Method"
                    value={w.payment_method ? w.payment_method.toUpperCase() : "—"}
                  />
                  <InfoBox
                    icon={<Phone size={12} />}
                    label="Send Money To"
                    value={w.phone || "—"}
                    onCopy={w.phone ? () => copyToClipboard(w.phone!, w.id) : undefined}
                    copied={copied === w.id}
                    mono
                  />
                </div>

                {w.status === "pending" && (
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => setConfirmModal({ type: "approve", withdraw: w })}
                      disabled={actionLoading === w.id}
                      style={{
                        flex: 1,
                        minWidth: 150,
                        padding: "10px 16px",
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "10px",
                        fontSize: "12px",
                        fontWeight: 800,
                        cursor: actionLoading === w.id ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
                      }}
                    >
                      {actionLoading === w.id ? (
                        <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                      ) : (
                        <CheckCircle size={14} />
                      )}
                      Approve (পাঠানো হয়েছে)
                    </button>
                    <button
                      onClick={() => setConfirmModal({ type: "reject", withdraw: w })}
                      disabled={actionLoading === w.id}
                      style={{
                        flex: 1,
                        minWidth: 150,
                        padding: "10px 16px",
                        background: "rgba(239,68,68,0.15)",
                        color: "#ef4444",
                        border: "1.5px solid rgba(239,68,68,0.4)",
                        borderRadius: "10px",
                        fontSize: "12px",
                        fontWeight: 800,
                        cursor: actionLoading === w.id ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <XCircle size={14} />
                      Reject + Refund
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {confirmModal && (
        <ConfirmDialog
          title={confirmModal.type === "approve" ? "Approve withdrawal?" : "Reject + refund?"}
          message={
            confirmModal.type === "approve"
              ? `৳${confirmModal.withdraw.amount} ${confirmModal.withdraw.phone}-এ পাঠিয়েছেন? Approve করলে user-এর transaction completed হবে।`
              : `৳${confirmModal.withdraw.amount} user-এর wallet-এ ফেরত যাবে।`
          }
          danger={confirmModal.type === "reject"}
          loading={!!actionLoading}
          onCancel={() => setConfirmModal(null)}
          onConfirm={() => {
            if (confirmModal.type === "approve") handleApprove(confirmModal.withdraw);
            else handleReject(confirmModal.withdraw);
          }}
        />
      )}
    </AdminLayout>
  );
}

function MiniStat({
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
        <div style={{ fontSize: "16px", fontWeight: 800, color: "#f1f5f9" }}>{value}</div>
        <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 600 }}>{label}</div>
      </div>
    </div>
  );
}

function InfoBox({
  icon,
  label,
  value,
  onCopy,
  copied,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onCopy?: () => void;
  copied?: boolean;
  mono?: boolean;
}) {
  return (
    <div
      style={{
        background: "#0b1120",
        border: "1px solid #253049",
        borderRadius: "8px",
        padding: "10px",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          fontSize: "9px",
          color: "#64748b",
          fontWeight: 700,
          textTransform: "uppercase",
          marginBottom: "4px",
        }}
      >
        {icon}
        {label}
      </div>
      <div
        style={{
          fontSize: "11px",
          color: "#f1f5f9",
          fontWeight: 600,
          wordBreak: "break-all",
          paddingRight: onCopy ? "24px" : 0,
          fontFamily: mono ? "monospace" : "inherit",
          whiteSpace: "pre-line",
          lineHeight: 1.4,
        }}
      >
        {value}
      </div>
      {onCopy && (
        <button
          onClick={onCopy}
          style={{
            position: "absolute",
            top: "50%",
            right: "6px",
            transform: "translateY(-50%)",
            background: copied ? "#10b981" : "#253049",
            color: copied ? "#fff" : "#94a3b8",
            border: "none",
            borderRadius: "6px",
            padding: "4px",
            cursor: "pointer",
            display: "flex",
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
      )}
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
            background: danger ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)",
            color: danger ? "#ef4444" : "#10b981",
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
              background: danger
                ? "#ef4444"
                : "linear-gradient(135deg,#10b981,#059669)",
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
              <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              "নিশ্চিত"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
