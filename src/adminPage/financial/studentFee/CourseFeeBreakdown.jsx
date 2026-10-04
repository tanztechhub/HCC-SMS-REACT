"use client"

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(amount || 0)

export default function CourseFeeBreakdown({ courseWiseFeeData }) {
    if (!courseWiseFeeData.length) return null

    return (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h2 className="text-base font-semibold mb-3">Fee Collection per Course</h2>
            <div className="space-y-3">
                {courseWiseFeeData.map((course) => {
                    const total = course.paid + course.pending
                    const percent = total > 0 ? Math.round((course.paid / total) * 100) : 0
                    return (
                        <div key={course.name}>
                            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-0.5 text-sm mb-1">
                                <span className="font-medium text-gray-800">{course.name}</span>
                                <span className="text-xs text-gray-500">
                                    Paid {formatCurrency(course.paid)} · Pending {formatCurrency(course.pending)} · {percent}%
                                </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden flex">
                                <div className="h-full bg-orange-500" style={{ width: `${percent}%` }} />
                                <div className="h-full bg-yellow-400" style={{ width: `${100 - percent}%` }} />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
