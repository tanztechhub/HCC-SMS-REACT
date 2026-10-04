"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import TutorCalendar from "../components/tutorCalendar/TutorCalendar"
import Calender from '../../components/calendar/Calendar'
import { format } from "date-fns"
import { FaRegSave } from "react-icons/fa";
import { FaBook } from "react-icons/fa";
import LoadingSpinner from "../../components/loadingSpinner/LoadingSpinner"
import { LuTrash2, LuSearch } from "react-icons/lu"

const API_URL = import.meta.env.VITE_API_URL;

export default function LessonPlan() {
  const [isLoading, setIsLoading] = useState(false)
  const [tutor, setTutor] = useState(null)
  const [tutors, setTutors] = useState([])
  const [groups, setGroups] = useState([])
  const [showForm, setShowForm] = useState(true)
  const [editingLesson, setEditingLesson] = useState(null)
  const [editingExam, setEditingExam] = useState(null)
  const [editMode, setEditMode] = useState({ isEditing: false, type: null, id: null })
  const [selectedTimetableIds, setSelectedTimetableIds] = useState([])
  const [isEventLoading, setIsEventLoading] = useState(false)
  const [isExamLoading, setIsExamLoading] = useState(false);
  const [selectedTutorForExam, setSelectedTutorForExam] = useState("");
  const [filteredGroupsForExam, setFilteredGroupsForExam] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    topic: "",
    groupId: "",
    courseId: "",
    curriculumSectionId: "",
    curriculumSectionTitle: "",
    curriculumItemIds: [],
    curriculumSubtopics: [],
    curriculumTopics: []
  })
  const [courses, setCourses] = useState([])
  const [curriculumSections, setCurriculumSections] = useState([])
  const [isCurriculumLoading, setIsCurriculumLoading] = useState(false)
  const [eventForm, setEventForm] = useState({
    eventDate: "",
    startTime: "",
    endTime: "",
    venue: "",
    eventDescription: "",
    organizerId: "",
    groupIds: [],
  })
  const [examForm, setExamForm] = useState({
    examDate: "",
    startTime: "",
    endTime: "",
    venue: "",
    examName: "",
    tutorId: "",
    groupId: "",
  });

  const [timetables, setTimetables] = useState([])
  const [filteredGroups, setFilteredGroups] = useState([])

  useEffect(() => {
    fetchTimetables()
    fetchTutors()
    fetchGroups()
    fetchCourses()
  }, [])

  useEffect(() => {
    if (formData.courseId) {
      fetchCurriculumForCourse(formData.courseId)
    } else {
      setCurriculumSections([])
    }
  }, [formData.courseId])

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_URL}/courses`)
      const data = await response.json()
      setCourses(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error(error.message || "Failed to fetch courses")
    }
  }

  const fetchCurriculumForCourse = async (courseId) => {
    setIsCurriculumLoading(true)
    try {
      const response = await fetch(`${API_URL}/curriculum/course/${courseId}`)
      const data = await response.json()
      if (data.success) {
        setCurriculumSections(data.data.sections || [])
      } else {
        throw new Error(data.message || "Failed to fetch curriculum")
      }
    } catch (error) {
      toast.error(error.message)
      setCurriculumSections([])
    } finally {
      setIsCurriculumLoading(false)
    }
  }

  // A lesson can cover several "topics" (curriculum sections, e.g.
  // "Introduction to Coffee"), each with its own chosen sub-topics. They live
  // in formData.curriculumTopics as
  // [{ sectionId, sectionTitle, itemIds: [], subtopics: [] }].
  //
  // The single-topic fields (curriculumSectionId, curriculumSectionTitle,
  // curriculumItemIds, curriculumSubtopics) are kept in sync with the FIRST
  // topic so older lessons and any code still reading them keep working, and
  // `topic` is rebuilt as a flat summary string every other screen displays.
  const withTopics = (prev, curriculumTopics) => {
    const first = curriculumTopics[0]
    const topic = curriculumTopics
      .map((t) => t.subtopics.length > 0 ? `${t.sectionTitle}: ${t.subtopics.join(", ")}` : t.sectionTitle)
      .join("; ")

    return {
      ...prev,
      topic,
      curriculumTopics,
      curriculumSectionId: first?.sectionId || "",
      curriculumSectionTitle: first?.sectionTitle || "",
      curriculumItemIds: first?.itemIds || [],
      curriculumSubtopics: first?.subtopics || [],
    }
  }

  // Lessons saved before multi-topic support only carry the single-topic
  // fields - lift them into the new shape so they can be edited.
  const topicsFromLesson = (lesson) => {
    if (lesson.curriculumTopics?.length > 0) return lesson.curriculumTopics
    if (!lesson.curriculumSectionId) return []
    return [{
      sectionId: lesson.curriculumSectionId,
      sectionTitle: lesson.curriculumSectionTitle || "",
      itemIds: lesson.curriculumItemIds || [],
      subtopics: lesson.curriculumSubtopics || [],
    }]
  }

  const handleAddTopic = (sectionId) => {
    if (!sectionId) return
    const section = curriculumSections.find((s) => s._id === sectionId)
    if (!section) return

    setFormData((prev) => {
      if (prev.curriculumTopics.some((t) => t.sectionId === section._id)) return prev
      return withTopics(prev, [
        ...prev.curriculumTopics,
        { sectionId: section._id, sectionTitle: section.title, itemIds: [], subtopics: [] },
      ])
    })
  }

  const handleRemoveTopic = (sectionId) => {
    setFormData((prev) =>
      withTopics(prev, prev.curriculumTopics.filter((t) => t.sectionId !== sectionId))
    )
  }

  // Sub-topics = the individual items within a topic - a tutor can cover only
  // some of them in a given lesson (e.g. 2 of 4).
  const toggleSubtopic = (sectionId, item) => {
    setFormData((prev) =>
      withTopics(prev, prev.curriculumTopics.map((t) => {
        if (t.sectionId !== sectionId) return t
        const isSelected = t.itemIds.includes(item._id)
        return {
          ...t,
          itemIds: isSelected ? t.itemIds.filter((id) => id !== item._id) : [...t.itemIds, item._id],
          subtopics: isSelected ? t.subtopics.filter((title) => title !== item.title) : [...t.subtopics, item.title],
        }
      }))
    )
  }

  useEffect(() => {
    if (tutor) {
      // Filter groups for the current tutor
      const tutorGroups = groups.filter(group => group?.tutorId?._id === tutor?._id)
      setFilteredGroups(tutorGroups)
    }
  }, [tutor, groups])

  const fetchTimetables = async () => {
    try {
      const response = await fetch(`${API_URL}/timetables`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      const data = await response.json()
      if (data.success) {
        setTimetables(data.data)
      } else {
        throw new Error(data.message || "Failed to fetch timetables")
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const fetchTutors = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/tutors`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      const data = await response.json()
      if (data.success) {
        setTutors(data.data)
      } else {
        throw new Error(data.message || "Failed to fetch tutors")
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${API_URL}/classes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      const data = await response.json()
      if (data.success) {
        setGroups(data.data)
      } else {
        throw new Error(data.message || "Failed to fetch groups")
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleTimetableSelection = (timetableId) => {
    setSelectedTimetableIds(prev => {
      if (prev.includes(timetableId)) {
        return prev.filter(id => id !== timetableId)
      } else {
        return [...prev, timetableId]
      }
    })
  }

  // Add this useEffect to clean up form states
  useEffect(() => {
    return () => {
      resetForms();
    };
  }, []);

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsEventLoading(true);
      const userData = JSON.parse(localStorage.getItem("user"))

      // Use eventForm.groupIds instead of selectedTimetableIds
      const groupIdsToSend = eventForm.groupIds.length === 0 ? "all" : eventForm.groupIds;

      const url = editMode.isEditing
        ? `${API_URL}/timetables/event/${editMode.id}`
        : `${API_URL}/timetables/event`;
      const method = editMode.isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...eventForm,
          tutorId: userData.id,
          groupIds: groupIdsToSend,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(editMode.isEditing ? "Event updated successfully" : "Event created successfully");
        resetForms(); // Reset all forms
        fetchTimetables();
      } else {
        throw new Error(data.message || `Failed to ${editMode.isEditing ? 'update' : 'create'} event`);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsEventLoading(false);
    }
  };

  // Replace the handleExamSubmit function with this updated version
  const handleExamSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsExamLoading(true);

      // Add originalGroupId to the exam form data
      const examData = {
        ...examForm,
        originalGroupId: editingExam?.groupInfo?.groupId || editingExam?.groupId
      };

      const url = editMode.isEditing
        ? `${API_URL}/timetables/exam/${editMode.id}`
        : `${API_URL}/timetables/exam`;
      const method = editMode.isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(examData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(editMode.isEditing ? "Exam updated successfully" : "Exam created successfully");
        resetForms();
        fetchTimetables();
      } else {
        throw new Error(data.message || `Failed to ${editMode.isEditing ? 'update' : 'create'} exam`);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsExamLoading(false);
    }
  };

  // Replace your existing handleEdit function with this corrected version
  const handleEdit = (item, type) => {
    setEditMode({ isEditing: true, type, id: item._id });

    if (type === 'event') {
      // Fix: Handle groupIds as array and ensure proper field mapping
      const groupIds = Array.isArray(item.groupIds) ? item.groupIds :
        (item.groupIds === "all" || !item.groupIds) ? [] : [item.groupIds];

      setEventForm({
        eventDate: item.eventDate?.split('T')[0] || "",
        startTime: item.startTime || "",
        endTime: item.endTime || "",
        venue: item.venue || "",
        eventDescription: item.eventDescription || "",
        organizerId: item.organizerId || "",
        groupIds: groupIds,
      });
    } else if (type === 'exam') {
      const tutorId = item.invigilatorId || item.tutorId || "";

      setExamForm({
        examDate: item.examDate?.split('T')[0] || "",
        startTime: item.startTime || "",
        endTime: item.endTime || "",
        venue: item.venue || "",
        examName: item.examName || "",
        tutorId: tutorId,
        groupId: item.groupId || "",
      });

      // Fix: Set the tutor for exam filtering and trigger group filtering
      setSelectedTutorForExam(tutorId);

      // Fix: Filter groups immediately when tutor is set
      if (tutorId) {
        const tutorGroups = groups.filter(group => group?.tutorId?._id === tutorId);
        setFilteredGroupsForExam(tutorGroups);
      }

      setEditingExam(item);
    } else if (type === 'lesson') {
      setEditingLesson(item);
      setFormData({
        date: item.date?.split('T')[0] || "",
        startTime: item.startTime || "",
        endTime: item.endTime || "",
        venue: item.venue || "",
        topic: item.topic || "",
        groupId: item.groupId || "", // Fix: Remove duplicate groupId assignment
        courseId: item.courseId || "",
        curriculumSectionId: item.curriculumSectionId || "",
        curriculumSectionTitle: item.curriculumSectionTitle || "",
        curriculumItemIds: item.curriculumItemIds || [],
        curriculumSubtopics: item.curriculumSubtopics || [],
        curriculumTopics: topicsFromLesson(item),
      });
    }

    // Scroll to the appropriate form
    const formId = type === 'exam' ? 'examForm' : type === 'event' ? 'eventForm' : 'lessonForm';
    const formElement = document.getElementById(formId);
    formElement?.scrollIntoView({ behavior: 'smooth' });
  };

  // Add this function to your component
  const handleDelete = async (itemId, type) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/timetables/${type}/${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
        fetchTimetables(); // Refresh the data
        if (editMode.isEditing && editMode.id === itemId) {
          resetForms(); // Reset forms if deleting the item being edited
        }
      } else {
        throw new Error(data.message || `Failed to delete ${type}`);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };


  // Add this useEffect to update filtered groups when tutor changes
  useEffect(() => {
    if (examForm.tutorId) {
      const tutorGroups = groups.filter(group => group?.tutorId?._id === examForm.tutorId);
      setFilteredGroupsForExam(tutorGroups);

      // If editing and the current group doesn't belong to the selected tutor, clear it
      if (editMode.isEditing && editMode.type === 'exam') {
        const currentGroupBelongsToTutor = tutorGroups.some(group => group?._id === examForm.groupId);
        if (!currentGroupBelongsToTutor) {
          setExamForm(prev => ({ ...prev, groupId: "" }));
        }
      }
    } else {
      setFilteredGroupsForExam([]);
    }
  }, [examForm.tutorId, groups, editMode]);

  // Update the resetForms function to ensure proper state cleanup
  const resetForms = () => {
    setEditMode({ isEditing: false, type: null, id: null });
    setEventForm({
      eventDate: "",
      startTime: "",
      endTime: "",
      venue: "",
      eventDescription: "",
      organizerId: "",
      groupIds: [],
    });
    setExamForm({
      examDate: "",
      startTime: "",
      endTime: "",
      venue: "",
      examName: "",
      tutorId: "",
      groupId: "",
    });
    setFormData({
      date: "",
      startTime: "",
      endTime: "",
      venue: "",
      topic: "",
      groupId: "",
      courseId: "",
      curriculumSectionId: "",
      curriculumSectionTitle: "",
      curriculumItemIds: [],
      curriculumSubtopics: [],
      curriculumTopics: []
    });
    setSelectedTimetableIds([]);
    setSelectedTutorForExam("");
    setFilteredGroupsForExam([]); // Add this line
    setEditingLesson(null);
    setEditingExam(null); // Add this line
  };

  // Add this after your initial useState declarations
  const venues = [
    { name: "RHINO - Theory, Interview, Exam room", value: "RHINO ROOM" },
    { name: "ELEPHANT - Espresso , Beverages, Mixology, Practical Room", value: "ELEPHANT ROOM" },
    { name: "LION - Espresso Practical", value: "LION ROOM" },
    { name: "CHEETAH - Filter, Mixology, Cold Beverage Practical Room", value: "CHEETAH ROOM" },
  ];

  useEffect(() => {
    fetchTutorData()
  }, [])

  // Replace your existing useEffect for editingLesson with this corrected version
  useEffect(() => {
    if (editingLesson) {
      setFormData({
        date: format(new Date(editingLesson.date), "yyyy-MM-dd"),
        startTime: editingLesson.startTime,
        endTime: editingLesson.endTime,
        venue: editingLesson.venue,
        topic: editingLesson.topic,
        groupId: editingLesson.groupId || "", // Fix: Remove duplicate groupId assignment
        courseId: editingLesson.courseId || "",
        curriculumSectionId: editingLesson.curriculumSectionId || "",
        curriculumSectionTitle: editingLesson.curriculumSectionTitle || "",
        curriculumItemIds: editingLesson.curriculumItemIds || [],
        curriculumSubtopics: editingLesson.curriculumSubtopics || [],
        curriculumTopics: topicsFromLesson(editingLesson),
      })
      setShowForm(true)
    }
  }, [editingLesson])

  const fetchTutorData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"))
      if (!userData || !userData.token) {
        throw new Error("Please login again")
      }

      const response = await fetch(`${API_URL}/tutors/${userData.id}`, {
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
      })
      const data = await response.json()

      if (data.success) {
        setTutor(data.data)
      } else {
        throw new Error(data.message || "Failed to fetch tutor data")
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    if (!formData.date) {
      toast.error("Please select a date")
      return false
    }
    if (!formData.startTime) {
      toast.error("Please select start time")
      return false
    }
    if (!formData.endTime) {
      toast.error("Please select end time")
      return false
    }
    if (!formData.venue.trim()) {
      toast.error("Please enter a venue")
      return false
    }
    if (!formData.topic.trim()) {
      toast.error("Please enter a topic")
      return false
    }
    if (!formData.groupId) {
      toast.error("Please select a group")
      return false
    }

    const startDateTime = new Date(`${formData.date}T${formData.startTime}`)
    const endDateTime = new Date(`${formData.date}T${formData.endTime}`)
    if (endDateTime <= startDateTime) {
      toast.error("End time must be after start time")
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem("user"));

      const timetableData = {
        ...formData,
        tutorId: userData.id,
        originalGroupId: editingLesson?.groupInfo?.groupId // Use optional chaining to avoid errors
      };

      const url = editingLesson ? `${API_URL}/timetables/update-lesson/${editingLesson._id}` : `${API_URL}/timetables/create-lesson`;

      const response = await fetch(url, {
        method: editingLesson ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData.token}`,
        },
        body: JSON.stringify(timetableData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingLesson ? "Lesson updated successfully!" : "Lesson scheduled successfully!");

        // Reset ALL forms, not just the lesson form
        resetForms();
        setFormData({
          date: "",
          startTime: "",
          endTime: "",
          venue: "",
          topic: "",
          groupId: "",
          courseId: "",
          curriculumSectionId: "",
          curriculumSectionTitle: "",
          curriculumItemIds: [],
          curriculumSubtopics: [],
          curriculumTopics: []
        });
        setEditingLesson(null);
        setShowForm(false);
        fetchTutorData();
        fetchTimetables();
      } else {
        throw new Error(data.message || "Failed to schedule lesson");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson)
  }

  // Add this useEffect to handle exam form tutor changes during edit
  useEffect(() => {
    if (examForm.tutorId && groups.length > 0) {
      const tutorGroups = groups.filter(group => group?.tutorId?._id === examForm.tutorId);
      setFilteredGroupsForExam(tutorGroups);

      // If the current groupId is not in the filtered groups, reset it
      if (examForm.groupId && !tutorGroups.find(group => group?._id === examForm.groupId)) {
        setExamForm(prev => ({ ...prev, groupId: "" }));
      }
    } else {
      setFilteredGroupsForExam([]);
    }
  }, [examForm.tutorId, groups]);

  return (
    <div>
      <div className="py-8 mx-4 pb-25">
        <section className="grid grid-cols-2 gap-5 max-md:gap-10 max-md:grid-cols-1">
          <div className="bg-white rounded-lg shadow-md p-6" id="lessonForm">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              {editingLesson ? "Update Lesson" : "Schedule a Lesson"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Group</label>
                  {/* In your Lesson Form JSX */}
                  <select
                    name="groupId"
                    value={formData.groupId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors cursor-pointer focus:outline-none"
                    required
                  >
                    <option value="">Select a group</option>
                    {filteredGroups.map((group) => (
                      <option key={group?._id} value={group?._id}>
                        {group?.groupName} - {group?.timeSlot}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                  <select
                    name="courseId"
                    value={formData.courseId}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        courseId: e.target.value,
                        curriculumSectionId: "",
                        curriculumSectionTitle: "",
                        curriculumItemIds: [],
                        curriculumSubtopics: [],
                        curriculumTopics: [],
                      }))
                    }}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors cursor-pointer focus:outline-none"
                  >
                    <option value="">Select a course (optional)</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.courseId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Topics</label>
                    <select
                      value=""
                      onChange={(e) => handleAddTopic(e.target.value)}
                      disabled={isCurriculumLoading}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors cursor-pointer focus:outline-none disabled:opacity-50"
                    >
                      <option value="">
                        {isCurriculumLoading
                          ? "Loading curriculum..."
                          : formData.curriculumTopics.length > 0
                            ? "Add another topic"
                            : "Select a topic to auto-fill the lesson"}
                      </option>
                      {curriculumSections
                        .filter((section) => !formData.curriculumTopics.some((t) => t.sectionId === section._id))
                        .map((section) => (
                          <option key={section._id} value={section._id}>
                            {section.title}
                          </option>
                        ))}
                    </select>
                    {!isCurriculumLoading && curriculumSections.length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        This course has no curriculum yet - add one from the Curriculum tab, or just type the topic below.
                      </p>
                    )}
                  </div>
                )}

                {formData.curriculumTopics.map((chosen) => {
                  const section = curriculumSections.find((s) => s._id === chosen.sectionId)
                  const items = section?.items || []

                  return (
                    <div key={chosen.sectionId} className="border border-gray-300 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-800">{chosen.sectionTitle}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTopic(chosen.sectionId)}
                          className="cursor-pointer text-red-500 hover:text-red-700 shrink-0"
                          title="Remove this topic"
                        >
                          <LuTrash2 />
                        </button>
                      </div>
                      {items.length > 0 && (
                        <>
                          <p className="text-xs text-gray-500 mb-1">Sub-topics to cover</p>
                          <div className="space-y-2">
                            {items.map((item) => (
                              <label key={item._id} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={chosen.itemIds.includes(item._id)}
                                  onChange={() => toggleSubtopic(chosen.sectionId, item)}
                                />
                                <span className="text-sm text-gray-700">{item.title}</span>
                              </label>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors focus:outline-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
                  <select
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors cursor-pointer focus:outline-none"
                  >
                    <option value="">Select a venue</option>
                    {venues.map((venue) => (
                      <option key={venue.value} value={venue.value}>
                        {venue.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors focus:outline-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Summary</label>
                <textarea
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  placeholder="Enter lesson topic and brief description"
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto-filled from the Topics and Sub-topics above - feel free to edit it.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading || !tutor}
                  className="cursor-pointer px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
                >
                  {isLoading
                    ? editingLesson
                      ? "Updating..."
                      : "Scheduling..."
                    : editingLesson
                      ? "Update Lesson"
                      : "Schedule Lesson"}
                </button>
              </div>

              {/* In your Lesson Form - Add this after the submit button when editing */}
              {editingLesson && (
                <>
                  <button
                    type="button"
                    onClick={() => handleDelete(editingLesson._id, 'lesson')}
                    className="mt-2 w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 cursor-pointer flex items-center gap-4 justify-center"
                    disabled={isLoading}
                  >
                    <LuTrash2 />
                    Delete Lesson
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingLesson(null);
                      resetForms();
                    }}
                    className="mt-2 w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                </>
              )}
            </form>
          </div>

          {/* Event Form */}
          <div className="bg-white p-6 rounded-lg shadow" id="eventForm">
            <h2 className="text-xl font-semibold mb-4">
              {editMode.isEditing && editMode.type === 'event' ? 'Update Event' : 'Create Event'}
            </h2>
            <form onSubmit={handleEventSubmit}>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Event Date</label>
                  <input
                    type="date"
                    value={eventForm.eventDate}
                    onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })}
                    className="mt-1 block w-full rounded-md p-2 border-2 border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="time"
                    value={eventForm.startTime}
                    onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                    className="mt-1 block w-full rounded-md p-2 border-2 border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="time"
                    value={eventForm.endTime}
                    onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                    className="mt-1 block w-full rounded-md p-2 border-2 border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Venue</label>
                  <input
                    type="text"
                    value={eventForm.venue}
                    onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                    className="mt-1 block w-full rounded-md p-2 border-2 border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Event Description</label>
                  <input
                    type="text"
                    value={eventForm.eventDescription}
                    onChange={(e) => setEventForm({ ...eventForm, eventDescription: e.target.value })}
                    className="mt-1 block w-full rounded-md p-2 border-2 border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Organizer</label>
                  <select
                    value={eventForm.organizerId}
                    onChange={(e) => setEventForm({ ...eventForm, organizerId: e.target.value })}
                    className="mt-1 block w-full p-2 border-2 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                  >
                    <option value="">Select Organizer</option>
                    {tutors.map((tutor) => (
                      <option key={tutor?._id} value={tutor?._id}>
                        {tutor?.firstName} {tutor?.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Groups</label>
                  <div className="mt-1 space-y-2">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        value={"all"}
                        checked={eventForm.groupIds.length === 0 || eventForm.groupIds.includes("all")}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEventForm({ ...eventForm, groupIds: [] }); // "all" is represented by empty array
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2">All Groups</span>
                    </label>
                    {groups.map((group) => (
                      <label key={group?._id} className="inline-flex items-center block">
                        <input
                          type="checkbox"
                          value={group?._id}
                          checked={eventForm.groupIds.includes(group?._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              // Remove "all" if present and add this specific group
                              const newGroupIds = eventForm.groupIds.filter(id => id !== "all");
                              setEventForm({
                                ...eventForm,
                                groupIds: [...newGroupIds, group?._id]
                              });
                            } else {
                              setEventForm({
                                ...eventForm,
                                groupIds: eventForm.groupIds.filter(id => id !== group?._id)
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2">
                          {group?.groupName} - {group?.tutorId?.firstName} {group?.tutorId?.lastName}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="mt-4 w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 cursor-pointer flex items-center gap-4 justify-center"
              >
                {isEventLoading ? <LoadingSpinner size={15} /> :
                  editMode.isEditing && editMode.type === 'event' ? <FaRegSave /> : <FaBook />}
                {editMode.isEditing && editMode.type === 'event' ? 'Update Event' : 'Create Event'}
              </button>
              {editMode.isEditing && editMode.type === 'event' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleDelete(editMode.id, 'event')}
                    className="mt-2 w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 cursor-pointer flex items-center gap-4 justify-center"
                    disabled={isLoading}
                  >
                    <LuTrash2 />
                    Delete Event
                  </button>
                  <button
                    type="button"
                    onClick={resetForms}
                    className="mt-2 w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                </>
              )}
            </form>
          </div>

        </section>

        {/* Exam Form */}
        {/* Exam Form */}
        <div className="bg-white p-6 mt-6 rounded-lg shadow" id="examForm">
          <h2 className="text-xl font-semibold mb-4">
            {editMode.isEditing && editMode.type === 'exam' ? 'Update Exam' : 'Create Exam'}
          </h2>
          <form onSubmit={handleExamSubmit}>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Exam Date</label>
                <input
                  type="date"
                  value={examForm.examDate}
                  onChange={(e) => setExamForm({ ...examForm, examDate: e.target.value })}
                  className="mt-1 block w-full rounded-md p-2 border-2 border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <input
                  type="time"
                  value={examForm.startTime}
                  onChange={(e) => setExamForm({ ...examForm, startTime: e.target.value })}
                  className="mt-1 block w-full rounded-md p-2 border-2 border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Time</label>
                <input
                  type="time"
                  value={examForm.endTime}
                  onChange={(e) => setExamForm({ ...examForm, endTime: e.target.value })}
                  className="mt-1 block w-full rounded-md p-2 border-2 border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Venue</label>
                <select
                  value={examForm.venue}
                  onChange={(e) => setExamForm({ ...examForm, venue: e.target.value })}
                  className="mt-1 block w-full rounded-md p-2 border-2 border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                  required
                >
                  <option value="">Select Venue</option>
                  {venues.map((venue) => (
                    <option key={venue.value} value={venue.value}>
                      {venue.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Exam Name</label>
                <input
                  type="text"
                  value={examForm.examName}
                  onChange={(e) => setExamForm({ ...examForm, examName: e.target.value })}
                  className="mt-1 block w-full rounded-md p-2 border-2 border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-offset-red-200 focus:ring-opacity-50 focus:outline-hidden"
                  required
                />
              </div>

              {/* Tutor Selection in Exam Form */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Tutor</label>
                <select
                  value={examForm.tutorId}
                  onChange={(e) => {
                    setExamForm({ ...examForm, tutorId: e.target.value, groupId: "" });
                  }}
                  className="mt-1 block w-full p-2 border-2 rounded-md border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50 cursor-pointer"
                  required
                >
                  <option value="">Select Tutor</option>
                  {tutors.map((tutor) => (
                    <option key={tutor?._id} value={tutor?._id}>
                      {tutor?.firstName} {tutor?.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Group Selection (filtered by selected tutor) */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Group</label>
                <select
                  value={examForm.groupId}
                  onChange={(e) => setExamForm({ ...examForm, groupId: e.target.value })}
                  className="mt-1 block w-full p-2 border-2 rounded-md border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50 cursor-pointer"
                  required
                  disabled={!examForm.tutorId}
                >
                  <option value="">Select Group</option>
                  {filteredGroupsForExam.map((group) => (
                    <option key={group?._id} value={group?._id}>
                      {group?.groupName} - {group?.timeSlot}
                    </option>
                  ))}
                </select>
                {!examForm.tutorId && (
                  <p className="text-sm text-gray-500 mt-1">Please select a tutor first</p>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 cursor-pointer flex items-center gap-4 justify-center"
            >
              {isExamLoading ? <LoadingSpinner size={15} /> :
                editMode.isEditing && editMode.type === 'exam' ? <FaRegSave /> : <FaBook />}
              {editMode.isEditing && editMode.type === 'exam' ? 'Update Exam' : 'Create Exam'}
            </button>
            {editMode.isEditing && editMode.type === 'exam' && (
              <>
                <button
                  type="button"
                  onClick={() => handleDelete(editMode.id, 'exam')}
                  className="mt-2 w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 cursor-pointer flex items-center gap-4 justify-center"
                  disabled={isLoading}
                >
                  <LuTrash2 />
                  Delete Exam
                </button>
                <button
                  type="button"
                  onClick={resetForms}
                  className="mt-2 w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
              </>
            )}
          </form>
        </div>

        <div className="my-4">
          {tutor && <TutorCalendar
            tutorId={tutor?._id}
            onEditLesson={(lesson) => handleEdit(lesson, 'lesson')}
            onEditExam={(exam) => handleEdit(exam, 'exam')}
            onEditEvent={(event) => handleEdit(event, 'event')}
            onDeleteLesson={(lessonId) => handleDelete(lessonId, 'lesson')}
            onDeleteExam={(examId) => handleDelete(examId, 'exam')}
            onDeleteEvent={(eventId) => handleDelete(eventId, 'event')}
            refetchEvents={fetchTutorData}
            tutorData={tutor}
          />}
        </div>

        <h1 className="text-2xl font-bold text-gray-800 my-10">Overall School Timetable</h1>
        <div className="my-4">
          <Calender timetables={timetables} showEdit={false} />
        </div>
      </div>
    </div>
  )
}