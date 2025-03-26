"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface PrivacyPolicyDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: boolean;
}

export function PrivacyPolicyDialog({
  open,
  onOpenChange,
  trigger = true,
}: PrivacyPolicyDialogProps) {
  const content = (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Privacy Policy</DialogTitle>
      </DialogHeader>
      <ScrollArea className="h-[60vh] pr-4">
        <div className="space-y-4">
          <section>
            <h2 className="text-lg font-semibold">1. Introduction</h2>
            <p>
              Welcome to Budget Buddy! This web application is a college project
              developed by students for educational purposes. We cannot
              guarantee the security or reliability of the application. By using
              Budget Buddy, you acknowledge and accept these risks.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">2. Information We Collect</h2>
            <ul className="list-disc pl-6">
              <li>
                Personal Information: name, email address, and account details
              </li>
              <li>Financial Information: income, expenses, and budget data</li>
              <li>Usage Data: device type, browser type, and access times</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">
              3. Data Security Disclaimer
            </h2>
            <p>
              As this is a student project, Budget Buddy does not guarantee data
              security. Users are advised not to enter sensitive financial
              information. Use this app at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">4. Your Rights</h2>
            <ul className="list-disc pl-6">
              <li>Access & Update your information through account settings</li>
              <li>Delete your data upon request</li>
              <li>Opt-out of communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">5. Contact</h2>
            <p>
              Questions about this Privacy Policy? Contact:
              support@budgetbuddy.example.com
            </p>
          </section>
        </div>
      </ScrollArea>
    </DialogContent>
  );

  // If open and onOpenChange are provided, use controlled dialog
  if (typeof open !== "undefined" && onOpenChange) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {content}
      </Dialog>
    );
  }

  // Otherwise, use uncontrolled dialog with trigger
  return (
    <Dialog>
      {trigger && (
        <DialogTrigger asChild>
          <Button
            variant="link"
            className="text-blue-500 hover:underline p-0 h-auto font-normal"
            type="button"
          >
            Privacy Policy
          </Button>
        </DialogTrigger>
      )}
      {content}
    </Dialog>
  );
}
