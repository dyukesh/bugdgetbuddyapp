import { BudgetBuddyDB } from "../schema";

export async function up(db: BudgetBuddyDB) {
  await db.schema.createTable("categories", {
    id: "string",
    userId: "string",
    name: "string",
    budget: "number",
    color: "string",
    createdAt: "date",
  });

  // Add categoryId to transactions table
  await db.schema.alterTable("transactions", (table) => {
    table.addColumn("categoryId", "string");
  });
}
