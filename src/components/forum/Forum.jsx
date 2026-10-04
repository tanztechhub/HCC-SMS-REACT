"use client"

import { useState, useEffect } from "react"
import {
  MessageCircle, Plus, RefreshCw, Calendar, Clock, User, Pin,
  CheckCircle, XCircle, Lock, Tag, Edit3, Trash2, AlertTriangle,
  Search, Filter, ChevronDown, Eye, EyeOff
} from "lucide-react"
import { format, isAfter, parseISO } from "date-fns"
import LoadingSpinner from "../loadingSpinner/LoadingSpinner"

const API_URL = import.meta.env.VITE_API_URL

export default function Forum({ userRole = "tutor" }) {
  const [forums, setForums] = useState([])
  const [filteredForums, setFilteredForums] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedForum, setSelectedForum] = useState(null)
  const [newReply, setNewReply] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [loadingStates, setLoadingStates] = useState({
    createForum: false,
    refreshForums: false,
    resolveForum: {},
    reopenForum: {},
    closeForum: {},
    deleteForum: {},
    addReply: {},
    markRead: {}
  })
  const [showViewers, setShowViewers] = useState({})

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "discussion",
    expiryDate: "",
    priority: "normal",
    tags: []
  })

  const user = JSON.parse(localStorage.getItem("user") || "{}")

  useEffect(() => {
    fetchForums()
  }, [])

  useEffect(() => {
    filterForums()
  }, [forums, searchTerm, statusFilter, typeFilter, priorityFilter])


  //=================== Fetch all forums 
  const fetchForums = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/forums`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      })
      const data = await response.json()
      if (data.success) {
        setForums(data.forums)
      }
    } catch (error) {
      console.error("Error fetching forums:", error)
    } finally {
      setLoading(false)
    }
  }


  //=================== Handle fitering 
  const filterForums = () => {
    let filtered = forums

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(forum =>
        forum.title.toLowerCase().includes(term) ||
        forum.description.toLowerCase().includes(term) ||
        forum.tags?.some(tag => tag.toLowerCase().includes(term)) ||
        forum.replies?.some(reply => reply.message.toLowerCase().includes(term))
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(forum => forum.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(forum => forum.type === typeFilter)
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter(forum => forum.priority === priorityFilter)
    }

    setFilteredForums(filtered)
  }

  const refreshForums = async () => {
    setRefreshing(true)
    setLoadingStates(prev => ({ ...prev, refreshForums: true }))
    await fetchForums()
    setRefreshing(false)
    setLoadingStates(prev => ({ ...prev, refreshForums: false }))
  }


  //================== create forums 
  const createForum = async (e) => {
    e.preventDefault()
    setLoadingStates(prev => ({ ...prev, createForum: true }))
    try {
      const response = await fetch(`${API_URL}/api/forums`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          createdBy: {
            id: user.id,
            name: user.firstName ? `${user.firstName} ${user.lastName}` : user.username,
            role: user.position || user.role,
          },
        }),
      })
      const data = await response.json()
      if (data.success) {
        setForums([data.forum, ...forums])
        setShowCreateForm(false)
        setFormData({
          title: "",
          description: "",
          type: "discussion",
          expiryDate: "",
          priority: "normal",
          tags: []
        })
      }
    } catch (error) {
      console.error("Error creating forum:", error)
    } finally {
      setLoadingStates(prev => ({ ...prev, createForum: false }))
    }
  }


  //================== Add Replies 
  const addReply = async (forumId) => {
    if (!newReply.trim()) return

    setLoadingStates(prev => ({ ...prev, addReply: { ...prev.addReply, [forumId]: true } }))
    try {
      const response = await fetch(`${API_URL}/api/forums/${forumId}/replies`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: newReply,
          author: {
            id: user.id,
            name: user.firstName ? `${user.firstName} ${user.lastName}` : user.username,
            role: user.position || user.role,
          },
        }),
      })
      const data = await response.json()
      if (data.success) {
        setForums(
          forums.map((forum) =>
            forum._id === forumId ? { ...forum, replies: [...forum.replies, data.reply] } : forum,
          ),
        )
        setNewReply("")
      }
    } catch (error) {
      console.error("Error adding reply:", error)
    } finally {
      setLoadingStates(prev => ({ ...prev, addReply: { ...prev.addReply, [forumId]: false } }))
    }
  }


  //============ Resolve Form
  const resolveForum = async (forumId) => {
    setLoadingStates(prev => ({ ...prev, resolveForum: { ...prev.resolveForum, [forumId]: true } }))
    try {
      const response = await fetch(`${API_URL}/api/forums/${forumId}/resolve`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json"
        },
      })
      const data = await response.json()
      if (data.success) {
        setForums(forums.map(forum =>
          forum._id === forumId ? data.forum : forum
        ))
      }
    } catch (error) {
      console.error("Error resolving forum:", error)
    } finally {
      setLoadingStates(prev => ({ ...prev, resolveForum: { ...prev.resolveForum, [forumId]: false } }))
    }
  }


  //=============== Reopen Forum
  const reopenForum = async (forumId) => {
    setLoadingStates(prev => ({ ...prev, reopenForum: { ...prev.reopenForum, [forumId]: true } }))
    try {
      const response = await fetch(`${API_URL}/api/forums/${forumId}/reopen`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setForums(forums.map(forum =>
          forum._id === forumId ? data.forum : forum
        ))
      }
    } catch (error) {
      console.error("Error reopening forum:", error)
    } finally {
      setLoadingStates(prev => ({ ...prev, reopenForum: { ...prev.reopenForum, [forumId]: false } }))
    }
  }


  //========= Close Forum 
  const closeForum = async (forumId) => {
    setLoadingStates(prev => ({ ...prev, closeForum: { ...prev.closeForum, [forumId]: true } }))
    try {
      const response = await fetch(`${API_URL}/api/forums/${forumId}/close`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setForums(forums.map(forum =>
          forum._id === forumId ? data.forum : forum
        ))
      }
    } catch (error) {
      console.error("Error closing forum:", error)
    } finally {
      setLoadingStates(prev => ({ ...prev, closeForum: { ...prev.closeForum, [forumId]: false } }))
    }
  }


  //==================== Delete Forum 
  const deleteForum = async (forumId) => {
    if (!confirm("Are you sure you want to delete this forum? This action cannot be undone.")) return

    setLoadingStates(prev => ({ ...prev, deleteForum: { ...prev.deleteForum, [forumId]: true } }))
    try {
      const response = await fetch(`${API_URL}/api/forums/${forumId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setForums(forums.filter(forum => forum._id !== forumId))
      }
    } catch (error) {
      console.error("Error deleting forum:", error)
    } finally {
      setLoadingStates(prev => ({ ...prev, deleteForum: { ...prev.deleteForum, [forumId]: false } }))
    }
  }

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false
    return isAfter(new Date(), parseISO(expiryDate))
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "text-red-600 bg-red-50 border-red-200"
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200"
      default:
        return "text-blue-600 bg-blue-50 border-blue-200"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "resolved":
        return "text-orange-600 bg-orange-50"
      case "closed":
        return "text-gray-600 bg-gray-50"
      default:
        return "text-blue-600 bg-blue-50"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-4 w-4" />
      case "closed":
        return <Lock className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getTypeIcon = (type) => {
    return type === "announcement" ? <Pin className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />
  }

  const canModify = (forum) => {
    return userRole === "admin" || forum.createdBy.id === user.id
  }

  const isForumRead = (forum) => {
    return forum.views?.some(view => view.userId === user.id)
  }

  const markAsRead = async (forumId) => {
    setLoadingStates(prev => ({ ...prev, markRead: { ...prev.markRead, [forumId]: true } }))
    try {
      const response = await fetch(`${API_URL}/api/forums/${forumId}/mark-read`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          userRole: user.role,
          profileImage: user.profileImage || null
        })
      })
      const data = await response.json()
      if (data.success) {
        // Update the forum in local state
        setForums(prev => prev.map(f => 
          f._id === forumId ? { ...f, views: data.forum.views } : f
        ))
      }
    } catch (error) {
      console.error("Error marking forum as read:", error)
    } finally {
      setLoadingStates(prev => ({ ...prev, markRead: { ...prev.markRead, [forumId]: false } }))
    }
  }

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const toggleViewers = (forumId) => {
    setShowViewers(prev => ({ ...prev, [forumId]: !prev[forumId] }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className={`p-4 ${userRole === "tutor" ? "max-w-full" : ""}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forum</h1>
          <p className="text-gray-600">Internal communication between admin and tutors</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={refreshForums}
            disabled={refreshing || loadingStates.refreshForums}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loadingStates.refreshForums ? (
              <LoadingSpinner size={20} />
            ) : (
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            )}
            Refresh
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New {userRole === "admin" ? "Announcement/Discussion" : "Discussion"}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search forums..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer"
          >
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Types</option>
                <option value="discussion">Discussion</option>
                <option value="announcement">Announcement</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Priorities</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create New Forum</h2>
            <form onSubmit={createForum} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              {userRole === "admin" && (
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="discussion">Discussion</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Expiry Date (Optional)</label>
                <input
                  type="datetime-local"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={loadingStates.createForum}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loadingStates.createForum ? (
                    <>
                      <LoadingSpinner size={20} />
                      Creating...
                    </>
                  ) : (
                    "Create Forum"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Forums List */}
      <div className="space-y-4">
        {filteredForums.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No forums found matching your criteria</p>
          </div>
        ) : (
          filteredForums.map((forum) => (
            <div
              key={forum._id}
              className={`border rounded-lg p-4 ${isExpired(forum.expiryDate) ? "opacity-60 bg-gray-50" : isForumRead(forum) ? "bg-gray-50" : "bg-white border-l-4 border-l-blue-500"} ${getPriorityColor(forum.priority)} ${!isForumRead(forum) && !isExpired(forum.expiryDate) ? "shadow-md" : ""}`}
            >
              {/* Forum Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {getTypeIcon(forum.type)}
                    <h3 className="font-semibold text-lg">{forum.title}</h3>
                    {!isForumRead(forum) && userRole === "tutor" && (
                      <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded font-semibold animate-pulse">
                        NEW
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${getStatusColor(forum.status)}`}>
                      {getStatusIcon(forum.status)}
                      {forum.status.toUpperCase()}
                    </span>
                    {isExpired(forum.expiryDate) && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">EXPIRED</span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-2">{forum.description}</p>

                  {/* Tags */}
                  {forum.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {forum.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                          <Tag className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>
                        {forum.createdBy.name} ({forum.createdBy.role})
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{format(parseISO(forum.createdAt), "MMM dd, yyyy")}</span>
                    </div>
                    {forum.expiryDate && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Expires: {format(parseISO(forum.expiryDate), "MMM dd, yyyy HH:mm")}</span>
                      </div>
                    )}
                    {forum.resolvedAt && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-orange-500" />
                        <span>Resolved: {format(parseISO(forum.resolvedAt), "MMM dd, yyyy")}</span>
                      </div>
                    )}
                  </div>

                  {/* Viewers Section - Only show for tutors */}
                  {userRole === "tutor" && forum.views && forum.views.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleViewers(forum._id)}
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span>{forum.views.length} {forum.views.length === 1 ? 'view' : 'views'}</span>
                          <ChevronDown className={`h-4 w-4 transition-transform ${showViewers[forum._id] ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                      
                      {showViewers[forum._id] && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {forum.views.map((view, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full text-xs"
                              title={`${view.userName} - ${format(parseISO(view.viewedAt), 'MMM dd, HH:mm')}`}
                            >
                              {view.profileImage ? (
                                <img
                                  src={view.profileImage}
                                  alt={view.userName}
                                  className="w-5 h-5 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-semibold">
                                  {getInitials(view.userName)}
                                </div>
                              )}
                              <span className="text-gray-700">{view.userName}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-sm text-gray-500">{forum.replies?.length || 0} replies</span>
                  <button
                    onClick={() => setSelectedForum(selectedForum === forum._id ? null : forum._id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {selectedForum === forum._id ? "Hide" : "View"} Replies
                  </button>
                  {userRole === "tutor" && !isForumRead(forum) && (
                    <button
                      onClick={() => markAsRead(forum._id)}
                      disabled={loadingStates.markRead[forum._id]}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 cursor-pointer disabled:opacity-50 transition-colors"
                    >
                      {loadingStates.markRead[forum._id] ? (
                        <LoadingSpinner size={16} />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      Mark as Read for you.
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 mb-3">
                {forum.status === "open" && (
                  <button
                    onClick={() => resolveForum(forum._id)}
                    disabled={loadingStates.resolveForum[forum._id]}
                    className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm hover:bg-orange-200 cursor-pointer disabled:opacity-50"
                  >
                    {loadingStates.resolveForum[forum._id] ? (
                      <LoadingSpinner size={20} />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    Mark Resolved
                  </button>
                )}

                {(forum.status === "resolved" || forum.status === "closed") && (
                  <button
                    onClick={() => reopenForum(forum._id)}
                    disabled={loadingStates.reopenForum[forum._id]}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 cursor-pointer disabled:opacity-50"
                  >
                    {loadingStates.reopenForum[forum._id] ? (
                      <LoadingSpinner size={20} />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    Reopen
                  </button>
                )}

                {userRole === "admin" && forum.status === "open" && (
                  <button
                    onClick={() => closeForum(forum._id)}
                    disabled={loadingStates.closeForum[forum._id]}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 cursor-pointer disabled:opacity-50"
                  >
                    {loadingStates.closeForum[forum._id] ? (
                      <LoadingSpinner size={20} />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                    Close
                  </button>
                )}

                {canModify(forum) && (
                  <button
                    onClick={() => deleteForum(forum._id)}
                    disabled={loadingStates.deleteForum[forum._id]}
                    className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 ml-auto cursor-pointer disabled:opacity-50"
                  >
                    {loadingStates.deleteForum[forum._id] ? (
                      <LoadingSpinner size={20} />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete
                  </button>
                )}
              </div>

              {/* Replies Section */}
              {selectedForum === forum._id && (
                <div className="border-t pt-4 mt-4">
                  <div className="space-y-3 mb-4">
                    {forum.replies?.map((reply) => (
                      <div key={reply._id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-sm">{reply.author.name}</span>
                          <span className="text-xs text-gray-500">({reply.author.role})</span>
                          <span className="text-xs text-gray-500">
                            {format(parseISO(reply.createdAt), "MMM dd, HH:mm")}
                          </span>
                        </div>
                        <p className="text-gray-700">{reply.message}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add Reply */}
                  {forum.status === "open" && !isExpired(forum.expiryDate) && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <textarea
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        placeholder="Add your reply..."
                        rows={2}
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      />
                      <button
                        onClick={() => addReply(forum._id)}
                        disabled={!newReply.trim() || loadingStates.addReply[forum._id]}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        {loadingStates.addReply[forum._id] ? (
                          <LoadingSpinner size={20} />
                        ) : (
                          "Reply"
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}