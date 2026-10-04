import React from 'react';

export default function ReadOnlyQuestionRenderer({ question, questionIndex, answer, emptyText }) {
  const fallback = emptyText || 'No response provided';
  const response = answer?.response;

  if (!question) {
    return (
      <div className="text-sm text-gray-600 italic">No question details found.</div>
    );
  }

  const renderHeader = () => (
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
  );

  const renderEssay = () => (
    <div className="bg-white border border-gray-200 rounded p-3 text-sm text-gray-700 whitespace-pre-wrap">
      {response ? response : fallback}
    </div>
  );

  const renderMultipleChoice = () => {
    const selected = Array.isArray(response)
      ? response
      : response
      ? [response]
      : [];

    if (!question.choices || question.choices.length === 0) {
      return (
        <div className="text-sm text-gray-600 italic">No choices configured.</div>
      );
    }

    return (
      <div className="space-y-2">
        {question.choices.map((choice, idx) => {
          const isSelected = selected.includes(choice.text);
          return (
            <div
              key={idx}
              className={`text-sm px-3 py-2 rounded border ${
                isSelected ? 'border-orange-400 bg-orange-50 text-orange-800' : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              {choice.text}
            </div>
          );
        })}
        {selected.length === 0 && (
          <div className="text-xs text-gray-500 italic">{fallback}</div>
        )}
      </div>
    );
  };

  const renderMatchingNew = () => {
    const responseArray = Array.isArray(response) ? response : [];
    const totalRows = Math.max(Number(question.rows) || 0, Math.ceil(responseArray.length / 2));

    if (totalRows === 0) {
      return <div className="text-sm text-gray-600 italic">{fallback}</div>;
    }

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-blue-700 border-b pb-2">
          <span>{question.leftLabel || 'Left Column'}</span>
          <span>{question.rightLabel || 'Right Column'}</span>
        </div>
        {Array.from({ length: totalRows }).map((_, idx) => (
          <div key={idx} className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded px-3 py-2 text-sm text-gray-700">
              {responseArray[idx * 2] || fallback}
            </div>
            <div className="bg-white border border-gray-200 rounded px-3 py-2 text-sm text-gray-700">
              {responseArray[idx * 2 + 1] || fallback}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMatchingLegacy = () => {
    const responseArray = Array.isArray(response) ? response : [];

    return (
      <div className="space-y-2">
        {(question.matchingLeft || []).map((left, idx) => {
          const rightId = responseArray[idx];
          const rightMatch = (question.matchingRight || []).find(r => r.id === rightId);
          return (
            <div key={idx} className="flex items-start justify-between gap-4 bg-white border border-gray-200 rounded px-3 py-2">
              <span className="text-sm text-gray-700">{left.text}</span>
              <span className="text-sm font-semibold text-gray-700">{rightMatch?.text || fallback}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderExperimental = () => {
    const responseArray = Array.isArray(response) ? response : [];
    return (
      <div className="space-y-3">
        {(question.sections || []).map((section, idx) => (
          <div key={idx} className="border-l-4 border-orange-400 bg-white rounded px-3 py-2">
            <div className="text-sm font-semibold text-gray-800">{section.name || `Section ${idx + 1}`}</div>
            <div className="text-xs text-gray-500 mb-2">Marks: {section.marks}</div>
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {responseArray[idx] || fallback}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderBody = () => {
    if (question.type === 'multipleChoice') return renderMultipleChoice();
    if (question.type === 'essay') return renderEssay();
    if (question.type === 'matching' && question.rows !== undefined) return renderMatchingNew();
    if (question.type === 'matching' && question.matchingLeft && question.matchingRight) return renderMatchingLegacy();
    if (question.type === 'experimental') return renderExperimental();

    return <div className="text-sm text-gray-600 italic">Unsupported question type.</div>;
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      {renderHeader()}
      {renderBody()}
    </div>
  );
}
