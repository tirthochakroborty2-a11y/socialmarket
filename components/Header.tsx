"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import {
  Sparkle,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  User,
  LayoutDashboard,
  Wallet,
  Shield,
  Plus,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { createClient } from "@/lib/supabase/client";

function HeaderInner() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const supabase = createClient();

  useEffect(() => {
    setDrawerOpen(false);
    setAvatarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const fetchUnread = async () => {
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", user.id)
        .eq("is_read", false);
      setUnreadCount(count || 0);
    };

    fetchUnread();

    const channel = supabase
      .channel("header-unread")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          fetchUnread();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { href: "/", label: "হোম" },
    { href: "/browse", label: "ব্রাউজ" },
    { href: "/about", label: "আমাদের সম্পর্কে" },
    { href: "/faq", label: "FAQ" },
    { href: "/support", label: "সাপোর্ট" },
  ];

  const isActive = (href: string) => pathname === href;

  const userPages = [
    "/dashboard",
    "/wallet",
    "/profile",
    "/messages",
    "/create-listing",
    "/orders",
  ];
  const isUserPage = userPages.some((p) => pathname.startsWith(p));

  const isAdminPage =
    pathname.startsWith("/admin") || pathname.startsWith("/superadmin");

  const initial = profile?.name?.charAt(0).toUpperCase() || "U";
  const isSellPage = pathname === "/create-listing";
  const isMessagesPage = pathname === "/messages";

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "var(--card)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "10px",
                background: "linear-gradient(135deg, #6C63FF, #5A52D5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(108,99,255,0.3)",
              }}
            >
              <Sparkle size={20} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.5px" }}>
              <span style={{ color: "var(--text)" }}>Social</span>
              <span style={{ color: "var(--primary)" }}>Market</span>
            </span>
          </Link>

          <nav
            className="desktop-nav"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "28px",
              flex: 1,
              justifyContent: "center",
            }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: isActive(link.href) ? "var(--primary)" : "var(--muted)",
                  transition: "color 0.2s",
                  position: "relative",
                  paddingBottom: "2px",
                }}
              >
                {link.label}
                {isActive(link.href) && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-6px",
                      left: 0,
                      right: 0,
                      height: 2,
                      background: "var(--primary)",
                      borderRadius: 1,
                    }}
                  />
                )}
              </Link>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {user && (
              <Link
                href="/create-listing"
                className="sell-btn-desktop"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "9px 16px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#fff",
                  background: isSellPage
                    ? "linear-gradient(135deg, #5A52D5, #6C63FF)"
                    : "linear-gradient(135deg, #6C63FF, #EC4899)",
                  boxShadow: isSellPage
                    ? "0 4px 16px rgba(108,99,255,0.5), 0 0 0 3px rgba(108,99,255,0.2)"
                    : "0 4px 14px rgba(108,99,255,0.3)",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                <Plus size={16} />
                Sell করুন
              </Link>
            )}

            {user && (
              <Link
                href="/messages"
                className="messages-icon-desktop"
                style={{
                  position: "relative",
                  width: 38,
                  height: 38,
                  borderRadius: "10px",
                  border: isMessagesPage
                    ? "1.5px solid var(--primary)"
                    : "1.5px solid var(--border)",
                  background: isMessagesPage
                    ? "rgba(108,99,255,0.1)"
                    : "var(--bg)",
                  color: isMessagesPage ? "var(--primary)" : "var(--text)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                }}
              >
                <MessageCircle size={18} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
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
                      border: "2px solid var(--card)",
                    }}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            )}

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              style={{
                width: 38,
                height: 38,
                borderRadius: "10px",
                border: "1.5px solid var(--border)",
                background: "var(--bg)",
                color: "var(--text)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {!user && (
              <Link href="/login" className="btn-primary hidden-mobile">
                লগইন
              </Link>
            )}

            {user && (
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setAvatarOpen(!avatarOpen)}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #6C63FF, #5A52D5)",
                    color: "#fff",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "15px",
                    cursor: "pointer",
                    boxShadow: isUserPage
                      ? "0 0 0 3px rgba(108,99,255,0.2), 0 0 0 4.5px var(--primary)"
                      : avatarOpen
                      ? "0 0 0 3px rgba(108,99,255,0.2)"
                      : "none",
                    transition: "box-shadow 0.2s",
                  }}
                >
                  {initial}
                </button>

                {avatarOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "46px",
                      right: 0,
                      background: "var(--card)",
                      border: "1.5px solid var(--border)",
                      borderRadius: "12px",
                      padding: "8px",
                      minWidth: "220px",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
                      zIndex: 200,
                    }}
                  >
                    <div
                      style={{
                        padding: "10px 12px",
                        borderBottom: "1px solid var(--border)",
                        marginBottom: "4px",
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text)" }}>
                        {profile?.name || user?.email?.split("@")[0] || "User"}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                        {profile?.email || user?.email || ""}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "var(--primary)",
                          fontWeight: 700,
                          marginTop: "4px",
                        }}
                      >
                        ৳ {Number(profile?.coin_balance || 0).toLocaleString()}
                      </div>
                    </div>
                    <MenuItem
                      href="/profile"
                      icon={<User size={15} />}
                      label="প্রোফাইল"
                      active={pathname === "/profile"}
                    />
                    <MenuItem
                      href="/dashboard"
                      icon={<LayoutDashboard size={15} />}
                      label="ড্যাশবোর্ড"
                      active={pathname === "/dashboard"}
                    />
                    <MenuItem
                      href="/wallet"
                      icon={<Wallet size={15} />}
                      label="ওয়ালেট"
                      active={pathname === "/wallet"}
                    />
                    <MenuItem
                      href="/messages"
                      icon={<MessageCircle size={15} />}
                      label="মেসেজ"
                      active={pathname === "/messages"}
                    />
                    {profile?.role === "admin" && (
                      <MenuItem
                        href="/admin/dashboard"
                        icon={<Shield size={15} />}
                        label="Admin Panel"
                        active={isAdminPage}
                      />
                    )}
                    {profile?.role === "superadmin" && (
                      <MenuItem
                        href="/superadmin/dashboard"
                        icon={<Shield size={15} />}
                        label="Super Admin"
                        active={isAdminPage}
                      />
                    )}
                    <button
                      onClick={handleLogout}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 12px",
                        background: "transparent",
                        border: "none",
                        color: "#ef4444",
                        fontWeight: 600,
                        fontSize: "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        marginTop: "4px",
                      }}
                    >
                      <LogOut size={15} /> লগআউট
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setDrawerOpen(true)}
              className="hamburger"
              style={{
                display: "none",
                width: 38,
                height: 38,
                borderRadius: "10px",
                border: "1.5px solid var(--border)",
                background: "var(--bg)",
                color: "var(--text)",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                position: "relative",
              }}
            >
              <Menu size={20} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    background: "#ef4444",
                    color: "#fff",
                    fontSize: "9px",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 4px",
                    border: "2px solid var(--card)",
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 998,
          }}
        />
      )}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: drawerOpen ? 0 : "-320px",
          width: "300px",
          height: "100vh",
          background: "var(--card)",
          borderLeft: "1px solid var(--border)",
          zIndex: 999,
          transition: "right 0.3s ease",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 800, fontSize: "18px", color: "var(--text)" }}>
            Menu
          </span>
          <button
            onClick={() => setDrawerOpen(false)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text)",
              cursor: "pointer",
            }}
          >
            <X size={22} />
          </button>
        </div>

        {profile && (
          <div
            style={{
              padding: "14px",
              background: "var(--bg)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6C63FF, #5A52D5)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
              }}
            >
              {initial}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text)" }}>
                {profile.name}
              </div>
              <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                ৳ {Number(profile.coin_balance || 0).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {user && (
          <Link
            href="/create-listing"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "12px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 700,
              color: "#fff",
              background: "linear-gradient(135deg, #6C63FF, #EC4899)",
              boxShadow: "0 4px 14px rgba(108,99,255,0.3)",
            }}
          >
            <Plus size={16} />
            Sell করুন
          </Link>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: "12px",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: 600,
                color: isActive(link.href) ? "var(--primary)" : "var(--text)",
                background: isActive(link.href) ? "rgba(108,99,255,0.1)" : "transparent",
              }}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <>
              <div style={{ height: 1, background: "var(--border)", margin: "8px 0" }} />
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  padding: "4px 12px",
                }}
              >
                আপনার অ্যাকাউন্ট
              </div>
              <Link
                href="/dashboard"
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  fontWeight: 600,
                  color: isActive("/dashboard") ? "var(--primary)" : "var(--text)",
                  background: isActive("/dashboard") ? "rgba(108,99,255,0.1)" : "transparent",
                }}
              >
                ড্যাশবোর্ড
              </Link>
              <Link
                href="/wallet"
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  fontWeight: 600,
                  color: isActive("/wallet") ? "var(--primary)" : "var(--text)",
                  background: isActive("/wallet") ? "rgba(108,99,255,0.1)" : "transparent",
                }}
              >
                ওয়ালেট
              </Link>
              <Link
                href="/messages"
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  fontWeight: 600,
                  color: isActive("/messages") ? "var(--primary)" : "var(--text)",
                  background: isActive("/messages") ? "rgba(108,99,255,0.1)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>মেসেজ</span>
                {unreadCount > 0 && (
                  <span
                    style={{
                      background: "#ef4444",
                      color: "#fff",
                      fontSize: "10px",
                      fontWeight: 800,
                      padding: "2px 7px",
                      borderRadius: 99,
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </Link>
              <Link
                href="/profile"
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  fontWeight: 600,
                  color: isActive("/profile") ? "var(--primary)" : "var(--text)",
                  background: isActive("/profile") ? "rgba(108,99,255,0.1)" : "transparent",
                }}
              >
                প্রোফাইল
              </Link>
            </>
          )}
        </div>

        {!user ? (
          <Link href="/login" className="btn-primary" style={{ textAlign: "center" }}>
            লগইন
          </Link>
        ) : (
          <button
            onClick={handleLogout}
            className="btn-outline"
            style={{ color: "#ef4444", borderColor: "#ef4444" }}
          >
            লগআউট
          </button>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .sell-btn-desktop { display: none !important; }
        }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .messages-icon-desktop { display: none !important; }
          .hamburger { display: flex !important; }
          .hidden-mobile { display: none !important; }
        }
      `}</style>
    </>
  );
}

function MenuItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        padding: "10px 12px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontSize: "14px",
        fontWeight: 600,
        color: active ? "var(--primary)" : "var(--text)",
        background: active ? "rgba(108,99,255,0.1)" : "transparent",
        borderRadius: "8px",
      }}
    >
      {icon} {label}
    </Link>
  );
}

export function Header() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            height: "67px",
            borderBottom: "1px solid var(--border)",
            background: "var(--card)",
          }}
        />
      }
    >
      <HeaderInner />
    </Suspense>
  );
}
