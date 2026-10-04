"use client"

import { useState } from "react"
import { X, Search } from "lucide-react"
import toast from "react-hot-toast"
import LoadingSpinner from "../../../components/loadingSpinner/LoadingSpinner"

const API_URL = import.meta.env.VITE_API_URL

export default function SalaryUpdateModal({ tutors, staff, onClose, onUpdate, fetchData }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("tutors")
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")
  const [isProcessingSalary, setIsProcessingSalary] = useState(false) // Add this
  const [isAddingBonus, setIsAddingBonus] = useState(false) // Add this

  const searchPeople = () => {
    const searchData = selectedType === "tutors" ? tutors : staff
    return searchData.filter(
      (person) =>
        person.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedPerson) {
      setError("Please select a person")
      return
    }
    if (!selectedMonth) {
      setError("Please select a month")
      return
    }
    if (!amount || isNaN(Number(amount))) {
      setError("Please enter a valid amount")
      return
    }

    setIsProcessingSalary(true) // Add this
    try {
      await onUpdate(selectedType, selectedPerson._id, selectedMonth, selectedYear, Number(amount))
    } finally {
      setIsProcessingSalary(false) // Add this
    }
  }
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount)
  }

  return (
    <div className="fixed inset-0 bg-orange-800/25 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-2xl h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Process Salary Payment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 cursor-pointer">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Type Selection */}
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => {
                setSelectedType("tutors")
                setSelectedPerson(null)
              }}
              className={`flex-1 py-2 px-4 rounded-md cursor-pointer ${selectedType === "tutors" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              Tutors
            </button>
            <button
              onClick={() => {
                setSelectedType("staff")
                setSelectedPerson(null)
              }}
              className={`flex-1 py-2 px-4 rounded-md cursor-pointer ${selectedType === "staff" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              Staff
            </button>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Search by name or email</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pr-10 border-2 p-2 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm focus:outline-none"
                placeholder="Enter name or email"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Search Results */}
          {searchTerm && (
            <div className="mt-2 max-h-40 overflow-y-auto border border-blue-400 rounded-md">
              {searchPeople().map((person, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedPerson(person)
                    setSearchTerm("")
                    setAmount(person.salary.toString())
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-3"
                >
                  <img src={person.profilePicture || "/placeholder.svg"} alt="" className="h-8 w-8 rounded-full" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {person.firstName} {person.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{person.email}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Selected Person Details */}
          {selectedPerson && (
            <div className="border-2 border-gray-400 rounded-md p-4">
              <h3 className="font-medium text-gray-900 mb-2">Selected Person</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Name</p>
                  <p>
                    {selectedPerson.firstName} {selectedPerson.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Role</p>
                  <p>{selectedPerson.role}</p>
                </div>
                <div>
                  <p className="text-gray-500">Monthly Salary</p>
                  <p>{formatCurrency(selectedPerson.salary)}</p>
                </div>
                <div>
                  <p className="text-gray-500">KRA PIN</p>
                  <p>{selectedPerson.kra}</p>
                </div>
              </div>
            </div>
          )}

          {selectedPerson && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="mt-1 block w-full rounded-md border-2 p-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm cursor-pointer"
                    required
                  >
                    <option value="">Select Month</option>
                    {[
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ].map((month, index) => (
                      <option key={index} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="mt-1 block w-full rounded-md border-2 p-2 cursor-poin\ border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  >
                    {[2024, 2025, 2026].map((year, index) => (
                      <option key={index} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 block w-full rounded-md border-2 p-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingSalary} // Add this
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" // Add disabled styles
                >
                  {isProcessingSalary ? <LoadingSpinner size={20} /> : "Process Payment"} {/* Add this */}
                </button>
              </div>
            </form>

          )}

          {/* Bonus Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Bonus</h3>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!selectedPerson) {
                toast.error("Please select a person first");
                return;
              }

              setIsAddingBonus(true); // Add this
              const formData = new FormData(e.target);
              const bonusData = {
                title: formData.get('bonusTitle'),
                amount: Number(formData.get('bonusAmount')),
                description: formData.get('bonusDescription'),
                processedBy: JSON.parse(localStorage.getItem("user"))
              };

              try {
                const response = await fetch(`${API_URL}/finance/${selectedType}/${selectedPerson._id}/bonus`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                  body: JSON.stringify(bonusData),
                });

                const data = await response.json();
                if (data.success) {
                  toast.success("Bonus added successfully!");
                  onClose();
                  fetchData();
                } else {
                  throw new Error(data.message);
                }
              } catch (error) {
                toast.error(error.message);
              } finally {
                setIsAddingBonus(false); // Add this
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Bonus Title</label>
                <input
                  type="text"
                  name="bonusTitle"
                  className="mt-1 block w-full rounded-md border-2 p-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="e.g., Christmas Bonus, Performance Bonus"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  name="bonusAmount"
                  className="mt-1 block w-full rounded-md border-2 p-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                <textarea
                  name="bonusDescription"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-2 p-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Reason for bonus..."
                />
              </div>

              <button
                type="submit"
                disabled={isAddingBonus || !selectedPerson} // Add this
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" // Add disabled styles
              >
                {isAddingBonus ? <LoadingSpinner size={20} /> : "Add Bonus"} {/* Add this */}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

