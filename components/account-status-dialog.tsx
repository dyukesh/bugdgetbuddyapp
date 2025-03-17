"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";

export function AccountStatusDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="text-sm text-muted-foreground">
          Account Status
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Account Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Email verification complete</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Local data storage enabled</span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <span>Premium features not activated</span>
          </div>
          <div className="text-sm text-muted-foreground mt-4">
            <p>
              Your account is ready to use with basic features. To access
              premium features like data sync and advanced analytics, upgrade
              your account.
            </p>
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" size="sm">
              Upgrade Account
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
