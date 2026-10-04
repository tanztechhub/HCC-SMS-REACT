import { useState, useEffect } from "react"
import { MessageSquare, Send, Edit2, Trash2, X } from "lucide-react"
import toast from "react-hot-toast"

const API_URL = import.meta.env.VITE_API_URL

export default function StudentFeedbackWidget() {
    const [feedbacks, setFeedbacks] = useState([])
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [editingFeedback, setEditingFeedback] = useState(null)

    const [formData, setFormData] = useState({
        type: '',
        message: ''
    })

    const feedbackTypes = [
        { value: 'review', label: 'Review' },
        { value: 'comment', label: 'General Comment' },
        { value: 'complaint', label: 'Complaint' },
        { value: 'suggestion', label: 'Suggestion' },
        { value: 'inquiry', label: 'Inquiry' }
    ]

    useEffect(() => {
        fetchStudentFeedbacks()
    }, [])

    const fetchStudentFeedbacks = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem("user"))
            if (!userData || !userData.token) return

            const response = await fetch(`${API_URL}/feedback/student/${userData.admissionNumber}`, {
                headers: { Authorization: `Bearer ${userData.token}` }
            })

            const data = await response.json()
            if (data.success) {
                setFeedbacks(data.data)
            }
        } catch (error) {
            console.error("Error fetching feedbacks:", error)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.type || !formData.message.trim()) {
            toast.error("Please fill all fields")
            return
        }

        setIsLoading(true)
        try {
            const userData = JSON.parse(localStorage.getItem("user"))
            const endpoint = editingFeedback
                ? `${API_URL}/feedback/${editingFeedback._id}`
                : `${API_URL}/feedback`

            const method = editingFeedback ? 'PUT' : 'POST'

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userData.token}`,
                    admissionNumber: userData.admissionNumber,
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()
            if (data.success) {
                toast.success(editingFeedback ? "Feedback updated successfully" : "Feedback submitted successfully")
                setFormData({ type: '', message: '' })
                setIsFormOpen(false)
                setEditingFeedback(null)
                fetchStudentFeedbacks()
            } else {
                toast.error(data.message || "Failed to submit feedback")
            }
        } catch (error) {
            toast.error("Error submitting feedback")
        } finally {
            setIsLoading(false)
        }
    }

    const handleEdit = (feedback) => {
        setEditingFeedback(feedback)
        setFormData({
            type: feedback.type,
            message: feedback.message
        })
        setIsFormOpen(true)
    }

    const handleDelete = async (feedbackId) => {
        if (!confirm("Are you sure you want to delete this feedback?")) return

        try {
            const userData = JSON.parse(localStorage.getItem("user"))
            const response = await fetch(`${API_URL}/feedback/${feedbackId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${userData.token}`,
                admissionNumber: userData.admissionNumber,
             }
            })

            const data = await response.json()
            if (data.success) {
                toast.success("Feedback deleted successfully")
                fetchStudentFeedbacks()
            } else {
                toast.error(data.message || "Failed to delete feedback")
            }
        } catch (error) {
            toast.error("Error deleting feedback")
        }
    }

    const canEdit = (feedback) => {
        return !feedback.isMarkedRead && !feedback.isAdminResponded
    }

    const getStatusBadge = (feedback) => {
        if (feedback.isAdminResponded) {
            return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Responded by Admin</span>
        } else if (feedback.isMarkedRead) {
            return <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">Read by Admin</span>
        } else {
            return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>
        }
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'border-l-red-500'
            case 'medium': return 'border-l-yellow-500'
            case 'low': return 'border-l-orange-500'
            default: return 'border-l-gray-500'
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Feedback & Support</h2>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2 cursor-pointer"
                    >
                        <MessageSquare className="h-4 w-4" />
                        Submit New Message
                    </button>
                </div>

                {/* Feedback Form Modal */}
                {isFormOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">
                                    {editingFeedback ? 'Edit Feedback' : 'Submit Feedback'}
                                </h3>
                                <button
                                    onClick={() => {
                                        setIsFormOpen(false)
                                        setEditingFeedback(null)
                                        setFormData({ type: '', message: '' })
                                    }}
                                    className="text-gray-500 hover:text-gray-700 cursor-pointer"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Feedback Type
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none focus:border-orange-500 cursor-pointer"
                                        required
                                    >
                                        <option value="">Select type...</option>
                                        {feedbackTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Message
                                    </label>
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        rows={4}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none focus:border-orange-500"
                                        placeholder="Write your message here..."
                                        required
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsFormOpen(false)
                                            setEditingFeedback(null)
                                            setFormData({ type: '', message: '' })
                                        }}
                                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <Send className="h-4 w-4" />
                                        {isLoading ? 'Submitting...' : (editingFeedback ? 'Update' : 'Submit')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Feedback History */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Your Message History</h3>
                    <div className="max-h-96 overflow-y-auto space-y-3">
                        {feedbacks.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">
                                Do you have a complaint, feedback, inquiry or complement?. <br />
                                Use the "New Feedback" button to get in touch with us.
                            </p>
                        ) : (
                            feedbacks.map((feedback) => (
                                <div
                                    key={feedback._id}
                                    className={`border-l-4 ${getPriorityColor(feedback.priority)} bg-gray-50 rounded-r-lg p-4`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="capitalize font-medium text-gray-700">
                                                {feedback.type}
                                            </span>
                                            {getStatusBadge(feedback)}
                                        </div>
                                        <div className="flex gap-4">
                                            {canEdit(feedback) && (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(feedback)}
                                                        className="text-blue-600 hover:text-blue-800 cursor-pointer bg-blue-600/20 p-2 rounded-full"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(feedback._id)}
                                                        className="text-red-600 hover:text-red-800 cursor-pointer bg-red-600/20 p-2 rounded-full"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-gray-600 text-sm mb-2">{feedback.message}</p>

                                    {feedback.adminResponse && (
                                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-200">
                                            <p className="text-sm font-medium text-blue-800 mb-1">Admin Response:</p>
                                            <p className="text-sm text-blue-700">{feedback.adminResponse}</p>
                                            {feedback.respondedAt && (
                                                <p className="text-xs text-blue-600 mt-1">
                                                    Responded: {new Date(feedback.respondedAt).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <p className="text-xs text-gray-500 mt-2">
                                        Submitted: {new Date(feedback.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}