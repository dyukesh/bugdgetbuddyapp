import { Dexie } from "dexie";
import { BudgetBuddyDB } from "./schema";

export const db = new BudgetBuddyDB();

export type { User, Transaction, Budget, Category, Profile } from "./schema";
export type { BudgetBuddyDB as BudgetBuddyDatabase } from "./schema";

export async function safeDBOperation<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error("Database operation failed:", error);
    throw new Error("Failed to perform database operation");
  }
}
