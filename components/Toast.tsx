"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
}

let toastCounter = 0;
const listeners: Array<(toast: ToastItem) => void> = [];

export function showToast(type: ToastType, title: string, message?: string) {
  const toast: ToastItem = {
    id: ++toastCounter,
    type,
    title,
    message,
  };
  listeners.forEach((listener) => listener(toast));
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener = (toast: ToastItem) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4000);
    };
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getStyle = (type: ToastType) => {
    if (type === "success")
      return { bg: "#10b981", icon: <CheckCircle size={20} /> };
    if (type === "error")
      return { bg: "#ef4444", icon: <XCircle size={20} /> };
    return { bg: "#6C63FF", icon: <Info size={20} /> };
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        maxWidth: "380px",
      }}
    >
      {toasts.map((toast) => {
        const style = getStyle(toast.type);
        return (
          <div
            key={toast.id}
            style={{
              background: "var(--card)",
              border: "1.5px solid var(--border)",
              borderLeft: `4px solid ${style.bg}`,
              borderRadius: "12px",
              padding: "14px 16px",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              animation: "slideIn 0.3s ease-out",
            }}
          >
            <div style={{ color: style.bg, flexShrink: 0, marginTop: "2px" }}>
              {style.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text)" }}>
                {toast.title}
              </div>
              {toast.message && (
                <div style={{ fontSize: "13px", color: "var(--muted)", marginTop: "2px" }}>
                  {toast.message}
                </div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--muted)",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
