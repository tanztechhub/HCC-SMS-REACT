import { Power, Bell, MessageSquare, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { NavLink } from "react-router-dom"
import LogoutModal from "../logoutModal/LogoutModal"
import toast from "react-hot-toast"
import { NotificationBell } from "../NotificationBell"

const API_URL = import.meta.env.VITE_API_URL

export function StudentTopNav() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [upcomingQuizzesCount, setUpcomingQuizzesCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 3600000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"))
      if (!userData || !userData.token) return

      const response = await fetch(`${API_URL}/feedback/notifications/${userData.admissionNumber}`, {
        headers: { Authorization: `Bearer ${userData.token}` }
      })

      const data = await response.json()
      if (data.success) {
        const unreadNotifications = data.data.filter(item =>
          (item.status === 'responded' || item.status === 'read') && !item.isStudentNotified
        )
        setNotifications(unreadNotifications)
        setUnreadCount(unreadNotifications.length)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  // 2. Add this function to fetch upcoming quizzes:
  const fetchUpcomingQuizzes = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"))
      if (!userData || !userData.token) return

      const response = await fetch(`${API_URL}/quizzes/student/single`, {
        headers: {
          Authorization: `Bearer ${userData.token}`,
          studentid: userData.id,
        },
      })

      const data = await response.json()
      if (data.success) {
        const upcomingQuizzes = data.data.filter(quiz => new Date(quiz.startDate) > new Date())
        const activeQuizzes = data.data.filter(quiz =>
          new Date(quiz.startDate) <= new Date() &&
          quiz.status === 'active' &&
          !quiz.response
        )
        // Count both upcoming and active quizzes that need attention
        setUpcomingQuizzesCount(upcomingQuizzes.length + activeQuizzes.length)
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error)
    }
  }

  useEffect(() => {
    fetchNotifications()
    fetchUpcomingQuizzes()
    const interval = setInterval(() => {
      fetchNotifications()
      fetchUpcomingQuizzes()
    }, 3600000) // Check every hour
    return () => clearInterval(interval)
  }, [])

  const markAsNotified = async (feedbackId) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"))
      await fetch(`${API_URL}/feedback/${feedbackId}/notify-student`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${userData.token}` }
      })

      // Remove from notifications
      setNotifications(prev => prev.filter(n => n._id !== feedbackId))
      setUnreadCount(prev => prev - 1)
    } catch (error) {
      console.error("Error marking notification:", error)
    }
  }

  const getNotificationIcon = (type, status) => {
    if (status === 'responded') {
      return <MessageSquare className="h-4 w-4 text-orange-600" />
    }
    return <CheckCircle className="h-4 w-4 text-blue-600" />
  }

  const getNotificationMessage = (feedback) => {
    if (feedback.status === 'responded') {
      return `Your ${feedback.type} has been responded to by admin.`
    }
    return `Your ${feedback.type} has been reviewed by admin.`
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <a href="/" className="flex-shrink-0 flex items-center cursor-pointer">
              <img className="h-8 w-auto" src="/wordmark.png" alt="School Logo" />
            </a>
          </div>

          {/* Desktop navigation */}
          <div className="hidden sm:flex sm:space-x-8 sm:items-center">
            <NavLink
              to="/student-dash"
              className="text-gray-900 hover:text-gray-700 px-3 py-2 text-sm font-medium transition-colors"
            >
              Home
            </NavLink>
            <div className="relative">
              <NavLink
                to="/student-dash/exams"
                className="text-gray-900 hover:text-gray-700 px-3 py-2 text-sm font-medium transition-colors"
              >
                Exams
              </NavLink>
              {upcomingQuizzesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {upcomingQuizzesCount > 9 ? '9+' : upcomingQuizzesCount}
                </span>
              )}
            </div>
            <NavLink
              to="/student-dash/settings"
              className="text-gray-900 hover:text-gray-700 px-3 py-2 text-sm font-medium transition-colors"
            >
              Settings
            </NavLink>

            {/* Notification Bell */}
            <NotificationBell />

            <div
              onClick={() => setIsLogoutModalOpen(true)}
              className="bg-red-500 p-2 rounded-md cursor-pointer text-white font-bold hover:bg-red-600">
              <Power className="h-5 w-5" />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            {/* Mobile Notification Bell */}
            <NotificationBell />

            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Notifications Dropdown */}
      {showNotifications && (
        <div className="sm:hidden bg-white border-t">
          <div className="p-4 bg-gray-50 border-b">
            <h3 className="font-medium text-gray-900">Notifications</h3>
          </div>
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No new notifications</div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className="p-4 border-b hover:bg-gray-50"
                onClick={() => markAsNotified(notification._id)}
              >
                <div className="flex items-start gap-3">
                  {getNotificationIcon(notification.type, notification.status)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {notification.status === 'responded' ? 'Admin Response' : 'Feedback Reviewed'}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {getNotificationMessage(notification)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Mobile menu */}
      <div className={`sm:hidden ${isOpen ? "block" : "hidden"}`}>
        <div className="pt-2 pb-3 space-y-1">
          <NavLink
            to="/student-dash"
            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Home
          </NavLink>
          <div className="relative inline-block">
            <NavLink
              to="/student-dash/exams"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Exams
            </NavLink>
            {upcomingQuizzesCount > 0 && (
              <span className="absolute top-2 left-16 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {upcomingQuizzesCount > 9 ? '9+' : upcomingQuizzesCount}
              </span>
            )}
          </div>
          <NavLink
            to="/student-dash/settings"
            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Settings
          </NavLink>
          <NotificationBell />
          <div
            onClick={() => setIsLogoutModalOpen(true)}
            className="bg-red-500 p-2 rounded-md cursor-pointer text-white font-bold hover:bg-red-600 w-40 flex justify-between items-center px-2 ml-2"
          >
            Logout <Power className="h-5 w-5" />
          </div>
        </div>
      </div>
      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </nav>
  )
}