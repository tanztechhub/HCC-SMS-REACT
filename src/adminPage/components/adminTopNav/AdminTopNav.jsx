"use client"

import { useState, useEffect, useRef } from "react"
import "./AdminTopNav.css"
import { useNavigate } from "react-router-dom"
import { MdSearch, MdPerson, MdLogout, MdSettings } from "react-icons/md"
import { MessageSquare } from "lucide-react"
import LogoutModal from "../../../studentPage/components/logoutModal/LogoutModal"
import { NavLink } from "react-router-dom"
import NotificationBell from "../../dashboard/notificationBell/NotificationBell"
const API_URL = import.meta.env.VITE_API_URL

export default function AdminTopNav() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showForumNotifications, setShowForumNotifications] = useState(false)
  const [forumNotificationCount, setForumNotificationCount] = useState(0)
  const notificationRef = useRef(null)
  const profileRef = useRef(null)
  const forumNotificationRef = useRef(null)
  const loggedInUser = JSON.parse(localStorage.getItem("user"))
  const navigate = useNavigate()

  useEffect(() => {
    fetchForumNotifications()
  }, [])

  const fetchForumNotifications = async () => {
    try {
      const response = await fetch(`${API_URL}/api/forums`, {
        headers: {
          Authorization: `Bearer ${loggedInUser.token}`,
          "Content-Type": "application/json",
        },
      })
      const data = await response.json()
      if (data.success) {
        setForumNotificationCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error("Error fetching forum notifications:", error)
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

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  const handleRedirect = () => {
    navigate("/admin-dashboard/admin-management")
  }

  return (
    <div className="hcc-topbar sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="hcc-topbar-inner">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <span className="hcc-topbar-workspace">HCC <span>/ Admin</span></span>
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              aria-label="Search"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 rounded-lg bg-[#9a3412]/10 w-64 focus:outline-none focus:ring-2 focus:ring-[#9a3412]/20"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Student Search */}
          <div className="relative">
            <input
              type="text"
              aria-label="Student name or admission number"
              placeholder="Name/Admission No."
              className="pl-4 pr-4 py-2 rounded-lg bg-[#9a3412]/10 w-48 focus:outline-none focus:ring-2 focus:ring-[#9a3412]/20"
            />
          </div>

          {/* Forum Notifications */}
          <div className="relative" ref={forumNotificationRef}>
            <button
              aria-label="Forum updates"
              aria-expanded={showForumNotifications}
              onClick={() => setShowForumNotifications(!showForumNotifications)}
              className="p-2 hover:bg-gray-100 rounded-full relative cursor-pointer"
            >
              <MessageSquare className="h-6 w-6" />
              {forumNotificationCount > 0 && (
                <span className="absolute top-0 right-0 h-5 w-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                  {forumNotificationCount}
                </span>
              )}
            </button>

            {/* Forum Notifications Dropdown */}
            {showForumNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="p-4">
                  <h3 className="font-semibold mb-2">Forum Updates</h3>
                  <div className="space-y-2">
                    {forumNotificationCount === 0 ? (
                      <div className="p-2 hover:bg-gray-50 rounded-lg">
                        <p className="text-sm">No new forum updates</p>
                      </div>
                    ) : (
                      <div className="p-2 hover:bg-gray-50 rounded-lg">
                        <p className="text-sm">{forumNotificationCount} new forum updates</p>
                        <p className="text-xs text-gray-500">Click to view in Forum tab</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div>
            <NotificationBell />
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              aria-label="Account menu"
              aria-expanded={showProfile}
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-2 hover:bg-orange-200 rounded-lg bg-orange-100 cursor-pointer"
            >
              <div className="hcc-topbar-account"><strong>{loggedInUser.username}</strong><span>{loggedInUser.role} admin</span></div>
              <img
                src={loggedInUser.profileImage || "/profile/student.jpg"}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
            </button>

            {/* Profile Dropdown */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="p-2">
                  <div className="px-3 py-2 text-sm text-gray-500">HCC School Management</div>
                  <div className="px-3 py-2 font-medium capitalize">{loggedInUser.role} admin</div>
                  <hr className="my-1" />
                  <NavLink
                    to={"/admin-dashboard/admin-management"}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    <MdPerson className="h-5 w-5" />
                    View Profile
                  </NavLink>
                  <NavLink
                    to={"/admin-dashboard/admin-management"}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    <MdSettings className="h-5 w-5" />
                    Password
                  </NavLink>
                  <button
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 rounded-lg text-red-600 cursor-pointer"
                  >
                    <MdLogout className="h-5 w-5" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} />
    </div>
  )
}
