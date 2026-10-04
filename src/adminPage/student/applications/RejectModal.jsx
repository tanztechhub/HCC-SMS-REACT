// components/RejectModal.jsx
import { useState } from 'react';
import { XCircle, AlertCircle } from 'lucide-react';

export default function RejectModal({ application, onClose, onReject }) {
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }
        
        setSubmitting(true);
        await onReject(reason);
        setSubmitting(false);
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md mx-4">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <XCircle className="text-red-500" size={24} />
                            <h3 className="text-lg font-semibold text-gray-900">
                                Reject Application
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    </div>
                    
                    <div className="mb-6">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
                                <div>
                                    <p className="text-sm text-red-800">
                                        You are about to reject the application from{' '}
                                        <span className="font-semibold">
                                            {application.firstName} {application.lastName}
                                        </span>
                                    </p>
                                    <p className="text-xs text-red-700 mt-1">
                                        Application #{application.applicationNumber}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for Rejection *
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    rows="4"
                                    placeholder="Provide a clear reason for rejecting this application..."
                                    required
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    This reason will be included in the rejection email sent to the applicant.
                                </p>
                            </div>
                            
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Rejecting...' : 'Confirm Rejection'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}