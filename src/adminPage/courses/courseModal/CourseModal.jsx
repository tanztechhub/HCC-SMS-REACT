import { useState, useEffect } from "react"
import { Plus, Trash2, X } from "lucide-react"
import LoadingSpinner from "../../../components/loadingSpinner/LoadingSpinner"

export default function CourseModal({ isOpen, onClose, course, onSave, isSubmitting }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
    fee: "",
    cardColor: "bg-blue-500",
    examScheme: []
  })

  useEffect(() => {
    if (course) {
      setFormData({
        ...course,
        examScheme: course.examScheme || []
      })
    } else {
      setFormData({
        name: "",
        description: "",
        duration: "",
        fee: "",
        cardColor: "bg-blue-500",
        examScheme: []
      })
    }
  }, [course, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    // Convert exam weights to numbers
    const formattedData = {
      ...formData,
      examScheme: formData.examScheme.map(exam => ({
        ...exam,
        weight: Number(exam.weight)
      }))
    }
    onSave(formattedData)
  }


  const handleExamChange = (index, field, value) => {
    const newExamScheme = [...formData.examScheme]
    newExamScheme[index] = {
      ...newExamScheme[index],
      [field]: value
    }
    setFormData({ ...formData, examScheme: newExamScheme })
  }

  const addExam = () => {
    setFormData({
      ...formData,
      examScheme: [...formData.examScheme, { name: "", weight: "" }]
    })
  }

  const removeExam = (index) => {
    if (formData.examScheme.length > 0) {
      const newExamScheme = formData.examScheme.filter((_, i) => i !== index)
      setFormData({ ...formData, examScheme: newExamScheme })
    }
  }

  if (!isOpen) return null

  const colorOptions = [
    { value: "bg-blue-500", label: "Blue" },
    { value: "bg-purple-500", label: "Purple" },
    { value: "bg-yellow-500", label: "Yellow" },
    { value: "bg-pink-500", label: "Pink" },
    { value: "bg-orange-500", label: "Green" },
    { value: "bg-orange-500", label: "Orange" },
  ]

  return (
    <div className="hcc-course-modal-overlay">
      <div className="hcc-course-modal" role="dialog" aria-modal="true" aria-labelledby="hcc-course-modal-title">
        <div className="flex items-center justify-between mb-4">
          <h2 id="hcc-course-modal-title" className="text-xl font-semibold">{course ? "Edit Course" : "Add New Course"}</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cc4400]"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cc4400]"
              rows="3"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cc4400]"
                placeholder="e.g. 5 weeks"
                disabled={isSubmitting}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fee (KSH)</label>
              <input
                type="number"
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cc4400]"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Card Color</label>
            <select
              value={formData.cardColor}
              onChange={(e) => setFormData({ ...formData, cardColor: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cc4400]"
              disabled={isSubmitting}
            >
              {colorOptions.map((color) => (
                <option key={color.value} value={color.value}>
                  {color.label}
                </option>
              ))}
            </select>
          </div>


          {/* New Exam Scheme Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Exam Scheme</label>
              <button
                type="button"
                onClick={addExam}
                disabled={isSubmitting}
                className="text-sm px-2 py-1 bg-[#cc4400] text-white rounded-lg hover:bg-[#cc4400]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Exam
              </button>
            </div>

            <p className="hcc-course-modal-hint">Optional. Add assessment weights only when they are confirmed.</p>
            {formData.examScheme.map((exam, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={exam.name}
                  onChange={(e) => handleExamChange(index, "name", e.target.value)}
                  placeholder="Exam Name"
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cc4400]"
                  disabled={isSubmitting}
                  required
                />
                <input
                  type="number"
                  value={exam.weight}
                  onChange={(e) => handleExamChange(index, "weight", e.target.value)}
                  placeholder="Weight %"
                  className="w-24 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cc4400]"
                  min="1"
                  max="100"
                  disabled={isSubmitting}
                  required
                />
                {formData.examScheme.length > 0 && (
                  <button
                    type="button"
                    aria-label={`Remove exam ${index + 1}`}
                    onClick={() => removeExam(index)}
                    disabled={isSubmitting}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#cc4400] text-white rounded-lg hover:bg-[#cc4400]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size={20} />
                  <span>{course ? "Saving..." : "Adding..."}</span>
                </>
              ) : (
                <span>{course ? "Save Changes" : "Add Course"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

