"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Mock data
const mockMonthlyData = [
  { month: "Jan 2023", amount: 1250 },
  { month: "Feb 2023", amount: 1100 },
  { month: "Mar 2023", amount: 1400 },
  { month: "Apr 2023", amount: 1300 },
  { month: "May 2023", amount: 1200 },
  { month: "Jun 2023", amount: 1350 },
]

export function MonthlyExpenseChart() {
  const [data] = useState(mockMonthlyData)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value) => [`$${value}`, "Expenses"]} />
        <Bar dataKey="amount" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  )
}

