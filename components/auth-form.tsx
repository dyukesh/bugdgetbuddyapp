"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { PrivacyPolicyDialog } from "@/components/privacy-policy";
import { useAuth } from "@/lib/auth";
import type { CheckedState } from "@radix-ui/react-checkbox";

export function AuthForm({ type = "login" }: { type?: "login" | "signup" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedPrivacyPolicy, setAcceptedPrivacyPolicy] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      if (type === "signup") {
        if (!acceptedPrivacyPolicy) {
          toast({
            description: "Please accept the privacy policy",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (error) {
      toast({
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (checked: CheckedState) => {
    setAcceptedPrivacyPolicy(checked === true);
  };

  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {type === "signup" && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="privacy"
                checked={acceptedPrivacyPolicy}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="privacy" className="text-sm">
                I accept the <PrivacyPolicyDialog /> and understand this is a
                student project
              </Label>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : type === "login" ? "Sign In" : "Sign Up"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center">
        <Link
          href={type === "login" ? "/signup" : "/login"}
          className="text-sm text-primary hover:underline"
        >
          {type === "login" ? "Create an account" : "Already have an account?"}
        </Link>
      </CardFooter>
    </Card>
  );
}
