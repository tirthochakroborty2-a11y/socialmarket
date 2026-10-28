"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  Clock,
  MessageCircle,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth";
import { showToast } from "@/components/Toast";

interface Dispute {
  id: string;
  order_id: string;
  raised_by: string;
  reason: string;
  status: "open" | "resolved" | "rejected";
  created_at: string;
}

export default function AdminDisputesContent() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("open");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || (profile?.role !== "admin" && profile?.role !== "superadmin")) {
      router.push("/admin/login");
    }
  }, [user, profile, authLoading]);

  const fetchDisputes = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("disputes")
      .select("*")
      .order("created_at", { ascending: false });
    setDisputes(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user && (profile?.role === "admin" || profile?.role === "superadmin")) {
      fetchDisputes();
    }
  }, [user, profile]);

  const handleResolve = async (dispute: Dispute, action: "resolved" | "rejected") => {
    setActionLoading(dispute.id);
    try {
      await supabase.from("disputes").update({ status: action }).eq("id", dispute.id);
      await supabase.from("orders").update({ status: action === "resolved" ? "completed" : "cancelled" }).eq("id", dispute.order_id);
      showToast("success", `Dispute ${action}`);
      fetchDisputes();
    } catch (err: any) {
      showToast("error", "সমস্যা", err?.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = filter === "all" ? disputes : disputes.filter((d) => d.status === filter);
  const openCount = disputes.filter((d) => d.status === "open").length;

  return (
    <AdminLayout title="Disputes" subtitle={`${openCount}টি open dispute`}>
      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {(["open", "resolved", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "10px 18px",
              background: filter === f ? "#6C63FF" : "#151d2e",
              color: filter === f ? "#fff" : "#94a3b8",
              border: "1px solid #253049",
              borderRadius: "10px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {f === "all" ? "সব" : f}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>লোড হচ্ছে...</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: "#151d2e", border: "1.5px dashed #253049", borderRadius: "14px", padding: "60px 20px", textAlign: "center", color: "#64748b" }}>
          <CheckCircle size={48} style={{ marginBottom: "12px", color: "#10b981" }} />
          <div style={{ fontSize: "14px", fontWeight: 700 }}>কোনো open dispute নেই</div>
          <div style={{ fontSize: "12px", marginTop: "4px" }}>সব ঠিকঠাক চলছে ✅</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map((d) => (
            <div
              key={d.id}
              style={{
                background: "#151d2e",
                border: "1px solid #253049",
                borderLeft: d.status === "open" ? "4px solid #ef4444" : d.status === "resolved" ? "4px solid #10b981" : "4px solid #64748b",
                borderRadius: "12px",
                padding: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
                <div style={{ width: 36, height: 36, borderRadius: "10px", background: "rgba(239,68,68,0.15)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <AlertTriangle size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 150 }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#f1f5f9" }}>
                    Order #{d.order_id.slice(0, 8)}
                  </div>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                    {new Date(d.created_at).toLocaleString("bn-BD")}
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
                      d.status === "open"
                        ? "rgba(239,68,68,0.15)"
                        : d.status === "resolved"
                        ? "rgba(16,185,129,0.15)"
                        : "rgba(148,163,184,0.15)",
                    color: d.status === "open" ? "#ef4444" : d.status === "resolved" ? "#10b981" : "#94a3b8",
                  }}
                >
                  {d.status}
                </span>
              </div>

              <div style={{ background: "#0b1120", borderRadius: "8px", padding: "12px", marginBottom: "10px", fontSize: "12px", color: "#cbd5e1", lineHeight: 1.5, border: "1px solid #253049" }}>
                <strong style={{ color: "#f1f5f9" }}>কারণ:</strong> {d.reason}
              </div>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <Link
                  href={`/deal/${d.order_id}`}
                  target="_blank"
                  style={{
                    padding: "8px 14px",
                    background: "rgba(108,99,255,0.15)",
                    color: "#6C63FF",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    textDecoration: "none",
                  }}
                >
                  <MessageCircle size={12} />
                  Deal Chat দেখুন
                </Link>
                {d.status === "open" && (
                  <>
                    <button
                      onClick={() => handleResolve(d, "resolved")}
                      disabled={actionLoading === d.id}
                      style={{
                        padding: "8px 14px",
                        background: "rgba(16,185,129,0.15)",
                        color: "#10b981",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {actionLoading === d.id ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : <CheckCircle size={12} />}
                      Buyer-এর পক্ষে resolve
                    </button>
                    <button
                      onClick={() => handleResolve(d, "rejected")}
                      disabled={actionLoading === d.id}
                      style={{
                        padding: "8px 14px",
                        background: "rgba(239,68,68,0.15)",
                        color: "#ef4444",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <XCircle size={12} />
                      Seller-এর পক্ষে reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
