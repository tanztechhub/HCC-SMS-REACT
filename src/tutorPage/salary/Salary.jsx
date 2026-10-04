"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { toast } from "react-hot-toast"
import { Calendar, DollarSign, Clock, User } from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL;

export default function Salary() {
    const [tutor, setTutor] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchTutorData()
    }, [])

    const fetchTutorData = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem("user"))
            if (!userData || !userData.token) {
                throw new Error("Please login again")
            }

            const response = await fetch(`${API_URL}/tutors/${userData.id}`, {
                headers: {
                    Authorization: `Bearer ${userData.token}`,
                },
            })
            const data = await response.json()

            if (data.success) {
                setTutor(data.data)
            } else {
                throw new Error(data.message || "Failed to fetch tutor data")
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    const getStatusColor = (status, amount, expectedSalary) => {
        const threshold = 1000;
        const balance = expectedSalary - amount;

        if (status === "paid" && balance <= threshold) {
            return {
                bg: "bg-orange-50",
                text: "text-orange-700",
                border: "border-orange-200",
                badge: "bg-orange-100 text-orange-800",
            };
        }

        if (status === "paid") {
            return {
                bg: "bg-orange-50",
                text: "text-orange-700",
                border: "border-orange-200",
                badge: "bg-orange-100 text-orange-800",
            };
        }

        return {
            bg: "bg-yellow-50",
            text: "text-yellow-700",
            border: "border-yellow-200",
            badge: "bg-yellow-100 text-yellow-800",
        };
    };


    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
        }).format(amount)
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div>
            {/* Salary Overview */}
            <div className="py-8 mx-4 pb-25">
                <div className="mb-8 bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <img
                            src={tutor.profilePicture || "/placeholder.svg"}
                            alt={`${tutor.firstName} ${tutor.lastName}`}
                            className="w-16 h-16 rounded-full object-cover"
                        />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {tutor.firstName} {tutor.lastName}
                            </h1>
                            <p className="text-gray-600">{tutor.role}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="text-blue-600 font-medium">Expected Monthly Salary</div>
                            <div className="text-2xl font-bold text-blue-700">{formatCurrency(tutor.salary)}</div>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4">
                            <div className="text-orange-600 font-medium">Total Paid (2025)</div>
                            <div className="text-2xl font-bold text-orange-700">
                                {formatCurrency(
                                    tutor.salaryPayments
                                        .filter((payment) => payment.status === "paid")
                                        .reduce((total, payment) => total + (payment.amount || 0), 0),
                                )}
                            </div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4">
                            <div className="text-yellow-600 font-medium">Pending Payments</div>
                            <div className="text-2xl font-bold text-yellow-700">
                                {tutor.salaryPayments.filter((payment) => payment.status === "pending").length}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Salary Payments Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tutor.salaryPayments
                        .sort((a, b) => {
                            // Sort by year and month
                            if (a.year !== b.year) return b.year - a.year
                            const months = [
                                "December",
                                "November",
                                "October",
                                "September",
                                "August",
                                "July",
                                "June",
                                "May",
                                "April",
                                "March",
                                "February",
                                "January",
                            ]
                            return months.indexOf(b.month) - months.indexOf(a.month)
                        })
                        .map((payment) => {
                            const colors = getStatusColor(payment.status, payment.amount, tutor.salary)

                            return (
                                <div key={payment._id} className={`rounded-lg border ${colors.border} overflow-hidden bg-white shadow-lg`}>
                                    <div className={`p-6 ${colors.bg}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className={`text-lg font-semibold ${colors.text}`}>{payment.month}</h3>
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{payment.year}</span>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors.badge}`}>
                                                {payment.status === "paid" ? (payment.amount === tutor.salary ? "Paid" : "Partial") : "Pending"}
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-600">Expected:</span>
                                                <span className="font-medium">{formatCurrency(tutor.salary)}</span>
                                            </div>

                                            {payment.status === "paid" && (
                                                <>
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-600">Paid:</span>
                                                        <span className="font-medium">{formatCurrency(payment.amount)}</span>
                                                    </div>

                                                    {payment.amount < tutor.salary && (tutor.salary - payment.amount > 10) && (
                                                        <div className="flex items-center gap-2 text-orange-600">
                                                            <DollarSign className="w-4 h-4" />
                                                            <span>Balance:</span>
                                                            <span className="font-medium">{formatCurrency(tutor.salary - payment.amount)}</span>
                                                        </div>
                                                    )}


                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-600">Paid on:</span>
                                                        <span className="font-medium">{format(new Date(payment.paidAt), "MMM d, yyyy")}</span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-600">Processed by:</span>
                                                        <span className="font-medium">{payment.processedBy}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                </div>


                {/* Bonuses Section */}
                {tutor.bonuses && tutor.bonuses.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Bonuses</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tutor.bonuses
                                .sort((a, b) => new Date(b.dateGiven) - new Date(a.dateGiven))
                                .map((bonus) => {
                                    const isPaid = bonus.status === "paid"
                                    const colors = isPaid
                                        ? {
                                            bg: "bg-purple-50",
                                            text: "text-purple-700",
                                            border: "border-purple-200",
                                            badge: "bg-purple-100 text-purple-800",
                                        }
                                        : {
                                            bg: "bg-indigo-50",
                                            text: "text-indigo-700",
                                            border: "border-indigo-200",
                                            badge: "bg-indigo-100 text-indigo-800",
                                        }

                                    return (
                                        <div key={bonus._id} className={`rounded-lg border ${colors.border} overflow-hidden bg-white shadow-lg`}>
                                            <div className={`p-6 ${colors.bg}`}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className={`text-lg font-semibold ${colors.text}`}>{bonus.title}</h3>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors.badge}`}>
                                                        {isPaid ? "Paid" : "Pending"}
                                                    </span>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-600">Amount:</span>
                                                        <span className="font-medium">{formatCurrency(bonus.amount)}</span>
                                                    </div>

                                                    {bonus.description && (
                                                        <div className="text-sm text-gray-600">
                                                            <span className="font-medium">Note: </span>
                                                            {bonus.description}
                                                        </div>
                                                    )}

                                                    {isPaid && (
                                                        <>
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="w-4 h-4 text-gray-400" />
                                                                <span className="text-gray-600">Paid on:</span>
                                                                <span className="font-medium">
                                                                    {bonus.paidAt ? format(new Date(bonus.paidAt), "MMM d, yyyy") : "N/A"}
                                                                </span>
                                                            </div>

                                                            {bonus.processedBy && (
                                                                <div className="flex items-center gap-2">
                                                                    <User className="w-4 h-4 text-gray-400" />
                                                                    <span className="text-gray-600">Processed by:</span>
                                                                    <span className="font-medium">{bonus.processedBy}</span>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}

                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

