"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export default function TestAuthPage() {
  const { user, signUp, signIn, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(email, password);
      toast.success("Successfully signed up!");
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("Successfully signed in!");
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Successfully signed out!");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Test Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <div className="space-y-4">
              <div>
                <p>Logged in as: {user.email}</p>
                {user.displayName && <p>Display Name: {user.displayName}</p>}
              </div>
              <Button onClick={handleSignOut} disabled={loading}>
                Sign Out
              </Button>
            </div>
          ) : (
            <form className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleSignUp}
                  disabled={loading}
                  variant="outline"
                >
                  Sign Up
                </Button>
                <Button type="submit" onClick={handleSignIn} disabled={loading}>
                  Sign In
                </Button>
              </div>
            </form>
          )}

          <div className="mt-4 text-sm text-muted-foreground">
            <p>Current Auth State:</p>
            <pre className="mt-2 p-2 bg-muted rounded-md overflow-auto">
              {JSON.stringify({ user, loading }, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
