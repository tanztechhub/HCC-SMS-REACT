"use client"

import { Receipt, CalendarClock, TrendingUp } from "lucide-react"

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

export default function ReceiptStats({ receipts }) {
    const now = new Date()

    const receiptsOnly = receipts.filter((r) => r.documentType !== "CREDIT_NOTE")
    const creditNotes = receipts.filter((r) => r.documentType === "CREDIT_NOTE")

    const totalReceipts = receiptsOnly.length
    const receiptsValue = receiptsOnly.reduce((sum, r) => sum + (r.totalAmountDue || 0), 0)
    const creditNotesValue = creditNotes.reduce((sum, r) => sum + (r.totalAmountDue || 0), 0)
    const netValue = receiptsValue - creditNotesValue

    const isThisMonth = (r) => {
        const d = new Date(r.date)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }
    const thisMonthReceipts = receiptsOnly.filter(isThisMonth)
    const thisMonthCreditNotes = creditNotes.filter(isThisMonth)
    const thisMonthValue = thisMonthReceipts.reduce((sum, r) => sum + (r.totalAmountDue || 0), 0)
        - thisMonthCreditNotes.reduce((sum, r) => sum + (r.totalAmountDue || 0), 0)

    const averageValue = totalReceipts > 0 ? receiptsValue / totalReceipts : 0

    return (
        <div className="flex flex-wrap gap-3 mb-4">
            <StatCard
                icon={<Receipt className="h-4 w-4" />}
                label="Total Receipts"
                value={totalReceipts}
                subValue={
                    creditNotes.length > 0
                        ? `${formatCurrency(netValue)} net of ${creditNotes.length} credit note${creditNotes.length === 1 ? "" : "s"}`
                        : formatCurrency(receiptsValue)
                }
                gradient="from-indigo-500 to-indigo-700"
            />
            <StatCard
                icon={<CalendarClock className="h-4 w-4" />}
                label="This Month"
                value={formatCurrency(thisMonthValue)}
                subValue={`${thisMonthReceipts.length} receipt${thisMonthReceipts.length === 1 ? "" : "s"}`}
                gradient="from-orange-500 to-orange-700"
            />
            <StatCard
                icon={<TrendingUp className="h-4 w-4" />}
                label="Average Receipt"
                value={formatCurrency(averageValue)}
                subValue="per receipt"
                gradient="from-amber-500 to-amber-600"
            />
        </div>
    )
}
