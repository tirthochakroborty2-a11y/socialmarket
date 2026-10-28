"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Package,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Loader2,
  AlertCircle,
  X,
  Play,
  ThumbsUp,
  Music2,
  Eye,
  Clock,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth";
import { showToast } from "@/components/Toast";

interface Listing {
  id: string;
  seller_id: string;
  title: string;
  platform: "youtube" | "facebook" | "tiktok";
  price: number;
  followers: number;
  status: string;
  is_monetized: boolean;
  images: string[];
  created_at: string;
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

type StatusFilter = "all" | "pending" | "active" | "reserved" | "sold" | "rejected";

export default function AdminListingsContent() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [listings, setListings] = useState<Listing[]>([]);
  const [filtered, setFiltered] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    type: "approve" | "reject" | "delete";
    listing: Listing;
  } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || (profile?.role !== "admin" && profile?.role !== "superadmin")) {
      router.push("/admin/login");
    }
  }, [user, profile, authLoading]);

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
    if (user && (profile?.role === "admin" || profile?.role === "superadmin")) {
      fetchListings();
    }
  }, [user, profile]);

  useEffect(() => {
    let r = listings;
    if (statusFilter !== "all") r = r.filter((l) => l.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((l) => l.title?.toLowerCase().includes(q));
    }
    setFiltered(r);
  }, [listings, search, statusFilter]);

  const updateStatus = async (listing: Listing, newStatus: string) => {
    setActionLoading(listing.id);
    try {
      const { error } = await supabase
        .from("listings")
        .update({ status: newStatus })
        .eq("id", listing.id);
      if (error) throw error;
      showToast("success", `Listing ${newStatus} হয়েছে`);
      fetchListings();
    } catch (err: any) {
      showToast("error", "সমস্যা", err?.message);
    } finally {
      setActionLoading(null);
      setConfirmModal(null);
    }
  };

  const handleDelete = async (listing: Listing) => {
    setActionLoading(listing.id);
    try {
      const { error } = await supabase.from("listings").delete().eq("id", listing.id);
      if (error) throw error;
      showToast("success", "Listing deleted");
      fetchListings();
    } catch (err: any) {
      showToast("error", "সমস্যা", err?.message);
    } finally {
      setActionLoading(null);
      setConfirmModal(null);
    }
  };

  const counts = {
    pending: listings.filter((l) => l.status === "pending").length,
    active: listings.filter((l) => l.status === "active").length,
  };

  return (
    <AdminLayout title="Listing Management" subtitle={`${listings.length}টি listing`}>
      {/* Stats */}
      <div className="admin-stats-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <MiniStat icon={<Package size={18} />} value={listings.length} label="মোট Listings" color="#6C63FF" />
        <MiniStat icon={<Clock size={18} />} value={counts.pending} label="Pending Approval" color="#f59e0b" />
        <MiniStat icon={<CheckCircle size={18} />} value={counts.active} label="Active" color="#10b981" />
      </div>

      {/* Search + filters */}
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
            placeholder="Listing title খুঁজুন..."
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", color: "#f1f5f9", fontSize: "13px" }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", display: "flex" }}>
              <X size={14} />
            </button>
          )}
        </div>

        {(["pending", "active", "sold", "rejected", "all"] as const).map((s) => (
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

      {/* Listings */}
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
          কোনো listing পাওয়া যায়নি
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map((l) => {
            const Icon = platformIcons[l.platform] || Play;
            const color = platformColors[l.platform] || "#6C63FF";
            return (
              <div
                key={l.id}
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
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "12px",
                    background: `${color}20`,
                    color: color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={24} />
                </div>

                <div style={{ flex: 1, minWidth: 200 }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#f1f5f9",
                      marginBottom: "3px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {l.title}
                  </div>
                  <div style={{ fontSize: "11px", color: "#94a3b8", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <span>৳ {Number(l.price).toLocaleString()}</span>
                    <span>·</span>
                    <span>{Number(l.followers).toLocaleString()} followers</span>
                    {l.is_monetized && (
                      <>
                        <span>·</span>
                        <span style={{ color: "#10b981", fontWeight: 700 }}>✓ Monetized</span>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: "5px",
                      fontSize: "10px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      background:
                        l.status === "active"
                          ? "rgba(16,185,129,0.15)"
                          : l.status === "pending"
                          ? "rgba(245,158,11,0.15)"
                          : l.status === "sold"
                          ? "rgba(108,99,255,0.15)"
                          : "rgba(239,68,68,0.15)",
                      color:
                        l.status === "active"
                          ? "#10b981"
                          : l.status === "pending"
                          ? "#f59e0b"
                          : l.status === "sold"
                          ? "#6C63FF"
                          : "#ef4444",
                    }}
                  >
                    {l.status}
                  </span>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <Link
                      href={`/listing/${l.id}`}
                      target="_blank"
                      title="View"
                      style={{
                        padding: "8px",
                        background: "rgba(108,99,255,0.15)",
                        color: "#6C63FF",
                        borderRadius: "8px",
                        display: "flex",
                      }}
                    >
                      <Eye size={14} />
                    </Link>

                    {l.status === "pending" && (
                      <>
                        <button
                          onClick={() => setConfirmModal({ type: "approve", listing: l })}
                          disabled={actionLoading === l.id}
                          title="Approve"
                          style={{
                            padding: "8px",
                            background: "rgba(16,185,129,0.15)",
                            color: "#10b981",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            display: "flex",
                          }}
                        >
                          <CheckCircle size={14} />
                        </button>
                        <button
                          onClick={() => setConfirmModal({ type: "reject", listing: l })}
                          disabled={actionLoading === l.id}
                          title="Reject"
                          style={{
                            padding: "8px",
                            background: "rgba(239,68,68,0.15)",
                            color: "#ef4444",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            display: "flex",
                          }}
                        >
                          <XCircle size={14} />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => setConfirmModal({ type: "delete", listing: l })}
                      disabled={actionLoading === l.id}
                      title="Delete"
                      style={{
                        padding: "8px",
                        background: "rgba(239,68,68,0.15)",
                        color: "#ef4444",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "flex",
                      }}
                    >
                      {actionLoading === l.id ? (
                        <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirmModal && (
        <ConfirmDialog
          title={
            confirmModal.type === "approve"
              ? "Approve listing?"
              : confirmModal.type === "reject"
              ? "Reject listing?"
              : "Delete listing?"
          }
          message={
            confirmModal.type === "approve"
              ? "এই listing browse page-এ দেখা যাবে।"
              : confirmModal.type === "reject"
              ? "এই listing admin reject করবে।"
              : "এই listing স্থায়ীভাবে delete হবে।"
          }
          danger={confirmModal.type !== "approve"}
          loading={!!actionLoading}
          onCancel={() => setConfirmModal(null)}
          onConfirm={() => {
            if (confirmModal.type === "approve") updateStatus(confirmModal.listing, "active");
            else if (confirmModal.type === "reject") updateStatus(confirmModal.listing, "rejected");
            else handleDelete(confirmModal.listing);
          }}
        />
      )}
    </AdminLayout>
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
      <div style={{ width: 36, height: 36, borderRadius: "10px", background: `${color}15`, color, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
          <button
            onClick={onCancel}
            disabled={loading}
            style={{ flex: 1, padding: "12px", background: "#0b1120", color: "#f1f5f9", border: "1.5px solid #253049", borderRadius: "10px", fontWeight: 700, fontSize: "13px", cursor: loading ? "not-allowed" : "pointer" }}
          >
            বাতিল
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{ flex: 1, padding: "12px", background: danger ? "#ef4444" : "linear-gradient(135deg,#10b981,#059669)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 800, fontSize: "13px", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
          >
            {loading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : "নিশ্চিত"}
          </button>
        </div>
      </div>
    </div>
  );
}
