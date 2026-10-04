import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function QuestionReview({ question, questionIndex, answer, response, isAutoMarked }) {
  const getMarkColor = (marks) => {
    if (marks === 0) return 'text-red-600';
    if (marks > 0) return 'text-orange-600';
    return 'text-gray-600';
  };

  const isCorrect = (response?.marksAwarded > 0);
  
  // Count correct answers for MCQ
  const correctAnswerCount = question.type === 'multipleChoice' && question.choices
    ? question.choices.filter(c => c.isCorrect).length
    : 0;
  
  const isMultiSelectMCQ = correctAnswerCount > 1;

  return (
    <div className={`border-2 rounded-lg p-4 ${isCorrect ? 'bg-orange-50 border-orange-300' : 'bg-red-50 border-red-300'}`}>
      {/* Question Text */}
      <div className="mb-3">
        <div className="flex items-start gap-2">
          <span className={`${isCorrect ? 'bg-orange-600' : 'bg-red-600'} text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5`}>
            {questionIndex + 1}
          </span>
          <div className="flex-1">
            <p className="font-semibold text-gray-800">{question.question}</p>
            <p className="text-sm text-gray-600 mt-1">Marks: {question.marks}</p>
          </div>
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <CheckCircle className="w-6 h-6 text-orange-600" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
            <div className={`font-bold text-lg ${getMarkColor(response?.marksAwarded)}`}>
              {response?.marksAwarded || 0}/{question.marks}
            </div>
          </div>
        </div>
      </div>

      {/* Multiple Choice - Single Select */}
      {question.type === 'multipleChoice' && question.choices && !isMultiSelectMCQ && (
        <div className="space-y-3 ml-8">
          {question.choices.map((choice, idx) => {
            const studentAnswer = answer?.response;
            const isStudentSelected = studentAnswer === choice.text;
            const isCorrectAnswer = choice.isCorrect;
            const isCorrectlySelected = isStudentSelected && isCorrectAnswer;
            const isIncorrectlySelected = isStudentSelected && !isCorrectAnswer;
            const isMissedCorrect = !isStudentSelected && isCorrectAnswer;
            
            return (
              <div
                key={idx}
                className={`p-3 rounded border-l-4 flex items-start gap-3 ${
                  isCorrectlySelected || isMissedCorrect
                    ? 'bg-orange-100 border-orange-500'
                    : isIncorrectlySelected
                    ? 'bg-red-100 border-red-500'
                    : 'bg-gray-100 border-gray-400'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {isCorrectlySelected && <CheckCircle className="w-5 h-5 text-orange-600" />}
                  {isIncorrectlySelected && <XCircle className="w-5 h-5 text-red-600" />}
                  {isMissedCorrect && <CheckCircle className="w-5 h-5 text-orange-600" />}
                  {!isStudentSelected && !isCorrectAnswer && <div className="w-5 h-5 rounded border-2 border-gray-400"></div>}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    isCorrectlySelected || isMissedCorrect ? 'text-orange-700' 
                    : isIncorrectlySelected ? 'text-red-700' 
                    : 'text-gray-700'
                  }`}>
                    {choice.text}
                  </p>
                  <div className="flex gap-2 mt-1">
                    {isCorrectlySelected && <span className="text-xs font-bold text-orange-600">✓ Correct • you selected</span>}
                    {isIncorrectlySelected && <span className="text-xs font-bold text-red-600">✗ Incorrect • you selected</span>}
                    {isMissedCorrect && <span className="text-xs font-bold text-orange-600">✓ Correct • you missed</span>}
                    {!isStudentSelected && !isCorrectAnswer && <span className="text-xs text-gray-600">Not selected • not correct</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Multiple Choice - Multi-Select */}
      {question.type === 'multipleChoice' && question.choices && isMultiSelectMCQ && (
        <div className="space-y-3 ml-8">
          <div className="mb-3">
            <p className="text-sm font-semibold text-gray-700">Select the {correctAnswerCount} correct answer{correctAnswerCount !== 1 ? 's' : ''}:</p>
          </div>

          {question.choices.map((choice, idx) => {
            const studentAnswers = Array.isArray(answer?.response) ? answer?.response : [];
            const isStudentSelected = studentAnswers.includes(choice.text);
            const isCorrectAnswer = choice.isCorrect;
            const isCorrectlySelected = isStudentSelected && isCorrectAnswer;
            const isIncorrectlySelected = isStudentSelected && !isCorrectAnswer;
            const isMissedCorrect = !isStudentSelected && isCorrectAnswer;
            
            return (
              <div
                key={idx}
                className={`p-3 rounded border-l-4 flex items-start gap-3 ${
                  isCorrectlySelected || isMissedCorrect
                    ? 'bg-orange-100 border-orange-500'
                    : isIncorrectlySelected
                    ? 'bg-red-100 border-red-500'
                    : 'bg-gray-100 border-gray-400'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {isCorrectlySelected && <CheckCircle className="w-5 h-5 text-orange-600" />}
                  {isIncorrectlySelected && <XCircle className="w-5 h-5 text-red-600" />}
                  {isMissedCorrect && <CheckCircle className="w-5 h-5 text-orange-600" />}
                  {!isStudentSelected && !isCorrectAnswer && <div className="w-5 h-5 rounded border-2 border-gray-400"></div>}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    isCorrectlySelected || isMissedCorrect ? 'text-orange-700' 
                    : isIncorrectlySelected ? 'text-red-700' 
                    : 'text-gray-700'
                  }`}>
                    {choice.text}
                  </p>
                  <div className="flex gap-2 mt-1">
                    {isCorrectlySelected && <span className="text-xs font-bold text-orange-600">✓ Correct • you selected</span>}
                    {isIncorrectlySelected && <span className="text-xs font-bold text-red-600">✗ Incorrect • you selected</span>}
                    {isMissedCorrect && <span className="text-xs font-bold text-orange-600">✓ Correct • you missed</span>}
                    {!isStudentSelected && !isCorrectAnswer && <span className="text-xs text-gray-600">Not selected • not correct</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Essay */}
      {question.type === 'essay' && (
        <div className="ml-8">
          <p className="text-sm font-semibold text-gray-700 mb-2">Your Answer:</p>
          <div className="bg-white p-3 rounded border border-gray-300 italic text-gray-800">
            {answer?.response || '(No answer provided)'}
          </div>
          {question.maxCharacters && (
            <p className="text-xs text-gray-600 mt-1">
              {answer?.response?.length || 0} / {question.maxCharacters} characters
            </p>
          )}
          <p className="text-sm text-gray-600 mt-2">
            <span className="font-semibold">Note:</span> Essay answers require manual grading by tutor.
          </p>
        </div>
      )}

      {/* Matching - New Schema */}
      {question.type === 'matching' && question.rows !== undefined && (
        <div className="ml-8">
          {/* Column Headers */}
          <div className="grid grid-cols-2 gap-4 mb-4 pb-3 border-b-2 border-blue-300">
            <h4 className="font-bold text-base text-blue-700">{question.leftLabel || 'Left Column'}</h4>
            <h4 className="font-bold text-base text-blue-700">{question.rightLabel || 'Right Column'}</h4>
          </div>

          {/* Your Answers */}
          <div className="space-y-3">
            {Array.from({ length: question.rows }).map((_, idx) => {
              const leftAnswer = Array.isArray(answer?.response) ? answer?.response[idx * 2] : '';
              const rightAnswer = Array.isArray(answer?.response) ? answer?.response[idx * 2 + 1] : '';
              const answered = leftAnswer || rightAnswer;

              return (
                <div
                  key={idx}
                  className={`p-3 rounded border-l-4 grid grid-cols-2 gap-4 ${
                    answered ? 'bg-blue-100 border-blue-500' : 'bg-yellow-100 border-yellow-500'
                  }`}
                >
                  <div>
                    <p className={`text-xs ${answered ? 'text-blue-600 font-bold' : 'text-yellow-600'}`}>YOUR RESPONSE:</p>
                    <p className="text-sm mt-1">{leftAnswer || '(Not answered)'}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${answered ? 'text-blue-600 font-bold' : 'text-yellow-600'}`}>YOUR RESPONSE:</p>
                    <p className="text-sm mt-1">{rightAnswer || '(Not answered)'}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-orange-700 mt-4 p-3 bg-orange-50 rounded border-l-4 border-orange-300">
            <span className="font-semibold">Pending Tutor Review:</span> Matching answers require manual grading by tutor. Your score will be updated once graded.
          </p>
        </div>
      )}

      {/* Legacy Matching (old schema fallback) */}
      {question.type === 'matching' && question.matchingLeft && question.matchingRight && !question.rows && (
        <div className="ml-8">
          <p className="text-sm font-semibold text-gray-700 mb-3">Your Matches:</p>
          <div className="space-y-2">
            {question.matchingLeft.map((left, idx) => {
              const studentMatch = answer?.response?.[idx];
              const correctMatch = question.matchingPairs?.find(p => p.left === left.id);
              const isMatchCorrect = studentMatch === correctMatch?.right;

              return (
                <div
                  key={idx}
                  className={`p-3 rounded border-l-4 ${
                    isMatchCorrect ? 'bg-orange-100 border-orange-500' : 'bg-red-100 border-red-500'
                  }`}
                >
                  <p className="font-semibold text-gray-800">{left.text}</p>
                  <p className={`text-sm mt-1 ${isMatchCorrect ? 'text-orange-700' : 'text-red-700'}`}>
                    Your answer: {question.matchingRight?.find(r => r.id === studentMatch)?.text || '(Not answered)'}
                  </p>
                  {!isMatchCorrect && (
                    <p className="text-sm text-orange-700 mt-1">
                      Correct: {question.matchingRight?.find(r => r.id === correctMatch?.right)?.text}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Experimental/Sections */}
      {question.type === 'experimental' && question.sections && (
        <div className="ml-8 space-y-4">
          {question.sections.map((section, idx) => (
            <div key={idx} className={`border-l-4 pl-4 p-3 rounded ${isCorrect ? 'bg-orange-100 border-orange-500' : 'bg-yellow-100 border-yellow-500'}`}>
              <h4 className="font-semibold text-sm text-gray-800">
                {section.name} ({section.marks} marks)
              </h4>
              <div className="bg-white p-2 rounded mt-2 italic border border-gray-300 text-gray-800 max-h-24 overflow-y-auto">
                {answer?.response?.[idx] || '(No answer provided)'}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                <span className="font-semibold">Note:</span> Section answers require manual grading by tutor.
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
