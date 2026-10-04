import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { format } from "date-fns"
import { LuRefreshCw } from "react-icons/lu"
import LoadingSpinner from "../../../components/loadingSpinner/LoadingSpinner"
import { FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa"

const API_URL = import.meta.env.VITE_API_URL

export default function CohortManagement() {
    const [students, setStudents] = useState([])
    const [tutors, setTutors] = useState([])
    const [cohorts, setCohorts] = useState([])
    const [selectedCohort, setSelectedCohort] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState({
        totalStudents: 0,
        assignedStudents: 0,
        pendingStudents: 0,
    })

    // Remove separate fetchTutors function and update useEffect
    useEffect(() => {
        fetchStudents()
    }, [])

    // Update fetchStudents to pass data to processTutorData
    const fetchStudents = async () => {
        try {
            setIsLoading(true)
            const response = await fetch(`${API_URL}/students`)
            const data = await response.json()
            if (data.success) {
                const allStudents = data.data
                const assignedStudents = allStudents.filter(
                    (student) => student.allotment === "assigned"
                )
                setStudents(assignedStudents)
                processStudentData(allStudents)
                // Fetch tutors after getting students
                const tutorResponse = await fetch(`${API_URL}/tutors`)
                const tutorData = await tutorResponse.json()
                if (tutorData.success) {
                    setTutors(tutorData.data)
                    processTutorData(tutorData.data, assignedStudents)
                    toast.success("Data Fetched Successfully")
                }
            }
        } catch (error) {
            toast.error(`Error fetching data: ${error.message}`)
            console.error("Error:", error)
        } finally {
            setIsLoading(false)
        }
    }



    const processStudentData = (allStudents) => {
        const totalStudents = allStudents.length
        const assignedStudents = allStudents.filter((student) => student.allotment === "assigned").length
        const pendingStudents = totalStudents - assignedStudents

        setStats({ totalStudents, assignedStudents, pendingStudents })
    }

    // Modify processTutorData to accept students as a parameter
    const processTutorData = (tutorsData, currentStudents) => {
        // Create a map of tutors by ID for easy lookup
        const tutorsById = tutorsData.reduce((acc, tutor) => {
            acc[tutor._id] = tutor;
            return acc;
        }, {});

        // Create cohort groups based on both startDate AND tutorId
        const cohortGroups = {};

        currentStudents.forEach((student) => {
            if (student.startDate && student.tutorId) {
                // Create a unique cohort key combining startDate and tutorId
                const cohortKey = `${student.startDate}-${student.tutorId}`;

                if (!cohortGroups[cohortKey]) {
                    // Get the tutor object
                    const tutor = tutorsById[student.tutorId];

                    cohortGroups[cohortKey] = {
                        startDate: student.startDate,
                        tutorId: student.tutorId,
                        tutors: tutor ? [tutor] : [],
                        students: []
                    };
                }

                cohortGroups[cohortKey].students.push(student);
            }
        });

        // Convert the object to an array
        const cohortsArray = Object.values(cohortGroups);

        setCohorts(cohortsArray);
        if (cohortsArray.length > 0 && !selectedCohort) {
            setSelectedCohort(cohortsArray[0]);
        }
    };

    const handleCohortSelect = (cohort) => {
        setSelectedCohort(cohort)
    }

    const handleChangeCohort = async (studentId, newCohortValue) => {
        console.log(`newCohortValue`, newCohortValue);
        setIsLoading(true);
        try {
            // Parse the combined value
            const [newCohortStartDate, newTutorId] = newCohortValue.split('~');
            console.log(`newCohortStartDate`, newCohortStartDate);
            console.log(`newTutorId`, newTutorId);

            const response = await fetch(`${API_URL}/classes/change-cohort`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    studentId,
                    newCohortStartDate,
                    newTutorId
                }),
            });

            const data = await response.json();
            if (data.success) {
                fetchStudents();  // Refresh students list
                toast.success(data.message);
            } else {
                throw new Error(data.message || "Failed to change student cohort");
            }
        } catch (error) {
            toast.error(`Error changing student cohort: ${error.message}`);
            console.error("Error changing student cohort:", error);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Cohort Management</h1>
                    <button
                        onClick={fetchStudents}
                        className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        disabled={isLoading}
                    >
                        {isLoading ? <LoadingSpinner size={20} /> : <LuRefreshCw />}
                        Refresh Data
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard title="Total Students" value={stats.totalStudents} icon={<FaUserGraduate />} />
                    <StatCard title="Assigned Students" value={stats.assignedStudents} icon={<FaUserGraduate />} color="green" />
                    <StatCard title="Pending Students" value={stats.pendingStudents} icon={<FaUserGraduate />} color="yellow" />
                </div>

                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Current Cohorts</h2>
                    <div className="flex flex-wrap gap-4">
                        {cohorts.map((cohort) => {
                            return (<CohortCard
                                key={cohort.startDate}
                                cohort={cohort}
                                isSelected={selectedCohort?.startDate === cohort.startDate && selectedCohort.tutorId === cohort.tutorId}
                                onSelect={() => handleCohortSelect(cohort)}
                            />)
                        })}
                    </div>
                </div>

                {selectedCohort && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            Students in Cohort: <span className="font-bold text-orange-800">{format(new Date(selectedCohort.startDate), "MMMM d, yyyy")}</span>
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Admission Number
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
                                    {selectedCohort.students.map((student) => (
                                        <tr key={student._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <img
                                                            className="h-10 w-10 rounded-full"
                                                            src={student.profileImage || "/profile/student.jpg"}
                                                            alt=""
                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {student.firstName} {student.lastName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">{student.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.admissionNumber}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.courseName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <select
                                                    onChange={(e) => handleChangeCohort(student._id, e.target.value)}
                                                    className="cursor-pointer mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                >
                                                    <option value="">Change Cohort</option>
                                                    {cohorts.map((cohort) => {
                                                        const tutorName = cohort.tutors.length > 0
                                                            ? `${cohort.tutors[0].firstName} ${cohort.tutors[0].lastName}`
                                                            : "No Tutor";

                                                        return (
                                                            <option
                                                                key={`${cohort.startDate}-${cohort.tutorId}`}
                                                                value={`${cohort.startDate}~${cohort.tutorId}`}
                                                            >
                                                                {format(new Date(cohort.startDate), "MMM d, yyyy")} - {tutorName}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function StatCard({ title, value, icon, color = "blue" }) {
    return (
        <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-${color}-500`}>
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
                    <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
                </div>
                <div className={`text-${color}-500 text-4xl`}>{icon}</div>
            </div>
        </div>
    )
}

function CohortCard({ cohort, isSelected, onSelect }) {
    // Get the primary tutor name (first tutor in the array)
    const tutorName = cohort.tutors.length > 0
        ? `${cohort.tutors[0].firstName} ${cohort.tutors[0].lastName}`
        : "No Tutor";

    return (
        <div
            className={`p-4 rounded-lg shadow-md cursor-pointer transition-all ${isSelected ? "bg-blue-100 border-2 border-blue-500" : "bg-white hover:bg-gray-50"
                }`}
            onClick={onSelect}
        >
            <h3 className="text-lg font-semibold mb-1">
                {format(new Date(cohort.startDate), "MMMM d, yyyy")}
            </h3>
            <h4 className="text-md font-medium text-blue-600 mb-2">
                Tutor: {tutorName}
            </h4>
            <p className="text-sm text-gray-600">Students: {cohort.students.length}</p>

            <div className="mt-2">
                {cohort.tutors.map((tutor) => (
                    <div key={tutor._id} className="flex items-center text-sm text-gray-500">
                        <FaChalkboardTeacher className="mr-1" />
                        {tutor.firstName} {tutor.lastName}
                    </div>
                ))}
            </div>
        </div>
    );
}

