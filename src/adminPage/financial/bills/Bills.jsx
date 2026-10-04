"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { Plus, Search, Eye, Pencil, Trash2, Filter } from "lucide-react"
import { MdOutlineDateRange } from "react-icons/md";
import BillFormModal from "./BillFormModal"
import BillViewModal from "./BillViewModal"
import BillStats from "./BillStats"

const API_URL = import.meta.env.VITE_API_URL
const currentYear = new Date().getFullYear()
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(amount || 0)

const isBillOverdue = (bill) =>
    bill.status === "pending" && bill.dueDate && new Date(bill.dueDate) < new Date()

export default function Bills() {
    const [bills, setBills] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedYear, setSelectedYear] = useState(currentYear)
    const [statusFilter, setStatusFilter] = useState("all")
    const [monthFilter, setMonthFilter] = useState("all")
    const [showFormModal, setShowFormModal] = useState(false)
    const [editingBill, setEditingBill] = useState(null)
    const [viewingBill, setViewingBill] = useState(null)

    useEffect(() => {
        fetchBills()
    }, [selectedYear])

    const fetchBills = async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams()
            if (selectedYear !== "all") params.set("year", selectedYear)
            const res = await fetch(`${API_URL}/bills?${params.toString()}`)
            const data = await res.json()
            if (!data.success) throw new Error(data.message)
            setBills(data.data)
        } catch (error) {
            toast.error("Failed to fetch bills")
        } finally {
            setIsLoading(false)
        }
    }

    const filteredBills = bills.filter((b) => {
        if (statusFilter === "overdue") {
            if (!isBillOverdue(b)) return false
        } else if (statusFilter !== "all" && b.status !== statusFilter) {
            return false
        }
        if (monthFilter !== "all" && new Date(b.date).getMonth() !== Number(monthFilter)) return false
        if (!searchTerm) return true
        const term = searchTerm.toLowerCase()
        return (
            b.vendor?.toLowerCase().includes(term) ||
            b.billNumber?.toLowerCase().includes(term) ||
            b.description?.toLowerCase().includes(term)
        )
    })


    const handleCreateOrUpdate = async (formData) => {
        setIsSubmitting(true)
        try {
            const isEditing = Boolean(editingBill)
            const url = isEditing ? `${API_URL}/bills/${editingBill._id}` : `${API_URL}/bills`
            const response = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.message)

            toast.success(isEditing ? "Bill updated successfully" : "Bill created successfully")
            setBills((prev) => {
                if (isEditing) return prev.map((b) => (b._id === data.data._id ? data.data : b))
                return [data.data, ...prev]
            })
            setEditingBill(null)
            return true
        } catch (error) {
            toast.error(error.message || "Failed to save bill")
            return false
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleStatusChange = async (bill, status) => {
        try {
            const response = await fetch(`${API_URL}/bills/${bill._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.message)
            toast.success("Status updated successfully")
            setBills((prev) => prev.map((b) => (b._id === bill._id ? data.data : b)))
        } catch (error) {
            toast.error(error.message || "Failed to update status")
        }
    }

    const handleDelete = async (bill) => {
        if (!confirm(`Delete bill ${bill.billNumber}? This cannot be undone.`)) return
        try {
            const response = await fetch(`${API_URL}/bills/${bill._id}`, { method: "DELETE" })
            const data = await response.json()
            if (!response.ok) throw new Error(data.message)
            toast.success("Bill deleted successfully")
            setBills((prev) => prev.filter((b) => b._id !== bill._id))
        } catch (error) {
            toast.error(error.message || "Failed to delete bill")
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
                <h1 className="text-2xl font-bold text-orange-800">Bills</h1>
                <button
                    onClick={() => {
                        setEditingBill(null)
                        setShowFormModal(true)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors cursor-pointer"
                >
                    <Plus className="h-5 w-5" />
                    New Bill
                </button>
            </div>

            <BillStats bills={filteredBills} />

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
                            placeholder="Search by vendor, bill # or description"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm cursor-pointer"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredBills.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-sm text-gray-500">
                                        No bills found
                                    </td>
                                </tr>
                            ) : (
                                filteredBills.map((bill) => {
                                    const overdue = isBillOverdue(bill)
                                    return (
                                    <tr key={bill._id} className={overdue ? "bg-red-50 hover:bg-red-100" : "hover:bg-gray-50"}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex flex-col gap-1">
                                            <span>{bill.billNumber}</span>
                                            <span className="text-xs text-gray-400 font-bold flex items-center gap-1">
                                                <MdOutlineDateRange size={16} />
                                                {new Date(bill.date).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex flex-col gap-1">
                                                <span className="max-w-[150px] overflow-hidden text-ellipsis">{bill.vendor}</span>
                                                <span className="text-xs text-gray-400 capitalize max-w-[150px] overflow-hidden text-ellipsis">{bill.description}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(bill.amount)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className={overdue ? "text-red-700 font-medium" : "text-gray-500"}>
                                                    {new Date(bill.dueDate).toLocaleDateString()}
                                                </span>
                                                {overdue && (
                                                    <span className="text-[10px] font-bold text-red-700 bg-red-100 border border-red-300 px-1.5 py-0.5 rounded">
                                                        Overdue
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={bill.status}
                                                onChange={(e) => handleStatusChange(bill, e.target.value)}
                                                className={`block px-2 py-1 text-sm border rounded cursor-pointer ${bill.status === "paid" ? "bg-orange-50 border-orange-200" : "bg-yellow-50 border-yellow-200"
                                                    }`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="paid">Paid</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => setViewingBill(bill)}
                                                title="View / Print / Download"
                                                className="bg-blue-600/10 text-blue-600 border border-blue-600 p-2 rounded hover:text-blue-900 cursor-pointer inline-flex"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingBill(bill)
                                                    setShowFormModal(true)
                                                }}
                                                title="Edit"
                                                className="bg-yellow-600/10 text-yellow-700 border border-yellow-600 p-2 rounded hover:text-yellow-900 cursor-pointer inline-flex"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(bill)}
                                                title="Delete"
                                                className="bg-red-600/10 text-red-600 border border-red-600 p-2 rounded hover:text-red-900 cursor-pointer inline-flex"
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
                <BillFormModal
                    onClose={() => {
                        setShowFormModal(false)
                        setEditingBill(null)
                    }}
                    onSubmit={handleCreateOrUpdate}
                    isSubmitting={isSubmitting}
                    initialData={editingBill}
                />
            )}

            {viewingBill && <BillViewModal bill={viewingBill} onClose={() => setViewingBill(null)} />}
        </div>
    )
}
