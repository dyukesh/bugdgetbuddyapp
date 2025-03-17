"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Dexie, { Table } from "dexie";

export interface Budget {
  id?: number;
  category: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id?: number;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: Date;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export class BudgetBuddyDB extends Dexie {
  budgets!: Table<Budget, number>;
  transactions!: Table<Transaction, number>;

  constructor() {
    super("BudgetBuddyDB");
    this.version(1).stores({
      budgets: "++id, category",
      transactions: "++id, type, category, date",
    });
  }

  async getMonthlyTransactions(
    startDate: Date,
    endDate: Date
  ): Promise<Transaction[]> {
    return await this.transactions
      .filter((tx) => tx.date >= startDate && tx.date <= endDate)
      .toArray();
  }

  async getBudgetsByCategory(): Promise<Record<string, number>> {
    const budgets = await this.budgets.toArray();
    return budgets.reduce((acc, budget) => {
      acc[budget.category] = budget.amount;
      return acc;
    }, {} as Record<string, number>);
  }

  async updateBudget(category: string, amount: number): Promise<void> {
    const now = new Date();
    const existingBudget = await this.budgets
      .where("category")
      .equals(category)
      .first();

    if (existingBudget) {
      await this.budgets.update(existingBudget.id!, {
        amount,
        updatedAt: now,
      });
    } else {
      await this.budgets.add({
        category,
        amount,
        createdAt: now,
        updatedAt: now,
      });
    }
  }
}

const db = new BudgetBuddyDB();

interface DatabaseContextType {
  db: BudgetBuddyDB;
  isReady: boolean;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initDB = async () => {
      try {
        await db.open();
        setIsReady(true);
      } catch (error) {
        console.error("Failed to initialize database:", error);
      }
    };

    initDB();

    return () => {
      db.close();
    };
  }, []);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DatabaseContext.Provider value={{ db, isReady }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
}
