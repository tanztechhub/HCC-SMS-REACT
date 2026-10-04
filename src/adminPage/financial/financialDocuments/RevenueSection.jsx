"use client"

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(amount || 0)

export default function RevenueSection({ revenue }) {
    const { totalFee, totalCollected, totalPending, collectedInPeriod, receiptCount, creditNoteCount, alumniIncluded } = revenue
    const percentCollected = totalFee > 0 ? Math.min(100, Math.round((totalCollected / totalFee) * 100)) : 0

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-baseline justify-between mb-1">
                <h2 className="text-lg font-semibold">Revenue</h2>
                <p className="text-xs text-gray-400">
                    All active students, plus {alumniIncluded} alumni with a receipt in this period
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 mb-4">
                <div className="rounded-md border border-gray-200 px-4 py-3">
                    <p className="text-xs text-gray-500">Total Fee (Active + Relevant Alumni)</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(totalFee)}</p>
                </div>
                <div className="rounded-md border border-gray-200 px-4 py-3">
                    <p className="text-xs text-gray-500">Total Collected</p>
                    <p className="text-lg font-bold text-orange-600">{formatCurrency(totalCollected)}</p>
                </div>
                <div className="rounded-md border border-gray-200 px-4 py-3">
                    <p className="text-xs text-gray-500">Total Pending</p>
                    <p className="text-lg font-bold text-amber-600">{formatCurrency(totalPending)}</p>
                </div>
                <div className="rounded-md border-2 border-orange-200 bg-orange-50 px-4 py-3">
                    <p className="text-xs text-gray-500">Collected This Period</p>
                    <p className="text-lg font-bold text-orange-700">{formatCurrency(collectedInPeriod)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {receiptCount} receipt{receiptCount === 1 ? "" : "s"}
                        {creditNoteCount > 0 && ` · net of ${creditNoteCount} credit note${creditNoteCount === 1 ? "" : "s"}`}
                    </p>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Overall collection progress</span>
                    <span className="font-semibold text-gray-900">{percentCollected}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-orange-500" style={{ width: `${percentCollected}%` }} />
                </div>
            </div>
        </div>
    )
}
