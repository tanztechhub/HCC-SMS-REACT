"use client"

import { FileText } from "lucide-react"

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(amount || 0)

export default function InvoicesInfoCard({ invoices }) {
    return (
        <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-800">Invoices Issued This Period</p>
                    <p className="text-xs text-gray-400">
                        Informational only — not counted as revenue or expense
                    </p>
                </div>
            </div>
            <div className="text-right shrink-0">
                <p className="text-lg font-bold text-gray-900">{formatCurrency(invoices.total)}</p>
                <p className="text-xs text-gray-500">{invoices.count} invoice{invoices.count === 1 ? "" : "s"}</p>
            </div>
        </div>
    )
}
