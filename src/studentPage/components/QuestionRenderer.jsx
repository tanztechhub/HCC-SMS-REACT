import React, { useState } from 'react';

export default function QuestionRenderer({ question, questionIndex, answer, onAnswerChange, readOnly = false }) {
  const [matchingRows, setMatchingRows] = useState(
    question.type === 'matching' && typeof question.rows === 'number'
      ? question.rows  // Only show tutor-set rows initially
      : 0
  );

  const handleChange = (response) => {
    if (readOnly || typeof onAnswerChange !== 'function') return;
    onAnswerChange(questionIndex, response);
  };

  // Count correct answers for MCQ
  const correctAnswerCount = question.type === 'multipleChoice' && question.choices
    ? (question.maxSelections || question.choices.filter(c => c.isCorrect).length)
    : 0;
  
  const isMultiSelectMCQ = correctAnswerCount > 1;

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      {/* Question Text */}
      <div className="mb-3">
        <div className="flex items-start gap-2">
          <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
            {questionIndex + 1}
          </span>
          <div>
            <p className="font-semibold text-gray-800">{question.question}</p>
            <p className="text-sm text-gray-600 mt-1">Marks: {question.marks}</p>
          </div>
        </div>
      </div>

      {/* Multiple Choice - Radio (Single Select) */}
      {question.type === 'multipleChoice' && question.choices && !isMultiSelectMCQ && (
        <div className="space-y-2 ml-8">
          {question.choices.map((choice, idx) => (
            <label key={idx} className="flex items-center cursor-pointer p-2 hover:bg-white rounded">
              <input
                type="radio"
                name={`q${questionIndex}`}
                value={choice.text}
                checked={answer?.response === choice.text}
                onChange={e => handleChange(e.target.value)}
                disabled={readOnly}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-3 text-gray-700">{choice.text}</span>
            </label>
          ))}
        </div>
      )}

      {/* Multiple Choice - Checkboxes (Multi-Select) */}
      {question.type === 'multipleChoice' && question.choices && isMultiSelectMCQ && (
        <div className="space-y-2 ml-8">
          {question.choices.map((choice, idx) => {
            const currentAnswers = Array.isArray(answer?.response) ? answer?.response : [];
            const isChecked = currentAnswers.includes(choice.text);
            const canCheck = isChecked || currentAnswers.length < correctAnswerCount;

            return (
              <label key={idx} className={`flex items-center p-2 rounded cursor-pointer ${
                canCheck ? 'hover:bg-white' : 'opacity-50 cursor-not-allowed'
              }`}>
                <input
                  type="checkbox"
                  value={choice.text}
                  checked={isChecked}
                  onChange={e => {
                    const newAnswers = isChecked
                      ? currentAnswers.filter(a => a !== choice.text)
                      : [...currentAnswers, choice.text];
                    handleChange(newAnswers);
                  }}
                  disabled={readOnly || !canCheck}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="ml-3 text-gray-700">{choice.text}</span>
              </label>
            );
          })}
        </div>
      )}

      {/* Essay */}
      {question.type === 'essay' && (
        <div className="ml-8">
          <textarea
            value={answer?.response || ''}
            onChange={e => handleChange(e.target.value)}
            maxLength={question.maxCharacters || undefined}
            placeholder="Enter your answer here..."
            readOnly={readOnly}
            className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={6}
          />
          {question.maxCharacters && (
            <p className="text-xs text-gray-600 mt-1">
              {answer?.response?.length || 0} / {question.maxCharacters} characters
            </p>
          )}
        </div>
      )}

      {/* Matching - New Schema with Two-Column Layout */}
      {question.type === 'matching' && question.rows !== undefined && (
        <div className="ml-8">
          {/* Column Headers with Tutor Labels */}
          <div className="grid grid-cols-2 gap-4 mb-4 pb-3 border-b-2 border-blue-300">
            <div>
              <h4 className="font-bold text-base text-blue-700">
                {question.leftLabel || 'Left Column'}
              </h4>
            </div>
            <div>
              <h4 className="font-bold text-base text-blue-700">
                {question.rightLabel || 'Right Column'}
              </h4>
            </div>
          </div>

          {/* Matching Rows - Show exactly what tutor set */}
          <div className="space-y-3">
            {Array.from({ length: question.rows }).map((_, idx) => {
              const leftAnswer = Array.isArray(answer?.response) ? (answer?.response[idx * 2] || '') : '';
              const rightAnswer = Array.isArray(answer?.response) ? (answer?.response[idx * 2 + 1] || '') : '';

              return (
                <div key={idx} className="grid grid-cols-2 gap-4 items-center">
                  {/* Left side (student input) */}
                  <textarea
                    value={leftAnswer}
                    onChange={e => {
                      const newResponse = Array.isArray(answer?.response) 
                        ? [...answer.response] 
                        : Array(question.rows * 2 + (question.allowStudentAddRows ? 2 : 0)).fill('');
                      newResponse[idx * 2] = e.target.value;
                      handleChange(newResponse);
                    }}
                    placeholder={`Enter ${question.leftLabel || 'left'} value`}
                    readOnly={readOnly}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />

                  {/* Right side (student input) */}
                  <textarea
                    value={rightAnswer}
                    onChange={e => {
                      const newResponse = Array.isArray(answer?.response) 
                        ? [...answer.response] 
                        : Array(question.rows * 2 + (question.allowStudentAddRows ? 2 : 0)).fill('');
                      newResponse[idx * 2 + 1] = e.target.value;
                      handleChange(newResponse);
                    }}
                    placeholder={`Enter ${question.rightLabel || 'right'} value`}
                    readOnly={readOnly}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              );
            })}
          </div>

          {/* Add Row Button (if allowed) - for rows beyond tutor-set count */}
          {question.allowStudentAddRows && matchingRows > question.rows && (
            <div className="mt-4 space-y-3">
              {Array.from({ length: matchingRows - question.rows }).map((_, idx) => {
                const baseIdx = question.rows + idx;
                const leftAnswer = Array.isArray(answer?.response) ? (answer?.response[baseIdx * 2] || '') : '';
                const rightAnswer = Array.isArray(answer?.response) ? (answer?.response[baseIdx * 2 + 1] || '') : '';

                return (
                  <div key={`extra-${idx}`} className="grid grid-cols-2 gap-4 items-center opacity-75">
                    <input
                      type="text"
                      value={leftAnswer}
                      onChange={e => {
                        const newResponse = Array.isArray(answer?.response) ? [...answer.response] : [];
                        newResponse[baseIdx * 2] = e.target.value;
                        handleChange(newResponse);
                      }}
                      placeholder="Extra row"
                      readOnly={readOnly}
                      className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <input
                      type="text"
                      value={rightAnswer}
                      onChange={e => {
                        const newResponse = Array.isArray(answer?.response) ? [...answer.response] : [];
                        newResponse[baseIdx * 2 + 1] = e.target.value;
                        handleChange(newResponse);
                      }}
                      placeholder="Extra row"
                      readOnly={readOnly}
                      className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Row Button (if allowed) */}
          {question.allowStudentAddRows && matchingRows === question.rows && !readOnly && (
            <button
              onClick={() => setMatchingRows(prev => prev + 1)}
              className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-300 rounded hover:bg-blue-100 text-sm font-medium"
            >
              + Add Row
            </button>
          )}
        </div>
      )}

      {/* Legacy Matching (old schema fallback) */}
      {question.type === 'matching' && question.matchingLeft && question.matchingRight && !question.rows && (
        <div className="ml-8 grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Match these:</h4>
            <div className="space-y-2">
              {question.matchingLeft.map((left, idx) => (
                <div key={idx} className="p-2 bg-white rounded border">
                  {left.text}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">With these:</h4>
            <div className="space-y-2">
              {question.matchingLeft.map((left, idx) => (
                <select
                  key={idx}
                  value={answer?.response?.[idx] || ''}
                  onChange={e => {
                    const newResponse = answer?.response ? [...answer.response] : [];
                    newResponse[idx] = e.target.value;
                    handleChange(newResponse);
                  }}
                  disabled={readOnly}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  {question.matchingRight.map((right, ridx) => (
                    <option key={ridx} value={right.id}>{right.text}</option>
                  ))}
                </select>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Experimental/Sections */}
      {question.type === 'experimental' && question.sections && (
        <div className="ml-8 space-y-4">
          {question.sections.map((section, idx) => (
            <div key={idx} className="border-l-4 border-orange-400 pl-4">
              <h4 className="font-semibold text-sm text-gray-800">{section.name} ({section.marks} marks)</h4>
              <textarea
                value={answer?.response?.[idx] || ''}
                onChange={e => {
                  const newResponse = answer?.response ? [...answer.response] : [];
                  newResponse[idx] = e.target.value;
                  handleChange(newResponse);
                }}
                placeholder={`Answer for ${section.name}...`}
                readOnly={readOnly}
                className="w-full border rounded p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
