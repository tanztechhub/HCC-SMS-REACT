import { useEffect, useState } from "react";
import { Award, Clock, Download, BookOpen, FileText } from "lucide-react";
import StudentQuizzes from "./components/StudentQuizzes";
import AssignedExamsWidget from "./components/AssignedExamsWidget";

const API_URL = import.meta.env.VITE_API_URL;

export default function StudentExams() {
  const [student, setStudent] = useState(null);
  const [assignedExams, setAssignedExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalAverage, setTotalAverage] = useState(0);
  const [totalCourseWeight, setTotalCourseWeight] = useState(0);
  const [passMark, setPassMark] = useState(0);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData || !userData.token) {
        throw new Error("Please login again");
      }

      const studentResponse = await fetch(
        `${API_URL}/students/${userData.admissionNumber}`,
        {
          headers: { Authorization: `Bearer ${userData.token}` },
        }
      );

      const studentData = await studentResponse.json();

      if (studentData.success) {
        setStudent(studentData.data);

        // Calculate total course weight and pass mark
        if (studentData.data.exams && studentData.data.exams.length > 0) {
          const courseWeight = studentData.data.exams.reduce((sum, exam) => {
            return sum + (exam.weight || 0);
          }, 0);

          setTotalCourseWeight(courseWeight);
          setPassMark(courseWeight / 2); // Half of total weight is pass mark

          // Calculate total average if exams exist
          const totalScore = studentData.data.exams.reduce((sum, exam) => {
            return sum + (exam.score || 0);
          }, 0);

          setTotalAverage(
            Math.round(totalScore / studentData.data.exams.length)
          );
        }
      } else {
        throw new Error("Failed to fetch student data");
      }

      // Fetch assigned exams
      const assignedResponse = await fetch(
        `${API_URL}/students/${userData.admissionNumber}/assigned-exams`,
        {
          headers: { Authorization: `Bearer ${userData.token}` }
        }
      );

      const assignedData = await assignedResponse.json();
      if (assignedData.success) {
        setAssignedExams(assignedData.data || []);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Sort exams: active first, then upcoming, then closed
  const sortedAssignedExams = (assignedExams || []).sort((a, b) => {
    const statusOrder = { active: 0, upcoming: 1, closed: 2 };
    const statusA = statusOrder[a.status] !== undefined ? statusOrder[a.status] : 999;
    const statusB = statusOrder[b.status] !== undefined ? statusOrder[b.status] : 999;
    
    if (statusA !== statusB) {
      return statusA - statusB;
    }
    
    // If statuses are equal, sort by date
    const dateA = new Date(a.startDate).getTime();
    const dateB = new Date(b.startDate).getTime();
    return dateA - dateB;
  });

  const getGradeColor = (score, weight) => {
    const percentage = (score / weight) * 100;
    if (percentage >= 80) return "text-orange-600";
    if (percentage >= 70) return "text-blue-600";
    if (percentage >= 60) return "text-yellow-600";
    if (percentage >= 50) return "text-orange-500";
    return "text-red-600";
  };

  // 4. Replace the existing getGradeText function:
  const getGradeText = (score, weight) => {
    const percentage = (score / weight) * 100;
    if (percentage >= 80) return "Excellent";
    if (percentage >= 70) return "Very Good";
    if (percentage >= 60) return "Good";
    if (percentage >= 50) return "Pass";
    return "Improvement Needed";
  };

  // 5. Replace the existing getProgressBarWidth function:
  const getProgressBarWidth = (score, weight) => {
    const percentage = (score / weight) * 100;
    return `${Math.min(percentage, 100)}%`;
  };

  // 6. Replace the existing getProgressBarColor function:
  const getProgressBarColor = (score, weight) => {
    const percentage = (score / weight) * 100;
    if (percentage >= 80) return "bg-orange-500";
    if (percentage >= 70) return "bg-blue-500";
    if (percentage >= 60) return "bg-yellow-500";
    if (percentage >= 50) return "bg-orange-500";
    return "bg-red-500";
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  const allExamsTaken = student.exams.every((exam) => exam.score > 0);
  const hasPassedAllExams = student.exams.every((exam) => exam.score >= (exam.weight / 2));


  return (
    <div className="min-h-screen bg-[url(/student/student.png)]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <StudentQuizzes />

        {/* Assigned Exams Section */}
        {assignedExams && assignedExams.length > 0 && (
          <div className="mb-12">
            <div className="bg-orange-600 text-white p-4 flex items-center mb-6 rounded-t-lg">
              <FileText className="mr-2" />
              <p className="text-xl font-bold"> Available Exams</p>
            </div>
            <div className="space-y-4">
              {sortedAssignedExams.map((exam, idx) => (
                <AssignedExamsWidget 
                  key={exam.exam?._id || exam.exam || exam._id || idx}
                  exam={exam} 
                  student={student} 
                  onExamSubmitted={fetchStudentData}
                />
              ))}
            </div>
          </div>
        )}

        <h1 className="text-orange-600 text-2xl font-bold mb-6 uppercase">
          Exams & Certification
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Exam Results Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg border-2 border-orange-600 overflow-hidden">
              <div className="bg-orange-600 text-white p-4 flex items-center">
                <BookOpen className="mr-2" />
                <p className="text-xl font-bold">Exam Results</p>
              </div>
              <div className="p-6">
                {student.exams.length > 0 ? (
                  <div className="space-y-6">
                    {student.exams.map((exam, index) => (
                      <div key={exam._id || index} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                        <div className="flex flex-wrap justify-between items-center mb-2">
                          <h3 className="text-lg font-semibold">{exam.name}</h3>
                          <div className="flex items-center">
                            <span className="text-gray-600 mr-2">Weight: {exam.weight}</span>
                            {exam.score > 0 ? (
                              <span className={`font-bold text-lg ${getGradeColor(exam.score, exam.weight)}`}>
                                {exam.score}/{exam.weight} ({Math.round((exam.score / exam.weight) * 100)}%)
                              </span>
                            ) : (
                              <span className="text-gray-500 italic flex items-center">
                                <Clock className="h-4 w-4 mr-1" /> Pending
                              </span>
                            )}
                          </div>
                        </div>

                        {exam.score > 0 ? (
                          <>
                            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                              <div
                                className={`${getProgressBarColor(
                                  exam.score, exam.weight
                                )} h-4 rounded-full transition-all duration-500`}
                                style={{ width: getProgressBarWidth(exam.score, exam.weight) }}
                              ></div>
                            </div>
                            <p className={`text-sm ${getGradeColor(exam.score, exam.weight)}`}>
                              {getGradeText(exam.score, exam.weight)} - Pass mark: {exam.weight / 2}
                            </p>
                          </>
                        ) : (
                          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                            <div
                              className="bg-gray-400 h-4 rounded-full pulse-animation"
                              style={{ width: "5%" }}
                            ></div>
                          </div>
                        )}
                      </div>
                    ))}

                    {allExamsTaken && (
                      <div className="mt-6 pt-4 border-t-2 border-gray-300">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xl font-bold">Overall Average</h3>
                          <span className={`text-2xl font-bold ${getGradeColor(totalAverage)}`}>
                            {totalAverage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-6 mt-2">
                          <div
                            className={`${getProgressBarColor(
                              totalAverage
                            )} h-6 rounded-full transition-all duration-500`}
                            style={{ width: getProgressBarWidth(totalAverage) }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No exams available yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Certificate Section */}
          <div className="lg:col-span-1">
            {student.isCertificateReady ? (
              <div className="bg-white rounded-lg shadow-lg border-2 border-orange-600 overflow-hidden">
                <div className="bg-orange-600 text-white p-4 flex items-center">
                  <Award className="mr-2" />
                  <h2 className="text-xl font-bold">Certificate</h2>
                </div>
                <div className="p-6">
                  <div className="border-2 border-orange-600 rounded-lg p-6 bg-orange-50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32">
                      <div className="absolute transform rotate-45 bg-orange-500 text-white font-bold py-2 right-[-40px] top-[32px] w-[170px] text-center">
                        CERTIFIED
                      </div>
                    </div>

                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-orange-700">CERTIFICATE OF COMPLETION</h3>
                      <p className="text-gray-600">HCC</p>
                    </div>

                    <div className="text-center mb-6">
                      <p className="text-gray-700">This is to certify that</p>
                      <p className="text-xl font-bold my-2 text-orange-700">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-gray-700">has successfully completed</p>
                      <p className="font-bold text-orange-600 my-2">{student.courseName}</p>
                      <p className="text-gray-700">with an average score of</p>
                      <p className="text-2xl font-bold text-orange-700">{totalAverage}%</p>
                    </div>

                    <div className="mt-6 text-center">
                      <button className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-full flex items-center mx-auto">
                        <Download className="mr-2 h-5 w-5" />
                        Collect Certificate
                      </button>
                      <p className="text-sm text-gray-600 mt-2">
                        Your certificate is ready to collect from the administration office.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg border-2 border-orange-600 overflow-hidden">
                <div className="bg-orange-600 text-white p-4 flex items-center">
                  <Award className="mr-2" />
                  <p className="text-xl font-bold">Certificate Status</p>
                </div>
                <div className="p-6">
                  {!allExamsTaken ? (
                    <div className="text-center py-4">
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <Clock className="h-5 w-5 text-yellow-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                              Complete all exams to be eligible for certification.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <p className="text-gray-700">Exams Pending:</p>
                        <ul className="space-y-2">
                          {student.exams
                            .filter(exam => !exam.score)
                            .map((exam, index) => (
                              <li key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                                <span>{exam.name}</span>
                                <Clock className="h-4 w-4 text-gray-500" />
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  ) : !hasPassedAllExams ? (
                    <div className="text-center py-4">
                      <div className="bg-red-50 border-l-4 border-red-400 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-red-700">
                              You need to pass all exams with at least 50% to qualify for certification.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 space-y-4">
                        <p className="text-gray-700">Exams that need improvement:</p>
                        <ul className="space-y-2">
                          {student.exams
                            .filter(exam => exam.score < (exam.weight / 2))
                            .map((exam, index) => (
                              <li key={index} className="flex items-center justify-between bg-red-100 p-2 rounded">
                                <span>{exam.name}</span>
                                <span className="text-red-600 font-bold">
                                  {exam.score}/{exam.weight} (Need: {exam.weight / 2})
                                </span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <Clock className="h-5 w-5 text-orange-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-orange-700">
                              Congratulations! You've passed all exams. Your certificate is being processed.
                            </p>
                          </div>
                        </div>
                      </div>
                      <img src="/student/processing-certificate.svg" alt="Certificate Processing" className="max-w-xs mx-auto my-6" />
                      <p className="text-gray-600 text-sm">
                        Please check back later. You will be notified when your certificate is ready for collection.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Exam Guidelines */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-lg border-2 border-orange-600 overflow-hidden">
            <div className="bg-orange-600 text-white p-4">
              <p className="text-xl font-bold">Exam Guidelines</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-orange-700">Certification Requirements</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-orange-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Complete all required exams</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-orange-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Achieve at least 50% of the Overall weight in each exam</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-orange-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Complete the full course duration</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-orange-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Clear all outstanding course fees</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
