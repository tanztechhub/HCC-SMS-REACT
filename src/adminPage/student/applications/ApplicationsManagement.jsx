// components/ApplicationsManagement.jsx
import { useState, useEffect } from 'react';
import { Search, Filter, Eye, XCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import RejectModal from './RejectModal';
import AdmitModal from './AdmitModal';
import ViewModal from './ViewModal';
import PopUp from '../admission/successPopup/SuccessPopup';

const API_URL = import.meta.env.VITE_API_URL;

export default function ApplicationsManagement() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredApplications, setFilteredApplications] = useState([]);

    // Filter states
    const [statusFilter, setStatusFilter] = useState('All');
    const [courseFilter, setCourseFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 20;

    // Modal states
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showAdmitModal, setShowAdmitModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [admitResult, setAdmitResult] = useState({ isOpen: false, data: null });


    // Courses list for filter
    const [courses, setCourses] = useState([]);

    // Fetch applications
    const fetchApplications = async (page = 1) => {
        setLoading(true);
        try {
            let url = `${API_URL}/applications?page=${page}&limit=${itemsPerPage}`;

            // Add filters to URL
            const params = new URLSearchParams();
            if (statusFilter !== 'All') params.append('status', statusFilter);
            if (courseFilter !== 'All') params.append('course', courseFilter);
            if (searchTerm) params.append('search', searchTerm);

            const queryString = params.toString();
            if (queryString) {
                url += `&${queryString}`;
            }

            const response = await fetch(url);
            const result = await response.json();

            if (result.success) {
                setApplications(result.data);
                setFilteredApplications(result.data);
                setTotalPages(result.totalPages);
                setTotalItems(result.total);
            } else {
                throw new Error(result.message || 'Failed to fetch applications');
            }
        } catch (error) {
            toast.error(`Error: ${error.message}`);
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch courses for filter dropdown
    const fetchCourses = async () => {
        try {
            const response = await fetch(`${API_URL}/courses`);
            const data = await response.json();
            if (response.ok) {
                setCourses(data);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    useEffect(() => {
        fetchApplications(currentPage);
        fetchCourses();
    }, [currentPage]);

    // Apply filters
    useEffect(() => {
        let filtered = [...applications];

        if (statusFilter !== 'All') {
            filtered = filtered.filter(app => app.status === statusFilter);
        }

        if (courseFilter !== 'All') {
            filtered = filtered.filter(app => app.course === courseFilter);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(app =>
                app.firstName.toLowerCase().includes(term) ||
                app.lastName.toLowerCase().includes(term) ||
                app.email.toLowerCase().includes(term) ||
                app.phone.toLowerCase().includes(term) ||
                app.applicationNumber.toLowerCase().includes(term)
            );
        }

        setFilteredApplications(filtered);
    }, [applications, statusFilter, courseFilter, searchTerm]);

    // Handle reject action
    const handleRejectClick = (application) => {
        setSelectedApplication(application);
        setShowRejectModal(true);
    };

    // Handle admit action
    const handleAdmitClick = (application) => {
        setSelectedApplication(application);
        setShowAdmitModal(true);
    };

    // Handle actual rejection
    const handleReject = async (rejectionReason) => {
        try {
            const response = await fetch(`${API_URL}/applications/${selectedApplication._id}/reject`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    rejectionReason,
                    reviewedBy: 'admin-user-id' // You should get this from auth context
                })
            });

            const result = await response.json();

            if (result.success) {
                toast.success('Application rejected successfully');
                fetchApplications(currentPage); // Refresh list
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            toast.error(`Rejection failed: ${error.message}`);
        } finally {
            setShowRejectModal(false);
            setSelectedApplication(null);
        }
    };

    // Handle admission
    const handleAdmit = async (admissionData) => {
        try {
            const response = await fetch(`${API_URL}/applications/${selectedApplication._id}/admit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(admissionData)
            });

            const result = await response.json();

            if (result.success) {
                toast.success('Student admitted successfully!');
                setAdmitResult({ isOpen: true, data: result.data });
                fetchApplications(currentPage); // Refresh list
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            toast.error(`Admission failed: ${error.message}`);
        } finally {
            setShowAdmitModal(false);
            setSelectedApplication(null);
        }
    };

    // Reset filters
    const resetFilters = () => {
        setStatusFilter('All');
        setCourseFilter('All');
        setSearchTerm('');
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    // Get status badge color
    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved':
                return 'bg-orange-100 text-orange-800';
            case 'Rejected':
                return 'bg-red-100 text-red-800';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'Under Review':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleViewClick = (application) => {
        setSelectedApplication(application);
        setShowViewModal(true);
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-800 mb-2">Applications Management</h1>
                <p className="text-gray-600">Review, reject, or admit student applications</p>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Search Bar */}
                    <div className="flex-1 w-full md:w-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name, email, phone, or application number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cc4400] focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="w-full md:w-auto">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cc4400] focus:border-transparent"
                        >
                            <option value="All">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Waitlisted">Waitlisted</option>
                        </select>
                    </div>

                    {/* Course Filter */}
                    <div className="w-full md:w-auto">
                        <select
                            value={courseFilter}
                            onChange={(e) => setCourseFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cc4400] focus:border-transparent"
                        >
                            <option value="All">All Courses</option>
                            {courses.map(course => (
                                <option key={course._id} value={course.name}>
                                    {course.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Reset Filters Button */}
                    <button
                        onClick={resetFilters}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <RefreshCw size={16} />
                        Reset Filters
                    </button>
                </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#cc4400]"></div>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Application #
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Course
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Applied Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredApplications.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                                No applications found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredApplications.map((application) => (
                                            <tr key={application._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {application.applicationNumber}
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {application.firstName} {application.lastName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {application.email}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {application.phone}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {application.course}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Start: {formatDate(application.preferredStartDate)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {formatDate(application.applicationDate)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                                                        {application.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleAdmitClick(application)}
                                                            disabled={application.status === 'Rejected'}
                                                            className={`flex items-center gap-1 px-3 py-1 rounded ${application.status === 'Rejected'
                                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                                                }`}
                                                        >
                                                            <CheckCircle size={14} />
                                                            Admit
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectClick(application)}
                                                            className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                                        >
                                                            <XCircle size={14} />
                                                            Reject
                                                        </button>
                                                        <button
                                                            onClick={() => handleViewClick(application)}
                                                            className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                                        >
                                                            <Eye size={14} />
                                                            View
                                                        </button>

                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                                        <span className="font-medium">
                                            {Math.min(currentPage * itemsPerPage, totalItems)}
                                        </span>{' '}
                                        of <span className="font-medium">{totalItems}</span> applications
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`px-3 py-1 border rounded ${currentPage === pageNum
                                                        ? 'bg-[#cc4400] text-white border-[#cc4400]'
                                                        : 'border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modals */}
            {showRejectModal && selectedApplication && (
                <RejectModal
                    application={selectedApplication}
                    onClose={() => {
                        setShowRejectModal(false);
                        setSelectedApplication(null);
                    }}
                    onReject={handleReject}
                />
            )}

            {/* // Add ViewModal to the modals section at the bottom: */}
            {showViewModal && selectedApplication && (
                <ViewModal
                    application={selectedApplication}
                    onClose={() => {
                        setShowViewModal(false);
                        setSelectedApplication(null);
                    }}
                />
            )}

            {showAdmitModal && selectedApplication && (
                <AdmitModal
                    application={selectedApplication}
                    onClose={() => {
                        setShowAdmitModal(false);
                        setSelectedApplication(null);
                    }}
                    onAdmit={handleAdmit}
                />
            )}

            <PopUp
                isOpen={admitResult.isOpen}
                onClose={() => setAdmitResult({ isOpen: false, data: null })}
                status="success"
                data={admitResult.data}
            />
        </div>
    );
}