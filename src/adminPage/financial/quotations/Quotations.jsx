"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import QuotationWidget from "./QuotationWidget"
import FeeStructureWidget from "./FeeStructureWidget"

const API_URL = import.meta.env.VITE_API_URL

export default function Quotations() {
    const [courses, setCourses] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchCourses()
    }, [])

    const fetchCourses = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${API_URL}/courses`)
            const data = await res.json()
            setCourses(Array.isArray(data) ? data : [])
        } catch (error) {
            toast.error("Failed to fetch courses")
        } finally {
            setIsLoading(false)
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
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-orange-800">Quotations</h1>
            <QuotationWidget courses={courses} />
            <FeeStructureWidget courses={courses} />
        </div>
    )
}
