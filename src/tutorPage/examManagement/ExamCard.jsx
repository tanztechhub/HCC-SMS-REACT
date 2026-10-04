import React, { useState } from 'react';
import { Edit, Trash2, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AutoMarkIndicator from './AutoMarkIndicator';

const API_URL = import.meta.env.VITE_API_URL;

export default function ExamCard({ exam, onEdit, onDelete, isDeleting }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  const handleDeleteClick = async () => {
    await onDelete(exam._id);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                {exam.examName}
              </h3>
              <AutoMarkIndicator canAutoMark={exam.allowAutoMarking} />
            </div>
            <p className="text-sm text-gray-600 mb-2">{exam.name}</p>
          </div>
          <div className="flex-shrink-0">
            {exam.isPublished && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                Published
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-200">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{exam.questions?.length || 0}</div>
            <div className="text-xs text-gray-600">Questions</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{exam.totalMarks || 0}</div>
            <div className="text-xs text-gray-600">Total Marks</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {exam.questions?.reduce((acc, q) => {
                const count = {
                  multipleChoice: 'MC',
                  essay: 'E',
                  matching: 'M',
                  experimental: 'Exp'
                }[q.type] || '';
                return acc;
              }, []).length || 0}
            </div>
            <div className="text-xs text-gray-600">Types</div>
          </div>
        </div>
      </div>

      {/* Card Body - Description */}
      {exam.description && (
        <div className="px-4 py-3 border-b border-gray-200">
          <p className="text-sm text-gray-700 line-clamp-2">{exam.description}</p>
        </div>
      )}

      {/* Expandable Questions Section */}
      <div className="border-t border-gray-200">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <span className="text-sm font-medium text-gray-700">
            Questions ({exam.questions?.length || 0})
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>

        {isExpanded && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 max-h-64 overflow-y-auto">
            {exam.questions && exam.questions.length > 0 ? (
              <div className="space-y-2">
                {exam.questions.map((question, idx) => (
                  <div key={question.questionId} className="text-sm bg-white rounded p-2 border border-gray-200">
                    <div className="flex items-start gap-2 mb-1">
                      <span className="font-semibold text-gray-900 flex-shrink-0">Q{idx + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 line-clamp-2">{question.question}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 ml-6">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 font-medium">
                        {question.type === 'multipleChoice' && 'Multiple Choice'}
                        {question.type === 'essay' && 'Essay'}
                        {question.type === 'matching' && 'Matching'}
                        {question.type === 'experimental' && 'Experimental'}
                      </span>
                      <span>{question.marks} mks</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No questions added yet</p>
            )}
          </div>
        )}
      </div>

      {/* Card Footer - Actions */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-2">
        <button
          onClick={() => onEdit(exam)}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </button>
        <button
          onClick={handleDeleteClick}
          disabled={isDeleting}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </button>
      </div>
    </div>
  );
}
