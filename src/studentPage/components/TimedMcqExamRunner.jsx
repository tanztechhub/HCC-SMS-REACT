import { useEffect, useMemo, useRef, useState } from 'react';
import { Clock, ShieldAlert } from 'lucide-react';
import QuestionRenderer from './QuestionRenderer';

const QUESTION_TIME_MS = 90 * 1000;

const hashSeed = (value) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const seededShuffle = (questions, seedValue) => {
  const shuffled = questions.map((question, originalIndex) => ({ question, originalIndex }));
  let seed = hashSeed(seedValue) || 1;

  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
};

export default function TimedMcqExamRunner({ examId, studentId, questions, answers, onAnswerChange, onFinish, isSubmitting }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingMs, setRemainingMs] = useState(QUESTION_TIME_MS);
  const [isLocked, setIsLocked] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const advancedIndexRef = useRef(-1);

  const orderedQuestions = useMemo(
    () => seededShuffle(questions, `${studentId}:${examId}`),
    [examId, questions, studentId]
  );

  useEffect(() => {
    const preventAction = (event) => event.preventDefault();
    const events = ['contextmenu', 'copy', 'cut', 'paste', 'dragstart', 'selectstart'];
    events.forEach(eventName => document.addEventListener(eventName, preventAction));
    return () => events.forEach(eventName => document.removeEventListener(eventName, preventAction));
  }, []);

  useEffect(() => {
    if (isSubmitting || isFinished || currentIndex >= orderedQuestions.length) return undefined;

    advancedIndexRef.current = -1;
    setIsLocked(false);
    setRemainingMs(QUESTION_TIME_MS);
    const deadline = performance.now() + QUESTION_TIME_MS;

    const advance = () => {
      if (advancedIndexRef.current === currentIndex) return;
      advancedIndexRef.current = currentIndex;
      setIsLocked(true);

      if (currentIndex === orderedQuestions.length - 1) {
        setIsFinished(true);
        onFinish();
      } else {
        setCurrentIndex(index => index + 1);
      }
    };

    const interval = window.setInterval(() => {
      const nextRemaining = Math.max(0, deadline - performance.now());
      setRemainingMs(nextRemaining);
      if (nextRemaining <= 0) advance();
    }, 25);

    const timeout = window.setTimeout(advance, QUESTION_TIME_MS);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [currentIndex, isFinished, isSubmitting, onFinish, orderedQuestions.length]);

  const current = orderedQuestions[currentIndex];
  if (!current) return null;

  return (
    <div className="select-none" onContextMenu={event => event.preventDefault()}>
      <div className="mb-4 rounded-lg border-2 border-red-400 bg-red-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 font-bold text-red-800">
              <ShieldAlert className="h-5 w-5" /> Exam In Progress
            </div>
            <p className="mt-1 text-sm text-red-700">Question {currentIndex + 1} of {orderedQuestions.length}.</p>
          </div>
          <div className="flex items-center gap-2 text-2xl font-bold text-red-700" aria-live="polite">
            <Clock className="h-6 w-6" /> {(remainingMs / 1000).toFixed(1)}s
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-red-200">
          <div className="h-full bg-red-600" style={{ width: `${(remainingMs / QUESTION_TIME_MS) * 100}%` }} />
        </div>
      </div>

      <div className={isLocked || isSubmitting ? 'pointer-events-none opacity-70' : ''}>
        <QuestionRenderer
          question={current.question}
          questionIndex={currentIndex}
          answer={answers[current.originalIndex]}
          onAnswerChange={(_, response) => onAnswerChange(current.originalIndex, response)}
          readOnly={isLocked || isSubmitting}
        />
      </div>

      {isFinished && !isSubmitting ? (
        <div className="mt-4 text-center">
          <p className="mb-2 text-sm font-medium text-red-700">Submission did not complete. Your answers remain locked.</p>
          <button type="button" onClick={onFinish} className="rounded bg-orange-600 px-4 py-2 font-bold text-white hover:bg-orange-700">
            Retry submission
          </button>
        </div>
      ) : (
        <p className="mt-4 text-center text-sm font-medium text-gray-600">
          {isSubmitting ? 'Submitting your exam...' : 'The next question opens automatically when the timer reaches zero.'}
        </p>
      )}
    </div>
  );
}
