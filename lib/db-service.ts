import { supabase } from "./supabase";
import type { Transaction, Budget, BankAccount } from "./supabase";

export const dbService = {
  // Transactions
  async getTransactions(userId: string) {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error) throw error;
    return data;
  },

  async createTransaction(
    userId: string,
    transaction: Omit<Transaction, "id" | "user_id" | "created_at">
  ) {
    const { data, error } = await supabase
      .from("transactions")
      .insert([
        {
          user_id: userId,
          ...transaction,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTransaction(
    transactionId: string,
    updates: Partial<Transaction>
  ) {
    const { data, error } = await supabase
      .from("transactions")
      .update(updates)
      .eq("id", transactionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTransaction(transactionId: string) {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", transactionId);

    if (error) throw error;
  },

  // Budgets
  async getBudgets(userId: string) {
    const { data, error } = await supabase
      .from("budgets")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;
    return data;
  },

  async createBudget(
    userId: string,
    budget: Omit<Budget, "id" | "user_id" | "created_at">
  ) {
    const { data, error } = await supabase
      .from("budgets")
      .insert([
        {
          user_id: userId,
          ...budget,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateBudget(budgetId: string, updates: Partial<Budget>) {
    const { data, error } = await supabase
      .from("budgets")
      .update(updates)
      .eq("id", budgetId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteBudget(budgetId: string) {
    const { error } = await supabase
      .from("budgets")
      .delete()
      .eq("id", budgetId);

    if (error) throw error;
  },

  // Bank Accounts
  async getBankAccounts(userId: string) {
    const { data, error } = await supabase
      .from("bank_accounts")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;
    return data;
  },

  async createBankAccount(
    userId: string,
    account: Omit<BankAccount, "id" | "user_id" | "created_at">
  ) {
    const { data, error } = await supabase
      .from("bank_accounts")
      .insert([
        {
          user_id: userId,
          ...account,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateBankAccount(accountId: string, updates: Partial<BankAccount>) {
    const { data, error } = await supabase
      .from("bank_accounts")
      .update(updates)
      .eq("id", accountId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteBankAccount(accountId: string) {
    const { error } = await supabase
      .from("bank_accounts")
      .delete()
      .eq("id", accountId);

    if (error) throw error;
  },
};
