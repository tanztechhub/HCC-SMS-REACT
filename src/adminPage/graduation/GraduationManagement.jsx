"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { LuRefreshCw, LuSearch, LuFilter, LuX, LuUsers, LuBookOpen } from "react-icons/lu"
import GraduationModal from "./GraduationModal"
import { Check, GraduationCap } from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL

export default function GraduationManagement() {
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [tutors, setTutors] = useState([])
  const [groups, setGroups] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isGraduating, setIsGraduating] = useState(false)
  const [filters, setFilters] = useState({
    search: "",
    tutor: "",
    group: "",
    course: "",
    certificateStatus: "",
    feeStatus: ""
  })

  useEffect(() => {
    fetchStudents()
    fetchTutors()
    fetchGroups()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [students, filters])

  const fetchStudents = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/students`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      const data = await response.json()
      if (data.success) {
        const filteredStudents = data.data.filter((student) => student.allotment === "assigned")
        setStudents(filteredStudents)
      } else {
        throw new Error(data.message || "Failed to fetch students")
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTutors = async () => {
    try {
      const response = await fetch(`${API_URL}/tutors`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      const data = await response.json()
      if (data.success) {
        setTutors(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch tutors:", error)
    }
  }

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${API_URL}/classes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      const data = await response.json()
      if (data.success) {
        setGroups(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch groups:", error)
    }
  }

  const filterStudents = () => {
    let filtered = students.filter((student) => student.allotment === "assigned")

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(student =>
        student.firstName?.toLowerCase().includes(searchTerm) ||
        student.lastName?.toLowerCase().includes(searchTerm) ||
        student.admissionNumber?.toLowerCase().includes(searchTerm)
      )
    }

    // Tutor filter
    if (filters.tutor) {
      filtered = filtered.filter(student => student.tutorId === filters.tutor)
    }

    // Group filter
    if (filters.group) {
      filtered = filtered.filter(student => student.groupId._id === filters.group)
    }

    // Course filter
    if (filters.course) {
      filtered = filtered.filter(student => student.courseName === filters.course)
    }

    // Certificate status filter
    if (filters.certificateStatus === "ready") {
      filtered = filtered.filter(student => student.isCertificateReady)
    } else if (filters.certificateStatus === "notReady") {
      filtered = filtered.filter(student => !student.isCertificateReady)
    }

    // Fee status filter
    if (filters.feeStatus === "paid") {
      filtered = filtered.filter(student => Math.abs(student.upfrontFee - student.courseFee) <= 100)
    } else if (filters.feeStatus === "pending") {
      filtered = filtered.filter(student => (student.upfrontFee - student.courseFee) < -100)
    } else if (filters.feeStatus === "overpaid") {
      filtered = filtered.filter(student => (student.upfrontFee - student.courseFee) > 100)
    }

    setFilteredStudents(filtered)
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      tutor: "",
      group: "",
      course: "",
      certificateStatus: "",
      feeStatus: ""
    })
  }

  const handleCertificateReady = async (studentId, student) => {
    try {
      if (student.exams.some((exam) => exam.score === 0 || exam.score == null)) {
        toast.error(`This Student is missing Exam Grades`)
        return
      }

      const response = await fetch(`${API_URL}/students/${studentId}/certificate`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ isCertificateReady: true }),
      })
      const data = await response.json()
      if (data.success) {
        fetchStudents()
        toast.success("Certificate marked as ready")
      } else {
        throw new Error(data.message || "Failed to update certificate status")
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const openGraduationModal = (student) => {
    setSelectedStudent(student)
    setModalOpen(true)
  }

  const closeGraduationModal = () => {
    setModalOpen(false)
    setSelectedStudent(null)
  }

  const handleGraduate = async (student) => {
    setIsGraduating(true)
    try {
      const response = await fetch(`${API_URL}/students/${student._id}/graduate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setStudents((prevStudents) => prevStudents.filter((s) => s._id !== student._id))
        toast.success("Student graduated successfully")
        closeGraduationModal()
      } else {
        throw new Error(data.message || "Failed to graduate student")
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsGraduating(false)
    }
  }

  const getFeeStatus = (student) => {
    const difference = student.upfrontFee - student.courseFee
    if (Math.abs(difference) <= 100) {
      return { 
        text: "Completed", 
        styles: "text-sm text-orange-600 bg-orange-600/25 p-2 rounded-md font-semibold",
        status: "paid"
      }
    } else if (difference < 0) {
      return { 
        text: `${Math.abs(difference).toLocaleString()} Ksh Due`, 
        styles: "text-sm text-red-600 bg-red-600/25 p-2 rounded-md font-semibold",
        status: "pending"
      }
    } else {
      return { 
        text: `+${difference.toLocaleString()} Ksh Overpaid`, 
        styles: "text-sm text-amber-600 bg-amber-600/25 p-2 rounded-md font-semibold",
        status: "overpaid"
      }
    }
  }

  const getTutorName = (tutorId) => {
    const tutor = tutors.find(t => t._id === tutorId)
    return tutor ? `${tutor.firstName} ${tutor.lastName}` : "Unknown Tutor"
  }

  const getGroupName = (groupId) => {
    const group = groups.find(g => g._id === groupId)
    return group ? group.groupName : "No Group"
  }

  const getUniqueCourses = () => {
    return [...new Set(students.map(student => student.courseName).filter(Boolean))]
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-orange-800">Graduation Management</h1>

        {/* Filters Section */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <LuFilter size={20} />
              Filter Students
            </h2>
            <button
              onClick={clearFilters}
              className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
            >
              <LuX size={16} />
              Clear Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Name, Admission No"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none focus:border-transparent"
                />
              </div>
            </div>

            {/* Tutor Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tutor
              </label>
              <select
                value={filters.tutor}
                onChange={(e) => handleFilterChange("tutor", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none focus:border-transparent"
              >
                <option value="">All Tutors</option>
                {tutors.map(tutor => (
                  <option key={tutor._id} value={tutor._id}>
                    {tutor.firstName} {tutor.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Group Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group
              </label>
              <select
                value={filters.group}
                onChange={(e) => handleFilterChange("group", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none focus:border-transparent"
              >
                <option value="">All Groups</option>
                {groups.map(group => (
                  <option key={group._id} value={group._id}>
                    {group.groupName}
                  </option>
                ))}
              </select>
            </div>

            {/* Course Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course
              </label>
              <select
                value={filters.course}
                onChange={(e) => handleFilterChange("course", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none focus:border-transparent"
              >
                <option value="">All Courses</option>
                {getUniqueCourses().map(course => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>

            {/* Certificate Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Certificate Status
              </label>
              <select
                value={filters.certificateStatus}
                onChange={(e) => handleFilterChange("certificateStatus", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="ready">Certificate Ready</option>
                <option value="notReady">Certificate Not Ready</option>
              </select>
            </div>

            {/* Fee Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fee Status
              </label>
              <select
                value={filters.feeStatus}
                onChange={(e) => handleFilterChange("feeStatus", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="paid">Fully Paid</option>
                <option value="pending">Pending Payment</option>
                <option value="overpaid">Overpaid</option>
              </select>
            </div>

            {/* Results Counter */}
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{filteredStudents.length}</div>
                <div className="text-sm text-gray-600">Students Found</div>
              </div>
            </div>
          </div>
        </div>

        {/* Student Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tutor & Group
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course & Fee Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => {
                const feeStatus = getFeeStatus(student)
                return (
                  <tr key={student._id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          className="h-12 w-12 rounded-full"
                          src={student.profileImage || "/profile/student.jpg"}
                          alt={`${student.firstName} ${student.lastName}`}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{student.admissionNumber}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm space-y-1">
                        <div className="text-gray-900">
                          <span className="font-medium">Tutor:</span> {getTutorName(student.tutorId)}
                        </div>
                        <div className="text-gray-600">
                          <span className="font-medium">Group:</span> {getGroupName(student.groupId)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm space-y-2">
                        <div className="text-blue-600 font-medium">{student.courseName}</div>
                        <div className={feeStatus.styles}>{feeStatus.text}</div>
                        <div className="text-sm text-gray-500">
                          Paid: {student.upfrontFee.toLocaleString()} / {student.courseFee.toLocaleString()} Ksh
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-2">
                      <button
                        onClick={() => handleCertificateReady(student._id, student)}
                        className={`w-full text-center p-2 rounded-md ${
                          student.isCertificateReady 
                            ? "bg-orange-100 text-orange-700 border border-orange-300" 
                            : "bg-indigo-100 text-indigo-700 border border-indigo-300 hover:bg-indigo-200 cursor-pointer"
                        }`}
                        disabled={student.isCertificateReady}
                      >
                        {student.isCertificateReady ? (
                          <span className="flex items-center justify-center gap-1">
                            <Check className="w-4 h-4" />
                            Certificate Ready
                          </span>
                        ) : (
                          "Mark Certificate Ready"
                        )}
                      </button>
                      <button
                        onClick={() => {
                          if (student.isCertificateReady) {
                            openGraduationModal(student)
                          } else {
                            toast.error("Please mark certificate as ready first")
                          }
                        }}
                        className="w-full bg-orange-100 text-orange-700 p-2 rounded-md border border-orange-300 hover:bg-orange-200 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <GraduationCap className="w-4 h-4" />
                        Graduate Student
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No students found matching your filters
            </div>
          )}
        </div>
      </div>

      {/* Graduation Modal */}
      <GraduationModal
        student={selectedStudent}
        isOpen={modalOpen}
        onClose={closeGraduationModal}
        onGraduate={handleGraduate}
        isLoading={isGraduating}
      />
    </>
  )
}