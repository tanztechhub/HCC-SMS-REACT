"use client"

import { useState, useEffect } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import { CircleArrowLeft, CircleArrowRight, Clock, MapPin, User, Users } from "lucide-react"
import toast from "react-hot-toast"
import LessonTopicDisplay from "../lesson/LessonTopicDisplay"

const API_URL = import.meta.env.VITE_API_URL

export default function Calendar() {
  const [events, setEvents] = useState(null)
  const [tutors, setTutors] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    fetchEvents()
    fetchTutors()
  }, [])

  // Add this useEffect to update the date at midnight
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      if (
        now.getDate() !== currentDate.getDate() ||
        now.getMonth() !== currentDate.getMonth() ||
        now.getFullYear() !== currentDate.getFullYear()
      ) {
        setCurrentDate(now)
      }
    }, 60000)

    return () => clearInterval(timer)
  }, [currentDate])

  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/timetables`)
      const data = await response.json()

      if (data.success) {
        // Safety check: ensure data.data exists and is an array
        const timetableData = Array.isArray(data.data) ? data.data : []

        // Use safe reduce with initial value
        const allEvents = timetableData.reduce(
          (acc, timetable) => {
            // Safety check: ensure timetable exists
            if (!timetable || typeof timetable !== "object") return acc

            const groupInfo = {
              groupId: timetable.groupId?._id || "Unknown",
              groupName: timetable.groupId?.groupName || "No Group",
              timeSlot: timetable.groupId?.timeSlot || "No Time Slot",
            }

            return {
              lessons: [
                ...acc.lessons,
                ...(Array.isArray(timetable.lessons)
                  ? timetable.lessons.map((lesson) => ({
                    ...lesson,
                    groupInfo,
                  }))
                  : []),
              ],
              exams: [
                ...acc.exams,
                ...(Array.isArray(timetable.exams)
                  ? timetable.exams.map((exam) => ({
                    ...exam,
                    groupInfo,
                  }))
                  : []),
              ],
              events: [
                ...acc.events,
                ...(Array.isArray(timetable.events)
                  ? timetable.events.map((event) => ({
                    ...event,
                    groupInfo,
                  }))
                  : []),
              ],
            }
          },
          { lessons: [], exams: [], events: [] },
        )

        setEvents(allEvents)
      } else {
        throw new Error(data.message || "Failed to fetch events")
      }
    } catch (error) {
      toast.error(error.message)
      // Set empty events state on error
      setEvents({ lessons: [], exams: [], events: [] })
    } finally {
      setIsLoading(false)
    }
  }

  // Add a function to allow changing months
  const changeMonth = (increment) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate)
      newDate.setMonth(newDate.getMonth() + increment)
      return newDate
    })
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const firstDayOfMonth = startOfMonth(currentDate)

  const getEventsForDate = (date) => {
    if (!events || typeof events !== "object") return { lessons: [], exams: [], events: [] }

    return {
      lessons:
        events.lessons && Array.isArray(events.lessons)
          ? events.lessons.filter((lesson) => lesson && lesson.date && isSameDay(new Date(lesson.date), date))
          : [],
      exams:
        events.exams && Array.isArray(events.exams)
          ? events.exams.filter((exam) => exam && exam.examDate && isSameDay(new Date(exam.examDate), date))
          : [],
      events:
        events.events && Array.isArray(events.events)
          ? events.events.filter((event) => event && event.eventDate && isSameDay(new Date(event.eventDate), date))
          : [],
    }
  }

  const fetchTutors = async () => {
    try {
      const response = await fetch(`${API_URL}/tutors`)
      const data = await response.json()
      if (data.success) {
        setTutors(data.data)
      } else {
        throw new Error(data.message || "Failed to fetch tutors")
      }
    } catch (error) {
      console.error("Error fetching tutors:", error)
      toast.error("Failed to fetch tutors")
    }
  }

  const getTutorInfo = (event) => {
    console.log(`getTutorInfo`, event);
    if (!event || typeof event !== "object") return null

    let tutorId
    let role = ""

    if (event.tutorId) {
      tutorId = event.tutorId.$oid || event.tutorId._id // handle both object and string IDs
      role = "Tutor"
    } else if (event.invigilatorId) {
      tutorId = event.invigilatorId.$oid || event.invigilatorId._id
      role = "Invigilator"
    } else if (event.organizerId) {
      tutorId = event.organizerId.$oid || event.organizerId._id
      role = "Organizer"
    }

    if (tutorId && Array.isArray(tutors)) {
      const tutor = tutors.find((t) => {
        if (!t) return false
        const tutorIdToCompare = t._id?.$oid || t._id
        return tutorIdToCompare === tutorId
      })

      if (tutor) {
        return {
          name: `${tutor.firstName || ""} ${tutor.lastName || ""}`.trim(),
          email: tutor.email || "No email",
          profilePicture: tutor.profilePicture,
          role: tutor.role || role,
        }
      }
    }
    return null
  }

  const TutorInfo = ({ tutor }) => {
    console.log(`TutorInfo`, tutor);
    if (!tutor) return null

    return (
      <div className="flex items-center justify-between space-x-3 mt-4 p-3 bg-gray-50 rounded-lg w-full">
        <div>
          <h6 className="font-bold text-gray-600">Tutor Details:</h6>
          <p className="font-medium text-gray-900">{tutor.name}</p>
          <p className="text-sm text-gray-500">{tutor.role}</p>
          <p className="max-md:max-w-30 truncate">{tutor.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0">
            {tutor.profilePicture ? (
              <img
                src={tutor.profilePicture || "/placeholder.svg"}
                alt={tutor.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const EventModal = ({ event, onClose }) => {
    if (!event) return null

    // Handle multiple events case
    if (event.events) {
      const { lessons, exams, events: otherEvents } = event.events

      return (
        <div className="fixed inset-0 bg-orange-700/25 z-50 p-4 overflow-y-auto flex justify-center items-start">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mt-10">
            <div className="p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Events for {format(event.date, "MMMM d, yyyy")}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-500 text-4xl cursor-pointer">
                  ×
                </button>
              </div>
              <div className="space-y-4">
                {lessons.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-2">Lessons</h4>
                    {lessons.map((lesson, index) => (
                      <div key={index} className="mb-3 p-3 bg-blue-50 rounded-lg">
                        <LessonTopicDisplay lesson={lesson} />
                        <div className="flex items-center text-sm text-gray-500 mt-2">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>
                            {lesson.startTime} - {lesson.endTime}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{lesson.venue}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Users className="w-4 h-4 mr-2" />
                          <span>{lesson.groupInfo.groupName}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <TutorInfo tutor={getTutorInfo(lesson)} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {exams.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-700 mb-2">Exams</h4>
                    {exams.map((exam, index) => (
                      <div key={index} className="mb-3 p-3 bg-red-50 rounded-lg">
                        <p className="font-medium capitalize">{exam.examName}</p>
                        <div className="flex items-center text-sm text-gray-500 mt-2">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>
                            {exam.startTime} - {exam.endTime}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{exam.venue}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Users className="w-4 h-4 mr-2" />
                          <span>{exam.groupInfo.groupName}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <TutorInfo tutor={getTutorInfo(exam)} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {otherEvents.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-orange-700 mb-2">Other Events</h4>
                    {otherEvents.map((event, index) => (
                      <div key={index} className="mb-3 p-3 bg-orange-50 rounded-lg">
                        <p className="font-medium capitalize">{event.eventDescription}</p>
                        <div className="flex items-center text-sm text-gray-500 mt-2">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>
                            {event.startTime} - {event.endTime}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{event.venue}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Users className="w-4 h-4 mr-2" />
                          <span>{event.groupInfo.groupName}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <TutorInfo tutor={getTutorInfo(event)} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Original single event logic
    const isLesson = "topic" in event
    const isExam = "examName" in event
    const title = isLesson ? "Lesson Details" : isExam ? "Exam Details" : "Event Details"
    const description = isLesson ? event.topic : isExam ? event.examName : event.eventDescription

    return (
      <div className="fixed inset-0 bg-orange-700/25 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-orange-800">{title}</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500 text-4xl cursor-pointer">
                ×
              </button>
            </div>
            <div className="space-y-4">
              {isLesson ? (
                <LessonTopicDisplay lesson={event} className="text-gray-600" />
              ) : (
                <p className="text-gray-600">{description}</p>
              )}
              <div className="flex items-center text-gray-500">
                <Clock className="w-4 h-4 mr-2" />
                <span>
                  {event.startTime} - {event.endTime}
                </span>
              </div>
              <div className="flex items-center text-gray-500">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{event.venue}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Users className="w-4 h-4 mr-2" />
                <span>{event.groupInfo.groupName}</span>
              </div>

              <div className="flex items-center justify-between mt-6">
                <TutorInfo tutor={getTutorInfo(event)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const EventIndicator = ({ type }) => {
    const colors = {
      lesson: "bg-blue-500",
      exam: "bg-red-500",
      event: "bg-orange-500",
    }

    return (
      <div
        className={`w-2 h-2 rounded-full ${colors[type]} mx-0.5`}
        title={type.charAt(0).toUpperCase() + type.slice(1)}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow overflow-hidden">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading calendar...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <button onClick={() => changeMonth(-1)} className="bg-orange-700 p-2 text-white cursor-pointer rounded-md">
            <CircleArrowLeft />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">{format(currentDate, "MMMM yyyy")}</h2>
          <button onClick={() => changeMonth(1)} className="bg-orange-700 p-2 text-white cursor-pointer rounded-md">
            <CircleArrowRight />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-200">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-2 px-3 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 border-gray-200 auto-rows-minmax(100px, auto)">
        {Array(firstDayOfMonth.getDay())
          .fill(null)
          .map((_, index) => (
            <div key={`empty-${index}`} className="min-h-[100px] p-2 border border-gray-200"></div>
          ))}
        {days.map((day) => {
          const dateEvents = getEventsForDate(day)
          const totalEvents = dateEvents.lessons.length + dateEvents.exams.length + dateEvents.events.length

          return (
            <div key={day.toString()} className="min-h-[100px] p-2 border border-gray-200">
              <div className="font-medium text-sm text-gray-500">{format(day, "d")}</div>

              {totalEvents > 0 && (
                <div className="mt-1">
                  {totalEvents <= 2 ? (
                    <div className="space-y-1">
                      {dateEvents.lessons.map((lesson) => (
                        <button
                          key={lesson._id}
                          onClick={() => {
                            setSelectedEvent(lesson)
                            setShowEventModal(true)
                          }}
                          className="w-full text-left text-xs p-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 truncate cursor-pointer"
                        >
                          {lesson.topic}
                        </button>
                      ))}
                      {dateEvents.exams.map((exam) => (
                        <button
                          key={exam._id}
                          onClick={() => {
                            setSelectedEvent(exam)
                            setShowEventModal(true)
                          }}
                          className="w-full text-left text-xs p-1 rounded bg-red-50 text-red-700 hover:bg-red-100 truncate cursor-pointer"
                        >
                          {exam.examName}
                        </button>
                      ))}
                      {dateEvents.events.map((event) => (
                        <button
                          key={event._id}
                          onClick={() => {
                            setSelectedEvent(event)
                            setShowEventModal(true)
                          }}
                          className="w-full text-left text-xs p-1 rounded bg-orange-50 text-orange-700 hover:bg-orange-100 truncate cursor-pointer"
                        >
                          {event.eventDescription}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedEvent({
                          date: day,
                          events: dateEvents,
                        })
                        setShowEventModal(true)
                      }}
                      className="flex items-center space-x-1 mt-1 cursor-pointer"
                    >
                      <div className="flex">
                        {dateEvents.lessons.length > 0 && <EventIndicator type="lesson" />}
                        {dateEvents.exams.length > 0 && <EventIndicator type="exam" />}
                        {dateEvents.events.length > 0 && <EventIndicator type="event" />}
                      </div>
                      <span className="text-xs text-gray-500">{totalEvents} events</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showEventModal && (
        <EventModal
          event={selectedEvent}
          onClose={() => {
            setSelectedEvent(null)
            setShowEventModal(false)
          }}
        />
      )}
    </div>
  )
}
