"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authService } from "./auth-service";

type AuthUser = {
  id: string;
  email: string;
  fullName?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: { fullName: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const userData = await authService.getCurrentUser();
      if (userData) {
        const profile = await authService.getProfile(userData.id);
        setUser({
          id: userData.id,
          email: userData.email,
          fullName: profile?.fullName,
        });
      }
    } catch (error) {
      console.error("Error checking user session:", error);
    } finally {
      setLoading(false);
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { user } = await authService.signIn(email, password);
      if (user) {
        const profile = await authService.getProfile(user.id);
        setUser({
          id: user.id,
          email: user.email,
          fullName: profile?.fullName,
        });
        toast.success("Successfully signed in!");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to sign in");
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { user } = await authService.signUp(email, password);
      if (user) {
        setUser({
          id: user.id,
          email: user.email,
          fullName: "",
        });
        toast.success("Account created successfully!");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create account"
      );
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      router.push("/login");
      toast.success("Successfully signed out!");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  const updateProfile = async (profile: { fullName: string }) => {
    if (!user) return;

    try {
      await authService.updateProfile(user.id, {
        fullName: profile.fullName,
      });
      setUser({ ...user, fullName: profile.fullName });
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signOut, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
