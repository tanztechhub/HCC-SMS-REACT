"use client"

import { useState } from "react"
import { X, Search, Loader2, User, Check } from 'lucide-react'
import LoadingSpinner from '../../../components/loadingSpinner/LoadingSpinner'

const API_URL = import.meta.env.VITE_API_URL;

export default function BorrowBookModal({ book, onClose, onBorrow, borrowingBook }) {
  const [admissionNumber, setAdmissionNumber] = useState("")
  const [student, setStudent] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState("")
  const [borrowingPeriod, setBorrowingPeriod] = useState("");

  const searchStudent = async () => {
    if (!admissionNumber.trim()) {
      setError("Please enter an admission number")
      return
    }

    setIsSearching(true)
    setError("")

    try {
      const response = await fetch(`${API_URL}/students/${admissionNumber}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })

      if (!response.ok) {
        throw new Error("Student not found")
      }

      const data = await response.json()
      setStudent(data.data);
    } catch (error) {
      setError(error.message)
      setStudent(null)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!student) {
      setError("Please search for a student first");
      return;
    }
    if (!borrowingPeriod || borrowingPeriod <= 0) {
      setError("Please enter a valid borrowing period in days");
      return;
    }

    await onBorrow(student._id, borrowingPeriod);
  };

  return (
    <div className="fixed inset-0 bg-orange-800/25 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Borrow Book</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-2">Book Details</h3>
          <div className="flex items-center space-x-4">
            {book.imageUrl ? (
              <img
                src={book.imageUrl}
                alt={book.name}
                className="w-18 h-18 object-cover"
              />
            ) : (
              <div className="w-15 h-15 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-10 h-10 text-gray-400" />
              </div>
            )}
            <div>
              <p className="font-medium">{book.name}</p>
              <p className="text-sm text-gray-500">Available Copies: {book.quantity}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Borrowing Period (Days)</label>
            <input
              type="number"
              value={borrowingPeriod}
              onChange={(e) => setBorrowingPeriod(e.target.value)}
              className="block w-full border-2 p-2 border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 sm:text-sm focus:outline-none"
              placeholder="Enter number of days"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Student Admission Number</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="text"
                value={admissionNumber}
                onChange={(e) => setAdmissionNumber(e.target.value)}
                className="block w-full pr-10 border-2 p-2 border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 sm:text-sm focus:outline-none"
                placeholder="Enter admission number"
              />
              <button
                onClick={searchStudent}
                disabled={isSearching}
                className="absolute inset-y-0 right-0 px-3 flex items-center"
              >
                {isSearching ? (
                  <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                ) : (
                  <Search className="h-7 w-8 text-white cursor-pointer bg-orange-500/80 p-1 rounded-sm" />
                )}
              </button>
            </div>
            {error && <p className="mt-1 text-sm font-semibold text-red-600 bg-red-400/25 p-2 rounded-md">{error}</p>}
          </div>

          {student && (
            <div className="border-2 border-gray-300 rounded-md p-4">
              <h4 className="font-medium text-orange-900 mb-2">Student Details</h4>
              <div className="flex items-center gap-4">
                <img src={student.profileImage || "/profile/student.jpg"} alt={student.firstName} className="rounded-full h-15 w-15" />
                <span className="w-full">
                  <p className=" flex justify-between"><span> Name:</span> <span>{student.firstName} {student.lastName}</span></p>
                  <p className="flex justify-between"><span> Course:</span> <span>{student.courseName}</span></p>
                  <p className="flex justify-between"><span> Contact:</span><span>{student.phoneNumber} </span></p>
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!student}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 cursor-pointer"
          >
           {borrowingBook ? <LoadingSpinner size={20}/> : <Check className="h-7 w-8 text-white cursor-pointer bg-orange-500/80 p-1 rounded-sm" />}
            Confirm Borrow
          </button>
        </div>
      </div>
    </div>
  )
}
