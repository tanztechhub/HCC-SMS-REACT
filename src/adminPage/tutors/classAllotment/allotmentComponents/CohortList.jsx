import { format } from "date-fns"

export default function CohortList({ cohorts, onAssign }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Unassigned Cohorts</h2>
      {cohorts.map((cohort) => (
        <div key={cohort.id} className="mb-4 p-4 border rounded-lg">
          <h3 className="text-lg font-medium text-gray-800">
            Start Date: {format(new Date(cohort.startDate), "MMMM d, yyyy")}
          </h3>
          <p className="text-gray-600">Students: {cohort.studentCount}</p>
          <button
            onClick={() => onAssign(cohort)}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Assign Tutor
          </button>
        </div>
      ))}
    </div>
  )
}

