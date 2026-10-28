"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Send,
  Search,
  MessageCircle,
  Loader2,
  ArrowLeft,
  Inbox,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth";
import { showToast } from "@/components/Toast";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  user_id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export default function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(
    searchParams.get("to")
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [search, setSearch] = useState("");
  const [activeUser, setActiveUser] = useState<{
    name: string;
    email: string;
    id: string;
  } | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(
    !!searchParams.get("to")
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/messages");
    }
  }, [user, authLoading]);

  const loadConversations = async () => {
    if (!user) return;

    const { data: allMsgs } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (!allMsgs) {
      setLoading(false);
      return;
    }

    const convMap = new Map<string, Message>();
    const unreadMap = new Map<string, number>();

    for (const msg of allMsgs) {
      const otherId =
        msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      if (!convMap.has(otherId)) {
        convMap.set(otherId, msg);
      }
      if (msg.receiver_id === user.id && !msg.is_read) {
        unreadMap.set(otherId, (unreadMap.get(otherId) || 0) + 1);
      }
    }

    const otherIds = Array.from(convMap.keys());
    if (otherIds.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name, email, avatar_url")
      .in("id", otherIds);

    const convs: Conversation[] = (profiles || []).map((p: any) => {
      const lastMsg = convMap.get(p.id);
      return {
        user_id: p.id,
        name: p.name || "User",
        email: p.email || "",
        avatar_url: p.avatar_url,
        last_message: lastMsg?.body || "",
        last_message_at: lastMsg?.created_at || "",
        unread_count: unreadMap.get(p.id) || 0,
      };
    });

    convs.sort(
      (a, b) =>
        new Date(b.last_message_at).getTime() -
        new Date(a.last_message_at).getTime()
    );

    setConversations(convs);
    setLoading(false);
  };

  useEffect(() => {
    loadConversations();
  }, [user]);

  const loadMessages = async (otherUserId: string) => {
    if (!user) return;
    setLoadingMessages(true);

    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
      )
      .order("created_at", { ascending: true });

    setMessages(data || []);

    const unreadIds = (data || [])
      .filter((m) => m.receiver_id === user.id && !m.is_read)
      .map((m) => m.id);

    if (unreadIds.length > 0) {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .in("id", unreadIds);
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, name, email")
      .eq("id", otherUserId)
      .single();

    setActiveUser(profileData);
    setLoadingMessages(false);
  };

  useEffect(() => {
    if (activeUserId) {
      loadMessages(activeUserId);
      setShowMobileChat(true);
    } else {
      setActiveUser(null);
    }
  }, [activeUserId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (activeUserId === newMsg.sender_id) {
            setMessages((prev) => [...prev, newMsg]);
            supabase
              .from("messages")
              .update({ is_read: true })
              .eq("id", newMsg.id);
          }
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeUserId]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !activeUserId) return;

    setSending(true);
    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        receiver_id: activeUserId,
        body: newMessage.trim(),
        is_read: false,
      });

      if (error) throw error;

      setMessages((prev) => [
        ...prev,
        {
          id: "temp-" + Date.now(),
          sender_id: user.id,
          receiver_id: activeUserId,
          body: newMessage.trim(),
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ]);

      setNewMessage("");
      loadConversations();
    } catch (err: any) {
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

  const filteredConversations = conversations.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || !user) {
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

  return (
    <main
      style={{
        minHeight: "calc(100vh - 67px)",
        background: "var(--bg)",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          background: "var(--card)",
          border: "1.5px solid var(--border)",
          borderRadius: "18px",
          overflow: "hidden",
          height: "calc(100vh - 107px)",
          display: "grid",
          gridTemplateColumns: "340px 1fr",
        }}
        className="messages-container"
      >
        <div
          style={{
            borderRight: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            background: "var(--card)",
            height: "100%",
            overflow: "hidden",
          }}
          className="messages-sidebar"
        >
          <div
            style={{
              padding: "20px 20px 14px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <h1
              style={{
                fontSize: "18px",
                fontWeight: 800,
                color: "var(--text)",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <MessageCircle size={18} color="var(--primary)" />
              মেসেজ
            </h1>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "9px 12px",
                background: "var(--bg)",
                borderRadius: "10px",
                border: "1px solid var(--border)",
              }}
            >
              <Search size={15} color="var(--muted)" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="খুঁজুন..."
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  color: "var(--text)",
                  fontSize: "13px",
                }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading ? (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  color: "var(--muted)",
                }}
              >
                লোড হচ্ছে...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  color: "var(--muted)",
                }}
              >
                <Inbox
                  size={40}
                  style={{ marginBottom: "10px", opacity: 0.4 }}
                />
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "var(--text)",
                  }}
                >
                  কোনো conversation নেই
                </div>
                <div style={{ fontSize: "12px", marginTop: "4px" }}>
                  Seller-কে listing page থেকে message পাঠান
                </div>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <ConversationItem
                  key={conv.user_id}
                  conv={conv}
                  active={activeUserId === conv.user_id}
                  onClick={() => setActiveUserId(conv.user_id)}
                />
              ))
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            background: "var(--bg)",
          }}
          className={`messages-chat ${showMobileChat ? "mobile-show" : ""}`}
        >
          {!activeUserId ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px",
                color: "var(--muted)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "rgba(108,99,255,0.1)",
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <MessageCircle size={36} />
              </div>
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "var(--text)",
                  marginBottom: "6px",
                }}
              >
                কোনো conversation নির্বাচন করুন
              </h2>
              <p style={{ fontSize: "13px", maxWidth: "300px" }}>
                বাম পাশ থেকে একটি conversation-এ ক্লিক করুন অথবা নতুন message
                শুরু করুন
              </p>
            </div>
          ) : (
            <>
              <div
                style={{
                  padding: "14px 20px",
                  borderBottom: "1px solid var(--border)",
                  background: "var(--card)",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <button
                  onClick={() => {
                    setActiveUserId(null);
                    setShowMobileChat(false);
                  }}
                  className="back-btn-mobile"
                  style={{
                    display: "none",
                    background: "transparent",
                    border: "none",
                    color: "var(--text)",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <ArrowLeft size={20} />
                </button>

                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #6C63FF, #EC4899)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "15px",
                  }}
                >
                  {activeUser?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "var(--text)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {activeUser?.name || "User"}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                    {activeUser?.email}
                  </div>
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {loadingMessages ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "var(--muted)",
                    }}
                  >
                    লোড হচ্ছে...
                  </div>
                ) : messages.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "var(--muted)",
                      fontSize: "13px",
                    }}
                  >
                    এখনো কোনো মেসেজ নেই। প্রথম message পাঠান 👋
                  </div>
                ) : (
                  messages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isMine={msg.sender_id === user.id}
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

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
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="মেসেজ লিখুন..."
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
                      sending || !newMessage.trim()
                        ? "not-allowed"
                        : "pointer",
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
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .messages-container {
            grid-template-columns: 1fr !important;
            height: calc(100vh - 100px) !important;
          }
          .messages-sidebar {
            border-right: none !important;
          }
          .messages-chat {
            display: none !important;
          }
          .messages-chat.mobile-show {
            display: flex !important;
          }
          .messages-container:has(.mobile-show) .messages-sidebar {
            display: none !important;
          }
          .back-btn-mobile {
            display: flex !important;
          }
        }
      `}</style>
    </main>
  );
}

/* ===== CONVERSATION ITEM — FULLY FIXED ===== */
function ConversationItem({
  conv,
  active,
  onClick,
}: {
  conv: Conversation;
  active: boolean;
  onClick: () => void;
}) {
  const formatTime = (iso: string) => {
    if (!iso) return "";
    const date = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0)
      return date.toLocaleTimeString("bn-BD", {
        hour: "2-digit",
        minute: "2-digit",
      });
    if (diffDays === 1) return "গতকাল";
    if (diffDays < 7) return `${diffDays} দিন আগে`;
    return date.toLocaleDateString("bn-BD", {
      month: "short",
      day: "numeric",
    });
  };

  // ✅ FIXED: Use borderStyle/Width/Color separately (NO shorthand anywhere)
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "14px 20px",
        background: active ? "rgba(108,99,255,0.08)" : "transparent",
        borderTopWidth: 0,
        borderTopStyle: "none",
        borderRightWidth: 0,
        borderRightStyle: "none",
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        borderBottomColor: "var(--border)",
        borderLeftWidth: "3px",
        borderLeftStyle: "solid",
        borderLeftColor: active ? "var(--primary)" : "transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        textAlign: "left",
        transition: "background 0.2s",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6C63FF, #EC4899)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: "16px",
          flexShrink: 0,
          position: "relative",
        }}
      >
        {conv.name.charAt(0).toUpperCase()}
        {conv.unread_count > 0 && (
          <span
            style={{
              position: "absolute",
              top: -2,
              right: -2,
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
              borderWidth: "2px",
              borderStyle: "solid",
              borderColor: "var(--card)",
            }}
          >
            {conv.unread_count}
          </span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "2px",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "var(--text)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "60%",
            }}
          >
            {conv.name}
          </span>
          <span
            style={{
              fontSize: "10px",
              color: "var(--muted)",
              flexShrink: 0,
            }}
          >
            {formatTime(conv.last_message_at)}
          </span>
        </div>
        <div
          style={{
            fontSize: "12px",
            color: conv.unread_count > 0 ? "var(--text)" : "var(--muted)",
            fontWeight: conv.unread_count > 0 ? 600 : 400,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {conv.last_message}
        </div>
      </div>
    </button>
  );
}

/* ===== MESSAGE BUBBLE — FULLY FIXED ===== */
function MessageBubble({
  message,
  isMine,
}: {
  message: Message;
  isMine: boolean;
}) {
  const time = new Date(message.created_at).toLocaleTimeString("bn-BD", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isMine ? "flex-end" : "flex-start",
      }}
    >
      <div
        style={{
          maxWidth: "75%",
          padding: "10px 14px",
          borderRadius: isMine
            ? "14px 14px 4px 14px"
            : "14px 14px 14px 4px",
          background: isMine
            ? "linear-gradient(135deg, #6C63FF, #5A52D5)"
            : "var(--card)",
          color: isMine ? "#fff" : "var(--text)",
          // ✅ FIXED: Use borderWidth/Style/Color only for non-mine
          borderWidth: isMine ? 0 : "1px",
          borderStyle: isMine ? "none" : "solid",
          borderColor: isMine ? "transparent" : "var(--border)",
          fontSize: "14px",
          lineHeight: 1.5,
          wordBreak: "break-word",
          boxShadow: isMine ? "0 4px 12px rgba(108,99,255,0.25)" : "none",
        }}
      >
        <div style={{ whiteSpace: "pre-wrap" }}>{message.body}</div>
        <div
          style={{
            fontSize: "10px",
            marginTop: "4px",
            textAlign: "right",
            opacity: 0.7,
          }}
        >
          {time}
          {isMine && message.is_read && " ✓✓"}
        </div>
      </div>
    </div>
  );
}
