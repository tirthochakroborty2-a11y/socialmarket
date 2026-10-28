"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import {
  Search,
  ChevronDown,
  HelpCircle,
  Shield,
  Wallet,
  ShoppingCart,
  Users,
  X,
  ArrowRight,
  MessageCircle,
} from "lucide-react";

type Category = "all" | "escrow" | "buying" | "selling" | "wallet" | "chat";

interface FAQItem {
  id: number;
  category: Exclude<Category, "all">;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 1,
    category: "escrow",
    question: "Escrow সিস্টেম কীভাবে কাজ করে?",
    answer:
      "যখন আপনি কোনো listing কেনেন, আপনার টাকা সরাসরি seller-এর কাছে যায় না। বরং আমাদের প্ল্যাটফর্মের escrow অ্যাকাউন্টে জমা থাকে। আপনি অ্যাকাউন্ট বুঝে নেওয়ার পর 'Confirm Received' ক্লিক করলে টাকা seller-এর wallet-এ চলে যায়। যদি কোনো সমস্যা হয়, তাহলে ৭২ ঘণ্টার মধ্যে admin-কে জানাতে পারবেন।",
  },
  {
    id: 2,
    category: "escrow",
    question: "টাকা কখন সেলার পাবে?",
    answer:
      "দুইভাবে সেলার টাকা পেতে পারেন: (১) Buyer 'Confirm Received' ক্লিক করলে সাথে সাথে, অথবা (২) Buyer ৭২ ঘণ্টার মধ্যে কিছু না করলে auto-complete হয়ে যায়। এই ৭২ ঘণ্টা হলো buyer-এর protection window।",
  },
  {
    id: 3,
    category: "escrow",
    question: "Dispute হলে কী হবে?",
    answer:
      "কোনো সমস্যা হলে 'Report Problem' বাটনে ক্লিক করুন। আমাদের admin টিম deal chat-এ যোগ দেবে এবং উভয় পক্ষের কথা শুনে সিদ্ধান্ত নেবে। যদি seller প্রতারক হন, তাহলে আপনার টাকা সম্পূর্ণ ফেরত দেওয়া হবে।",
  },
  {
    id: 4,
    category: "buying",
    question: "কেনা-বেচা কীভাবে শুরু করবো?",
    answer:
      "প্রথমে register করুন। তারপর wallet-এ coin কিনুন (bKash/Nagad-এর মাধ্যমে)। এরপর browse page থেকে পছন্দের listing খুঁজে 'Buy Now' ক্লিক করুন। অর্ডার হলে auto-একটা group chat তৈরি হবে যেখানে buyer, seller এবং admin থাকবেন।",
  },
  {
    id: 5,
    category: "buying",
    question: "Coin সিস্টেম কী?",
    answer:
      "আমাদের প্ল্যাটফর্মে ১ টাকা = ১ Coin। আপনি bKash বা Nagad-এর মাধ্যমে coin কিনতে পারেন। Admin approve করার পর আপনার wallet-এ coin যোগ হবে। এরপর সেই coin দিয়ে listing কিনতে পারবেন।",
  },
  {
    id: 6,
    category: "buying",
    question: "কেনার সময় কি কোনো ফি আছে?",
    answer:
      "আমরা buyer-দের কোনো বাড়তি ফি নিই না। শুধু listing-এর দামটুকুই দিতে হবে। Seller-দের কাছ থেকে ৫% commission নেওয়া হয় যা প্ল্যাটফর্ম মেইনটেইন করতে ব্যবহৃত হয়।",
  },
  {
    id: 7,
    category: "selling",
    question: "কীভাবে listing তৈরি করবো?",
    answer:
      "'Sell' বা 'বিক্রি শুরু করুন' বাটনে ক্লিক করুন। ৪ ধাপে তথ্য দিন: (১) প্ল্যাটফর্ম ও অ্যাকাউন্ট link, (২) শিরোনাম, দাম, ফলোয়ার, বিবরণ, (৩) handover পদ্ধতি, (৪) ছবি। Submit করার পর admin approve করলে সেটা browse page-এ দেখা যাবে।",
  },
  {
    id: 8,
    category: "selling",
    question: "কত তাড়াতাড়ি টাকা পাবো?",
    answer:
      "Buyer 'Confirm Received' ক্লিক করলে অথবা ৭২ ঘণ্টা পর auto-complete হলে সাথে সাথে আপনার wallet-এ টাকা যোগ হবে। এরপর withdraw request দিলে admin approve করার পর bKash/Nagad-এ পাঠিয়ে দেওয়া হবে।",
  },
  {
    id: 9,
    category: "selling",
    question: "আমার listing reject হলে কী করবো?",
    answer:
      "যদি listing admin reject করেন, dashboard-এ কারণ দেখতে পারবেন। সাধারণত অসম্পূর্ণ তথ্য, নকল ছবি বা নিয়ম লঙ্ঘন হলে reject হয়। তথ্য ঠিক করে আবার submit করতে পারবেন।",
  },
  {
    id: 10,
    category: "wallet",
    question: "কীভাবে coin কিনবো?",
    answer:
      "Wallet page-এ 'Buy Coins' বাটনে ক্লিক করুন। পরিমাণ লিখুন, bKash/Nagad বেছে নিন। আমাদের admin number 01572972953-এ Send Money করুন। তারপর TXN ID ও আপনার ফোন নম্বর দিন। Admin যাচাই করে approve করলে coin যোগ হবে।",
  },
  {
    id: 11,
    category: "wallet",
    question: "Withdraw করতে কত সময় লাগে?",
    answer:
      "সাধারণত ২৪ ঘণ্টার মধ্যে। Admin approve করার পর আপনার দেওয়া bKash/Nagad নম্বরে টাকা পাঠিয়ে দেওয়া হয়। সাপ্তাহিক ছুটির দিনে একটু বেশি সময় লাগতে পারে।",
  },
  {
    id: 12,
    category: "wallet",
    question: "Withdraw minimum কত?",
    answer:
      "সর্বনিম্ন ৫০০ টাকা withdraw করা যাবে। তবে কোনো maximum limit নেই। Withdraw fee নেই — পুরো টাকা পাবেন।",
  },
  {
    id: 13,
    category: "chat",
    question: "Admin Group Chat কী?",
    answer:
      "যখনই কোনো order তৈরি হয়, auto-একটা group chat তৈরি হয় যেখানে ৩ জন member থাকেন: buyer, seller এবং একজন admin। এখানে সবাই একসাথে কথা বলতে পারেন। Admin সব মেসেজ দেখেন যাতে কোনো প্রতারণা হলে প্রমাণ থাকে।",
  },
  {
    id: 14,
    category: "chat",
    question: "Seller-কে সরাসরি message পাঠাতে পারবো?",
    answer:
      "হ্যাঁ, listing details page-এ 'সেলারকে মেসেজ' বাটনে ক্লিক করে direct message পাঠাতে পারেন। তবে লেনদেন সবসময় admin-monitored group chat-এ করতে হবে — এটাই আমাদের safety guarantee।",
  },
  {
    id: 15,
    category: "chat",
    question: "Group chat-এ কে কে থাকেন?",
    answer:
      "শুধু ৩ জন — buyer, seller এবং একজন admin। বাইরের কেউ এই chat দেখতে বা join করতে পারবেন না। সব মেসেজ log করা থাকে, যাতে ভবিষ্যতে কোনো dispute হলে প্রমাণ হিসেবে ব্যবহার করা যায়।",
  },
];

const CATEGORIES: { value: Category; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "সব প্রশ্ন", icon: <HelpCircle size={16} /> },
  { value: "escrow", label: "Escrow", icon: <Shield size={16} /> },
  { value: "buying", label: "কেনা", icon: <ShoppingCart size={16} /> },
  { value: "selling", label: "বেচা", icon: <Users size={16} /> },
  { value: "wallet", label: "ওয়ালেট", icon: <Wallet size={16} /> },
  { value: "chat", label: "Chat", icon: <MessageCircle size={16} /> },
];

export default function FAQContent() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<number | null>(1);

  const filteredFAQs = useMemo(() => {
    let result = FAQ_DATA;

    if (activeCategory !== "all") {
      result = result.filter((f) => f.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (f) =>
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q)
      );
    }

    return result;
  }, [activeCategory, search]);

  return (
    <main style={{ paddingBottom: "60px" }}>
      {/* ===== HERO ===== */}
      <section
        style={{
          background: "linear-gradient(135deg, #6C63FF 0%, #5A52D5 100%)",
          padding: "70px 20px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            top: -100,
            right: -60,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            bottom: -60,
            left: -40,
          }}
        />

        <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              padding: "8px 16px",
              borderRadius: "99px",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 600,
              marginBottom: "20px",
            }}
          >
            <HelpCircle size={14} />
            সাহায্য কেন্দ্র
          </div>

          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 44px)",
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1.2,
              marginBottom: "16px",
              letterSpacing: "-1px",
            }}
          >
            সাধারণ প্রশ্ন ও উত্তর
          </h1>
          <p
            style={{
              fontSize: "15px",
              color: "rgba(255,255,255,0.9)",
              marginBottom: "32px",
            }}
          >
            আপনার প্রশ্নের উত্তর এখানে খুঁজুন
          </p>

          {/* Search bar */}
          <div
            style={{
              display: "flex",
              maxWidth: "560px",
              margin: "0 auto",
              background: "#fff",
              borderRadius: "14px",
              padding: "6px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", paddingLeft: "16px" }}>
              <Search size={20} color="#667085" />
            </div>
            <input
              type="text"
              placeholder="প্রশ্ন খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                padding: "14px 16px",
                fontSize: "15px",
                background: "transparent",
                color: "#101828",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#667085",
                  cursor: "pointer",
                  paddingRight: "16px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ===== CONTENT ===== */}
      <div
        className="faq-wrapper"
        style={{
          maxWidth: "900px",
          margin: "-30px auto 0",
          padding: "0 20px",
          position: "relative",
          zIndex: 3,
        }}
      >
        {/* Categories */}
        <div
          style={{
            background: "var(--card)",
            border: "1.5px solid var(--border)",
            borderRadius: "16px",
            padding: "12px",
            marginBottom: "24px",
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "9px 16px",
                borderRadius: "10px",
                border: "none",
                background:
                  activeCategory === cat.value ? "var(--primary)" : "transparent",
                color: activeCategory === cat.value ? "#fff" : "var(--text)",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Result count */}
        {(search || activeCategory !== "all") && (
          <div
            style={{
              fontSize: "13px",
              color: "var(--muted)",
              marginBottom: "16px",
              paddingLeft: "4px",
            }}
          >
            {filteredFAQs.length} টি প্রশ্ন পাওয়া গেছে
          </div>
        )}

        {/* FAQ List */}
        {filteredFAQs.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "var(--card)",
              border: "1.5px dashed var(--border)",
              borderRadius: "16px",
              color: "var(--muted)",
            }}
          >
            <HelpCircle size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
            <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)", marginBottom: "8px" }}>
              কোনো প্রশ্ন পাওয়া যায়নি
            </div>
            <div style={{ fontSize: "14px" }}>
              অন্য কিছু খুঁজুন বা সাপোর্টে যোগাযোগ করুন
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filteredFAQs.map((faq) => (
              <AccordionItem
                key={faq.id}
                faq={faq}
                isOpen={openId === faq.id}
                onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
              />
            ))}
          </div>
        )}

        {/* Support CTA */}
        <div
          style={{
            marginTop: "32px",
            background: "linear-gradient(135deg, #6C63FF 0%, #EC4899 100%)",
            borderRadius: "16px",
            padding: "32px 24px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 150,
              height: 150,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.1)",
              top: -60,
              right: -30,
            }}
          />
          <div style={{ position: "relative", zIndex: 2 }}>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: 800,
                color: "#fff",
                marginBottom: "8px",
              }}
            >
              আপনার প্রশ্নের উত্তর পাননি?
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.9)",
                marginBottom: "20px",
              }}
            >
              আমাদের সাপোর্ট টিম ২৪/৭ আপনার জন্য প্রস্তুত
            </p>
            <Link
              href="/support"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#fff",
                color: "#6C63FF",
                padding: "12px 24px",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "14px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              }}
            >
              সাপোর্টে যোগাযোগ করুন <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .faq-wrapper { padding: 0 16px !important; }
        }
      `}</style>
    </main>
  );
}

/* ===== ACCORDION ITEM ===== */
function AccordionItem({
  faq,
  isOpen,
  onToggle,
}: {
  faq: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const categoryLabels: Record<Exclude<Category, "all">, string> = {
    escrow: "Escrow",
    buying: "কেনা",
    selling: "বেচা",
    wallet: "ওয়ালেট",
    chat: "Chat",
  };

  return (
    <div
      style={{
        background: "var(--card)",
        border: isOpen ? "1.5px solid var(--primary)" : "1.5px solid var(--border)",
        borderRadius: "14px",
        overflow: "hidden",
        transition: "border 0.2s",
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          padding: "18px 20px",
          background: "transparent",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ flex: 1, display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              background: isOpen ? "rgba(108,99,255,0.15)" : "var(--bg)",
              color: isOpen ? "var(--primary)" : "var(--muted)",
              padding: "4px 10px",
              borderRadius: "6px",
              whiteSpace: "nowrap",
              flexShrink: 0,
              marginTop: "2px",
            }}
          >
            {categoryLabels[faq.category]}
          </span>
          <span
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: "var(--text)",
              lineHeight: 1.4,
            }}
          >
            {faq.question}
          </span>
        </div>
        <ChevronDown
          size={20}
          color={isOpen ? "var(--primary)" : "var(--muted)"}
          style={{
            flexShrink: 0,
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.25s",
          }}
        />
      </button>

      <div
        style={{
          maxHeight: isOpen ? "500px" : "0",
          overflow: "hidden",
          transition: "max-height 0.3s ease",
        }}
      >
        <div
          style={{
            padding: "0 20px 20px 20px",
            fontSize: "14px",
            color: "var(--muted)",
            lineHeight: 1.7,
          }}
        >
          {faq.answer}
        </div>
      </div>
    </div>
  );
}
