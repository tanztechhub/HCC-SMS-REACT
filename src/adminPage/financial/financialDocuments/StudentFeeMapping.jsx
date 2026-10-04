"use client"

import { useState } from "react"
import { ChevronDown, CheckCircle2, Clock, AlertTriangle } from "lucide-react"

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(amount || 0)

const formatDateTime = (date) => (date ? new Date(date).toLocaleString() : "N/A")

// One color per balance group, used on both the group's border and its
// header chip, so it stays a visible landmark while scrolling a long list.
const COLOR_STYLES = {
    green: { border: "border-orange-400", chip: "bg-orange-50", icon: "text-orange-600" },
    yellow: { border: "border-yellow-400", chip: "bg-yellow-50", icon: "text-yellow-600" },
    orange: { border: "border-orange-400", chip: "bg-orange-50", icon: "text-orange-600" },
}

const StudentRow = ({ student }) => {
    const [expanded, setExpanded] = useState(true)

    return (
        <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex items-center justify-between gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer text-left"
            >
                <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{student.name}</p>
                    <p className="text-xs text-gray-500 truncate">{student.admissionNumber} &middot; {student.course}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-xs">
                    <div className="text-right hidden sm:block">
                        <p className="text-gray-400">Fee / Paid</p>
                        <p className="text-gray-700">{formatCurrency(student.courseFee)} / {formatCurrency(student.upfrontFee)}</p>
                    </div>
                    <span
                        className={`px-2 py-1 rounded-full font-medium ${student.balance === 0
                                ? "bg-orange-100 text-orange-800"
                                : student.balance > 0
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-orange-100 text-orange-800"
                            }`}
                    >
                        {student.balance === 0 ? "Settled" : formatCurrency(Math.abs(student.balance))}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
                </div>
            </button>

            {expanded && (
                <div className="border-t border-gray-200 bg-gray-50 p-3">
                    <h4 className="text-xs font-semibold text-gray-600 mb-2">Fee Payment History</h4>
                    {student.feeUpdates.length === 0 ? (
                        <p className="text-xs text-gray-500">No fee updates recorded yet.</p>
                    ) : (
                        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                            {student.feeUpdates.map((update, idx) => (
                                <div key={update._id || idx} className="rounded-md border border-gray-200 bg-white p-2 text-xs">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className={`font-bold ${update.changeType === "decrease" ? "text-red-600" : "text-orange-600"}`}>
                                            {(update.changeType || "update").toUpperCase()}
                                        </span>
                                        <span className="text-gray-400">{formatDateTime(update.timestamp)}</span>
                                    </div>
                                    <div className="mt-1 grid grid-cols-2 gap-1 text-gray-600">
                                        <p>Amount: {formatCurrency(update.amount)}</p>
                                        <p>Method: {update.paymentMethod || "N/A"}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

const GroupCard = ({ title, icon, students, total, color, emptyText }) => {
    const [expanded, setExpanded] = useState(true)
    const sum = students.reduce((s, st) => s + Math.abs(st.balance), 0)
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
                        <p className="text-xs text-gray-500">{students.length} student{students.length === 1 ? "" : "s"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(sum)}</p>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
                </div>
            </button>
            {expanded && (
                <div className="border-t border-gray-200 bg-gray-50 p-3 space-y-2 max-h-[28rem] overflow-y-auto">
                    {students.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-2">{emptyText}</p>
                    ) : (
                        students.map((s) => <StudentRow key={s.id} student={s} />)
                    )}
                </div>
            )}
        </div>
    )
}

export default function StudentFeeMapping({ students }) {
    const { complete, pending, conflict, counts } = students

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-baseline justify-between mb-1">
                <h2 className="text-lg font-semibold">Student Fee Status</h2>
                <p className="text-xs text-gray-400">Current snapshot across all {counts.total} active students</p>
            </div>
            <p className="text-xs text-gray-400 mb-3">
                Grouped by current balance — complete (fully paid), pending (still owing), and conflict (overpaid).
            </p>

            <div className="space-y-2">
                <GroupCard
                    title="Complete Fee"
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    color="green"
                    students={complete}
                    emptyText="No students have fully settled their fee yet."
                />
                <GroupCard
                    title="Pending Fee"
                    icon={<Clock className="h-4 w-4" />}
                    color="yellow"
                    students={pending}
                    emptyText="No students with pending fees."
                />
                <GroupCard
                    title="Conflict Fee (Overpaid)"
                    icon={<AlertTriangle className="h-4 w-4" />}
                    color="orange"
                    students={conflict}
                    emptyText="No overpaid students."
                />
            </div>
        </div>
    )
}
