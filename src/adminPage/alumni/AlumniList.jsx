"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { Search, Eye, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import QuickViewModal from "./QuickViewModal"

const API_URL = import.meta.env.VITE_API_URL;

export default function AlumniList() {
  const [alumni, setAlumni] = useState([])
  const [filteredAlumni, setFilteredAlumni] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAlumnus, setSelectedAlumnus] = useState(null)
  const [showQuickViewModal, setShowQuickViewModal] = useState(false)
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [totalPages, setTotalPages] = useState(1)
  
  // Advanced filtering states
  const [filters, setFilters] = useState({
    courseName: "",
    academicYear: "",
    isCertificateReady: "",
    nationality: ""
  })
  const [showFilters, setShowFilters] = useState(false)
  const [uniqueValues, setUniqueValues] = useState({
    courseNames: [],
    academicYears: [],
    nationalities: []
  })

  useEffect(() => {
    fetchAlumni()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [searchTerm, filters, alumni])

  useEffect(() => {
    // Extract unique values from alumni data for filters
    if (alumni.length > 0) {
      const courses = [...new Set(alumni.map(a => a.courseName))].filter(Boolean)
      const years = [...new Set(alumni.map(a => a.academicYear))].filter(Boolean)
      const nationalities = [...new Set(alumni.map(a => a.nationality))].filter(Boolean)
      
      setUniqueValues({
        courseNames: courses,
        academicYears: years,
        nationalities: nationalities
      })
    }
  }, [alumni])

  const fetchAlumni = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/alumni`)
      if (!response.ok) {
        throw new Error("Failed to fetch alumni")
      }
      const data = await response.json()
      setAlumni(data.data)
      setFilteredAlumni(data.data)
      setTotalPages(Math.ceil(data.data.length / itemsPerPage))
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let results = [...alumni]
    
    // Apply text search across all fields
    if (searchTerm) {
      results = results.filter((alumnus) =>
        Object.values(alumnus).some((value) => 
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }
    
    // Apply advanced filters
    if (filters.courseName) {
      results = results.filter(a => a.courseName === filters.courseName)
    }
    
    if (filters.academicYear) {
      results = results.filter(a => a.academicYear === filters.academicYear)
    }
    
    if (filters.nationality) {
      results = results.filter(a => a.nationality === filters.nationality)
    }
    
    if (filters.isCertificateReady !== "") {
      const isReady = filters.isCertificateReady === "true"
      results = results.filter(a => a.isCertificateReady === isReady)
    }
    
    setFilteredAlumni(results)
    setTotalPages(Math.ceil(results.length / itemsPerPage))
    setCurrentPage(1) // Reset to first page when filters change
  }

  const resetFilters = () => {
    setFilters({
      courseName: "",
      academicYear: "",
      isCertificateReady: "",
      nationality: ""
    })
    setSearchTerm("")
  }

  const handleQuickView = (alumnus) => {
    setSelectedAlumnus(alumnus)
    setShowQuickViewModal(true)
  }
  
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }
  
  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value)
    setItemsPerPage(newItemsPerPage)
    setTotalPages(Math.ceil(filteredAlumni.length / newItemsPerPage))
    setCurrentPage(1) // Reset to first page
  }

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredAlumni.slice(indexOfFirstItem, indexOfLastItem)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-15 w-15 border-t-2 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-orange-800">Alumni List</h1>
      
      {/* Search and filter section */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search alumni..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pl-10 border-2 border-gray-400 rounded-md focus:border-orange-600 focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 bg-orange-600 text-white rounded-md flex items-center gap-1 hover:bg-orange-700 cursor-pointer"
          >
            <Filter className="h-5 w-5" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          {(searchTerm || Object.values(filters).some(v => v !== "")) && (
            <button 
              onClick={resetFilters}
              className="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Clear Filters
            </button>
          )}
        </div>
        
        {/* Advanced filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select
                value={filters.courseName}
                onChange={(e) => setFilters({...filters, courseName: e.target.value})}
                className="w-full p-2 border-2 cursor-pointer border-gray-300 rounded-md focus:outline-none"
              >
                <option value="">All Courses</option>
                {uniqueValues.courseNames.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
              <select
                value={filters.academicYear}
                onChange={(e) => setFilters({...filters, academicYear: e.target.value})}
                className="w-full p-2 border-2 focus:outline-none cursor-pointer border-gray-300 rounded-md"
              >
                <option value="">All Years</option>
                {uniqueValues.academicYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Status</label>
              <select
                value={filters.isCertificateReady}
                onChange={(e) => setFilters({...filters, isCertificateReady: e.target.value})}
                className="w-full p-2 border-2 focus:outline-none cursor-pointer border-gray-300 rounded-md"
              >
                <option value="">All Statuses</option>
                <option value="true">Ready</option>
                <option value="false">Not Ready</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
              <select
                value={filters.nationality}
                onChange={(e) => setFilters({...filters, nationality: e.target.value})}
                className="w-full p-2 border-2 focus:outline-none cursor-pointer border-gray-300 rounded-md"
              >
                <option value="">All Nationalities</option>
                {uniqueValues.nationalities.map(nationality => (
                  <option key={nationality} value={nationality}>{nationality}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
      
      {/* Results summary */}
      <div className="mb-4 flex justify-between items-center">
        <div className="text-gray-600">
          Showing {currentItems.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredAlumni.length)} of {filteredAlumni.length} alumni
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="itemsPerPage" className="text-sm text-gray-600">Items per page:</label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="p-1 border-2 border-gray-300 rounded cursor-pointer focus:outline-none"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Year</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Graduation Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Certificate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nationality
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.length > 0 ? (
              currentItems.map((alumnus) => (
                <tr key={alumnus._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {alumnus.firstName} {alumnus.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{alumnus.courseName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{alumnus.academicYear}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{alumnus.graduationDate ? new Date(alumnus.graduationDate).toLocaleDateString() : "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {alumnus.isCertificateReady ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                        Collected
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Not Ready
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{alumnus.nationality}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button onClick={() => handleQuickView(alumnus)} className="text-orange-600 hover:text-orange-900 cursor-pointer">
                      <Eye className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  No alumni found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {filteredAlumni.length > 0 && (
        <div className="mt-4 flex justify-between items-center">
          <div>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-md mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            {/* Page numbers */}
            <div className="inline-flex">
              {/* Logic to show a limited number of page buttons */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Logic to determine which pages to show
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 mx-1 flex items-center justify-center border border-gray-300 rounded-md
                      ${currentPage === pageNum ? 'bg-orange-600 text-white' : 'hover:bg-gray-100'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-md ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}
      
      {showQuickViewModal && <QuickViewModal alumnus={selectedAlumnus} onClose={() => setShowQuickViewModal(false)} />}
    </div>
  )
}