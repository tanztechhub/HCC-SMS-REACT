"use client"

import { useState } from "react"
import { X } from "lucide-react"
import LoadingSpinner from "../../../components/loadingSpinner/LoadingSpinner"
import { IoSaveOutline } from "react-icons/io5"
import BillTemplate from "./BillTemplate"

const emptyForm = {
    billNumber: "",
    date: "",
    vendor: "",
    description: "",
    amount: "",
    dueDate: "",
    status: "pending",
}

const toFormState = (bill) => ({
    billNumber: bill.billNumber || "",
    date: bill.date ? new Date(bill.date).toISOString().slice(0, 10) : "",
    vendor: bill.vendor || "",
    description: bill.description || "",
    amount: bill.amount ?? "",
    dueDate: bill.dueDate ? new Date(bill.dueDate).toISOString().slice(0, 10) : "",
    status: bill.status || "pending",
})

export default function BillFormModal({ onClose, onSubmit, isSubmitting, initialData }) {
    const [formData, setFormData] = useState(() => (initialData ? toFormState(initialData) : emptyForm))
    const isEditing = Boolean(initialData)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const success = await onSubmit(formData)
        if (success) onClose()
    }

    return (
        <div className="fixed inset-0 flex justify-center items-center bg-orange-800/25 z-50 p-4">
            <div className="bg-white p-4 w-[900px] max-w-full overflow-y-auto max-h-[90vh] rounded-md">
                <div className="flex items-start justify-between mb-4">
                    <h2 className="text-2xl font-bold">{isEditing ? "Edit Bill" : "Create Bill"}</h2>
                    <X className="h-8 w-8 cursor-pointer" onClick={onClose} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Bill Number</label>
                            <input
                                type="text"
                                name="billNumber"
                                value={formData.billNumber}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border-2 p-2 focus:border-orange-300 focus:ring focus:ring-orange-200 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border-2 p-2 focus:border-orange-300 focus:ring focus:ring-orange-200 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Vendor</label>
                            <input
                                type="text"
                                name="vendor"
                                value={formData.vendor}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border-2 p-2 focus:border-orange-300 focus:ring focus:ring-orange-200 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border-2 p-2 focus:border-orange-300 focus:ring focus:ring-orange-200 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Amount</label>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border-2 p-2 focus:border-orange-300 focus:ring focus:ring-orange-200 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Due Date</label>
                            <input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border-2 p-2 focus:border-orange-300 focus:ring focus:ring-orange-200 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border-2 p-2 focus:border-orange-300 focus:outline-none"
                            >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex gap-2 items-center px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 cursor-pointer"
                            >
                                {isSubmitting ? (
                                    <>
                                        <LoadingSpinner size={15} />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <IoSaveOutline />
                                        <span>{isEditing ? "Save Changes" : "Create Bill"}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <BillTemplate bill={formData} containerId="billFormPreview" />
                </div>
            </div>
        </div>
    )
}
