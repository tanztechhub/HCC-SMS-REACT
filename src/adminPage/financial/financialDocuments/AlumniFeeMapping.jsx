"use client"

import { useState } from "react"
import { ChevronDown, CheckCircle2, Clock, AlertTriangle } from "lucide-react"

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(amount || 0)

const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : "N/A")

// One color per balance group, used on both the group's border and its
// header chip, so it stays a visible landmark while scrolling a long list.
const COLOR_STYLES = {
    green: { border: "border-orange-400", chip: "bg-orange-50", icon: "text-orange-600" },
    yellow: { border: "border-yellow-400", chip: "bg-yellow-50", icon: "text-yellow-600" },
    orange: { border: "border-orange-400", chip: "bg-orange-50", icon: "text-orange-600" },
}

const AlumnusRow = ({ alumnus }) => {
    const [expanded, setExpanded] = useState(true)

    return (
        <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex items-center justify-between gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer text-left"
            >
                <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{alumnus.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                        {alumnus.admissionNumber} &middot; {alumnus.course} &middot; graduated {formatDate(alumnus.graduationDate)}
                    </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-xs">
                    <div className="text-right hidden sm:block">
                        <p className="text-gray-400">Fee / Paid</p>
                        <p className="text-gray-700">{formatCurrency(alumnus.courseFee)} / {formatCurrency(alumnus.upfrontFee)}</p>
                    </div>
                    <span
                        className={`px-2 py-1 rounded-full font-medium ${alumnus.balance === 0
                                ? "bg-orange-100 text-orange-800"
                                : alumnus.balance > 0
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-orange-100 text-orange-800"
                            }`}
                    >
                        {alumnus.balance === 0 ? "Settled" : formatCurrency(Math.abs(alumnus.balance))}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
                </div>
            </button>

            {expanded && (
                <div className="border-t border-gray-200 bg-gray-50 p-3">
                    <h4 className="text-xs font-semibold text-gray-600 mb-2">Payment History</h4>
                    {alumnus.paymentHistory.length === 0 ? (
                        <p className="text-xs text-gray-500">No receipts on record for this admission number.</p>
                    ) : (
                        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                            {alumnus.paymentHistory.map((doc) => {
                                const isCreditNote = doc.documentType === "CREDIT_NOTE"
                                return (
                                    <div key={doc.id} className={`rounded-md border p-2 text-xs ${isCreditNote ? "border-red-200 bg-red-50" : "border-gray-200 bg-white"}`}>
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span className={`font-bold ${isCreditNote ? "text-red-600" : "text-orange-600"}`}>
                                                {isCreditNote ? "CREDIT NOTE" : "RECEIPT"} &middot; {doc.receiptNumber}
                                            </span>
                                            <span className="text-gray-400">{formatDate(doc.date)}</span>
                                        </div>
                                        <div className="mt-1 grid grid-cols-2 gap-1 text-gray-600">
                                            <p className={isCreditNote ? "text-red-600" : ""}>
                                                Amount: {isCreditNote ? "− " : ""}{formatCurrency(doc.amount)}
                                            </p>
                                            <p>Method: {doc.paymentMethod || "N/A"}</p>
                                        </div>
                                        {doc.transactionCode && <p className="mt-1 text-gray-500">Code: {doc.transactionCode}</p>}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

const GroupCard = ({ title, icon, alumni, color, emptyText }) => {
    const [expanded, setExpanded] = useState(true)
    const sum = alumni.reduce((s, a) => s + Math.abs(a.balance), 0)
    const c = COLOR_STYLES[color]

    return (
        <div className={`border border-gray-200 border-l-4 ${c.border} rounded-lg overflow-hidden`}>
            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className={`w-full flex items-center justify-between px-4 py-3 ${c.chip} hover:brightness-95 cursor-pointer`}
            >
                <div className="flex items-center gap-2">
                    <span className={c.icon}>{icon}</span>
                    <div className="text-left">
                        <p className="text-sm font-semibold text-gray-800">{title}</p>
                        <p className="text-xs text-gray-500">{alumni.length} alumnus{alumni.length === 1 ? "" : "es"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(sum)}</p>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
                </div>
            </button>
            {expanded && (
                <div className="border-t border-gray-200 bg-gray-50 p-3 space-y-2 max-h-[28rem] overflow-y-auto">
                    {alumni.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-2">{emptyText}</p>
                    ) : (
                        alumni.map((a) => <AlumnusRow key={a.id} alumnus={a} />)
                    )}
                </div>
            )}
        </div>
    )
}

export default function AlumniFeeMapping({ alumni }) {
    const { complete, pending, conflict, counts } = alumni

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-baseline justify-between mb-1">
                <h2 className="text-lg font-semibold">Alumni Fee Status</h2>
                <p className="text-xs text-gray-400">All-time snapshot across all {counts.total} alumni</p>
            </div>
            <p className="text-xs text-gray-400 mb-3">
                Grouped by final balance at graduation — payment history is sourced from the Receipt collection
                since alumni no longer carry a live fee-update log.
            </p>

            <div className="space-y-2">
                <GroupCard
                    title="Complete Fee"
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    color="green"
                    alumni={complete}
                    emptyText="No alumni fully settled their fee."
                />
                <GroupCard
                    title="Pending Fee"
                    icon={<Clock className="h-4 w-4" />}
                    color="yellow"
                    alumni={pending}
                    emptyText="No alumni with pending fees."
                />
                <GroupCard
                    title="Conflict Fee (Overpaid)"
                    icon={<AlertTriangle className="h-4 w-4" />}
                    color="orange"
                    alumni={conflict}
                    emptyText="No overpaid alumni."
                />
            </div>
        </div>
    )
}
