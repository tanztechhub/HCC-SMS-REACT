import { Edit2, Trash2, Users } from "lucide-react"

export default function CourseCard({ course, onEdit, onDelete, disabled }) {
  return (
    <div className={`relative p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow ${course.cardColor} group`}>
      <div className="absolute top-4 right-4 flex gap-2 transition-opacity">
      <button
          onClick={() => onEdit(course)}
          disabled={disabled}
          className="p-2 bg-white/20 cursor-pointer hover:bg-white/30 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Edit2 className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={() => onDelete(course._id)}
          disabled={disabled}
          className="p-2 bg-white/20 cursor-pointer hover:bg-white/30 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4 text-white" />
        </button>
      </div>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">{course.icon}</div>
        <div className="flex-1">
          <h3 className="text-2xl font-semibold text-white mb-1">{course.name}</h3>
          <p className="text-white/80 text-md mb-4">{course.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/80 bg-gray-600/35 px-10 py-3 rounded-md text-xl font-bold">
              <Users className="w-4 h-4" />
              <span>{course.enrolledStudents || 0} Students</span>
            </div>
            <div className="flex gap-4">
              <div className="text-white/80 border rounded-md p-3">
              {course.examScheme.map((exam,index) => (
                <p className="text-lg flex justify-between gap-4" key={index}>
                  <span>{exam.name}</span> 
                  <span>{exam.weight}%</span> 
                  </p>
              ))}
              </div>
              <div className="text-white/80 border rounded-md p-3">
                <div className="text-lg">Duration</div>
                <div className="text-xl font-bold capitalize">{course.duration}</div>
              </div>
              <div className="text-white/80 border rounded-md p-3">
                <div className="text-lg">Fee</div>
                <div className="text-xl font-bold">KSH {course.fee.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

