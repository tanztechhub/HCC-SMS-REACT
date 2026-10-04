// components/ViewModal.jsx
import { User, Mail, Phone, Calendar, BookOpen, MapPin, Users, FileText, Clock, DollarSign, Hash, AlertCircle } from 'lucide-react';

export default function ViewModal({ application, onClose }) {
    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    
    // Format currency helper
    const formatCurrency = (amount) => {
        if (!amount) return 'Not specified';
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0
        }).format(amount);
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
            case 'Waitlisted':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <User className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Application Details
                                </h3>
                                <p className="text-sm text-gray-500">
                                    #{application.applicationNumber}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="mb-6">
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(application.status)}`}>
                            {application.status}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                            Applied on {formatDate(application.applicationDate)}
                        </span>
                    </div>
                    
                    <div className="space-y-6">
                        {/* Personal Information */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                                <User size={18} />
                                Personal Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-700">Full Name:</span>
                                        <span className="text-gray-900">{application.firstName} {application.lastName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-gray-400" />
                                        <span className="text-sm text-gray-700">Date of Birth:</span>
                                        <span className="text-gray-900">{formatDate(application.dateOfBirth)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-700">Gender:</span>
                                        <span className="text-gray-900">{application.gender}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-700">Nationality:</span>
                                        <span className="text-gray-900">{application.nationality}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-700">Religion:</span>
                                        <span className="text-gray-900">{application.religion || 'Not specified'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Hash size={16} className="text-gray-400" />
                                        <span className="text-sm text-gray-700">ID/Passport:</span>
                                        <span className="text-gray-900">{application.idPassport}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Contact Information */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                                <Phone size={18} />
                                Contact Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2">
                                        <Mail size={16} className="text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-700">Email Address</p>
                                            <p className="text-gray-900 font-medium">{application.email}</p>
                                            {application.marketingConsent && (
                                                <p className="text-xs text-orange-600 mt-1">✓ Marketing emails consented</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone size={16} className="text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-700">Phone Number</p>
                                            <p className="text-gray-900 font-medium">{application.phone}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2">
                                        <MapPin size={16} className="text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-700">Application Source</p>
                                            <p className="text-gray-900 font-medium">{application.source || 'Website Form'}</p>
                                        </div>
                                    </div>
                                    {application.ipAddress && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-700">IP Address:</span>
                                            <span className="text-gray-900 text-xs font-mono">{application.ipAddress}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Course Information */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                                <BookOpen size={18} />
                                Course Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <BookOpen size={16} className="text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-700">Course Applied</p>
                                            <p className="text-gray-900 font-medium">{application.course}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-700">Preferred Start Date</p>
                                            <p className="text-gray-900 font-medium">{formatDate(application.preferredStartDate)}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-700">Preferred Class Time</p>
                                            <p className="text-gray-900 font-medium">{application.preferredClassTime}</p>
                                        </div>
                                    </div>
                                    {application.courseFee && (
                                        <div className="flex items-center gap-2">
                                            <DollarSign size={16} className="text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-700">Expected Course Fee</p>
                                                <p className="text-gray-900 font-medium">{formatCurrency(application.courseFee)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Emergency Contact */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                                <Users size={18} />
                                Emergency Contact
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-700">Name:</span>
                                        <span className="text-gray-900 font-medium">
                                            {application.emergencyContact?.firstName} {application.emergencyContact?.lastName}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-700">Relation:</span>
                                        <span className="text-gray-900">{application.emergencyContact?.relation}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Phone size={16} className="text-gray-400" />
                                        <span className="text-sm text-gray-700">Phone:</span>
                                        <span className="text-gray-900 font-medium">{application.emergencyContact?.phone}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Additional Information & Notes */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                                <FileText size={18} />
                                Additional Information & Notes
                            </h4>
                            <div className="space-y-4">
                                {application.additionalInfo ? (
                                    <div>
                                        <p className="text-sm text-gray-700 mb-1">Applicant's Additional Info:</p>
                                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                                            <p className="text-gray-900">{application.additionalInfo}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">No additional information provided by applicant</p>
                                )}
                                
                                {/* Review Notes */}
                                {application.reviewNotes && (
                                    <div>
                                        <p className="text-sm text-gray-700 mb-1 flex items-center gap-1">
                                            <AlertCircle size={14} />
                                            Review Notes:
                                        </p>
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                            <p className="text-gray-900">{application.reviewNotes}</p>
                                            {application.reviewDate && (
                                                <p className="text-xs text-gray-500 mt-2">
                                                    Reviewed on {formatDate(application.reviewDate)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Rejection Reason */}
                                {application.rejectionReason && (
                                    <div>
                                        <p className="text-sm text-gray-700 mb-1 flex items-center gap-1">
                                            <AlertCircle size={14} className="text-red-500" />
                                            Rejection Reason:
                                        </p>
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                            <p className="text-red-800">{application.rejectionReason}</p>
                                            {application.rejectionDate && (
                                                <p className="text-xs text-red-700 mt-2">
                                                    Rejected on {formatDate(application.rejectionDate)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* System Information */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-4">System Information</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-700">Application ID</p>
                                    <p className="text-gray-900 font-mono text-xs">{application._id}</p>
                                </div>
                                <div>
                                    <p className="text-gray-700">Created</p>
                                    <p className="text-gray-900">{formatDate(application.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-700">Last Updated</p>
                                    <p className="text-gray-900">{formatDate(application.updatedAt)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-700">Email Status</p>
                                    <div className="space-y-1">
                                        <p className="text-gray-900">
                                            Confirmation: {application.emailSent?.confirmation ? '✓ Sent' : '✗ Pending'}
                                        </p>
                                        <p className="text-gray-900">
                                            Admin Notification: {application.emailSent?.adminNotification ? '✓ Sent' : '✗ Pending'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Close Button */}
                    <div className="flex justify-end mt-6 pt-6 border-t">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}