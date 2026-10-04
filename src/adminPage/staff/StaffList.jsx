"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { Edit2, CirclePlus, Eye, Trash2, User } from "lucide-react"
import LoadingSpinner from "../../components/loadingSpinner/LoadingSpinner"
import { LuRefreshCw } from "react-icons/lu"
import StaffQuickView from './staffQuickView/StaffQuickView'
import StaffModal from './staffModal/StaffModal'

const API_URL = import.meta.env.VITE_API_URL

export default function StaffList() {
  const [staffs, setStaffs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isQuickViewModalOpen, setIsQuickViewModalOpen] = useState(false)
  const [quickViewStaff, setQuickViewStaff] = useState(null)
  const [staffToDelete, setStaffToDelete] = useState(null)
  const [selectedStaff, setSelectedStaff] = useState(null)

  useEffect(() => {
    fetchStaffs()
  }, [])

  const fetchStaffs = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/staff`)
      const data = await response.json()
      if (data.success) {
        setStaffs(data.data)
        toast.success("Staff List Fetched Successfully")
      } else {
        throw new Error(data.message || "Failed to fetch staff")
      }
    } catch (error) {
      console.error("Error fetching staffs:", error)
      toast.error("Failed to fetch staffs")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddStaff = () => {
    setSelectedStaff(null)
    setIsModalOpen(true)
  }

  const handleEditStaff = (staff) => {
    setSelectedStaff(staff)
    setIsModalOpen(true)
  }

  const handleQuickView = (staff) => {
    setQuickViewStaff(staff)
    setIsQuickViewModalOpen(true)
  }

  const handleDeleteStaff = (staff) => {
    setStaffToDelete(staff)
  }

  const handleSaveStaff = async (formData) => {
    setIsLoading(true)
    try {
      const url = selectedStaff ? `${API_URL}/staff/${selectedStaff._id}` : `${API_URL}/staff`
      const method = selectedStaff ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        toast.success(selectedStaff ? "Staff updated successfully" : "Staff added successfully")
        fetchStaffs()
      } else {
        throw new Error(data.message || "Failed to save staff")
      }
    } catch (error) {
      console.error("Error saving staff:", error)
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const confirmDeleteStaff = async () => {
    if (staffToDelete) {
      setIsLoading(true)
      try {
        const response = await fetch(`${API_URL}/staff/${staffToDelete._id}`, {
          method: "DELETE",
        })
        const data = await response.json()
        if (data.success) {
          toast.success("Staff deleted successfully")
          fetchStaffs()
        } else {
          throw new Error(data.message || "Failed to delete staff")
        }
      } catch (error) {
        console.error("Error deleting staff:", error)
        toast.error(error.message)
      } finally {
        setIsLoading(false)
        setStaffToDelete(null)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-orange-800">Staff List</h1>
          <div className="flex gap-4">
            <button
              disabled={isLoading}
              onClick={fetchStaffs}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
            >
              {isLoading ? <LoadingSpinner size={15} /> : <LuRefreshCw />}
              Refresh List
            </button>
            <button
              onClick={handleAddStaff}
              className="flex items-center gap-2 px-4 py-2 bg-orange-700 text-white rounded-lg hover:bg-orange-900 transition-colors cursor-pointer"
            >
              <CirclePlus className="h-5 w-5" />
              Add Staff
            </button>
          </div>
        </div>


        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {staffs.map((staff) => (
                  <tr key={staff._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {staff.profilePicture ? (
                            <img
                              src={staff.profilePicture}
                              alt={staff.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {staff.firstName} {staff.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{staff.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-1">
                      <button
                        onClick={() => handleQuickView(staff)}
                        className="text-blue-600 hover:text-blue-900 mr-2 bg-blue-900/15 hover:bg-blue-900/25 cursor-pointer rounded-full p-2"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEditStaff(staff)}
                        className="text-indigo-600 hover:text-indigo-900 mr-2 bg-indigo-900/15 hover:bg-indigo-900/25 cursor-pointer rounded-full p-2"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteStaff(staff)}
                        className="text-red-600 hover:text-red-900 bg-red-900/15 hover:bg-red-900/25 rounded-full p-2 cursor-pointer"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <StaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStaff}
        staff={selectedStaff}
      />
      <StaffQuickView isOpen={isQuickViewModalOpen} onClose={() => setIsQuickViewModalOpen(false)} staff={quickViewStaff} />

      {staffToDelete && (
        <div className="fixed inset-0 bg-orange-700/20 shadow-lg  bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-4">
              Are you sure you want to delete{" "}
              <span className="font-bold">
                {staffToDelete.firstName} {staffToDelete.lastName}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex items-center space-x-2 bg-amber-300/20 p-2 rounded-md text-yellow-600 mb-4">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p>This will permanently remove the Staff from the system.</p>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setStaffToDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteStaff}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

