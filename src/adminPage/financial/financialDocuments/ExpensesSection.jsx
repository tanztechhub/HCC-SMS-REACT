"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(amount || 0)

const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : "N/A")

// One color per expense category, used on both the stat card up top and its
// matching accordion below, so the border stays visible as a landmark while
// scrolling through a long list of line items.
const COLOR_STYLES = {
    blue: { border: "border-blue-400", chip: "bg-blue-50" },
    purple: { border: "border-purple-400", chip: "bg-purple-50" },
    cyan: { border: "border-cyan-400", chip: "bg-cyan-50" },
}

const StatCard = ({ label, total, subValue, color }) => {
    const c = COLOR_STYLES[color]
    return (
        <div className={`rounded-md border border-gray-200 border-l-4 ${c.border} px-4 py-3`}>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(total)}</p>
            {subValue && <p className="text-xs text-gray-400 mt-0.5">{subValue}</p>}
        </div>
    )
}

const ExpandableList = ({ title, total, count, color, children, emptyText }) => {
    const [expanded, setExpanded] = useState(true)
    const c = COLOR_STYLES[color]
    return (
        <div className={`border border-gray-200 border-l-4 ${c.border} rounded-lg overflow-hidden`}>
            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className={`w-full flex items-center justify-between px-4 py-3 ${c.chip} hover:brightness-95 cursor-pointer`}
            >
                <div className="text-left">
                    <p className="text-sm font-semibold text-gray-800">{title}</p>
                    <p className="text-xs text-gray-500">{count} item{count === 1 ? "" : "s"}</p>
                </div>
                <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(total)}</p>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
                </div>
            </button>
            {expanded && (
                <div className="border-t border-gray-200 bg-gray-50 p-3 max-h-64 overflow-y-auto space-y-1.5">
                    {count === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-2">{emptyText}</p>
                    ) : (
                        children
                    )}
                </div>
            )}
        </div>
    )
}

export default function ExpensesSection({ expenses }) {
    const { salaries, bonuses, bills } = expenses

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-1">Expenses</h2>
            <p className="text-xs text-gray-400 mb-3">Only payments actually marked paid within the selected period</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <StatCard
                    label="Salaries Paid"
                    total={salaries.total}
                    subValue={`Staff ${formatCurrency(salaries.staffTotal)} · Tutors ${formatCurrency(salaries.tutorTotal)}`}
                    color="blue"
                />
                <StatCard
                    label="Bonuses Paid"
                    total={bonuses.total}
                    subValue={`Staff ${formatCurrency(bonuses.staffTotal)} · Tutors ${formatCurrency(bonuses.tutorTotal)}`}
                    color="purple"
                />
                <StatCard
                    label="Bills Paid"
                    total={bills.total}
                    subValue={`${bills.count} bill${bills.count === 1 ? "" : "s"}`}
                    color="cyan"
                />
            </div>

            <div className="space-y-2">
                <ExpandableList title="Salary Payments" total={salaries.total} count={salaries.details.length} color="blue" emptyText="No salary payments in this period">
                    {salaries.details.map((d, i) => (
                        <div key={i} className="flex items-center justify-between rounded-md bg-white border border-gray-200 px-3 py-2 text-xs">
                            <div>
                                <p className="font-medium text-gray-800">{d.name} <span className="text-gray-400 capitalize">({d.type})</span></p>
                                <p className="text-gray-400">{d.month} {d.year} &middot; {formatDate(d.paidAt)}</p>
                            </div>
                            <p className="font-semibold text-gray-900">{formatCurrency(d.amount)}</p>
                        </div>
                    ))}
                </ExpandableList>

                <ExpandableList title="Bonuses" total={bonuses.total} count={bonuses.details.length} color="purple" emptyText="No bonuses paid in this period">
                    {bonuses.details.map((d, i) => (
                        <div key={i} className="flex items-center justify-between rounded-md bg-white border border-gray-200 px-3 py-2 text-xs">
                            <div>
                                <p className="font-medium text-gray-800">{d.name} <span className="text-gray-400 capitalize">({d.type})</span></p>
                                <p className="text-gray-400">{d.title} &middot; {formatDate(d.paidAt)}</p>
                            </div>
                            <p className="font-semibold text-gray-900">{formatCurrency(d.amount)}</p>
                        </div>
                    ))}
                </ExpandableList>

                <ExpandableList title="Paid Bills" total={bills.total} count={bills.bills.length} color="cyan" emptyText="No bills paid in this period">
                    {bills.bills.map((b) => (
                        <div key={b._id} className="flex items-center justify-between rounded-md bg-white border border-gray-200 px-3 py-2 text-xs">
                            <div>
                                <p className="font-medium text-gray-800">{b.vendor} <span className="text-gray-400">({b.billNumber})</span></p>
                                <p className="text-gray-400">{formatDate(b.date)}</p>
                            </div>
                            <p className="font-semibold text-gray-900">{formatCurrency(b.amount)}</p>
                        </div>
                    ))}
                </ExpandableList>
            </div>
        </div>
    )
}
