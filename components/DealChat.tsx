"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  Shield,
  Package,
  MessageCircle,
  ArrowLeft,
  Crown,
  User,
  Clock,
  Wallet,
  Play,
  ThumbsUp,
  Music2,
  X,
  Check,
  Copy,
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
}

interface Listing {
  id: string;
  title: string;
  platform: string;
  account_link: string;
  handover_method: string;
  images: string[];
}

interface Deal {
  id: string;
  order_id: string;
  admin_id: string | null;
  buyer_id: string;
  seller_id: string;
  status: string;
}

interface Message {
  id: string;
  deal_id: string;
  sender_id: string;
  sender_role: "buyer" | "seller" | "admin";
  message: string;
  created_at: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
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

const roleMeta = {
  buyer: { label: "Buyer", color: "#3b82f6", icon: User },
  seller: { label: "Seller", color: "#10b981", icon: Package },
  admin: { label: "Admin", color: "#6C63FF", icon: Shield },
};

export default function DealChat() {
  const params = useParams();
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const supabase = createClient();

  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<Record<string, Member>>({});
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [copied, setCopied] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isAdmin = profile?.role === "admin" || profile?.role === "superadmin";
  const isBuyer = user?.id === order?.buyer_id;
  const isSeller = user?.id === order?.seller_id;
  const isMember = isBuyer || isSeller || (isAdmin && deal?.admin_id === user?.id);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/deal/${orderId}`);
    }
  }, [user, authLoading, orderId]);

  // Load all data
  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    // Fetch order
    const { data: orderData, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderErr || !orderData) {
      setLoading(false);
      return;
    }
    setOrder(orderData);

    // Fetch listing
    const { data: listingData } = await supabase
      .from("listings")
      .select("*")
      .eq("id", orderData.listing_id)
      .single();
    setListing(listingData);

    // Fetch deal
    const { data: dealData } = await supabase
      .from("deal_conversations")
      .select("*")
      .eq("order_id", orderId)
      .maybeSingle();

    // If no deal exists, create one (safety fallback)
    let finalDeal = dealData;
    if (!finalDeal) {
      const { data: adminProfile } = await supabase
        .from("profiles")
        .select("id")
        .in("role", ["admin", "superadmin"])
        .limit(1)
        .maybeSingle();

      const { data: newDeal } = await supabase
        .from("deal_conversations")
        .insert({
          order_id: orderData.id,
          buyer_id: orderData.buyer_id,
          seller_id: orderData.seller_id,
          admin_id: adminProfile?.id || null,
        })
        .select()
        .single();

      finalDeal = newDeal;

      if (newDeal && adminProfile) {
        await supabase.from("deal_messages").insert({
          deal_id: newDeal.id,
          sender_id: adminProfile.id,
          sender_role: "admin",
          message:
            "স্বাগতম! এই গ্রুপে buyer, seller এবং admin আছেন। টাকা escrow-তে সুরক্ষিত আছে। যেকোনো সমস্যায় এখানে জানান।",
        });
      }
    }
    setDeal(finalDeal);

    // Fetch messages
    if (finalDeal) {
      const { data: messagesData } = await supabase
        .from("deal_messages")
        .select("*")
        .eq("deal_id", finalDeal.id)
        .order("created_at", { ascending: true });
      setMessages(messagesData || []);
    }

    // Fetch all member profiles (buyer, seller, admin)
    const memberIds = new Set<string>();
    memberIds.add(orderData.buyer_id);
    memberIds.add(orderData.seller_id);
    if (finalDeal?.admin_id) memberIds.add(finalDeal.admin_id);

    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, name, email, role")
      .in("id", Array.from(memberIds));

    const memberMap: Record<string, Member> = {};
    (profilesData || []).forEach((p: any) => {
      memberMap[p.id] = p;
    });
    setMembers(memberMap);

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user, orderId]);

  // Realtime messages
  useEffect(() => {
    if (!deal) return;

    const channel = supabase
      .channel(`deal-${deal.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "deal_messages",
          filter: `deal_id=eq.${deal.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [deal?.id]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [newMessage]);

  // Send message
  const handleSend = async () => {
    if (!newMessage.trim() || !user || !deal) return;

    let senderRole: "buyer" | "seller" | "admin" = "buyer";
    if (user.id === deal.seller_id) senderRole = "seller";
    else if (user.id === deal.admin_id) senderRole = "admin";

    setSending(true);
    try {
      const { error } = await supabase.from("deal_messages").insert({
        deal_id: deal.id,
        sender_id: user.id,
        sender_role: senderRole,
        message: newMessage.trim(),
      });

      if (error) throw error;

      setNewMessage("");
    } catch (err: any) {
      console.error(err);
      showToast("error", "সমস্যা", err?.message || "মেসেজ পাঠানো যায়নি");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Seller: Handover complete
  const handleHandover = async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      const autoCompleteAt = new Date(
        Date.now() + 72 * 60 * 60 * 1000
      ).toISOString();

      await supabase
        .from("orders")
        .update({
          status: "delivered",
          auto_complete_at: autoCompleteAt,
        })
        .eq("id", order.id);

      await supabase
        .from("listings")
        .update({ status: "sold" })
        .eq("id", order.listing_id);

      // System message
      if (deal) {
        await supabase.from("deal_messages").insert({
          deal_id: deal.id,
          sender_id: user!.id,
          sender_role: "seller",
          message:
            "✅ Handover সম্পন্ন হয়েছে! Buyer অ্যাকাউন্ট চেক করে Confirm করুন।",
        });
      }

      showToast("success", "Handover সম্পন্ন!", "৭২ ঘণ্টার মধ্যে buyer confirm করবে");
      loadData();
    } catch (err: any) {
      showToast("error", "সমস্যা", err?.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Buyer: Confirm
  const handleConfirm = async () => {
    if (!order || !user) return;
    setActionLoading(true);
    try {
      await supabase
        .from("orders")
        .update({ status: "completed" })
        .eq("id", order.id);

      // Credit seller wallet (minus commission)
      const sellerAmount = order.amount - (order.commission || 0);
      const { data: sellerProfile } = await supabase
        .from("profiles")
        .select("coin_balance")
        .eq("id", order.seller_id)
        .single();

      const newBalance =
        Number(sellerProfile?.coin_balance || 0) + sellerAmount;
      await supabase
        .from("profiles")
        .update({ coin_balance: newBalance })
        .eq("id", order.seller_id);

      await supabase.from("wallet_transactions").insert({
        user_id: order.seller_id,
        type: "credit",
        amount: sellerAmount,
        reason: `Sale #${order.id.slice(0, 8)} - ${listing?.title || "Listing"}`,
        status: "completed",
      });

      // System message
      if (deal) {
        await supabase.from("deal_messages").insert({
          deal_id: deal.id,
          sender_id: user.id,
          sender_role: "buyer",
          message: `🎉 অর্ডার সম্পন্ন! Seller ৳${sellerAmount.toLocaleString()} পেয়েছেন।`,
        });
      }

      showToast("success", "সম্পন্ন!", "Seller-কে টাকা পাঠানো হয়েছে");
      loadData();
    } catch (err: any) {
      showToast("error", "সমস্যা", err?.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Buyer: Dispute
  const handleDispute = async () => {
    if (!order || !user || !disputeReason.trim()) return;
    setActionLoading(true);
    try {
      await supabase.from("disputes").insert({
        order_id: order.id,
        raised_by: user.id,
        reason: disputeReason.trim(),
        status: "open",
      });

      await supabase
        .from("orders")
        .update({ status: "disputed" })
        .eq("id", order.id);

      if (deal) {
        await supabase.from("deal_messages").insert({
          deal_id: deal.id,
          sender_id: user.id,
          sender_role: "buyer",
          message: `⚠️ Dispute রিপোর্ট: ${disputeReason.trim()}`,
        });
      }

      showToast("success", "Dispute রিপোর্ট হয়েছে");
      setShowDisputeModal(false);
      setDisputeReason("");
      loadData();
    } catch (err: any) {
      showToast("error", "সমস্যা", err?.message);
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

      const newBalance =
        Number(sellerProfile?.coin_balance || 0) + sellerAmount;
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

      if (deal) {
        await supabase.from("deal_messages").insert({
          deal_id: deal.id,
          sender_id: user!.id,
          sender_role: "admin",
          message: `🛡️ Admin force-complete করেছেন। Seller ৳${sellerAmount.toLocaleString()} পেয়েছেন।`,
        });
      }

      showToast("success", "Force completed!");
      loadData();
    } catch (err: any) {
      showToast("error", "সমস্যা", err?.message);
    } finally {
      setActionLoading(false);
    }
  };

  const copyAccountLink = () => {
    if (listing?.account_link) {
      navigator.clipboard.writeText(listing.account_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (authLoading || loading) {
    return (
      <div
        style={{
          padding: "80px 20px",
          textAlign: "center",
          color: "var(--muted)",
        }}
      >
        লোড হচ্ছে...
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center" }}>
        <AlertCircle
          size={48}
          color="var(--muted)"
          style={{ marginBottom: "16px" }}
        />
        <h2 style={{ color: "var(--text)", marginBottom: "8px" }}>
          Order পাওয়া যায়নি
        </h2>
        <Link
          href="/dashboard"
          style={{
            display: "inline-block",
            marginTop: "20px",
            padding: "12px 24px",
            background: "var(--primary)",
            color: "#fff",
            borderRadius: "10px",
            fontWeight: 700,
          }}
        >
          ড্যাশবোর্ডে ফিরুন
        </Link>
      </div>
    );
  }

  if (!isMember) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center" }}>
        <Shield
          size={48}
          color="#ef4444"
          style={{ marginBottom: "16px" }}
        />
        <h2 style={{ color: "var(--text)", marginBottom: "8px" }}>
          এই deal-এ access নেই
        </h2>
        <p style={{ color: "var(--muted)", fontSize: "14px" }}>
          শুধু buyer, seller এবং assigned admin এই chat দেখতে পারেন
        </p>
        <Link
          href="/dashboard"
          style={{
            display: "inline-block",
            marginTop: "20px",
            padding: "12px 24px",
            background: "var(--primary)",
            color: "#fff",
            borderRadius: "10px",
            fontWeight: 700,
          }}
        >
          ড্যাশবোর্ডে ফিরুন
        </Link>
      </div>
    );
  }

  const PlatformIcon = platformIcons[listing?.platform || "youtube"] || Play;
  const pColor = platformColors[listing?.platform || "youtube"] || "#6C63FF";

  const statusLabels: Record<string, { text: string; color: string }> = {
    paid: { text: "Payment Complete", color: "#3b82f6" },
    delivered: { text: "Delivered", color: "#06b6d4" },
    completed: { text: "Completed", color: "#10b981" },
    disputed: { text: "Disputed", color: "#ef4444" },
    cancelled: { text: "Cancelled", color: "#98a2b3" },
  };
  const statusInfo = statusLabels[order.status] || statusLabels.paid;

  return (
    <main
      style={{
        background: "var(--bg)",
        minHeight: "calc(100vh - 67px)",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          gap: "20px",
          height: "calc(100vh - 107px)",
        }}
        className="deal-grid"
      >
        {/* ===== CHAT AREA ===== */}
        <div
          style={{
            background: "var(--card)",
            border: "1.5px solid var(--border)",
            borderRadius: "18px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--border)",
              background:
                "linear-gradient(135deg, rgba(108,99,255,0.06), rgba(236,72,153,0.04))",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              flexWrap: "wrap",
            }}
          >
            <Link
              href={`/orders/${order.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: "10px",
                border: "1.5px solid var(--border)",
                background: "var(--bg)",
                color: "var(--text)",
                flexShrink: 0,
              }}
            >
              <ArrowLeft size={16} />
            </Link>

            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                background: `${pColor}15`,
                color: pColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <PlatformIcon size={22} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  color: "var(--text)",
                  marginBottom: "2px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {listing?.title || "Deal Chat"}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontWeight: 700 }}>
                  #{order.id.slice(0, 8)}
                </span>
                <span>·</span>
                <span
                  style={{
                    fontWeight: 700,
                    color: statusInfo.color,
                  }}
                >
                  {statusInfo.text}
                </span>
              </div>
            </div>

            {/* Member avatars */}
            <div
              style={{
                display: "flex",
                gap: "-8px",
                alignItems: "center",
              }}
            >
              {(Object.entries(roleMeta) as [keyof typeof roleMeta, typeof roleMeta.buyer][]).map(
                ([role, meta]) => {
                  const memberId =
                    role === "buyer"
                      ? order.buyer_id
                      : role === "seller"
                      ? order.seller_id
                      : deal?.admin_id;
                  const member = memberId ? members[memberId] : null;
                  if (!member) return null;
                  const Icon = meta.icon;
                  return (
                    <div
                      key={role}
                      title={`${meta.label}: ${member.name}`}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: `${meta.color}20`,
                        color: meta.color,
                        border: `2px solid var(--card)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: 800,
                        marginLeft: "-8px",
                      }}
                    >
                      {member.name?.charAt(0).toUpperCase()}
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* MESSAGES */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px",
              background: "var(--bg)",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {messages.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  color: "var(--muted)",
                }}
              >
                <MessageCircle
                  size={48}
                  style={{ opacity: 0.4, marginBottom: "12px" }}
                />
                <div style={{ fontSize: "14px", fontWeight: 700 }}>
                  এখনো কোনো মেসেজ নেই
                </div>
                <div style={{ fontSize: "12px", marginTop: "4px" }}>
                  প্রথম message পাঠান 👋
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMine = msg.sender_id === user?.id;
                const member = members[msg.sender_id];
                const role = msg.sender_role;
                const meta = roleMeta[role];
                const showHeader =
                  idx === 0 || messages[idx - 1].sender_id !== msg.sender_id;

                return (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexDirection: isMine ? "row-reverse" : "row",
                      alignItems: "flex-end",
                    }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: `${meta.color}20`,
                        color: meta.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: 800,
                        flexShrink: 0,
                        border: `2px solid var(--card)`,
                        visibility: showHeader ? "visible" : "hidden",
                      }}
                    >
                      {(member?.name || "U").charAt(0).toUpperCase()}
                    </div>

                    {/* Bubble */}
                    <div style={{ maxWidth: "70%" }}>
                      {showHeader && (
                        <div
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            color: meta.color,
                            marginBottom: "4px",
                            textAlign: isMine ? "right" : "left",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            justifyContent: isMine ? "flex-end" : "flex-start",
                          }}
                        >
                          <Shield size={10} style={{ display: role === "admin" ? "inline" : "none" }} />
                          {member?.name || "User"}
                          <span
                            style={{
                              background: `${meta.color}20`,
                              padding: "1px 6px",
                              borderRadius: "4px",
                              fontSize: "9px",
                              textTransform: "uppercase",
                            }}
                          >
                            {meta.label}
                          </span>
                        </div>
                      )}
                      <div
                        style={{
                          background: isMine
                            ? "linear-gradient(135deg, #6C63FF, #5A52D5)"
                            : role === "admin"
                            ? "linear-gradient(135deg, rgba(108,99,255,0.1), rgba(236,72,153,0.08))"
                            : "var(--card)",
                          color: isMine ? "#fff" : "var(--text)",
                          border: isMine
                            ? "none"
                            : `1.5px solid ${
                                role === "admin"
                                  ? "rgba(108,99,255,0.3)"
                                  : "var(--border)"
                              }`,
                          padding: "10px 14px",
                          borderRadius: isMine
                            ? "16px 16px 4px 16px"
                            : "16px 16px 16px 4px",
                          fontSize: "14px",
                          lineHeight: 1.5,
                          wordBreak: "break-word",
                          boxShadow: isMine
                            ? "0 4px 12px rgba(108,99,255,0.25)"
                            : "none",
                        }}
                      >
                        <div style={{ whiteSpace: "pre-wrap" }}>
                          {msg.message}
                        </div>
                        <div
                          style={{
                            fontSize: "10px",
                            marginTop: "6px",
                            opacity: 0.7,
                            textAlign: isMine ? "right" : "left",
                          }}
                        >
                          {new Date(msg.created_at).toLocaleTimeString(
                            "bn-BD",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div
            style={{
              padding: "14px 20px",
              borderTop: "1px solid var(--border)",
              background: "var(--card)",
              display: "flex",
              gap: "10px",
              alignItems: "flex-end",
            }}
          >
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="মেসেজ লিখুন... (Enter পাঠান, Shift+Enter new line)"
              rows={1}
              disabled={sending}
              style={{
                flex: 1,
                padding: "12px 14px",
                border: "1.5px solid var(--border)",
                borderRadius: "12px",
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: "14px",
                outline: "none",
                resize: "none",
                fontFamily: "inherit",
                maxHeight: "120px",
                minHeight: "44px",
              }}
            />
            <button
              onClick={handleSend}
              disabled={sending || !newMessage.trim()}
              style={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                background:
                  sending || !newMessage.trim()
                    ? "#94a3b8"
                    : "linear-gradient(135deg, #6C63FF, #5A52D5)",
                color: "#fff",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor:
                  sending || !newMessage.trim() ? "not-allowed" : "pointer",
                boxShadow: !newMessage.trim()
                  ? "none"
                  : "0 4px 12px rgba(108,99,255,0.4)",
                flexShrink: 0,
              }}
            >
              {sending ? (
                <Loader2
                  size={18}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>

        {/* ===== SIDEBAR ===== */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            overflowY: "auto",
          }}
          className="deal-sidebar"
        >
          {/* ORDER INFO */}
          <div
            style={{
              background: "var(--card)",
              border: "1.5px solid var(--border)",
              borderRadius: "16px",
              padding: "18px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 800,
                color: "var(--muted)",
                marginBottom: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Order Details
            </div>

            <div style={{ marginBottom: "14px" }}>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--muted)",
                  marginBottom: "2px",
                }}
              >
                Price
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "var(--primary)",
                }}
              >
                ৳ {Number(order.amount).toLocaleString()}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontSize: "13px",
              }}
            >
              <InfoRow label="Commission" value={`৳ ${Number(order.commission || 0).toLocaleString()}`} />
              <InfoRow
                label="Seller পাবেন"
                value={`৳ ${(order.amount - (order.commission || 0)).toLocaleString()}`}
                bold
              />
              <InfoRow label="Handover" value={listing?.handover_method || "—"} />
            </div>
          </div>

          {/* ACCOUNT LINK */}
          {listing?.account_link && (
            <div
              style={{
                background: "var(--card)",
                border: "1.5px solid var(--border)",
                borderRadius: "16px",
                padding: "18px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "var(--muted)",
                  marginBottom: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Account Link
              </div>
              <a
                href={listing.account_link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  padding: "10px 12px",
                  background: `${pColor}10`,
                  border: `1.5px solid ${pColor}40`,
                  borderRadius: "8px",
                  color: pColor,
                  fontSize: "12px",
                  fontWeight: 700,
                  textDecoration: "none",
                  wordBreak: "break-all",
                  marginBottom: "8px",
                }}
              >
                {listing.account_link}
              </a>
              <button
                onClick={copyAccountLink}
                style={{
                  width: "100%",
                  padding: "8px",
                  background: copied ? "#10b981" : "var(--bg)",
                  color: copied ? "#fff" : "var(--text)",
                  border: `1.5px solid ${copied ? "#10b981" : "var(--border)"}`,
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "কপি হয়েছে!" : "লিংক কপি করুন"}
              </button>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div
            style={{
              background: "var(--card)",
              border: "1.5px solid var(--border)",
              borderRadius: "16px",
              padding: "18px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 800,
                color: "var(--muted)",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Actions
            </div>

            {/* Seller: Handover */}
            {isSeller && order.status === "paid" && (
              <button
                onClick={handleHandover}
                disabled={actionLoading}
                style={{
                  padding: "12px",
                  background: actionLoading
                    ? "#94a3b8"
                    : "linear-gradient(135deg, #06b6d4, #0891b2)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: 800,
                  fontSize: "13px",
                  cursor: actionLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  boxShadow: actionLoading
                    ? "none"
                    : "0 4px 14px rgba(6,182,212,0.4)",
                }}
              >
                {actionLoading ? (
                  <>
                    <Loader2
                      size={14}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                    প্রসেসিং...
                  </>
                ) : (
                  <>
                    <Package size={14} /> Handover Complete
                  </>
                )}
              </button>
            )}

            {/* Buyer: Confirm + Dispute */}
            {isBuyer && order.status === "delivered" && (
              <>
                <button
                  onClick={handleConfirm}
                  disabled={actionLoading}
                  style={{
                    padding: "12px",
                    background: actionLoading
                      ? "#94a3b8"
                      : "linear-gradient(135deg, #10b981, #059669)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: 800,
                    fontSize: "13px",
                    cursor: actionLoading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    boxShadow: actionLoading
                      ? "none"
                      : "0 4px 14px rgba(16,185,129,0.4)",
                  }}
                >
                  <CheckCircle size={14} /> Confirm Received
                </button>
                <button
                  onClick={() => setShowDisputeModal(true)}
                  disabled={actionLoading}
                  style={{
                    padding: "12px",
                    background: "transparent",
                    color: "#ef4444",
                    border: "1.5px solid #ef4444",
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: actionLoading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <AlertCircle size={14} /> Report Problem
                </button>
              </>
            )}

            {/* Admin: Force Complete */}
            {isAdmin && order.status !== "completed" && order.status !== "cancelled" && (
              <button
                onClick={handleForceComplete}
                disabled={actionLoading}
                style={{
                  padding: "12px",
                  background: actionLoading
                    ? "#94a3b8"
                    : "linear-gradient(135deg, #6C63FF, #5A52D5)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: 800,
                  fontSize: "13px",
                  cursor: actionLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  boxShadow: actionLoading
                    ? "none"
                    : "0 4px 14px rgba(108,99,255,0.4)",
                }}
              >
                <Shield size={14} /> Force Complete
              </button>
            )}

            {/* View Order */}
            <Link
              href={`/orders/${order.id}`}
              style={{
                padding: "12px",
                background: "var(--bg)",
                color: "var(--text)",
                border: "1.5px solid var(--border)",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "13px",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <Package size={14} /> Order Details দেখুন
            </Link>

            {/* Status hint */}
            <div
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "10px",
                fontSize: "11px",
                color: "var(--muted)",
                lineHeight: 1.5,
              }}
            >
              {order.status === "paid" && !isSeller && (
                <span>⏳ Seller handover করার অপেক্ষায় আছেন</span>
              )}
              {order.status === "paid" && isSeller && (
                <span>📦 Handover সম্পন্ন হলে উপরের বাটনে ক্লিক করুন</span>
              )}
              {order.status === "delivered" && isBuyer && (
                <span>✅ অ্যাকাউন্ট চেক করে Confirm করুন</span>
              )}
              {order.status === "delivered" && isSeller && (
                <span>⏱️ Buyer ৭২ ঘণ্টার মধ্যে confirm করবে</span>
              )}
              {order.status === "completed" && (
                <span style={{ color: "#10b981", fontWeight: 700 }}>
                  🎉 Deal সম্পন্ন হয়েছে!
                </span>
              )}
              {order.status === "disputed" && (
                <span style={{ color: "#ef4444", fontWeight: 700 }}>
                  ⚠️ Dispute চলছে — Admin হস্তক্ষেপ করবে
                </span>
              )}
            </div>
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
        @media (max-width: 900px) {
          .deal-grid {
            grid-template-columns: 1fr !important;
            height: auto !important;
          }
          .deal-sidebar {
            max-height: none !important;
          }
          .deal-grid > div:first-child {
            min-height: 60vh;
          }
        }
      `}</style>
    </main>
  );
}

function InfoRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <span style={{ color: "var(--muted)", fontSize: "12px" }}>{label}</span>
      <span
        style={{
          color: "var(--text)",
          fontSize: "13px",
          fontWeight: bold ? 800 : 600,
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}
