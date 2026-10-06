// components/AdmitModal.jsx
import { useState, useEffect } from 'react';
import { CheckCircle, Calendar, DollarSign, Hash, Clock, BookOpen } from 'lucide-react';

export default function AdmitModal({ application, onClose, onAdmit }) {
    const [formData, setFormData] = useState({
        academicYear: new Date().getFullYear().toString(),
        admissionNumber: '',
        admissionDate: new Date().toISOString().split('T')[0],
        upfrontFee: '0',
        paymentMethod: 'M-PESA',
        transactionCode: '',
        actualStartDate: '',
        courseDuration: '',
        courseFee: '',
        courseName: application.course,
        courseId: '', // Store course ID for reference
        admittedBy: 'admin-user-id'
    });
    
    const [courses, setCourses] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [loadingCourses, setLoadingCourses] = useState(true);
    
    // Fetch courses and auto-fill selected course
    useEffect(() => {
        const fetchCourses = async () => {
            setLoadingCourses(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/courses`);
                const data = await response.json();
                if (Array.isArray(data)) {
                    setCourses(data);
                    
                    // Find the course from application and auto-fill data
                    const course = data.find(c => c.name === application.course);
                    if (course) {
                        setFormData(prev => ({
                            ...prev,
                            courseDuration: course.duration || '',
                            courseFee: course.fee ? course.fee.toString() : '',
                            courseName: course.name,
                            courseId: course._id
                        }));
                    }
                }
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setLoadingCourses(false);
            }
        };
        
        fetchCourses();
    }, [application.course]);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // If course name changes, find and auto-fill its details
        if (name === 'courseName') {
            const selectedCourse = courses.find(c => c.name === value);
            setFormData(prev => ({
                ...prev,
                [name]: value,
                courseId: selectedCourse?._id || '',
                courseDuration: selectedCourse?.duration || '',
                courseFee: selectedCourse?.fee ? selectedCourse.fee.toString() : ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!formData.admissionNumber.trim()) {
            alert('Please enter an admission number');
            return;
        }
        
        if (!formData.actualStartDate) {
            alert('Please select an actual start date');
            return;
        }

        if (
            parseInt(formData.upfrontFee) > 0 &&
            ['M-PESA', 'BANK', 'CHEQUE'].includes(formData.paymentMethod) &&
            !formData.transactionCode.trim()
        ) {
            alert('Please enter the transaction code for this payment method');
            return;
        }

        setSubmitting(true);
        await onAdmit(formData);
        setSubmitting(false);
    };
    
    // Generate a suggested admission number
    const generateAdmissionNumber = () => {
        const year = new Date().getFullYear().toString().slice(-2);
        const random = Math.floor(1000 + Math.random() * 9000);
        return `ADM-${year}-${random}`;
    };
    
    return (
        <div className="hcc-admissions-modal-overlay">
            <div className="hcc-admissions-modal bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="text-orange-500" size={24} />
                            <h3 className="text-lg font-semibold text-gray-900">
                                Admit Student
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    </div>
                    
                    {/* Applicant Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h4 className="font-medium text-gray-900 mb-2">Applicant Information</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Name</p>
                                <p className="font-medium">{application.firstName} {application.lastName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="font-medium">{application.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Phone</p>
                                <p className="font-medium">{application.phone}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">ID/Passport</p>
                                <p className="font-medium">{application.idPassport}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Applied Course</p>
                                <p className="font-medium">{application.course}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Preferred Start</p>
                                <p className="font-medium">
                                    {new Date(application.preferredStartDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            {/* Admission Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Admission Number *
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            name="admissionNumber"
                                            value={formData.admissionNumber}
                                            onChange={handleChange}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            required
                                            placeholder="e.g., ADM-25-1234"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({
                                                ...prev,
                                                admissionNumber: generateAdmissionNumber()
                                            }))}
                                            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            <Hash size={16} />
                                            Generate
                                        </button>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Academic Year
                                    </label>
                                    <input
                                        type="text"
                                        name="academicYear"
                                        value={formData.academicYear}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        readOnly
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Admission Date
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="date"
                                            name="admissionDate"
                                            value={formData.admissionDate}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Actual Start Date *
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="date"
                                            name="actualStartDate"
                                            value={formData.actualStartDate}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Upfront Fee (KSH)
                                    </label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="number"
                                            name="upfrontFee"
                                            value={formData.upfrontFee}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            min="0"
                                            step="1000"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Payment Method
                                    </label>
                                    <select
                                        name="paymentMethod"
                                        value={formData.paymentMethod}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    >
                                        <option value="M-PESA">M-PESA</option>
                                        <option value="BANK">BANK</option>
                                        <option value="CHEQUE">CHEQUE</option>
                                        <option value="OTHER">OTHER</option>
                                    </select>
                                </div>

                                {['M-PESA', 'BANK', 'CHEQUE'].includes(formData.paymentMethod) && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Transaction Code
                                        </label>
                                        <div className="relative">
                                            <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                type="text"
                                                name="transactionCode"
                                                value={formData.transactionCode}
                                                onChange={handleChange}
                                                placeholder="e.g. QGH7XXXXXX"
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Course Information Section */}
                            <div className="border-t pt-4">
                                <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                                    <BookOpen size={18} />
                                    Course Information
                                </h4>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Course *
                                        </label>
                                        <select
                                            name="courseName"
                                            value={formData.courseName}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            disabled={loadingCourses}
                                        >
                                            <option value="">Select Course</option>
                                            {courses.map(course => (
                                                <option key={course._id} value={course.name}>
                                                    {course.name}
                                                </option>
                                            ))}
                                        </select>
                                        {loadingCourses && (
                                            <p className="text-xs text-gray-500 mt-1">Loading courses...</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Course Duration
                                        </label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                type="text"
                                                name="courseDuration"
                                                value={formData.courseDuration}
                                                readOnly
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Course Fee (KSH)
                                        </label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                type="text"
                                                name="courseFee"
                                                value={formData.courseFee}
                                                readOnly
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Course Description Preview */}
                                    {formData.courseId && (
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Course Description
                                            </label>
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-600">
                                                {courses.find(c => c._id === formData.courseId)?.description || 'No description available'}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
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
                                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                disabled={submitting || !formData.courseName}
                            >
                                {submitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={16} />
                                        Confirm Admission
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}