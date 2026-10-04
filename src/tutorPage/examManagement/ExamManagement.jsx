import React, { useState, useEffect } from 'react';
import { Plus, Loader, AlertCircle, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import ExamCard from './ExamCard';
import ExamForm from './ExamForm';
import AssignExamToGroup from './AssignExamToGroup';
import MarkResponses from './MarkResponses';
import { useLocation, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function ExamManagement() {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState('create'); // 'create' | 'assign' | 'mark'
  const [editingExam, setEditingExam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userData = JSON.parse(localStorage.getItem('user'));
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
    fetchCourses();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['create', 'assign', 'mark'].includes(tab) && tab !== currentView) {
      setCurrentView(tab);
    }
  }, [location.search, currentView]);

  const updateView = (view) => {
    setCurrentView(view);
    const params = new URLSearchParams(location.search);
    params.set('tab', view);
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  };

  const fetchExams = async () => {
    try {
      setIsLoading(true);
      if (!userData || !userData.token) {
        toast.error('Please login again');
        return;
      }

      const response = await fetch(`${API_URL}/exams`, {
        headers: {
          Authorization: `Bearer ${userData.token}`,
          tutorid: userData.id,
          name: `${userData.firstName} ${userData.lastName}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch exams');
      }

      const data = await response.json();
      if (data.success) {
        setExams(Array.isArray(data.data) ? data.data : []);
      } else {
        toast.error(data.message || 'Failed to load exams');
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Failed to load exams');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      if (!userData || !userData.token) {
        return;
      }

      const response = await fetch(`${API_URL}/courses`, {
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    }
  };

  const handleCreateExam = () => {
    setEditingExam(null);
    updateView('create');
  };

  const handleEditExam = (exam) => {
    setEditingExam(exam);
    updateView('create');
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam? All questions will be deleted')) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/exams/${examId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${userData.token}`,
          tutorid: userData.id,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Exam deleted successfully');
        setExams(exams.filter(exam => exam._id !== examId));
      } else {
        toast.error(data.message || 'Failed to delete exam');
      }
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast.error('Failed to delete exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveExam = async (examData) => {
    setIsSubmitting(true);
    try {
      const url = editingExam
        ? `${API_URL}/exams/${editingExam._id}`
        : `${API_URL}/exams`;

      const method = editingExam ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userData.token}`,
          tutorid: userData.id,
          name: `${userData.firstName} ${userData.lastName}`,
        },
        body: JSON.stringify(examData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingExam ? 'Exam updated successfully!' : 'Exam created successfully!');
        fetchExams();
        setEditingExam(null);
      } else {
        toast.error(data.message || 'Failed to save exam');
      }
    } catch (error) {
      console.error('Error saving exam:', error);
      toast.error('Failed to save exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredExams = exams.filter(exam => {
    const q = (searchTerm || '').toLowerCase();
    const examName = (exam?.examName || exam?.name || '').toLowerCase();
    const matchesSearch = !q || examName.includes(q);
    const courseId = exam?.courseId?._id || exam?.courseId || '';
    const matchesCourse = selectedCourse === 'all' || courseId === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  if (isLoading) {
    return <section className="flex justify-center items-center h-screen">
      <LoadingSpinner />
    </section>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 max-md:pb-30">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            {currentView === 'create' && (
              <>
                <h1 className="text-3xl font-bold text-gray-900">Exam Management</h1>
                <p className="text-gray-600 mt-2">Create, assign and mark exams</p>
              </>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => updateView('create')}
              className={`cursor-pointer inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm ${currentView === 'create' ? 'bg-orange-600 text-white' : 'bg-white text-orange-700 border border-orange-600'}`}
            >
              Create
            </button>
            <button
              onClick={() => updateView('assign')}
              className={`cursor-pointer inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm ${currentView === 'assign' ? 'bg-orange-600 text-white' : 'bg-white text-orange-700 border border-orange-600'}`}
            >
              Assign
            </button>
            <button
              onClick={() => updateView('mark')}
              className={`cursor-pointer inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm ${currentView === 'mark' ? 'bg-orange-600 text-white' : 'bg-white text-orange-700 border border-orange-600'}`}
            >
              Mark
            </button>
          </div>
        </div>
      </div>

      {/* Filters - only shown in Create view */}
      {currentView === 'create' && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search exams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-400 outline-none rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Course Filter */}
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-2 border-2 border-gray-400 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Courses</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Main Content: show different panes based on currentView */}
      <div className="space-y-6">
        {currentView === 'create' && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Create / Edit Exam</h2>
              <p className="text-sm text-gray-600">Use the form below to create or update exams (no modals).</p>
            </div>
            <ExamForm
              key={editingExam?._id || 'new'}
              exam={editingExam}
              courses={courses}
              onSave={handleSaveExam}
              isSubmitting={isSubmitting}
            />

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">All Exams</h3>
              {filteredExams.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {filteredExams.map(exam => (
                    <ExamCard
                      key={exam._id}
                      exam={exam}
                      onEdit={handleEditExam}
                      onDelete={handleDeleteExam}
                      isDeleting={isSubmitting}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  {exams.length === 0 ? (
                    <div>
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No exams yet</h3>
                      <p className="text-gray-600 mb-6">Create your first exam to get started</p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No results found</h3>
                      <p className="text-gray-600">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'assign' && (
          <div>
            <AssignExamToGroup />
          </div>
        )}

        {currentView === 'mark' && (
          <div>
            <MarkResponses />
          </div>
        )}
      </div>

      {/* no modal */}
    </div>
  );
}
