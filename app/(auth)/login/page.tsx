"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, BarChart3, PiggyBank, Wallet } from "lucide-react";
import Link from "next/link";
import { PrivacyPolicyDialog } from "@/components/privacy-policy";
import { AccountStatusDialog } from "@/components/account-status-dialog";

export default function LoginPage() {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [accountDialogType, setAccountDialogType] = useState<
    "exists" | "created"
  >("created");

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }

    // Check URL parameters for account status
    const status = searchParams.get("status");
    if (status === "created") {
      setAccountDialogType("created");
      setShowAccountDialog(true);
    } else if (status === "exists") {
      setAccountDialogType("exists");
      setShowAccountDialog(true);
    }
  }, [user, loading, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await signIn(email, password);
      toast({
        title: "Success",
        description: "Successfully signed in!",
      });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error?.message || "Invalid email or password",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/20"></div>
          <div className="h-4 w-24 rounded bg-primary/20"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <DollarSign className="mr-2 h-6 w-6" />
            BudgetBuddy
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                Take control of your finances with BudgetBuddy - your personal
                finance companion.
              </p>
              <footer className="text-sm">Manage your money smarter</footer>
            </blockquote>
          </div>
        </div>
        <div className="p-4 lg:p-8 bg-zinc-900/10">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <Card className="border-zinc-700/40 bg-zinc-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>
                  Sign in to your account to continue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          placeholder="name@example.com"
                          type="email"
                          autoCapitalize="none"
                          autoComplete="email"
                          autoCorrect="off"
                          required
                          className="bg-zinc-800/50 border-zinc-700"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          autoCapitalize="none"
                          autoComplete="current-password"
                          required
                          className="bg-zinc-800/50 border-zinc-700"
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Sign In
                      </Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>
            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <p>
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Sign up
                </Link>
              </p>
              <button
                onClick={() => setShowPrivacyPolicy(true)}
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col items-center space-y-2 rounded-lg border border-zinc-700/40 bg-zinc-900/50 backdrop-blur-sm p-4">
                <BarChart3 className="h-6 w-6" />
                <h3 className="text-sm font-medium">Track Expenses</h3>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border border-zinc-700/40 bg-zinc-900/50 backdrop-blur-sm p-4">
                <Wallet className="h-6 w-6" />
                <h3 className="text-sm font-medium">Manage Budget</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PrivacyPolicyDialog
        open={showPrivacyPolicy}
        onOpenChange={setShowPrivacyPolicy}
      />

      <AccountStatusDialog
        open={showAccountDialog}
        onOpenChange={setShowAccountDialog}
        type={accountDialogType}
      />
    </>
  );
}
