"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { Plus, Search, Eye, Pencil, Trash2, Filter } from "lucide-react"
import ReceiptFormModal from "./ReceiptFormModal"
import ReceiptViewModal from "./ReceiptViewModal"
import ReceiptStats from "./ReceiptStats"

const API_URL = import.meta.env.VITE_API_URL
const currentYear = new Date().getFullYear()
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(amount || 0)

export default function Receipts() {
    const [receipts, setReceipts] = useState([])
    const [courses, setCourses] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedYear, setSelectedYear] = useState(currentYear)
    const [monthFilter, setMonthFilter] = useState("all")
    const [typeFilter, setTypeFilter] = useState("all")
    const [showFormModal, setShowFormModal] = useState(false)
    const [editingReceipt, setEditingReceipt] = useState(null)
    const [viewingReceipt, setViewingReceipt] = useState(null)

    useEffect(() => {
        fetchCourses()
    }, [])

    useEffect(() => {
        fetchReceipts()
    }, [selectedYear])

    const fetchCourses = async () => {
        try {
            const res = await fetch(`${API_URL}/courses`)
            const data = await res.json()
            setCourses(Array.isArray(data) ? data : [])
        } catch (error) {
            // Non-fatal: the course dropdown in the form just stays empty.
        }
    }

    const fetchReceipts = async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams()
            if (selectedYear !== "all") params.set("year", selectedYear)
            // Credit notes are excluded by the API by default — pull everything
            // here and let the Type filter below decide what's shown.
            params.set("documentType", "all")
            const res = await fetch(`${API_URL}/receipts?${params.toString()}`)
            const data = await res.json()
            if (!data.success) throw new Error(data.message)
            setReceipts(data.data)
        } catch (error) {
            toast.error("Failed to fetch receipts")
        } finally {
            setIsLoading(false)
        }
    }

    const filteredReceipts = receipts.filter((r) => {
        if (typeFilter !== "all" && r.documentType !== typeFilter) return false
        if (monthFilter !== "all" && new Date(r.date).getMonth() !== Number(monthFilter)) return false
        if (!searchTerm) return true
        const term = searchTerm.toLowerCase()
        return (
            r.name?.toLowerCase().includes(term) ||
            r.receiptNumber?.toLowerCase().includes(term) ||
            r.admnNumber?.toLowerCase().includes(term)
        )
    })

    const handleCreateOrUpdate = async (formData) => {
        setIsSubmitting(true)
        try {
            const isEditing = Boolean(editingReceipt)
            const url = isEditing ? `${API_URL}/receipts/${editingReceipt._id}` : `${API_URL}/receipts`
            const response = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.message)

            toast.success(isEditing ? "Receipt updated successfully" : "Receipt created successfully")
            setReceipts((prev) => {
                if (isEditing) return prev.map((r) => (r._id === data.data._id ? data.data : r))
                return [data.data, ...prev]
            })
            setEditingReceipt(null)
            return true
        } catch (error) {
            toast.error(error.message || "Failed to save receipt")
            return false
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-orange-800">Receipts</h1>
                <button
                    onClick={() => {
                        setEditingReceipt(null)
                        setShowFormModal(true)
                    }}
                    disabled
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors cursor-not-allowed opacity-50"
                >
                    <Plus className="h-5 w-5" />
                    New Receipt
                </button>
            </div>

            <ReceiptStats receipts={filteredReceipts} />

            <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-gray-700">
                    <Filter className="h-4 w-4" />
                    <span className="text-sm font-semibold">Filters</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by name, receipt # or admn #"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                        />
                    </div>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm cursor-pointer"
                    >
                        <option value="all">All Types</option>
                        <option value="RECEIPT">Receipts</option>
                        <option value="CREDIT_NOTE">Credit Notes</option>
                    </select>
                    <select
                        value={monthFilter}
                        onChange={(e) => setMonthFilter(e.target.value)}
                        className="px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm cursor-pointer"
                    >
                        <option value="all">All Months</option>
                        {MONTHS.map((m, idx) => (
                            <option key={m} value={idx}>
                                {m}
                            </option>
                        ))}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value === "all" ? "all" : parseInt(e.target.value))}
                        className="px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm cursor-pointer"
                    >
                        <option value="all">All Years</option>
                        {Array.from({ length: Math.max(1, currentYear - 2025 + 1) }, (_, i) => currentYear - i).map((yr) => (
                            <option key={yr} value={yr}>
                                {yr}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredReceipts.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-sm text-gray-500">
                                        No receipts found
                                    </td>
                                </tr>
                            ) : (
                                filteredReceipts.map((receipt) => {
                                    const isCreditNote = receipt.documentType === "CREDIT_NOTE"
                                    return (
                                    <tr key={receipt._id} className={isCreditNote ? "bg-red-50 hover:bg-red-100" : "hover:bg-gray-50"}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{receipt.receiptNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${isCreditNote ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                                                    }`}
                                            >
                                                {isCreditNote ? "Credit Note" : "Receipt"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(receipt.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex flex-col">
                                            <span>{receipt.name}</span>
                                            <span className="text-xs"> {receipt.courseEnrolled || "—"}</span>
                                            <span className="text-xs text-gray-400"> {receipt.admnNumber || "—"}</span>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isCreditNote ? "text-red-600" : "text-gray-900"}`}>
                                            {isCreditNote ? "− " : ""}{formatCurrency(receipt.totalAmountDue)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => setViewingReceipt(receipt)}
                                                title="View / Print / Download"
                                                className="bg-blue-600/10 text-blue-600 border border-blue-600 p-2 rounded hover:text-blue-900 cursor-pointer inline-flex"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button
                                                disabled
                                                title="Receipts are immutable proof of payment — corrections go through a fee decrement instead"
                                                className="bg-yellow-600/10 text-yellow-700 border border-yellow-600 p-2 rounded opacity-50 cursor-not-allowed inline-flex"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                disabled
                                                title="Receipts and credit notes are permanent records and cannot be deleted"
                                                className="bg-red-600/10 text-red-600 border border-red-600 p-2 rounded opacity-50 cursor-not-allowed inline-flex"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showFormModal && (
                <ReceiptFormModal
                    onClose={() => {
                        setShowFormModal(false)
                        setEditingReceipt(null)
                    }}
                    onSubmit={handleCreateOrUpdate}
                    courses={courses}
                    isSubmitting={isSubmitting}
                    initialData={editingReceipt}
                />
            )}

            {viewingReceipt && <ReceiptViewModal receipt={viewingReceipt} onClose={() => setViewingReceipt(null)} />}
        </div>
    )
}
