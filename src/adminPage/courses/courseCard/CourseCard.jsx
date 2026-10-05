import { Edit2, Trash2, Users, BookOpen } from "lucide-react"

export default function CourseCard({ course, onEdit, onDelete, disabled }) {
  return (
    <article className="hcc-course-card">
      <div className={`hcc-course-accent ${course.cardColor || "bg-orange-500"}`} />
      <div className="hcc-course-card-head">
        <span className="hcc-course-icon" aria-hidden="true"><BookOpen size={20} /></span>
        <div className="hcc-course-actions">
          <button type="button" onClick={() => onEdit(course)} disabled={disabled} aria-label={`Edit ${course.name}`} title="Edit course"><Edit2 size={16} /></button>
          <button type="button" onClick={() => onDelete(course._id)} disabled={disabled} aria-label={`Delete ${course.name}`} title="Delete course" className="hcc-course-delete"><Trash2 size={16} /></button>
        </div>
      </div>
      <h2>{course.name}</h2>
      <p className="hcc-course-description">{course.description}</p>
      <dl className="hcc-course-details">
        <div><dt>Course fee</dt><dd className="hcc-course-fee">KES {Number(course.fee).toLocaleString("en-KE")}</dd></div>
        <div><dt>Duration</dt><dd>{course.duration}</dd></div>
      </dl>
      {course.examScheme?.length > 0 && <div className="hcc-course-exams"><h3>Assessment</h3>{course.examScheme.map((exam, index) => <p key={exam._id || index}><span>{exam.name}</span><strong>{exam.weight}%</strong></p>)}</div>}
      <footer className="hcc-course-footer"><Users size={15} aria-hidden="true" /><span>{course.enrolledStudents || 0} enrolled students</span></footer>
    </article>
  )
}
