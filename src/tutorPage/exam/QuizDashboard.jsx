import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Users, Clock, ChevronDown, ChevronUp, Edit, Trash2, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner'
import { FaRegSave } from "react-icons/fa";

const QuizDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [submittingResponseId, setSubmittingResponseId] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [expandedQuiz, setExpandedQuiz] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [gradingResponse, setGradingResponse] = useState(null);
  const [groups, setGroups] = useState([]);


  // Update formData to use groupId instead of course
  const [formData, setFormData] = useState({
    title: '',
    question: '',
    groupId: '', // Changed from course to groupId
    startDate: '',
    endDate: '',
    additionalNotes: '',
    weight: '',
  });

  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    fetchQuizzes();
    fetchGroups();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setIsLoading(true);
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData || !userData.token) {
        toast.error('Please login again');
        return;
      }

      const response = await fetch(`${API_URL}/quizzes`, {
        headers: {
          Authorization: `Bearer ${userData.token}`,
          tutorId: userData.id,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quizzes');
      }

      const data = await response.json();
      if (data.success) {
        setQuizzes(Array.isArray(data.data) ? data.data : []);
      } else {
        toast.error(data.message || 'Failed to load quizzes');
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData || !userData.token) {
        return;
      }

      const response = await fetch(`${API_URL}/classes/tutor/${userData.id}`, {
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch groups');
      }

      const data = await response.json();
      if (data.success) {
        setGroups(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      toast.error('Failed to load groups');
      console.error('Failed to fetch groups:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const url = editingQuiz
        ? `${API_URL}/quizzes/${editingQuiz._id}`
        : `${API_URL}/quizzes`;

      const method = editingQuiz ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userData.token}`,
          tutorId: userData.id,
          name: `${userData.firstName} ${userData.lastName}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingQuiz ? 'Quiz updated successfully!' : 'Quiz created successfully!');
        fetchQuizzes();
        resetForm();
        setShowCreateModal(false);
        setShowEditModal(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleGradeChange = (responseId, field, value) => {
    if (!responseId) return;

    const updatedQuizzes = quizzes.map(quiz => {
      if (!quiz || !quiz.responses || !Array.isArray(quiz.responses)) return quiz;

      const updatedResponses = quiz.responses.map(response => {
        if (response && response._id === responseId) {
          return { ...response, [field]: value };
        }
        return response;
      });
      return { ...quiz, responses: updatedResponses };
    });
    setQuizzes(updatedQuizzes);
  };

  const handleGradeSubmit = async (quizId, responseId, grade, feedback) => {
    if (grade === '' || grade < 0 || grade > 100) {
      toast.error('Please enter a valid grade between 0 and 100.');
      return;
    }
    try {
      setSubmittingResponseId(responseId); // 🔹 Mark this response as loading
      const userData = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(`${API_URL}/quizzes/${quizId}/responses/${responseId}/grade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userData.token}`,
        },
        body: JSON.stringify({ grade, feedback }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Grade submitted successfully!');
        fetchQuizzes();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error submitting grade:', error);
      toast.error('Failed to submit grade.');
    } finally {
      setSubmittingResponseId(null); // 🔹 Reset loading state
    }
  };


  const handleDelete = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;

    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(`${API_URL}/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${userData.token}`,
          tutorId: userData.id,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Quiz deleted successfully!');
        fetchQuizzes();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  };

  // Update handleEdit function
  const handleEdit = (quiz) => {
    setEditingQuiz(quiz);
    setFormData({
      title: quiz.title,
      question: quiz.question,
      groupId: quiz.groupId, // Changed from course to groupId
      startDate: new Date(quiz.startDate).toISOString().slice(0, 16),
      endDate: new Date(quiz.endDate).toISOString().slice(0, 16),
      additionalNotes: quiz.additionalNotes,
      weight: quiz.weight // Make sure to include weight
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      question: '',
      course: '',
      startDate: '',
      endDate: '',
      additionalNotes: ''
    });
    setEditingQuiz(null);
  };

  // Add these safe versions of your helper functions
  const getStatusColor = (quiz) => {
    if (!quiz || !quiz.startDate || !quiz.endDate) return 'text-gray-600 bg-gray-50';

    const now = new Date();
    const startDate = new Date(quiz.startDate);
    const endDate = new Date(quiz.endDate);

    if (now > endDate) return 'text-red-600 bg-red-50';
    if (now < startDate) return 'text-blue-600 bg-blue-50';
    return 'text-orange-600 bg-orange-50';
  };

  const getStatusText = (quiz) => {
    if (!quiz || !quiz.startDate || !quiz.endDate) return 'Unknown';

    const now = new Date();
    const startDate = new Date(quiz.startDate);
    const endDate = new Date(quiz.endDate);

    if (now > endDate) return 'Expired';
    if (now < startDate) return 'Scheduled';
    return 'Active';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid date';

    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 md:pt-18">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Quiz Management</h1>
            <p className="text-gray-600 mt-1">Create and manage quizzes for your students</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 md:mt-0 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus size={20} />
            Create Quiz
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg flex items-center gap-2">
            <CheckCircle size={20} />
            {success}
          </div>
        )}

        {quizzes.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No quizzes yet</h3>
            <p className="text-gray-500 mb-4">Create your first quiz to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors cursor-pointer"
            >
              Create Quiz
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:gap-6">
            {quizzes.map((quiz) => {
              // Safety check: ensure quiz exists and has required properties
              if (!quiz || typeof quiz !== 'object') return null;

              return (
                <div key={quiz._id || Math.random()} className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                            {quiz.title || 'Untitled Quiz'}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(quiz)}`}>
                            {getStatusText(quiz)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <BookOpen size={16} />&nbsp;
                            <span>
                              {quiz.groupId && quiz.groupId.groupName
                                ? quiz.groupId.groupName
                                : 'No group assigned'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={16} />
                            <span>
                              {(quiz.responses && Array.isArray(quiz.responses) ? quiz.responses.length : 0)} responses
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            <span>
                              {quiz.startDate ? formatDate(quiz.startDate) : 'No start date'} -
                              {quiz.endDate ? formatDate(quiz.endDate) : 'No end date'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3 md:mt-0">
                        <button
                          onClick={() => handleEdit(quiz)}
                          disabled={quiz.responses && quiz.responses.length > 0}
                          className={`p-2 rounded-lg transition-colors cursor-pointer ${quiz.responses && quiz.responses.length > 0
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-blue-600 hover:bg-blue-50'
                            }`}
                          title={quiz.responses && quiz.responses.length > 0 ? 'Cannot edit quiz with responses' : 'Edit quiz'}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(quiz._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete quiz"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() => setExpandedQuiz(expandedQuiz === quiz._id ? null : quiz._id)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          {expandedQuiz === quiz._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {expandedQuiz === quiz._id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Question:</h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                            {quiz.question || 'No question provided'}
                          </p>
                        </div>

                        {quiz.additionalNotes && (
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 mb-2">Additional Notes:</h4>
                            <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{quiz.additionalNotes}</p>
                          </div>
                        )}

                        {/* Student Responses */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">
                            Student Responses ({(quiz.responses && Array.isArray(quiz.responses) ? quiz.responses.length : 0)})
                          </h4>
                          {quiz.responses && quiz.responses.length > 0 ? (
                            <div className="space-y-3">
                              {quiz.responses.map((response, index) => {
                                // Safety check for each response
                                if (!response || typeof response !== 'object') return null;

                                return (
                                  <div key={response._id || index} className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900">
                                          {response.studentName || 'Unknown Student'}
                                        </span>
                                        {response.admissionNumber && (
                                          <span className="text-sm text-gray-500">({response.admissionNumber})</span>
                                        )}
                                        {response.grade !== null && response.grade !== undefined && (
                                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                                            {response.grade}%
                                          </span>
                                        )}
                                      </div>
                                      {response.submittedAt && (
                                        <span className="text-xs text-gray-500 mt-1 md:mt-0">
                                          {formatDate(response.submittedAt)}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-gray-700 mb-2">{response.answer || 'No answer provided'}</p>

                                    {/* Grading UI */}
                                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                                      <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Grade (out of {quiz.weight || 100} marks)
                                          </label>
                                          <input
                                            type="number"
                                            value={response.grade !== null && response.grade !== undefined ? response.grade : ''}
                                            onChange={(e) => handleGradeChange(response._id, 'grade', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg"
                                            placeholder="e.g., 15"
                                            max={quiz.weight || 100}
                                            min={0}
                                          />
                                        </div>
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Remarks
                                        </label>
                                        <textarea
                                          value={response.feedback || ''}
                                          onChange={(e) => handleGradeChange(response._id, 'feedback', e.target.value)}
                                          rows={2}
                                          className="w-full p-2 border border-gray-300 rounded-lg resize-none"
                                          placeholder="Add optional remarks..."
                                        ></textarea>
                                      </div>
                                      <button
                                        onClick={() => handleGradeSubmit(
                                          quiz._id,
                                          response._id,
                                          response.grade,
                                          response.feedback
                                        )}
                                        className="bg-blue-600 mb-2 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer"
                                      >
                                        {submittingResponseId === response._id ? <LoadingSpinner size={20} /> : <FaRegSave />}
                                        Save Grade
                                      </button>
                                    </div>

                                    {response.feedback && (
                                      <p className="text-sm text-blue-700 bg-blue-50 p-2 rounded italic">
                                        Feedback: {response.feedback}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-center py-4">No responses yet</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create/Edit Modal */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quiz Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none focus:border-transparent"
                      placeholder="Enter quiz title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Group * {/* Changed from Course to Group */}
                    </label>
                    <select
                      value={formData.groupId}
                      onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none focus:border-transparent"
                      required
                    >
                      <option value="">Select a group</option>
                      {groups.map((group) => (
                        <option key={group._id} value={group._id}>
                          {group.groupName} - {group.timeSlot}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question *
                    </label>
                    <textarea
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      rows={6}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none focus:border-transparent resize-none"
                      placeholder="Enter your question here..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question Weight (in Marks) *
                    </label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none focus:border-transparent"
                      placeholder="e.g., 20"
                      required
                    />
                  </div>


                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date *
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date *
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Notes
                    </label>
                    <textarea
                      value={formData.additionalNotes}
                      onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none focus:border-transparent resize-none"
                      placeholder="Any additional instructions or notes for students..."
                    />
                  </div>

                  <div className="flex flex-col md:flex-row gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors font-medium cursor-pointer"
                    >
                      {editingQuiz ? 'Update Quiz' : 'Create Quiz'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setShowEditModal(false);
                        resetForm();
                      }}
                      className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizDashboard;