// Types for our data models
export interface Transaction {
  id: string
  amount: number
  description: string
  category: string
  date: string
  type: "expense" | "income"
  userId: string
}

export interface Budget {
  id: string
  category: string
  amount: number
  period: "monthly" | "yearly"
  userId: string
}

export interface Profile {
  id: string
  userId: string
  full_name: string
  currency: string
}

// Helper function to generate unique IDs
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// Transactions CRUD
export const getTransactions = (userId: string): Transaction[] => {
  try {
    const transactions = localStorage.getItem("transactions")
    if (!transactions) return []

    const parsedTransactions = JSON.parse(transactions) as Transaction[]
    return parsedTransactions.filter((t) => t.userId === userId)
  } catch (error) {
    console.error("Error getting transactions:", error)
    return []
  }
}

export const saveTransaction = (transaction: Transaction): Transaction => {
  try {
    const transactions = getTransactions("all")
    const newTransaction = {
      ...transaction,
      id: transaction.id || generateId(),
    }

    const updatedTransactions = transaction.id
      ? transactions.map((t) => (t.id === transaction.id ? newTransaction : t))
      : [...transactions, newTransaction]

    localStorage.setItem("transactions", JSON.stringify(updatedTransactions))
    return newTransaction
  } catch (error) {
    console.error("Error saving transaction:", error)
    throw error
  }
}

export const deleteTransaction = (id: string): void => {
  try {
    const transactions = getTransactions("all")
    const updatedTransactions = transactions.filter((t) => t.id !== id)
    localStorage.setItem("transactions", JSON.stringify(updatedTransactions))
  } catch (error) {
    console.error("Error deleting transaction:", error)
    throw error
  }
}

export const getTransaction = (id: string): Transaction | null => {
  try {
    const transactions = getTransactions("all")
    return transactions.find((t) => t.id === id) || null
  } catch (error) {
    console.error("Error getting transaction:", error)
    return null
  }
}

// Budgets CRUD
export const getBudgets = (userId: string): Budget[] => {
  try {
    const budgets = localStorage.getItem("budgets")
    if (!budgets) return []

    const parsedBudgets = JSON.parse(budgets) as Budget[]
    return parsedBudgets.filter((b) => b.userId === userId)
  } catch (error) {
    console.error("Error getting budgets:", error)
    return []
  }
}

export const saveBudget = (budget: Budget): Budget => {
  try {
    const budgets = getBudgets("all")
    const newBudget = {
      ...budget,
      id: budget.id || generateId(),
    }

    const updatedBudgets = budget.id
      ? budgets.map((b) => (b.id === budget.id ? newBudget : b))
      : [...budgets, newBudget]

    localStorage.setItem("budgets", JSON.stringify(updatedBudgets))
    return newBudget
  } catch (error) {
    console.error("Error saving budget:", error)
    throw error
  }
}

export const deleteBudget = (id: string): void => {
  try {
    const budgets = getBudgets("all")
    const updatedBudgets = budgets.filter((b) => b.id !== id)
    localStorage.setItem("budgets", JSON.stringify(updatedBudgets))
  } catch (error) {
    console.error("Error deleting budget:", error)
    throw error
  }
}

export const getBudget = (id: string): Budget | null => {
  try {
    const budgets = getBudgets("all")
    return budgets.find((b) => b.id === id) || null
  } catch (error) {
    console.error("Error getting budget:", error)
    return null
  }
}

// Profile CRUD
export const getProfile = (userId: string): Profile | null => {
  try {
    const profiles = localStorage.getItem("profiles")
    if (!profiles) return null

    const parsedProfiles = JSON.parse(profiles) as Profile[]
    return parsedProfiles.find((p) => p.userId === userId) || null
  } catch (error) {
    console.error("Error getting profile:", error)
    return null
  }
}

export const saveProfile = (profile: Profile): Profile => {
  try {
    const profiles = localStorage.getItem("profiles")
      ? (JSON.parse(localStorage.getItem("profiles") as string) as Profile[])
      : []

    const existingProfileIndex = profiles.findIndex((p) => p.userId === profile.userId)

    if (existingProfileIndex >= 0) {
      profiles[existingProfileIndex] = profile
    } else {
      profiles.push(profile)
    }

    localStorage.setItem("profiles", JSON.stringify(profiles))
    return profile
  } catch (error) {
    console.error("Error saving profile:", error)
    throw error
  }
}

