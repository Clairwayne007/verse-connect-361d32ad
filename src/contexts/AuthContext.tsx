import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";

export type AppRole = "admin" | "moderator" | "user";

export interface User {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  balance: number;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** True once the initial session restore has completed (regardless of result) */
  isReady: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ success: boolean; needsEmailConfirmation?: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const fetchProfile = useCallback(async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      const [profileResult, roleResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("id", supabaseUser.id)
          .maybeSingle(),
        supabase.rpc("get_user_role", { _user_id: supabaseUser.id }),
      ]);

      if (profileResult.error) {
        console.error("Error fetching profile:", profileResult.error);
        return null;
      }

      const profile = profileResult.data;
      const userRole = (roleResult.data || "user") as AppRole;

      if (!profile) {
        return null;
      }

      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: userRole,
        balance: Number(profile.balance) || 0,
        createdAt: profile.created_at,
      };
    } catch (err) {
      console.error("Error in fetchProfile:", err);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return;

    const profile = await fetchProfile(session.user);
    if (profile) {
      setUser(profile);
    }
  }, [fetchProfile, session]);

  useEffect(() => {
    let mounted = true;

    // 1. Restore session from storage FIRST
    supabase.auth.getSession().then(async ({ data: { session: restoredSession } }) => {
      if (!mounted) return;
      setSession(restoredSession);

      if (restoredSession?.user) {
        const profile = await fetchProfile(restoredSession.user);
        if (!mounted) return;
        setUser(profile);
      }
      setIsLoading(false);
      setIsReady(true);
    }).catch((err) => {
      console.error("Error restoring session:", err);
      if (!mounted) return;
      setIsLoading(false);
      setIsReady(true);
    });

    // 2. Listen for subsequent auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        // Skip INITIAL_SESSION since getSession above already handles it
        if (event === "INITIAL_SESSION") return;

        if (event === "TOKEN_REFRESHED" && !newSession) {
          console.log("Token refresh failed, signing out...");
          supabase.auth.signOut();
          setUser(null);
          setSession(null);
          return;
        }

        setSession(newSession);

        if (newSession?.user) {
          // Fetch profile without setTimeout to avoid race conditions
          const profile = await fetchProfile(newSession.user);
          if (!mounted) return;
          setUser(profile);

          if (event === "SIGNED_IN" && profile) {
            try {
              const { data: profileData } = await supabase
                .from("profiles")
                .select("welcome_email_sent")
                .eq("id", newSession.user.id)
                .single();

              if (profileData && !profileData.welcome_email_sent) {
                supabase.functions.invoke("send-welcome-email", {
                  body: { email: profile.email, name: profile.name },
                }).then(() => {
                  supabase
                    .from("profiles")
                    .update({ welcome_email_sent: true })
                    .eq("id", newSession.user.id);
                }).catch((err) => console.error("Welcome email error:", err));
              }
            } catch (err) {
              console.error("Welcome email error:", err);
            }
          }
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = supabase
      .channel(`profile-${session.user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${session.user.id}`,
        },
        () => {
          refreshProfile();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshProfile, session?.user?.id]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; needsEmailConfirmation?: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const needsEmailConfirmation = !data.session;
      return { success: true, needsEmailConfirmation };
    } catch (err) {
      console.error("Register error:", err);
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Logout error:", err);
    }
    setUser(null);
    setSession(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!session,
        isLoading,
        isReady,
        login,
        register,
        logout,
        updateUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
