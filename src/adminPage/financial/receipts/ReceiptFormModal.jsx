"use client"

import { useState } from "react"
import { X } from "lucide-react"
import LoadingSpinner from "../../../components/loadingSpinner/LoadingSpinner"
import { IoSaveOutline } from "react-icons/io5"
import ReceiptTemplate from "./ReceiptTemplate"

const emptyForm = {
    receiptNumber: "",
    date: "",
    name: "",
    admnNumber: "",
    courseEnrolled: "",
    nationalIdNumber: "",
    totalAmountDue: "",
    totalAmountRemaining: "",
    paymentMethod: "M-PESA",
    transactionCode: "",
}

const toFormState = (receipt) => ({
    receiptNumber: receipt.receiptNumber || "",
    date: receipt.date ? new Date(receipt.date).toISOString().slice(0, 10) : "",
    name: receipt.name || "",
    admnNumber: receipt.admnNumber || "",
    courseEnrolled: receipt.courseEnrolled || "",
    nationalIdNumber: receipt.nationalIdNumber || "",
    totalAmountDue: receipt.totalAmountDue ?? "",
    totalAmountRemaining: receipt.totalAmountRemaining ?? "",
    paymentMethod: receipt.paymentMethod || "M-PESA",
    transactionCode: receipt.transactionCode || "",
})

export default function ReceiptFormModal({ onClose, onSubmit, courses, isSubmitting, initialData }) {
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
        <div className="fixed inset-0 bg-orange-800/25 z-50 flex justify-center items-center p-4">
            <div className="bg-white w-250 max-w-xl p-4 rounded-md shadow-xl max-h-[90%] overflow-y-auto">
                <div className="flex items-start justify-between">
                    <h2 className="text-2xl font-bold mb-4">{isEditing ? "Edit Receipt" : "Create Receipt"}</h2>
                    <span onClick={onClose}>
                        <X className="h-8 w-8 cursor-pointer" />
                    </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Receipt Number</label>
                        <input
                            type="text"
                            name="receiptNumber"
                            value={formData.receiptNumber}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-2 p-2 border-gray-300 focus:outline-none shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
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
                            className="mt-1 block w-full rounded-md border-2 p-2 border-gray-300 focus:outline-none shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-2 p-2 border-gray-300 focus:outline-none shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">ADMN Number</label>
                        <input
                            type="text"
                            name="admnNumber"
                            value={formData.admnNumber}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-2 p-2 border-gray-300 focus:outline-none shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Course Enrolled</label>
                        <select
                            name="courseEnrolled"
                            value={formData.courseEnrolled}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-2 p-2 border-gray-300 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 focus:outline-none"
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
                        <label className="block text-sm font-medium text-gray-700">National ID Number</label>
                        <input
                            type="text"
                            name="nationalIdNumber"
                            value={formData.nationalIdNumber}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-2 p-2 border-gray-300 focus:outline-none shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                        <input
                            type="number"
                            name="totalAmountDue"
                            value={formData.totalAmountDue}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-2 p-2 border-gray-300 focus:outline-none shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Remaining Amount</label>
                        <input
                            type="number"
                            name="totalAmountRemaining"
                            value={formData.totalAmountRemaining}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-2 p-2 border-gray-300 focus:outline-none shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                        <select
                            name="paymentMethod"
                            value={formData.paymentMethod}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-2 p-2 border-gray-300 focus:outline-none shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                        >
                            <option value="M-PESA">M-PESA</option>
                            <option value="BANK">BANK</option>
                            <option value="CHEQUE">CHEQUE</option>
                            <option value="CASH">CASH</option>
                            <option value="OTHER">OTHER</option>
                        </select>
                    </div>
                    {["M-PESA", "BANK", "CHEQUE"].includes(formData.paymentMethod) && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Transaction Code</label>
                            <input
                                type="text"
                                name="transactionCode"
                                value={formData.transactionCode}
                                onChange={handleChange}
                                placeholder="e.g. QGH7XXXXXX"
                                className="mt-1 block w-full rounded-md border-2 p-2 border-gray-300 focus:outline-none shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                            />
                        </div>
                    )}

                    <ReceiptTemplate receipt={formData} containerId="receiptFormPreview" />

                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 cursor-pointer"
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
                                    <span>{isEditing ? "Save Changes" : "Create Receipt"}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
