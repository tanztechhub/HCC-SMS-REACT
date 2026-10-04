"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { Plus, Search, Eye, Pencil, Trash2, Filter } from "lucide-react"
import InvoiceFormModal from "./InvoiceFormModal"
import InvoiceViewModal from "./InvoiceViewModal"
import InvoiceStats from "./InvoiceStats"

const API_URL = import.meta.env.VITE_API_URL
const currentYear = new Date().getFullYear()
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(amount || 0)

export default function Invoices() {
    const [invoices, setInvoices] = useState([])
    const [courses, setCourses] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedYear, setSelectedYear] = useState(currentYear)
    const [statusFilter, setStatusFilter] = useState("all")
    const [monthFilter, setMonthFilter] = useState("all")
    const [showFormModal, setShowFormModal] = useState(false)
    const [editingInvoice, setEditingInvoice] = useState(null)
    const [viewingInvoice, setViewingInvoice] = useState(null)

    useEffect(() => {
        fetchCourses()
    }, [])

    useEffect(() => {
        fetchInvoices()
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

    const fetchInvoices = async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams()
            if (selectedYear !== "all") params.set("year", selectedYear)
            const res = await fetch(`${API_URL}/invoices?${params.toString()}`)
            const data = await res.json()
            if (!data.success) throw new Error(data.message)
            setInvoices(data.data)
        } catch (error) {
            toast.error("Failed to fetch invoices")
        } finally {
            setIsLoading(false)
        }
    }

    const filteredInvoices = invoices.filter((inv) => {
        if (statusFilter !== "all" && (inv.paymentStatus || "").toLowerCase() !== statusFilter) return false
        if (monthFilter !== "all" && new Date(inv.dateOfIssue).getMonth() !== Number(monthFilter)) return false
        if (!searchTerm) return true
        const term = searchTerm.toLowerCase()
        return (
            inv.studentName?.toLowerCase().includes(term) ||
            inv.invoiceNumber?.toLowerCase().includes(term) ||
            inv.studentAdmnNumber?.toLowerCase().includes(term)
        )
    })

    const handleCreateOrUpdate = async (formData) => {
        setIsSubmitting(true)
        try {
            const isEditing = Boolean(editingInvoice)
            const url = isEditing ? `${API_URL}/invoices/${editingInvoice._id}` : `${API_URL}/invoices`
            const response = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.message)

            toast.success(isEditing ? "Invoice updated successfully" : "Invoice created successfully")
            setInvoices((prev) => {
                if (isEditing) return prev.map((inv) => (inv._id === data.data._id ? data.data : inv))
                return [data.data, ...prev]
            })
            setEditingInvoice(null)
            return true
        } catch (error) {
            toast.error(error.message || "Failed to save invoice")
            return false
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleStatusChange = async (invoice, paymentStatus) => {
        try {
            const response = await fetch(`${API_URL}/invoices/${invoice._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentStatus }),
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.message)
            toast.success("Status updated successfully")
            setInvoices((prev) => prev.map((inv) => (inv._id === invoice._id ? data.data : inv)))
        } catch (error) {
            toast.error(error.message || "Failed to update status")
        }
    }

    const handleDelete = async (invoice) => {
        if (!confirm(`Delete invoice ${invoice.invoiceNumber}? This cannot be undone.`)) return
        try {
            const response = await fetch(`${API_URL}/invoices/${invoice._id}`, { method: "DELETE" })
            const data = await response.json()
            if (!response.ok) throw new Error(data.message)
            toast.success("Invoice deleted successfully")
            setInvoices((prev) => prev.filter((inv) => inv._id !== invoice._id))
        } catch (error) {
            toast.error(error.message || "Failed to delete invoice")
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
                <h1 className="text-2xl font-bold text-orange-800">Invoices</h1>
                <button
                    onClick={() => {
                        setEditingInvoice(null)
                        setShowFormModal(true)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors cursor-pointer"
                >
                    <Plus className="h-5 w-5" />
                    New Invoice
                </button>
            </div>

            <InvoiceStats invoices={filteredInvoices} />

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
                            placeholder="Search by student, invoice # or admn #"
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-sm text-gray-500">
                                        No invoices found
                                    </td>
                                </tr>
                            ) : (
                                filteredInvoices.map((invoice) => (
                                    <tr key={invoice._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.invoiceNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(invoice.dateOfIssue).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex flex-col">
                                            <span>{invoice.studentName}</span>
                                            <span className="text-xs">{invoice.courseEnrolled || "—"}</span>
                                            <span className="text-xs text-gray-400">{invoice.studentAdmnNumber || "—"}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(invoice.totalAmountDue)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(invoice.paymentDueDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={(invoice.paymentStatus || "Pending").toLowerCase()}
                                                onChange={(e) => handleStatusChange(invoice, e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1))}
                                                className={`block px-2 py-1 text-sm border rounded cursor-pointer ${invoice.paymentStatus === "Paid" ? "bg-orange-50 border-orange-200" : "bg-yellow-50 border-yellow-200"
                                                    }`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="paid">Paid</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => setViewingInvoice(invoice)}
                                                title="View / Print / Download"
                                                className="bg-blue-600/10 text-blue-600 border border-blue-600 p-2 rounded hover:text-blue-900 cursor-pointer inline-flex"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingInvoice(invoice)
                                                    setShowFormModal(true)
                                                }}
                                                title="Edit"
                                                className="bg-yellow-600/10 text-yellow-700 border border-yellow-600 p-2 rounded hover:text-yellow-900 cursor-pointer inline-flex"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(invoice)}
                                                title="Delete"
                                                className="bg-red-600/10 text-red-600 border border-red-600 p-2 rounded hover:text-red-900 cursor-pointer inline-flex"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showFormModal && (
                <InvoiceFormModal
                    onClose={() => {
                        setShowFormModal(false)
                        setEditingInvoice(null)
                    }}
                    onSubmit={handleCreateOrUpdate}
                    courses={courses}
                    isSubmitting={isSubmitting}
                    initialData={editingInvoice}
                />
            )}

            {viewingInvoice && <InvoiceViewModal invoice={viewingInvoice} onClose={() => setViewingInvoice(null)} />}
        </div>
    )
}
