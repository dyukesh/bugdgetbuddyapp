import { type BudgetBuddyDB, db } from "./db";

interface SafeDBResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
}

export async function safeDBOperation<T>(
  operation: (db: BudgetBuddyDB) => Promise<T>
): Promise<SafeDBResult<T>> {
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
      error:
        error instanceof Error ? error : new Error("Unknown error occurred"),
    };
  }
}
