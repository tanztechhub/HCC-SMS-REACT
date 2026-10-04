// src/layouts/DefaultLayout.jsx
import Sidebar from "../adminPage/components/adminSidebar/AdminSidebar"
import AdminTopNav from "../adminPage/components/adminTopNav/AdminTopNav"

export default function DefaultLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-200">
      <Sidebar />
      <main className="ml-64">
        <AdminTopNav />
        {children}
      </main>
    </div>
  )
}
