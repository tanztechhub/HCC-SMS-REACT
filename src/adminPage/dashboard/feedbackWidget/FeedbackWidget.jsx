import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiMessageSquare, FiAlertCircle, FiThumbsUp, FiHelpCircle, FiInbox } from "react-icons/fi";
import { apiGet } from "../../../utils/apiClient"; // Adjust path if needed
import toast from "react-hot-toast";

const iconMap = {
    complaint: <FiAlertCircle className="text-red-500" />,
    review: <FiThumbsUp className="text-blue-500" />,
    suggestion: <FiHelpCircle className="text-yellow-500" />,
    inquiry: <FiMessageSquare className="text-purple-500" />,
    default: <FiMessageSquare className="text-gray-500" />
};

const FeedbackWidget = () => {
    const [latestFeedback, setLatestFeedback] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLatestFeedback = async () => {
            try {
                setLoading(true);
                // Fetch only pending (unread and un-responded) feedback, limit to 5
                const res = await apiGet("/feedback/admin/all?status=pending&limit=10");
                if (res.success) {
                    setLatestFeedback(res.data.feedbacks);
                } else {
                    toast.error("Failed to fetch latest feedback.");
                }
            } catch (error) {
                console.error("Error fetching feedback:", error);
                toast.error("An error occurred while fetching feedback.");
            } finally {
                setLoading(false);
            }
        };

        fetchLatestFeedback();
    }, []);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Student Feedback</h2>
            {loading ? (
                <p>Loading feedback...</p>
            ) : latestFeedback.length > 0 ? (
                <div className="space-y-4">
                    {latestFeedback.map((feedback) => (
                        <div key={feedback._id} className="flex items-start p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition">
                            <div className="mr-3 text-2xl">
                                {iconMap[feedback.type] || iconMap.default}
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-gray-700 capitalize">
                                    {console.log(`student`, feedback)}
                                    {feedback.student?.firstName} {feedback.student?.lastName}
                                    <span className="text-xs text-gray-500 ml-2">({feedback.student?.admissionNumber})</span>
                                </p>
                                <p className="text-sm text-gray-600">{feedback.message}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {new Date(feedback.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                                feedback.priority === 'high' ? 'bg-red-100 text-red-700' : 
                                feedback.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                                {feedback.priority}
                            </span>
                        </div>
                    ))}
                    <div className="text-center pt-4">
                        <Link
                            to="/admin-dashboard/notifications" // Your route to the full feedback page
                            className="inline-block bg-[#9a3412] text-white font-semibold px-6 py-2 rounded-lg hover:bg-[#c2410c] transition"
                        >
                            View All Feedback
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    <FiInbox className="mx-auto text-5xl text-gray-300" />
                    <p className="mt-4 text-gray-500">No new feedback at the moment. Great job!</p>
                </div>
            )}
        </div>
    );
};

export default FeedbackWidget;