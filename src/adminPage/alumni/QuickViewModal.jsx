import ImportedStudentDetails from "../../components/ImportedStudentDetails"
import { X } from "lucide-react"

export default function QuickViewModal({ alumnus, onClose }) {
  return (
    <div className="hcc-records-modal-overlay">
      <div className="hcc-records-modal" role="dialog" aria-modal="true" aria-label="Student record details">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Alumni Details</h2>
          <button aria-label="Close details" onClick={onClose} className="text-gray-500 hover:text-gray-700 cursor-pointer">
            <X className="h-6 w-6" />
          </button>
        </div>
        <ImportedStudentDetails source={alumnus.importSource} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-semibold">Name:</p>
            <p>{`${alumnus.firstName} ${alumnus.lastName}`}</p>
          </div>
          <div>
            <p className="font-semibold">Admission Number:</p>
            <p>{alumnus.admissionNumber}</p>
          </div>
          <div>
            <p className="font-semibold">Course:</p>
            <p>{alumnus.courseName}</p>
          </div>
          <div>
            <p className="font-semibold">Academic Year:</p>
            <p>{alumnus.academicYear}</p>
          </div>
          <div>
            <p className="font-semibold">Graduation Date:</p>
            <p>{alumnus.graduationDate ? new Date(alumnus.graduationDate).toLocaleDateString() : "-"}</p>
          </div>
          <div>
            <p className="font-semibold">Fee Paid:</p>
            <p>{alumnus.upfrontFee == null ? "-" : `Ksh. ${alumnus.upfrontFee.toLocaleString()}`}</p>
          </div>
          <div>
            <p className="font-semibold">Email:</p>
            <p>{alumnus.email}</p>
          </div>
          <div>
            <p className="font-semibold">Phone Number:</p>
            <p>{alumnus.phoneNumber}</p>
          </div>
          <div>
            <p className="font-semibold">Nationality:</p>
            <p>{alumnus.nationality}</p>
          </div>
          <div>
            <p className="font-semibold">Gender:</p>
            <p>{alumnus.gender}</p>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Exam Results</h3>
          {alumnus.exams && alumnus.exams.length > 0 ? (
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left">Exam</th>
                  <th className="text-left">Weight</th>
                  <th className="text-left">Score</th>
                </tr>
              </thead>
              <tbody>
                {alumnus.exams.map((exam, index) => (
                  <tr key={index}>
                    <td>{exam.name}</td>
                    <td>{exam.weight}</td>
                    <td>{exam.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No exam results available</p>
          )}
        </div>
      </div>
    </div>
  )
}

