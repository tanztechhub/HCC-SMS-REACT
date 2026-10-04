"use client"

import { TrendingUp, TrendingDown, Scale, AlertCircle } from "lucide-react"

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(amount || 0)

const StatCard = ({ icon, label, value, subValue, gradient }) => (
    <div className={`flex-1 min-w-[200px] rounded-2xl p-4 text-white shadow-md bg-gradient-to-br ${gradient}`}>
        <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-white/90">{label}</p>
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <span className="h-4 w-4 text-white">{icon}</span>
            </div>
        </div>
        <p className="text-xl font-bold leading-tight break-words">{value}</p>
        {subValue && <p className="text-xs text-white/80 mt-1">{subValue}</p>}
    </div>
)

export default function ReportKpiRow({ report }) {
    const { revenue, expenses, net } = report

    return (
        <div className="flex flex-wrap gap-3">
            <StatCard
                icon={<TrendingUp className="h-4 w-4" />}
                label="Collected This Period"
                value={formatCurrency(revenue.collectedInPeriod)}
                subValue={`${revenue.receiptCount} receipt${revenue.receiptCount === 1 ? "" : "s"}`}
                gradient="from-orange-500 to-orange-700"
            />
            <StatCard
                icon={<TrendingDown className="h-4 w-4" />}
                label="Total Expenses"
                value={formatCurrency(expenses.totalExpenses)}
                subValue="Salaries + Bonuses + Paid Bills"
                gradient="from-rose-500 to-rose-700"
            />
            <StatCard
                icon={<Scale className="h-4 w-4" />}
                label="Net"
                value={formatCurrency(net)}
                subValue={net >= 0 ? "Surplus this period" : "Deficit this period"}
                gradient={net >= 0 ? "from-indigo-500 to-indigo-700" : "from-amber-500 to-amber-600"}
            />
            <StatCard
                icon={<AlertCircle className="h-4 w-4" />}
                label="Outstanding Fees"
                value={formatCurrency(revenue.totalPending)}
                subValue="Across all active students"
                gradient="from-amber-500 to-amber-600"
            />
        </div>
    )
}
