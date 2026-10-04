"use client"

import { useState, useEffect, useMemo } from "react"
import { toast } from "react-hot-toast"
import ReportFilters from "./ReportFilters"
import ReportSkeleton from "./ReportSkeleton"
import ReportKpiRow from "./ReportKpiRow"
import RevenueSection from "./RevenueSection"
import ReceiptLedgerSection from "./ReceiptLedgerSection"
import ExpensesSection from "./ExpensesSection"
import OverdueBillsCard from "./OverdueBillsCard"
import InvoicesInfoCard from "./InvoicesInfoCard"
import StudentFeeMapping from "./StudentFeeMapping"
import AlumniFeeMapping from "./AlumniFeeMapping"
import EnrollmentSection from "./EnrollmentSection"

const API_URL = import.meta.env.VITE_API_URL
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]

const toISODate = (date) => date.toISOString().slice(0, 10)

const lastDayOfMonth = (year, monthIndex) => new Date(year, monthIndex + 1, 0).getDate()

export default function FinancialDocuments() {
    const now = new Date()
    const [periodType, setPeriodType] = useState("month")
    const [selectedMonth, setSelectedMonth] = useState(MONTHS[now.getMonth()])
    const [selectedYear, setSelectedYear] = useState(now.getFullYear())
    const [customFrom, setCustomFrom] = useState("")
    const [customTo, setCustomTo] = useState("")

    const [report, setReport] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    const user = JSON.parse(localStorage.getItem("user")) || {}

    const range = useMemo(() => {
        if (periodType === "month") {
            const monthIndex = MONTHS.indexOf(selectedMonth)
            const from = `${selectedYear}-${String(monthIndex + 1).padStart(2, "0")}-01`
            const to = `${selectedYear}-${String(monthIndex + 1).padStart(2, "0")}-${String(lastDayOfMonth(selectedYear, monthIndex)).padStart(2, "0")}`
            return { from, to }
        }
        if (periodType === "year") {
            return { from: `${selectedYear}-01-01`, to: `${selectedYear}-12-31` }
        }
        // custom
        if (customFrom && customTo && customFrom <= customTo) {
            return { from: customFrom, to: customTo }
        }
        return null
    }, [periodType, selectedMonth, selectedYear, customFrom, customTo])

    useEffect(() => {
        if (user.role !== "senior") return
        if (!range) return

        const fetchReport = async () => {
            setIsLoading(true)
            try {
                const res = await fetch(`${API_URL}/reports?from=${range.from}&to=${range.to}`)
                const data = await res.json()
                if (!data.success) throw new Error(data.message)
                setReport(data.data)
            } catch (error) {
                toast.error(error.message || "Failed to generate report")
            } finally {
                setIsLoading(false)
            }
        }

        fetchReport()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [range?.from, range?.to])

    if (user.role !== "senior") {
        return (
            <div className="p-6">
                <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
                    Reports are only available to senior admins.
                </div>
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-orange-800">Reports</h1>
            </div>

            <ReportFilters
                periodType={periodType}
                setPeriodType={setPeriodType}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                customFrom={customFrom}
                setCustomFrom={setCustomFrom}
                customTo={customTo}
                setCustomTo={setCustomTo}
            />

            {periodType === "custom" && !range && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-md p-3 mb-6">
                    Select a valid "from" and "to" date to generate the report.
                </div>
            )}

            {isLoading || !report ? (
                <>
                    <p className="text-xs text-gray-500 mb-3">
                        Mapping every student and alumnus individually — this can take a minute or two for a large
                        roster or a full year.
                    </p>
                    <ReportSkeleton />
                </>
            ) : (
                <div className="space-y-6">
                    <ReportKpiRow report={report} />
                    <RevenueSection revenue={report.revenue} />
                    <ReceiptLedgerSection receiptLedger={report.receiptLedger} />
                    <ExpensesSection expenses={report.expenses} />
                    <OverdueBillsCard overdueBills={report.expenses.overdueBills} />
                    <InvoicesInfoCard invoices={report.invoices} />
                    <EnrollmentSection enrollment={report.enrollment} />
                    <StudentFeeMapping students={report.students} />
                    <AlumniFeeMapping alumni={report.alumni} />
                </div>
            )}
        </div>
    )
}
