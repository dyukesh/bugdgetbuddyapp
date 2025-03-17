const en = {
  // Common
  appTitle: "BudgetBuddy - Personal Finance Tracker",
  appDescription:
    "Track your expenses, manage your budget, and achieve your financial goals.",
  skipTranslation: "Skip translation",
  loading: "Loading...",
  error: "Error",
  success: "Success",
  cancel: "Cancel",
  confirm: "Confirm",
  save: "Save",
  delete: "Delete",
  edit: "Edit",
  create: "Create",
  update: "Update",
  saving: "Saving...",
  tryAgain: "Try Again",
  failedToLoad: "Failed to load",
  notFound: "404",
  pageNotFound: "Page Not Found",
  pageNotFoundDesc:
    "The page you are looking for doesn't exist or has been moved.",
  goHome: "Go Home",

  // Form Fields
  amount: "Amount",
  category: "Category",
  description: "Description",
  date: "Date",
  none: "None",

  // Auth
  auth: {
    signIn: "Sign In",
    signOut: "Sign Out",
    signUp: "Sign Up",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    forgotPassword: "Forgot Password?",
    resetPassword: "Reset Password",
  },

  // Navigation
  nav: {
    dashboard: "Dashboard",
    transactions: "Transactions",
    budgets: "Budgets",
    reports: "Reports",
    settings: "Settings",
    about: "About",
  },

  // Currency
  currency: {
    label: "Currency",
    symbol: "Currency Symbol",
    code: "Currency Code",
  },

  // Categories
  categories: {
    title: "Categories",
    add: "Add Category",
    edit: "Edit Category",
    delete: "Delete Category",
    name: "Category Name",
    budget: "Budget Amount",
    spent: "Amount Spent",
    remaining: "Remaining",
    progress: "Progress",
    overBudget: "Over Budget",
    color: "Color",
    noCategories: "No categories found",
    createFirst: "Create your first category",
    // Expense Categories
    housing: "Housing",
    food: "Food & Dining",
    transportation: "Transportation",
    utilities: "Utilities",
    entertainment: "Entertainment",
    healthcare: "Healthcare",
    shopping: "Shopping",
    personal: "Personal Care",
    education: "Education",
    travel: "Travel",
    debt: "Debt Payments",
    savings: "Savings",
    other: "Other",
    otherExpense: "Other Expenses",
    // Income Categories
    salary: "Salary",
    business: "Business Income",
    investment: "Investment",
    rental: "Rental Income",
    freelance: "Freelance",
    otherIncome: "Other Income",
  },

  // Validation Messages
  validation: {
    amount: {
      positive: "Amount must be positive",
      required: "Amount is required",
      type: "Amount must be a number",
    },
    category: {
      required: "Category is required",
    },
    name: {
      required: "Name is required",
    },
  },

  // Transaction Form
  transaction: {
    type: "Type",
    expense: "Expense",
    income: "Income",
    add: "Add Transaction",
    update: "Update Transaction",
    delete: "Delete Transaction",
    deleted: "Transaction deleted successfully",
    failedToDelete: "Failed to delete transaction",
    unknownAccount: "Unknown Account",
    description: "Description",
    deleteConfirm:
      "Are you sure you want to delete this transaction? This action cannot be undone.",
    form: {
      type: "Type",
      expense: "Expense",
      income: "Income",
      amount: "Amount",
      description: "Description",
      category: "Category",
      selectCategory: "Select a category",
      date: "Date",
      selectDate: "Select a date",
      isSaving: "Saving...",
      updateTransaction: "Update Transaction",
      addTransaction: "Add Transaction",
    },
    export: "Export to CSV",
    exportSuccess: "Transactions exported successfully",
    exportError: "Failed to export transactions",
  },

  // Budget Form
  budgets: {
    new: "New Budget",
    edit: "Edit Budget",
    editDescription: "Update your budget settings",
    details: "Budget Details",
    description: "Set a monthly spending limit for a category",
    monthlyLimit: "Monthly Limit",
    create: "Create Budget",
    update: "Update Budget",
    created: "Budget created successfully",
    failedToCreate: "Failed to create budget",
    loadError: "Failed to load budgets",
    reloadError: "Failed to reload budgets",
    notFound: "Budget not found",
    backToList: "Back to Budgets",
    form: {
      name: "Name",
      amount: "Amount",
      category: "Category",
      submit: "Submit",
    },
    list: {
      empty: "No budgets found",
      title: "Your Budgets",
      add: "Add Budget",
      spent: "Spent",
      remaining: "Remaining",
      overBudget: "Over Budget",
    },
    delete: {
      title: "Delete Budget",
      description:
        "Are you sure you want to delete this budget? This action cannot be undone.",
      success: "Budget deleted successfully",
      error: "Failed to delete budget",
    },
    alert: {
      title: "Budget Alert",
      message: "You have exceeded your budget in the following categories:",
      close: "Close",
    },
    transactions: {
      loadError: "Failed to load transactions",
    },
  },

  // Loading States
  loadingStates: {
    loading: "Loading...",
    creating: "Creating...",
    updating: "Updating...",
    deleting: "Deleting...",
    saving: "Saving...",
  },

  // Time
  time: {
    ago: "ago",
    currentMonth: "Current Month",
    previousMonth: "Previous Month",
    thisYear: "This Year",
  },

  // Debug Page
  debug: {
    title: "Debug",
    description: "Debug tools and information",
    profiles: "Profiles",
    bankAccounts: "Bank Accounts",
    transactions: "Transactions",
    stats: "Database Statistics",
    statsDesc: "Current state of your local database",
    recordCounts: "Record Counts",
    users: "Users",
    found: "Found",
    notFound: "Not Found",
    notSignedIn: "Not signed in",
    resetDb: "Reset Database",
    resetConfirm:
      "Are you sure you want to reset the database? This will delete all data.",
    dbReset: "Database reset",
    dbResetSuccess:
      "The database has been reset successfully. Please sign in again.",
    dbResetFailed: "Failed to reset the database.",
    currentUser: "Current User",
  },

  // Transaction List
  noTransactions:
    "No transactions yet. Start by adding your first transaction.",
  actions: "Actions",
  allTypes: "All Types",
  allCategories: "All Categories",
  allAccounts: "All Accounts",
  startDate: "Start Date",
  endDate: "End Date",
  resetFilters: "Reset Filters",

  // Budget List
  noBudgets:
    "No budgets set yet. Start by creating a budget to track your spending.",
  openMenu: "Open menu",

  // Settings
  language: "Language",
  theme: "Theme",
  notifications: "Notifications",
  security: "Security",
  preferences: "Preferences",
  darkMode: "Dark Mode",
  lightMode: "Light Mode",
  systemTheme: "System Theme",
  settings: {
    title: "Settings",
    currency: "Currency",
    currencyDescription: "Select your preferred currency for transactions",
    language: "Language",
    languageDescription: "Choose your preferred language for the application",
    theme: "Theme",
    themeDescription: "Choose between light, dark, or system theme",
    notifications: "Notifications",
    notificationsDescription: "Enable or disable notifications",
    name: "Name",
    nameDescription: "Enter your full name",
    save: "Save Changes",
    saving: "Saving...",
    success: "Settings updated successfully",
    error: "Failed to update settings",
  },

  // Currency
  currencySymbol: "Currency Symbol",
  currencyCode: "Currency Code",

  // Common
  common: {
    confirm: "Confirm",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    tryAgain: "Try Again",
    success: "Success",
    error: "Error",
    failedToLoad: "Failed to load",
    menu: {
      open: "Open menu",
    },
    loading: "Loading...",
    save: "Save",
    warning: "Warning",
    info: "Information",
    filter: "Filter",
    search: "Search",
    noResults: "No results found",
  },

  // Reports
  reports: {
    totalIncome: "Total Income",
    totalExpenses: "Total Expenses",
    netIncome: "Net Income",
    expensesByCategory: "Expenses by Category",
    selectStartDate: "Select start date",
    selectEndDate: "Select end date",
    categoryBreakdown: "Category Breakdown",
  },

  // Dashboard
  dashboard: {
    title: "Dashboard",
    recentTransactions: "Recent Transactions",
    viewAll: "View All",
    monthlyBudget: "Monthly Budget",
    progress: "Progress",
  },

  // About Page
  about: {
    title: "About Us",
    description: "Meet the team behind BudgetBuddy",
    donate: "Support Us",
    donateDescription: "Help us keep BudgetBuddy free and open source",
    donateSuccess: "Thank you for your support!",
    donateFailed: "Failed to process donation",
  },
} as const;

const zh = {
  // Common
  appTitle: "预算伙伴 - 个人财务跟踪器",
  appDescription: "跟踪您的支出，管理您的预算，实现您的财务目标。",
  skipTranslation: "跳过翻译",
  loading: "加载中...",
  error: "错误",
  success: "成功",
  cancel: "取消",
  confirm: "确认",
  save: "保存",
  delete: "删除",
  edit: "编辑",
  create: "创建",
  update: "更新",
  saving: "保存中...",
  tryAgain: "重试",
  failedToLoad: "加载失败",
  notFound: "404",
  pageNotFound: "页面未找到",
  pageNotFoundDesc: "您要查找的页面不存在或已被移动。",
  goHome: "返回首页",

  // Form Fields
  amount: "金额",
  category: "类别",
  description: "描述",
  date: "日期",
  none: "无",

  // Auth
  auth: {
    signIn: "登录",
    signOut: "退出",
    signUp: "注册",
    email: "邮箱",
    password: "密码",
    confirmPassword: "确认密码",
    forgotPassword: "忘记密码？",
    resetPassword: "重置密码",
  },

  // Navigation
  nav: {
    dashboard: "仪表板",
    transactions: "交易",
    budgets: "预算",
    reports: "报告",
    settings: "设置",
    about: "关于",
  },

  // Currency
  currency: {
    label: "货币",
    symbol: "货币符号",
    code: "货币代码",
  },

  // Settings
  settings: {
    title: "设置",
    name: "姓名",
    nameDescription: "输入您的全名",
    currency: "货币",
    currencyDescription: "选择您首选的交易货币",
    language: "语言",
    languageDescription: "选择您首选的应用语言",
    theme: "主题",
    themeDescription: "选择亮色、暗色或系统主题",
    success: "设置已更新",
    error: "更新设置时出错",
    save: "保存更改",
    saving: "保存中...",
  },
};

export const defaultLanguage = "en";

export const translations = {
  en,
  zh,
} as const;

export type TranslationKey = keyof typeof en;

export type Language = keyof typeof translations;
