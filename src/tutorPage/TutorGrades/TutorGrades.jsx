"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import LoadingSpinner from "../../components/loadingSpinner/LoadingSpinner"
import { LuRefreshCw, LuSearch, LuFilter, LuX } from "react-icons/lu"

const API_URL = import.meta.env.VITE_API_URL

export default function TutorGrades() {
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasNoCohort, setHasNoCohort] = useState(false)
  const [groups, setGroups] = useState([])
  const [filters, setFilters] = useState({
    search: "",
    group: "",
    hasGrades: "",
    noGrades: ""
  })

  useEffect(() => {
    fetchStudents()
    fetchGroups()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [students, filters])

  const fetchStudents = async () => {
    try {
      setIsLoading(true)
      const userData = JSON.parse(localStorage.getItem("user"))
      if (!userData || !userData.token) {
        throw new Error("Please login again")
      }

      const response = await fetch(`${API_URL}/students/tutorStudents/${userData.id}`, {
        headers: { Authorization: `Bearer ${userData.token}` },
      })

      const data = await response.json()

      if (data.success) {
        setStudents(data.data)
        toast.success("Student Data Retrieved successfully")
      } else {
        throw new Error(data.message || "Failed to fetch students")
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchGroups = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"))
      const response = await fetch(`${API_URL}/classes/tutor/${userData.id}`, {
        headers: { Authorization: `Bearer ${userData.token}` },
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
    let filtered = students

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(student =>
        student.firstName.toLowerCase().includes(searchTerm) ||
        student.lastName.toLowerCase().includes(searchTerm) ||
        student.admissionNumber.toLowerCase().includes(searchTerm) ||
        student.email.toLowerCase().includes(searchTerm)
      )
    }

    console.log(`filters.group`, filters.group)
    // Group filter
    if (filters.group) {
      filtered = filtered.filter(student =>
        student.groupId._id === filters.group
      )
    }

    // Has grades filter
    if (filters.hasGrades) {
      filtered = filtered.filter(student =>
        student.exams.some(exam => exam.score > 0)
      )
    }

    // No grades filter
    if (filters.noGrades) {
      filtered = filtered.filter(student =>
        student.exams.every(exam => exam.score === 0)
      )
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
      group: "",
      hasGrades: "",
      noGrades: ""
    })
  }

  const handleScoreChange = (studentId, examId, score) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student._id === studentId
          ? {
            ...student,
            exams: student.exams.map((exam) =>
              exam._id === examId ? { ...exam, score: Number.parseFloat(score) || 0 } : exam,
            ),
          }
          : student,
      ),
    )
  }

  const handleUpdateGrades = async (student) => {
    try {
      const response = await fetch(`${API_URL}/students/${student._id}/grades`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ exams: student.exams }),
      })
      const data = await response.json()
      if (data.success) {
        toast.success("Grades updated successfully")
        fetchStudents() // Refresh data to get updated students
      } else {
        throw new Error(data.message || "Failed to update grades")
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleUpdateAllGrades = async () => {
    try {
      const studentsToUpdate = students.filter(student =>
        student.exams.some(exam => exam.score > 0)
      )

      if (studentsToUpdate.length === 0) {
        toast.error("No students with updated grades to save")
        return
      }

      const updatePromises = studentsToUpdate.map(student =>
        fetch(`${API_URL}/students/${student._id}/grades`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ exams: student.exams }),
        })
      )

      const results = await Promise.all(updatePromises)
      const allSuccess = results.every(result => result.ok)

      if (allSuccess) {
        toast.success("All grades updated successfully")
        fetchStudents() // Refresh data
      } else {
        throw new Error("Some grades failed to update")
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const isStudentUpdated = (student) => {
    return student.exams.some((exam) => exam.score > 0)
  }

  const getStudentGroupName = (student) => {
    console
    const group = groups.find(g => g._id === student.groupId._id)
    return group ? group.groupName : "No Group"
  }

  const calculateTotalScore = (student) => {
    const totalPossible = student.exams.reduce((sum, exam) => sum + exam.weight, 0)
    const totalEarned = student.exams.reduce((sum, exam) => sum + exam.score, 0)
    const percentage = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0

    return {
      totalEarned,
      totalPossible,
      percentage: percentage.toFixed(1)
    }
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
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-orange-800">Update Student Grades</h1>
        <button
          onClick={handleUpdateAllGrades}
          className="mt-4 md:mt-0 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2 transition-colors cursor-pointer"
        >
          <LuRefreshCw size={16} />
          Update All Grades
        </button>
      </div>

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
                placeholder="Name, Admission No, Email"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none focus:border-transparent"
              />
            </div>
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

          {/* Has Grades Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grade Status
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.hasGrades}
                  onChange={(e) => handleFilterChange("hasGrades", e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 outline-none"
                />
                <span className="text-sm">Has Grades</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.noGrades}
                  onChange={(e) => handleFilterChange("noGrades", e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 outline-none"
                />
                <span className="text-sm">No Grades</span>
              </label>
            </div>
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
                Group
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Grades
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Update Grades
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map((student) => {
              const isUpdated = isStudentUpdated(student)
              const rowColor = isUpdated ? "bg-orange-50" : "bg-white"
              const totalScore = calculateTotalScore(student)

              return (
                <tr key={student._id} className={rowColor}>
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
                    <div className="text-sm text-gray-900">{getStudentGroupName(student)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {student.exams.map((exam) => (
                        <div key={exam._id} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">{exam.name}:</span>
                          <span className="font-medium">{exam.score}/{exam.weight}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {student.exams.map((exam) => (
                        <div key={exam._id} className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            max={exam.weight}
                            value={exam.score}
                            onChange={(e) => handleScoreChange(student._id, exam._id, e.target.value)}
                            className="w-16 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                          />
                          <span className="text-sm text-gray-500">/ {exam.weight}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">
                        {totalScore.percentage}%
                      </div>
                      <div className="text-sm text-gray-500">
                        {totalScore.totalEarned}/{totalScore.totalPossible}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleUpdateGrades(student)}
                      disabled={!isUpdated}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isUpdated
                          ? "text-orange-700 hover:text-white border-2 border-orange-700 hover:bg-orange-600 cursor-pointer"
                          : "text-gray-400 border-2 border-gray-300 cursor-not-allowed"
                        }`}
                    >
                      <LuRefreshCw size={16} />
                      Update
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
  )
}