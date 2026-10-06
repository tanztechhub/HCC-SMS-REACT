"use client"

import { useState, useEffect } from "react"
import { format, parseISO, isAfter, isBefore, subDays } from "date-fns"
import { toast } from "react-hot-toast"
import { Check, X, Users, UserCheck, BookOpen, GraduationCap } from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL

// A group can have more than one Timetable document (one per tutor who has
// ever added a lesson/exam to it, since creation is keyed by
// {groupId, createdBy}) - so "select group" must combine every timetable
// for that group, not just whichever single one happens to be selected.
const getTimetablesForGroup = (timetables, groupId) =>
  timetables.filter((t) => t.groupId?._id === groupId)

// `tutorId`/`invigilatorId`/`organizerId` come back populated as full
// {_id, firstName, lastName} objects from GET /timetables - this pulls out
// just the id whether the value is already populated or still a raw string.
const extractId = (value) => (value && typeof value === "object" ? value._id : value)

export default function AttendanceTracking() {
  const [timetables, setTimetables] = useState([])
  const [selectedGroup, setSelectedGroup] = useState("")
  const [tutors, setTutors] = useState({})
  const [attendanceMetrics, setAttendanceMetrics] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedView, setSelectedView] = useState("all") // "all", "lessons", "exams"

  useEffect(() => {
    fetchTimetables()
    fetchTutors()
  }, [])

  useEffect(() => {
    if (selectedGroup) {
      calculateAttendanceMetrics()
    }
  }, [selectedGroup, selectedView, timetables])

  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value)
  }

  const fetchTimetables = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/timetables`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      const data = await response.json()
      if (data.success) {
        setTimetables(data.data)
        const firstGroupId = data.data.find((t) => t.groupId?._id)?.groupId?._id
        if (firstGroupId) {
          setSelectedGroup(firstGroupId)
        }
      } else {
        throw new Error(data.message || "Failed to fetch timetables")
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
        const tutorMap = {}
        data.data.forEach((tutor) => {
          tutorMap[tutor._id] = tutor
        })
        setTutors(tutorMap)
      } else {
        throw new Error(data.message || "Failed to fetch tutors")
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch tutor details")
    }
  }

  const calculateAttendanceMetrics = () => {
    if (!selectedGroup) return

    const groupTimetables = getTimetablesForGroup(timetables, selectedGroup)
    if (groupTimetables.length === 0) return

    const allLessons = groupTimetables.flatMap((t) => t.lessons || [])
    const allExams = groupTimetables.flatMap((t) => t.exams || [])

    const now = new Date()

    // Filter based on selected view
    let pastEvents = []
    if (selectedView === "all" || selectedView === "lessons") {
      pastEvents = [
        ...pastEvents,
        ...allLessons.filter((event) => {
          const eventDate = parseISO(event.date)
          return isBefore(eventDate, now)
        }),
      ]
    }

    if (selectedView === "all" || selectedView === "exams") {
      pastEvents = [
        ...pastEvents,
        ...allExams.filter((event) => {
          const eventDate = parseISO(event.examDate)
          return isBefore(eventDate, now)
        }),
      ]
    }

    // Tutor attendance metrics - only count events that are marked
    const markedEvents = pastEvents.filter((event) => event.isMarked)
    const tutorAttendedEvents = markedEvents.filter((event) => event.attended)
    const tutorAttendanceRate = markedEvents.length > 0 ? tutorAttendedEvents.length / markedEvents.length : 0

    // Student attendance metrics
    let totalStudentAttendance = 0
    let totalPossibleAttendance = 0

    markedEvents.forEach((event) => {
      if (event.attendedStudents && event.absentStudents) {
        const attended = event.attendedStudents.length
        const total = attended + event.absentStudents.length
        totalStudentAttendance += attended
        totalPossibleAttendance += total
      }
    })

    const studentAttendanceRate = totalPossibleAttendance > 0 ? totalStudentAttendance / totalPossibleAttendance : 0

    // Count lessons vs exams
    const lessonCount = allLessons.length
    const examCount = allExams.length
    const markedLessons = allLessons.filter((lesson) => lesson.isMarked).length
    const markedExams = allExams.filter((exam) => exam.isMarked).length

    // Detailed metrics by event type
    const lessonAttendance = calculateEventTypeMetrics(allLessons)
    const examAttendance = calculateEventTypeMetrics(allExams)

    setAttendanceMetrics({
      tutorMetrics: {
        totalEvents: markedEvents.length,
        attendedEvents: tutorAttendedEvents.length,
        attendanceRate: tutorAttendanceRate,
        totalLessons: lessonCount,
        totalExams: examCount,
        markedLessons,
        markedExams,
      },
      studentMetrics: {
        totalAttendance: totalStudentAttendance,
        totalPossible: totalPossibleAttendance,
        attendanceRate: studentAttendanceRate,
      },
      lessonMetrics: lessonAttendance,
      examMetrics: examAttendance,
      eventDetails: pastEvents
        .map((event) => {
          const isLesson = "topic" in event
          return {
            id: event._id,
            date: format(parseISO(isLesson ? event.date : event.examDate), "MMMM d, yyyy"),
            type: isLesson ? "Lesson" : "Exam",
            name: isLesson ? event.topic : event.examName,
            venue: event.venue,
            tutorAttended: event.attended,
            isMarked: event.isMarked,
            attendedStudents: event.attendedStudents?.length || 0,
            absentStudents: event.absentStudents?.length || 0,
            startTime: event.startTime,
            endTime: event.endTime,
            tutorId: extractId(isLesson ? event.tutorId : event.invigilatorId),
          }
        })
        .sort((a, b) => {
          // Sort by date, most recent first
          const dateA = new Date(a.date)
          const dateB = new Date(b.date)
          return dateB - dateA
        }),
    })
  }

  const calculateEventTypeMetrics = (events) => {
    const markedEvents = events.filter((event) => event.isMarked)
    const attendedEvents = markedEvents.filter((event) => event.attended)
    const attendanceRate = markedEvents.length > 0 ? attendedEvents.length / markedEvents.length : 0

    let totalStudentAttendance = 0
    let totalPossibleAttendance = 0

    markedEvents.forEach((event) => {
      if (event.attendedStudents && event.absentStudents) {
        totalStudentAttendance += event.attendedStudents.length
        totalPossibleAttendance += event.attendedStudents.length + event.absentStudents.length
      }
    })

    const studentAttendanceRate = totalPossibleAttendance > 0 ? totalStudentAttendance / totalPossibleAttendance : 0

    return {
      totalEvents: events.length,
      markedEvents: markedEvents.length,
      attendedEvents: attendedEvents.length,
      attendanceRate,
      studentAttendanceRate,
      totalStudentAttendance,
      totalPossibleStudentAttendance: totalPossibleAttendance,
    }
  }

  const markTutorAttendance = async (eventId, eventType, attended) => {
    try {
      const response = await fetch(`${API_URL}/timetables/attendance/tutor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ eventId, eventType, attended }),
      })
      const data = await response.json()
      if (data.success) {
        toast.success("Tutor attendance marked successfully")
        // Update the local state
        setTimetables((prevTimetables) =>
          prevTimetables.map((timetable) => ({
            ...timetable,
            lessons: timetable.lessons.map((lesson) =>
              lesson._id === eventId ? { ...lesson, attended, isMarked: true } : lesson,
            ),
            exams: timetable.exams.map((exam) => (exam._id === eventId ? { ...exam, attended, isMarked: true } : exam)),
          })),
        )
        calculateAttendanceMetrics()
      } else {
        throw new Error(data.message || "Failed to mark tutor attendance")
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const getUpcomingEvents = () => {
    if (!selectedGroup) return []
    const groupTimetables = getTimetablesForGroup(timetables, selectedGroup)
    if (groupTimetables.length === 0) return []

    const allLessons = groupTimetables.flatMap((t) => t.lessons || [])
    const allExams = groupTimetables.flatMap((t) => t.exams || [])

    const yesterday = subDays(new Date(), 1)

    // Filter based on selected view
    let upcomingEvents = []
    if (selectedView === "all" || selectedView === "lessons") {
      upcomingEvents = [
        ...upcomingEvents,
        ...allLessons.filter((event) => {
          const eventDate = parseISO(event.date)
          return isAfter(eventDate, yesterday)
        }),
      ]
    }

    if (selectedView === "all" || selectedView === "exams") {
      upcomingEvents = [
        ...upcomingEvents,
        ...allExams.filter((event) => {
          const eventDate = parseISO(event.examDate)
          return isAfter(eventDate, yesterday)
        }),
      ]
    }

    return upcomingEvents.sort((a, b) => {
      const dateA = parseISO(a.date || a.examDate)
      const dateB = parseISO(b.date || b.examDate)
      return dateA.getTime() - dateB.getTime()
    })
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

  // One <option> per group, not per timetable - a group can have several
  // timetable documents (one per contributing tutor).
  const groupOptions = []
  const seenGroupIds = new Set()
  timetables.forEach((t) => {
    const groupId = t.groupId?._id
    if (groupId && !seenGroupIds.has(groupId)) {
      seenGroupIds.add(groupId)
      groupOptions.push(t.groupId)
    }
  })

  return (
    <>
      <div className="hcc-teaching-page">
        <div className="hcc-teaching-heading"><p className="hcc-teaching-eyebrow">10 / STUDENT ATTENDANCE</p><h1>Attendance</h1><p>Track attendance by cohort and teaching session.</p></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="group-select" className="block text-md font-medium text-gray-700 mb-2">
              Select Group
            </label>
            <div className="relative">
              <select
                id="group-select"
                value={selectedGroup}
                onChange={handleGroupChange}
                className="block border-2 w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:green-blue-500 sm:text-sm rounded-md cursor-pointer"
              >
                {groupOptions.map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.groupName} ({group.timeSlot})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="view-select" className="block text-md font-medium text-gray-700 mb-2">
              View Type
            </label>
            <div className="relative">
              <select
                id="view-select"
                value={selectedView}
                onChange={(e) => setSelectedView(e.target.value)}
                className="block border-2 w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:green-blue-500 sm:text-sm rounded-md cursor-pointer"
              >
                <option value="all">All Events</option>
                <option value="lessons">Lessons Only</option>
                <option value="exams">Exams Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Enhanced Analytics Section */}
        {attendanceMetrics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Summary Cards */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">Tutor Attendance Rate</h3>
                  <UserCheck className="h-4 w-4 text-orange-600" />
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {(attendanceMetrics.tutorMetrics.attendanceRate * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {attendanceMetrics.tutorMetrics.attendedEvents} of {attendanceMetrics.tutorMetrics.totalEvents}{" "}
                    events marked
                  </p>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full mt-2">
                  <div
                    className="h-2 bg-orange-500 rounded-full"
                    style={{ width: `${attendanceMetrics.tutorMetrics.attendanceRate * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">Student Attendance Rate</h3>
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {(attendanceMetrics.studentMetrics.attendanceRate * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {attendanceMetrics.studentMetrics.totalAttendance} of{" "}
                    {attendanceMetrics.studentMetrics.totalPossible} student attendances
                  </p>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full mt-2">
                  <div
                    className="h-2 bg-blue-500 rounded-full"
                    style={{ width: `${attendanceMetrics.studentMetrics.attendanceRate * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">Lesson Attendance</h3>
                  <BookOpen className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {attendanceMetrics.lessonMetrics
                      ? (attendanceMetrics.lessonMetrics.attendanceRate * 100).toFixed(1)
                      : "0"}
                    %
                  </p>
                  <p className="text-xs text-gray-500">
                    {attendanceMetrics.tutorMetrics.markedLessons} of {attendanceMetrics.tutorMetrics.totalLessons}{" "}
                    lessons marked
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">Exam Attendance</h3>
                  <GraduationCap className="h-4 w-4 text-purple-600" />
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {attendanceMetrics.examMetrics
                      ? (attendanceMetrics.examMetrics.attendanceRate * 100).toFixed(1)
                      : "0"}
                    %
                  </p>
                  <p className="text-xs text-gray-500">
                    {attendanceMetrics.tutorMetrics.markedExams} of {attendanceMetrics.tutorMetrics.totalExams} exams
                    marked
                  </p>
                </div>
              </div>
            </div>

            {/* Attendance Details */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-md font-semibold mb-3">Attendance Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-gray-300 rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center">
                    <BookOpen className="h-4 w-4 mr-2 text-indigo-600" />
                    Lessons ({attendanceMetrics.tutorMetrics.totalLessons})
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span>{attendanceMetrics.tutorMetrics.totalLessons}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Marked:</span>
                      <span>{attendanceMetrics.tutorMetrics.markedLessons}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Attended:</span>
                      <span>{attendanceMetrics.lessonMetrics?.attendedEvents || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Student Attendance:</span>
                      <span>
                        {attendanceMetrics.lessonMetrics?.totalStudentAttendance || 0} /{" "}
                        {attendanceMetrics.lessonMetrics?.totalPossibleStudentAttendance || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-2 border-gray-300 rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center">
                    <GraduationCap className="h-4 w-4 mr-2 text-purple-600" />
                    Exams ({attendanceMetrics.tutorMetrics.totalExams})
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span>{attendanceMetrics.tutorMetrics.totalExams}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Marked:</span>
                      <span>{attendanceMetrics.tutorMetrics.markedExams}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Attended:</span>
                      <span>{attendanceMetrics.examMetrics?.attendedEvents || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Student Attendance:</span>
                      <span>
                        {attendanceMetrics.examMetrics?.totalStudentAttendance || 0} /{" "}
                        {attendanceMetrics.examMetrics?.totalPossibleStudentAttendance || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Events Table */}
        <div className="bg-white p-4 rounded-lg shadow mt-8">
          <h2 className="text-xl font-semibold mb-4">Upcoming Lessons and Exams</h2>
          <table className="min-w-full">
            <thead className="border-b-2 border-gray-500 bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event & Topic
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Venue & Tutor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {getUpcomingEvents().length > 0 ? (
                getUpcomingEvents().map((event) => {
                  const isLesson = "topic" in event
                  const date = parseISO(isLesson ? event.date : event.examDate)
                  const isMarked = event.isMarked
                  const attended = event.attended
                  const tutorId = extractId(isLesson ? event.tutorId : event.invigilatorId)
                  const tutor = tutors[tutorId] || {}

                  return (
                    <tr
                      key={event._id}
                      className={`${isMarked && attended ? "bg-orange-50" : isMarked && !attended ? "bg-red-50" : ""}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex flex-col">
                        <span>{format(date, "MMMM d, yyyy")}</span>
                        <span>
                          {event.startTime} - {event.endTime}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-50 truncate">
                        <div className="flex items-center">
                          {isLesson ? (
                            <BookOpen className="h-4 w-4 mr-2 text-indigo-600" />
                          ) : (
                            <GraduationCap className="h-4 w-4 mr-2 text-purple-600" />
                          )}
                          <div>
                            <div className="font-medium">{isLesson ? "Lesson" : "Exam"}</div>
                            <div className="line-clamp-1">{isLesson ? event.topic : event.examName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{event.venue}</div>
                        <div className="font-medium">
                          {tutor.firstName} {tutor.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {isMarked ? (
                          attended ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                              Present
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Absent
                            </span>
                          )
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Not Marked
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {!isMarked && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => markTutorAttendance(event._id, isLesson ? "lesson" : "exam", true)}
                              className="text-orange-600 hover:text-orange-900 cursor-pointer bg-orange-100 hover:bg-orange-200 rounded-full p-2 transition-colors"
                              title="Mark as Present"
                            >
                              <Check className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => markTutorAttendance(event._id, isLesson ? "lesson" : "exam", false)}
                              className="text-red-600 hover:text-red-900 cursor-pointer bg-red-100 hover:bg-red-200 rounded-full p-2 transition-colors"
                              title="Mark as Absent"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No upcoming events found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Historical Events Section */}
        {attendanceMetrics && attendanceMetrics.eventDetails.length > 0 && (
          <div className="bg-white rounded-lg shadow mt-6 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Past Events</h2>
              <div className="flex space-x-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-orange-500 mr-1"></div>
                  <span className="text-xs">Present</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                  <span className="text-xs">Absent</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-gray-300 mr-1"></div>
                  <span className="text-xs">Not Marked</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {attendanceMetrics.eventDetails.map((event, index) => {
                const tutor = tutors[event.tutorId] || {}
                const bgColor = event.isMarked
                  ? event.tutorAttended
                    ? "bg-orange-50 border-orange-200"
                    : "bg-red-50 border-red-200"
                  : "bg-gray-50 border-gray-200"

                return (
                  <div key={index} className={`${bgColor} rounded-lg p-4 border`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                          {event.type}: {event.name}
                        </h3>
                        <p className="text-xs text-gray-500">{event.date}</p>
                        <p className="text-xs text-gray-500">
                          {event.startTime} - {event.endTime}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {event.type === "Lesson" ? (
                          <BookOpen className="h-5 w-5 text-indigo-600" />
                        ) : (
                          <GraduationCap className="h-5 w-5 text-purple-600" />
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700">Venue: {event.venue}</p>
                      <p className="text-sm">
                        Tutor: {tutor.firstName} {tutor.lastName} -{" "}
                        {event.isMarked ? (
                          event.tutorAttended ? (
                            <span className="text-orange-600 font-medium">Present</span>
                          ) : (
                            <span className="text-red-600 font-medium">Absent</span>
                          )
                        ) : (
                          <span className="text-gray-600">Not Marked</span>
                        )}
                      </p>
                      <div className="flex justify-between text-sm text-gray-700">
                        <span>Students Present: {event.attendedStudents}</span>
                        <span>Students Absent: {event.absentStudents}</span>
                      </div>
                      {!event.isMarked && (
                        <div className="mt-3 flex space-x-2">
                          <button
                            onClick={() =>
                              markTutorAttendance(event.id, event.type === "Lesson" ? "lesson" : "exam", true)
                            }
                            className="text-orange-600 hover:text-orange-900 cursor-pointer bg-orange-100 hover:bg-orange-200 rounded-full p-2 transition-colors"
                            title="Mark as Present"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              markTutorAttendance(event.id, event.type === "Lesson" ? "lesson" : "exam", false)
                            }
                            className="text-red-600 hover:text-red-900 cursor-pointer bg-red-100 hover:bg-red-200 rounded-full p-2 transition-colors"
                            title="Mark as Absent"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
