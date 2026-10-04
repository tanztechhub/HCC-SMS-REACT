import { useState, useEffect } from "react";
import { apiGet, apiPatch } from "../../utils/apiClient"; // Adjust path
import toast from "react-hot-toast";
import ResponseModal from "./ResponseModal"; // Adjust path

const FeedbackManagementPage = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: 'pending', type: '', priority: '' });
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            const { status, type, priority } = filters;
            const { currentPage } = pagination;
            const query = `?page=${currentPage}&limit=10&status=${status}&type=${type}&priority=${priority}`;
            const res = await apiGet(`/feedback/admin/all${query}`);
            
            if (res.success) {
                setFeedbacks(res.data.feedbacks);
                setPagination({
                    currentPage: res.data.currentPage,
                    totalPages: res.data.totalPages,
                    total: res.data.total
                });
            } else {
                toast.error("Failed to fetch feedback.");
            }
        } catch (error) {
            console.error("Error fetching feedback:", error);
            toast.error("An error occurred while fetching feedback.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, [filters, pagination.currentPage]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
        setPagination({ ...pagination, currentPage: 1 }); // Reset to first page on filter change
    };

    const handleMarkAsRead = async (id) => {
        try {
            const res = await apiPatch(`/feedback/admin/mark-read/${id}`, {});
            if (res.success) {
                toast.success("Marked as read!");
                fetchFeedbacks(); // Refresh data
            } else {
                toast.error("Failed to mark as read.");
            }
        } catch (error) {
            toast.error("An error occurred.");
        }
    };
    
    const handleOpenRespondModal = (feedback) => {
        setSelectedFeedback(feedback);
        setIsModalOpen(true);
    };

    const handleRespondSubmit = async (id, response) => {
        try {
            const res = await apiPatch(`/feedback/admin/respond/${id}`, { response });
            if (res.success) {
                toast.success("Response sent!");
                setIsModalOpen(false);
                setSelectedFeedback(null);
                fetchFeedbacks(); // Refresh data
            } else {
                toast.error("Failed to send response.");
            }
        } catch (error) {
            toast.error("An error occurred.");
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Student Feedback Management</h1>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-white p-4 rounded-lg shadow">
                <select name="status" value={filters.status} onChange={handleFilterChange} className="p-2 border border-gray-300 outline-orange-600 cursor-pointer rounded-md">
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="read">Read</option>
                    <option value="responded">Responded</option>
                </select>
                <select name="type" value={filters.type} onChange={handleFilterChange} className="p-2 border border-gray-300 outline-orange-600 cursor-pointer rounded-md">
                    <option value="">All Types</option>
                    <option value="complaint">Complaint</option>
                    <option value="review">Review</option>
                    <option value="suggestion">Suggestion</option>
                    <option value="inquiry">Inquiry</option>
                </select>
                 <select name="priority" value={filters.priority} onChange={handleFilterChange} className="p-2 border border-gray-300 outline-orange-600 cursor-pointer rounded-md">
                    <option value="">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
            </div>

            {/* Feedback List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? <p className="p-4">Loading...</p> : (
                    <div className="space-y-4 p-4">
                        {feedbacks.length > 0 ? feedbacks.map(fb => (
                            <div key={fb._id} className="border border-gray-300 outline-orange-600 cursor-pointer p-4 rounded-md">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold">{fb.student?.firstName} {fb.student?.lastName}</p>
                                        <p className="text-sm text-gray-500">{fb.student?.admissionNumber}</p>
                                        <p className="mt-2">{fb.message}</p>
                                        {fb.isAdminResponded && (
                                           <div className="mt-3 p-2 bg-orange-50 border-l-4 border-orange-400">
                                                <p className="font-semibold text-sm text-orange-800">Your Response:</p>
                                                <p className="text-sm text-gray-700">{fb.adminResponse}</p>
                                           </div>
                                        )}
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs capitalize px-2 py-1 rounded-full bg-blue-100 text-blue-800">{fb.type}</span>
                                            <span className={`text-xs capitalize px-2 py-1 rounded-full ${fb.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{fb.priority}</span>
                                        </div>
                                        <div className="flex gap-2 mt-4 justify-end">
                                            {!fb.isAdminResponded && (
                                                <button onClick={() => handleMarkAsRead(fb._id)} disabled={fb.isMarkedRead} className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 cursor-pointer">Mark Read</button>
                                            )}
                                            <button onClick={() => handleOpenRespondModal(fb)} className="px-3 py-1 text-sm bg-[#9a3412] text-white rounded hover:bg-[#c2410c] cursor-pointer">{fb.isAdminResponded ? 'View/Edit' : 'Respond'}</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : <p className="text-center p-8 text-gray-500">No feedback matching filters.</p>}
                    </div>
                )}
            </div>

            {/* Pagination controls can be added here */}
            
            <ResponseModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleRespondSubmit}
                feedback={selectedFeedback}
            />
        </div>
    );
};

export default FeedbackManagementPage;