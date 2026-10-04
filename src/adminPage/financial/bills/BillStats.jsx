"use client"

import { Receipt, CheckCircle2, Clock, AlertTriangle } from "lucide-react"

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

export default function BillStats({ bills }) {
    const today = new Date()

    const totalBills = bills.length
    const totalValue = bills.reduce((sum, b) => sum + (b.amount || 0), 0)

    const paidBills = bills.filter((b) => b.status === "paid")
    const paidValue = paidBills.reduce((sum, b) => sum + (b.amount || 0), 0)

    const pendingBills = bills.filter((b) => b.status === "pending")
    const pendingValue = pendingBills.reduce((sum, b) => sum + (b.amount || 0), 0)

    const overdueBills = pendingBills.filter((b) => b.dueDate && new Date(b.dueDate) < today)
    const overdueValue = overdueBills.reduce((sum, b) => sum + (b.amount || 0), 0)

    return (
        <div className="flex flex-wrap gap-3 mb-4">
            <StatCard
                icon={<Receipt className="h-4 w-4" />}
                label="Total Bills"
                value={formatCurrency(totalValue)}
                subValue={` ${totalBills} bill${totalBills === 1 ? "" : "s"}`}
                gradient="from-indigo-500 to-indigo-700"
            />
            <StatCard
                icon={<CheckCircle2 className="h-4 w-4" />}
                label="Paid"
                value={formatCurrency(paidValue)}
                subValue={`${paidBills.length} bill${paidBills.length === 1 ? "" : "s"}`}
                gradient="from-orange-500 to-orange-700"
            />
            <StatCard
                icon={<Clock className="h-4 w-4" />}
                label="Pending"
                value={formatCurrency(pendingValue)}
                subValue={`${pendingBills.length} bill${pendingBills.length === 1 ? "" : "s"}`}
                gradient="from-amber-500 to-amber-600"
            />
            <StatCard
                icon={<AlertTriangle className="h-4 w-4" />}
                label="Overdue"
                value={formatCurrency(overdueValue)}
                subValue={`${overdueBills.length} bill${overdueBills.length === 1 ? "" : "s"}`}
                gradient="from-rose-500 to-rose-700"
            />
        </div>
    )
}
