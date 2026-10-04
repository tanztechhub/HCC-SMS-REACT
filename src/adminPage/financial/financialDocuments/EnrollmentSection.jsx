"use client"

import { UserPlus, GraduationCap, Users, BookUser } from "lucide-react"

const StatTile = ({ icon, label, value, subValue, accent }) => (
    <div className="rounded-md border border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2 mb-1">
            <span className={accent}>{icon}</span>
            <p className="text-xs text-gray-500">{label}</p>
        </div>
        <p className="text-lg font-bold text-gray-900">{value}</p>
        {subValue && <p className="text-xs text-gray-400 mt-0.5">{subValue}</p>}
    </div>
)

export default function EnrollmentSection({ enrollment }) {
    const { newInPeriod, currentActiveStudents, totalAlumni } = enrollment

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-baseline justify-between mb-1">
                <h2 className="text-lg font-semibold">Enrollment</h2>
            </div>
            <p className="text-xs text-gray-400 mb-3">
                Based on each student's start date (falling back to admission date), checked against both the active
                Students collection and the Alumni collection, since graduated students move out of Students entirely.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <StatTile
                    icon={<UserPlus className="h-4 w-4" />}
                    label="New Students This Period"
                    value={newInPeriod.total}
                    accent="text-indigo-600"
                />
                <StatTile
                    icon={<Users className="h-4 w-4" />}
                    label="Still Active"
                    value={newInPeriod.stillActive}
                    subValue="of the new students above"
                    accent="text-orange-600"
                />
                <StatTile
                    icon={<GraduationCap className="h-4 w-4" />}
                    label="Already Graduated"
                    value={newInPeriod.graduated}
                    subValue="of the new students above"
                    accent="text-purple-600"
                />
                <StatTile
                    icon={<BookUser className="h-4 w-4" />}
                    label="Current Totals"
                    value={currentActiveStudents}
                    subValue={`${totalAlumni} alumni all-time`}
                    accent="text-gray-600"
                />
            </div>
        </div>
    )
}
