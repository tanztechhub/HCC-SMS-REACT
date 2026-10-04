import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import ReadOnlyQuestionRenderer from '../../studentPage/components/ReadOnlyQuestionRenderer';
import QuestionRenderer from '../../studentPage/components/QuestionRenderer';

const API_URL = import.meta.env.VITE_API_URL;

export default function MarkResponses() {
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const [groups, setGroups] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [examsToMark, setExamsToMark] = useState([]);
  const [grading, setGrading] = useState(false);
  const [expandedResponse, setExpandedResponse] = useState(null);
  const [markEdits, setMarkEdits] = useState({});
  const [remarkEdits, setRemarkEdits] = useState({});
  const [pendingByStudent, setPendingByStudent] = useState({});

  const headers = { Authorization: `Bearer ${userData.token}` };

  useEffect(() => { 
    fetchGroupsAndStudents();
  }, []);

  useEffect(() => {
    // Filter students based on selected group
    if (selectedGroupFilter) {
      const filtered = allStudents.filter(s => s.groupId?._id === selectedGroupFilter);
      setStudents(filtered);
      setPendingByStudent({});
      setViewingStudent(null);
      setExamsToMark([]);
    } else {
      // Show all students
      setStudents(allStudents);
      // Fetch pending counts for all students
      if (allStudents.length > 0) {
        fetchAllPendingCounts();
      }
    }
  }, [selectedGroupFilter, allStudents]);

  const fetchGroupsAndStudents = async () => {
    try {
      setLoading(true);
      // Fetch groups
      const groupRes = await fetch(`${API_URL}/classes/tutor/${userData.id}`, { headers });
      const groupData = await groupRes.json();
      if (groupData.success) {
        const groupList = groupData.data || [];
        setGroups(groupList);
      }

      // Fetch all students belonging to the tutor
      const studentRes = await fetch(`${API_URL}/students/tutorStudents/${userData.id}`, { headers });
      const studentData = await studentRes.json();
      if (studentData.success) {
        setAllStudents(studentData.data || []);
        setStudents(studentData.data || []);
        fetchAllPendingCounts();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPendingCounts = async () => {
    try {
      // Fetch pending counts for all students or filter specific groups
      const promises = groups.map(group => 
        fetch(`${API_URL}/students/group/${group._id}/pending-exams`, { headers })
          .then(res => res.json())
          .catch(err => {
            console.error(err);
            return { success: false };
          })
      );

      const results = await Promise.all(promises);
      const pendingMap = {};
      results.forEach(result => {
        if (result.success && Array.isArray(result.data)) {
          result.data.forEach(item => {
            pendingMap[item.studentId] = item.pendingCount || 0;
          });
        }
      });
      setPendingByStudent(pendingMap);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGroupFilterChange = (groupId) => {
    setSelectedGroupFilter(groupId);
  };

  const fetchStudentExamsToMark = async (student) => {
    try {
      setLoading(true);
      // Get all assigned exams with responses
      const res = await fetch(`${API_URL}/students/${student.admissionNumber}/assigned-exams`, { headers });
      const data = await res.json();
      if (data.success) {
        const exams = data.data || [];
        // Show all assigned exams (submitted or not)
        setExamsToMark(exams);
        setViewingStudent(student);
        setMarkEdits({});
        setRemarkEdits({});
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const getExamDetails = (exam) => exam?.exam || exam;

  const getExamQuestions = (exam) => {
    const details = getExamDetails(exam);
    return Array.isArray(details?.questions) ? details.questions : [];
  };

  const getQuestionId = (question, answer, idx) => {
    return String(question?.questionId || answer?.questionId || idx);
  };

  const getAnswerForQuestion = (exam, question, idx) => {
    const answers = exam.response?.answers || [];
    const questionId = getQuestionId(question, answers[idx], idx);
    return answers.find(ans => String(ans.questionId) === String(questionId)) || answers[idx] || null;
  };

  const getTotalPossibleMarks = (exam) => {
    const questions = getExamQuestions(exam);
    if (questions.length > 0) {
      return questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
    }
    return exam.response?.totalScore || 0;
  };

  const handleMarkChange = (responseId, questionId, value, maxMarks) => {
    let numericValue = Number(value);
    if (Number.isNaN(numericValue)) numericValue = 0;
    numericValue = Math.max(0, numericValue);
    if (typeof maxMarks === 'number') {
      numericValue = Math.min(numericValue, maxMarks);
    }

    setMarkEdits(prev => ({
      ...prev,
      [responseId]: {
        ...(prev[responseId] || {}),
        [questionId]: numericValue
      }
    }));
  };

  const handleRemarkChange = (responseId, questionId, value) => {
    setRemarkEdits(prev => ({
      ...prev,
      [responseId]: {
        ...(prev[responseId] || {}),
        [questionId]: value
      }
    }));
  };

  const calculateTotalMarks = (responseId, exam) => {
    const marks = markEdits[responseId] || {};
    const questions = getExamQuestions(exam);
    const answers = exam.response?.answers || [];

    if (questions.length > 0) {
      return questions.reduce((sum, question, idx) => {
        const answer = getAnswerForQuestion(exam, question, idx);
        const questionId = getQuestionId(question, answer, idx);
        const edited = marks[questionId];
        const fallback = answer?.marksAwarded || 0;
        return sum + (edited !== undefined ? edited : fallback);
      }, 0);
    }

    return answers.reduce((sum, ans) => {
      return sum + (marks[String(ans.questionId)] !== undefined ? marks[String(ans.questionId)] : (ans.marksAwarded || 0));
    }, 0);
  };

  const renderAnswer = (question, answer, questionIndex) => {
    if (!question) {
      return (
        <div className="text-sm text-gray-600 italic">No question details found.</div>
      );
    }

    return (
      <ReadOnlyQuestionRenderer
        question={question}
        questionIndex={questionIndex}
        answer={answer}
        emptyText="No student response"
      />
    );
  };

  const submitMarks = async (student, exam, totalMarks) => {
    if (!window.confirm(`Submit total marks: ${totalMarks}? This will update the student's exam score.`)) {
      return;
    }

    try {
      setGrading(true);
      const examDetails = getExamDetails(exam);
      const isTutorAnswer = examDetails?.answerMode === 'tutor';
      const marks = markEdits[exam.response._id] || {};
      
      // Convert marks object to array format matching answers
      const marksArray = (exam.response.answers || []).map((ans, idx) => ({
        questionId: ans.questionId,
        marksAwarded: marks[String(ans.questionId)] !== undefined ? marks[String(ans.questionId)] : (ans.marksAwarded || 0)
      }));

      let remarksArray = [];
      if (isTutorAnswer) {
        const remarkMap = remarkEdits[exam.response._id] || {};
        remarksArray = (exam.response.answers || []).map(ans => ({
          questionId: ans.questionId,
          response: remarkMap[String(ans.questionId)] !== undefined ? remarkMap[String(ans.questionId)] : (ans.response || '')
        }));
      }

      const payload = { marks: marksArray, remarks: remarksArray };

      const res = await fetch(`${API_URL}/students/${student._id}/examResponses/${exam.response._id}/mark`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.token}`,
          'tutorid': userData.id
        },
        body: JSON.stringify(payload)
      });

      const contentType = res.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await res.json() : { success: false, message: await res.text() };

      if (res.ok && data.success) {
        toast.success('Marks submitted and student exam score updated!');
        // Refresh exams to mark
        fetchStudentExamsToMark(student);
        setExpandedResponse(null);
      } else {
        toast.error(data.message || 'Failed to submit marks');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit marks');
    } finally {
      setGrading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700';
      case 'active': return 'bg-orange-100 text-orange-700';
      case 'closed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getMarkingBadge = (exam) => {
    if (!exam?.submitted || !exam?.response) {
      return { label: 'Not Submitted', className: 'bg-gray-100 text-gray-600' };
    }
    if (!exam.response.finalized) return { label: 'Pending Review', className: 'bg-orange-100 text-orange-700' };
    if (exam.response.isAutoMarked) return { label: 'Auto-marked', className: 'bg-blue-100 text-blue-700' };
    return { label: 'Marked', className: 'bg-orange-100 text-orange-700' };
  };

  if (loading && !viewingStudent) {
    return <LoadingSpinner />;
  }

  const currentGroup = groups.find(g => g._id === selectedGroupFilter);
  const pendingCount = examsToMark.filter(e => !e.submitted || (e.response && !e.response.finalized)).length;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mark Student Responses</h1>
        <p className="text-gray-600 mt-2">Review and mark submitted exam responses</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel: Groups & Students */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            {/* Group Filter */}
            <div className="p-4 border-b border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Group (Optional)</label>
              <select
                value={selectedGroupFilter}
                onChange={e => handleGroupFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All Groups ({allStudents.length} students)</option>
                {groups.map(g => (
                  <option key={g._id} value={g._id}>
                    {g.groupName} ({g.students?.length || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Students List */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-700 mb-3">Students ({students.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {students.length === 0 ? (
                  <p className="text-sm text-gray-500">No students found</p>
                ) : (
                  students.map(student => (
                    <button
                      key={student._id}
                      onClick={() => fetchStudentExamsToMark(student)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        viewingStudent?._id === student._id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="font-medium text-sm text-gray-900">{student.firstName} {student.lastName}</div>
                          <div className="text-xs text-gray-600">{student.admissionNumber}</div>
                        </div>
                        <div>
                          {pendingByStudent[student._id] === undefined ? (
                            <span className="text-[10px] text-gray-500">Checking...</span>
                          ) : pendingByStudent[student._id] > 0 ? (
                            <span className="text-[10px] font-semibold bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                              Pending {pendingByStudent[student._id]}
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                              All marked
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Exams to Mark */}
        <div className="lg:col-span-3">
          {!viewingStudent ? (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">Select a student</h3>
              <p className="text-gray-600 mt-2">Choose a student from the list to view and mark their responses</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Student Header */}
              <div className="bg-orange-600 text-white rounded-lg shadow-md p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{viewingStudent.firstName} {viewingStudent.lastName}</h2>
                    <p className="text-orange-100 text-sm">
                      {viewingStudent.admissionNumber} 
                      {viewingStudent.groupId && ` • ${viewingStudent.groupId.groupName || viewingStudent.groupId}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{pendingCount}</div>
                    <p className="text-orange-100 text-sm">Exams to mark</p>
                  </div>
                </div>
              </div>

              {/* Exams List */}
              {examsToMark.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900">No exams assigned</h3>
                  <p className="text-gray-600 mt-2">This student does not have any assigned exams yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {examsToMark.map((exam, idx) => {
                    const responseKey = exam.response?._id || exam.exam?._id || exam._id || `assigned-${idx}`;
                    const isExpanded = expandedResponse === responseKey;
                    const totalMarks = exam.response ? calculateTotalMarks(exam.response._id, exam) : 0;
                    const totalPossibleMarks = getTotalPossibleMarks(exam);
                    const examDetails = getExamDetails(exam);
                    const questions = getExamQuestions(exam);
                    const markingBadge = getMarkingBadge(exam);
                    const isTutorAnswer = examDetails?.answerMode === 'tutor';
                    const hasResponse = !!exam.response && (exam.submitted || isTutorAnswer);
                    const isAutoMarked = !!exam.response?.isAutoMarked;

                    return (
                      <div key={responseKey} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                        {/* Exam Header (Collapsible) */}
                        <button
                          onClick={() => setExpandedResponse(isExpanded ? null : responseKey)}
                          className="w-full p-4 flex items-start justify-between hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold text-gray-900">{examDetails?.examName || exam.examName || 'Exam'}</h3>
                              <span className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusBadgeColor(exam.status)}`}>
                                {exam.status}
                              </span>
                              <span className={`text-xs font-bold px-2 py-1 rounded-full ${markingBadge.className}`}>
                                {markingBadge.label}
                              </span>
                            </div>
                            <div className="mt-1 text-sm text-gray-600">
                              {exam.examSchemeName} • {hasResponse ? `Submitted: ${new Date(exam.response.createdAt || exam.response.submittedAt).toLocaleDateString()}` : 'Not submitted yet'}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">{totalMarks} / {totalPossibleMarks} pts</div>
                              <div className="text-xs text-gray-600">{questions.length || (exam.response?.answers?.length || 0)} questions</div>
                            </div>
                            {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                          </div>
                        </button>

                        {/* Exam Details (Expanded) */}
                        {isExpanded && (
                          <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <div className="text-sm text-gray-600">Exam Scheme</div>
                                  <div className="text-lg font-semibold text-gray-900">{exam.examSchemeName || 'Not set'}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-600">Total Possible</div>
                                  <div className="text-lg font-semibold text-gray-900">{totalPossibleMarks} pts</div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-600">Exam Name</div>
                                  <div className="text-lg font-semibold text-gray-900">{examDetails?.examName || exam.examName || 'Exam'}</div>
                                </div>
                              </div>
                            </div>

                            {!hasResponse ? (
                              <div className="bg-white rounded-lg p-4 border border-yellow-200 text-sm text-yellow-700">
                                This student has not submitted this exam yet.
                              </div>
                            ) : (
                              <>
                                {isAutoMarked && (
                                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                                    This exam was auto-marked by the system. Scores are read-only.
                                  </div>
                                )}
                                {/* Questions & Marking */}
                                <div className="space-y-4">
                                  {(questions.length > 0 ? questions : []).map((question, qIdx) => {
                                    const answer = getAnswerForQuestion(exam, question, qIdx);
                                    const questionId = getQuestionId(question, answer, qIdx);
                                    const currentMark = markEdits[exam.response._id]?.[questionId] ?? (answer?.marksAwarded || 0);
                                    const maxMarks = typeof question?.marks === 'number' ? question.marks : undefined;
                                    const currentRemark = remarkEdits[exam.response._id]?.[questionId] ?? (answer?.response || '');

                                    return (
                                      <div key={questionId} className="bg-white rounded-lg p-4 border border-gray-200">
                                        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs font-semibold text-gray-500">Q{qIdx + 1}</span>
                                              <span className="text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                                                {question.type}
                                              </span>
                                              {typeof question.marks === 'number' && (
                                                <span className="text-xs font-semibold text-gray-600">{question.marks} mks</span>
                                              )}
                                            </div>
                                            <div className="mt-2 text-sm font-semibold text-gray-900">
                                              {question.question || 'Question text not available'}
                                            </div>
                                          </div>
                                        </div>

                                        {isTutorAnswer ? (
                                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                            <div className="text-xs font-semibold text-blue-700 mb-2">Tutor Responses</div>
                                            <QuestionRenderer
                                              question={question}
                                              questionIndex={qIdx}
                                              answer={{ response: currentRemark }}
                                              onAnswerChange={(_, responseValue) => handleRemarkChange(exam.response._id, questionId, responseValue)}
                                            />
                                          </div>
                                        ) : (
                                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                            <div className="text-xs font-semibold text-blue-700 mb-2">Student Response</div>
                                            {renderAnswer(question, answer, qIdx)}
                                          </div>
                                        )}

                                        <div className="flex flex-wrap items-end gap-3">
                                          <div className="flex-1 min-w-[180px]">
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">Marks Awarded</label>
                                            <input
                                              type="number"
                                              min="0"
                                              max={typeof maxMarks === 'number' ? maxMarks : undefined}
                                              value={currentMark}
                                              onChange={(e) => handleMarkChange(exam.response._id, questionId, e.target.value, maxMarks)}
                                              disabled={isAutoMarked}
                                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                                isAutoMarked
                                                  ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                                                  : 'border-gray-300 focus:ring-orange-500'
                                              }`}
                                              placeholder="0"
                                            />
                                          </div>
                                          <div className="text-sm text-gray-600 whitespace-nowrap">
                                            / {typeof maxMarks === 'number' ? maxMarks : '?'} pts
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}

                                  {questions.length === 0 && exam.response?.answers?.length > 0 && (
                                    <div className="bg-white rounded-lg p-4 border border-yellow-200 text-sm text-yellow-700">
                                      Question details are missing for this exam. Please check the exam setup.
                                    </div>
                                  )}
                                </div>

                                {/* Total & Submit */}
                                <div className="border-t border-gray-200 pt-4 mt-4">
                                  <div className="flex items-center justify-between mb-4">
                                    <span className="text-lg font-semibold text-gray-900">Total Marks</span>
                                    <span className="text-2xl font-bold text-orange-600">{totalMarks} / {totalPossibleMarks}</span>
                                  </div>
                                  <button
                                    onClick={() => submitMarks(viewingStudent, exam, totalMarks)}
                                    disabled={grading || isAutoMarked}
                                    className={`w-full px-4 py-3 font-semibold rounded-lg transition-colors ${
                                      isAutoMarked
                                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                        : 'bg-orange-600 hover:bg-orange-700 text-white'
                                    }`}
                                  >
                                    {grading ? 'Submitting...' : 'Submit Marks & Update Score'}
                                  </button>
                                  <p className="text-xs text-gray-600 mt-2 text-center">
                                    This will finalize marks and update the student's exam score
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
