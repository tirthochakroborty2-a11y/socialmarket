"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Search,
  XCircle,
  CheckCircle,
  Loader2,
  AlertCircle,
  X,
  Eye,
  Wallet,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth";
import { showToast } from "@/components/Toast";

interface Order {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  commission: number;
  status: string;
  created_at: string;
}

type StatusFilter = "all" | "paid" | "delivered" | "completed" | "disputed" | "cancelled";

export default function AdminOrdersContent() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filtered, setFiltered] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ type: "cancel" | "complete"; order: Order } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || (profile?.role !== "admin" && profile?.role !== "superadmin")) {
      router.push("/admin/login");
    }
  }, [user, profile, authLoading]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user && (profile?.role === "admin" || profile?.role === "superadmin")) {
      fetchOrders();
    }
  }, [user, profile]);

  useEffect(() => {
    let r = orders;
    if (statusFilter !== "all") r = r.filter((o) => o.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((o) => o.id.toLowerCase().includes(q));
    }
    setFiltered(r);
  }, [orders, search, statusFilter]);

  const handleCancel = async (order: Order) => {
    setActionLoading(order.id);
    try {
      // Refund buyer
      const { data: buyerProfile } = await supabase
        .from("profiles")
        .select("coin_balance")
        .eq("id", order.buyer_id)
        .single();

      const newBalance = Number(buyerProfile?.coin_balance || 0) + order.amount;
      await supabase.from("profiles").update({ coin_balance: newBalance }).eq("id", order.buyer_id);

      await supabase.from("wallet_transactions").insert({
        user_id: order.buyer_id,
        type: "credit",
        amount: order.amount,
        reason: `Refund #${order.id.slice(0, 8)} - Admin cancelled`,
        status: "completed",
      });

      await supabase.from("orders").update({ status: "cancelled" }).eq("id", order.id);
      await supabase.from("listings").update({ status: "active" }).eq("id", order.listing_id);

      showToast("success", "Order cancelled, refunded");
      fetchOrders();
    } catch (err: any) {
      showToast("error", "সমস্যা", err?.message);
    } finally {
      setActionLoading(null);
      setConfirmModal(null);
    }
  };

  const handleComplete = async (order: Order) => {
    setActionLoading(order.id);
    try {
      const sellerAmount = order.amount - order.commission;
      const { data: sellerProfile } = await supabase
        .from("profiles")
        .select("coin_balance")
        .eq("id", order.seller_id)
        .single();

      const newBalance = Number(sellerProfile?.coin_balance || 0) + sellerAmount;
      await supabase.from("profiles").update({ coin_balance: newBalance }).eq("id", order.seller_id);

      await supabase.from("wallet_transactions").insert({
        user_id: order.seller_id,
        type: "credit",
        amount: sellerAmount,
        reason: `Admin-completed #${order.id.slice(0, 8)}`,
        status: "completed",
      });

      await supabase.from("orders").update({ status: "completed" }).eq("id", order.id);

      showToast("success", "Order completed");
      fetchOrders();
    } catch (err: any) {
      showToast("error", "সমস্যা", err?.message);
    } finally {
      setActionLoading(null);
      setConfirmModal(null);
    }
  };

  return (
    <AdminLayout title="Order Management" subtitle={`${orders.length}টি order`}>
      {/* Filters */}
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
        <div style={{ flex: "1 1 260px", display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "#0b1120", borderRadius: "10px", border: "1px solid #253049" }}>
          <Search size={16} color="#64748b" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Order ID খুঁজুন..."
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", color: "#f1f5f9", fontSize: "13px" }}
          />
        </div>
        {(["all", "paid", "delivered", "completed", "disputed", "cancelled"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: "8px 14px",
              background: statusFilter === s ? "#6C63FF" : "#0b1120",
              color: statusFilter === s ? "#fff" : "#94a3b8",
              border: "1px solid #253049",
              borderRadius: "10px",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {s === "all" ? "সব" : s}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>লোড হচ্ছে...</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: "#151d2e", border: "1.5px dashed #253049", borderRadius: "14px", padding: "60px 20px", textAlign: "center", color: "#64748b" }}>
          কোনো order পাওয়া যায়নি
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map((o) => (
            <div
              key={o.id}
              style={{
                background: "#151d2e",
                border: "1px solid #253049",
                borderRadius: "12px",
                padding: "14px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: "10px", background: "rgba(108,99,255,0.15)", color: "#6C63FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ShoppingCart size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#f1f5f9", marginBottom: "2px" }}>
                  #{o.id.slice(0, 8)}
                </div>
                <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                  {new Date(o.created_at).toLocaleString("bn-BD")}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#6C63FF" }}>
                  ৳ {Number(o.amount).toLocaleString()}
                </div>
                <div style={{ fontSize: "10px", color: "#64748b" }}>
                  Comm: ৳ {Number(o.commission).toLocaleString()}
                </div>
              </div>
              <span
                style={{
                  padding: "3px 9px",
                  borderRadius: "5px",
                  fontSize: "10px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  background:
                    o.status === "completed"
                      ? "rgba(16,185,129,0.15)"
                      : o.status === "paid"
                      ? "rgba(59,130,246,0.15)"
                      : o.status === "delivered"
                      ? "rgba(6,182,212,0.15)"
                      : o.status === "disputed"
                      ? "rgba(239,68,68,0.15)"
                      : "rgba(148,163,184,0.15)",
                  color:
                    o.status === "completed"
                      ? "#10b981"
                      : o.status === "paid"
                      ? "#3b82f6"
                      : o.status === "delivered"
                      ? "#06b6d4"
                      : o.status === "disputed"
                      ? "#ef4444"
                      : "#94a3b8",
                }}
              >
                {o.status}
              </span>
              <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                <Link
                  href={`/deal/${o.id}`}
                  target="_blank"
                  title="View deal"
                  style={{ padding: "8px", background: "rgba(108,99,255,0.15)", color: "#6C63FF", borderRadius: "8px", display: "flex" }}
                >
                  <Eye size={14} />
                </Link>
                {o.status === "paid" && (
                  <button
                    onClick={() => setConfirmModal({ type: "cancel", order: o })}
                    disabled={actionLoading === o.id}
                    title="Cancel + refund"
                    style={{ padding: "8px", background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "none", borderRadius: "8px", cursor: "pointer", display: "flex" }}
                  >
                    <XCircle size={14} />
                  </button>
                )}
                {(o.status === "paid" || o.status === "delivered" || o.status === "disputed") && (
                  <button
                    onClick={() => setConfirmModal({ type: "complete", order: o })}
                    disabled={actionLoading === o.id}
                    title="Force complete"
                    style={{ padding: "8px", background: "rgba(16,185,129,0.15)", color: "#10b981", border: "none", borderRadius: "8px", cursor: "pointer", display: "flex" }}
                  >
                    {actionLoading === o.id ? (
                      <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                    ) : (
                      <CheckCircle size={14} />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmModal && (
        <ConfirmDialog
          title={confirmModal.type === "cancel" ? "Cancel + refund?" : "Force complete?"}
          message={
            confirmModal.type === "cancel"
              ? "Buyer-কে সম্পূর্ণ টাকা refund দেওয়া হবে।"
              : "Seller-কে টাকা পাঠানো হবে।"
          }
          danger={confirmModal.type === "cancel"}
          loading={!!actionLoading}
          onCancel={() => setConfirmModal(null)}
          onConfirm={() => {
            if (confirmModal.type === "cancel") handleCancel(confirmModal.order);
            else handleComplete(confirmModal.order);
          }}
        />
      )}
    </AdminLayout>
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
        style={{ background: "#151d2e", border: "1.5px solid #253049", borderRadius: "18px", padding: "28px", maxWidth: "440px", width: "100%" }}
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
        <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#f1f5f9", marginBottom: "8px", textAlign: "center" }}>{title}</h2>
        <p style={{ fontSize: "13px", color: "#94a3b8", textAlign: "center", marginBottom: "24px" }}>{message}</p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onCancel} disabled={loading} style={{ flex: 1, padding: "12px", background: "#0b1120", color: "#f1f5f9", border: "1.5px solid #253049", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: loading ? "not-allowed" : "pointer" }}>
            বাতিল
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px",
              background: danger ? "#ef4444" : "linear-gradient(135deg,#10b981,#059669)",
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
            {loading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : "নিশ্চিত"}
          </button>
        </div>
      </div>
    </div>
  );
}
