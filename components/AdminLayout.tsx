"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  AlertTriangle,
  Wallet,
  ArrowDownToLine,
  LogOut,
  Menu,
  X,
  Crown,
  Shield,
  Home,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/listings", label: "Listings", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/disputes", label: "Disputes", icon: AlertTriangle },
  { href: "/admin/payments", label: "Wallet Payments", icon: Wallet },
  { href: "/admin/withdraws", label: "Withdraws", icon: ArrowDownToLine },
];

export default function AdminLayout({
  children,
  title,
  subtitle,
}: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const isActive = (href: string) => pathname === href;
  const isSuperAdmin = profile?.role === "superadmin";

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#0b1120",
        color: "#f1f5f9",
        fontFamily: "inherit",
      }}
    >
      {/* SIDEBAR OVERLAY (mobile) */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 98,
          }}
          className="admin-overlay"
        />
      )}

      {/* SIDEBAR */}
      <aside
        style={{
          width: 260,
          background: "linear-gradient(180deg, #151d2e, #0f1826)",
          borderRight: "1px solid #253049",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 99,
          transition: "left 0.3s",
        }}
        className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}
      >
        {/* Logo */}
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #253049",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
          }}
        >
          <Link
            href="/admin/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                background: isSuperAdmin
                  ? "linear-gradient(135deg, #EC4899, #F59E0B)"
                  : "linear-gradient(135deg, #6C63FF, #5A52D5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: isSuperAdmin
                  ? "0 4px 14px rgba(236,72,153,0.4)"
                  : "0 4px 14px rgba(108,99,255,0.4)",
              }}
            >
              {isSuperAdmin ? (
                <Crown size={18} color="#fff" />
              ) : (
                <Shield size={18} color="#fff" />
              )}
            </div>
            <div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: "#f1f5f9",
                  lineHeight: 1.2,
                }}
              >
                {isSuperAdmin ? "Super Admin" : "Admin Panel"}
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "#64748b",
                  fontWeight: 600,
                }}
              >
                SocialMarket
              </div>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              display: "none",
              padding: 4,
            }}
            className="admin-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Profile badge */}
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid #253049",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: isSuperAdmin
                ? "linear-gradient(135deg, #EC4899, #F59E0B)"
                : "linear-gradient(135deg, #6C63FF, #EC4899)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "14px",
            }}
          >
            {profile?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#f1f5f9",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {profile?.name || "Admin"}
            </div>
            <div
              style={{
                fontSize: "10px",
                color: isSuperAdmin ? "#f472b6" : "#64748b",
                textTransform: "capitalize",
                fontWeight: 700,
              }}
            >
              {profile?.role || "admin"}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          {/* Super Admin shortcut — only if superadmin */}
          {isSuperAdmin && (
            <>
              <Link
                href="/superadmin/dashboard"
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "11px 12px",
                  borderRadius: "10px",
                  marginBottom: "8px",
                  textDecoration: "none",
                  fontSize: "13px",
                  fontWeight: 800,
                  color: "#fff",
                  background: "linear-gradient(135deg, #EC4899, #F59E0B)",
                  boxShadow: "0 4px 14px rgba(236,72,153,0.4)",
                }}
              >
                <Crown size={16} />
                Super Admin Panel
              </Link>
              <div
                style={{
                  height: 1,
                  background: "rgba(236,72,153,0.15)",
                  margin: "4px 6px 10px",
                }}
              />
            </>
          )}

          {/* Standard admin nav */}
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  marginBottom: "2px",
                  textDecoration: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: active ? "#fff" : "#94a3b8",
                  background: active
                    ? isSuperAdmin
                      ? "linear-gradient(135deg, #EC4899, #F59E0B)"
                      : "linear-gradient(135deg, #6C63FF, #5A52D5)"
                    : "transparent",
                  transition: "all 0.2s",
                }}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: "12px 10px", borderTop: "1px solid #253049" }}>
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "10px",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 600,
              color: "#94a3b8",
              marginBottom: "4px",
            }}
          >
            <Home size={16} />
            সাইটে ফিরুন
          </Link>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "10px",
              border: "none",
              background: "rgba(239,68,68,0.1)",
              color: "#f87171",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <LogOut size={16} />
            লগআউট
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div
        style={{
          flex: 1,
          marginLeft: 260,
          minHeight: "100vh",
        }}
        className="admin-main"
      >
        {/* Top bar */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            background: "rgba(11,17,32,0.9)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid #253049",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              display: "none",
              padding: 4,
            }}
            className="admin-menu-btn"
          >
            <Menu size={22} />
          </button>
          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontSize: "20px",
                fontWeight: 800,
                color: "#f1f5f9",
                marginBottom: "2px",
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p style={{ fontSize: "12px", color: "#94a3b8" }}>{subtitle}</p>
            )}
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: "24px" }}>{children}</div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .admin-sidebar {
            left: -260px;
          }
          .admin-sidebar.open {
            left: 0 !important;
          }
          .admin-main {
            margin-left: 0 !important;
          }
          .admin-menu-btn {
            display: flex !important;
          }
          .admin-close-btn {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
