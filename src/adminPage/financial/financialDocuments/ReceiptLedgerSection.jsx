"use client"

import { useState } from "react"
import { ChevronDown, Receipt as ReceiptIcon } from "lucide-react"
import { MdOutlineDateRange } from "react-icons/md";

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(amount || 0)

const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : "N/A")

export default function ReceiptLedgerSection({ receiptLedger }) {
    const [expanded, setExpanded] = useState(true)

    const receiptCount = receiptLedger.filter(r => r.documentType !== "CREDIT_NOTE").length
    const creditNoteCount = receiptLedger.length - receiptCount
    const net = receiptLedger.reduce(
        (sum, r) => sum + (r.documentType === "CREDIT_NOTE" ? -r.amount : r.amount),
        0
    )

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex items-center justify-between cursor-pointer"
            >
                <div className="flex items-center gap-2">
                    <ReceiptIcon className="h-5 w-5 text-gray-500" />
                    <div className="text-left">
                        <h2 className="text-lg font-semibold">Receipt Ledger</h2>
                        <p className="text-xs text-gray-400">
                            Every receipt{creditNoteCount > 0 ? " and credit note" : ""} issued this period, individually
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(net)}</p>
                        <p className="text-xs text-gray-500">
                            {receiptCount} receipt{receiptCount === 1 ? "" : "s"}
                            {creditNoteCount > 0 && `, ${creditNoteCount} credit note${creditNoteCount === 1 ? "" : "s"}`}
                        </p>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
                </div>
            </button>

            {expanded && (
                <div className="mt-4 border-t border-gray-200 pt-3">
                    {receiptLedger.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-4">No receipts or credit notes in this period.</p>
                    ) : (
                        <div className="overflow-x-auto max-h-96 overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Code</th>
                                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {receiptLedger.map((r) => {
                                        const isCreditNote = r.documentType === "CREDIT_NOTE"
                                        return (
                                            <tr key={r.id} className={isCreditNote ? "bg-red-50/50" : ""}>
                                                <td className="px-3 py-2 whitespace-nowrap text-gray-500">
                                                    <div className="flex flex-col">
                                                        <span className="flex items-center gap-1 font-bold"> <MdOutlineDateRange /> {formatDate(r.date)}</span> 
                                                        <span className="text-xs"> {r.receiptNumber}</span>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${isCreditNote ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                                                            }`}
                                                    >
                                                        {isCreditNote ? "Credit Note" : "Receipt"}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                                                    {r.name} <span className="text-gray-400">({r.admnNumber})</span>
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-gray-500">{r.paymentMethod || "—"}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-gray-500">{r.transactionCode || "—"}</td>
                                                <td className={`px-3 py-2 whitespace-nowrap text-right font-semibold ${isCreditNote ? "text-red-600" : "text-gray-900"}`}>
                                                    {isCreditNote ? "− " : ""}{formatCurrency(r.amount)}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
