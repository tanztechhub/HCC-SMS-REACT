import "../components/records/Records.css"
"use client"

import { useState, useEffect } from "react"
import { Plus, ChevronLeft, ChevronRight, Eye, Edit2 } from "lucide-react"
import { PiMicrosoftExcelLogoFill } from "react-icons/pi"
import { FaRegCopy, FaRegFilePdf } from "react-icons/fa"
import { BsFiletypeCsv } from "react-icons/bs"
import { MdLocalPrintshop } from "react-icons/md"
import { toast } from "react-hot-toast"
import { LuRefreshCw } from "react-icons/lu"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom";
import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import QuickViewModal from "./quickViewModal/QuickViewModal"

const API_URL = import.meta.env.VITE_API_URL;

export default function StudentList() {
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchName, setSearchName] = useState("")
  const [searchAdmNo, setSearchAdmNo] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("All")
  const [selectedGender, setSelectedGender] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [quickViewStudent, setQuickViewStudent] = useState(null)
  const navigate = useNavigate();
  const itemsPerPage = 25


  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/students`);
      const data = await response.json();
      if (data.success) {
        setStudents(data.data);
  
        // Extract unique course names
        const uniqueCourses = [...new Set(data.data.map(student => student.courseName))];
        setCourses(uniqueCourses);
      } else {
        throw new Error(data.message || "Failed to fetch students");
      }
    } catch (error) {
      toast.error(`Error fetching students: ${error.message}`);
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };
  

  // Filter students based on search criteria
  const filteredStudents = students.filter((student) => {
    const nameMatch = `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchName.toLowerCase())
    const admNoMatch = student.admissionNumber.toLowerCase().includes(searchAdmNo.toLowerCase())
    const courseMatch = selectedCourse === "All" || student.courseName === selectedCourse;
    const genderMatch = selectedGender === "All" || student.gender === selectedGender

    return nameMatch && admNoMatch && courseMatch && genderMatch
  })

  useEffect(() => { setCurrentPage(1) }, [searchName, searchAdmNo, selectedCourse, selectedGender, students.length])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage)

  const handleQuickView = (student) => {
    setQuickViewStudent(student)
  }

  const handleCloseQuickView = () => {
    setQuickViewStudent(null)
  }

  const handleEdit = (studentAdmissionNumber) => {
    console.log("clicked");
    navigate(`/admin-dashboard/admission/${studentAdmissionNumber}`);
  };

  return (
    <>
      <div className="hcc-records hcc-students">
        <div className="hcc-records-heading">
          <div><p className="hcc-records-eyebrow">03 / STUDENT REGISTER</p><h1>Students</h1><p>Manage active enrolments and student details.</p></div>
          <div className="flex gap-2 items-center">
            <button
              disabled={isLoading}
              onClick={fetchStudents}
              className="hcc-records-button"
            >
              {isLoading ? <LoadingSpinner size={15} /> : <LuRefreshCw />}
              Refresh List
            </button>
            <Link to={`/admin-dashboard/admission`} className="hcc-records-button hcc-records-primary">
              <Plus className="h-5 w-5" />
              Add student
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="hcc-records-filters">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search by Name</label>
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Enter student name"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search by Admission No</label>
              <input
                type="text"
                value={searchAdmNo}
                onChange={(e) => setSearchAdmNo(e.target.value)}
                placeholder="Enter admission number"
                className="w-full p-2 border border-gray-300  rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select
                name="course"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option>All</option>
                {courses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="w-full p-2 border border-gray-300  rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="All">All</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="-">Not provided</option>
              </select>
            </div>
          </div>
        </div>

        {/* Student Table */}
        <div className="hcc-records-table-panel">
          <div className="hcc-records-panel-heading">
            <h2>Active students</h2><span>{filteredStudents.length} enrolments</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full hcc-records-table">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adm Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? <tr><td colSpan="6" className="hcc-records-empty" role="status">Loading students...</td></tr> : paginatedStudents.length === 0 ? <tr><td colSpan="6" className="hcc-records-empty">No students match your filters.</td></tr> : paginatedStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={student.profileImage || "/profile/student.jpg"}
                        alt={`${student.firstName} ${student.lastName}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.admissionNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{`${student.firstName} ${student.lastName}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{student.gender}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{student.courseName}{student.importSource && <span className="hcc-records-subtext">{student.importSource.cohort} / Result: {student.importSource.result}</span>}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button
                        aria-label={`View ${student.firstName} ${student.lastName}`}
                        onClick={() => handleQuickView(student)}
                        className="text-blue-600 hover:text-blue-800 mr-2 bg-gray-400/20 rounded-full p-2 cursor-pointer"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button aria-label={`Edit ${student.firstName} ${student.lastName}`} onClick={() => handleEdit(student.admissionNumber)} className="text-orange-600 hover:text-orange-800 bg-gray-400/20 rounded-full p-2 cursor-pointer">
                        <Edit2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 flex items-center justify-between border-t">
            <div className="text-sm text-gray-700">
              Showing {filteredStudents.length ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, filteredStudents.length)} of{" "}
              {filteredStudents.length} results
            </div>
            <div className="flex items-center gap-2">
              <button
                aria-label="Previous students page"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="px-4 py-2 rounded-lg bg-orange-500 text-white">{currentPage}</span>
              <button
                aria-label="Next students page"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {quickViewStudent && <QuickViewModal student={quickViewStudent} onClose={handleCloseQuickView} />}
    </>
  )
}

