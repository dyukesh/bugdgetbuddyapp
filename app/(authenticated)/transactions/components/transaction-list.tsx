"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { toast } from "sonner";
import { safeDBOperation, type Transaction } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/language-context";
import { useTranslations } from "@/lib/hooks/use-translations";
import { incomeCategories, expenseCategories } from "@/lib/categories";
import { format } from "date-fns";
import type { TranslationKey } from "@/lib/translations";
import type { Locale } from "date-fns";
import {
  enUS,
  es,
  fr,
  de,
  it,
  pt,
  ru,
  zhCN,
  ja,
  ko,
  arSA,
  hi,
  bn,
} from "date-fns/locale";

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionDeleted?: () => void;
}

export function TransactionList({
  transactions,
  onTransactionDeleted,
}: TransactionListProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);
  const { language, formatCurrency } = useLanguage();
  const { t } = useTranslations([
    "noTransactions",
    "transaction.add",
    "date",
    "description",
    "category",
    "amount",
    "actions",
    "edit",
    "delete",
    "cancel",
    "transaction.deleteConfirm",
  ] as const);

  const handleEdit = (transaction: Transaction) => {
    router.push(`/transactions/${transaction.id}/edit`);
  };

  const handleDelete = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!transactionToDelete) return;

    setLoading(true);
    try {
      const result = await safeDBOperation(async (db) => {
        await db.transactions.delete(transactionToDelete.id!);
      });

      if (result.success) {
        toast.success("Transaction deleted successfully");
        onTransactionDeleted?.();
      } else {
        toast.error("Failed to delete transaction");
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction");
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
      setTransactionToDelete(null);
    }
  };

  const getCategoryName = (categoryId: string, type: "income" | "expense") => {
    const categories = type === "income" ? incomeCategories : expenseCategories;
    return categories.find((cat) => cat.id === categoryId)?.name || categoryId;
  };

  // Get the appropriate date-fns locale
  const getDateLocale = (language: string) => {
    // Map language codes to locales
    const localeMap: { [key: string]: Locale } = {
      en: enUS,
      es: es,
      fr: fr,
      de: de,
      it: it,
      pt: pt,
      ru: ru,
      zh: zhCN,
      ja: ja,
      ko: ko,
      ar: arSA,
      hi: hi,
      bn: bn,
      ne: hi, // Using Hindi for Nepali as fallback
    };

    return localeMap[language] || enUS;
  };

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">{t("noTransactions")}</p>
        <Button asChild className="mt-4">
          <a href="/transactions/new">{t("transaction.add")}</a>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("date")}</TableHead>
              <TableHead>{t("description")}</TableHead>
              <TableHead>{t("category")}</TableHead>
              <TableHead className="text-right">{t("amount")}</TableHead>
              <TableHead className="w-[70px]">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {format(new Date(transaction.date), "PPP", {
                    locale: getDateLocale(language),
                  })}
                </TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {t(`categories.${transaction.category}` as TranslationKey)}
                  </Badge>
                </TableCell>
                <TableCell
                  className={`text-right ${
                    transaction.type === "expense"
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {transaction.type === "expense" ? "-" : "+"}
                  {formatCurrency(Math.abs(transaction.amount))}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(transaction)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        {t("edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(transaction)}
                        className="text-red-600"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        {t("delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("transaction.deleteConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
