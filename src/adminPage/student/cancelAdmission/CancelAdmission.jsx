"use client"

import { useState } from "react"
import { toast } from "react-hot-toast"
import LoadingSpinner from "../../../components/loadingSpinner/LoadingSpinner"

const API_URL = import.meta.env.VITE_API_URL;

export default function CancelAdmission() {
  const [admissionNumber, setAdmissionNumber] = useState("")
  const [student, setStudent] = useState(null)
  const [apiResponse, setApiResponse] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!admissionNumber.trim()) {
      toast.error("Please enter an admission number");
      return;
    }
  
    setIsLoading(true);
    const encodedAdmissionNumber = encodeURIComponent(admissionNumber); // Encode the value
  
    try {
      const response = await fetch(`${API_URL}/students/${encodedAdmissionNumber}`);
      const data = await response.json();
  
      if (data.success) {
        setApiResponse(data.success);
        setStudent(data.data);
      } else {
        setApiResponse(data.success);
        toast.error(data.message || "Student not found");
        setStudent(null);
      }
    } catch (error) {
      console.error("Error fetching student:", error);
      toast.error("Failed to fetch student information");
      setStudent(null);
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleCancelAdmission = async () => {
    setIsCancelling(true);
    
    try {
      const response = await fetch(`${API_URL}/students/${student._id}/cancel-admission`, {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        toast.success("Admission cancelled successfully")
        setStudent(null)
        setAdmissionNumber("")
      } else {
        throw new Error(data.message || "Failed to cancel admission")
      }
    } catch (error) {
      console.error("Error cancelling admission:", error)
      toast.error(error.message || "Failed to cancel admission")
    } finally {
      setIsCancelling(false)
      setIsDialogOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl text-center font-bold text-gray-800 mb-8">Cancel Admission</h1>
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-2">Student Lookup</h2>
          <p className="text-gray-600 mb-4">Enter the admission number to find a student</p>
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Enter Admission Number"
                value={admissionNumber}
                onChange={(e) => setAdmissionNumber(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-orange-500 cursor-pointer text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? <LoadingSpinner size={20} /> : "Search"}
            </button>
          </form>
        </div>

        {student && (
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto mt-8">
            <h2 className="text-xl font-semibold mb-4">Student Information</h2>
            <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 flex items-center space-x-4">
            <img
              src={student.profileImage || "/profile/student.jpg"}
              alt={`${student.firstName} ${student.lastName}`}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <h3 className="text-xl font-semibold">{`${student.firstName} ${student.lastName}`}</h3>
              <p className="text-gray-600">{student.admissionNumber}</p>
            </div>
          </div>
          <div>
            <p className="font-semibold text-orange-800">Gender:</p>
            <p className="capitalize">{student.gender}</p>
          </div>
          <div>
            <p className="font-semibold text-orange-800">Date of Birth:</p>
            <p>{new Date(student.dateOfBirth).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="font-semibold text-orange-800">Course:</p>
            <p>{student.course}</p>
          </div>
          <div>
            <p className="font-semibold text-orange-800">Academic Year:</p>
            <p>{student.academicYear}</p>
          </div>
          <div>
            <p className="font-semibold text-orange-800">Email:</p>
            <p>{student.email}</p>
          </div>
          <div>
            <p className="font-semibold text-orange-800">Phone Number:</p>
            <p>{student.phoneNumber}</p>
          </div>
          <div>
            <p className="font-semibold text-orange-800">Nationality:</p>
            <p>{student.nationality}</p>
          </div>
          <div className="col-span-2">
            <p className="font-semibold text-orange-800">Emergency Contact:</p>
            <p>{`Name: ${student.emergencyContact.firstName} ${student.emergencyContact.lastName}`}</p>
            <p>{`Relation: ${student.emergencyContact.relation}`}</p>
            <p>{`Phone: ${student.emergencyContact.phone}`}</p>
          </div>
        </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsDialogOpen(true)}
                className="px-4 py-2 bg-red-500 text-white cursor-pointer rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Cancel Admission
              </button>
            </div>
          </div>
        )}

        {!isLoading && !student && !apiResponse && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto mt-8">
            <div className="text-center text-yellow-800">
              <svg className="mx-auto h-12 w-12 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="mt-4 text-lg font-semibold">No student found with the given admission number.</p>
              <p className="mt-2">Please check the admission number and try again.</p>
            </div>
          </div>
        )}

        {student === null && !isLoading && !admissionNumber && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto mt-8">
            <div className="text-center text-orange-800">
              <svg className="mx-auto h-12 w-12 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="mt-4 text-lg font-semibold">Ready to search</p>
              <p className="mt-2">Enter an admission number above to find a student.</p>
            </div>
          </div>
        )}

        {isDialogOpen && (
          <div className="fixed inset-0 bg-orange-800/15 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">Confirm Admission Cancellation</h2>
              <p className="mb-4">
                Are you sure you want to cancel the admission for {student.firstName} {student.lastName}? This action
                cannot be undone.
              </p>
              <div className="flex items-center space-x-2 bg-amber-300/20 p-2 rounded-md text-yellow-600 mb-4">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p>This will permanently remove the student from the system.</p>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCancelAdmission}
                  disabled={isCancelling}
                  className="px-4 py-2 bg-red-500 cursor-pointer text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isCancelling ? <LoadingSpinner size={20} /> : "Confirm Cancellation"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

