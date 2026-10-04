"use client"

import { useState } from "react"
import { format } from "date-fns"

export default function AssignmentModal({ isOpen, onClose, cohort, tutors, onAssign }) {
  const [selectedTutor, setSelectedTutor] = useState("")

  if (!isOpen || !cohort) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onAssign(selectedTutor)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Assign Cohort to Tutor</h2>
        <p className="mb-4">Cohort Start Date: {format(new Date(cohort.startDate), "MMMM d, yyyy")}</p>
        <p className="mb-4">Number of Students: {cohort.studentCount}</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="tutor" className="block text-sm font-medium text-gray-700">
              Select Tutor
            </label>
            <select
              id="tutor"
              value={selectedTutor}
              onChange={(e) => setSelectedTutor(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              required
            >
              <option value="">Choose a tutor</option>
              {tutors.map((tutor) => (
                <option key={tutor.id} value={tutor.id}>
                  {tutor.name} (Current Students: {tutor.currentStudents})
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              Assign
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

