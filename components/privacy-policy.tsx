"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function PrivacyPolicyDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="text-sm text-muted-foreground">
          Privacy Policy
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Privacy Policy</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <p>Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h3 className="font-semibold mb-2">1. Introduction</h3>
            <p>
              Welcome to Budget Buddy. We respect your privacy and are committed
              to protecting your personal data. This privacy policy explains how
              we handle your information when you use our application.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">2. Data We Collect</h3>
            <p>We collect and process the following data:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Account information (email, name)</li>
              <li>Financial data (budgets, transactions, categories)</li>
              <li>Usage data (how you interact with our application)</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold mb-2">3. How We Use Your Data</h3>
            <p>We use your data to:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Provide and maintain our services</li>
              <li>Improve and personalize your experience</li>
              <li>Send important updates and notifications</li>
              <li>Analyze usage patterns to enhance our features</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold mb-2">4. Data Storage</h3>
            <p>
              Your data is stored securely using IndexedDB in your browser. We
              do not store your financial data on our servers. All sensitive
              information remains on your device.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">5. Your Rights</h3>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your data</li>
              <li>Export your data</li>
              <li>Restrict processing</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold mb-2">6. Contact Us</h3>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us at support@budgetbuddy.com
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
