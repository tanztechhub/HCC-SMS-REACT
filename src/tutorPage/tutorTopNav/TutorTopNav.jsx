"use client"

import { useState, useEffect, useRef } from "react"
import { Menu, Power } from "lucide-react"
import { MdNotifications, MdSearch } from "react-icons/md"
import { MessageSquare, Eye, Calendar, User } from "lucide-react"
import { format, parseISO } from "date-fns"
import LogoutModal from "../../studentPage/components/logoutModal/LogoutModal"

const API_URL = import.meta.env.VITE_API_URL

export default function TutorTopNav() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showForumNotifications, setShowForumNotifications] = useState(false)
  const [unreadForumsCount, setUnreadForumsCount] = useState(0)
  const [unreadForums, setUnreadForums] = useState([])
  const [loadingForums, setLoadingForums] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const notificationRef = useRef(null)
  const profileRef = useRef(null)
  const forumNotificationRef = useRef(null)

  useEffect(() => {
    fetchForumNotifications()
    // Refresh every 2 minutes
    const interval = setInterval(fetchForumNotifications, 120000)
    return () => clearInterval(interval)
  }, [])

  const fetchForumNotifications = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      
      // Fetch unread count
      const countResponse = await fetch(`${API_URL}/api/forums/unread/count/${user.id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      })
      const countData = await countResponse.json()
      
      if (countData.success) {
        setUnreadForumsCount(countData.data.unread || 0)
      }
      
      // Fetch top 5 unread forums
      const forumsResponse = await fetch(`${API_URL}/api/forums/unread/${user.id}?limit=5`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      })
      const forumsData = await forumsResponse.json()
      
      if (forumsData.success) {
        setUnreadForums(forumsData.forums || [])
      }
    } catch (error) {
      console.error("Error fetching forum notifications:", error)
    }
  }

  const handleForumClick = () => {
    setShowForumNotifications(!showForumNotifications)
    if (!showForumNotifications) {
      setLoadingForums(true)
      fetchForumNotifications().then(() => setLoadingForums(false))
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50'
      case 'high':
        return 'text-orange-600 bg-orange-50'
      default:
        return 'text-blue-600 bg-blue-50'
    }
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false)
      }
      if (forumNotificationRef.current && !forumNotificationRef.current.contains(event.target)) {
        setShowForumNotifications(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="sticky top-0 z-5 bg-white border-b border-gray-200 shadow-md">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer hidden lg:block">
            <Menu className="h-6 w-6" />
          </button>
          <img src="/favicon.png" alt="" height={10} width={35} />
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 rounded-lg bg-[#9a3412]/10 w-50 focus:outline-none focus:ring-2 focus:ring-[#9a3412]/20"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="lg:flex items-center gap-4">
          {/* Student Search */}
          <div className="lg:block relative hidden">
            <input
              type="text"
              placeholder="Name/Admission No."
              className="pl-4 pr-4 py-2 rounded-lg bg-[#9a3412]/10 w-48 focus:outline-none focus:ring-2 focus:ring-[#9a3412]/20"
            />
          </div>

          {/* Forum Notifications */}
          <div className="relative max-md:hidden" ref={forumNotificationRef}>
            <button
              onClick={handleForumClick}
              className="p-2 hover:bg-gray-100 rounded-full relative cursor-pointer transition-colors"
            >
              <MessageSquare className="h-6 w-6" />
              {unreadForumsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                  {unreadForumsCount > 99 ? '99+' : unreadForumsCount}
                </span>
              )}
            </button>

            {/* Forum Notifications Dropdown */}
            {showForumNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-white" />
                      <h3 className="font-semibold text-white">Forum Notifications</h3>
                    </div>
                    {unreadForumsCount > 0 && (
                      <span className="bg-white text-blue-600 text-xs font-bold px-2 py-1 rounded-full">
                        {unreadForumsCount} New
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="max-h-96 overflow-y-auto">
                  {loadingForums ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : unreadForums.length === 0 ? (
                    <div className="p-6 text-center">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm font-medium">All caught up!</p>
                      <p className="text-gray-400 text-xs mt-1">No new forum notifications</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {unreadForums.map((forum) => (
                        <a
                          key={forum._id}
                          href="/teacher-dashboard/forum"
                          className="block p-4 hover:bg-blue-50 transition-colors"
                          onClick={() => setShowForumNotifications(false)}
                        >
                          <div className="flex items-start gap-3">
                            {/* Priority indicator */}
                            <div className="flex-shrink-0 mt-1">
                              <div className={`w-2 h-2 rounded-full ${forum.priority === 'urgent' ? 'bg-red-500 animate-pulse' : forum.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              {/* Forum title */}
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
                                  {forum.title}
                                </h4>
                                <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${getPriorityColor(forum.priority)}`}>
                                  {forum.priority.toUpperCase()}
                                </span>
                              </div>
                              
                              {/* Forum description */}
                              <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                {forum.description}
                              </p>
                              
                              {/* Meta info */}
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>{forum.createdBy.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{format(parseISO(forum.createdAt), 'MMM dd')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="h-3 w-3" />
                                  <span>{forum.replies?.length || 0} replies</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {unreadForums.length > 0 && (
                  <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <a
                      href="/teacher-dashboard/forum"
                      className="block w-full text-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                      onClick={() => setShowForumNotifications(false)}
                    >
                      View All Forums ({unreadForumsCount})
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative max-md:hidden" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-gray-100 rounded-full relative cursor-pointer"
            >
              <MdNotifications className="h-6 w-6" />
              <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                0
              </span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="p-4">
                  <h3 className="font-semibold mb-2">Notifications</h3>
                  <div className="space-y-2">
                    <div className="p-2 hover:bg-gray-50 rounded-lg">
                      <p className="text-sm">No new Notifications</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            onClick={() => setIsLogoutModalOpen(true)}
            className="bg-red-500 p-2 rounded-md cursor-pointer text-white font-bold hover:bg-red-600"
          >
            <Power className="h-5 w-5" />
          </div>
        </div>
      </div>
      {/* Logout Confirmation Modal */}
      <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} />
    </div>
  )
}
