import { useState, useEffect, useRef } from "react";
import { MdNotifications } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../../../utils/apiClient"; // Adjust path
import toast from "react-hot-toast";

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [pendingCount, setPendingCount] = useState(0);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            // Fetch stats for the count
            const statsRes = await apiGet("/feedback/admin/stats");
            if (statsRes.success) {
                setPendingCount(statsRes.data.pendingFeedback);
            }

            // Fetch latest 5 notifications for the dropdown
            const feedbackRes = await apiGet("/feedback/admin/all?status=pending&limit=5");
            if (feedbackRes.success) {
                setNotifications(feedbackRes.data.feedbacks);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
            // Don't toast here to avoid spamming on background fetches
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Optional: poll for new notifications every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleViewAll = () => {
        setIsOpen(false);
        navigate("/admin-dashboard/notifications"); // Your route
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                aria-label="Notifications"
                aria-expanded={isOpen}
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-gray-100 rounded-full relative cursor-pointer"
            >
                <MdNotifications className="h-6 w-6" />
                {pendingCount > 0 && (
                    <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                        {pendingCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="p-3 border-b border-gray-300">
                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map((notif) => (
                                <div key={notif._id} className="p-3 hover:bg-gray-50 border-b  border-gray-300 last:border-b-0">
                                    <p className="text-sm font-medium text-gray-700">
                                        New {notif.type} from {notif.student.firstName}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate mt-1">{notif.message}</p>
                                </div>
                            ))
                        ) : (
                            <p className="p-4 text-sm text-gray-500 text-center">No new notifications</p>
                        )}
                    </div>
                    <div className="p-2 bg-gray-50 border-t  border-gray-300">
                        <button
                            onClick={handleViewAll}
                            className="w-full text-center text-sm font-medium text-[#9a3412] hover:underline cursor-pointer"
                        >
                            View All
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;