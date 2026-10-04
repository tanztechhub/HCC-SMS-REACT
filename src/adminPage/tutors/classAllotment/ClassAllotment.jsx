"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { format } from "date-fns"
import { LuRefreshCw, LuPlus, LuTrash2, LuUsers, LuClock, LuBookOpen, LuCalendar, LuSearch } from "react-icons/lu"
import { FaEdit } from "react-icons/fa";
import { RiPassPendingLine } from "react-icons/ri"
import { MdOutlineAssignmentTurnedIn, MdOutlineClass } from "react-icons/md"
import { IoPeopleSharp } from "react-icons/io5"
import { FiChevronDown, FiChevronUp } from "react-icons/fi"
import LoadingSpinner from '../../../components/loadingSpinner/LoadingSpinner'

const API_URL = import.meta.env.VITE_API_URL

export default function ClassAllotmentRedesign() {
    const [students, setStudents] = useState([])
    const [tutors, setTutors] = useState([])
    const [groups, setGroups] = useState([])
    const [unassignedStudents, setUnassignedStudents] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("overview")
    const [selectedTutor, setSelectedTutor] = useState(null)
    const [showCreateGroup, setShowCreateGroup] = useState(false)
    const [isEditingGroup, setIsEditingGroup] = useState(false)
    const [expandedTutors, setExpandedTutors] = useState(new Set())
    const [showAssignModal, setShowAssignModal] = useState(false)
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [filteredStudents, setFilteredStudents] = useState([])
    const [startTime, setStartTime] = useState("08:00")
    const [endTime, setEndTime] = useState("11:00")
    const [timeSlots, setTimeSlots] = useState([])
    const [editingGroup, setEditingGroup] = useState(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showStudentsModal, setShowStudentsModal] = useState(false)
    const [selectedGroupStudents, setSelectedGroupStudents] = useState([])
    const [showTransferModal, setShowTransferModal] = useState(false)
    const [studentToTransfer, setStudentToTransfer] = useState(null)
    const [targetGroup, setTargetGroup] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [courseFilter, setCourseFilter] = useState("")
    const [availableCourses, setAvailableCourses] = useState([])


    useEffect(() => {
        generateTimeSlots()
    }, [startTime, endTime])

    const generateTimeSlots = () => {
        if (!startTime || !endTime) return

        const slots = []
        let currentStart = startTime
        let currentEnd = addMinutes(currentStart, 180) // 3 hours default

        // Convert to 24h format for comparison
        const [endHours, endMinutes] = endTime.split(':').map(Number)
        const totalEndMinutes = endHours * 60 + endMinutes

        while (true) {
            const [startHours, startMinutes] = currentStart.split(':').map(Number)
            const totalStartMinutes = startHours * 60 + startMinutes

            if (totalStartMinutes >= totalEndMinutes) break

            slots.push(`${currentStart} - ${currentEnd}`)
            currentStart = addMinutes(currentEnd, 30) // 30 minute break
            currentEnd = addMinutes(currentStart, 180) // 3 hours session
        }

        setTimeSlots(slots)
    }

    // Helper function to add minutes to a time string
    const addMinutes = (time, minutes) => {
        const [hours, mins] = time.split(':').map(Number)
        const date = new Date()
        date.setHours(hours, mins + minutes, 0, 0)
        return format(date, 'HH:mm')
    }

    const [stats, setStats] = useState({
        totalTutors: 0,
        totalGroups: 0,
        assignedStudents: 0,
        unassignedStudents: 0
    })

    const [newGroup, setNewGroup] = useState({
        tutorId: "",
        tutorName: "",
        groupName: "",
        timeSlot: "",
        startTime: startTime,
        endTime: endTime,
        maxCapacity: 50,
        courses: [],
    })
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        calculateStats()
        processUnassignedStudents()
    }, [students, groups, tutors])

    const fetchData = async () => {
        setIsLoading(true)
        await Promise.all([fetchStudents(), fetchTutors(), fetchGroups()])
        setIsLoading(false)
    }

    const fetchStudents = async () => {
        try {
            const response = await fetch(`${API_URL}/students`)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            if (data.success) {
                setStudents(data.data)
                toast.success("Students data fetched successfully")
            } else {
                throw new Error(data.message || "Failed to fetch students")
            }
        } catch (error) {
            toast.error(`Error fetching students: ${error.message}`)
            console.error("Error fetching students:", error)
        }
    }

    const fetchTutors = async () => {
        try {
            const response = await fetch(`${API_URL}/tutors`)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            if (data.success) {
                setTutors(data.data)
                toast.success("Tutors data fetched successfully")
            } else {
                throw new Error(data.message || "Failed to fetch tutors")
            }
        } catch (error) {
            toast.error(`Error fetching tutors: ${error.message}`)
            console.error("Error fetching tutors:", error)
        }
    }

    const fetchGroups = async () => {
        try {
            const response = await fetch(`${API_URL}/classes`)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            if (data.success) {
                setGroups(data.data)
                toast.success("Groups data fetched successfully")
            } else {
                throw new Error(data.message || "Failed to fetch groups")
            }
        } catch (error) {
            toast.error(`Error fetching groups: ${error.message}`)
            console.error("Error fetching groups:", error)
        }
    }
    const calculateStats = () => {
        const assignedStudentIds = new Set()
        groups.forEach(group => {
            group.students?.forEach(student => {
                assignedStudentIds.add(student._id)
            })
        })

        setStats({
            totalTutors: tutors.length,
            totalGroups: groups.length,
            assignedStudents: assignedStudentIds.size,
            unassignedStudents: students.length - assignedStudentIds.size
        })
    }

    const processUnassignedStudents = () => {
        const assignedStudentIds = new Set()
        groups.forEach(group => {
            group.students?.forEach(student => {
                assignedStudentIds.add(student._id)
            })
        })

        const unassigned = students.filter(student => !assignedStudentIds.has(student._id))
        setUnassignedStudents(unassigned)
    }

    const handleCreateGroup = async () => {

        if (!newGroup.tutorId || !newGroup.groupName || !startTime || !endTime) {
            toast.error("Please fill in all required fields")
            return
        }

        const timeSlot = `${startTime} - ${endTime}`
        const groupData = {
            ...newGroup,
            timeSlot
        }

        try {
            const response = await fetch(`${API_URL}/classes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(groupData)
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
            }

            const result = await response.json()

            if (result.success) {
                setGroups(prev => [...prev, result.data])
                setShowCreateGroup(false)
                setNewGroup({
                    tutorId: "",
                    groupName: "",
                    timeSlot: "",
                    startTime: startTime,
                    endTime: endTime,
                    maxCapacity: 50,
                    courses: [],
                })
                toast.success("Group created successfully")
                fetchGroups()
            } else {
                throw new Error(result.message || "Failed to create group")
            }
        } catch (error) {
            toast.error(`Failed to create group: ${error.message}`)
            console.error("Error creating group:", error)
        }
    }

    // Add this function to handle editing a group
    const handleEditGroup = async () => {
        if (!editingGroup.tutorId || !editingGroup.groupName || !startTime || !endTime) {
            toast.error("Please fill in all required fields")
            return
        }

        // Create time slot from start and end times
        const timeSlot = `${editingGroup.startTime} - ${editingGroup.endTime}`
        const groupData = {
            ...editingGroup,
            timeSlot
        }

        console.log(`groupData`, groupData);

        try {
            setIsEditingGroup(true)
            const response = await fetch(`${API_URL}/classes/${editingGroup._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(groupData)
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
            }

            const result = await response.json()

            if (result.success) {
                setGroups(prev => prev.map(group =>
                    group._id === editingGroup._id ? result.data : group
                ))
                setShowEditModal(false)
                setEditingGroup(null)
                toast.success("Group updated successfully")
            } else {
                throw new Error(result.message || "Failed to update group")
            }
        } catch (error) {
            toast.error(`Failed to update group: ${error.message}`)
            console.error("Error updating group:", error)
            setIsEditingGroup(false)
        } finally {
            setIsEditingGroup(false)
        }
    }



    const handleDeleteGroup = async (groupId) => {
        if (!confirm("Are you sure you want to delete this group? This action cannot be undone.")) return

        try {
            const response = await fetch(`${API_URL}/classes/${groupId}`, {
                method: "DELETE"
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
            }

            const result = await response.json()

            if (result.success) {
                setGroups(prev => prev.filter(group => group._id !== groupId))
                toast.success("Group deleted successfully")
                fetchGroups()
            } else {
                throw new Error(result.message || "Failed to delete group")
            }
        } catch (error) {
            toast.error(`Failed to delete group: ${error.message}`)
            console.error("Error deleting group:", error)
        }
    }

    // Add this function to open the edit modal
    // Update the openEditModal function to handle time parsing correctly
    const openEditModal = (group) => {
        console.log(`group`, group);

        // Parse the time slot and ensure we have proper time values
        const { startTime, endTime } = parseTimeSlot(group.timeSlot);

        // Set the editing group with proper tutor ID and times
        setEditingGroup({
            ...group,
            tutorId: group.tutorId._id,
            tutorName: group.tutorName,
            startTime: startTime || "08:00", // Fallback to default if null
            endTime: endTime || "11:00"      // Fallback to default if null
        })

        setShowEditModal(true)
    }

    const handleAssignStudents = async (selectedStudentIds) => {
        if (!selectedGroup || selectedStudentIds.length === 0) {
            toast.error("Please select students to assign")
            return
        }

        try {
            const response = await fetch(`${API_URL}/classes/${selectedGroup._id}/assign`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ studentIds: selectedStudentIds })
            })

            console.log(`API Response`, response);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
            }

            const result = await response.json()

            if (result.success) {
                setGroups(prev => prev.map(group => {
                    if (group._id === selectedGroup._id) {
                        return result.data
                    }
                    return group
                }))
                setShowAssignModal(false)
                setSelectedGroup(null)
                fetchGroups()
                toast.success("Students assigned successfully")
            } else {
                throw new Error(result.message || "Failed to assign students")
            }
        } catch (error) {
            toast.error(`Failed to assign students: ${error.message}`)
            console.error("Error assigning students:", error)
        }
    }

    const toggleTutorExpansion = (tutorId) => {
        setExpandedTutors(prev => {
            const newSet = new Set(prev)
            if (newSet.has(tutorId)) {
                newSet.delete(tutorId)
            } else {
                newSet.add(tutorId)
            }
            return newSet
        })
    }

    const openAssignModal = (group) => {
        setSelectedGroup(group)
        const availableStudents = unassignedStudents.filter(student =>
            group.courses.length === 0 || group.courses.includes(student.courseName)
        )
        setFilteredStudents(availableStudents)
        setShowAssignModal(true)
    }

    const getTutorGroups = (tutorId) => {
        return groups.filter(group => group.tutorId._id === tutorId)
    }

    // Helper function to parse time slot into start and end times
    // Helper function to parse time slot into start and end times
    const parseTimeSlot = (timeSlot) => {
        if (!timeSlot) return { startTime: "08:00", endTime: "11:00" };

        try {
            const [start, end] = timeSlot.split(' - ');
            return {
                startTime: start?.trim() || "08:00",
                endTime: end?.trim() || "11:00"
            };
        } catch (error) {
            console.error("Error parsing time slot:", error);
            return { startTime: "08:00", endTime: "11:00" };
        }
    }

    // Add these functions near your other helper functions
    const filterUnassignedStudents = () => {
        let filtered = unassignedStudents

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(student =>
                student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Filter by course
        if (courseFilter) {
            filtered = filtered.filter(student =>
                student.courseName === courseFilter
            )
        }

        return filtered
    }

    // Extract available courses from students
    useEffect(() => {
        const courses = [...new Set(students.map(student => student.courseName))].filter(Boolean)
        setAvailableCourses(courses)
    }, [students])

    // Add these functions near your other handler functions
    const viewGroupStudents = (group) => {
        setSelectedGroupStudents(group.students || [])
        setShowStudentsModal(true)
    }

    const openTransferModal = (student) => {
        setStudentToTransfer(student)
        setShowTransferModal(true)
    }

    const handleTransferStudent = async () => {
        if (!studentToTransfer || !targetGroup) {
            toast.error("Please select a target group")
            return
        }

        try {
            const response = await fetch(`${API_URL}/classes/${targetGroup}/transfer`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ studentId: studentToTransfer._id })
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
            }

            const result = await response.json()

            if (result.success) {
                toast.success("Student transferred successfully")
                setShowTransferModal(false)
                setStudentToTransfer(null)
                setShowStudentsModal(false)
                setTargetGroup("")
                fetchData()
            } else {
                throw new Error(result.message || "Failed to transfer student")
            }
        } catch (error) {
            toast.error(`Failed to transfer student: ${error.message}`)
            console.error("Error transferring student:", error)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-orange-700">Class Management System</h1>
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        disabled={isLoading}
                    >
                        <LuRefreshCw className={isLoading ? "animate-spin" : ""} />
                        Refresh Data
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Total Tutors" value={stats.totalTutors} bgColor="bg-blue-600" icon={<IoPeopleSharp />} />
                    <StatCard title="Active Groups" value={stats.totalGroups} bgColor="bg-orange-600" icon={<MdOutlineClass />} />
                    <StatCard title="Assigned Students" value={stats.assignedStudents} bgColor="bg-purple-600" icon={<MdOutlineAssignmentTurnedIn />} />
                    <StatCard title="Unassigned Students" value={stats.unassignedStudents} bgColor="bg-amber-500" icon={<RiPassPendingLine />} />
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="border-b border-gray-300">
                        <nav className="flex space-x-8 px-6">
                            {[
                                { id: "overview", label: "Overview", icon: <LuUsers /> },
                                { id: "tutors", label: "Tutor Groups", icon: <IoPeopleSharp /> },
                                { id: "unassigned", label: "Unassigned Students", icon: <RiPassPendingLine /> }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm cursor-pointer ${activeTab === tab.id
                                        ? "border-orange-500 text-orange-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setShowCreateGroup(true)}
                                    className="w-full flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer"
                                >
                                    <LuPlus className="text-orange-600" />
                                    <span className="text-orange-700 font-medium">Create New Group</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab("unassigned")}
                                    className="w-full flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer"
                                >
                                    <RiPassPendingLine className="text-amber-600" />
                                    <span className="text-amber-700 font-medium">View Unassigned Students ({stats.unassignedStudents})</span>
                                </button>
                            </div>
                        </div>

                        {/* Recent Groups */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Groups</h2>
                            <div className="space-y-3">
                                {groups.map((group) => (
                                    <div key={group._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-800">{group.groupName}</p>
                                            <p className="text-sm text-gray-600 capitalize">{group.tutorId?.firstName} {group.tutorId?.lastName}</p>
                                        </div>
                                        <div className="text-right flex gap-4 items-center">
                                            <div>
                                                <p className="text-sm font-medium">{group.currentCapacity}/{group.maxCapacity}</p>
                                                <p className="text-xs text-gray-500">{group.timeSlot}</p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    openEditModal(group)
                                                }}
                                                className="p-3 text-gray-600 bg-orange-50 border rounded cursor-pointer"
                                                title="Edit Group"
                                            >
                                                <FaEdit size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "tutors" && (
                    <div className="space-y-4">
                        {tutors.map((tutor) => {
                            const tutorGroups = getTutorGroups(tutor._id)
                            const isExpanded = expandedTutors.has(tutor._id)

                            return (
                                <div key={tutor._id} className="bg-white rounded-lg shadow-sm">
                                    <div
                                        className="p-6 cursor-pointer hover:bg-gray-50"
                                        onClick={() => toggleTutorExpansion(tutor._id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={tutor.profilePicture || "/profile/student.jpg"}
                                                    alt={tutor.firstName}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-800">
                                                        {tutor.firstName} {tutor.lastName}
                                                    </h3>
                                                    <p className="text-gray-600">{tutor.role}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {tutorGroups.length} Groups
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {tutorGroups.reduce((sum, group) => sum + (group.currentCapacity || 0), 0)} Students
                                                    </p>
                                                </div>
                                                {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                            </div>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="border-t border-gray-300 bg-gray-50 p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-medium text-gray-800">Groups</h4>
                                                <button
                                                    onClick={() => {
                                                        setNewGroup(prev => ({ ...prev, tutorId: tutor._id }))
                                                        setShowCreateGroup(true)
                                                    }}
                                                    className="flex items-center gap-2 px-3 py-1 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600"
                                                >
                                                    <LuPlus size={16} />
                                                    Add Group
                                                </button>
                                            </div>

                                            {tutorGroups.length === 0 ? (
                                                <p className="text-gray-500 text-center py-4">No groups assigned yet</p>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Replace the group display section with this enhanced version */}
                                                    {tutorGroups.map((group) => (
                                                        <div key={group._id} className="bg-white rounded-lg p-4 border border-orange-600/50">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <h5 className="font-medium text-gray-800">{group.groupName}</h5>
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            openEditModal(group)
                                                                        }}
                                                                        className="p-1 text-gray-600 hover:bg-gray-50 rounded cursor-pointer"
                                                                        title="Edit Group"
                                                                    >
                                                                        <FaEdit size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            handleDeleteGroup(group._id)
                                                                        }}
                                                                        className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                                                        title="Delete Group"
                                                                    >
                                                                        <LuTrash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2 text-sm text-gray-600 flex justify-between">
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <LuClock size={16} />
                                                                        <span>{group.timeSlot}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <LuUsers size={16} />
                                                                        <span>{group.currentCapacity || 0}/{group.maxCapacity} Students</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col gap-1">
                                                                    <button
                                                                        onClick={() => viewGroupStudents(group)}
                                                                        className="px-1 text-purple-600 hover:bg-purple-50 rounded cursor-pointer flex gap-1 items-center border"
                                                                        title="View Students"
                                                                    >
                                                                        <LuUsers size={16} />View Students
                                                                    </button>
                                                                    <button
                                                                        onClick={() => openAssignModal(group)}
                                                                        className="px-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer flex gap-1 items-center border"
                                                                        title="Assign Students"
                                                                    >
                                                                        <LuPlus size={16} /> Add Students
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}

                {activeTab === "unassigned" && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Unassigned Students ({unassignedStudents.length})
                            </h2>

                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Search Input */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search by name or admission..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full sm:w-64 p-2 pl-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none focus:border-orange-500"
                                    />
                                    <LuSearch className="absolute right-3 top-2.5 text-gray-400" size={18} />
                                </div>

                                {/* Course Filter */}
                                <select
                                    value={courseFilter}
                                    onChange={(e) => setCourseFilter(e.target.value)}
                                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none focus:border-orange-500"
                                >
                                    <option value="">All Courses</option>
                                    {availableCourses.map((course) => (
                                        <option key={course} value={course}>{course}</option>
                                    ))}
                                </select>

                                {/* Clear Filters */}
                                {(searchTerm || courseFilter) && (
                                    <button
                                        onClick={() => {
                                            setSearchTerm("")
                                            setCourseFilter("")
                                        }}
                                        className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        </div>

                        {filterUnassignedStudents().length === 0 ?
                            isLoading ? (
                                <div className="h-full w-full flex flex-col items-center justify-center text-gray-500">
                                    <LuRefreshCw size={100} className={isLoading ? "animate-spin" : ""} />
                                </div>
                            ) :
                                (
                                    <div className="text-center py-12">
                                        <MdOutlineAssignmentTurnedIn className="mx-auto text-6xl text-orange-500 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                                            {unassignedStudents.length === 0 ? 'All Students Assigned!' : 'No students match your filters'}
                                        </h3>
                                        <p className="text-gray-600">
                                            {unassignedStudents.length === 0
                                                ? 'Great job! All students have been assigned to groups.'
                                                : 'Try adjusting your search or filter criteria.'
                                            }
                                        </p>
                                    </div>
                                ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filterUnassignedStudents().map((student) => (
                                        <div key={student._id} className="border border-gray-400 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-medium text-gray-800">
                                                    {student.firstName} {student.lastName}
                                                </h4>
                                            </div>
                                            <div className="space-y-1 text-sm text-gray-600">
                                                <p><span className="font-medium">Course:</span> {student.courseName}</p>
                                                <p><span className="font-medium">Admission:</span> {student.admissionNumber}</p>
                                                <p><span className="font-medium">Start Date:</span> {format(new Date(student.startDate), "MMM d, yyyy")}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                    </div>
                )}

                {/* Create Group Modal */}
                {showCreateGroup && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <h3 className="text-xl font-semibold text-gray-800 mb-6">Create New Group</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Tutor</label>
                                    <select
                                        value={newGroup.tutorId}
                                        onChange={(e) => {
                                            const selectedTutor = tutors.find(t => t._id === e.target.value);
                                            setNewGroup(prev => ({
                                                ...prev,
                                                tutorId: selectedTutor?._id || "",
                                                tutorName: selectedTutor ? `${selectedTutor.firstName} ${selectedTutor.lastName}` : ""
                                            }));
                                        }}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none focus:border-orange-500"
                                    >
                                        <option value="">Select a tutor...</option>
                                        {tutors.map((tutor) => (
                                            <option key={tutor._id} value={tutor._id}>
                                                {tutor.firstName} {tutor.lastName} - {tutor.role}
                                            </option>
                                        ))}
                                    </select>

                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                                    <input
                                        type="text"
                                        value={newGroup.groupName}
                                        onChange={(e) => setNewGroup(prev => ({ ...prev, groupName: e.target.value }))}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none focus:border-orange-500"
                                        placeholder="e.g., Morning Barista Batch A"
                                    />
                                </div>

                                {/* Add these inputs to the Create Group Modal */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                                        <input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none focus:border-orange-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                                        <input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none focus:border-orange-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Capacity</label>
                                    <input
                                        type="number"
                                        value={newGroup.maxCapacity}
                                        onChange={(e) => setNewGroup(prev => ({ ...prev, maxCapacity: parseInt(e.target.value) }))}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none focus:border-orange-500"
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setShowCreateGroup(false)}
                                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateGroup}
                                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 cursor-pointer"
                                >
                                    Create Group
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                {/* Edit Group Modal */}
                {showEditModal && editingGroup && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <h3 className="text-xl font-semibold text-gray-800 mb-6">Edit Group</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Tutor</label>
                                    <select
                                        value={editingGroup.tutorId}
                                        onChange={(e) => setEditingGroup(prev => ({ ...prev, tutorId: e.target.value }))}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none focus:border-orange-500"
                                    >
                                        <option value="">Select a tutor...</option>
                                        {tutors.map((tutor) => (
                                            <option key={tutor._id} value={tutor._id}>
                                                {tutor.firstName} {tutor.lastName} - {tutor.role}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                                    <input
                                        type="text"
                                        value={editingGroup.groupName}
                                        onChange={(e) => setEditingGroup(prev => ({ ...prev, groupName: e.target.value }))}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none focus:border-orange-500"
                                        placeholder="e.g., Morning Barista Batch A"
                                    />
                                </div>

                                {/* FIXED: Use editingGroup.startTime and editingGroup.endTime directly */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                                        <input
                                            type="time"
                                            value={editingGroup.startTime || "08:00"}
                                            onChange={(e) => setEditingGroup(prev => ({ ...prev, startTime: e.target.value }))}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none focus:border-orange-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                                        <input
                                            type="time"
                                            value={editingGroup.endTime || "11:00"}
                                            onChange={(e) => setEditingGroup(prev => ({ ...prev, endTime: e.target.value }))}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none focus:border-orange-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Capacity</label>
                                    <input
                                        type="number"
                                        value={editingGroup.maxCapacity}
                                        onChange={(e) => setEditingGroup(prev => ({ ...prev, maxCapacity: parseInt(e.target.value) }))}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none focus:border-orange-500"
                                        min="1"
                                        max="50"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowEditModal(false)
                                        setEditingGroup(null)
                                    }}
                                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEditGroup}
                                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 cursor-pointer flex items-center gap-2"
                                >
                                  {isEditingGroup ? <LoadingSpinner size={20}/> : ''} Update Group
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* View Students Modal */}
                {showStudentsModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                            <h3 className="text-xl font-semibold text-orange-800 mb-4 uppercase font-bold">Students in Group <span className="capitalize">({selectedGroupStudents.length} Students)</span> </h3>

                            {selectedGroupStudents.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No students assigned to this group</p>
                            ) : (
                                <div className="space-y-3">
                                    {selectedGroupStudents.map((student) => (
                                        <div key={student._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-800">
                                                    {student.firstName} {student.lastName}
                                                </p>
                                                <p className="text-sm text-gray-600">{student.admissionNumber} - {student.courseName}</p>
                                            </div>
                                            <button
                                                onClick={() => openTransferModal(student)}
                                                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 cursor-pointer"
                                            >
                                                Transfer
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={() => setShowStudentsModal(false)}
                                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Transfer Student Modal */}
                {showTransferModal && studentToTransfer && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                Transfer {studentToTransfer.firstName} {studentToTransfer.lastName}
                            </h3>

                            <div className="mb-4 p-3 bg-gray-50 rounded-lg bg-orange-50 border border-orange-200">
                                <p className="font-medium">{studentToTransfer.admissionNumber}</p>
                                <p className="text-sm text-gray-600">{studentToTransfer.courseName}</p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Target Group</label>
                                <select
                                    value={targetGroup}
                                    onChange={(e) => setTargetGroup(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none focus:border-orange-500"
                                >
                                    <option value="">Select a group...</option>
                                    {groups
                                        .filter(group => group._id !== studentToTransfer.currentGroupId) // Exclude current group
                                        .map((group) => (
                                            <option key={group._id} value={group._id}>
                                                {group.groupName} - {group.tutorId.firstName} {group.tutorId.lastName}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowTransferModal(false)
                                        setStudentToTransfer(null)
                                        setTargetGroup("")
                                    }}
                                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleTransferStudent}
                                    disabled={!targetGroup}
                                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    Transfer Student
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                {/* Assign Students Modal */}
                {showAssignModal && selectedGroup && (
                    <AssignStudentsModal
                        group={selectedGroup}
                        students={filteredStudents}
                        onAssign={handleAssignStudents}
                        onClose={() => {
                            setShowAssignModal(false)
                            setSelectedGroup(null)
                        }}
                    />
                )}
            </div>
        </div>
    )
}

function StatCard({ title, value, bgColor, icon }) {
    return (
        <div className={`${bgColor} rounded-lg p-6 shadow-lg flex items-center gap-4`}>
            <div className="text-4xl text-white opacity-80">
                {icon}
            </div>
            <div>
                <h2 className="text-sm font-medium text-white opacity-90 mb-1">{title}</h2>
                <p className="text-3xl font-bold text-white">{value}</p>
            </div>
        </div>
    )
}

function AssignStudentsModal({ group, students, onAssign, onClose }) {
    const [selectedStudents, setSelectedStudents] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState("");
    const [courseFilter, setCourseFilter] = useState("");
    const [sortBy, setSortBy] = useState("name");

    // Get unique courses from students
    const availableCourses = [...new Set(students.map(student => student.courseName))].filter(Boolean);

    // Filter and sort students
    const filteredStudents = students
        .filter(student => {
            // Search filter
            const matchesSearch = searchTerm === "" ||
                student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase());

            // Course filter
            const matchesCourse = courseFilter === "" || student.courseName === courseFilter;

            return matchesSearch && matchesCourse;
        })
        .sort((a, b) => {
            // Sorting
            switch (sortBy) {
                case "name":
                    return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
                case "admission":
                    return a.admissionNumber.localeCompare(b.admissionNumber);
                case "course":
                    return a.courseName.localeCompare(b.courseName);
                default:
                    return 0;
            }
        });

    const handleStudentToggle = (studentId) => {
        setSelectedStudents(prev => {
            const newSet = new Set(prev);
            if (newSet.has(studentId)) {
                newSet.delete(studentId);
            } else {
                newSet.add(studentId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedStudents.size === filteredStudents.length) {
            // Deselect all
            setSelectedStudents(new Set());
        } else {
            // Select all filtered students
            const allFilteredIds = new Set(filteredStudents.map(student => student._id));
            setSelectedStudents(allFilteredIds);
        }
    };

    const handleAssign = () => {
        onAssign(Array.from(selectedStudents));
    };

    const clearFilters = () => {
        setSearchTerm("");
        setCourseFilter("");
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">
                        Assign Students to {group.groupName}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <LuTrash2 size={20} />
                    </button>
                </div>

                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div><span className="font-medium">Time:</span> {group.timeSlot}</div>
                        <div><span className="font-medium">Capacity:</span> {group.currentCapacity || 0}/{group.maxCapacity}</div>
                        <div><span className="font-medium">Available:</span> {group.maxCapacity - (group.currentCapacity || 0)}</div>
                        <div><span className="font-medium">Selected:</span> {selectedStudents.size}</div>
                    </div>
                </div>

                {/* Filter Controls */}
                <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                    {/* Search Input */}
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search Students</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by name or admission..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-2 pl-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none focus:border-orange-500"
                            />
                            <LuSearch className="absolute right-3 top-2.5 text-gray-400" size={18} />
                        </div>
                    </div>

                    {/* Course Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Course</label>
                        <select
                            value={courseFilter}
                            onChange={(e) => setCourseFilter(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none focus:border-orange-500"
                        >
                            <option value="">All Courses</option>
                            {availableCourses.map((course) => (
                                <option key={course} value={course}>{course}</option>
                            ))}
                        </select>
                    </div>

                    {/* Sort Options */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none focus:border-orange-500"
                        >
                            <option value="name">Name</option>
                            <option value="admission">Admission Number</option>
                            <option value="course">Course</option>
                        </select>
                    </div>
                </div>

                {/* Clear Filters Button */}
                {(searchTerm || courseFilter) && (
                    <div className="mb-3 flex justify-end">
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                        >
                            <LuTrash2 size={14} />
                            Clear Filters
                        </button>
                    </div>
                )}

                {/* Select All Controls */}
                {filteredStudents.length > 0 && (
                    <div className="mb-3 flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
                                onChange={handleSelectAll}
                                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700">
                                Select all {filteredStudents.length} filtered students
                            </span>
                        </div>
                        <span className="text-sm text-gray-500">
                            {selectedStudents.size} selected
                        </span>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto">
                    {filteredStudents.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <LuUsers className="mx-auto text-6xl mb-4" />
                            <p>
                                {students.length === 0
                                    ? "No available students for this group"
                                    : "No students match your filters"
                                }
                            </p>
                            {(searchTerm || courseFilter) && students.length > 0 && (
                                <button
                                    onClick={clearFilters}
                                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    Clear filters to see all students
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filteredStudents.map((student) => (
                                <div
                                    key={student._id}
                                    className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedStudents.has(student._id)
                                        ? "border-orange-500 bg-orange-50"
                                        : "border-gray-200 hover:border-gray-300"
                                        }`}
                                    onClick={() => handleStudentToggle(student._id)}
                                >
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedStudents.has(student._id)}
                                            onChange={() => handleStudentToggle(student._id)}
                                            className="w-4 h-4 text-orange-600 mt-1"
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-800">
                                                {student.firstName} {student.lastName}
                                            </h4>
                                            <div className="mt-1 space-y-1 text-sm text-gray-600">
                                                <p><span className="font-medium">Admission:</span> {student.admissionNumber}</p>
                                                <p><span className="font-medium">Course:</span> {student.courseName}</p>
                                                {student.startDate && (
                                                    <p><span className="font-medium">Start Date:</span> {format(new Date(student.startDate), "MMM d, yyyy")}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                        Showing {filteredStudents.length} of {students.length} students
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAssign}
                            disabled={selectedStudents.size === 0}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Assign {selectedStudents.size} Students
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}