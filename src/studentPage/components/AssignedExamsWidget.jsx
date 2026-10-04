import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import QuestionRenderer from './QuestionRenderer';
import ReadOnlyQuestionRenderer from './ReadOnlyQuestionRenderer';
import QuestionReview from './QuestionReview';
import TimedMcqExamRunner from './TimedMcqExamRunner';

const API_URL = import.meta.env.VITE_API_URL;

const isMultipleChoiceQuestion = (question) => (
  String(question?.type || '').trim().toLowerCase() === 'multiplechoice'
);

export default function AssignedExamsWidget({ exam, student, onExamSubmitted }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [answers, setAnswers] = useState(exam.response?.answers ? 
    exam.response.answers.reduce((acc, ans, idx) => ({ ...acc, [idx]: { response: ans.response } }), {})
    : {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(exam.submitted || false);
  const [score, setScore] = useState(exam.response?.totalScore || null);
  const [response, setResponse] = useState(exam.response || null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  // Timer effect for active exams
  React.useEffect(() => {
    if (exam.status === 'active' && exam.endDate && !submitted) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const endTime = new Date(exam.endDate).getTime();
        const remaining = endTime - now;

        if (remaining <= 0) {
          setTimeRemaining('Expired');
          // Optionally reload or notify
        } else {
          setTimeRemaining(remaining);
        }
      };

      // Update immediately
      updateTimer();

      // Update every second
      const interval = setInterval(updateTimer, 1000);

      return () => clearInterval(interval);
    }
  }, [exam.status, exam.endDate, submitted]);

  const formatTimeRemaining = (milliseconds) => {
    if (milliseconds === 'Expired') return 'Time Expired';
    if (!milliseconds || milliseconds <= 0) return 'Time Expired';

    const totalSeconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getTimerColor = (milliseconds) => {
    if (!milliseconds || milliseconds === 'Expired') return 'text-red-600';
    const totalMinutes = milliseconds / (1000 * 60);
    if (totalMinutes <= 5) return 'text-red-600 animate-pulse';
    if (totalMinutes <= 15) return 'text-orange-600';
    return 'text-orange-600';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-50 border-blue-300';
      case 'active': return 'bg-orange-50 border-orange-300';
      case 'closed': return 'bg-red-50 border-red-300';
      default: return 'bg-gray-50 border-gray-300';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'upcoming':
        return <div className="flex items-center text-blue-600"><Clock className="w-4 h-4 mr-1" /> Upcoming</div>;
      case 'active':
        return <div className="flex items-center text-orange-600"><Zap className="w-4 h-4 mr-1" /> Active</div>;
      case 'closed':
        return <div className="flex items-center text-red-600"><AlertCircle className="w-4 h-4 mr-1" /> Closed</div>;
      default:
        return null;
    }
  };

  const isActive = exam.status === 'active';
  const examObj = exam.exam || exam;
  const isTutorAnswer = examObj?.answerMode === 'tutor';
  const isTimedMcqExam = !isTutorAnswer && examObj?.questions?.length > 0 &&
    examObj.questions.every(isMultipleChoiceQuestion);
  const answersRef = React.useRef(answers);

  const handleAnswerChange = (questionIdx, response) => {
    setAnswers(prev => {
      const nextAnswers = { ...prev, [questionIdx]: { response } };
      answersRef.current = nextAnswers;
      return nextAnswers;
    });
  };

  const handleSubmit = React.useCallback(async (allowIncomplete = false) => {
    if (isTutorAnswer) {
      return toast.error('This exam is assessed by your tutor. No submission is required.');
    }
    if (!examObj || !examObj._id) return toast.error('Exam data missing');
    if (!examObj.questions || examObj.questions.length === 0) return toast.error('No questions in exam');

    // Validate exam time hasn't expired
    if (exam.endDate) {
      const now = new Date().getTime();
      const endTime = new Date(exam.endDate).getTime();
      if (now > endTime) {
        toast.error('Time has expired! You can no longer submit this exam.');
        setIsExpanded(false);
        // Optionally trigger refresh to update exam status
        if (onExamSubmitted && typeof onExamSubmitted === 'function') {
          onExamSubmitted();
        }
        return;
      }
    }

    // Validate all questions answered
    const currentAnswers = answersRef.current;
    const allAnswered = examObj.questions.every((_, idx) => currentAnswers[idx]?.response);
    if (!allowIncomplete && !allAnswered) return toast.error('Please answer all questions before submitting');

    setIsSubmitting(true);
    try {
      const responseArray = examObj.questions.map((question, idx) => ({
        questionId: question.questionId,
        response: currentAnswers[idx]?.response ?? null
      }));
      const res = await fetch(`${API_URL}/students/${student.admissionNumber}/submit-exam`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${student.token || JSON.parse(localStorage.getItem('user')).token}`
        },
        body: JSON.stringify({
          examId: examObj._id,
          answers: responseArray
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setSubmitted(true);
        setScore(data.data.score);
        setResponse(data.data.response);
        setIsExpanded(false);
        
        // Trigger parent component to refresh student data
        if (onExamSubmitted && typeof onExamSubmitted === 'function') {
          onExamSubmitted();
        }
      } else {
        toast.error(data.message || 'Failed to submit exam');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit exam');
    } finally {
      setIsSubmitting(false);
    }
  }, [exam.endDate, examObj, isTutorAnswer, onExamSubmitted, student.admissionNumber, student.token]);

  const handleTheoryFinish = React.useCallback(() => {
    return handleSubmit(true);
  }, [handleSubmit]);

  return (
    <div className={`border-2 rounded-lg shadow-md overflow-hidden transition-all ${getStatusColor(exam.status)}`}>
      {/* Header */}
      <div
        className={`p-4 cursor-pointer flex items-center justify-between bg-white ${(exam.status === 'active' || exam.status === 'closed' || submitted) ? 'hover:bg-gray-50' : ''}`}
        onClick={() => {
          // Only allow expanding if active, closed, or already submitted (not upcoming)
          if ((exam.status === 'active' && !submitted) || exam.status === 'closed' || submitted) {
            if (!(isTimedMcqExam && isExpanded && !submitted)) {
              setIsExpanded(!isExpanded);
            }
          }
        }}
      >
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800">{examObj.examName || 'Exam'}</h3>
          <div className="flex gap-4 mt-2 text-sm max-md:flex-col">
            <div>{getStatusBadge(exam.status)}</div>
            {exam.examSchemeName && <div className="text-gray-600">Scheme: {exam.examSchemeName}</div>}
            {exam.startDate && <div className="text-gray-600">{new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}</div>}
          </div>
        </div>

        {submitted ? (
          <div className="flex flex-col items-end">
            <CheckCircle className="w-6 h-6 text-orange-600 mb-2" />
            {response?.totalScore !== null && (
              <>
                <div className="font-bold text-lg text-orange-600">{response?.totalScore} / {examObj.totalMarks} pts</div>
                {response?.isAutoMarked && <span className="text-xs text-orange-600 mt-1">Auto-marked</span>}
                {!response?.isAutoMarked && !response?.finalized && <span className="text-xs text-orange-600 mt-1">Pending Review</span>}
                {isTutorAnswer && response?.finalized && <span className="text-xs text-blue-600 mt-1">✅ Tutor Assessed</span>}
              </>
            )}
            {isExpanded ? <ChevronUp className="w-6 h-6 text-gray-600 mt-2" /> : <ChevronDown className="w-6 h-6 text-gray-600 mt-2" />}
          </div>
        ) : (
          isActive && !isExpanded && <ChevronDown className="w-6 h-6 text-gray-600" />
        )}
        {isActive && !submitted && isExpanded && <ChevronUp className="w-6 h-6 text-gray-600" />}
      </div>

      {isActive && !submitted && !isExpanded && isTimedMcqExam && (
        <div className="border-t border-orange-200 bg-orange-50 px-4 py-3">
          <p className="mb-2 text-sm font-bold text-orange-800">Exam Instructions</p>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-orange-800">
            <li>This is a multi-choice exam. Answer all questions.</li>
            <li>Each question takes exactly 1:30 minutes before automatically moving to the next question.</li>
            <li>Exam automatically submits at the end. Screenshots and tab changes are not allowed during exams.</li>
          </ol>
        </div>
      )}

      {/* Questions (Answering Mode) - Only show if active, not submitted, and expanded */}
      {isActive && !submitted && isExpanded && examObj.questions && (
        <div className="bg-white p-4 border-t border-gray-300">
          
          {isTutorAnswer ? (
            <>
              <div className="mb-4 p-3 bg-blue-50 border border-blue-300 rounded">
                <p className="text-sm text-blue-800">
                  This exam is assessed by your tutor. You can view the questions and tutor remarks once marked.
                </p>
              </div>
              <div className="space-y-6">
                {examObj.questions.map((question, idx) => {
                  const answerEntry = response?.answers?.find(ans => String(ans.questionId) === String(question.questionId)) || response?.answers?.[idx];
                  return (
                    <div key={question.questionId || idx} className="space-y-2">
                      <ReadOnlyQuestionRenderer
                        question={question}
                        questionIndex={idx}
                        answer={answerEntry || { response: '' }}
                        emptyText="Waiting for tutor remarks"
                      />
                      <div className="text-sm text-gray-700">
                        <span className="font-semibold">Marks Awarded:</span> {answerEntry?.marksAwarded ?? 0} / {question.marks}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-300">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded"
                >
                  Close
                </button>
              </div>
            </>
          ) : isTimedMcqExam ? (
            <TimedMcqExamRunner
              examId={examObj._id}
              studentId={student.admissionNumber}
              questions={examObj.questions}
              answers={answers}
              onAnswerChange={handleAnswerChange}
              onFinish={handleTheoryFinish}
              isSubmitting={isSubmitting}
            />
          ) : (
            <>
              <div className="space-y-6">
                {examObj.questions.map((question, idx) => (
                  <QuestionRenderer
                    key={idx}
                    question={question}
                    questionIndex={idx}
                    answer={answers[idx]}
                    onAnswerChange={handleAnswerChange}
                  />
                ))}
              </div>

              {/* Submit Button */}
              <div className="mt-6 pt-4 border-t border-gray-300 flex gap-2">
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting || timeRemaining === 'Expired' || (typeof timeRemaining === 'number' && timeRemaining <= 0)}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 rounded"
                >
                  {timeRemaining === 'Expired' || (typeof timeRemaining === 'number' && timeRemaining <= 0)
                    ? 'Time Expired - Cannot Submit'
                    : isSubmitting 
                    ? 'Submitting...' 
                    : 'Submit Exam'}
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Review Mode - Show if submitted and expanded */}
      {submitted && isExpanded && examObj.questions && response && (
        <div className="bg-white p-4 border-t border-gray-300">
          <div className="mb-4 p-3 bg-blue-50 border border-blue-300 rounded">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Status:</span> {response.isAutoMarked ? 'Auto-marked' : (response.finalized ? '✅ Tutor Assessed' : 'Awaiting Tutor Review')}
            </p>
            <p className="text-sm text-blue-800 mt-1">
              <span className="font-semibold">Score:</span> {response.totalScore} / {examObj.totalMarks}
            </p>
          </div>

          {isTutorAnswer ? (
            <div className="space-y-6">
              {examObj.questions.map((question, idx) => {
                const answerEntry = response?.answers?.find(ans => String(ans.questionId) === String(question.questionId)) || response?.answers?.[idx];
                return (
                  <div key={question.questionId || idx} className="space-y-2">
                    <ReadOnlyQuestionRenderer
                      question={question}
                      questionIndex={idx}
                      answer={answerEntry || { response: '' }}
                      emptyText="Waiting for tutor remarks"
                    />
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold">Marks Awarded:</span> {answerEntry?.marksAwarded ?? 0} / {question.marks}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6">
              {examObj.questions.map((question, idx) => (
                <QuestionReview
                  key={idx}
                  question={question}
                  questionIndex={idx}
                  answer={answers[idx] || response.answers?.[idx]}
                  response={response.answers?.[idx]}
                  isAutoMarked={response.isAutoMarked}
                />
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-300">
            <button
              onClick={() => setIsExpanded(false)}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Submitted state message */}
      {submitted && (
        <div className="bg-orange-100 p-4 text-orange-800 text-center">
          {isTutorAnswer && response?.markedAt ? (
            <p className="font-semibold">Tutor assessment updated on {new Date(response.markedAt).toLocaleString()}</p>
          ) : (
            <p className="font-semibold">Submitted on {new Date(exam.submittedAt).toLocaleString()}</p>
          )}
        </div>
      )}

      {/* Upcoming state message */}
      {exam.status === 'upcoming' && (
        <div className="bg-blue-100 p-4 text-blue-800 text-center">
          <p className="font-semibold">Exam starts on {new Date(exam.startDate).toLocaleString()}</p>
          <p className="text-sm">Details are hidden until the exam becomes active.</p>
        </div>
      )}

      {/* Closed state message */}
      {exam.status === 'closed' && !submitted && (
        <div className="bg-red-100 p-4 text-red-800 text-center">
          <p className="font-semibold">This exam is no longer available</p>
        </div>
      )}
    </div>
  );
}
