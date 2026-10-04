"use client"

import { useState } from "react"
import { toast } from "react-hot-toast"
import { ChevronDown, Loader2 } from "lucide-react"

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]

export default function SalaryPersonRow({ person, type, formatCurrency, onProcessPayment, onAddBonus }) {
    const [expanded, setExpanded] = useState(false)
    const [month, setMonth] = useState("")
    const [year, setYear] = useState(new Date().getFullYear())
    const [amount, setAmount] = useState(person.salary?.toString() || "")
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState("")

    const [bonusTitle, setBonusTitle] = useState("")
    const [bonusAmount, setBonusAmount] = useState("")
    const [bonusDescription, setBonusDescription] = useState("")
    const [isAddingBonus, setIsAddingBonus] = useState(false)

    const payments = person.salaryPayments || []
    const paidCount = payments.filter((p) => p.status === "paid").length

    const handleProcessPayment = async (e) => {
        e.preventDefault()
        if (!month) {
            setError("Please select a month")
            return
        }
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            setError("Please enter a valid amount")
            return
        }

        setError("")
        setIsProcessing(true)
        try {
            await onProcessPayment(type, person._id, month, Number(year), Number(amount))
            toast.success("Salary payment successful")
            setMonth("")
        } catch (err) {
            toast.error(err.message || "Failed to process payment")
        } finally {
            setIsProcessing(false)
        }
    }

    const handleAddBonus = async (e) => {
        e.preventDefault()
        if (!bonusTitle || !bonusAmount) return

        setIsAddingBonus(true)
        try {
            await onAddBonus(type, person._id, {
                title: bonusTitle,
                amount: Number(bonusAmount),
                description: bonusDescription,
            })
            toast.success("Bonus added successfully")
            setBonusTitle("")
            setBonusAmount("")
            setBonusDescription("")
        } catch (err) {
            toast.error(err.message || "Failed to add bonus")
        } finally {
            setIsAddingBonus(false)
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
                        src={person.profilePicture || "/profile/student.jpg"}
                        alt=""
                    />
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {person.firstName} {person.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {person.email} &middot; {person.role}
                            {type === "tutors" && ` · ${person.studentCount || 0} students`}
                        </p>
                    </div>
                </div>

                <div className="hidden sm:flex items-center gap-6 text-sm text-gray-600 flex-shrink-0">
                    <div className="text-right">
                        <p className="text-xs text-gray-400">Monthly Salary</p>
                        <p>{formatCurrency(person.salary)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400">Bonuses</p>
                        <p>{person.bonuses?.length || 0}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {paidCount} paid
                    </span>
                    <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
                </div>
            </button>

            {expanded && (
                <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-4">
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Payment History</h4>
                        {payments.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {payments.map((payment, index) => (
                                    <span
                                        key={index}
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${payment.status === "paid" ? "bg-orange-100 text-orange-800" : "bg-yellow-100 text-yellow-800"
                                            }`}
                                    >
                                        {payment.month} {payment.year}
                                        {payment.status === "paid" && (
                                            <span className="ml-1 text-xs">({formatCurrency(payment.amount)})</span>
                                        )}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500">No payment history recorded yet.</p>
                        )}
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Bonuses</h4>
                        {person.bonuses?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {person.bonuses.map((bonus, index) => (
                                    <span
                                        key={index}
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bonus.status === "paid" ? "bg-purple-100 text-purple-800" : "bg-orange-100 text-orange-800"
                                            }`}
                                    >
                                        {bonus.title}
                                        <span className="ml-1 text-xs">({formatCurrency(bonus.amount)})</span>
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500">No bonuses recorded yet.</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <form onSubmit={handleProcessPayment} className="border-t border-gray-200 pt-3">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Process Salary Payment</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <select
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    className="border-2 border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-blue-400 cursor-pointer"
                                >
                                    <option value="">Select Month</option>
                                    {MONTHS.map((m) => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                                <select
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    className="border-2 border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-blue-400 cursor-pointer"
                                >
                                    {[2024, 2025, 2026].map((yr) => (
                                        <option key={yr} value={yr}>{yr}</option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Amount"
                                    className="border-2 border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-blue-400 col-span-2"
                                />
                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="col-span-2 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-md py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                                >
                                    {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {isProcessing ? "Processing..." : "Process Payment"}
                                </button>
                            </div>
                            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
                        </form>

                        <form onSubmit={handleAddBonus} className="border-t border-gray-200 pt-3">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Add Bonus</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    value={bonusTitle}
                                    onChange={(e) => setBonusTitle(e.target.value)}
                                    placeholder="e.g. Christmas Bonus"
                                    className="border-2 border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-orange-400 col-span-2"
                                />
                                <input
                                    type="number"
                                    value={bonusAmount}
                                    onChange={(e) => setBonusAmount(e.target.value)}
                                    placeholder="Amount"
                                    className="border-2 border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-orange-400 col-span-2"
                                />
                                <input
                                    type="text"
                                    value={bonusDescription}
                                    onChange={(e) => setBonusDescription(e.target.value)}
                                    placeholder="Description (optional)"
                                    className="border-2 border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-orange-400 col-span-2"
                                />
                                <button
                                    type="submit"
                                    disabled={isAddingBonus}
                                    className="col-span-2 flex items-center justify-center gap-2 bg-orange-600 text-white rounded-md py-2 text-sm font-medium hover:bg-orange-700 disabled:opacity-50 cursor-pointer"
                                >
                                    {isAddingBonus && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {isAddingBonus ? "Adding..." : "Add Bonus"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
