"use client"

import { useState } from "react"
import { X } from "lucide-react"
import LoadingSpinner from "../../../components/loadingSpinner/LoadingSpinner"
import { IoSaveOutline } from "react-icons/io5"
import InvoiceTemplate from "./InvoiceTemplate"

const emptyForm = {
    invoiceNumber: "",
    dateOfIssue: "",
    studentName: "",
    studentAdmnNumber: "",
    courseEnrolled: "",
    totalAmountDue: "",
    paymentDueDate: "",
    paymentStatus: "Pending",
}

const toFormState = (invoice) => ({
    invoiceNumber: invoice.invoiceNumber || "",
    dateOfIssue: invoice.dateOfIssue ? new Date(invoice.dateOfIssue).toISOString().slice(0, 10) : "",
    studentName: invoice.studentName || "",
    studentAdmnNumber: invoice.studentAdmnNumber || "",
    courseEnrolled: invoice.courseEnrolled || "",
    totalAmountDue: invoice.totalAmountDue ?? "",
    paymentDueDate: invoice.paymentDueDate ? new Date(invoice.paymentDueDate).toISOString().slice(0, 10) : "",
    paymentStatus: invoice.paymentStatus || "Pending",
})

export default function InvoiceFormModal({ onClose, onSubmit, isSubmitting, initialData, courses = [] }) {
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
                    <h2 className="text-2xl font-bold">{isEditing ? "Edit Invoice" : "Create Invoice"}</h2>
                    <X className="h-8 w-8 cursor-pointer" onClick={onClose} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
                            <input
                                type="text"
                                name="invoiceNumber"
                                value={formData.invoiceNumber}
                                onChange={handleChange}
                                placeholder="e.g INV-001"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border-2 p-2 focus:border-orange-300 focus:ring focus:ring-orange-200 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date of Issue</label>
                            <input
                                type="date"
                                name="dateOfIssue"
                                value={formData.dateOfIssue}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border-2 p-2 focus:border-orange-300 focus:ring focus:ring-orange-200 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Student Name</label>
                            <input
                                type="text"
                                name="studentName"
                                value={formData.studentName}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border-2 p-2 focus:border-orange-300 focus:ring focus:ring-orange-200 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Student ADN Number</label>
                            <input
                                type="text"
                                name="studentAdmnNumber"
                                value={formData.studentAdmnNumber}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border-2 p-2 focus:border-orange-300 focus:ring focus:ring-orange-200 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Course Enrolled</label>
                            <select
                                name="courseEnrolled"
                                value={formData.courseEnrolled}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border-2 p-2 focus:border-orange-300 focus:ring focus:ring-orange-200 focus:outline-none"
                                required
                            >
                                <option value="">Select a course</option>
                                {courses.map((course) => (
                                    <option key={course._id} value={course.name}>
                                        {course.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Total Amount Due</label>
                            <input
                                type="number"
                                name="totalAmountDue"
                                value={formData.totalAmountDue}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border-2 p-2 focus:border-orange-300 focus:ring focus:ring-orange-200 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Payment Due Date</label>
                            <input
                                type="date"
                                name="paymentDueDate"
                                value={formData.paymentDueDate}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border-2 p-2 focus:border-orange-300 focus:ring focus:ring-orange-200 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                                name="paymentStatus"
                                value={formData.paymentStatus}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border-2 p-2 focus:border-orange-300 focus:outline-none"
                            >
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
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
                                        <span>{isEditing ? "Save Changes" : "Create Invoice"}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <InvoiceTemplate invoice={formData} containerId="invoiceFormPreview" />
                </div>
            </div>
        </div>
    )
}
