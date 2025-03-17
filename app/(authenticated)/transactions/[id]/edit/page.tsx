"use client"

import { TransactionForm } from "../../components/transaction-form"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { db, type Transaction } from "@/lib/db"

export default function EditTransactionPage() {
  const params = useParams()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTransaction() {
      try {
        const id = Number(params.id)
        if (isNaN(id)) {
          setLoading(false)
          return
        }

        const foundTransaction = await db.transactions.get(id)

        if (foundTransaction) {
          setTransaction(foundTransaction)
        }

        setLoading(false)
      } catch (error) {
        console.error("Error loading transaction:", error)
        setLoading(false)
      }
    }

    loadTransaction()
  }, [params.id])

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  if (!transaction) {
    return <div className="text-center py-8">Transaction not found</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Transaction</h1>
        <p className="text-muted-foreground">Update transaction details</p>
      </div>

      <TransactionForm transaction={transaction} />
    </div>
  )
}

