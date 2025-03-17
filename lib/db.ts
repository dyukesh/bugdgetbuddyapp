import Dexie, { type Table } from "dexie";
import { categories } from "@/lib/utils";

// Define interfaces for our database tables
export interface User {
  id: string;
  email: string;
  password: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile {
  id?: number;
  userId: string;
  fullName: string;
  currency: string;
  language: string;
  stripeCustomerId?: string;
  updatedAt: Date;
}

export interface Transaction {
  id?: number;
  userId: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  type: "income" | "expense";
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id?: number;
  userId: string;
  category: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  budget: number;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the database
export class BudgetBuddyDB extends Dexie {
  users!: Table<User>;
  profiles!: Table<Profile>;
  transactions!: Table<Transaction>;
  budgets!: Table<Budget>;
  categories!: Table<Category>;

  constructor() {
    super("BudgetBuddyDB");

    this.version(2).stores({
      users: "++id, email",
      profiles: "++id, userId, updatedAt",
      transactions: "++id, userId, category, date",
      budgets: "++id, userId, category",
      categories: "id, userId",
    });
  }
}

// Create a singleton instance
let dbInstance: BudgetBuddyDB | null = null;

// Initialize database with better error handling
function initializeDB(): BudgetBuddyDB | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    if (!window.indexedDB) {
      console.warn("IndexedDB is not available");
      return null;
    }

    if (!dbInstance) {
      dbInstance = new BudgetBuddyDB();
    }

    return dbInstance;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    return null;
  }
}

// Export the database instance
export const db = initializeDB();

// Helper function for safe database operations
export async function safeDBOperation<T>(
  operation: (db: BudgetBuddyDB) => Promise<T>
): Promise<{ success: boolean; data?: T; error?: Error }> {
  try {
    if (!db) {
      throw new Error("Database is not initialized");
    }

    const result = await operation(db);
    return { success: true, data: result };
  } catch (error) {
    console.error("Database operation failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
}

// Update the seedDemoData function to use safe operations
export async function seedDemoData(userId: string) {
  return safeDBOperation(async (db) => {
    // Check if user already has data
    const existingBudgets = await db.budgets.where({ userId }).toArray();
    if (existingBudgets.length > 0) {
      return; // Don't seed if user already has budgets
    }

    // Add default budgets with 100 value for each category
    const defaultBudgets = categories
      .filter((category) => category.id !== "income") // Exclude income category
      .map((category) => ({
        userId,
        category: category.id,
        amount: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

    await Promise.all(defaultBudgets.map((budget) => db.budgets.add(budget)));
  });
}

// Helper function to format date
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}
