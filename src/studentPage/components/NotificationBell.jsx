import { Bell, Check, Eye } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import toast from "react-hot-toast"

const API_URL = import.meta.env.VITE_API_URL

export function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef(null)

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 36000000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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
        setNotifications(data.data)
        setUnreadCount(data.data.filter(n => !n.studentHasSeen).length)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const markAsSeen = async (notificationId) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"))
      const response = await fetch(`${API_URL}/feedback/mark-seen/${notificationId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${userData.token}` }
      })

      if (response.ok) {
        fetchNotifications() // Refresh notifications
      }
    } catch (error) {
      console.error("Error marking notification as seen:", error)
    }
  }

  const markAllAsSeen = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"))
      const response = await fetch(`${API_URL}/feedback/mark-all-seen/${userData.admissionNumber}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${userData.token}` }
      })

      if (response.ok) {
        fetchNotifications()
        toast.success("All notifications marked as seen")
      }
    } catch (error) {
      console.error("Error marking all notifications as seen:", error)
    }
  }

  const getNotificationMessage = (notification) => {
    if (notification.isAdminResponded) {
      return `Your ${notification.type} has been responded to by admin`
    } else if (notification.isMarkedRead) {
      return `Your ${notification.type} has been read by admin`
    }
    return `Your ${notification.type} status updated`
  }

  const getNotificationTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-full"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Notifications</h3>
              {console.log("notifications", notifications)}
              {notifications.length > 0 && (
                <button
                  onClick={markAllAsSeen}
                  className="text-sm text-orange-600 hover:text-orange-800 flex items-center gap-1"
                >
                  <Check className="h-4 w-4" />
                  Mark all as seen
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notification.studentHasSeen ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => {
                    if (!notification.studentHasSeen) {
                      markAsSeen(notification._id)
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {getNotificationMessage(notification)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        "{notification.message.substring(0, 50)}..."
                      </p>
                      {notification.adminResponse && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                          <p className="font-medium text-blue-800">Response:</p>
                          <p className="text-blue-700">{notification.adminResponse.substring(0, 100)}...</p>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {getNotificationTime(notification.updatedAt)}
                      </p>
                    </div>
                    {!notification.studentHasSeen && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

