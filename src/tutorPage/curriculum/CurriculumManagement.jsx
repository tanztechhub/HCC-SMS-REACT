"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  BookOpenCheck,
} from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL

export default function CurriculumManagement() {
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [openCourses, setOpenCourses] = useState(new Set())

  const [addingSectionFor, setAddingSectionFor] = useState(null)
  const [newSectionTitle, setNewSectionTitle] = useState("")

  const [addingItemFor, setAddingItemFor] = useState(null)
  const [newItemTitle, setNewItemTitle] = useState("")

  const [editingSection, setEditingSection] = useState(null) // { id, title }
  const [editingItem, setEditingItem] = useState(null) // { id, title }

  useEffect(() => {
    fetchCurricula()
  }, [])

  const authHeaders = () => {
    const user = JSON.parse(localStorage.getItem("user"))
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user?.token}`,
    }
  }

  const fetchCurricula = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/curriculum`, {
        headers: authHeaders(),
      })
      const data = await response.json()
      if (data.success) {
        setCourses(data.data)
      } else {
        throw new Error(data.message || "Failed to fetch curriculum")
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleCourse = (courseId) => {
    setOpenCourses((prev) => {
      const next = new Set(prev)
      if (next.has(courseId)) {
        next.delete(courseId)
      } else {
        next.add(courseId)
      }
      return next
    })
  }

  const handleAddSection = async (courseId) => {
    if (!newSectionTitle.trim()) {
      toast.error("Please enter a section title")
      return
    }
    try {
      const response = await fetch(`${API_URL}/curriculum/course/${courseId}/section`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ title: newSectionTitle.trim() }),
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.message || "Failed to add section")

      toast.success("Section added successfully")
      setNewSectionTitle("")
      setAddingSectionFor(null)
      fetchCurricula()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleRenameSection = async (sectionId) => {
    if (!editingSection?.title.trim()) {
      toast.error("Section title cannot be empty")
      return
    }
    try {
      const response = await fetch(`${API_URL}/curriculum/section/${sectionId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ title: editingSection.title.trim() }),
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.message || "Failed to update section")

      toast.success("Section updated successfully")
      setEditingSection(null)
      fetchCurricula()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleDeleteSection = async (sectionId) => {
    if (!confirm("Delete this section and all its items?")) return
    try {
      const response = await fetch(`${API_URL}/curriculum/section/${sectionId}`, {
        method: "DELETE",
        headers: authHeaders(),
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.message || "Failed to delete section")

      toast.success("Section deleted successfully")
      fetchCurricula()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleAddItem = async (sectionId) => {
    if (!newItemTitle.trim()) {
      toast.error("Please enter an item title")
      return
    }
    try {
      const response = await fetch(`${API_URL}/curriculum/section/${sectionId}/item`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ title: newItemTitle.trim() }),
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.message || "Failed to add item")

      toast.success("Item added successfully")
      setNewItemTitle("")
      setAddingItemFor(null)
      fetchCurricula()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleRenameItem = async (itemId) => {
    if (!editingItem?.title.trim()) {
      toast.error("Item title cannot be empty")
      return
    }
    try {
      const response = await fetch(`${API_URL}/curriculum/item/${itemId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ title: editingItem.title.trim() }),
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.message || "Failed to update item")

      toast.success("Item updated successfully")
      setEditingItem(null)
      fetchCurricula()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (!confirm("Delete this curriculum item?")) return
    try {
      const response = await fetch(`${API_URL}/curriculum/item/${itemId}`, {
        method: "DELETE",
        headers: authHeaders(),
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.message || "Failed to delete item")

      toast.success("Item deleted successfully")
      fetchCurricula()
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <BookOpenCheck className="text-orange-800" size={28} />
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Curriculum</h1>
          <p className="text-gray-500 text-sm">
            Every course has one curriculum, shared by all tutors. Changes made here are visible to everyone immediately.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {courses.map((course) => {
          const isOpen = openCourses.has(course.courseId)
          const itemCount = course.sections.reduce((sum, s) => sum + s.items.length, 0)

          return (
            <div key={course.courseId} className="bg-white rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => toggleCourse(course.courseId)}
                className="w-full flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  <span className="font-semibold text-gray-800">{course.courseName}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {course.sections.length} section{course.sections.length !== 1 && "s"} · {itemCount} item{itemCount !== 1 && "s"}
                </span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 border-t border-gray-100">
                  {course.sections.length === 0 && (
                    <p className="text-sm text-gray-400 italic my-4">No curriculum sections yet.</p>
                  )}

                  <div className="space-y-5 mt-4">
                    {course.sections.map((section, sectionIdx) => (
                      <div key={section._id}>
                        <div className="flex items-center justify-between border-b-2 border-red-700 pb-1 mb-2">
                          {editingSection?.id === section._id ? (
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                autoFocus
                                value={editingSection.title}
                                onChange={(e) => setEditingSection({ id: section._id, title: e.target.value })}
                                onKeyDown={(e) => e.key === "Enter" && handleRenameSection(section._id)}
                                className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                              />
                              <button onClick={() => handleRenameSection(section._id)} className="text-orange-600 cursor-pointer">
                                <Check size={16} />
                              </button>
                              <button onClick={() => setEditingSection(null)} className="text-gray-400 cursor-pointer">
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <h3 className="font-bold text-red-700">
                                {sectionIdx + 1}. {section.title}
                              </h3>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => setEditingSection({ id: section._id, title: section.title })}
                                  className="text-gray-400 hover:text-orange-700 cursor-pointer"
                                  title="Rename section"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteSection(section._id)}
                                  className="text-gray-400 hover:text-red-600 cursor-pointer"
                                  title="Delete section"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>

                        <ul className="space-y-1 ml-2">
                          {section.items.map((item) => (
                            <li key={item._id} className="flex items-center justify-between group">
                              {editingItem?.id === item._id ? (
                                <div className="flex items-center gap-2 flex-1 py-1">
                                  <input
                                    autoFocus
                                    value={editingItem.title}
                                    onChange={(e) => setEditingItem({ id: item._id, title: e.target.value })}
                                    onKeyDown={(e) => e.key === "Enter" && handleRenameItem(item._id)}
                                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                                  />
                                  <button onClick={() => handleRenameItem(item._id)} className="text-orange-600 cursor-pointer">
                                    <Check size={14} />
                                  </button>
                                  <button onClick={() => setEditingItem(null)} className="text-gray-400 cursor-pointer">
                                    <X size={14} />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <span className="text-sm text-gray-700 flex items-center gap-2">
                                    <span className="text-gray-400">•</span> {item.title}
                                  </span>
                                  <div className="hidden group-hover:flex items-center gap-3">
                                    <button
                                      onClick={() => setEditingItem({ id: item._id, title: item.title })}
                                      className="text-gray-400 hover:text-orange-700 cursor-pointer"
                                      title="Rename item"
                                    >
                                      <Pencil size={12} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteItem(item._id)}
                                      className="text-gray-400 hover:text-red-600 cursor-pointer"
                                      title="Delete item"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </>
                              )}
                            </li>
                          ))}
                        </ul>

                        {addingItemFor === section._id ? (
                          <div className="flex items-center gap-2 mt-2 ml-2">
                            <input
                              autoFocus
                              value={newItemTitle}
                              onChange={(e) => setNewItemTitle(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleAddItem(section._id)}
                              placeholder="New item title"
                              className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                            />
                            <button onClick={() => handleAddItem(section._id)} className="text-orange-600 cursor-pointer">
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setAddingItemFor(null)
                                setNewItemTitle("")
                              }}
                              className="text-gray-400 cursor-pointer"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setAddingItemFor(section._id)
                              setNewItemTitle("")
                            }}
                            className="mt-2 ml-2 text-xs text-orange-700 hover:text-orange-900 flex items-center gap-1 cursor-pointer"
                          >
                            <Plus size={12} /> Add Item
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {addingSectionFor === course.courseId ? (
                    <div className="flex items-center gap-2 mt-5">
                      <input
                        autoFocus
                        value={newSectionTitle}
                        onChange={(e) => setNewSectionTitle(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddSection(course.courseId)}
                        placeholder="New section title"
                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                      />
                      <button
                        onClick={() => handleAddSection(course.courseId)}
                        className="bg-orange-700 text-white px-3 py-2 rounded text-sm cursor-pointer hover:bg-orange-800"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setAddingSectionFor(null)
                          setNewSectionTitle("")
                        }}
                        className="text-gray-500 px-3 py-2 text-sm cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setAddingSectionFor(course.courseId)
                        setNewSectionTitle("")
                      }}
                      className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-orange-700 hover:text-orange-900 cursor-pointer"
                    >
                      <Plus size={14} /> Add Section
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {courses.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No courses found. Create a course first, then its curriculum can be built here.
          </div>
        )}
      </div>
    </div>
  )
}
