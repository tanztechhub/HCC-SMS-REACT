import "./Courses.css"
import { useState, useEffect } from "react"
import { Coffee, BookOpen, PenTool, Target, CirclePlus } from "lucide-react"
import { LuRefreshCw } from "react-icons/lu";
import { toast } from "react-hot-toast"
import CourseCard from "./courseCard/CourseCard"
import CourseModal from "./courseModal/CourseModal"
import LoadingSpinner from "../../components/loadingSpinner/LoadingSpinner"
const API_URL = import.meta.env.VITE_API_URL

// Icon mapping for courses
const courseIcons = {
  default: <Coffee className="w-6 h-6 text-white" />,
  roasting: <BookOpen className="w-6 h-6 text-white" />,
  art: <PenTool className="w-6 h-6 text-white" />,
  advanced: <Target className="w-6 h-6 text-white" />,
}

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [search, setSearch] = useState("")
  const [loadError, setLoadError] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_URL}/courses`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch courses")
      }

      // Add icons to courses
      const coursesWithIcons = data.map((course) => ({
        ...course,
        icon: courseIcons[course.iconType] || courseIcons.default,
      }))
      toast.success("Courses fetched successfully")
      setCourses(coursesWithIcons)
    } catch (error) {
      setLoadError(error.message)
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCourse = () => {
    setSelectedCourse(null)
    setIsModalOpen(true)
  }

  const handleEditCourse = (course) => {
    setSelectedCourse(course)
    setIsModalOpen(true)
  }

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_URL}/courses/${courseId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete course")
      }

      toast.success("Course deleted successfully")
      setCourses(courses.filter((course) => course._id !== courseId))
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveCourse = async (courseData) => {
    setIsSubmitting(true)
    try {
      if (selectedCourse) {
        // Update existing course
        const response = await fetch(`${API_URL}/courses/${selectedCourse._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(courseData),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to update course")
        }

        setCourses(
          courses.map((course) =>
            course._id === selectedCourse._id
              ? { ...data.course, icon: courseIcons[data.course.iconType] || courseIcons.default }
              : course,
          ),
        )
        toast.success("Course updated successfully")
      } else {
        // Create new course
        const response = await fetch(`${API_URL}/courses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(courseData),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to create course")
        }

        const newCourse = {
          ...data.course,
          icon: courseIcons[data.course.iconType] || courseIcons.default,
        }
        setCourses([...courses, newCourse])
        toast.success("Course created successfully")
      }
      setIsModalOpen(false)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }


  const visibleCourses = courses.filter((course) => `${course.name} ${course.description}`.toLowerCase().includes(search.toLowerCase()))
  return (
    <div className="hcc-courses">
      <header className="hcc-courses-heading">
        <div><p className="hcc-courses-eyebrow">02 / ACADEMIC PROGRAMMES</p><h1>Courses</h1><p>Manage course offerings, fees and assessment details.</p></div>
        <div className="hcc-courses-toolbar">
          <button type="button" className="hcc-courses-button" disabled={isLoading || isSubmitting} onClick={fetchCourses}><LuRefreshCw size={16} />Refresh</button>
          <button type="button" className="hcc-courses-button hcc-courses-button-primary" disabled={isSubmitting} onClick={handleAddCourse}><CirclePlus size={16} />Add course</button>
        </div>
      </header>
      <div className="hcc-courses-filter"><span>{courses.length} course{courses.length === 1 ? "" : "s"} available</span><input type="search" aria-label="Search courses" placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      {isLoading ? <div className="hcc-courses-empty" role="status">Loading courses...</div> : loadError ? <div className="hcc-courses-empty" role="alert">{loadError} <button type="button" className="hcc-courses-button" onClick={fetchCourses}>Try again</button></div> : visibleCourses.length === 0 ? <div className="hcc-courses-empty">{search ? "No courses match your search." : "No courses yet. Add your first course to get started."}</div> : <div className="hcc-courses-grid">{visibleCourses.map((course) => <CourseCard key={course._id} course={course} onEdit={handleEditCourse} onDelete={handleDeleteCourse} disabled={isSubmitting} />)}</div>}
      <CourseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} course={selectedCourse} onSave={handleSaveCourse} isSubmitting={isSubmitting} />
    </div>
  )
}
