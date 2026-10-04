import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function QuestionForm({ question, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    type: 'multipleChoice',
    question: '',
    marks: 1
  });

  const [choices, setChoices] = useState([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ]);

  const [maxCharacters, setMaxCharacters] = useState('');

  const [matchingLeft, setMatchingLeft] = useState([
    { id: '1', text: '' },
    { id: '2', text: '' }
  ]);

  const [matchingRight, setMatchingRight] = useState([
    { id: '1', text: '' },
    { id: '2', text: '' }
  ]);

  // Two-column matching settings (tutor-defined labels and rows)
  const [leftLabel, setLeftLabel] = useState('TASTE QUALITY - INTENSITY');
  const [rightLabel, setRightLabel] = useState('FLAVOUR');
  const [rows, setRows] = useState(3);
  const [allowStudentAddRows, setAllowStudentAddRows] = useState(false);

  const [sections, setSections] = useState([
    { name: '', marks: 1 },
    { name: '', marks: 1 }
  ]);

  useEffect(() => {
    if (question) {
      setFormData({
        type: question.type,
        question: question.question,
        marks: question.marks
      });

      if (question.type === 'multipleChoice' && question.choices) {
        setChoices(question.choices.map(c => ({ ...c })));
      }

      if (question.type === 'essay') {
        setMaxCharacters(question.maxCharacters?.toString() || '');
      }

      if (question.type === 'matching') {
        setMatchingLeft(question.matchingLeft?.map(m => ({ ...m })) || [{ id: '1', text: '' }]);
        setMatchingRight(question.matchingRight?.map(m => ({ ...m })) || [{ id: '1', text: '' }]);
        setLeftLabel(question.leftLabel || 'TASTE QUALITY - INTENSITY');
        setRightLabel(question.rightLabel || 'FLAVOUR');
        setRows(question.rows || 3);
        setAllowStudentAddRows(!!question.allowStudentAddRows);
      }

      if (question.type === 'experimental') {
        setSections(question.sections?.map(s => ({ ...s })) || [{ name: '', marks: 1 }]);
      }
    }
  }, [question, isOpen]);

  const handleTypeChange = (type) => {
    setFormData(prev => ({ ...prev, type }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'marks' ? parseInt(value) || 0 : value
    }));
  };

  // Multiple Choice handlers
  const handleChoiceChange = (idx, field, value) => {
    const updatedChoices = [...choices];
    updatedChoices[idx][field] = value;
    setChoices(updatedChoices);
  };

  const validateChoices = () => {
    if (choices.length < 2) {
      toast.error('At least 2 choices are required');
      return false;
    }
    if (choices.some(c => !c.text.trim())) {
      toast.error('All choices must have text');
      return false;
    }
    if (!choices.some(c => c.isCorrect)) {
      toast.error('At least one choice must be marked as correct');
      return false;
    }
    return true;
  };

  const addChoice = () => {
    setChoices([...choices, { text: '', isCorrect: false }]);
  };

  const removeChoice = (idx) => {
    if (choices.length > 2) {
      setChoices(choices.filter((_, i) => i !== idx));
    } else {
      toast.error('At least 2 choices are required');
    }
  };

  // Matching handlers
  const handleMatchingLeftChange = (idx, field, value) => {
    const updated = [...matchingLeft];
    updated[idx][field] = value;
    setMatchingLeft(updated);
  };

  const handleMatchingRightChange = (idx, field, value) => {
    const updated = [...matchingRight];
    updated[idx][field] = value;
    setMatchingRight(updated);
  };

  const validateMatching = () => {
    if (matchingLeft.length < 2 || matchingRight.length < 2) {
      toast.error('At least 2 items needed on each side');
      return false;
    }
    // if (matchingLeft.some(m => !m.text.trim()) || matchingRight.some(m => !m.text.trim())) {
    //   toast.error('All items must have text');
    //   return false;
    // }
    return true;
  };

  const addMatchingLeft = () => {
    const newId = Math.max(...matchingLeft.map(m => parseInt(m.id) || 0), 0) + 1;
    setMatchingLeft([...matchingLeft, { id: newId.toString(), text: '' }]);
  };

  const addMatchingRight = () => {
    const newId = Math.max(...matchingRight.map(m => parseInt(m.id) || 0), 0) + 1;
    setMatchingRight([...matchingRight, { id: newId.toString(), text: '' }]);
  };

  const removeMatchingLeft = (idx) => {
    if (matchingLeft.length > 2) {
      setMatchingLeft(matchingLeft.filter((_, i) => i !== idx));
    } else {
      toast.error('At least 2 items required');
    }
  };

  const removeMatchingRight = (idx) => {
    if (matchingRight.length > 2) {
      setMatchingRight(matchingRight.filter((_, i) => i !== idx));
    } else {
      toast.error('At least 2 items required');
    }
  };

  // Experimental handlers
  const handleSectionChange = (idx, field, value) => {
    const updated = [...sections];
    updated[idx][field] = field === 'marks' ? parseInt(value) || 0 : value;
    setSections(updated);
  };

  const validateSections = () => {
    if (sections.length < 1) {
      toast.error('At least 1 section is required');
      return false;
    }
    if (sections.some(s => !s.name.trim())) {
      toast.error('All sections must have a name');
      return false;
    }
    return true;
  };

  const addSection = () => {
    setSections([...sections, { name: '', marks: 1 }]);
  };

  const removeSection = (idx) => {
    if (sections.length > 1) {
      setSections(sections.filter((_, i) => i !== idx));
    } else {
      toast.error('At least 1 section required');
    }
  };

  // Main submit handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.question.trim()) {
      toast.error('Question text is required');
      return;
    }

    if (formData.marks < 1) {
      toast.error('Marks must be at least 1');
      return;
    }

    let questionData = {
      type: formData.type,
      question: formData.question,
      marks: formData.marks
    };

    // Validate based on type
    if (formData.type === 'multipleChoice') {
      if (!validateChoices()) return;
      questionData.choices = choices;
    } else if (formData.type === 'essay') {
      questionData.maxCharacters = maxCharacters ? parseInt(maxCharacters) : null;
    } else if (formData.type === 'matching') {
      // two-column free-text matching: tutor provides labels and number of rows
      questionData.leftLabel = leftLabel || 'TASTE QUALITY - INTENSITY';
      questionData.rightLabel = rightLabel || 'FLAVOUR';
      questionData.rows = Number(rows) || 1;
      questionData.allowStudentAddRows = !!allowStudentAddRows;
    } else if (formData.type === 'experimental') {
      if (!validateSections()) return;
      questionData.sections = sections;
    }

    onSave(questionData);
    toast.success('Question added successfully');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="flex items-start justify-center min-h-screen pt-4 px-4 pb-20">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {question ? 'Edit Question' : 'Add New Question'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              {/* Question Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Question Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'multipleChoice', label: 'Multiple Choice' },
                    { value: 'essay', label: 'Essay / Short Answer' },
                    { value: 'matching', label: 'Matching' },
                    { value: 'experimental', label: 'Experimental / Sections' }
                  ].map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleTypeChange(type.value)}
                      className={`p-3 rounded-lg border-2 transition-colors text-sm font-medium ${
                        formData.type === type.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text *
                  </label>
                  <textarea
                    name="question"
                    value={formData.question}
                    onChange={handleInputChange}
                    placeholder="Enter the question..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marks (mks) *
                  </label>
                  <input
                    type="number"
                    name="marks"
                    value={formData.marks}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Type-Specific Fields */}
              {formData.type === 'multipleChoice' && (
                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900">Answer Choices</h3>
                  <div className="space-y-3">
                    {choices.map((choice, idx) => (
                      <div key={idx} className="flex items-end gap-3">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Choice {idx + 1}
                          </label>
                          <input
                            type="text"
                            value={choice.text}
                            onChange={(e) => handleChoiceChange(idx, 'text', e.target.value)}
                            placeholder="Enter choice text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={choice.isCorrect}
                            onChange={(e) => handleChoiceChange(idx, 'isCorrect', e.target.checked)}
                            className="h-4 w-4 text-blue-600 rounded"
                          />
                          <span className="text-sm text-gray-700">Correct</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeChoice(idx)}
                          disabled={choices.length <= 2}
                          className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addChoice}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Choice
                  </button>
                </div>
              )}

              {formData.type === 'essay' && (
                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900">Essay Settings</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Characters (leave empty for unlimited)
                    </label>
                    <input
                      type="number"
                      value={maxCharacters}
                      onChange={(e) => setMaxCharacters(e.target.value)}
                      placeholder="e.g., 500"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    Students will be able to type their answer. This question requires manual marking by tutor.
                  </p>
                </div>
              )}

              {formData.type === 'matching' && (
                <div className="space-y-6 border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900">Two-Column Free-text Question</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Left column label</label>
                      <input
                        type="text"
                        value={leftLabel}
                        onChange={(e) => setLeftLabel(e.target.value)}
                        placeholder={`e.g., ${leftLabel || 'Left Column'}`}
                        className="w-full px-4 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Right column label</label>
                      <input
                        type="text"
                        value={rightLabel}
                        onChange={(e) => setRightLabel(e.target.value)}
                        placeholder={`e.g., ${rightLabel || 'Right Column'}`}
                        className="w-full px-4 py-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Number of rows</label>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setRows(r => Math.max(1, (r || 1) - 1))} className="px-2 py-1 bg-gray-100 rounded">-</button>
                        <input
                          type="number"
                          min="1"
                          value={rows}
                          onChange={(e) => setRows(parseInt(e.target.value) || 1)}
                          className="w-24 px-3 py-2 border border-gray-300 rounded"
                        />
                        <button type="button" onClick={() => setRows(r => (r || 1) + 1)} className="px-2 py-1 bg-gray-100 rounded">+</button>
                        <div className="ml-3 text-sm text-gray-500">Adjust rows to see live preview below</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" id="allowAdd" checked={allowStudentAddRows} onChange={(e) => setAllowStudentAddRows(e.target.checked)} />
                      <label htmlFor="allowAdd" className="text-sm text-gray-700">Allow students to add rows</label>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">Tutor defines labels and row count; students will type free-text answers in both columns. Tutor does not populate column cells.</p>

                  {/* Live Preview */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preview (Student view)</label>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="flex bg-gray-50 text-sm font-medium text-gray-700 px-4 py-2">
                        <div className="w-1/2">{leftLabel || 'Left Column'}</div>
                        <div className="w-1/2 text-right">{rightLabel || 'Right Column'}</div>
                      </div>
                      <div className="p-4 space-y-2 bg-white">
                        {Array.from({ length: Math.max(1, Number(rows) || 1) }).map((_, i) => (
                          <div key={i} className="grid grid-cols-2 gap-4">
                            <input disabled placeholder="Student answer..." className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-50 text-sm" />
                            <input disabled placeholder="Student answer..." className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-50 text-sm" />
                          </div>
                        ))}
                        {allowStudentAddRows && <div className="text-xs text-gray-500 italic">Students can add more rows when answering.</div>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {formData.type === 'experimental' && (
                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900">Answer Sections</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Define the sections students should address in their answer (e.g., Recipe, Technical, Sensory). Each section contributes to the total marks.
                  </p>
                  <div className="space-y-3">
                    {sections.map((section, idx) => (
                      <div key={idx} className="flex gap-3 items-end">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Section Name
                          </label>
                          <input
                            type="text"
                            value={section.name}
                            onChange={(e) => handleSectionChange(idx, 'name', e.target.value)}
                            placeholder="e.g., Recipe, Technical, Sensory"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="w-24">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Marks
                          </label>
                          <input
                            type="number"
                            value={section.marks}
                            onChange={(e) => handleSectionChange(idx, 'marks', e.target.value)}
                            min="1"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSection(idx)}
                          disabled={sections.length <= 1}
                          className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addSection}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Section
                  </button>
                </div>
              )}
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Save Question
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
