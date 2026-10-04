"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { Edit2, CirclePlus, Eye, Trash2 } from "lucide-react"
import TutorModal from "./tutorModal/TutorModal"
import LoadingSpinner from "../../components/loadingSpinner/LoadingSpinner"
import { LuRefreshCw } from "react-icons/lu"
import QuickView from "./quickView/QuickView"

const API_URL = import.meta.env.VITE_API_URL

export default function TutorsList() {
  const [tutors, setTutors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isQuickViewModalOpen, setIsQuickViewModalOpen] = useState(false)
  const [quickViewTutor, setQuickViewTutor] = useState(null)
  const [tutorToDelete, setTutorToDelete] = useState(null)
  const [selectedTutor, setSelectedTutor] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchTutors()
  }, [])

  const fetchTutors = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/tutors`)
      const data = await response.json()
      if (data.success) {
        setTutors(data.data)
        toast.success("Tutors Fetched Successfully")
      } else {
        throw new Error(data.message || "Failed to fetch tutors")
      }
    } catch (error) {
      console.error("Error fetching tutors:", error)
      toast.error("Failed to fetch tutors")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTutor = () => {
    setSelectedTutor(null)
    setIsModalOpen(true)
  }

  const handleEditTutor = (tutor) => {
    setSelectedTutor(tutor)
    setIsModalOpen(true)
  }

  const handleQuickView = (tutor) => {
    setQuickViewTutor(tutor)
    setIsQuickViewModalOpen(true)
  }

  const handleDeleteTutor = (tutor) => {
    setTutorToDelete(tutor)
  }

  const handleSaveTutor = async (formData) => {
    setIsLoading(true)
    try {
      const url = selectedTutor ? `${API_URL}/tutors/${selectedTutor._id}` : `${API_URL}/tutors`
      const method = selectedTutor ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        toast.success(selectedTutor ? "Tutor updated successfully" : "Tutor added successfully")
        fetchTutors()
      } else {
        throw new Error(data.message || "Failed to save tutor")
      }
    } catch (error) {
      console.error("Error saving tutor:", error)
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const confirmDeleteTutor = async () => {
    if (tutorToDelete) {
      setIsDeleting(true)
      try {
        const response = await fetch(`${API_URL}/tutors/${tutorToDelete._id}`, {
          method: "DELETE",
        })
        const data = await response.json()
        if (data.success) {
          toast.success("Tutor deleted successfully")
          fetchTutors()
        } else {
          throw new Error(data.message || "Failed to delete tutor")
        }
      } catch (error) {
        console.error("Error deleting tutor:", error)
        toast.error(error.message)
      } finally {
        setIsDeleting(false)
        setTutorToDelete(null)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-orange-800">Tutors List</h1>
          <div className="flex gap-4">
            <button
              disabled={isLoading}
              onClick={fetchTutors}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
            >
              {isLoading ? <LoadingSpinner size={15} /> : <LuRefreshCw />}
              Refresh List
            </button>
            <button
              onClick={handleAddTutor}
              className="flex items-center gap-2 px-4 py-2 bg-orange-700 text-white rounded-lg hover:bg-orange-900 transition-colors cursor-pointer"
            >
              <CirclePlus className="h-5 w-5" />
              Add Tutor
            </button>
          </div>
        </div>


          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tutor
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
                  {tutors.map((tutor) => (
                    <tr key={tutor._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={tutor.profilePicture || "/profile/student.jpg"}
                              alt=""
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {tutor.firstName} {tutor.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{tutor.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tutor.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tutor.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-1">
                        <button
                          onClick={() => handleQuickView(tutor)}
                          className="text-blue-600 hover:text-blue-900 mr-2 bg-blue-900/15 hover:bg-blue-900/25 cursor-pointer rounded-full p-2"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEditTutor(tutor)}
                          className="text-indigo-600 hover:text-indigo-900 mr-2 bg-indigo-900/15 hover:bg-indigo-900/25 cursor-pointer rounded-full p-2"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTutor(tutor)}
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

      <TutorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTutor}
        tutor={selectedTutor}
      />
      <QuickView isOpen={isQuickViewModalOpen} onClose={() => setIsQuickViewModalOpen(false)} tutor={quickViewTutor} />

      {tutorToDelete && (
        <div className="fixed inset-0 bg-orange-700/20 shadow-lg  bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-4">
              Are you sure you want to delete{" "}
              <span className="font-bold">
                {tutorToDelete.firstName} {tutorToDelete.lastName}
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
              <p>This will permanently remove the Tutor from the system.</p>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setTutorToDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTutor}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors cursor-pointer focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex gap-2 items-center"
              >
                {isDeleting  ? <LoadingSpinner size={20}/> : <Trash2 className="h-5 w-5" /> }
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

