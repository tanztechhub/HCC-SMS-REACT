"use client"

import { FileText, CheckCircle2, Clock, AlertTriangle } from "lucide-react"

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

export default function InvoiceStats({ invoices }) {
    const today = new Date()

    const totalInvoices = invoices.length
    const totalValue = invoices.reduce((sum, inv) => sum + (inv.totalAmountDue || 0), 0)

    const paidInvoices = invoices.filter((inv) => inv.paymentStatus === "Paid")
    const paidValue = paidInvoices.reduce((sum, inv) => sum + (inv.totalAmountDue || 0), 0)

    const pendingInvoices = invoices.filter((inv) => inv.paymentStatus !== "Paid")
    const pendingValue = pendingInvoices.reduce((sum, inv) => sum + (inv.totalAmountDue || 0), 0)

    const overdueInvoices = pendingInvoices.filter((inv) => inv.paymentDueDate && new Date(inv.paymentDueDate) < today)
    const overdueValue = overdueInvoices.reduce((sum, inv) => sum + (inv.totalAmountDue || 0), 0)

    return (
        <div className="flex flex-wrap gap-3 mb-4">
            <StatCard
                icon={<FileText className="h-4 w-4" />}
                label="Total Invoices"
                value={totalInvoices}
                subValue={formatCurrency(totalValue)}
                gradient="from-indigo-500 to-indigo-700"
            />
            <StatCard
                icon={<CheckCircle2 className="h-4 w-4" />}
                label="Paid"
                value={formatCurrency(paidValue)}
                subValue={`${paidInvoices.length} invoice${paidInvoices.length === 1 ? "" : "s"}`}
                gradient="from-orange-500 to-orange-700"
            />
            <StatCard
                icon={<Clock className="h-4 w-4" />}
                label="Pending"
                value={formatCurrency(pendingValue)}
                subValue={`${pendingInvoices.length} invoice${pendingInvoices.length === 1 ? "" : "s"}`}
                gradient="from-amber-500 to-amber-600"
            />
            <StatCard
                icon={<AlertTriangle className="h-4 w-4" />}
                label="Overdue"
                value={formatCurrency(overdueValue)}
                subValue={`${overdueInvoices.length} invoice${overdueInvoices.length === 1 ? "" : "s"}`}
                gradient="from-rose-500 to-rose-700"
            />
        </div>
    )
}
