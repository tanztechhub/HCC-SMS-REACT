"use client"

import { Filter } from "lucide-react"

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: Math.max(1, currentYear - 2025 + 1) }, (_, i) => currentYear - i)

const TYPES = [
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
    { value: "custom", label: "Custom Range" },
]

export default function ReportFilters({
    periodType, setPeriodType,
    selectedMonth, setSelectedMonth,
    selectedYear, setSelectedYear,
    customFrom, setCustomFrom,
    customTo, setCustomTo,
}) {
    return (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-gray-700">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-semibold">Filters</span>
            </div>

            <div className="flex rounded-md overflow-hidden border-2 border-gray-300">
                {TYPES.map((t) => (
                    <button
                        key={t.value}
                        type="button"
                        onClick={() => setPeriodType(t.value)}
                        className={`px-3 py-2 text-sm font-medium cursor-pointer transition-colors ${periodType === t.value ? "bg-orange-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {periodType === "month" && (
                <div className="flex items-center gap-2">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm cursor-pointer"
                    >
                        {MONTHS.map((m) => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm cursor-pointer"
                    >
                        {YEARS.map((yr) => (
                            <option key={yr} value={yr}>{yr}</option>
                        ))}
                    </select>
                </div>
            )}

            {periodType === "year" && (
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm cursor-pointer"
                >
                    {YEARS.map((yr) => (
                        <option key={yr} value={yr}>{yr}</option>
                    ))}
                </select>
            )}

            {periodType === "custom" && (
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={customFrom}
                        onChange={(e) => setCustomFrom(e.target.value)}
                        className="px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    />
                    <span className="text-gray-400 text-sm">to</span>
                    <input
                        type="date"
                        value={customTo}
                        onChange={(e) => setCustomTo(e.target.value)}
                        min={customFrom || undefined}
                        className="px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    />
                </div>
            )}
        </div>
    )
}
