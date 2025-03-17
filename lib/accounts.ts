import { useEffect, useState } from "react";

export interface BankAccount {
  id: number;
  name: string;
  balance: number;
  userId: string;
}

export function useAccounts() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Implement actual account fetching logic
    setAccounts([]);
    setLoading(false);
  }, []);

  return { accounts, loading };
}
