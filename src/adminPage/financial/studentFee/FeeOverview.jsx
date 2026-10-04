"use client"

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(amount || 0)

const StatTile = ({ label, value, valueClassName = "text-gray-900" }) => (
    <div className="flex-1 min-w-[110px] rounded-md border border-gray-200 bg-white px-4 py-3">
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`text-2xl font-bold ${valueClassName}`}>{value}</p>
    </div>
)

export default function FeeOverview({ feeStats }) {
    const { totalStudents, completedFees, pendingFees, conflictCases, totalExpected, totalPaid } = feeStats
    const outstanding = totalExpected - totalPaid
    const percentPaid = totalExpected > 0 ? Math.min(100, Math.round((totalPaid / totalExpected) * 100)) : 0

    return (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-wrap gap-3 mb-4">
                <StatTile label="Total Students" value={totalStudents} />
                <StatTile label="Completed" value={completedFees} valueClassName="text-orange-600" />
                <StatTile label="Pending" value={pendingFees} valueClassName="text-yellow-600" />
                <StatTile label="Conflicts" value={conflictCases} valueClassName="text-orange-600" />
            </div>

            <div>
                <div className="flex flex-wrap items-center justify-between gap-1 text-sm mb-1">
                    <span className="text-gray-600">
                        Collected <span className="font-semibold text-gray-900">{formatCurrency(totalPaid)}</span> of{" "}
                        <span className="font-semibold text-gray-900">{formatCurrency(totalExpected)}</span>
                    </span>
                    <span className="font-semibold text-gray-900">{percentPaid}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-orange-500" style={{ width: `${percentPaid}%` }} />
                </div>
                <p className="mt-1 text-xs text-red-600">
                    Outstanding balance: {formatCurrency(outstanding)}
                </p>
            </div>
        </div>
    )
}
