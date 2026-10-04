import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import QuestionForm from './QuestionForm';
import AutoMarkIndicator from './AutoMarkIndicator';

const API_URL = import.meta.env.VITE_API_URL;

export default function ExamModal({ exam, courses, isOpen, onClose, onSave, isSubmitting }) {
  const [formData, setFormData] = useState({
    examName: '',
    courseId: '',
    description: '',
    answerMode: 'student'
  });

  const [questions, setQuestions] = useState([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestionIdx, setEditingQuestionIdx] = useState(null);
  const [canAutoMark, setCanAutoMark] = useState(false);

  const userData = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (exam) {
      setFormData({
        examName: exam.examName,
        courseId: exam.courseId._id || exam.courseId,
        description: exam.description || '',
        answerMode: exam.answerMode || 'student'
      });
      setQuestions(exam.questions || []);
    } else {
      setFormData({
        examName: '',
        courseId: '',
        description: '',
        answerMode: 'student'
      });
      setQuestions([]);
    }
  }, [exam, isOpen]);

  useEffect(() => {
    // Check if all questions are multiple choice
    const allMultipleChoice = questions.length > 0 && questions.every(q => q.type === 'multipleChoice');
    setCanAutoMark(allMultipleChoice);
  }, [questions]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddQuestion = (newQuestion) => {
    if (editingQuestionIdx !== null) {
      const updatedQuestions = [...questions];
      updatedQuestions[editingQuestionIdx] = newQuestion;
      setQuestions(updatedQuestions);
      setEditingQuestionIdx(null);
    } else {
      // Generate unique questionId
      const questionId = `Q${Date.now()}`;
      setQuestions([...questions, { ...newQuestion, questionId }]);
    }
    setShowQuestionForm(false);
  };

  const handleEditQuestion = (idx) => {
    setEditingQuestionIdx(idx);
    setShowQuestionForm(true);
  };

  const handleDeleteQuestion = (idx) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      setQuestions(questions.filter((_, i) => i !== idx));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.examName || !formData.courseId) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    // Prepare data for submission
    const submitData = {
      examName: formData.examName,
      courseId: formData.courseId,
      description: formData.description,
      answerMode: formData.answerMode,
      questions: questions
    };

    await onSave(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="flex items-start justify-center min-h-screen pt-4 px-4 pb-20">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {exam ? 'Edit Exam' : 'Create New Exam'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Exam Details</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Name *
                  </label>
                  <input
                    type="text"
                    name="examName"
                    value={formData.examName}
                    onChange={handleInputChange}
                    placeholder="e.g., Coffee Roasting Midterm"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course *
                  </label>
                  <select
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a course</option>
                    {courses.map(course => (
                      <option key={course._id} value={course._id} className='text-black'>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Add exam description, instructions, or notes..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Who answers this exam?
                  </label>
                  <select
                    name="answerMode"
                    value={formData.answerMode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="student">Students answer (default)</option>
                    <option value="tutor">Tutor answers (observations/remarks)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Tutor-answer exams show read-only inputs to students and allow tutors to enter remarks and marks.
                  </p>
                </div>
              </div>

              {/* Questions Section */}
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Total Marks: {questions.reduce((sum, q) => sum + q.marks, 0)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <AutoMarkIndicator canAutoMark={canAutoMark} />
                    <button
                      type="button"
                      onClick={() => {
                        setEditingQuestionIdx(null);
                        setShowQuestionForm(true);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </button>
                  </div>
                </div>

                {/* Questions List */}
                {questions.length > 0 ? (
                  <div className="space-y-3">
                    {questions.map((question, idx) => (
                      <div
                        key={question.questionId}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 mb-2">
                              <span className="font-semibold text-gray-900 flex-shrink-0">
                                Q{idx + 1}.
                              </span>
                              <div>
                                <p className="text-gray-800 break-words">{question.question}</p>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {question.type === 'multipleChoice' && 'Multiple Choice'}
                                    {question.type === 'essay' && 'Essay'}
                                    {question.type === 'matching' && 'Matching'}
                                    {question.type === 'experimental' && 'Experimental'}
                                  </span>
                                  <span className="text-xs text-gray-600 font-medium">
                                    {question.marks} mks
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Question type specific info */}
                            {question.type === 'multipleChoice' && question.choices && (
                              <div className="mt-2 ml-6 text-sm text-gray-600">
                                <p className="font-medium">Choices:</p>
                                {question.choices.map((choice, idx) => (
                                  <p key={idx} className="text-xs">
                                    {choice.isCorrect && '✓ '}
                                    {choice.text}
                                  </p>
                                ))}
                              </div>
                            )}

                            {question.type === 'essay' && (
                              <div className="mt-2 ml-6 text-sm text-gray-600">
                                Max characters: {question.maxCharacters || 'Unlimited'}
                              </div>
                            )}

                            {question.type === 'experimental' && question.sections && (
                              <div className="mt-2 ml-6 text-sm text-gray-600">
                                <p className="font-medium">Sections:</p>
                                {question.sections.map((section, idx) => (
                                  <p key={idx} className="text-xs">
                                    {section.name} ({section.marks} mks)
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleEditQuestion(idx)}
                              className="px-3 py-1 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(idx)}
                              className="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
                    <p className="text-gray-600">No questions added yet</p>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingQuestionIdx(null);
                        setShowQuestionForm(true);
                      }}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Question
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Saving...' : exam ? 'Update Exam' : 'Create Exam'}
              </button>
            </div>
          </form>

          {/* Question Form Modal */}
          {showQuestionForm && (
            <QuestionForm
              question={editingQuestionIdx !== null ? questions[editingQuestionIdx] : null}
              isOpen={showQuestionForm}
              onClose={() => {
                setShowQuestionForm(false);
                setEditingQuestionIdx(null);
              }}
              onSave={handleAddQuestion}
            />
          )}
        </div>
      </div>
    </div>
  );
}
