import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import Calendar from "../../components/calendar/Calendar"
import LoadingSpinner from "../../components/loadingSpinner/LoadingSpinner"
import { FiPenTool, FiSave } from "react-icons/fi"
import { Book } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL

export default function ExamTimetableManagement() {
    const [timetables, setTimetables] = useState([])
    const [tutors, setTutors] = useState([])
    const venues = [
        {name: "RHINO - Theory, Interview, Exam room", value: "RHINO ROOM"},
        {name: "ELEPHANT - Espresso , Beverages, Mixology, Practical Room", value: "ELEPHANT ROOM"},
        {name: "LION - Espresso Practical", value: "LION ROOM"},
        {name: "CHEETAH - Filter, Mixology, Cold Beverage Practical Room", value: "CHEETAH ROOM"},
      ];
    const [isLoading, setIsLoading] = useState(false)
    const [isExamLoading, setIsExamLoading] = useState(false)
    const [isEventLoading, setIsEventLoading] = useState(false)
    const [selectedTimetableIds, setSelectedTimetableIds] = useState([])
    const [editMode, setEditMode] = useState({ isEditing: false, type: null, id: null })
    const [examForm, setExamForm] = useState({
        examDate: "",
        startTime: "",
        endTime: "",
        venue: "",
        examName: "",
        cohortTutor: "",
        cohort: "",
    })
    const [eventForm, setEventForm] = useState({
        eventDate: "",
        startTime: "",
        endTime: "",
        venue: "",
        eventDescription: "",
        organizerId: "",
        cohort: [],
    })

    

    useEffect(() => {
        fetchTimetables()
        fetchTutors()
    }, [])

    const fetchTimetables = async () => {
        try {
            setIsLoading(true)
            const response = await fetch(`${API_URL}/timetables`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
            const data = await response.json()
            if (data.success) {
                setTimetables(data.data)
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
            setIsLoading(true)
            const response = await fetch(`${API_URL}/tutors`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
            const data = await response.json()
            if (data.success) {
                setTutors(data.data)
            } else {
                throw new Error(data.message || "Failed to fetch tutors")
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleExamSubmit = async (e) => {
        e.preventDefault()
        try {
            setIsExamLoading(true)
            const url = editMode.isEditing
                ? `${API_URL}/timetables/exam/${editMode.id}`
                : `${API_URL}/timetables/exam`
            const method = editMode.isEditing ? "PUT" : "POST"

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(examForm),
            })
            const data = await response.json()
            if (data.success) {
                toast.success(editMode.isEditing ? "Exam updated successfully" : "Exam created successfully")
                resetForms()
                fetchTimetables()
            } else {
                throw new Error(data.message || `Failed to ${editMode.isEditing ? 'update' : 'create'} exam`)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsExamLoading(false)
        }
    }

    const handleEventSubmit = async (e) => {
        e.preventDefault()
        try {
            setIsEventLoading(true)
            const url = editMode.isEditing
                ? `${API_URL}/timetables/event/${editMode.id}`
                : `${API_URL}/timetables/event`
            const method = editMode.isEditing ? "PUT" : "POST"

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    ...eventForm,
                    timetableIds: selectedTimetableIds.length === 0 ? "all" : selectedTimetableIds,
                }),
            })
            const data = await response.json()
            if (data.success) {
                toast.success(editMode.isEditing ? "Event updated successfully" : "Event created successfully")
                resetForms()
                fetchTimetables()
            } else {
                throw new Error(data.message || `Failed to ${editMode.isEditing ? 'update' : 'create'} event`)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsEventLoading(false)
        }
    }

    const handleEdit = (item, type) => {
        setEditMode({ isEditing: true, type, id: item._id })
        if (type === 'exam') {
            setExamForm({
                examDate: item.examDate.split('T')[0],
                startTime: item.startTime,
                endTime: item.endTime,
                venue: item.venue,
                examName: item.examName,
                cohortTutor: item.cohortTutor,
                cohort: item.cohort,
            })
        } else {
            setEventForm({
                eventDate: item.eventDate.split('T')[0],
                startTime: item.startTime,
                endTime: item.endTime,
                venue: item.venue,
                eventDescription: item.eventDescription,
                organizerId: item.organizerId,
                cohort: item.cohort || [],
            })
        }
        // Scroll to the form
        const formElement = document.getElementById(type === 'exam' ? 'examForm' : 'eventForm')
        formElement?.scrollIntoView({ behavior: 'smooth' })
    }

    const resetForms = () => {
        setEditMode({ isEditing: false, type: null, id: null })
        setExamForm({
            examDate: "",
            startTime: "",
            endTime: "",
            venue: "",
            examName: "",
            cohortTutor: "",
            cohort: "",
        })
        setEventForm({
            eventDate: "",
            startTime: "",
            endTime: "",
            venue: "",
            eventDescription: "",
            organizerId: "",
            cohort: [],
        })
        setSelectedTimetableIds([])
    }


    const handleTimetableSelection = (timetableId) => {
        setSelectedTimetableIds((prev) =>
            prev.includes(timetableId)
                ? prev.filter((id) => id !== timetableId)
                : [...prev, timetableId]
        )
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="hcc-teaching-page">
                <div className="hcc-teaching-heading"><p className="hcc-teaching-eyebrow">13 / SCHOOL SCHEDULE</p><h1>Exam timetable</h1><p>Plan lessons, exams and school events.</p></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Exam Form */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">
                            {editMode.isEditing && editMode.type === 'exam' ? 'Update Exam' : 'Create Exam'}
                        </h2>
                        <form onSubmit={handleExamSubmit}>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Exam Date</label>
                                    <input
                                        type="date"
                                        value={examForm.examDate}
                                        onChange={(e) => setExamForm({ ...examForm, examDate: e.target.value })}
                                        className="mt-1 block w-full rounded-md p-2 border-2 border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Start Time</label>
                                    <input
                                        type="time"
                                        value={examForm.startTime}
                                        onChange={(e) => setExamForm({ ...examForm, startTime: e.target.value })}
                                        className="mt-1 block w-full rounded-md p-2 border-2 border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">End Time</label>
                                    <input
                                        type="time"
                                        value={examForm.endTime}
                                        onChange={(e) => setExamForm({ ...examForm, endTime: e.target.value })}
                                        className="mt-1 block w-full rounded-md p-2 border-2 border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Venue</label>
                                    <select
                                        value={examForm.venue}
                                        onChange={(e) => setExamForm({ ...examForm, venue: e.target.value })}
                                        className="mt-1 block w-full rounded-md p-2 border-2 border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                                        required
                                    >
                                        <option value="">Select Venue</option>
                                        {venues.map((venue) => (
                                            <option key={venue.value} value={venue.value}>
                                                {venue.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Exam Name</label>
                                    <input
                                        type="text"
                                        value={examForm.examName}
                                        onChange={(e) => setExamForm({ ...examForm, examName: e.target.value })}
                                        className="mt-1 block w-full rounded-md p-2 border-2 border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-offset-red-200 focus:ring-opacity-50 focus:outline-hidden"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Cohort & Tutor</label>
                                    <select
                                        value={`${examForm.cohort}|${examForm.cohortTutor}`}
                                        onChange={(e) => {
                                            const [cohort, tutorId] = e.target.value.split("|")
                                            setExamForm({ ...examForm, cohortTutor: tutorId, cohort: cohort })
                                        }}
                                        className="mt-1 block w-full rounded-md p-2 border-2 border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50 cursor-pointer"
                                        required
                                    >
                                        <option value="">Select Cohort & Tutor</option>
                                        {timetables.map((timetable) => (
                                            <option
                                                key={`${timetable.cohort}|${timetable.createdBy}`}
                                                value={`${timetable.cohort}|${timetable.createdBy}`}
                                            >
                                                {new Date(timetable.cohort).toLocaleDateString()} - {timetable.tutorName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="mt-4 w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 cursor-pointer flex items-center gap-4 justify-center"
                            >
                                {isExamLoading ? <LoadingSpinner size={15} /> :
                                    editMode.isEditing && editMode.type === 'exam' ? <FiSave /> : <FiPenTool />}
                                {editMode.isEditing && editMode.type === 'exam' ? 'Update Exam' : 'Create Exam'}
                            </button>
                            {editMode.isEditing && editMode.type === 'exam' && (
                                <button
                                    type="button"
                                    onClick={resetForms}
                                    className="mt-2 w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Event Form */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">
                            {editMode.isEditing && editMode.type === 'event' ? 'Update Event' : 'Create Event'}
                        </h2>
                        <form onSubmit={handleEventSubmit}>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Event Date</label>
                                    <input
                                        type="date"
                                        value={eventForm.eventDate}
                                        onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })}
                                        className="mt-1 block w-full rounded-md p-2 border-2 border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Start Time</label>
                                    <input
                                        type="time"
                                        value={eventForm.startTime}
                                        onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                                        className="mt-1 block w-full rounded-md p-2 border-2 border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">End Time</label>
                                    <input
                                        type="time"
                                        value={eventForm.endTime}
                                        onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                                        className="mt-1 block w-full rounded-md p-2 border-2 border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Venue</label>
                                    <input
                                        type="text"
                                        value={eventForm.venue}
                                        onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                                        className="mt-1 block w-full rounded-md p-2 border-2 border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Event Description</label>
                                    <input
                                        type="text"
                                        value={eventForm.eventDescription}
                                        onChange={(e) => setEventForm({ ...eventForm, eventDescription: e.target.value })}
                                        className="mt-1 block w-full rounded-md p-2 border-2 border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Organizer</label>
                                    <select
                                        value={eventForm.organizerId}
                                        onChange={(e) => setEventForm({ ...eventForm, organizerId: e.target.value })}
                                        className="mt-1 block w-full p-2 border-2 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        required
                                    >
                                        <option value="">Select Organizer</option>
                                        {tutors.map((tutor) => (
                                            <option key={tutor._id} value={tutor._id}>
                                                {tutor.firstName} {tutor.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Timetables</label>
                                    <div className="mt-1 space-y-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedTimetableIds.length === 0}
                                                onChange={() => setSelectedTimetableIds([])}
                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            />
                                            <span className="ml-2">All Timetables</span>
                                        </label>
                                        {timetables.map((timetable) => (
                                            <label key={timetable._id} className="inline-flex items-center">
                                                <input
                                                    type="checkbox"
                                                    value={timetable._id}
                                                    checked={selectedTimetableIds.includes(timetable._id)}
                                                    onChange={() => handleTimetableSelection(timetable._id)}
                                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                />
                                                <span className="ml-2">
                                                    {new Date(timetable.cohort).toLocaleDateString()} - {timetable.tutorName}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="mt-4 w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 cursor-pointer flex items-center gap-4 justify-center"
                            >
                                {isEventLoading ? <LoadingSpinner size={15} /> : 
                                    editMode.isEditing && editMode.type === 'event' ? <FiSave /> : <Book />}
                                {editMode.isEditing && editMode.type === 'event' ? 'Update Event' : 'Create Event'}
                            </button>
                            {editMode.isEditing && editMode.type === 'event' && (
                                <button
                                    type="button"
                                    onClick={resetForms}
                                    className="mt-2 w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                            )}
                        </form>
                    </div>
                </div>

                {/* Calendar Component */}
                <div className="mt-8">
                <Calendar timetables={timetables} onEdit={handleEdit} />
                </div>
            </div>
        </>
    )
}

