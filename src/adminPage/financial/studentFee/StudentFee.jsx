"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import FeeOverview from "./FeeOverview"
import CourseFeeBreakdown from "./CourseFeeBreakdown"
import StudentFeeFilter from "./StudentFeeFilter"
import StudentFeeRow from "./StudentFeeRow"

const API_URL = import.meta.env.VITE_API_URL

export default function StudentFee() {
    const [students, setStudents] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [courseWiseFeeData, setCourseWiseFeeData] = useState([])
    const [feeStats, setFeeStats] = useState({
        totalStudents: 0,
        completedFees: 0,
        pendingFees: 0,
        totalExpected: 0,
        totalPaid: 0,
        conflictCases: 0,
    })
    const [filteredStudents, setFilteredStudents] = useState([]);
    const userData = JSON.parse(localStorage.getItem("user")) || {};


    useEffect(() => {
        fetchStudentData();
    }, []);

    const fetchStudentData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/students/`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            const data = await response.json();
            if (data.success) {
                setStudents(data.data);
                setFilteredStudents(data.data);
                processStudentData(data.data);
            } else {
                throw new Error(data.message || "Failed to fetch student data");
            }
        } catch (error) {
            toast.error("Failed to fetch student data");
        } finally {
            setIsLoading(false);
        }
    };

    const processStudentData = (studentData) => {
        const courseData = {}

        let totalExpected = 0
        let totalPaid = 0
        let completedFees = 0
        let conflictCases = 0

        studentData.forEach((student) => {
            const courseFee = student.courseFee
            const paidAmount = student.upfrontFee || 0
            const pendingAmount = courseFee - paidAmount

            totalExpected += courseFee
            totalPaid += paidAmount

            if (pendingAmount <= 0) {
                completedFees++
                if (pendingAmount < 0) {
                    conflictCases++
                }
            }

            if (!courseData[student.course]) {
                courseData[student.course] = { name: student.courseName, paid: 0, pending: 0 }
            }
            courseData[student.course].paid += paidAmount
            courseData[student.course].pending += Math.max(0, pendingAmount)
        })

        setFeeStats({
            totalStudents: studentData.length,
            completedFees,
            pendingFees: studentData.length - completedFees,
            totalExpected,
            totalPaid,
            conflictCases,
        })

        setCourseWiseFeeData(Object.values(courseData))
    }

    const handleFilterChange = (filters) => {
        let filtered = [...students];

        if (filters.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            filtered = filtered.filter(student =>
                student.firstName.toLowerCase().includes(searchLower) ||
                student.lastName.toLowerCase().includes(searchLower) ||
                student.admissionNumber.toLowerCase().includes(searchLower)
            );
        }

        if (filters.paymentStatus !== 'all') {
            filtered = filtered.filter(student => {
                const balance = student.courseFee - (student.upfrontFee || 0);
                switch (filters.paymentStatus) {
                    case 'paid':
                        return balance === 0;
                    case 'pending':
                        return balance > 0;
                    case 'overpaid':
                        return balance < 0;
                    default:
                        return true;
                }
            });
        }

        if (filters.feeRange !== 'all') {
            const [min, max] = filters.feeRange.split('-').map(Number);
            filtered = filtered.filter(student => {
                const balance = student.courseFee - (student.upfrontFee || 0);
                if (filters.feeRange === '50000+') {
                    return balance >= 50000;
                }
                return balance >= min && balance < max;
            });
        }

        if (filters.course !== 'all') {
            filtered = filtered.filter(student =>
                student.courseName === filters.course
            );
        }

        setFilteredStudents(filtered);
    };

    // Merge the single updated student back into local state instead of
    // refetching the whole roster, so one fee update doesn't reset filters
    // or make the admin wait on a full-list network round trip.
    const applyStudentUpdate = (updatedStudent) => {
        setStudents(prev => {
            const next = prev.map(s => (s._id === updatedStudent._id ? updatedStudent : s))
            processStudentData(next)
            return next
        })
        setFilteredStudents(prev => prev.map(s => (s._id === updatedStudent._id ? updatedStudent : s)))
    }

    const handleFeeUpdate = async (studentId, feeUpdate) => {
        const response = await fetch(`${API_URL}/students/${studentId}/fee`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
                ...feeUpdate,
                processedBy: userData.username || userData.email || userData.role || "system",
            }),
        })

        const data = await response.json().catch(() => null)

        if (!response.ok) {
            throw new Error(data?.message || "Failed to update fee")
        }

        toast.success("Fee updated successfully")
        applyStudentUpdate(data.data)
        return data.receipt
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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-orange-800">Student Fee Collection</h1>
            </div>

            {userData.role === 'senior' && <FeeOverview feeStats={feeStats} />}

            {userData.role === 'senior' && <CourseFeeBreakdown courseWiseFeeData={courseWiseFeeData} />}

            {/* Student Filter */}
            <StudentFeeFilter onFilterChange={handleFilterChange} courseWiseFeeData={courseWiseFeeData} />

            {/* Student Fee List */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Student Fee Details</h2>
                <div className="space-y-2">
                    {filteredStudents.length === 0 ? (
                        <p className="text-center text-sm text-gray-500 py-6">No students found matching your filters</p>
                    ) : (
                        filteredStudents.map((student) => (
                            <StudentFeeRow key={student._id} student={student} onUpdate={handleFeeUpdate} />
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
