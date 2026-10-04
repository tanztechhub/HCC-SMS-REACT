"use client"

import { useState } from "react"
import { toast } from "react-hot-toast"
import { ChevronDown, Loader2 } from "lucide-react"
import ReceiptViewModal from "../receipts/ReceiptViewModal"

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(amount || 0)

const formatDateTime = (date) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleString()
}

export default function StudentFeeRow({ student, onUpdate }) {
    const [expanded, setExpanded] = useState(false)
    const [changeType, setChangeType] = useState("increase")
    const [paymentMethod, setPaymentMethod] = useState("M-PESA")
    const [amount, setAmount] = useState("")
    const [transactionCode, setTransactionCode] = useState("")
    const [note, setNote] = useState("")
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [generatedReceipt, setGeneratedReceipt] = useState(null)

    const totalFee = student.courseFee
    const paidAmount = student.upfrontFee || 0
    const balance = totalFee - paidAmount
    const status = balance <= 0 ? "Paid" : "Pending"

    const feeUpdates = [...(student.feeUpdates || [])].sort(
        (a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
    )

    const requiresTransactionCode = changeType === "increase" && ["M-PESA", "BANK", "CHEQUE"].includes(paymentMethod)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            setError("Please enter a valid amount")
            return
        }
        if (requiresTransactionCode && !transactionCode.trim()) {
            setError("Transaction code is required for this payment method")
            return
        }

        setIsSubmitting(true)
        setError("")
        try {
            const receipt = await onUpdate(student._id, {
                amount: Number(amount),
                changeType,
                paymentMethod,
                transactionCode: transactionCode.trim(),
                note: note.trim(),
            })
            setChangeType("increase")
            setPaymentMethod("M-PESA")
            setAmount("")
            setTransactionCode("")
            setNote("")
            if (receipt) setGeneratedReceipt(receipt)
        } catch (err) {
            toast.error(err.message || "Failed to update fee")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex items-center justify-between gap-4 px-4 py-3 bg-white hover:bg-gray-50 cursor-pointer text-left"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <img
                        className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                        src={student.profileImage || "/profile/student.jpg"}
                        alt=""
                    />
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {student.firstName} {student.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {student.admissionNumber} &middot; {student.courseName}
                        </p>
                    </div>
                </div>

                <div className="hidden sm:flex items-center gap-6 text-sm text-gray-600 flex-shrink-0">
                    <div className="text-right">
                        <p className="text-xs text-gray-400">Total</p>
                        <p>{formatCurrency(totalFee)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400">Paid</p>
                        <p>{formatCurrency(paidAmount)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400">Balance</p>
                        <p className={balance < 0 ? "text-orange-600" : ""}>
                            {formatCurrency(Math.abs(balance))}
                            {balance < 0 && " (over)"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${status === "Paid"
                                ? balance < 0
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-orange-100 text-orange-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                    >
                        {status}
                    </span>
                    <ChevronDown
                        className={`h-5 w-5 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
                    />
                </div>
            </button>

            {expanded && (
                <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-4">
                    <div className="sm:hidden grid grid-cols-3 gap-2 text-sm">
                        <div>
                            <p className="text-xs text-gray-400">Total</p>
                            <p>{formatCurrency(totalFee)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Paid</p>
                            <p>{formatCurrency(paidAmount)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Balance</p>
                            <p>{formatCurrency(Math.abs(balance))}</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Payment History</h4>
                        {feeUpdates.length > 0 ? (
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {feeUpdates.map((update, idx) => (
                                    <div key={update._id || idx} className="rounded-md border border-gray-200 bg-white p-2.5 text-xs">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span
                                                className={`font-bold ${update.changeType === "decrease" ? "text-red-600" : "text-orange-600"
                                                    }`}
                                            >
                                                {(update.changeType || "update").toUpperCase()}
                                            </span>
                                            <span className="text-gray-400">{formatDateTime(update.timestamp)}</span>
                                        </div>
                                        <div className="mt-1 grid grid-cols-2 gap-1 text-gray-600">
                                            <p>Amount: {formatCurrency(update.amount)}</p>
                                            <p>Method: {update.paymentMethod || "N/A"}</p>
                                            <p>By: {update.processedBy || "system"}</p>
                                        </div>
                                        {update.note && (
                                            <p className="mt-1 text-gray-500">{update.note}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500">No fee updates recorded yet.</p>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="border-t border-gray-200 pt-3">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Update Fee</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-stretch">
                            <div className="flex rounded-md overflow-hidden border-2 border-gray-300">
                                <button
                                    type="button"
                                    onClick={() => setChangeType("increase")}
                                    className={`flex-1 text-xs font-bold cursor-pointer ${changeType === "increase" ? "bg-orange-600 text-white" : "bg-white text-gray-600"
                                        }`}
                                >
                                    + Add
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setChangeType("decrease")}
                                    className={`flex-1 text-xs font-bold cursor-pointer ${changeType === "decrease" ? "bg-red-600 text-white" : "bg-white text-gray-600"
                                        }`}
                                >
                                    − Deduct
                                </button>
                            </div>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="border-2 border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-orange-400"
                            >
                                <option value="M-PESA">M-PESA</option>
                                <option value="BANK">BANK</option>
                                <option value="CHEQUE">CHEQUE</option>
                                <option value="OTHER">OTHER</option>
                            </select>
                            <input
                                type="number"
                                min="1"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Amount"
                                className="border-2 border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-orange-400"
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center justify-center gap-2 bg-orange-600 text-white rounded-md py-2 text-sm font-medium hover:bg-orange-700 disabled:opacity-50 cursor-pointer"
                            >
                                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isSubmitting ? "Saving..." : "Save"}
                            </button>
                        </div>
                        {requiresTransactionCode && (
                            <input
                                type="text"
                                value={transactionCode}
                                onChange={(e) => setTransactionCode(e.target.value)}
                                placeholder="Transaction code (e.g. QGH7XXXXXX)"
                                className="mt-2 w-full border-2 border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-orange-400"
                            />
                        )}
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Note (optional)"
                            className="mt-2 w-full border-2 border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-orange-400"
                        />
                        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
                    </form>
                </div>
            )}

            {generatedReceipt && (
                <ReceiptViewModal receipt={generatedReceipt} onClose={() => setGeneratedReceipt(null)} />
            )}
        </div>
    )
}
