import { useEffect, useState } from "react";
import { Clock, CheckCircle2, FileText, Loader2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

export default function StudentQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData && userData.token) {
      setUser(userData);
      fetchStudentQuizzes(userData);
    } else {
      setIsLoading(false);
      setError("User not authenticated. Please log in.");
    }
  }, []);

  const fetchStudentQuizzes = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/quizzes/student/single`, {
        headers: {
          Authorization: `Bearer ${userData.token}`,
          groupId: userData.group.groupId,
          studentId: userData.id
        },
      });
      const data = await response.json();
      console.log(`data`, data);
      if (data.success) {
        setQuizzes(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to fetch quizzes. Please check your network connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenQuiz = (quiz) => {
    console.log(`handleOpenQuiz`, quiz)
    setCurrentQuiz(quiz);
    setAnswer(quiz.response?.answer || "");
  };

  const handleCloseQuiz = () => {
    setCurrentQuiz(null);
    setAnswer("");
  };

  const handleSubmitQuiz = async (e) => {
    e.preventDefault();
    if (!answer.trim()) {
      toast.error("Please provide an answer.");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    const studentResponse = {
      studentId: user.id,
      studentName: `${user.firstName} ${user.lastName}`,
      admissionNumber: user.admissionNumber,
      course: "Student's Course Name", // You need to get this from the student data fetch
      answer: answer,
    };

    // A quick way to get the course from local storage, if available
    const student = JSON.parse(localStorage.getItem('student'));
    if (student?.courseName) {
      studentResponse.course = student.courseName;
    } else {
      // Fallback or better way: fetch student data at component mount
      const studentResponse = await fetch(`${API_URL}/students/${user.admissionNumber}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const studentData = await studentResponse.json();
      if (studentData.success) {
        studentResponse.course = studentData.data.courseName;
      }
    }


    try {
      const response = await fetch(`${API_URL}/quizzes/${currentQuiz._id}/submit-response`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(studentResponse),
      });
      const data = await response.json();
      if (data.success) {
       toast.success("Response submitted successfully!");
        handleCloseQuiz();
        fetchStudentQuizzes(user); // Refresh the list of quizzes
      } else {
        setError(data.message);
        toast.error(`Error: ${data.message}`);
      }
    } catch (err) {
      setError("Failed to submit response. Please try again.");
      toast.error("Failed to submit response. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="animate-spin text-orange-600 h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4 text-center px-4 bg-red-50/50 border-2 border-red-600 mb-5">{error}</div>;
  }

  const upcomingQuizzes = quizzes.filter(quiz => new Date(quiz.startDate) > new Date());
  const activeQuizzes = quizzes.filter(quiz => new Date(quiz.startDate) <= new Date() && quiz.status === 'active' && !quiz.response);
  const completedQuizzes = quizzes.filter(quiz => quiz.response);

  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-orange-600 overflow-hidden mb-8">
      <div className="bg-orange-600 text-white p-4 flex items-center">
        <FileText className="mr-2" />
        <p className="text-xl font-bold">Quizzes</p>
      </div>
      <div className="p-6">
        {quizzes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No quizzes available at the moment.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {upcomingQuizzes.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-2 text-orange-700">🗓️ Upcoming Quizzes</h3>
                <ul className="space-y-2">
                  {upcomingQuizzes.map(quiz => {
                    const start = new Date(quiz.startDate);
                    const end = new Date(quiz.endDate);

                    // Calculate duration in hours/minutes
                    const durationMs = end - start;
                    const durationMinutes = Math.floor(durationMs / (1000 * 60));
                    const durationHours = Math.floor(durationMinutes / 60);
                    const remainingMinutes = durationMinutes % 60;

                    const durationText =
                      durationHours > 0
                        ? `${durationHours}h ${remainingMinutes}m`
                        : `${durationMinutes} minutes`;

                    return (
                      <li
                        key={quiz._id}
                        className="bg-gray-100 p-4 rounded-lg flex justify-between items-center border border-gray-200"
                      >
                        <div>
                          <p className="font-semibold">{quiz.title}</p>
                          <p className="text-sm text-gray-600">
                            Date: {start.toLocaleDateString()} <br />
                            Time: {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
                            {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                          <p className="text-sm text-gray-600">
                            Duration: {durationText}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            This quiz will be active at the above date & time. Please be ready.
                          </p>
                        </div>
                        <Clock className="h-5 w-5 text-gray-500" />
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}


            {/* Active Quizzes */}
            {activeQuizzes.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-2 text-blue-700">✍️ Active Quizzes</h3>
                <ul className="space-y-2">
                  {activeQuizzes.map(quiz => (
                    <li key={quiz._id} className="bg-blue-50 p-4 rounded-lg flex justify-between items-center border border-blue-200">
                      <div>
                        <p className="font-semibold text-blue-800">{quiz.title}</p>
                        <p className="text-sm text-blue-600">Due: {new Date(quiz.endDate).toLocaleDateString()} at {new Date(quiz.endDate).toLocaleTimeString()}</p>
                      </div>
                      <button
                        onClick={() => handleOpenQuiz(quiz)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full text-sm transition-colors duration-200 flex items-center"
                      >
                        Start Quiz <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Completed Quizzes */}
            {completedQuizzes.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-2 text-orange-700">✅ Graded Quizzes</h3>
                <ul className="space-y-2">
                  {completedQuizzes.map(quiz => (
                    <li key={quiz._id} className="bg-orange-50 p-4 rounded-lg flex justify-between items-center border border-orange-200">
                      <div>
                        <p className="font-semibold text-orange-800">{quiz.title}</p>
                        <p className="text-sm text-gray-600">Submitted: {new Date(quiz.response.submittedAt).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={() => handleOpenQuiz(quiz)}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-full text-sm transition-colors duration-200 cursor-pointer"
                      >
                        View Grade
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quiz Modal */}
      {currentQuiz && (
        <div className="fixed inset-0 bg-gray-600/75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b-2 border-gray-300 p-4">
              <h2 className="text-xl font-bold">{currentQuiz.title}</h2>
              <button onClick={handleCloseQuiz} className="text-gray-500 hover:text-gray-700">
                <span className="text-2xl font-bold">&times;</span>
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4 italic">
                {new Date(currentQuiz.startDate).toLocaleDateString()} - {new Date(currentQuiz.endDate).toLocaleDateString()}
              </p>
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Question:</h3>
                <p className="whitespace-pre-wrap">{currentQuiz.question}</p>
                {currentQuiz.additionalNotes && (
                  <>
                    <h4 className="text-md font-semibold mt-4 text-gray-700">Additional Notes:</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{currentQuiz.additionalNotes}</p>
                  </>
                )}
              </div>
              {/* FIXED: Added null check before accessing response.answer */}
              {currentQuiz.response && currentQuiz.response.answer && (
                <div className="py-4">
                  <h5 className="text-xl font-semibold mt-4 text-gray-700">Your Response</h5>
                  <p>{currentQuiz.response.answer}</p>
                </div>
              )}
              {console.log(`currentQuiz`, currentQuiz)}
              {!currentQuiz.response ? (
                // Submission form for active quizzes
                <form onSubmit={handleSubmitQuiz} className="mt-6">
                  <div className="mb-4">
                    <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">Your Answer:</label>
                    <textarea
                      id="answer"
                      rows="8"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-500 focus:ring-opacity-50 outline-orange-600"
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200 flex items-center justify-center cursor-pointer"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin mr-2" /> Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2" /> Submit Answer
                      </>
                    )}
                  </button>
                </form>
              ) : (
                // Displaying grade and feedback for graded quizzes
                <div className="mt-6 p-4 border border-orange-200 bg-orange-50 rounded-lg">
                  <h3 className="text-lg font-bold text-orange-700 mb-2">Your Grade</h3>
                  <p className="text-3xl font-bold text-orange-600 mb-2">{`${currentQuiz.response.grade || `N/A`} out of ${currentQuiz.weight || 'N/A'}` || 'N/A'}</p>
                  {currentQuiz.response.feedback && (
                    <>
                      <h4 className="font-semibold text-gray-700">Tutor Feedback:</h4>
                      <p className="text-sm text-gray-600 italic whitespace-pre-wrap">{currentQuiz.response.feedback}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}