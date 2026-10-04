import { useEffect, useState } from "react"
import { format, parseISO } from "date-fns"
import { CircleCheck, CircleX, PenTool, Phone } from "lucide-react"
import toast from "react-hot-toast";
import StudentFeedback from "./components/StudentFeedback";
import StudentFeedbackWidget from "./components/StudentFeedback";

const API_URL = import.meta.env.VITE_API_URL

export default function Dashboard() {
    const [student, setStudent] = useState(null)
    const [tutor, setTutor] = useState(null)
    const [timetable, setTimetable] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isPending, setIsPending] = useState(false)
    const studentData = JSON.parse(localStorage.getItem("user"))

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem("user"))
            if (!userData || !userData.token) {
                throw new Error("Please login again")
            }

            if (!userData.tutorId) {
                setIsPending(true);
                return;
            }

            const [studentResponse, tutorResponse, timetableResponse] = await Promise.all([
                fetch(`${API_URL}/students/${userData.admissionNumber}`, {
                    headers: { Authorization: `Bearer ${userData.token}` },
                }),
                fetch(`${API_URL}/tutors/${userData.tutorId}`, {
                    headers: { Authorization: `Bearer ${userData.token}` },
                }),
                fetch(`${API_URL}/timetables/${userData.tutorId}/${userData.group.groupId}`, {
                    headers: { Authorization: `Bearer ${userData.token}` },
                }),
            ])


            const [studentData, tutorData, timetableData] = await Promise.all([
                studentResponse.json(),
                tutorResponse.json(),
                timetableResponse.json(),
            ])

            console.log(`timetableData`, timetableData);


            if (studentData.success && tutorData.success && timetableData.success) {
                setStudent(studentData.data)
                setTutor(tutorData.data)
                setTimetable(timetableData.data)
            } else {
                throw new Error("Failed to fetch data")
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false)
        }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
        }).format(amount)
    }

    const getUpcomingEvents = () => {
        if (!timetable) return []

        const now = new Date()

        const allEvents = [
            ...timetable.lessons.map(l => ({
                ...l,
                type: 'lesson',
                date: l.date?.$date || l.date // fallback in case structure changes
            })),
            ...timetable.exams.map(e => ({
                ...e,
                type: 'exam',
                date: e.examDate?.$date || e.examDate
            })),
            ...timetable.events.map(e => ({
                ...e,
                type: 'event',
                date: e.eventDate?.$date || e.eventDate
            }))
        ]

        const futureEvents = allEvents
            .filter(event => {
                if (!event.date) return false
                const eventDate = new Date(event.date)
                return !isNaN(eventDate.getTime()) && eventDate > now
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date))

        return futureEvents
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

    if (isPending) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="flex items-center text-center justify-center min-h-screen p-10">
                    <span className="bg-amber-600/30 font-bold p-5 text-amber-700 border-2 border-amber-600">
                        You Ain't Got No Assigned Tutor Yet. <br /> After a Tutor is assigned to you, your Dashboard will load<br /><br />Please Come Back Later!
                        <br /><br />To Refresh Data On This Page, Please Logout and Login Again
                    </span>
                </div>
            </div>
        )
    }

    const feeProgress = (student.upfrontFee / student.courseFee) * 100
    const isEligible = student.upfrontFee >= student.courseFee - 500
    const upcomingEvents = getUpcomingEvents()
    const attendedCount = student.attendance.attended.length
    const absentCount = student.attendance.absent.length
    const totalClasses = attendedCount + absentCount

    return (
        <div className="min-h-screen bg-[url(/student/student.png)]">

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-orange-600 text-2xl font-bold mb-4 uppercase max-md:text-center">Welcome | HCC Student Dashboard</h1>
                {/* Profile Widget */}
                <div className="mb-8">
                    <div className="border-2 border-orange-600 rounded-lg shadow-lg overflow-hidden">
                        <div className="p-6 flex justify-between max-md:flex-col">
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="flex-shrink-0">
                                    <img
                                        src={student.profileImage || "/profile/student.jpg"}
                                        alt={`${student.firstName} ${student.lastName}`}
                                        className="h-40 w-40 rounded-full border-4 border-white object-cover"
                                    />
                                </div>
                                <div className="flex-1 text-center md:text-left text-orange-600">
                                    <h1 className="text-2xl font-bold">
                                        {student.firstName} {student.lastName}
                                    </h1>
                                    <p className="text-gray-600 font-bold">{student.admissionNumber}</p>
                                    <p className="text-gray-600 ">{student.courseName}</p>
                                    <div className="mt-4 flex flex-wrap gap-4 justify-center md:justify-start">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-400/30 text-sm font-bold">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                            {student.academicYear}
                                        </span>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-400/30 text-sm font-bold">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            {student.courseDuration}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="max-md:hidden">
                                <img src="/student/logo.png" alt="" className="h-30" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        {/* Tutor Info Widget */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold mb-4">Assigned Tutor</h2>
                                <div className="flex items-center gap-4">
                                    <img
                                        src={tutor.profilePicture || "/profile/student.jpg"}
                                        alt={`${tutor.firstName} ${tutor.lastName}`}
                                        className="h-16 w-16 rounded-full object-cover"
                                    />
                                    <div>
                                        <h3 className="font-medium">
                                            {tutor.firstName} {tutor.lastName}
                                        </h3>
                                        <p className="text-sm text-gray-500">{tutor.role}</p>
                                        <div className="mt-2 space-y-1">
                                            <p className="text-sm flex items-center">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                    />
                                                </svg>
                                                {tutor.email}
                                            </p>
                                            <p className="text-sm flex items-center">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                    />
                                                </svg>
                                                {tutor.phone}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {studentData && (
                            <div className="p-6 bg-blue-50 border border-blue-300">
                                <h2 className="font-bold text-lg">Assigned Group</h2>
                                <h3>Group Name: {studentData.group.groupName}</h3>
                                <p>Time Slots: {studentData.group.timeSlot}</p>
                            </div>
                            )}
                        </div>

                        {/* Upcoming Events Widget */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
                                <div className="space-y-4 overflow-y-scroll max-h-200 overflow-x-hidden">
                                    {upcomingEvents.map((event, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start max-md:flex-col gap-4 p-4 rounded-lg bg-gray-50 transition-transform hover:scale-[1.02]"
                                        >
                                            <div
                                                className={`p-2 rounded-lg ${event.type === "exam"
                                                    ? "bg-red-100 text-red-600"
                                                    : event.type === "lesson"
                                                        ? "bg-orange-100 text-blue-600"
                                                        : "bg-blue-100 text-orange-600"
                                                    }`}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    {event.type === "exam" ? (
                                                        <PenTool className="h-5 w-5" />
                                                    ) : event.type === "lesson" ? (
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                                        />
                                                    ) : (
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                        />
                                                    )}
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium">{event.topic || event.examName || event.eventDescription}</h4>
                                                <p className="text-sm text-gray-500">
                                                    {format(parseISO(event.date || event.examDate || event.eventDate), "MMMM d, yyyy")}
                                                </p>
                                                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                                                    <span className="flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                            />
                                                        </svg>
                                                        {event.startTime} - {event.endTime}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                            />
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                            />
                                                        </svg>
                                                        {event.venue}
                                                    </span>
                                                </div>
                                            </div>
                                            {event.type === "exam" ? (
                                                <p className="bg-red-600/25 px-2 rounded-sm text-red-600">exam</p>
                                            ) : event.type === "lesson" ? (
                                                <p className="bg-blue-600/25 px-2 rounded-sm text-blue-600">lesson</p>
                                            ) : (
                                                <p className="bg-orange-600/25 px-2 rounded-sm text-orange-600">event</p>
                                            )}
                                        </div>
                                    ))}
                                    {upcomingEvents.length === 0 && (
                                        <div className="text-center py-4 text-gray-500">No upcoming events</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Fee Status Widget */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold mb-1">Fee Status</h2>
                                <p className="text-sm text-gray-500 mb-4">Course Fee: {formatCurrency(student.courseFee)}</p>
                                <div className="space-y-4">
                                    <div className="bg-gray-200 rounded-full h-2 overflow-x-hidden">
                                        <div
                                            className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${feeProgress}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Paid: {formatCurrency(student.upfrontFee)}</span>
                                        <span>Balance: {formatCurrency(student.courseFee - student.upfrontFee)}</span>
                                    </div>
                                    <div className={`mt-4 p-4 rounded-lg ${isEligible ? "bg-orange-50" : "bg-red-50"}`}>
                                        <div className="flex items-center">
                                            <svg
                                                className={`w-5 h-5 mr-2 ${isEligible ? "text-orange-500" : "text-red-500"}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            <span className={isEligible ? "text-orange-700" : "text-red-700"}>
                                                {isEligible ? "Eligible for exams" : "Not eligible for exams"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Attendance Widget */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold mb-1">Attendance Overview</h2>
                                <p className="text-sm text-gray-500 mb-4">Total Classes: {totalClasses}</p>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Present</span>
                                        <span className="text-sm text-gray-500">
                                            {attendedCount} ({Math.round((attendedCount / totalClasses) * 100)}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-red-100 rounded-full h-2">
                                        <div
                                            className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${(attendedCount / totalClasses) * 100}%` }}
                                        />
                                    </div>
                                    <div className="space-y-4 mt-6 overflow-y-scroll max-h-100">
                                        {student.attendance.attended.map((record, index) => (
                                            <div key={index} className="p-3 bg-orange-50 rounded-lg flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-orange-700 line-clamp-1">{record.topic}</p>
                                                    <p className="text-sm text-orange-600">
                                                        {new Date(record.date).toLocaleDateString('en-US', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })}
                                                    </p>
                                                </div>
                                                <span className="py-1 px-2 rounded-sm text-orange-600"><CircleCheck /></span>
                                            </div>
                                        ))}

                                        {student.attendance.absent.slice(-3).map((record, index) => (
                                            <div key={index} className="p-3 bg-red-50 rounded-lg flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium text-red-700 line-clamp-1">{record.topic}</p>
                                                    <p className="text-sm text-red-600">
                                                        {new Date(record.date).toLocaleDateString('en-US', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })}
                                                    </p>
                                                </div>
                                                <span className="py-1 px-2 rounded-sm text-red-600"><CircleX /></span>
                                            </div>
                                        ))}
                                    </div>

                                </div>
                            </div>
                        </div>


                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold mb-1">Borrowed Books</h2>
                                <p className="text-sm text-gray-500 mb-4">Total: {student.borrowedBooks.length}</p>
                                <div className="space-y-4">
                                    {student.borrowedBooks.map((book, index) => {
                                        const dateBorrowed = new Date(book.dateBorrowed);
                                        const expectedReturnDate = new Date(dateBorrowed);
                                        const today = new Date();
                                        expectedReturnDate.setDate(expectedReturnDate.getDate() + book.allowedDays);
                                        const overdue = book.returnDate === null && today > expectedReturnDate;

                                        return (
                                            <div key={index} className={`p-3 rounded-lg flex justify-between gap-1 items-center ${overdue ? "bg-red-50" : "bg-orange-50"}`}>
                                                <div>
                                                    <img src={book.bookImage} alt="image" className="h-20 min-w-20" />
                                                </div>
                                                <div>
                                                    <p className={`font-medium ${overdue ? "text-red-700" : "text-orange-700"} line-clamp-1 line-clamp-2`}>
                                                        Book Name: {book.bookName}
                                                    </p>
                                                    <p className="text-sm text-gray-600">Borrowed: {format(dateBorrowed, "MMM dd, yyyy")}</p>
                                                    <p className="text-sm text-gray-600">Due: {format(expectedReturnDate, "MMM dd, yyyy")}</p>
                                                    {book.accruedFee > 0 && (
                                                        <p className="text-sm text-red-600 font-semibold">Fee: KES {book.accruedFee}</p>
                                                    )}
                                                </div>
                                                <span className={`py-1 px-2 rounded-sm ${book.returnDate ? "text-orange-600" : "text-red-600"}`}>
                                                    {book.returnDate ? <CircleCheck /> : <CircleX />}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        {/* Fee Payment Info Widget */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold mb-4">How to Pay Fees</h2>
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                                />
                                            </svg>
                                            <span className="font-medium">Bank Details</span>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <p>
                                                <span className="text-gray-500">Bank:</span> Bank details pending
                                            </p>
                                            <p>
                                                <span className="text-gray-500">Account No:</span> Pending HCC confirmation
                                            </p>
                                            <p>
                                                <span className="text-gray-500">Account Name:</span> Hospitality Competence Center Africa
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Please include your admission number as the reference when making payments.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-3">
                        <StudentFeedbackWidget />
                    </div>
                </div>
            </main>

        </div>
    )
}

