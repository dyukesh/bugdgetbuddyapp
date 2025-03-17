"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AccountStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "exists" | "created";
}

export function AccountStatusDialog({
  open,
  onOpenChange,
  type,
}: AccountStatusDialogProps) {
  const content = {
    exists: {
      title: "Account Already Exists",
      description:
        "An account with this email already exists. Would you like to sign in or reset your password?",
      actions: (
        <div className="flex flex-col gap-2 w-full">
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/reset-password">Reset Password</Link>
          </Button>
        </div>
      ),
    },
    created: {
      title: "Account Created Successfully",
      description:
        "Your account has been created successfully. You can now sign in to start managing your finances.",
      actions: (
        <Button asChild className="w-full">
          <Link href="/login">Sign In</Link>
        </Button>
      ),
    },
  };

  const { title, description, actions } = content[type];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6">
          <p className="text-muted-foreground">{description}</p>
          {actions}
        </div>
      </DialogContent>
    </Dialog>
  );
}
