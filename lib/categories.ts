export interface Category {
  id: string;
  name: string;
  type: "expense" | "income";
  defaultBudget?: number; // Default monthly budget amount
  icon?: string;
  translationKey: string; // Add translation key field
}

// Expense categories with predefined monthly budgets
export const expenseCategories: Category[] = [
  {
    id: "housing",
    name: "Housing",
    translationKey: "categories.housing",
    type: "expense",
    defaultBudget: 1200,
    icon: "Home",
  },
  {
    id: "food",
    name: "Food & Dining",
    translationKey: "categories.food",
    type: "expense",
    defaultBudget: 600,
    icon: "Utensils",
  },
  {
    id: "transportation",
    name: "Transportation",
    translationKey: "categories.transportation",
    type: "expense",
    defaultBudget: 400,
    icon: "Car",
  },
  {
    id: "utilities",
    name: "Utilities",
    translationKey: "categories.utilities",
    type: "expense",
    defaultBudget: 200,
    icon: "Zap",
  },
  {
    id: "entertainment",
    name: "Entertainment",
    translationKey: "categories.entertainment",
    type: "expense",
    defaultBudget: 200,
    icon: "Film",
  },
  {
    id: "health",
    name: "Healthcare",
    translationKey: "categories.health",
    type: "expense",
    defaultBudget: 400,
    icon: "Heart",
  },
  {
    id: "shopping",
    name: "Shopping",
    translationKey: "categories.shopping",
    type: "expense",
    defaultBudget: 200,
    icon: "ShoppingBag",
  },
  {
    id: "personal",
    name: "Personal Care",
    translationKey: "categories.personal",
    type: "expense",
    defaultBudget: 100,
    icon: "User",
  },
  {
    id: "education",
    name: "Education",
    translationKey: "categories.education",
    type: "expense",
    defaultBudget: 100,
    icon: "GraduationCap",
  },
  {
    id: "travel",
    name: "Travel",
    translationKey: "categories.travel",
    type: "expense",
    defaultBudget: 200,
    icon: "Plane",
  },
  {
    id: "debt",
    name: "Debt Payments",
    translationKey: "categories.debt",
    type: "expense",
    defaultBudget: 200,
    icon: "CreditCard",
  },
  {
    id: "other_expense",
    name: "Other Expenses",
    translationKey: "categories.otherExpense",
    type: "expense",
    defaultBudget: 100,
    icon: "MoreHorizontal",
  },
];

// Income categories
export const incomeCategories: Category[] = [
  {
    id: "salary",
    name: "Salary",
    translationKey: "categories.salary",
    type: "income",
    icon: "DollarSign",
  },
  {
    id: "business",
    name: "Business Income",
    translationKey: "categories.business",
    type: "income",
    icon: "Briefcase",
  },
  {
    id: "investment",
    name: "Investment",
    translationKey: "categories.investment",
    type: "income",
    icon: "TrendingUp",
  },
  {
    id: "rental",
    name: "Rental Income",
    translationKey: "categories.rental",
    type: "income",
    icon: "Home",
  },
  {
    id: "freelance",
    name: "Freelance",
    translationKey: "categories.freelance",
    type: "income",
    icon: "Edit",
  },
  {
    id: "other_income",
    name: "Other Income",
    translationKey: "categories.otherIncome",
    type: "income",
    icon: "Plus",
  },
];

// Combined categories for places that need all categories
export const categories: Category[] = [
  ...expenseCategories,
  ...incomeCategories,
];
