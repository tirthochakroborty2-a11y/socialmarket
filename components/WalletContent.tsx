"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Wallet,
  Plus,
  ArrowDownToLine,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  TrendingDown,
  Clock,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Copy,
  Check,
  ShoppingBag,
  Inbox,
  Filter,
  Phone,
  FileText,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth";
import { showToast } from "@/components/Toast";

interface Transaction {
  id: string;
  user_id: string;
  type: "credit" | "debit";
  amount: number;
  reason: string;
  status: "pending" | "completed" | "failed";
  txn_ref: string | null;
  phone: string | null;
  payment_method: string | null;
  created_at: string;
}

const ADMIN_NUMBER = "01572972953";

type FilterType = "all" | "credit" | "debit";

export default function WalletContent() {
  const router = useRouter();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const supabase = createClient();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  // Buy modal state
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyAmount, setBuyAmount] = useState("");
  const [buyMethod, setBuyMethod] = useState<"bkash" | "nagad">("bkash");
  const [buyTxn, setBuyTxn] = useState("");
  const [buyPhone, setBuyPhone] = useState("");
  const [buySubmitting, setBuySubmitting] = useState(false);
  const [buyError, setBuyError] = useState("");
  const [copied, setCopied] = useState(false);

  // Withdraw modal state
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawPhone, setWithdrawPhone] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState<"bkash" | "nagad">("bkash");
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");

  // Auth
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/wallet");
    }
  }, [user, authLoading]);

  // Fetch transactions
  const fetchTransactions = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setTransactions(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  // Stats
  const totalIn = transactions
    .filter((t) => t.type === "credit" && t.status === "completed")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalOut = transactions
    .filter((t) => t.type === "debit" && t.status === "completed")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const pending = transactions
    .filter((t) => t.status === "pending")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const filteredTx =
    filter === "all" ? transactions : transactions.filter((t) => t.type === filter);

  const copyAdminNumber = () => {
    navigator.clipboard.writeText(ADMIN_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast("success", "কপি হয়েছে!", "Admin number কপি হয়েছে");
  };

  // Buy submit
  const handleBuySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBuyError("");

    const amount = Number(buyAmount);
    if (!amount || amount < 50) {
      return setBuyError("সর্বনিম্ন ৫০ টাকা");
    }
    if (!buyTxn.trim()) {
      return setBuyError("TXN ID দিন");
    }
    if (!buyPhone.trim() || buyPhone.length < 11) {
      return setBuyError("সঠিক ফোন নম্বর দিন");
    }

    setBuySubmitting(true);
    try {
      const { error } = await supabase.from("wallet_transactions").insert({
        user_id: user!.id,
        type: "credit",
        amount,
        reason: `Coin purchase via ${buyMethod}`,
        status: "pending",
        txn_ref: buyTxn.trim(),
        phone: buyPhone.trim(),
        payment_method: buyMethod,
      });

      if (error) throw error;

      showToast("success", "Request পাঠানো হয়েছে", "Admin approve করলে coin যোগ হবে");
      setShowBuyModal(false);
      setBuyAmount("");
      setBuyTxn("");
      setBuyPhone("");
      fetchTransactions();
    } catch (err: any) {
      setBuyError(err?.message || "সমস্যা হয়েছে");
    } finally {
      setBuySubmitting(false);
    }
  };

  // Withdraw submit
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError("");

    const amount = Number(withdrawAmount);
    const balance = Number(profile?.coin_balance || 0);

    if (!amount || amount < 500) {
      return setWithdrawError("সর্বনিম্ন ৫০০ টাকা");
    }
    if (amount > balance) {
      return setWithdrawError("পর্যাপ্ত balance নেই");
    }
    if (!withdrawPhone.trim() || withdrawPhone.length < 11) {
      return setWithdrawError("সঠিক ফোন নম্বর দিন");
    }

    setWithdrawSubmitting(true);
    try {
      // 1. Deduct balance immediately
      const newBalance = balance - amount;
      const { error: balError } = await supabase
        .from("profiles")
        .update({ coin_balance: newBalance })
        .eq("id", user!.id);

      if (balError) throw balError;

      // 2. Create pending withdrawal
      const { error } = await supabase.from("wallet_transactions").insert({
        user_id: user!.id,
        type: "debit",
        amount,
        reason: `Withdraw to ${withdrawMethod}`,
        status: "pending",
        phone: withdrawPhone.trim(),
        payment_method: withdrawMethod,
      });

      if (error) throw error;

      showToast("success", "Withdraw request পাঠানো হয়েছে", "Admin approve করলে টাকা যাবে");
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      setWithdrawPhone("");
      await refreshProfile();
      fetchTransactions();
    } catch (err: any) {
      setWithdrawError(err?.message || "সমস্যা হয়েছে");
    } finally {
      setWithdrawSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center", color: "var(--muted)" }}>
        লোড হচ্ছে...
      </div>
    );
  }

  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh", paddingBottom: "60px" }}>
      {/* ============ HERO STRIP ============ */}
      <section
        style={{
          background: "linear-gradient(135deg, #6C63FF 0%, #5A52D5 50%, #EC4899 100%)",
          padding: "40px 20px 90px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            top: -150,
            right: -100,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            bottom: -80,
            left: "20%",
          }}
        />

        <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "8px",
            }}
          >
            <Wallet size={24} color="#fff" />
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#fff" }}>
              আমার ওয়ালেট
            </h1>
          </div>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)" }}>
            ব্যালেন্স, লেনদেন এবং withdraw সব এক জায়গায়
          </p>
        </div>
      </section>

      {/* ============ MAIN CONTAINER ============ */}
      <div
        style={{
          maxWidth: "1100px",
          margin: "-60px auto 0",
          padding: "0 20px",
          position: "relative",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* ===== BALANCE CARD ===== */}
        <div
          style={{
            background: "linear-gradient(135deg, #2D1B69 0%, #6C63FF 60%, #EC4899 100%)",
            borderRadius: "22px",
            padding: "32px 28px",
            color: "#fff",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 20px 50px rgba(108,99,255,0.35)",
          }}
        >
          {/* Blobs */}
          <div
            style={{
              position: "absolute",
              width: 300,
              height: 300,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              top: -120,
              right: -80,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 150,
              height: 150,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
              bottom: -50,
              left: "40%",
            }}
          />

          <div style={{ position: "relative", zIndex: 2 }}>
            <div
              style={{
                fontSize: "13px",
                opacity: 0.85,
                marginBottom: "6px",
                fontWeight: 600,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              মোট ব্যালেন্স
            </div>
            <div
              style={{
                fontSize: "clamp(36px, 6vw, 52px)",
                fontWeight: 800,
                letterSpacing: "-1px",
                marginBottom: "24px",
                lineHeight: 1,
              }}
            >
              ৳ {Number(profile?.coin_balance || 0).toLocaleString()}
            </div>

            {/* Stats inline */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "16px",
                marginBottom: "24px",
              }}
              className="balance-stats"
            >
              <MiniStat icon={<ArrowDownLeft size={14} />} label="মোট ইন" value={`৳ ${totalIn.toLocaleString()}`} />
              <MiniStat icon={<ArrowUpRight size={14} />} label="মোট আউট" value={`৳ ${totalOut.toLocaleString()}`} />
              <MiniStat icon={<Clock size={14} />} label="পেন্ডিং" value={`৳ ${pending.toLocaleString()}`} />
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }} className="balance-actions">
              <button
                onClick={() => setShowBuyModal(true)}
                style={{
                  flex: 1,
                  minWidth: 160,
                  padding: "13px",
                  background: "#fff",
                  color: "#6C63FF",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: 800,
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
                }}
              >
                <Plus size={16} /> Coin কিনুন
              </button>
              <button
                onClick={() => setShowWithdrawModal(true)}
                style={{
                  flex: 1,
                  minWidth: 160,
                  padding: "13px",
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  color: "#fff",
                  border: "1.5px solid rgba(255,255,255,0.4)",
                  borderRadius: "12px",
                  fontWeight: 800,
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <ArrowDownToLine size={16} /> Withdraw
              </button>
            </div>
          </div>
        </div>

        {/* ===== TRANSACTION HISTORY ===== */}
        <div
          style={{
            background: "var(--card)",
            border: "1.5px solid var(--border)",
            borderRadius: "18px",
            padding: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "var(--text)",
                  marginBottom: "4px",
                }}
              >
                লেনদেনের ইতিহাস
              </h2>
              <p style={{ fontSize: "13px", color: "var(--muted)" }}>
                সব credit ও debit লেনদেন
              </p>
            </div>

            {/* Filter buttons */}
            <div
              style={{
                display: "flex",
                gap: "4px",
                background: "var(--bg)",
                padding: "4px",
                borderRadius: "10px",
                border: "1px solid var(--border)",
              }}
            >
              {(["all", "credit", "debit"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: "7px",
                    background: filter === f ? "var(--primary)" : "transparent",
                    color: filter === f ? "#fff" : "var(--muted)",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "12px",
                    cursor: "pointer",
                    textTransform: "capitalize",
                    transition: "all 0.2s",
                  }}
                >
                  {f === "all" ? "সব" : f === "credit" ? "ইন" : "আউট"}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
              লোড হচ্ছে...
            </div>
          ) : filteredTx.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "50px 20px",
                color: "var(--muted)",
                border: "1.5px dashed var(--border)",
                borderRadius: "12px",
              }}
            >
              <Inbox size={42} style={{ marginBottom: "10px", opacity: 0.4 }} />
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>
                কোনো লেনদেন নেই
              </div>
              <div style={{ fontSize: "12px" }}>
                Coin কিনে শুরু করুন
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {filteredTx.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ==================== BUY MODAL ==================== */}
      {showBuyModal && (
        <Modal onClose={() => !buySubmitting && setShowBuyModal(false)} title="Coin কিনুন">
          <form onSubmit={handleBuySubmit}>
            {buyError && (
              <ErrorBox message={buyError} />
            )}

            {/* Amount */}
            <div style={{ marginBottom: "16px" }}>
              <Label>পরিমাণ (৳)</Label>
              <input
                type="number"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                placeholder="৫০০"
                disabled={buySubmitting}
                min={50}
                style={inputStyle}
              />
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  marginTop: "8px",
                  flexWrap: "wrap",
                }}
              >
                {[100, 500, 1000, 2000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setBuyAmount(String(v))}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "20px",
                      border: "1px solid var(--border)",
                      background: buyAmount === String(v) ? "var(--primary)" : "var(--bg)",
                      color: buyAmount === String(v) ? "#fff" : "var(--text)",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    ৳ {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment method */}
            <div style={{ marginBottom: "16px" }}>
              <Label>পেমেন্ট মেথড</Label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {[
                  { v: "bkash", label: "bKash", color: "#E2136E" },
                  { v: "nagad", label: "Nagad", color: "#F58220" },
                ].map((m) => (
                  <button
                    key={m.v}
                    type="button"
                    onClick={() => setBuyMethod(m.v as "bkash" | "nagad")}
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      border:
                        buyMethod === m.v
                          ? `2px solid ${m.color}`
                          : "1.5px solid var(--border)",
                      background: buyMethod === m.v ? `${m.color}10` : "var(--bg)",
                      color: buyMethod === m.v ? m.color : "var(--text)",
                      fontWeight: 700,
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Admin number */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(108,99,255,0.08), rgba(236,72,153,0.08))",
                border: "1.5px solid rgba(108,99,255,0.25)",
                borderRadius: "12px",
                padding: "14px",
                marginBottom: "16px",
              }}
            >
              <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "6px", fontWeight: 600 }}>
                {buyMethod === "bkash" ? "bKash" : "Nagad"} Send Money করুন
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 800,
                    color: "var(--primary)",
                    letterSpacing: "1px",
                  }}
                >
                  {ADMIN_NUMBER}
                </div>
                <button
                  type="button"
                  onClick={copyAdminNumber}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    background: copied ? "#10b981" : "var(--primary)",
                    color: "#fff",
                    border: "none",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? "কপি হয়েছে" : "কপি"}
                </button>
              </div>
            </div>

            {/* TXN ID */}
            <div style={{ marginBottom: "16px" }}>
              <Label>TXN ID</Label>
              <input
                type="text"
                value={buyTxn}
                onChange={(e) => setBuyTxn(e.target.value)}
                placeholder="যেমন: 8N9A2BC1D3"
                disabled={buySubmitting}
                style={inputStyle}
              />
            </div>

            {/* Phone */}
            <div style={{ marginBottom: "20px" }}>
              <Label>আপনার ফোন নম্বর</Label>
              <input
                type="tel"
                value={buyPhone}
                onChange={(e) => setBuyPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                disabled={buySubmitting}
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={buySubmitting}
              style={{
                width: "100%",
                padding: "14px",
                background: buySubmitting
                  ? "#94a3b8"
                  : "linear-gradient(135deg, #6C63FF, #EC4899)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                fontWeight: 800,
                fontSize: "14px",
                cursor: buySubmitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: buySubmitting ? "none" : "0 8px 20px rgba(108,99,255,0.4)",
              }}
            >
              {buySubmitting ? (
                <>
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  পাঠানো হচ্ছে...
                </>
              ) : (
                <>
                  <CheckCircle size={16} /> Request পাঠান
                </>
              )}
            </button>
          </form>
        </Modal>
      )}

      {/* ==================== WITHDRAW MODAL ==================== */}
      {showWithdrawModal && (
        <Modal onClose={() => !withdrawSubmitting && setShowWithdrawModal(false)} title="Withdraw">
          <form onSubmit={handleWithdrawSubmit}>
            {withdrawError && <ErrorBox message={withdrawError} />}

            <div
              style={{
                background: "rgba(16,185,129,0.08)",
                border: "1.5px solid rgba(16,185,129,0.3)",
                borderRadius: "12px",
                padding: "12px",
                marginBottom: "16px",
                fontSize: "13px",
                color: "var(--text)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Wallet size={16} color="#10b981" />
              <span>
                আপনার ব্যালেন্স: <strong>৳ {Number(profile?.coin_balance || 0).toLocaleString()}</strong>
              </span>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <Label>পরিমাণ (৳)</Label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="৫০০ (সর্বনিম্ন)"
                disabled={withdrawSubmitting}
                min={500}
                style={inputStyle}
              />
              <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "6px" }}>
                সর্বনিম্ন ৫০০ টাকা withdraw করা যাবে
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <Label>পেমেন্ট মেথড</Label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {[
                  { v: "bkash", label: "bKash", color: "#E2136E" },
                  { v: "nagad", label: "Nagad", color: "#F58220" },
                ].map((m) => (
                  <button
                    key={m.v}
                    type="button"
                    onClick={() => setWithdrawMethod(m.v as "bkash" | "nagad")}
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      border:
                        withdrawMethod === m.v
                          ? `2px solid ${m.color}`
                          : "1.5px solid var(--border)",
                      background: withdrawMethod === m.v ? `${m.color}10` : "var(--bg)",
                      color: withdrawMethod === m.v ? m.color : "var(--text)",
                      fontWeight: 700,
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <Label>{withdrawMethod === "bkash" ? "bKash" : "Nagad"} নম্বর</Label>
              <input
                type="tel"
                value={withdrawPhone}
                onChange={(e) => setWithdrawPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                disabled={withdrawSubmitting}
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={withdrawSubmitting}
              style={{
                width: "100%",
                padding: "14px",
                background: withdrawSubmitting
                  ? "#94a3b8"
                  : "linear-gradient(135deg, #10b981, #059669)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                fontWeight: 800,
                fontSize: "14px",
                cursor: withdrawSubmitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: withdrawSubmitting ? "none" : "0 8px 20px rgba(16,185,129,0.4)",
              }}
            >
              {withdrawSubmitting ? (
                <>
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  পাঠানো হচ্ছে...
                </>
              ) : (
                <>
                  <ArrowDownToLine size={16} /> Withdraw Request
                </>
              )}
            </button>
          </form>
        </Modal>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input::placeholder { color: #98a2b3; }
        input:focus {
          border-color: #6C63FF !important;
          box-shadow: 0 0 0 3px rgba(108,99,255,0.15) !important;
        }
        @media (max-width: 600px) {
          .balance-stats { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}

/* ============ HELPERS ============ */

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "1.5px solid var(--border)",
  borderRadius: "10px",
  background: "var(--bg)",
  color: "var(--text)",
  fontSize: "14px",
  outline: "none",
  fontFamily: "inherit",
  transition: "all 0.2s",
};

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.12)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: "10px",
        padding: "10px 12px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "11px",
          opacity: 0.85,
          marginBottom: "4px",
          fontWeight: 600,
        }}
      >
        {icon}
        {label}
      </div>
      <div style={{ fontSize: "16px", fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const isCredit = tx.type === "credit";
  const statusStyles: Record<string, { bg: string; fg: string }> = {
    completed: { bg: "#10b98120", fg: "#10b981" },
    pending: { bg: "#f59e0b20", fg: "#f59e0b" },
    failed: { bg: "#ef444420", fg: "#ef4444" },
  };
  const s = statusStyles[tx.status];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 14px",
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: "10px",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: "10px",
          background: isCredit ? "#10b98115" : "#ef444415",
          color: isCredit ? "#10b981" : "#ef4444",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {isCredit ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
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
          {tx.reason}
        </div>
        <div style={{ fontSize: "11px", color: "var(--muted)" }}>
          {new Date(tx.created_at).toLocaleString("bn-BD", {
            dateStyle: "short",
            timeStyle: "short",
          })}
          {tx.payment_method && ` · ${tx.payment_method}`}
        </div>
      </div>

      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 800,
            color: isCredit ? "#10b981" : "#ef4444",
            marginBottom: "2px",
          }}
        >
          {isCredit ? "+" : "-"}৳ {Number(tx.amount).toLocaleString()}
        </div>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            background: s.bg,
            color: s.fg,
            padding: "2px 8px",
            borderRadius: "5px",
            textTransform: "capitalize",
          }}
        >
          {tx.status}
        </span>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        display: "block",
        fontSize: "12px",
        fontWeight: 700,
        color: "var(--text)",
        marginBottom: "6px",
        textTransform: "uppercase",
        letterSpacing: "0.3px",
      }}
    >
      {children}
    </label>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div
      style={{
        background: "rgba(239,68,68,0.08)",
        border: "1.5px solid rgba(239,68,68,0.3)",
        borderRadius: "10px",
        padding: "10px 14px",
        marginBottom: "14px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "13px",
        color: "#ef4444",
        fontWeight: 600,
      }}
    >
      <AlertCircle size={16} style={{ flexShrink: 0 }} />
      {message}
    </div>
  );
}

function Modal({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <div
      onClick={onClose}
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
          padding: "24px",
          maxWidth: "440px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
          border: "1.5px solid var(--border)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text)" }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--muted)",
            }}
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
