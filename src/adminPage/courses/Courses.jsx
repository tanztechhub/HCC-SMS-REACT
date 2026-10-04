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


  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-orange-800">Our Courses</h1>
          <div className="flex gap-2">

            <button
              disabled={isLoading || isSubmitting}
              onClick={fetchCourses}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
            >
              {isLoading ? <LoadingSpinner size={15} /> : <LuRefreshCw />}
              Refresh List
            </button>
            <button
              onClick={handleAddCourse}
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#cc4400] flex items-center cursor-pointer gap-2 text-white rounded-lg hover:bg-[#cc4400]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CirclePlus />
              Add New Course
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onEdit={handleEditCourse}
              onDelete={handleDeleteCourse}
              disabled={isSubmitting}
            />
          ))}
        </div>

        <CourseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          course={selectedCourse}
          onSave={handleSaveCourse}
          isSubmitting={isSubmitting}
        />
      </div>
    </>
  )
}

