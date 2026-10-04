"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { format, parseISO, isFuture, differenceInDays, startOfMonth, isSameDay, endOfMonth, isWithinInterval } from "date-fns"
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  MapPin,
  AlertCircle,
  GraduationCap,
  PenTool,
  Activity,
  TrendingUp,
  Award,
  CheckCircle,
  MessageCircle,
  Bell
} from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL;

export default function TutorDashboard() {
  const [tutor, setTutor] = useState(null)
  const [timetable, setTimetable] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [unreadForumsCount, setUnreadForumsCount] = useState(0)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"))
      if (!userData || !userData.token) {
        throw new Error("Please login again")
      }

      const [tutorResponse, timetableResponse, forumsCountResponse] = await Promise.all([
        fetch(`${API_URL}/tutors/${userData.id}`, {
          headers: { Authorization: `Bearer ${userData.token}` },
        }),
        fetch(`${API_URL}/timetables/${userData.id}`, {
          headers: { Authorization: `Bearer ${userData.token}` },
        }),
        fetch(`${API_URL}/api/forums/unread/count/${userData.id}`, {
          headers: { Authorization: `Bearer ${userData.token}` },
        })
      ])

      const tutorData = await tutorResponse.json()
      const timetableData = await timetableResponse.json()
      const forumsCountData = await forumsCountResponse.json()

      if (tutorData.success && timetableData.success) {
        toast.success(`Dashboard Data Fetched Successfully`)
        setTutor(tutorData.data)
        
        // Set unread forums count
        if (forumsCountData.success) {
          setUnreadForumsCount(forumsCountData.data.unread || 0)
        }

        // Concatenate all timetables into one giant timetable with safety checks
        const combinedTimetable = {
          lessons: [],
          exams: [],
          events: [],
          groups: [] // Add groups array to store group information
        };

        // Safety check: ensure timetableData.data exists and is an array
        if (timetableData.data && Array.isArray(timetableData.data)) {
          timetableData.data.forEach(timetable => {
            if (timetable && typeof timetable === 'object') {
              // Add lessons
              if (timetable.lessons && Array.isArray(timetable.lessons)) {
                combinedTimetable.lessons = [...combinedTimetable.lessons, ...timetable.lessons];
              }
              // Add exams
              if (timetable.exams && Array.isArray(timetable.exams)) {
                combinedTimetable.exams = [...combinedTimetable.exams, ...timetable.exams];
              }
              // Add events
              if (timetable.events && Array.isArray(timetable.events)) {
                combinedTimetable.events = [...combinedTimetable.events, ...timetable.events];
              }
              // Add group information if available
              if (timetable.groupId && typeof timetable.groupId === 'object') {
                combinedTimetable.groups.push({
                  groupId: timetable.groupId._id,
                  status: timetable.groupId.status,
                  groupName: timetable.groupId.groupName,
                  timeSlot: timetable.groupId.timeSlot,
                  tutorName: timetable.tutorName
                });
              } else if (timetable.cohort) {
                // Handle cohort-based timetables (like the first one in your example)
                combinedTimetable.groups.push({
                  groupName: `Cohort ${format(parseISO(timetable.cohort), 'yyyy-MM-dd')}`,
                  timeSlot: 'Various times',
                  tutorName: timetable.tutorName
                });
              }
            }
          });
        }

        setTimetable(combinedTimetable);
      } else {
        toast.error(`Dashboard Data Fetch Failed`)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Helper functions
  const getNextLesson = () => {
    if (!timetable || !timetable.lessons) return null;

    const now = new Date();
    const futureLessons = timetable.lessons.filter((lesson) => {
      const lessonDate = parseISO(lesson.date);
      const lessonDateTime = new Date(
        lessonDate.getFullYear(),
        lessonDate.getMonth(),
        lessonDate.getDate(),
        ...lesson.startTime.split(':').map(Number)
      );
      return lessonDateTime > now;
    });

    if (futureLessons.length === 0) return null;

    const sortedLessons = futureLessons.sort((a, b) => {
      const dateA = parseISO(a.date);
      const dateB = parseISO(b.date);
      const timeA = a.startTime.split(':').map(Number);
      const timeB = b.startTime.split(':').map(Number);

      const fullDateA = new Date(
        dateA.getFullYear(),
        dateA.getMonth(),
        dateA.getDate(),
        timeA[0],
        timeA[1]
      );
      const fullDateB = new Date(
        dateB.getFullYear(),
        dateB.getMonth(),
        dateB.getDate(),
        timeB[0],
        timeB[1]
      );

      return fullDateA - fullDateB;
    });

    return sortedLessons[0];
  };

  const getNextExam = () => {
    if (!timetable || !timetable.exams) return null;

    const now = new Date();
    const futureExams = timetable.exams.filter((exam) => {
      const examDate = parseISO(exam.examDate);
      const examDateTime = new Date(
        examDate.getFullYear(),
        examDate.getMonth(),
        examDate.getDate(),
        ...exam.startTime.split(':').map(Number)
      );
      return examDateTime > now;
    });

    if (futureExams.length === 0) return null;

    const sortedExams = futureExams.sort((a, b) => {
      const dateA = parseISO(a.examDate);
      const dateB = parseISO(b.examDate);
      const timeA = a.startTime.split(':').map(Number);
      const timeB = b.startTime.split(':').map(Number);

      const fullDateA = new Date(
        dateA.getFullYear(),
        dateA.getMonth(),
        dateA.getDate(),
        timeA[0],
        timeA[1]
      );
      const fullDateB = new Date(
        dateB.getFullYear(),
        dateB.getMonth(),
        dateB.getDate(),
        timeB[0],
        timeB[1]
      );

      return fullDateA - fullDateB;
    });

    return sortedExams[0];
  };

  const getUpcomingEvents = () => {
    if (!timetable) return []
    const now = new Date()
    return [...timetable.lessons.map(l => ({
      ...l,
      type: 'lesson',
      eventDate: l.date
    })),
    ...timetable.events.map(e => ({
      ...e,
      type: 'event',
      eventDate: e.eventDate
    })),
    ...timetable.exams.map(e => ({
      ...e,
      type: 'exam',
      topic: e.examName,
      eventDate: e.examDate
    }))]
      .filter((event) => isFuture(parseISO(event.eventDate)))
      .sort((a, b) => parseISO(a.eventDate) - parseISO(b.eventDate))
  }

  const getCompletedEvents = () => {
    if (!timetable) return []
    const now = new Date()
    return [...timetable.lessons.map(l => ({
      ...l,
      type: 'lesson',
      eventDate: l.date
    })),
    ...timetable.events.map(e => ({
      ...e,
      type: 'event',
      eventDate: e.eventDate
    })),
    ...timetable.exams.map(e => ({
      ...e,
      type: 'exam',
      topic: e.examName,
      eventDate: e.examDate
    }))]
      .filter((event) => !isFuture(parseISO(event.eventDate)))
      .sort((a, b) => parseISO(b.eventDate) - parseISO(a.eventDate))
  }

  const getEventsByType = () => {
    if (!timetable) return { lessons: 0, exams: 0, events: 0 };

    return {
      lessons: timetable.lessons.length,
      exams: timetable.exams.length,
      events: timetable.events.length
    };
  };

  const getTotalTeachingHours = () => {
    if (!timetable) return 0;

    return timetable.lessons.reduce((total, lesson) => {
      const start = parseISO(`2000-01-01T${lesson.startTime}`);
      const end = parseISO(`2000-01-01T${lesson.endTime}`);
      return total + (end - start) / (1000 * 60 * 60);
    }, 0).toFixed(1);
  };

  const getMonthlyStats = () => {
    if (!timetable) return {
      lessons: 0,
      exams: 0,
      events: 0,
      hours: 0
    };

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const lessons = timetable.lessons.filter(lesson => {
      const lessonDate = parseISO(lesson.date);
      return isWithinInterval(lessonDate, { start: monthStart, end: monthEnd });
    });

    const exams = timetable.exams.filter(exam => {
      const examDate = parseISO(exam.examDate);
      return isWithinInterval(examDate, { start: monthStart, end: monthEnd });
    });

    const events = timetable.events.filter(event => {
      const eventDate = parseISO(event.eventDate);
      return isWithinInterval(eventDate, { start: monthStart, end: monthEnd });
    });

    const hours = lessons.reduce((total, lesson) => {
      const start = parseISO(`2000-01-01T${lesson.startTime}`);
      const end = parseISO(`2000-01-01T${lesson.endTime}`);
      return total + (end - start) / (1000 * 60 * 60);
    }, 0).toFixed(1);

    return {
      lessons: lessons.length,
      exams: exams.length,
      events: events.length,
      hours
    };
  };

  const getAttendanceRate = () => {
    if (!timetable || !timetable.lessons) return "N/A";

    const completedLessons = timetable.lessons.filter(lesson => lesson.isMarked);

    if (completedLessons.length === 0) return "N/A";

    const attendedLessons = completedLessons.filter(lesson => lesson.attended);
    return `${Math.round((attendedLessons.length / completedLessons.length) * 100)}%`;
  };

  const getNextDueDate = () => {
    const upcomingEvents = getUpcomingEvents();
    return upcomingEvents.length > 0 ? parseISO(upcomingEvents[0].eventDate) : null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const nextLesson = getNextLesson();
  const nextExam = getNextExam();
  const upcomingEvents = getUpcomingEvents();
  const completedEvents = getCompletedEvents();
  const eventsByType = getEventsByType();
  const totalTeachingHours = getTotalTeachingHours();
  const monthlyStats = getMonthlyStats();
  const attendanceRate = getAttendanceRate();
  const nextDueDate = getNextDueDate();

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20 sm:px-6 lg:px-8 mb-0 pt-6 max-md:pb-20">
      {/* Welcome banner with quick info */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg shadow-lg mb-8 overflow-hidden">
        <div className="p-6 sm:p-8 flex flex-col md:flex-row justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome, {tutor?.firstName}</h1>
            <p className="text-blue-100">
              {nextDueDate ? (
                <>
                  Your next scheduled activity is in <span className="font-semibold">{differenceInDays(nextDueDate, new Date())} days</span>
                </>
              ) : (
                "No upcoming activities scheduled"
              )}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <div className="text-xs uppercase tracking-wide text-gray-900 font-bold">This Month</div>
              <div className="text-2xl font-bold text-orange-600">{monthlyStats.lessons} Lessons</div>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <div className="text-xs uppercase tracking-wide text-gray-900 font-bold">Attendance</div>
              <div className="text-2xl font-bold text-orange-600">{attendanceRate}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {/* Forum Notifications */}
        <div className="bg-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg relative">
          {unreadForumsCount > 0 && (
            <div className="absolute -top-2 -right-2 z-10">
              <span className="relative flex h-8 w-8">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-8 w-8 bg-red-500 text-white items-center justify-center text-xs font-bold">
                  {unreadForumsCount > 99 ? '99+' : unreadForumsCount}
                </span>
              </span>
            </div>
          )}
          <div className="p-5">
            <div className="flex items-center mb-4">
              <div className={`flex-shrink-0 rounded-md p-3 ${unreadForumsCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-orange-500'}`}>
                {unreadForumsCount > 0 ? (
                  <Bell className="h-6 w-6 text-white" />
                ) : (
                  <MessageCircle className="h-6 w-6 text-white" />
                )}
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">Forum</h3>
            </div>
            {unreadForumsCount > 0 ? (
              <div className="text-center">
                <div className="mb-3">
                  <p className="text-3xl font-bold text-red-500">{unreadForumsCount}</p>
                  <p className="text-sm text-gray-600">Unread {unreadForumsCount === 1 ? 'notification' : 'notifications'}</p>
                </div>
                <a
                  href="/teacher-dashboard/forum"
                  className="inline-flex items-center gap-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  View Forums
                </a>
              </div>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">All caught up!</p>
                <a
                  href="/teacher-dashboard/forum"
                  className="inline-flex items-center gap-1 px-3 py-1 text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
                >
                  View Forums →
                </a>
              </div>
            )}
          </div>
        </div>
        
        {/* Next Lesson */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
          <div className="p-5">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">Next Lesson</h3>
            </div>
            {nextLesson ? (
              <div>
                <p className="text-md font-medium text-gray-900 line-clamp-2 mb-2">{nextLesson.topic}</p>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                  <p>{format(parseISO(nextLesson.date), "MMMM d, yyyy")}</p>
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <Clock className="flex-shrink-0 mr-1.5 h-4 w-4" />
                  <p>{nextLesson.startTime} - {nextLesson.endTime}</p>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4" />
                  <p>{nextLesson.venue}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No upcoming lessons</p>
              </div>
            )}
          </div>
        </div>

        {/* Next Exam */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
          <div className="p-5">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                <PenTool className="h-6 w-6 text-white" />
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">Next Exam</h3>
            </div>
            {nextExam ? (
              <div>
                <p className="text-md font-medium text-gray-900 line-clamp-2 mb-2">{nextExam.examName}</p>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                  <p>{format(parseISO(nextExam.examDate), "MMMM d, yyyy")}</p>
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <Clock className="flex-shrink-0 mr-1.5 h-4 w-4" />
                  <p>{nextExam.startTime} - {nextExam.endTime}</p>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4" />
                  <p>{nextExam.venue}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No upcoming exams</p>
              </div>
            )}
          </div>
        </div>

        {/*  Assigned Groups */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
          <div className="p-5">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 bg-orange-500 rounded-md p-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">Assigned Groups</h3>
            </div>

            {timetable && timetable.groups && timetable.groups.length > 0 ? (
              <div className="space-y-3 md:max-h-48 md:overflow-y-auto">
                {timetable.groups.map((group, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{group.groupName}</h4>
                      <p className="text-xs text-gray-500">{group.timeSlot}</p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {group.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No assigned groups</p>
              </div>
            )}
          </div>
        </div>

        {/* Teaching Stats */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
          <div className="p-5">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">Teaching Stats</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="flex-shrink-0 mr-1.5 h-4 w-4" />
                  <p>Teaching Hours</p>
                </div>
                <p className="font-medium text-gray-900">{totalTeachingHours} hrs</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <BookOpen className="flex-shrink-0 mr-1.5 h-4 w-4" />
                  <p>Total Lessons</p>
                </div>
                <p className="font-medium text-gray-900">{eventsByType.lessons}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <PenTool className="flex-shrink-0 mr-1.5 h-4 w-4" />
                  <p>Exams</p>
                </div>
                <p className="font-medium text-gray-900">{eventsByType.exams}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Monthly Overview */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden col-span-1">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">This Month's Activity</h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-gray-700">Lessons</span>
                  </div>
                  <span className="text-xl font-semibold text-blue-600">{monthlyStats.lessons}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min(100, (monthlyStats.lessons / 20) * 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <PenTool className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-gray-700">Exams</span>
                  </div>
                  <span className="text-xl font-semibold text-red-600">{monthlyStats.exams}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{ width: `${Math.min(100, (monthlyStats.exams / 5) * 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-orange-500 mr-2" />
                    <span className="text-gray-700">Events</span>
                  </div>
                  <span className="text-xl font-semibold text-orange-600">{monthlyStats.events}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full"
                    style={{ width: `${Math.min(100, (monthlyStats.events / 5) * 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-purple-500 mr-2" />
                    <span className="text-gray-700">Hours</span>
                  </div>
                  <span className="text-xl font-semibold text-purple-600">{monthlyStats.hours}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${Math.min(100, (monthlyStats.hours / 40) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Distribution */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden col-span-1 lg:col-span-2">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Activity Distribution</h3>
          </div>
          <div className="p-5">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Visual representation of teaching hours */}
              <div className="flex-1 bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Teaching Hours Distribution</h4>
                <div className="flex items-end justify-between h-48 px-2">
                  {/* This is a simple bar chart visualization */}
                  {timetable && timetable.lessons.length > 0 ? (
                    Array.from({ length: 7 }, (_, i) => {
                      // Get day name (Mon, Tue, etc.)
                      const dayName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i];

                      // Filter lessons that occur on this day
                      const dayLessons = timetable.lessons.filter(lesson => {
                        const lessonDate = parseISO(lesson.date);
                        return lessonDate.getDay() === (i + 1) % 7;
                      });

                      // Calculate total hours for this day
                      const hours = dayLessons.reduce((total, lesson) => {
                        const start = parseISO(`2000-01-01T${lesson.startTime}`);
                        const end = parseISO(`2000-01-01T${lesson.endTime}`);
                        return total + (end - start) / (1000 * 60 * 60);
                      }, 0);

                      // Calculate height percentage (max 100%)
                      const heightPercentage = Math.min(100, (hours / 8) * 100);

                      return (
                        <div key={i} className="flex flex-col items-center">
                          <div
                            className="w-10 bg-blue-500 rounded-t-md"
                            style={{ height: `${heightPercentage}%` }}
                          ></div>
                          <div className="mt-2 text-xs font-medium text-gray-600">{dayName}</div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <p className="text-gray-500">No data available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Event type distribution */}
              <div className="flex-1 bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Upcoming Activities</h4>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-24 text-sm text-gray-600">Lessons</div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${(eventsByType.lessons / (eventsByType.lessons + eventsByType.exams + eventsByType.events) * 100) || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-10 text-right text-sm font-medium text-gray-900">{eventsByType.lessons}</div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-24 text-sm text-gray-600">Exams</div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-red-600 h-2.5 rounded-full"
                          style={{ width: `${(eventsByType.exams / (eventsByType.lessons + eventsByType.exams + eventsByType.events) * 100) || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-10 text-right text-sm font-medium text-gray-900">{eventsByType.exams}</div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-24 text-sm text-gray-600">Events</div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-orange-600 h-2.5 rounded-full"
                          style={{ width: `${(eventsByType.events / (eventsByType.lessons + eventsByType.exams + eventsByType.events) * 100) || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-10 text-right text-sm font-medium text-gray-900">{eventsByType.events}</div>
                  </div>

                  <div className="mt-8">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm font-medium text-gray-700">Attendance Rate</div>
                      <div className="text-lg font-semibold text-gray-900">{attendanceRate}</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full"
                        style={{ width: attendanceRate === "N/A" ? "0%" : attendanceRate }}
                      ></div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming and completed activities */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`${activeTab === 'upcoming'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm cursor-pointer`}
            >
              Upcoming Activities
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`${activeTab === 'completed'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm cursor-pointer`}
            >
              Completed Activities
            </button>
          </nav>
        </div>
        <div className="p-5">
          {activeTab === 'upcoming' ? (
            <div className="space-y-4 overflow-y-scroll max-h-250">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, index) => (
                  <div key={index} className="flex flex-col sm:flex-row border-1 border-gray-300 cursor-pointer rounded-lg p-4 hover:bg-gray-50 transition duration-150">
                    <div className="flex-shrink-0 sm:mr-4 mb-3 sm:mb-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${event.type === 'lesson' ? 'bg-blue-100 text-blue-600' :
                        event.type === 'exam' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                        }`}>
                        {event.type === 'lesson' ? (
                          <BookOpen className="h-6 w-6" />
                        ) : event.type === 'exam' ? (
                          <PenTool className="h-6 w-6" />
                        ) : (
                          <Calendar className="h-6 w-6" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 max-w-160 line-clamp-2">{event.topic || event.eventDescription}</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            <span className="capitalize">{event.type}</span> at {event.venue}
                          </p>
                        </div>
                        <div className="flex items-center mt-2 sm:mt-0">
                          <Clock className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-500">
                            {format(parseISO(event.eventDate), "MMM d")} • {event.startTime} - {event.endTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No upcoming activities</h3>
                  <p className="text-gray-500">You don't have any scheduled activities in the future.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 overflow-y-scroll max-h-250">
              {completedEvents.length > 0 ? (
                completedEvents.map((event, index) => (
                  <div key={index} className="flex flex-col sm:flex-row border cursor-pointer border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition duration-150">
                    <div className="flex-shrink-0 sm:mr-4 mb-3 sm:mb-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${event.type === 'lesson'
                        ? `${event.attended && event.isMarked ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`
                        : event.type === 'exam'
                          ? `${event.attended && event.isMarked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`
                          : 'bg-orange-100 text-orange-600'
                        }`}>
                        {event.type === 'lesson' ? (
                          event.attended ? <CheckCircle className="h-6 w-6" /> : <BookOpen className="h-6 w-6" />
                        ) : event.type === 'exam' ? (
                          event.attended ? <CheckCircle className="h-6 w-6" /> : <PenTool className="h-6 w-6" />
                        ) : (
                          <Calendar className="h-6 w-6" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 max-w-160 line-clamp-2">{event.topic}</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            <span className="capitalize">{event.type}</span> at {event.venue}
                            {(event.type === 'lesson' || event.type === 'exam') && (
                              <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${event.attended
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {event.attended ? 'Attended' : 'Missed'}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center mt-2 sm:mt-0">
                          <Clock className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-500">
                            {format(parseISO(event.eventDate), "MMM d")} • {event.startTime} - {event.endTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No completed activities</h3>
                  <p className="text-gray-500">You don't have any completed activities yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Performance insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Teaching performance */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Teaching Performance</h3>
          </div>
          <div className="p-5">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium text-gray-700">Attendance Rate</div>
                  <div className="text-sm font-semibold text-gray-900">{attendanceRate}</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: attendanceRate === "N/A" ? "0%" : attendanceRate }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium text-gray-700">Teaching Hours Progress</div>
                  <div className="text-sm font-semibold text-gray-900">{totalTeachingHours} / 120 hrs</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-orange-600 h-2.5 rounded-full"
                    style={{ width: `${Math.min(100, (totalTeachingHours / 120) * 100)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium text-gray-700">Course Completion</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {Math.round((completedEvents.length / (completedEvents.length + upcomingEvents.length)) * 100) || 0}%
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-purple-600 h-2.5 rounded-full"
                    style={{ width: `${Math.round((completedEvents.length / (completedEvents.length + upcomingEvents.length)) * 100) || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Key Performance Highlights</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Perfect Attendance</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {attendanceRate === "100%" ? "Achieved" : "Not achieved yet"}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-orange-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Course Progress</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {upcomingEvents.length > 0 ? `${upcomingEvents.length} activities remaining` : "All activities completed"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current month calendar */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Activities This Month</h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
              {/* Calendar header */}
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="bg-gray-50 py-2 text-center">
                  <span className="text-xs font-medium text-gray-500">{day}</span>
                </div>
              ))}

              {/* Calendar days - this would normally be generated dynamically based on current month */}
              {Array.from({ length: 35 }, (_, i) => {
                const now = new Date();
                const monthStart = startOfMonth(now);
                const monthEnd = endOfMonth(now);

                // Calculate first day offset properly (0 = Sunday in JavaScript Date)
                const firstDayOfWeek = monthStart.getDay();
                // Convert to Monday-based indexing (0 = Monday)
                const firstDayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

                // Calculate the actual date
                const dayDate = new Date(monthStart);
                dayDate.setDate(i - firstDayOffset + 1);

                const dayNum = dayDate.getDate();
                const currentMonth = dayDate.getMonth() === now.getMonth();
                const isToday = dayDate.toDateString() === now.toDateString();

                // Check if there are any events on this day
                const hasEvent = timetable && [
                  ...timetable.lessons
                    .filter(l => {
                      const date = parseISO(l.date);
                      return isSameDay(date, dayDate);
                    })
                    .map(l => true),

                  ...timetable.exams
                    .filter(e => {
                      const date = parseISO(e.examDate);
                      return isSameDay(date, dayDate);
                    })
                    .map(e => true),

                  ...timetable.events
                    .filter(e => {
                      const date = parseISO(e.eventDate);
                      return isSameDay(date, dayDate);
                    })
                    .map(e => true),
                ].length > 0;


                return (
                  <div
                    key={i}
                    className={`bg-white min-h-[60px] p-1 ${isToday ? 'ring-1 ring-indigo-600' : ''}`}
                  >
                    <div className="flex flex-col h-full">
                      <span className={`text-xs font-medium ${!currentMonth ? 'text-gray-300' : isToday ? 'text-indigo-600' : 'text-gray-700'}`}>
                        {dayNum}
                      </span>
                      {hasEvent && currentMonth && (
                        <div className="mt-auto">
                          <div className="w-full h-1 rounded-full bg-blue-500 mb-1"></div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-500">Activity Scheduled</span>
              </div>
              <div className="text-xs text-gray-500">
                {format(new Date(), "MMMM yyyy")}
              </div>
            </div>
          </div>
        </div>





      </div>
    </div>
  )
}