"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { parseISO, format } from "date-fns"
import { Check, SquareLibrary, X, Calendar, Users, BookOpen, GraduationCap } from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL

export default function StudentList() {
  const [groups, setGroups] = useState([])
  const [timetables, setTimetables] = useState([])
  const [selectedGroup, setSelectedGroup] = useState("")
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasNoGroups, setHasNoGroups] = useState(false)
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [availableYears, setAvailableYears] = useState([])
  const [availableMonths, setAvailableMonths] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [students, setStudents] = useState([])

  useEffect(() => {
    fetchGroups()
  }, [])

  useEffect(() => {
    if (selectedGroup) {
      fetchTimetableForGroup(selectedGroup)
      // Set students from the selected group
      const group = groups.find(g => g._id === selectedGroup)
      if (group && group.students) {
        setStudents(group.students.map(student => ({
          ...student,
          attendanceStatus: ""
        })))
      }
    } else {
      setTimetables([])
      setStudents([])
      setFilteredEvents([])
    }
  }, [selectedGroup, groups])

  useEffect(() => {
    if (timetables.length > 0) {
      const allEvents = processEvents(timetables)
      const filtered = filterEventsByYearMonth(allEvents, selectedYear, selectedMonth)
      setFilteredEvents(filtered)

      // Update available months when year changes
      if (selectedYear) {
        const months = getMonthsForYear(allEvents, selectedYear)
        setAvailableMonths(months)

        // Reset month if it's not available in the new year
        if (selectedMonth && !months.some(m => m.value === parseInt(selectedMonth))) {
          setSelectedMonth("")
          setSelectedEvent(null)
        }
      } else {
        setAvailableMonths([])
        setSelectedMonth("")
        setSelectedEvent(null)
      }
    }
  }, [timetables, selectedYear, selectedMonth])

  const fetchGroups = async () => {
    setIsLoading(true)
    try {
      const userData = JSON.parse(localStorage.getItem("user"))
      if (!userData || !userData.token) {
        throw new Error("Please login again")
      }

      const response = await fetch(`${API_URL}/classes/tutor/${userData.id}`, {
        headers: { Authorization: `Bearer ${userData.token}` },
      })

      const data = await response.json()

      if (data.success) {
        if (data.data.length === 0) {
          setHasNoGroups(true)
        } else {
          setGroups(data.data)
          // Automatically select the first group if available
          if (data.data.length > 0) {
            setSelectedGroup(data.data[0]._id)
          }
        }
      } else {
        throw new Error(data.message || "Failed to fetch groups")
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTimetableForGroup = async (groupId) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"))
      const response = await fetch(`${API_URL}/timetables/${userData.id}/${groupId}`, {
        headers: { Authorization: `Bearer ${userData.token}` },
      })

      const data = await response.json()

      if (data.success && data.data) {
        // If we get a single timetable, convert it to array
        const timetableArray = Array.isArray(data.data) ? data.data : [data.data]
        setTimetables(timetableArray)
      } else {
        setTimetables([])
      }
    } catch (error) {
      console.error("Error fetching timetable:", error)
      toast.error("Failed to fetch timetable for this group")
    }
  }

  const handleAttendanceChange = async (studentId, status) => {
    if (!selectedEvent) {
      toast.error("Please select a lesson or exam")
      return
    }

    try {
      const userData = JSON.parse(localStorage.getItem("user"))
      const response = await fetch(`${API_URL}/timetables/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData.token}`,
        },
        body: JSON.stringify({
          studentId,
          eventId: selectedEvent._id,
          eventType: selectedEvent.topic ? "lesson" : "exam",
          status,
          groupId: selectedGroup,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Attendance marked as ${status}`)

        // Update state to reflect the attendance change
        setStudents(prevStudents =>
          prevStudents.map(student =>
            student._id === studentId ? { ...student, attendanceStatus: status } : student
          )
        )
      } else {
        throw new Error(data.error || "Failed to update attendance")
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const updateStudentAttendanceStatus = (event, students) => {
    return students.map(student => {
      const isPresent = event?.attendedStudents?.includes(student._id)
      const isAbsent = event?.absentStudents?.includes(student._id)

      let attendanceStatus = ""

      if (isPresent) {
        attendanceStatus = "present"
      } else if (isAbsent) {
        attendanceStatus = "absent"
      }

      return { ...student, attendanceStatus }
    })
  }

  const isEligibleForExam = (student) => {
    const margin = 500
    return student.upfrontFee >= student.courseFee - margin
  }

  const processEvents = (timetables) => {
    if (!timetables || timetables.length === 0) return []

    // Extract all lessons and exams from all timetables
    const allEvents = timetables.flatMap(timetable => [
      ...(timetable.lessons || []).map(lesson => ({
        ...lesson,
        eventDate: lesson.date,
        eventType: "lesson",
        groupId: timetable.groupId?._id || timetable.groupId,
        groupName: timetable.groupId?.groupName || "Unknown Group"
      })),
      ...(timetable.exams || []).map(exam => ({
        ...exam,
        eventDate: exam.examDate,
        eventType: "exam",
        groupId: timetable.groupId?._id || timetable.groupId,
        groupName: timetable.groupId?.groupName || "Unknown Group"
      }))
    ]).sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))

    // Extract unique years
    const years = [...new Set(allEvents.map(event =>
      new Date(event.eventDate).getFullYear()
    ))].sort((a, b) => b - a) // Sort descending (newest first)

    setAvailableYears(years)
    return allEvents
  }

  const filterEventsByYearMonth = (events, year, month) => {
    let filtered = events

    if (year) {
      filtered = filtered.filter(event =>
        new Date(event.eventDate).getFullYear() === parseInt(year)
      )
    }

    if (month) {
      filtered = filtered.filter(event =>
        new Date(event.eventDate).getMonth() === parseInt(month)
      )
    }

    return filtered
  }

  const getMonthsForYear = (events, year) => {
    if (!year) return []

    const monthsInYear = events
      .filter(event => new Date(event.eventDate).getFullYear() === parseInt(year))
      .map(event => new Date(event.eventDate).getMonth())

    const uniqueMonths = [...new Set(monthsInYear)].sort((a, b) => b - a)

    return uniqueMonths.map(monthIndex => ({
      value: monthIndex,
      label: format(new Date(2024, monthIndex, 1), "MMMM")
    }))
  }

  if (hasNoGroups) {
    return (
      <div className="flex justify-center items-center min-h-screen p-8">
        <div className="bg-red-500/20 rounded-md text-center p-10 flex flex-col items-center gap-4 text-amber-900 text-2xl font-bold border-2 border-red-500">
          <SquareLibrary height={50} width={50} />
          <h1 className="capitalize">You don't have any assigned groups yet.</h1>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-orange-800 mb-5">Student Attendance</h1>

      {/* Group Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Group</label>
        <select
          value={selectedGroup}
          onChange={(e) => {
            setSelectedGroup(e.target.value)
            setSelectedEvent(null)
            setSelectedYear("")
            setSelectedMonth("")
          }}
          className="cursor-pointer border-2 block w-full px-3 py-2 text-base border-orange-800/50 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
        >
          <option value="">Select a group</option>
          {groups.map(group => (
            <option key={group._id} value={group._id}>
              {group.groupName} - {group.timeSlot} ({group.students?.length || 0} students)
            </option>
          ))}
        </select>
      </div>

      {selectedGroup && (
        <>
          {/* Event Filter Section */}
          <div className="mb-6 space-y-4 bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <Calendar size={20} />
              Filter Lessons/Exams for Attendance
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Year Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value)
                    setSelectedEvent(null)
                  }}
                  className="cursor-pointer border-2 block w-full px-3 py-2 text-base border-orange-800/50 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                >
                  <option value="">All Years</option>
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Month Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(e.target.value)
                    setSelectedEvent(null)
                  }}
                  disabled={!selectedYear}
                  className="cursor-pointer border-2 block w-full px-3 py-2 text-base border-orange-800/50 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">All Months</option>
                  {availableMonths.map(month => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
              </div>

              {/* Event Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lesson/Exam</label>
                <select
                  value={selectedEvent ? selectedEvent._id : ""}
                  onChange={(e) => {
                    const event = filteredEvents.find(ev => ev._id === e.target.value)
                    setSelectedEvent(event)

                    if (event) {
                      setStudents(prevStudents => updateStudentAttendanceStatus(event, prevStudents))
                    }
                  }}
                  className="cursor-pointer border-2 block w-full px-3 py-2 text-base border-orange-800/50 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                >
                  <option value="">Select an event</option>
                  {filteredEvents.map((event) => (
                    <option key={event._id} value={event._id}>
                      {event.eventType === "lesson" ? "Lesson" : "Exam"}: {format(parseISO(event.eventDate), "MMM d, yyyy")} - {event.eventType === "lesson" ? event.topic : event.examName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Event Info */}
            {selectedEvent && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                  {selectedEvent.eventType === "lesson" ? (
                    <BookOpen size={18} />
                  ) : (
                    <GraduationCap size={18} />
                  )}
                  {selectedEvent.eventType === "lesson" ? "Lesson" : "Exam"} Details
                </h3>
                <p className="text-sm">
                  <strong>Date:</strong> {format(parseISO(selectedEvent.eventDate), "EEEE, MMMM do yyyy")}
                </p>
                <p className="text-sm">
                  <strong>Time:</strong> {selectedEvent.startTime} - {selectedEvent.endTime}
                </p>
                <p className="text-sm">
                  <strong>Venue:</strong> {selectedEvent.venue}
                </p>
                <p className="text-sm">
                  <strong>Topic:</strong> {selectedEvent.eventType === "lesson" ? selectedEvent.topic : selectedEvent.examName}
                </p>
              </div>
            )}

            {/* Clear Filters Button */}
            <button
              onClick={() => {
                setSelectedYear("")
                setSelectedMonth("")
                setSelectedEvent(null)
                setStudents(prevStudents => prevStudents.map(s => ({ ...s, attendanceStatus: "" })))
              }}
              className="text-orange-600 hover:text-orange-800 text-sm font-medium"
            >
              Clear all filters
            </button>
          </div>

          {/* Student list with attendance marking */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md max-md:mr-1 mb-15">
            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                <Users size={20} />
                Students in this Group ({students.length})
              </h3>
              {selectedEvent && (
                <span className="text-sm text-gray-600">
                  Mark attendance for: {selectedEvent.eventType === "lesson" ? "Lesson" : "Exam"} on {format(parseISO(selectedEvent.eventDate), "MMM d, yyyy")}
                </span>
              )}
            </div>

            <ul className="divide-y divide-gray-200">
              {students.length === 0 ? (
                <li className="px-6 py-8 text-center text-gray-500">
                  No students in this group
                </li>
              ) : (
                students.map((student) => {
                  const isExam = selectedEvent && !selectedEvent.topic
                  const isEligible = !isExam || isEligibleForExam(student)
                  const attendanceStatus = student.attendanceStatus

                  return (
                    <li
                      key={student._id}
                      className={`px-6 py-4 ${attendanceStatus === "present" ? "bg-orange-50" : attendanceStatus === "absent" ? "bg-red-50" : ""
                        }`}
                    >
                      <div className="flex items-center justify-between max-md:flex-col max-md:gap-4 max-md:items-start">
                        <div className="flex items-center gap-4 lg:w-120">
                          <img
                            src={student.profileImage || '/profile/student.jpg'}
                            alt={`${student.firstName} ${student.lastName}`}
                            className="h-10 w-10 rounded-full"
                          />
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {student.firstName} {student.lastName}
                            </h3>
                            <p className="text-sm text-gray-500">{student.email || "No email"}</p>
                          </div>
                        </div>
                        <div className="flex gap-4 justify-between items-center w-full max-md:flex-col max-md:items-start">
                          <div className="flex flex-col">
                            <span className="font-bold text-md">{student.admissionNumber}</span>
                            <span className="capitalize text-sm">{student.courseName}</span>
                          </div>

                          {isExam && (
                            <p className={`text-sm ${isEligible ? "text-orange-600" : "text-red-600"} underline`}>
                              {isEligible ? "Eligible for exam" : "Not eligible for exam"}
                            </p>
                          )}

                          {selectedEvent && (
                            <div className="flex space-x-2">
                              {!attendanceStatus && (
                                <>
                                  <button
                                    onClick={() => handleAttendanceChange(student._id, "present")}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer"
                                  >
                                    <Check className="w-4 h-4 mr-1" />
                                    Present
                                  </button>
                                  <button
                                    onClick={() => handleAttendanceChange(student._id, "absent")}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Absent
                                  </button>
                                </>
                              )}
                              {attendanceStatus && (
                                <div className="flex items-center space-x-2">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    attendanceStatus === "present" 
                                      ? "bg-orange-100 text-orange-800" 
                                      : "bg-red-100 text-red-800"
                                  }`}>
                                    {attendanceStatus === "present" ? (
                                      <Check className="w-3 h-3 mr-1" />
                                    ) : (
                                      <X className="w-3 h-3 mr-1" />
                                    )}
                                    {attendanceStatus === "present" ? "Present" : "Absent"}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  )
                })
              )}
            </ul>
          </div>

          {/* Summary Section */}
          {selectedEvent && students.length > 0 && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Attendance Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-orange-100 p-3 rounded">
                  <div className="text-2xl font-bold text-orange-800">
                    {students.filter(s => s.attendanceStatus === "present").length}
                  </div>
                  <div className="text-sm text-orange-600">Present</div>
                </div>
                <div className="bg-red-100 p-3 rounded">
                  <div className="text-2xl font-bold text-red-800">
                    {students.filter(s => s.attendanceStatus === "absent").length}
                  </div>
                  <div className="text-sm text-red-600">Absent</div>
                </div>
                <div className="bg-gray-100 p-3 rounded">
                  <div className="text-2xl font-bold text-gray-800">
                    {students.filter(s => !s.attendanceStatus).length}
                  </div>
                  <div className="text-sm text-gray-600">Not Marked</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}