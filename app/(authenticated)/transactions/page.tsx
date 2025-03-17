"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TransactionList } from "./components/transaction-list";
import { TransactionFilters } from "./components/transaction-filters";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { safeDBOperation, type Transaction } from "@/lib/db";
import { useAuth } from "@/lib/auth";
import { PlusCircle, Download } from "lucide-react";
import { toast } from "sonner";
import { exportToCSV } from "@/lib/csv-export";
import { useTranslations } from "@/lib/hooks/use-translations";
import { type TranslationKey } from "@/lib/translations";

export default function TransactionsPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFiltering = useRef(false);
  const { t } = useTranslations([
    "transaction.export",
    "transaction.exportSuccess",
    "transaction.exportError",
  ] as const satisfies readonly TranslationKey[]);

  // Load transactions from database
  useEffect(() => {
    async function loadTransactions() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const result = await safeDBOperation(async (db) => {
          return await db.transactions
            .where({ userId: user.id })
            .reverse()
            .sortBy("date");
        });

        if (result.success) {
          setTransactions(result.data || []);
        } else {
          setError("Failed to load transactions");
        }
      } catch (error) {
        console.error("Error loading transactions:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load transactions"
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadTransactions();
  }, [user]);

  // Apply filters based on search params
  useEffect(() => {
    if (isFiltering.current) return;
    isFiltering.current = true;

    if (transactions.length === 0) {
      setFilteredTransactions([]);
      isFiltering.current = false;
      return;
    }

    let filtered = [...transactions];

    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const account = searchParams.get("account");

    if (type && type !== "all") {
      filtered = filtered.filter((t) => t.type === type);
    }

    if (category && category !== "all") {
      filtered = filtered.filter((t) => t.category === category);
    }

    if (startDate) {
      const startDateTime = new Date(startDate);
      filtered = filtered.filter((t) => t.date >= startDateTime);
    }

    if (endDate) {
      const endDateTime = new Date(endDate);
      filtered = filtered.filter((t) => t.date <= endDateTime);
    }

    if (account && account !== "all") {
      filtered = filtered.filter((t) => t.accountId === Number(account));
    }

    setFilteredTransactions(filtered);

    // Use setTimeout to ensure this runs after the current render cycle
    setTimeout(() => {
      isFiltering.current = false;
    }, 0);
  }, [searchParams, transactions]);

  const handleTransactionDeleted = async () => {
    if (!user) return;

    try {
      const result = await safeDBOperation(async (db) => {
        return await db.transactions
          .where({ userId: user.id })
          .reverse()
          .sortBy("date");
      });

      if (result.success) {
        setTransactions(result.data || []);
      } else {
        setError("Failed to reload transactions");
      }
    } catch (error) {
      console.error("Error reloading transactions:", error);
      setError(
        error instanceof Error ? error.message : "Failed to reload transactions"
      );
    }
  };

  const handleExport = () => {
    try {
      const dataToExport =
        filteredTransactions.length > 0 ? filteredTransactions : transactions;
      const exportData = dataToExport.map((transaction) => ({
        Date: new Date(transaction.date).toLocaleDateString(),
        Type: transaction.type,
        Category: transaction.category,
        Amount: transaction.amount,
        Description: transaction.description || "",
      }));

      exportToCSV(exportData, "transactions");
      toast.success(t("transaction.exportSuccess"));
    } catch (error) {
      console.error("Error exporting transactions:", error);
      toast.error(t("transaction.exportError"));
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-red-500">{error}</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
          Transactions
        </h1>
        <div className="flex gap-4">
          <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {t("transaction.export")}
          </Button>
          <Button asChild>
            <Link href="/transactions/new" className="inline-flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Transaction
            </Link>
          </Button>
        </div>
      </div>

      <TransactionFilters />

      <TransactionList
        transactions={filteredTransactions}
        onTransactionDeleted={handleTransactionDeleted}
      />
    </div>
  );
}
