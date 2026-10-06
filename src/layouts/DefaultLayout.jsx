import { useLocation } from "react-router-dom"
import "../adminPage/Teaching.css"
// src/layouts/DefaultLayout.jsx
import Sidebar from "../adminPage/components/adminSidebar/AdminSidebar"
import AdminTopNav from "../adminPage/components/adminTopNav/AdminTopNav"

export default function DefaultLayout({ children }) {
  const { pathname } = useLocation()
  const teachingRoutes = ["tutors-list", "class-allotment", "attendance", "exams-grades", "graduation-management", "exam-timetable-management"]
  const isTeachingPage = teachingRoutes.some((route) => pathname === `/admin-dashboard/${route}`)
  return (
    <div className="min-h-screen bg-gray-200">
      <Sidebar />
      <main className="ml-64">
        <AdminTopNav />
        <div className={isTeachingPage ? "hcc-teaching" : undefined}>{children}</div>
      </main>
    </div>
  )
}
