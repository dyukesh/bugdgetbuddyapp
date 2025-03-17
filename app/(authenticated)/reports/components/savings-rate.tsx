"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Mock data
const mockSavingsData = [
  { month: "Jan 2023", rate: 28, savings: 700 },
  { month: "Feb 2023", rate: 32, savings: 800 },
  { month: "Mar 2023", rate: 26, savings: 700 },
  { month: "Apr 2023", rate: 27, savings: 700 },
  { month: "May 2023", rate: 25, savings: 700 },
  { month: "Jun 2023", rate: 27, savings: 800 },
]

export function SavingsRate() {
  const [data] = useState(mockSavingsData)

  // Calculate average rate
  const totalRate = data.reduce((sum, month) => sum + month.rate, 0)
  const averageRate = data.length > 0 ? (totalRate / data.length).toFixed(1) : 0

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Average Savings Rate: {averageRate}%</CardTitle>
          <CardDescription>Your savings rate is the percentage of your income that you save</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
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
              <Tooltip
                formatter={(value, name) => {
                  if (name === "rate") return [`${value}%`, "Savings Rate"]
                  return [`$${value}`, "Savings Amount"]
                }}
              />
              <Line type="monotone" dataKey="rate" name="Savings Rate" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="savings" name="Savings Amount" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Savings Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">The 50/30/20 Rule</h3>
              <p className="text-sm text-muted-foreground">
                Allocate 50% of your income to needs, 30% to wants, and 20% to savings and debt repayment.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Pay Yourself First</h3>
              <p className="text-sm text-muted-foreground">
                Set up automatic transfers to your savings account on payday before you have a chance to spend it.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Track Your Spending</h3>
              <p className="text-sm text-muted-foreground">
                Regularly review your expenses to identify areas where you can cut back.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

