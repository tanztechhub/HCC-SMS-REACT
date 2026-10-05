import ImportedStudentDetails from "../../../components/ImportedStudentDetails"
import { X } from "lucide-react"

export default function QuickViewModal({ student, onClose }) {
  return (
    <div className="hcc-records-modal-overlay">
      <div className="hcc-records-modal" role="dialog" aria-modal="true" aria-label="Student record details">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Student Details</h2>
          <button aria-label="Close details" onClick={onClose} className="text-gray-500 hover:text-gray-700 cursor-pointer">
            <X className="h-6 w-6" />
          </button>
        </div>
        <ImportedStudentDetails source={student.importSource} />
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
            <p>{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "-"}</p>
          </div>
          <div>
            <p className="font-semibold text-orange-800">Course:</p>
            <p>{student.courseName}</p>
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
          <div>
            <p className="font-semibold text-orange-800">ID Number:</p>
            <p>{student.nationalId}</p>
          </div>
          <div className="col-span-2">
            <p className="font-semibold text-orange-800">Emergency Contact:</p>
            <p>{`Name: ${student.emergencyContact.firstName} ${student.emergencyContact.lastName}`}</p>
            <p>{`Relation: ${student.emergencyContact.relation}`}</p>
            <p>{`Phone: ${student.emergencyContact.phone}`}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

