import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaRegTrashAlt } from 'react-icons/fa';
import { Edit2, X, Save, Check } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

export default function AssignExamToGroup() {
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const [groups, setGroups] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [schemes, setSchemes] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupExams, setGroupExams] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Individual student assignment state
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [selectedExamStudent, setSelectedExamStudent] = useState('');
  const [selectedSchemeStudent, setSelectedSchemeStudent] = useState('');
  const [startDateStudent, setStartDateStudent] = useState('');
  const [endDateStudent, setEndDateStudent] = useState('');
  const [schemsStudent, setSchemesStudent] = useState([]);
  const [isAssigningStudent, setIsAssigningStudent] = useState(false);
  
  // State for managing individual student exams view
  const [expandedStudents, setExpandedStudents] = useState(new Set());
  const [studentExamsData, setStudentExamsData] = useState({});
  const [loadingStudentExams, setLoadingStudentExams] = useState({});
  const [editingExam, setEditingExam] = useState(null);
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [isSavingIndividual, setIsSavingIndividual] = useState(false);
  const [isDeletingIndividual, setIsDeletingIndividual] = useState(false);

  useEffect(() => {
    fetchGroups();
    fetchExams();
    fetchAllStudents();
  }, []);

  useEffect(() => {
    if (selectedExam) fetchCourseSchemes(selectedExam);
  }, [selectedExam]);

  useEffect(() => {
    if (selectedGroup) fetchGroupExams(selectedGroup);
  }, [selectedGroup]);

  useEffect(() => {
    if (selectedExamStudent) fetchCourseSchemesStudent(selectedExamStudent);
  }, [selectedExamStudent]);

  // Auto-select first available group
  useEffect(() => {
    if (groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0]._id);
    }
  }, [groups]);

  const headers = {
    Authorization: `Bearer ${userData.token}`,
    tutorid: userData.id,
    name: `${userData.firstName || ''} ${userData.lastName || ''}`
  };

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${API_URL}/quizzes/groups`, { headers });
      const data = await res.json();
      if (data.success) setGroups(data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load groups');
    }
  };

  const fetchExams = async () => {
    try {
      const res = await fetch(`${API_URL}/exams`, { headers });
      const data = await res.json();
      if (data.success) setExams(data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load exams');
    }
  };

  const fetchAllStudents = async () => {
    try {
      const res = await fetch(`${API_URL}/students/tutorStudents/${userData.id}`, { headers });
      const data = await res.json();
      if (data.success) {
        setStudents(data.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load students');
    }
  };

  const fetchCourseSchemes = async (examId) => {
    try {
      const examRes = await fetch(`${API_URL}/exams/${examId}`, { headers });
      const examData = await examRes.json();
      if (!examData.success) return;
      const courseId = examData.data.courseId._id;
      if (!courseId) return;
      const courseRes = await fetch(`${API_URL}/courses/${courseId}`, { headers: { Authorization: `Bearer ${userData.token}` } });
      const course = await courseRes.json();
      if (course && Array.isArray(course.examScheme)) {
        setSchemes(course.examScheme);
      } else setSchemes([]);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourseSchemesStudent = async (examId) => {
    try {
      const examRes = await fetch(`${API_URL}/exams/${examId}`, { headers });
      const examData = await examRes.json();
      if (!examData.success) return;
      const courseId = examData.data.courseId._id;
      if (!courseId) return;
      const courseRes = await fetch(`${API_URL}/courses/${courseId}`, { headers: { Authorization: `Bearer ${userData.token}` } });
      const course = await courseRes.json();
      if (course && Array.isArray(course.examScheme)) {
        setSchemesStudent(course.examScheme);
      } else setSchemesStudent([]);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGroupExams = async (groupId) => {
    try {
      const res = await fetch(`${API_URL}/groups/${groupId}/exams`, { headers });
      const data = await res.json();
      if (data.success) setGroupExams(data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load group exams');
    }
  };

  const toggleStudentSelection = (studentId) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const toggleAllStudentsSelection = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s._id)));
    }
  };

  const filteredStudents = students.filter(student => {
    const searchLower = studentSearchTerm.toLowerCase();
    return (
      student.firstName?.toLowerCase().includes(searchLower) ||
      student.lastName?.toLowerCase().includes(searchLower) ||
      student.admissionNumber?.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower)
    );
  });

  const handleAssignToStudents = async () => {
    if (!selectedExamStudent || !selectedSchemeStudent || !startDateStudent || !endDateStudent) {
      return toast.error('Exam, scheme, start date, and end date are all required');
    }

    if (selectedStudents.size === 0) {
      return toast.error('Please select at least one student');
    }

    setIsAssigningStudent(true);
    try {
      const body = {
        examId: selectedExamStudent,
        studentIds: Array.from(selectedStudents),
        examSchemeName: selectedSchemeStudent,
        startDate: startDateStudent,
        endDate: endDateStudent
      };

      const res = await fetch(`${API_URL}/groups/assign-to-students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Exam assigned to ${selectedStudents.size} student(s)`);
        setSelectedExamStudent('');
        setSelectedSchemeStudent('');
        setStartDateStudent('');
        setEndDateStudent('');
        setSelectedStudents(new Set());
        setSchemesStudent([]);
        setStudentSearchTerm('');
        // Refresh student exams for expanded students
        expandedStudents.forEach(studentId => {
          fetchStudentExams(studentId);
        });
      } else {
        toast.error(data.message || 'Failed to assign');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to assign exam');
    } finally {
      setIsAssigningStudent(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedGroup || !selectedExam || !selectedScheme || !startDate || !endDate) {
      return toast.error('Group, exam, scheme, start date, and end date are all required');
    }
    setIsAssigning(true);
    try {
      const body = {
        examId: selectedExam,
        examSchemeName: selectedScheme,
        startDate,
        endDate
      };
      const res = await fetch(`${API_URL}/groups/${selectedGroup}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Exam assigned to group');
        setSelectedExam('');
        setSelectedScheme('');
        setStartDate('');
        setEndDate('');
        fetchGroupExams(selectedGroup);
      } else {
        toast.error(data.message || 'Failed to assign');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to assign exam');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemove = async (entry) => {
    const examId = entry.exam?._id || entry.exam;
    if (!examId) {
      toast.error('Unable to determine exam ID');
      return;
    }
    if (!window.confirm('Remove assignment?')) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_URL}/groups/${selectedGroup}/exams/${examId}`, {
        method: 'DELETE',
        headers
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Assignment removed');
        fetchGroupExams(selectedGroup);
      } else toast.error(data.message || 'Failed to remove');
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove assignment');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStartEdit = (entry) => {
    setGroupExams(prev => prev.map(e => ( (e._id || e.exam) === (entry._id || entry.exam) ? { ...e, _editing: true, _editStartDate: entry.startDate || '', _editEndDate: entry.endDate || '', _editScheme: entry.examSchemeName || '' } : e)));
  };

  const handleCancelEdit = (entry) => {
    setGroupExams(prev => prev.map(e => ( (e._id || e.exam) === (entry._id || entry.exam) ? { ...e, _editing: false } : e)));
  };

  const handleSaveEdit = async (entry) => {
    if (!entry._editStartDate || !entry._editEndDate) {
      toast.error('Start and end dates are required');
      return;
    }
    const examId = entry.exam?._id || entry.exam;
    setIsSaving(true);
    try {
      const body = {
        startDate: entry._editStartDate,
        endDate: entry._editEndDate
      };
      const res = await fetch(`${API_URL}/groups/${selectedGroup}/exams/${examId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Assignment updated');
        fetchGroupExams(selectedGroup);
      } else toast.error(data.message || 'Failed to update');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update assignment');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStudentExpansion = async (studentId) => {
    const newExpanded = new Set(expandedStudents);
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId);
      setExpandedStudents(newExpanded);
    } else {
      newExpanded.add(studentId);
      setExpandedStudents(newExpanded);
      // Fetch student's assigned exams
      await fetchStudentExams(studentId);
    }
  };

  const fetchStudentExams = async (studentId) => {
    setLoadingStudentExams(prev => ({ ...prev, [studentId]: true }));
    try {
      const student = students.find(s => s._id === studentId);
      if (!student?.admissionNumber) return;

      const res = await fetch(`${API_URL}/students/${student.admissionNumber}/assigned-exams`, { headers });
      const data = await res.json();
      if (data.success) {
        // Filter only individually assigned exams (those without groupId)
        const individualExams = (data.data || []).filter(exam => !exam.groupId);
        setStudentExamsData(prev => ({ ...prev, [studentId]: individualExams }));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load student exams');
    } finally {
      setLoadingStudentExams(prev => ({ ...prev, [studentId]: false }));
    }
  };

  const handleStartEditIndividual = (studentId, exam) => {
    setEditingExam(`${studentId}-${exam.exam._id || exam.exam}`);
    setEditStartDate(exam.startDate ? new Date(exam.startDate).toISOString().slice(0, 16) : '');
    setEditEndDate(exam.endDate ? new Date(exam.endDate).toISOString().slice(0, 16) : '');
  };

  const handleCancelEditIndividual = () => {
    setEditingExam(null);
    setEditStartDate('');
    setEditEndDate('');
  };

  const handleSaveEditIndividual = async (studentId, exam) => {
    if (!editStartDate || !editEndDate) {
      return toast.error('Start and end dates are required');
    }

    setIsSavingIndividual(true);
    try {
      const student = students.find(s => s._id === studentId);
      if (!student) return;

      const examId = exam.exam._id || exam.exam;
      const body = {
        startDate: editStartDate,
        endDate: editEndDate
      };

      const res = await fetch(`${API_URL}/groups/students/${student._id}/assigned-exams/${examId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Exam schedule updated');
        setEditingExam(null);
        setEditStartDate('');
        setEditEndDate('');
        await fetchStudentExams(studentId);
      } else {
        toast.error(data.message || 'Failed to update');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update exam');
    } finally {
      setIsSavingIndividual(false);
    }
  };

  const handleDeleteIndividualExam = async (studentId, exam) => {
    if (!window.confirm('Remove this exam assignment?')) return;

    setIsDeletingIndividual(true);
    try {
      const student = students.find(s => s._id === studentId);
      if (!student) return;

      const examId = exam.exam._id || exam.exam;
      const res = await fetch(`${API_URL}/groups/students/${student._id}/assigned-exams/${examId}`, {
        method: 'DELETE',
        headers
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Exam assignment removed');
        await fetchStudentExams(studentId);
      } else {
        toast.error(data.message || 'Failed to remove');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove exam');
    } finally {
      setIsDeletingIndividual(false);
    }
  };

  const currentGroupName = groups.find(g => g._id === selectedGroup)?.groupName || 'No group selected';

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Assign Exam To Group</h1>
        <p className="text-gray-600 mt-2">Select a group and assign exams with specific exam schemes and timeframes</p>
      </div>

      {/* Filters Widget - White background island style */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Assign New Exam</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Group Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Group *</label>
            <select
              value={selectedGroup}
              onChange={e => setSelectedGroup(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            >
              <option value="">Select group</option>
              {groups.map(g => (
                <option key={g._id} value={g._id}>{g.groupName}</option>
              ))}
            </select>
          </div>

          {/* Exam Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Exam *</label>
            <select
              value={selectedExam}
              onChange={e => setSelectedExam(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            >
              <option value="">Select exam</option>
              {exams.map(ex => (
                <option key={ex._id} value={ex._id}>{ex.examName}</option>
              ))}
            </select>
          </div>

          {/* Scheme Select - REQUIRED */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Exam Scheme * (Required)</label>
            <select
              value={selectedScheme}
              onChange={e => setSelectedScheme(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            >
              <option value="">Select scheme</option>
              {schemes.map(s => (
                <option key={s.name} value={s.name}>{s.name} ({s.weight}%)</option>
              ))}
            </select>
          </div>

          {/* Assign Button */}
          <div className="flex items-end">
            <button
              onClick={handleAssign}
              disabled={isAssigning}
              className="w-full px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {isAssigning ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Assigning...
                </>
              ) : (
                'Assign Exam'
              )}
            </button>
          </div>
        </div>

        {/* Date/Time Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time * (Required)</label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              required
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time *</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              required
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Assigned Exams for Group */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Assigned Exams for <span className="text-orange-600">{currentGroupName}</span>
        </h2>

        {groupExams.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No exams assigned to this group yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groupExams.map(entry => (
              <div
                key={entry._id || entry.exam}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors bg-gray-50"
              >
                <div className="flex items-start justify-between gap-4 max-md:flex-col">
                  {/* Left: Exam Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{entry.examName}</h3>
                    {!entry._editing ? (
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex gap-4">
                          <span className="inline-block bg-orange-50 text-orange-700 px-3 py-1 rounded font-medium text-xs">
                            {entry.examSchemeName || 'No scheme'}
                          </span>
                          {entry.startDate && (
                            <span>{new Date(entry.startDate).toLocaleString()}</span>
                          )}
                          {entry.endDate && (
                            <span>→ {new Date(entry.endDate).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 mt-2">
                        <p className="text-xs text-gray-500 italic">Only start and end dates can be edited. To change scheme or group, delete and re-assign this exam.</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs font-medium text-gray-700">Start Date</label>
                            <input
                              type="datetime-local"
                              value={entry._editStartDate}
                              onChange={(e) =>
                                setGroupExams(prev =>
                                  prev.map(g =>
                                    (g._id || g.exam) === (entry._id || entry.exam)
                                      ? { ...g, _editStartDate: e.target.value }
                                      : g
                                  )
                                )
                              }
                              className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700">End Date</label>
                            <input
                              type="datetime-local"
                              value={entry._editEndDate}
                              onChange={(e) =>
                                setGroupExams(prev =>
                                  prev.map(g =>
                                    (g._id || g.exam) === (entry._id || entry.exam)
                                      ? { ...g, _editEndDate: e.target.value }
                                      : g
                                  )
                                )
                              }
                              className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex gap-2">
                    {!entry._editing ? (
                      <>
                        <button
                          onClick={() =>
                            setGroupExams(prev =>
                              prev.map(e =>
                                (e._id || e.exam) === (entry._id || entry.exam)
                                  ? {
                                      ...e,
                                      _editing: true,
                                      _editStartDate: entry.startDate
                                        ? new Date(entry.startDate).toISOString().slice(0, 16)
                                        : '',
                                      _editEndDate: entry.endDate
                                        ? new Date(entry.endDate).toISOString().slice(0, 16)
                                        : ''
                                    }
                                  : e
                              )
                            )
                          }
                          className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleRemove(entry)}
                          disabled={isDeleting}
                          className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <FaRegTrashAlt className="h-4 w-4" />
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleSaveEdit(entry)}
                          disabled={isSaving}
                          className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Save className="h-4 w-4" />
                          {isSaving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() =>
                            setGroupExams(prev =>
                              prev.map(e =>
                                (e._id || e.exam?._id || e.exam) === (entry._id || entry.exam?._id || entry.exam)
                                  ? { ...e, _editing: false }
                                  : e
                              )
                            )
                          }
                          disabled={isSaving}
                          className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Exam to Individual Students */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Assign Exam to Individual Students</h2>

        {/* Selection Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Exam Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Exam *</label>
            <select
              value={selectedExamStudent}
              onChange={e => setSelectedExamStudent(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            >
              <option value="">Select exam</option>
              {exams.map(ex => (
                <option key={ex._id} value={ex._id}>{ex.examName}</option>
              ))}
            </select>
          </div>

          {/* Scheme Select - REQUIRED */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Exam Scheme * (Required)</label>
            <select
              value={selectedSchemeStudent}
              onChange={e => setSelectedSchemeStudent(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            >
              <option value="">Select scheme</option>
              {schemsStudent.map(s => (
                <option key={s.name} value={s.name}>{s.name} ({s.weight}%)</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time *</label>
            <input
              type="datetime-local"
              value={startDateStudent}
              onChange={e => setStartDateStudent(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time *</label>
            <input
              type="datetime-local"
              value={endDateStudent}
              onChange={e => setEndDateStudent(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
        </div>

        {/* Students Search and Selection */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">Select Students</label>
            <span className="text-sm text-gray-600">{selectedStudents.size} selected</span>
          </div>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search by name, admission number, or email..."
            value={studentSearchTerm}
            onChange={e => setStudentSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors mb-4"
          />

          {/* Students List with Checkboxes */}
          <div className="border border-gray-300 rounded-lg overflow-hidden max-h-80 overflow-y-auto">
            {filteredStudents.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No students found</div>
            ) : (
              <>
                {/* Select All Header */}
                <div className="bg-gray-50 border-b border-gray-300 px-4 py-3 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
                    onChange={toggleAllStudentsSelection}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Select All ({filteredStudents.length})
                  </span>
                </div>

                {/* Student Items */}
                {filteredStudents.map(student => (
                  <div
                    key={student._id}
                    className="px-4 py-3 border-b border-gray-200 hover:bg-gray-50 flex items-center gap-3 cursor-pointer transition-colors"
                    onClick={() => toggleStudentSelection(student._id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudents.has(student._id)}
                      onChange={() => toggleStudentSelection(student._id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {student.admissionNumber} • {student.email}
                      </div>
                      {student.groupId && (
                        <div className="text-xs text-gray-500">
                          Group: {student.groupId.groupName}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Assign Button */}
        <button
          onClick={handleAssignToStudents}
          disabled={isAssigningStudent || selectedStudents.size === 0}
          className="w-full px-4 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          {isAssigningStudent ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Assigning to {selectedStudents.size} student(s)...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Assign Exam to {selectedStudents.size !== 0 && selectedStudents.size} Selected Student(s)
            </>
          )}
        </button>
      </div>

      {/* Manage Individual Student Exam Assignments */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Manage Individual Student Exam Assignments</h2>
        <p className="text-sm text-gray-600 mb-6">
          View and manage exams assigned to individual students. Click on a student to expand and see their assigned exams.
        </p>

        {students.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No students found</div>
        ) : (
          <div className="space-y-3">
            {students.map(student => {
              const isExpanded = expandedStudents.has(student._id);
              const studentExams = studentExamsData[student._id] || [];
              const isLoading = loadingStudentExams[student._id];

              return (
                <div key={student._id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Student Header - Clickable */}
                  <div
                    onClick={() => toggleStudentExpansion(student._id)}
                    className="px-4 py-3 bg-gray-50 hover:bg-gray-100 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                        ▶
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {student.admissionNumber}
                          {student.groupId && ` • ${student.groupId.groupName || student.groupId}`}
                        </div>
                      </div>
                    </div>
                    {isExpanded && (
                      <span className="text-sm text-gray-500">
                        {studentExams.length} individual exam{studentExams.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Expanded Content - Student's Exams */}
                  {isExpanded && (
                    <div className="px-4 py-3 bg-white border-t border-gray-200">
                      {isLoading ? (
                        <div className="text-center py-4">
                          <div className="animate-spin h-6 w-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
                          <p className="text-sm text-gray-600 mt-2">Loading exams...</p>
                        </div>
                      ) : studentExams.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                          No individual exams assigned to this student
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {studentExams.map((exam, idx) => {
                            const examIdFull = exam.exam?._id || exam.exam;
                            const examDetails = exam.exam?._id ? exam.exam : null;
                            const isEditing = editingExam === `${student._id}-${examIdFull}`;

                            return (
                              <div
                                key={idx}
                                className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                              >
                                {!isEditing ? (
                                  <>
                                    <div className="flex items-start justify-between gap-4 max-md:flex-col">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 mb-1">
                                          {exam.examName || examDetails?.examName || 'Unknown Exam'}
                                        </h4>
                                        <div className="text-sm text-gray-600 space-y-1">
                                          <div className="flex gap-4 flex-wrap">
                                            <span className="inline-block bg-orange-50 text-orange-700 px-2 py-1 rounded font-medium text-xs">
                                              {exam.examSchemeName || 'No scheme'}
                                            </span>
                                            {exam.startDate && (
                                              <span>{new Date(exam.startDate).toLocaleString()}</span>
                                            )}
                                            {exam.endDate && (
                                              <span>→ {new Date(exam.endDate).toLocaleString()}</span>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => handleStartEditIndividual(student._id, exam)}
                                          className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                                        >
                                          <Edit2 className="h-4 w-4" />
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => handleDeleteIndividualExam(student._id, exam)}
                                          disabled={isDeletingIndividual}
                                          className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                          <FaRegTrashAlt className="h-4 w-4" />
                                          {isDeletingIndividual ? 'Deleting...' : 'Delete'}
                                        </button>
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="space-y-3">
                                      <h4 className="font-semibold text-gray-900">
                                        {exam.examName || examDetails?.examName || 'Unknown Exam'}
                                      </h4>
                                      <p className="text-xs text-gray-500 italic">
                                        Only start and end dates can be edited. Scheme is fixed.
                                      </p>
                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Start Date & Time
                                          </label>
                                          <input
                                            type="datetime-local"
                                            value={editStartDate}
                                            onChange={(e) => setEditStartDate(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-1">
                                            End Date & Time
                                          </label>
                                          <input
                                            type="datetime-local"
                                            value={editEndDate}
                                            onChange={(e) => setEditEndDate(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                          />
                                        </div>
                                      </div>
                                      <div className="flex gap-2 justify-end">
                                        <button
                                          onClick={() => handleSaveEditIndividual(student._id, exam)}
                                          disabled={isSavingIndividual}
                                          className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                          <Save className="h-4 w-4" />
                                          {isSavingIndividual ? 'Saving...' : 'Save'}
                                        </button>
                                        <button
                                          onClick={handleCancelEditIndividual}
                                          disabled={isSavingIndividual}
                                          className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                          <X className="h-4 w-4" />
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>    </div>
  );
}