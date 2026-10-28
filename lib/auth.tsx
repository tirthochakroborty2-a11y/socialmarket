"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "superadmin";
  coin_balance: number;
  is_banned: boolean;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const buildFallbackProfile = (authUser: User): Profile => ({
    id: authUser.id,
    name:
      authUser.user_metadata?.name ||
      authUser.email?.split("@")[0] ||
      "User",
    email: authUser.email || "",
    role: "user",
    coin_balance: 0,
    is_banned: false,
    avatar_url: null,
  });

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Profile fetch error:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });

        // Fallback 1: user metadata
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          setProfile(buildFallbackProfile(userData.user));
        }
        return;
      }

      if (data) {
        setProfile(data as Profile);
      } else {
        // No profile row exists — try to create one
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const fallbackName =
            userData.user.user_metadata?.name ||
            userData.user.email?.split("@")[0] ||
            "User";

          const { data: createdProfile, error: insertErr } = await supabase
            .from("profiles")
            .insert({
              id: userData.user.id,
              name: fallbackName,
              email: userData.user.email,
              role: "user",
              coin_balance: 0,
            })
            .select()
            .single();

          if (!insertErr && createdProfile) {
            setProfile(createdProfile as Profile);
          } else {
            // Final fallback: local state
            setProfile({
              id: userData.user.id,
              name: fallbackName,
              email: userData.user.email || "",
              role: "user",
              coin_balance: 0,
              is_banned: false,
              avatar_url: null,
            });
          }
        }
      }
    } catch (err: any) {
      console.error("Profile fetch exception:", err);
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!mounted) return;
        setUser(data.user);
        if (data.user) {
          await fetchProfile(data.user.id);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
