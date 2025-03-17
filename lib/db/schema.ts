import { Dexie, Table } from "dexie";

export interface User {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  description: string;
  type: "income" | "expense";
  date: Date;
  categoryId: string;
  createdAt: Date;
}

export interface Budget {
  id: string;
  userId: string;
  name: string;
  amount: number;
  spent?: number;
  startDate: Date;
  endDate: Date;
  color: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  budget: number;
  color: string;
  createdAt: Date;
}

export interface Profile {
  id?: string;
  userId: string;
  fullName: string;
  currency: string;
  language: string;
  updatedAt: Date;
}

export class BudgetBuddyDB extends Dexie {
  users!: Table<User>;
  transactions!: Table<Transaction>;
  budgets!: Table<Budget>;
  categories!: Table<Category>;
  profiles!: Table<Profile>;

  constructor() {
    super("BudgetBuddy");

    this.version(2).stores({
      users: "id, email",
      transactions: "id, userId, categoryId, date",
      budgets: "id, userId",
      categories: "id, userId",
      profiles: "id, userId",
    });
  }

  schema = {
    createTable: async (name: string, schema: Record<string, string>) => {
      await this.version(this.verno + 1)
        .stores({
          [name]: Object.keys(schema).join(","),
        })
        .upgrade(() => {});
    },
    alterTable: async (
      name: string,
      callback: (table: Table<any, any>) => void
    ) => {
      await this.version(this.verno + 1)
        .stores({})
        .upgrade((tx) => {
          callback(tx.table(name));
        });
    },
  };
}

export type BudgetBuddyTables = {
  users: User;
  transactions: Transaction;
  budgets: Budget;
  categories: Category;
  profiles: Profile;
};

export type BudgetBuddyTableNames = keyof BudgetBuddyTables;

declare module "dexie" {
  interface Table<T, TKey = any> {
    where(keyPath: string): {
      equals(value: string): {
        toArray(): Promise<T[]>;
        first(): Promise<T | undefined>;
      };
    };
    update(key: string, changes: Partial<T>): Promise<number>;
    add(item: T): Promise<string>;
    delete(key: string): Promise<void>;
  }
}

export type { BudgetBuddyDB as BudgetBuddyDatabase };
