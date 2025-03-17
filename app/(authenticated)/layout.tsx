"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { BudgetAlert } from "@/components/budget-alert";
import { Sidebar } from "@/components/sidebar";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r md:block">
          <Sidebar />
        </aside>
        <main className="flex-1">
          <div className="container py-6">
            <BudgetAlert />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
