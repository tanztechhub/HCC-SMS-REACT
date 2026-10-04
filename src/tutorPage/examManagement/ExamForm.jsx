import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import QuestionForm from './QuestionForm';
import AutoMarkIndicator from './AutoMarkIndicator';

export default function ExamForm({ exam, courses, onSave, isSubmitting }) {
  const [formData, setFormData] = useState({ examName: '', courseId: '', description: '', answerMode: 'student' });
  const [questions, setQuestions] = useState([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestionIdx, setEditingQuestionIdx] = useState(null);
  const [canAutoMark, setCanAutoMark] = useState(false);

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
      setFormData({ examName: '', courseId: '', description: '', answerMode: 'student' });
      setQuestions([]);
    }
  }, [exam]);

  useEffect(() => {
    const allMultipleChoice = questions.length > 0 && questions.every(q => q.type === 'multipleChoice');
    setCanAutoMark(allMultipleChoice);
  }, [questions]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddQuestion = (newQuestion) => {
    if (editingQuestionIdx !== null) {
      const updated = [...questions];
      const existing = updated[editingQuestionIdx] || {};
      updated[editingQuestionIdx] = { ...existing, ...newQuestion, questionId: existing.questionId || newQuestion.questionId || `Q${Date.now()}` };
      setQuestions(updated);
      setEditingQuestionIdx(null);
    } else {
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
    e && e.preventDefault && e.preventDefault();
    if (!formData.examName || !formData.courseId) return toast.error('Please fill required fields');
    if (questions.length === 0) return toast.error('Add at least one question');

    const submitData = {
      examName: formData.examName,
      courseId: formData.courseId,
      description: formData.description,
      answerMode: formData.answerMode,
      questions
    };

    await onSave(submitData);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Name *</label>
            <input name="examName" value={formData.examName} onChange={handleInputChange} className="w-full px-3 py-2 border-2 border-gray-300 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
            <select name="courseId" value={formData.courseId} onChange={handleInputChange} className="w-full px-3 py-2 border-2 border-gray-300 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent rounded">
              <option value="">Select a course</option>
              {courses.map(c => (<option key={c._id} value={c._id}>{c.name}</option>))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border-2 border-gray-300 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent rounded" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Who answers this exam?</label>
            <select
              name="answerMode"
              value={formData.answerMode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border-2 border-gray-300 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent rounded"
            >
              <option value="student">Students answer (default)</option>
              <option value="tutor">Tutor answers (observations/remarks)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Tutor-answer exams show read-only inputs to students and allow tutors to enter remarks and marks.
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-300 pt-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-semibold">Questions</h4>
              <p className="text-sm text-gray-600">Total Marks: {questions.reduce((s, q) => s + (q.marks || 0), 0)}</p>
            </div>
            <div className="flex items-center gap-3">
              <AutoMarkIndicator canAutoMark={canAutoMark} />
              <button type="button" onClick={() => { setEditingQuestionIdx(null); setShowQuestionForm(true); }} className="bg-blue-600 text-white px-3 py-1 rounded cursor-pointer">Add Question</button>
            </div>
          </div>

          {questions.length > 0 ? (
            <div className="space-y-3">
              {questions.map((question, idx) => (
                <div key={question.questionId} className="p-3 border-2 border-gray-300 rounded bg-gray-50">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium">Q{idx+1}. {question.question}</div>
                      <div className="text-sm text-gray-600">Type: <span className="font-semibold bg-blue-50 text-blue-700 px-2 rounded-full ">{question.type}</span> — {question.marks} mks</div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleEditQuestion(idx)} className="px-3 py-1 bg-blue-500 text-white rounded">Edit</button>
                      <button type="button" onClick={() => handleDeleteQuestion(idx)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 border border-dashed border-gray-300 text-center text-gray-600">No questions yet</div>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button type="button" onClick={() => { setFormData({ examName: '', courseId: '', description: '' }); setQuestions([]); }} className="px-4 py-2 border border-gray-300 rounded cursor-pointer">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-orange-600 text-white rounded cursor-pointer">{isSubmitting ? 'Saving...' : (exam ? 'Update Exam' : 'Create Exam')}</button>
        </div>
      </form>

      {showQuestionForm && (
        <QuestionForm
          question={editingQuestionIdx !== null ? questions[editingQuestionIdx] : null}
          isOpen={showQuestionForm}
          onClose={() => { setShowQuestionForm(false); setEditingQuestionIdx(null); }}
          onSave={handleAddQuestion}
        />
      )}
    </div>
  );
}
