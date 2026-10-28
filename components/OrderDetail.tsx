"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  CheckCircle,
  Clock,
  Shield,
  AlertCircle,
  Loader2,
  MessageCircle,
  ArrowRight,
  X,
  Play,
  ThumbsUp,
  Music2,
  Package,
  User,
  Calendar,
  Wallet,
} from "lucide-react";
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
  auto_complete_at: string | null;
  created_at: string;
  listings?: {
    title: string;
    platform: string;
    images: string[];
    handover_method: string;
  } | null;
  buyer?: { name: string; email: string } | null;
  seller?: { name: string; email: string } | null;
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

const STATUS_STEPS = [
  { key: "paid", label: "Payment", icon: Wallet },
  { key: "delivered", label: "Handover", icon: Package },
  { key: "completed", label: "Complete", icon: CheckCircle },
];

export default function OrderDetail() {
  const params = useParams();
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const supabase = createClient();

  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [timeLeft, setTimeLeft] = useState<string>("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isBuyer = user?.id === order?.buyer_id;
  const isSeller = user?.id === order?.seller_id;
  const isAdmin = profile?.role === "admin" || profile?.role === "superadmin";

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/orders/${orderId}`);
    }
  }, [user, authLoading, orderId]);

  // Fetch order
  const fetchOrder = async () => {
    if (!user) return;
    setLoading(true);

    const { data: orderData, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error || !orderData) {
      setLoading(false);
      return;
    }

    // Check authorization
    if (
      orderData.buyer_id !== user.id &&
      orderData.seller_id !== user.id &&
      !isAdmin
    ) {
      setLoading(false);
      return;
    }

    // Fetch listing
    const { data: listingData } = await supabase
      .from("listings")
      .select("title, platform, images, handover_method")
      .eq("id", orderData.listing_id)
      .single();

    // Fetch buyer + seller
    const { data: buyerData } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("id", orderData.buyer_id)
      .single();

    const { data: sellerData } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("id", orderData.seller_id)
      .single();

    setOrder({
      ...orderData,
      listings: listingData,
      buyer: buyerData,
      seller: sellerData,
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchOrder();
  }, [user, orderId]);

  // Countdown timer
  useEffect(() => {
    if (!order?.auto_complete_at) {
      setTimeLeft("");
      return;
    }

    const update = () => {
      const now = new Date().getTime();
      const end = new Date(order.auto_complete_at!).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("সময় শেষ — auto-complete হবে");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}ঘ ${minutes}মিন বাকি`);
      } else {
        setTimeLeft(`${minutes}মিন ${seconds}সে বাকি`);
      }
    };

    update();
    timerRef.current = setInterval(update, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [order?.auto_complete_at]);

  // Seller: Handover complete
  const handleHandover = async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      const autoCompleteAt = new Date(
        Date.now() + 72 * 60 * 60 * 1000
      ).toISOString();

      const { error } = await supabase
        .from("orders")
        .update({
          status: "delivered",
          auto_complete_at: autoCompleteAt,
        })
        .eq("id", order.id);

      if (error) throw error;

      await supabase
        .from("listings")
        .update({ status: "sold" })
        .eq("id", order.listing_id);

      showToast(
        "success",
        "হ্যান্ডওভার সম্পন্ন!",
        "Buyer ৭২ ঘণ্টার মধ্যে confirm করলে টাকা পাবেন"
      );
      fetchOrder();
    } catch (err: any) {
      console.error(err);
      showToast("error", "সমস্যা", err?.message || "আবার চেষ্টা করুন");
    } finally {
      setActionLoading(false);
    }
  };

  // Buyer: Confirm received
  const handleConfirm = async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      // 1. Update order → completed
      const { error: orderErr } = await supabase
        .from("orders")
        .update({ status: "completed" })
        .eq("id", order.id);
      if (orderErr) throw orderErr;

      // 2. Credit seller wallet (minus 5% commission)
      const sellerAmount = order.amount - (order.commission || 0);
      const { data: sellerProfile } = await supabase
        .from("profiles")
        .select("coin_balance")
        .eq("id", order.seller_id)
        .single();

      const newBalance = Number(sellerProfile?.coin_balance || 0) + sellerAmount;
      await supabase
        .from("profiles")
        .update({ coin_balance: newBalance })
        .eq("id", order.seller_id);

      // 3. Wallet transaction
      await supabase.from("wallet_transactions").insert({
        user_id: order.seller_id,
        type: "credit",
        amount: sellerAmount,
        reason: `Sale #${order.id.slice(0, 8)} - ${order.listings?.title}`,
        status: "completed",
      });

      showToast("success", "সম্পন্ন!", "Seller-কে টাকা পাঠানো হয়েছে");
      fetchOrder();
    } catch (err: any) {
      console.error(err);
      showToast("error", "সমস্যা", err?.message || "আবার চেষ্টা করুন");
    } finally {
      setActionLoading(false);
    }
  };

  // Buyer: Report dispute
  const handleDispute = async () => {
    if (!order || !disputeReason.trim()) {
      showToast("error", "কারণ লিখুন");
      return;
    }
    setActionLoading(true);
    try {
      const { error: dispErr } = await supabase.from("disputes").insert({
        order_id: order.id,
        raised_by: user!.id,
        reason: disputeReason.trim(),
        status: "open",
      });
      if (dispErr) throw dispErr;

      const { error: orderErr } = await supabase
        .from("orders")
        .update({ status: "disputed" })
        .eq("id", order.id);
      if (orderErr) throw orderErr;

      showToast("success", "Dispute রিপোর্ট হয়েছে", "Admin শীঘ্রই যোগাযোগ করবে");
      setShowDisputeModal(false);
      setDisputeReason("");
      fetchOrder();
    } catch (err: any) {
      console.error(err);
      showToast("error", "সমস্যা", err?.message || "আবার চেষ্টা করুন");
    } finally {
      setActionLoading(false);
    }
  };

  // Admin: Force complete
  const handleForceComplete = async () => {
    if (!order) return;
    if (!confirm("Force complete করবেন? Seller-কে টাকা পাঠানো হবে।")) return;

    setActionLoading(true);
    try {
      const sellerAmount = order.amount - (order.commission || 0);
      const { data: sellerProfile } = await supabase
        .from("profiles")
        .select("coin_balance")
        .eq("id", order.seller_id)
        .single();

      const newBalance = Number(sellerProfile?.coin_balance || 0) + sellerAmount;
      await supabase
        .from("profiles")
        .update({ coin_balance: newBalance })
        .eq("id", order.seller_id);

      await supabase.from("wallet_transactions").insert({
        user_id: order.seller_id,
        type: "credit",
        amount: sellerAmount,
        reason: `Admin-completed #${order.id.slice(0, 8)}`,
        status: "completed",
      });

      await supabase
        .from("orders")
        .update({ status: "completed" })
        .eq("id", order.id);

      showToast("success", "Force completed!");
      fetchOrder();
    } catch (err: any) {
      showToast("error", "সমস্যা", err?.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center", color: "var(--muted)" }}>
        লোড হচ্ছে...
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center" }}>
        <AlertCircle size={48} color="var(--muted)" style={{ marginBottom: "16px" }} />
        <h2 style={{ color: "var(--text)", marginBottom: "8px" }}>অর্ডার পাওয়া যায়নি</h2>
        <Link
          href="/dashboard"
          className="btn-primary"
          style={{ marginTop: "20px", display: "inline-block" }}
        >
          ড্যাশবোর্ডে ফিরুন
        </Link>
      </div>
    );
  }

  const Icon = platformIcons[order.listings?.platform || "youtube"] || Play;
  const color = platformColors[order.listings?.platform || "youtube"] || "#6C63FF";

  // Determine current step
  const currentStepIndex =
    order.status === "completed"
      ? 2
      : order.status === "delivered"
      ? 1
      : order.status === "disputed"
      ? -1
      : 0;

  const statusLabels: Record<string, { text: string; color: string; bg: string }> = {
    pending: { text: "Pending", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    paid: { text: "Paid", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
    delivered: { text: "Delivered", color: "#06b6d4", bg: "rgba(6,182,212,0.1)" },
    completed: { text: "Completed", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
    disputed: { text: "Disputed", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
    cancelled: { text: "Cancelled", color: "#98a2b3", bg: "rgba(152,162,179,0.1)" },
  };
  const currentStatus = statusLabels[order.status] || statusLabels.pending;

  return (
    <main
      style={{
        background: "var(--bg)",
        minHeight: "100vh",
        padding: "32px 20px 60px",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* HEADER */}
        <div style={{ marginBottom: "24px" }}>
          <Link
            href="/dashboard"
            style={{
              fontSize: "13px",
              color: "var(--muted)",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            ← ড্যাশবোর্ডে ফিরুন
          </Link>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
              marginTop: "12px",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "var(--text)",
                  marginBottom: "4px",
                }}
              >
                Order #{order.id.slice(0, 8)}
              </h1>
              <p style={{ fontSize: "13px", color: "var(--muted)" }}>
                {new Date(order.created_at).toLocaleString("bn-BD")}
              </p>
            </div>
            <span
              style={{
                background: currentStatus.bg,
                color: currentStatus.color,
                padding: "6px 14px",
                borderRadius: "99px",
                fontSize: "13px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.3px",
              }}
            >
              {currentStatus.text}
            </span>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div
          style={{
            background: "var(--card)",
            border: "1.5px solid var(--border)",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "8px",
            }}
          >
            {STATUS_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = currentStepIndex > idx;
              const isActive = currentStepIndex === idx;
              const stepColor = isCompleted
                ? "#10b981"
                : isActive
                ? "#6C63FF"
                : "var(--muted)";
              const stepBg = isCompleted
                ? "linear-gradient(135deg, #10b981, #059669)"
                : isActive
                ? "linear-gradient(135deg, #6C63FF, #5A52D5)"
                : "var(--bg)";

              return (
                <div
                  key={step.key}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      background: stepBg,
                      color: isCompleted || isActive ? "#fff" : "var(--muted)",
                      border: !isCompleted && !isActive ? "2px solid var(--border)" : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow:
                        isActive
                          ? "0 6px 20px rgba(108,99,255,0.4)"
                          : isCompleted
                          ? "0 6px 20px rgba(16,185,129,0.3)"
                          : "none",
                      zIndex: 2,
                      transition: "all 0.3s",
                    }}
                  >
                    {isCompleted ? <CheckCircle size={22} /> : <Icon size={22} />}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: stepColor,
                      marginTop: "10px",
                      textAlign: "center",
                    }}
                  >
                    {step.label}
                  </div>
                  {idx < STATUS_STEPS.length - 1 && (
                    <div
                      style={{
                        position: "absolute",
                        top: 26,
                        left: "50%",
                        right: "-50%",
                        height: 2,
                        background:
                          currentStepIndex > idx ? "#10b981" : "var(--border)",
                        zIndex: 1,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Timer / status message */}
          {order.status === "delivered" && order.auto_complete_at && (
            <div
              style={{
                marginTop: "24px",
                background: "rgba(6,182,212,0.1)",
                border: "1px solid rgba(6,182,212,0.3)",
                borderRadius: "10px",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "13px",
                color: "var(--text)",
                fontWeight: 600,
              }}
            >
              <Clock size={18} color="#06b6d4" />
              <div>
                <strong>Auto-complete timer:</strong> {timeLeft}
              </div>
            </div>
          )}

          {order.status === "disputed" && (
            <div
              style={{
                marginTop: "24px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "10px",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "13px",
                color: "#ef4444",
                fontWeight: 700,
              }}
            >
              <AlertCircle size={18} />
              Dispute চলছে — Admin যোগাযোগ করবে
            </div>
          )}
        </div>

        {/* ORDER INFO */}
        <div
          style={{
            background: "var(--card)",
            border: "1.5px solid var(--border)",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "12px",
                background: `${color}15`,
                color: color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon size={28} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  color: "var(--text)",
                  marginBottom: "4px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {order.listings?.title || "Listing"}
              </div>
              <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                Handover: {order.listings?.handover_method || "—"}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  color: "var(--primary)",
                }}
              >
                ৳ {Number(order.amount).toLocaleString()}
              </div>
              <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                Commission: ৳ {Number(order.commission || 0).toLocaleString()}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginTop: "20px",
              paddingTop: "20px",
              borderTop: "1px solid var(--border)",
            }}
          >
            <UserInfo label="Buyer" name={order.buyer?.name} email={order.buyer?.email} />
            <UserInfo label="Seller" name={order.seller?.name} email={order.seller?.email} />
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div
          style={{
            background: "var(--card)",
            border: "1.5px solid var(--border)",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {/* Seller: Handover (status = paid) */}
            {isSeller && order.status === "paid" && (
              <button
                onClick={handleHandover}
                disabled={actionLoading}
                style={{
                  flex: "1 1 200px",
                  padding: "14px",
                  background: actionLoading
                    ? "#94a3b8"
                    : "linear-gradient(135deg, #06b6d4, #0891b2)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: 800,
                  fontSize: "14px",
                  cursor: actionLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: actionLoading
                    ? "none"
                    : "0 6px 20px rgba(6,182,212,0.4)",
                }}
              >
                {actionLoading ? (
                  <>
                    <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                    প্রসেসিং...
                  </>
                ) : (
                  <>
                    <Package size={16} /> Handover Complete
                  </>
                )}
              </button>
            )}

            {/* Buyer: Confirm (status = delivered) */}
            {isBuyer && order.status === "delivered" && (
              <>
                <button
                  onClick={handleConfirm}
                  disabled={actionLoading}
                  style={{
                    flex: "1 1 200px",
                    padding: "14px",
                    background: actionLoading
                      ? "#94a3b8"
                      : "linear-gradient(135deg, #10b981, #059669)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    fontWeight: 800,
                    fontSize: "14px",
                    cursor: actionLoading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: actionLoading
                      ? "none"
                      : "0 6px 20px rgba(16,185,129,0.4)",
                  }}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                      প্রসেসিং...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} /> Confirm Received
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowDisputeModal(true)}
                  disabled={actionLoading}
                  style={{
                    flex: "1 1 200px",
                    padding: "14px",
                    background: "transparent",
                    color: "#ef4444",
                    border: "1.5px solid #ef4444",
                    borderRadius: "12px",
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: actionLoading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <AlertCircle size={16} /> Report Problem
                </button>
              </>
            )}

            {/* Admin: Force Complete */}
            {isAdmin && order.status !== "completed" && order.status !== "cancelled" && (
              <button
                onClick={handleForceComplete}
                disabled={actionLoading}
                style={{
                  flex: "1 1 200px",
                  padding: "14px",
                  background: actionLoading
                    ? "#94a3b8"
                    : "linear-gradient(135deg, #6C63FF, #5A52D5)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: 800,
                  fontSize: "14px",
                  cursor: actionLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: actionLoading
                    ? "none"
                    : "0 6px 20px rgba(108,99,255,0.4)",
                }}
              >
                <Shield size={16} /> Admin: Force Complete
              </button>
            )}

            {/* Always: Deal Chat */}
            <Link
              href={`/deal/${order.id}`}
              style={{
                flex: "1 1 200px",
                padding: "14px",
                background: "var(--bg)",
                color: "var(--text)",
                border: "1.5px solid var(--border)",
                borderRadius: "12px",
                fontWeight: 700,
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                textDecoration: "none",
              }}
            >
              <MessageCircle size={16} /> Deal Chat <ArrowRight size={14} />
            </Link>
          </div>

          {/* Status hints */}
          <div
            style={{
              marginTop: "16px",
              padding: "12px 14px",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              fontSize: "12px",
              color: "var(--muted)",
              lineHeight: 1.5,
            }}
          >
            {order.status === "paid" && !isSeller && (
              <span>⏳ Seller handover করার অপেক্ষায় আছেন</span>
            )}
            {order.status === "paid" && isSeller && (
              <span>
                📦 অ্যাকাউন্ট হ্যান্ডওভার সম্পন্ন হলে{" "}
                <strong>"Handover Complete"</strong> ক্লিক করুন
              </span>
            )}
            {order.status === "delivered" && isBuyer && (
              <span>
                ✅ অ্যাকাউন্ট বুঝে নিয়ে সব ঠিক থাকলে{" "}
                <strong>"Confirm Received"</strong> ক্লিক করুন। সমস্যা হলে{" "}
                <strong>"Report Problem"</strong> ক্লিক করুন।
              </span>
            )}
            {order.status === "delivered" && isSeller && (
              <span>
                ⏱️ Buyer ৭২ ঘণ্টার মধ্যে confirm করবে অথবা auto-complete হবে
              </span>
            )}
            {order.status === "completed" && (
              <span style={{ color: "#10b981", fontWeight: 700 }}>
                🎉 এই অর্ডার সম্পন্ন হয়েছে!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* DISPUTE MODAL */}
      {showDisputeModal && (
        <div
          onClick={() => !actionLoading && setShowDisputeModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
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
              background: "var(--card)",
              borderRadius: "18px",
              padding: "28px",
              maxWidth: "440px",
              width: "100%",
              border: "1.5px solid var(--border)",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "rgba(239,68,68,0.1)",
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
                color: "var(--text)",
                marginBottom: "8px",
                textAlign: "center",
              }}
            >
              Dispute রিপোর্ট করুন
            </h2>
            <p
              style={{
                fontSize: "13px",
                color: "var(--muted)",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              সমস্যার বিবরণ লিখুন — Admin শীঘ্রই যোগাযোগ করবে
            </p>

            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="সমস্যা কী? বিস্তারিত লিখুন..."
              rows={4}
              disabled={actionLoading}
              style={{
                width: "100%",
                padding: "12px",
                border: "1.5px solid var(--border)",
                borderRadius: "10px",
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: "14px",
                outline: "none",
                fontFamily: "inherit",
                resize: "vertical",
                marginBottom: "16px",
              }}
            />

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowDisputeModal(false)}
                disabled={actionLoading}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "var(--bg)",
                  color: "var(--text)",
                  border: "1.5px solid var(--border)",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: actionLoading ? "not-allowed" : "pointer",
                }}
              >
                বাতিল
              </button>
              <button
                onClick={handleDispute}
                disabled={actionLoading || !disputeReason.trim()}
                style={{
                  flex: 1,
                  padding: "12px",
                  background:
                    actionLoading || !disputeReason.trim()
                      ? "#94a3b8"
                      : "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor:
                    actionLoading || !disputeReason.trim()
                      ? "not-allowed"
                      : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                {actionLoading ? (
                  <>
                    <Loader2
                      size={14}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                    পাঠানো হচ্ছে...
                  </>
                ) : (
                  "রিপোর্ট করুন"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}

function UserInfo({
  label,
  name,
  email,
}: {
  label: string;
  name?: string;
  email?: string;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: "11px",
          color: "var(--muted)",
          fontWeight: 700,
          marginBottom: "6px",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
            fontSize: "13px",
          }}
        >
          {(name || "U").charAt(0).toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "var(--text)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {name || "User"}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "var(--muted)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {email}
          </div>
        </div>
      </div>
    </div>
  );
}
