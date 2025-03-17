"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PrivacyPolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrivacyPolicyDialog({
  open,
  onOpenChange,
}: PrivacyPolicyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Privacy Policy</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Introduction</h2>
            <p>
              At BudgetBuddy, we take your privacy seriously. This Privacy
              Policy explains how we collect, use, disclose, and safeguard your
              information when you use our service.
            </p>

            <h2 className="text-lg font-semibold">Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account information (email, password)</li>
              <li>Financial information (transactions, budgets)</li>
              <li>Profile information (name, preferences)</li>
              <li>Usage data (how you interact with our service)</li>
            </ul>

            <h2 className="text-lg font-semibold">
              How We Use Your Information
            </h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and maintain our service</li>
              <li>Improve and personalize your experience</li>
              <li>Communicate with you about updates and features</li>
              <li>Ensure the security of your account</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2 className="text-lg font-semibold">Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to
              protect your personal information. However, no method of
              transmission over the Internet or electronic storage is 100%
              secure.
            </p>

            <h2 className="text-lg font-semibold">Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Export your data</li>
            </ul>

            <h2 className="text-lg font-semibold">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us at privacy@budgetbuddy.com
            </p>

            <h2 className="text-lg font-semibold">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the "Last Updated" date.
            </p>

            <p className="text-sm text-muted-foreground mt-8">
              Last Updated: February 24, 2024
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
