"use client"

import { AlertTriangle } from "lucide-react"

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(amount || 0)

const daysOverdue = (dueDate) => {
    const diff = Date.now() - new Date(dueDate).getTime()
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

export default function OverdueBillsCard({ overdueBills }) {
    const { total, count, bills } = overdueBills

    if (count === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                </div>
                <p className="text-sm text-gray-600">No overdue bills right now.</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-400">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <h2 className="text-lg font-semibold text-red-700">Overdue Bills</h2>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-red-700">{formatCurrency(total)}</p>
                    <p className="text-xs text-gray-500">{count} bill{count === 1 ? "" : "s"} &middot; not yet deducted</p>
                </div>
            </div>
            <p className="text-xs text-gray-400 mb-3">
                Shown as of today, regardless of the selected period — these are still pending, so they haven't left the
                pocket yet and aren't counted in expenses.
            </p>
            <div className="space-y-1.5 max-h-100 overflow-y-auto">
                {bills.map((b) => (
                    <div key={b._id} className="flex items-center justify-between rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs">
                        <div>
                            <p className="font-medium text-gray-800">{b.vendor} <span className="text-gray-400">({b.billNumber})</span></p>
                            <p className="text-red-600">Due {new Date(b.dueDate).toLocaleDateString()} &middot; {daysOverdue(b.dueDate)} days overdue</p>
                        </div>
                        <p className="font-semibold text-gray-900">{formatCurrency(b.amount)}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
