import PwaInstall from "./components/PwaInstall"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"

import DefaultLayout from "./layouts/DefaultLayout"
import AuthLayout from "./layouts/AuthLayout"
import TutorLayout from "./layouts/TutorLayout"
import Login from "./authPage/Login"
import AdminProtection from "./routes/AdminProtection";
import LoginProtect from "./routes/LoginProtect"

import Dashboard from "./adminPage/dashboard/Dashboard"
import Courses from "./adminPage/courses/Courses"
import StudentList from './adminPage/student/StudentList'
import StudentAdmission from './adminPage/student/admission/Admission'
import CancelAdmission from './adminPage/student/cancelAdmission/CancelAdmission'
import TutorsList from "./adminPage/tutors/TutorsList"
import ClassAllotment from "./adminPage/tutors/classAllotment/ClassAllotment"
import CohortManagement from "./adminPage/tutors/CohortManagement/CohortManagement"
import ApplicationsManagement from './adminPage/student/applications/ApplicationsManagement';

import TutorDashboard from "./tutorPage/TutorDashboard"
import TutorStudentsList from "./tutorPage/tutorStudentsList/TutorStudentsList"
import CurriculumManagement from "./tutorPage/curriculum/CurriculumManagement"
import LessonPlan from "./tutorPage/lessonPlan/LessonPlan"
import Salary from "./tutorPage/salary/Salary"
import Settings from "./tutorPage/settings/Settings"
import StudentDashboard from "./studentPage/StudentDashboard"
import AttendanceTracking from "./adminPage/attendance/AttendanceTracking"
import UpdateGrades from "./adminPage/grading/UpdateGrades"
import GraduationManagement from "./adminPage/graduation/GraduationManagement"
import ExamTimetableManagement from "./adminPage/timetable/ExamTimetableManagement"
import StaffList from "./adminPage/staff/StaffList"
import InventoryManagement from "./adminPage/inventory/InventoryManagement"
import StudentFee from "./adminPage/financial/studentFee/StudentFee"
import Receipts from "./adminPage/financial/receipts/Receipts"
import Invoices from "./adminPage/financial/invoices/Invoices"
import Bills from "./adminPage/financial/bills/Bills"
import Quotations from "./adminPage/financial/quotations/Quotations"
import SalaryManagement from "./adminPage/financial/salaryManagement/SalaryManagement"
import FinancialDocuments from "./adminPage/financial/financialDocuments/FinancialDocuments"
import AdminManagement from "./adminPage/admins/AdminManagement"
import AlumniList from "./adminPage/alumni/AlumniList"
import TutorProtection from "./routes/TutorProtection"
import StudentProtection from "./routes/StudentProtection"
import StudentExams from "./studentPage/StudentExams"
import StudentSettings from "./studentPage/StudentSettings"
import StudentLayout from "./layouts/StudentLayout"
import TutorGrades from "./tutorPage/TutorGrades/TutorGrades"
import FeedbackManagementPage from "./adminPage/notifications/FeedbackManagementPage"
import QuizDashboard from "./tutorPage/exam/QuizDashboard"
import AdminForum from "./adminPage/forums/AdminForum"
import TutorForum from "./tutorPage/forums/TutorForum"
import ExamManagement from "./tutorPage/examManagement/ExamManagement"
import AssignExamToGroup from "./tutorPage/examManagement/AssignExamToGroup"
import Newsletter from "./adminPage/components/newsletter/Newsletter"
import Trylist from "./adminPage/admins/Trylist"
import ReceiptSharePage from "./publicPages/ReceiptSharePage"
import DocumentSharePage from "./publicPages/DocumentSharePage"


export default function App() {
  return (
    <Router>
      <Toaster position="top-right" />

      <PwaInstall />
      <Routes>
        {/* AUTH ROUTES (NO SIDEBAR) */}
        <Route path="/" element={<LoginProtect><AuthLayout><Login /></AuthLayout></LoginProtect>} />

        {/* PUBLIC ROUTES (NO AUTH, NO SIDEBAR) */}
        <Route path="/receipt/:receiptNumber" element={<ReceiptSharePage />} />
        <Route path="/document/:type/:id" element={<DocumentSharePage />} />

        {/* DEFAULT ADMIN ROUTES (WITH SIDEBAR) */}
        <Route path="/admin-dash" element={<AdminProtection allowedRoles={["senior", "junior"]} tabKey="dashboard"><DefaultLayout><Dashboard /></DefaultLayout></AdminProtection>} />
        <Route path="/admin-dashboard/courses" element={<AdminProtection allowedRoles={["senior", "junior"]} tabKey="courses"><DefaultLayout><Courses /></DefaultLayout></AdminProtection>} />
        <Route path="/admin-dashboard/applications" element={
          <AdminProtection allowedRoles={["senior", "junior"]} tabKey="applications">
            <DefaultLayout>
              <ApplicationsManagement />
            </DefaultLayout>
          </AdminProtection>
        } />
        <Route path="/admin-dashboard/students-list" element={<AdminProtection allowedRoles={["senior", "junior"]} tabKey="studentsList"><DefaultLayout><StudentList /></DefaultLayout></AdminProtection>} />
        <Route path="/admin-dashboard/admission/:admissionNumber?" element={<AdminProtection allowedRoles={["senior", "junior"]} tabKey="studentAdmission"><DefaultLayout><StudentAdmission /></DefaultLayout></AdminProtection>} />
        <Route path="/students/cancel-admission" element={<AdminProtection allowedRoles={["senior", "junior"]} tabKey="cancelAdmission"><DefaultLayout><CancelAdmission /></DefaultLayout></AdminProtection>} />
        <Route path="/admin-dashboard/cancel-admission" element={<AdminProtection allowedRoles={["senior", "junior"]} tabKey="cancelAdmission"><DefaultLayout><CancelAdmission /></DefaultLayout></AdminProtection>} />
        <Route path="/admin-dashboard/tutors-list" element={<AdminProtection allowedRoles={["senior", "junior"]} tabKey="tutorsList"><DefaultLayout><TutorsList /></DefaultLayout></AdminProtection>} />
        <Route path="/admin-dashboard/class-allotment" element={<AdminProtection allowedRoles={["senior", "junior"]} tabKey="classAllotment"><DefaultLayout><ClassAllotment /></DefaultLayout></AdminProtection>} />
        {/* <Route path="/admin-dashboard/cohort-management" element={<AdminProtection allowedRoles={["senior", "junior"]}><DefaultLayout><CohortManagement /></DefaultLayout></AdminProtection>} /> */}
        <Route path="/admin-dashboard/attendance" element={<AdminProtection allowedRoles={["senior", "junior"]} tabKey="attendance"><DefaultLayout><AttendanceTracking /></DefaultLayout></AdminProtection>} />
        <Route path="/admin-dashboard/exams-grades" element={<AdminProtection allowedRoles={["senior", "junior"]} tabKey="examsGrades"><DefaultLayout><UpdateGrades /></DefaultLayout></AdminProtection>} />
        <Route path="/admin-dashboard/graduation-management" element={<AdminProtection allowedRoles={["senior", "junior"]} tabKey="graduation"><DefaultLayout><GraduationManagement /></DefaultLayout></AdminProtection>} />
        <Route path="/admin-dashboard/exam-timetable-management" element={<AdminProtection allowedRoles={["senior", "junior"]}><DefaultLayout><ExamTimetableManagement /></DefaultLayout></AdminProtection>} />
        <Route path="/admin-dashboard/staff" element={<AdminProtection allowedRoles={["senior", "junior"]} tabKey="staffList"><DefaultLayout><StaffList /></DefaultLayout></AdminProtection>} />
        <Route path="/admin-dashboard/inventory-management" element={<AdminProtection allowedRoles={["senior", "junior"]} tabKey="inventoryManagement"><DefaultLayout><InventoryManagement /></DefaultLayout></AdminProtection>} />
        <Route path="/admin-dashboard/student-fee" element={<AdminProtection allowedRoles={["senior", "junior"]} tabKey="studentFee"><DefaultLayout><StudentFee /></DefaultLayout></AdminProtection>} />
        <Route path="/admin-dashboard/receipts" element={<AdminProtection allowedRoles={["senior", "junior"]} tabKey="receipts"><DefaultLayout><Receipts /></DefaultLayout></AdminProtection>} />
        <Route path="/admin-dashboard/invoices" element={<AdminProtection allowedRoles={["senior", "junior"]} tabKey="invoices"><DefaultLayout><Invoices /></DefaultLayout></AdminProtection>} />
        <Route path="/admin-dashboard/salary-management" element={<AdminProtection allowedRoles={["senior"]}><DefaultLayout><SalaryManagement /></DefaultLayout></AdminProtection>} />
        <Route path="/admin-dashboard/financial-docs" element={<AdminProtection allowedRoles={["senior", "junior"]} tabKey="financialDocs"><DefaultLayout><FinancialDocuments /></DefaultLayout></AdminProtection>} />
        <Route path="/admin-dashboard/bills" element={<AdminProtection allowedRoles={["senior", "junior"]} tabKey="bills"><DefaultLayout><Bills /></DefaultLayout></AdminProtection>} />
        <Route path="/admin-dashboard/quotations" element={<AdminProtection allowedRoles={["senior", "junior"]} tabKey="quotations"><DefaultLayout><Quotations /></DefaultLayout></AdminProtection>} />
        <Route path="/admin-dashboard/admin-management" element={<AdminProtection allowedRoles={["senior"]}><DefaultLayout><AdminManagement /></DefaultLayout></AdminProtection>} />
        <Route path="/admin-dashboard/alumni" element={<AdminProtection allowedRoles={["senior", "junior"]} tabKey="alumni"><DefaultLayout><AlumniList /></DefaultLayout></AdminProtection>} />
        <Route path="/admin-dashboard/notifications" element={<AdminProtection allowedRoles={["senior", "junior"]} tabKey="notifications"><DefaultLayout><FeedbackManagementPage /></DefaultLayout></AdminProtection>} />
        <Route path="/admin-dashboard/newsletter" element={<AdminProtection allowedRoles={["senior", "junior"]} tabKey="newsletter"><DefaultLayout><Newsletter /></DefaultLayout></AdminProtection>} />
        <Route path="/admin-dashboard/forums" element={<AdminProtection allowedRoles={["senior", "junior"]} tabKey="forums"><DefaultLayout><AdminForum /></DefaultLayout></AdminProtection>} />
        <Route path="/admin-dashboard/server-subscription" element={<AdminProtection allowedRoles={["senior"]}><DefaultLayout><Trylist /></DefaultLayout></AdminProtection>} />

        {/* STUDENT ROUTES (CUSTOM SIDEBAR) */}
        <Route path="/student-dash" element={<StudentProtection><StudentLayout><StudentDashboard /></StudentLayout> </StudentProtection>} />
        <Route path="/student-dash/exams" element={<StudentProtection><StudentLayout><StudentExams /></StudentLayout> </StudentProtection>} />
        <Route path="/student-dash/settings" element={<StudentProtection><StudentLayout><StudentSettings /></StudentLayout> </StudentProtection>} />

        {/* TEACHER ROUTES (CUSTOM SIDEBAR) */}
        <Route path="/teacher-dash" element={<TutorProtection><TutorLayout><TutorDashboard /></TutorLayout></TutorProtection>} />
        <Route path="/teacher-dashboard/students" element={<TutorProtection><TutorLayout><TutorStudentsList /></TutorLayout></TutorProtection>} />
        <Route path="/teacher-dashboard/lessons" element={<TutorProtection><TutorLayout><LessonPlan /></TutorLayout></TutorProtection>} />
        <Route path="/teacher-dashboard/curriculum" element={<TutorProtection><TutorLayout><CurriculumManagement /></TutorLayout></TutorProtection>} />
        <Route path="/teacher-dashboard/quizes" element={<TutorProtection><TutorLayout><QuizDashboard /></TutorLayout></TutorProtection>} />
        <Route path="/teacher-dashboard/exams" element={<TutorProtection><TutorLayout><ExamManagement /></TutorLayout></TutorProtection>} />
        <Route path="/teacher-dashboard/assign-exams" element={<TutorProtection><TutorLayout><AssignExamToGroup /></TutorLayout></TutorProtection>} />
        <Route path="/teacher-dashboard/grades" element={<TutorProtection><TutorLayout><TutorGrades /></TutorLayout></TutorProtection>} />
        <Route path="/teacher-dashboard/salary" element={<TutorProtection requirePass={true}><TutorLayout><Salary /></TutorLayout></TutorProtection>} />
        <Route path="/teacher-dashboard/settings" element={<TutorProtection requirePass={true}><TutorLayout><Settings /></TutorLayout></TutorProtection>} />
        <Route path="/teacher-dashboard/forum" element={<TutorProtection><TutorLayout><TutorForum /></TutorLayout></TutorProtection>} />

      </Routes>
    </Router>
  )
}
