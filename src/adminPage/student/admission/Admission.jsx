import "../Admissions.css"
import { useState, useEffect } from "react"
import { Upload } from "lucide-react"
import { toast } from "react-hot-toast"
import { useParams, useLocation } from "react-router-dom"
import LoadingSpinner from "../../../components/loadingSpinner/LoadingSpinner"
import PopUp from "./successPopup/SuccessPopup";
import { LuRefreshCw } from "react-icons/lu"

const API_URL = import.meta.env.VITE_API_URL;

// Form field validation rules
const REQUIRED_FIELD_ERROR = "This field is required"
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB in bytes

export default function StudentAdmission() {
    // Get admission number from URL if it exists
    const { admissionNumber } = useParams();
    const location = useLocation();
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoadingStudent, setIsLoadingStudent] = useState(false);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

    // Form data state
    const [formData, setFormData] = useState({
        academicYear: "",
        course: "",
        admissionNumber: "",
        admissionDate: "",
        upfrontFee: "0",
        paymentMethod: "M-PESA",
        transactionCode: "",
        firstName: "",
        lastName: "",
        gender: "",
        dateOfBirth: "",
        startDate: "",
        religion: "",
        nationality: "",
        email: "",
        phoneNumber: "",
        nationalId: "",
        emergencyFirstName: "",
        emergencyLastName: "",
        emergencyRelation: "",
        emergencyPhone: "",
    })

    // Courses state
    const [courses, setCourses] = useState([])
    const [isLoadingCourses, setIsLoadingCourses] = useState(true)

    // Profile image state
    const [profileImage, setProfileImage] = useState(null)
    const [profileImageFile, setProfileImageFile] = useState(null)

    // PopUp State
    const [popUpState, setPopUpState] = useState({
        isOpen: false,
        status: "loading",
        data: null,
    })

    // Error state
    const [errors, setErrors] = useState({})

    // Loading state for API submission
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Check if we're in edit mode based on URL
    useEffect(() => {
        if (admissionNumber) {
            setIsEditMode(true);
            fetchStudentData(admissionNumber);
        }
    }, [admissionNumber]);

    // Fetch courses on component mount
    useEffect(() => {
        fetchCourses()
    }, [])

    // Fetch student data if in edit mode
    const fetchStudentData = async (admNumber) => {
        setIsLoadingStudent(true);
        try {
            const response = await fetch(`${API_URL}/students/${admNumber}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to fetch student data");
            }

            if (result.success && result.data) {
                const studentData = result.data;
                
                // Format dates to YYYY-MM-DD for input fields
                const formatDate = (dateString) => {
                    if (!dateString) return "";
                    const date = new Date(dateString);
                    return date.toISOString().split('T')[0];
                };

                // Populate form with student data
                setFormData({
                    academicYear: studentData.academicYear || "",
                    course: studentData.course || "",
                    admissionNumber: studentData.admissionNumber || "",
                    admissionDate: formatDate(studentData.admissionDate),
                    upfrontFee: studentData.upfrontFee ? studentData.upfrontFee.toString() : "0",
                    firstName: studentData.firstName || "",
                    lastName: studentData.lastName || "",
                    gender: studentData.gender || "",
                    dateOfBirth: formatDate(studentData.dateOfBirth),
                    startDate: formatDate(studentData.startDate),
                    religion: studentData.religion || "",
                    nationality: studentData.nationality || "",
                    email: studentData.email || "",
                    phoneNumber: studentData.phoneNumber || "",
                    nationalId: studentData.nationalId || "",
                    emergencyFirstName: studentData.emergencyContact?.firstName || "",
                    emergencyLastName: studentData.emergencyContact?.lastName || "",
                    emergencyRelation: studentData.emergencyContact?.relation || "",
                    emergencyPhone: studentData.emergencyContact?.phone || "",
                    courseDuration: studentData.courseDuration || "",
                    courseFee: studentData.courseFee ? studentData.courseFee.toString() : "",
                });

                // Set profile image if exists
                if (studentData.profileImage) {
                    setProfileImage(studentData.profileImage);
                }
                
                toast.success("Student data loaded successfully!");
            }
        } catch (error) {
            toast.error(`Error fetching student data: ${error.message}`);
            console.error("Error fetching student data:", error);
        } finally {
            setIsLoadingStudent(false);
        }
    };

    const fetchCourses = async () => {
        setIsLoadingCourses(true)
        try {
            const response = await fetch(`${API_URL}/courses`)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch courses")
            }
            toast.success("Courses Fetched successfully!")
            setCourses(data)
        } catch (error) {
            toast.error(`Error fetching courses: ${error.message}`)
            console.error("Error fetching courses:", error)
        } finally {
            setIsLoadingCourses(false)
        }
    }

    // Get course details helper function
    const getCourseDetails = (courseId) => {
        return courses.find((course) => course._id === courseId)
    }

    // Handle form field changes
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }))
        }

        // If the course changes, update duration and fee
        if (name === "course") {
            const selectedCourse = getCourseDetails(value)
            if (selectedCourse) {
                setFormData((prev) => ({
                    ...prev,
                    courseDuration: selectedCourse.duration,
                    courseFee: selectedCourse.fee.toString(),
                }))
            }
        }
    }
    
    // Handle image upload with validation
    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                setErrors(prev => ({
                    ...prev,
                    profileImage: "Image size should not exceed 5MB"
                }))
                return
            }

            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({
                    ...prev,
                    profileImage: "Please upload an image file"
                }))
                return
            }

            setProfileImageFile(file)
            setProfileImage(URL.createObjectURL(file))
            setErrors(prev => ({
                ...prev,
                profileImage: ""
            }))
        }
    }

    // Validate form fields
    const validateForm = () => {
        const newErrors = {}

        // Required fields validation
        const requiredFields = [
            'course',
            'admissionNumber',
            'firstName',
            'lastName',
            'gender',
            'dateOfBirth',
            'email',
            'phoneNumber',
            'nationalId',
            'startDate',
            'emergencyFirstName',
            'emergencyLastName',
            'emergencyRelation',
            'emergencyPhone'
        ]

        requiredFields.forEach(field => {
            if (!formData[field]) {
                newErrors[field] = REQUIRED_FIELD_ERROR
            }
        })

        // Email validation
        if (formData.email && !EMAIL_REGEX.test(formData.email)) {
            newErrors.email = "Please enter a valid email address"
        }

        // Upfront fee validation (if provided)
        if (formData.upfrontFee && parseInt(formData.upfrontFee) < 0) {
            newErrors.upfrontFee = "Fee cannot be negative"
        }

        // Transaction code is required for M-PESA/Bank/Cheque payments
        if (
            parseInt(formData.upfrontFee) > 0 &&
            ["M-PESA", "BANK", "CHEQUE"].includes(formData.paymentMethod) &&
            !formData.transactionCode.trim()
        ) {
            newErrors.transactionCode = "Transaction code is required for this payment method"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)
        isEditMode
        ? setPopUpState({ isOpen: true, status: "update", data: null })
        : setPopUpState({ isOpen: true, status: "loading", data: null })

        try {
            // Prepare form data for API
            const formDataToSend = new FormData()

            // Append all form fields
            Object.keys(formData).forEach(key => {
                formDataToSend.append(key, formData[key])
            })

            // Append profile image if exists
            if (profileImageFile) {
                formDataToSend.append('profileImage', profileImageFile)
            }

            // Determine endpoint based on mode (create or update)
            const endpoint = isEditMode 
                ? `${API_URL}/students/${formData.admissionNumber}/update` 
                : `${API_URL}/students/register`;
            
            const method = isEditMode ? 'PUT' : 'POST';

            // Call API
            const response = await fetch(endpoint, {
                method: method,
                body: formDataToSend
            })

            // Extract JSON data from response
            const responseData = await response.json()
            console.log("API Response:", responseData);

            // Check if response is successful
            if (!response.ok) {
                throw new Error(responseData.error || "Something went wrong")
            }

            const successMessage = isEditMode 
                ? "Student updated successfully!" 
                : "Student registered successfully!";
                
            toast.success(successMessage)
            isEditMode 
            ? setPopUpState({ isOpen: true, status: "updateSuccess", data: responseData })
            : setPopUpState({ isOpen: true, status: "success", data: responseData })
        } catch (error) {
            toast.error(error.message || "Failed to submit form. Please try again.")

            // Update error state
            setPopUpState({
                isOpen: true,
                status: "error",
                data: { error: error.message || "Failed to submit form. Please try again.", details: error.details },
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const closePopUp = () => {
        setPopUpState({ isOpen: false, status: "loading", data: null })
    }

    // Helper function for input field style based on error state
    const getInputClassName = (fieldName) => {
        return `w-full outline-none p-2 border ${errors[fieldName] ? 'border-red-500' : 'border-gray-400'} 
            text-gray-800 rounded-lg outline-none focus:outline-none focus:ring-2 
            ${errors[fieldName] ? 'focus:ring-red-500 outline-none' : 'focus:ring-[#cc4400] outline-none'}`
    }

    // Action button text based on mode
    const actionButtonText = isEditMode ? 'UPDATE STUDENT' : 'REGISTER STUDENT';
    const loadingButtonText = isEditMode ? 'UPDATING...' : 'REGISTERING...';
    const pageTitle = isEditMode ? 'Update Student' : 'Student Admission';

    return (
        <div className="hcc-admissions hcc-admission-form">
            <PopUp isOpen={popUpState.isOpen} onClose={closePopUp} status={popUpState.status} data={popUpState.data} />

            <div>
                <div className="hcc-admissions-heading hcc-admissions-heading-row">
                    <div><p className="hcc-admissions-eyebrow">06 / STUDENT ADMISSION</p><h1>{pageTitle}</h1><p>Academic, personal and emergency contact details.</p></div>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={isLoadingCourses}
                            onClick={fetchCourses}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                        >
                            {isLoadingCourses ? <LoadingSpinner size={15} /> : <LuRefreshCw />}
                            Fetch Courses
                        </button>
                        <button 
                            onClick={handleSubmit} 
                            className="flex font-bold items-center gap-2 px-4 py-2 bg-[#fb923c] hover:bg-[#ea580c] text-white rounded-lg transition-colors cursor-pointer"
                        >
                            {actionButtonText}
                        </button>
                    </div>
                </div>

                {isLoadingStudent && (
                    <div className="flex justify-center py-8">
                        <LoadingSpinner size={40} />
                        <p className="ml-2 text-gray-600">Loading student data...</p>
                    </div>
                )}

                {!isLoadingStudent && (
                    <div className="space-y-6">
                        {/* Academic Information */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4 text-[#cc4400]">Academic Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Academic Year <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="academicYear"
                                        value={formData.academicYear}
                                        onChange={handleChange}
                                        className={getInputClassName('academicYear')}
                                    >
                                        <option value="2025">{currentYear} [Jan-Dec]</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Course <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="course"
                                        value={formData.course}
                                        onChange={handleChange}
                                        className={getInputClassName("course")}
                                        required
                                        disabled={isLoadingCourses}
                                    >
                                        <option value="">Select Course</option>
                                        {courses.map((course) => (
                                            <option key={course._id} value={course._id}>
                                                {course.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.course && <p className="text-red-500 text-xs mt-1">{errors.course}</p>}
                                    {isLoadingCourses && <LoadingSpinner size={20} />}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                                    <input
                                        type="text"
                                        name="courseDuration"
                                        value={formData.courseDuration || ""}
                                        className={getInputClassName("courseDuration")}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Fee (KSH)</label>
                                    <input
                                        type="text"
                                        name="courseFee"
                                        value={formData.courseFee || ""}
                                        className={getInputClassName("courseFee")}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Admission Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="admissionNumber"
                                        value={formData.admissionNumber}
                                        onChange={handleChange}
                                        className={getInputClassName('admissionNumber')}
                                        disabled={isEditMode}
                                    />
                                    {errors.admissionNumber && (
                                        <p className="mt-1 text-sm text-red-500">{errors.admissionNumber}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date</label>
                                    <div className="relative">
                                        <input
                                            name="admissionDate"
                                            type="date"
                                            value={formData.admissionDate}
                                            onChange={handleChange}
                                            className={getInputClassName('admissionDate')}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date (Cohort)</label>
                                    <div className="relative">
                                        <input
                                            name="startDate"
                                            type="date"
                                            value={formData.startDate}
                                            onChange={handleChange}
                                            className={getInputClassName('startDate')}
                                        />
                                    </div>
                                    {errors.startDate && (
                                        <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Upfront Fee (KSH)
                                    </label>
                                    <input
                                        type="number"
                                        name="upfrontFee"
                                        value={formData.upfrontFee}
                                        onChange={handleChange}
                                        className={getInputClassName('upfrontFee')}
                                    />
                                    {errors.upfrontFee && (
                                        <p className="mt-1 text-sm text-red-500">{errors.upfrontFee}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Payment Method
                                    </label>
                                    <select
                                        name="paymentMethod"
                                        value={formData.paymentMethod}
                                        onChange={handleChange}
                                        className={getInputClassName('paymentMethod')}
                                    >
                                        <option value="M-PESA">M-PESA</option>
                                        <option value="BANK">BANK</option>
                                        <option value="CHEQUE">CHEQUE</option>
                                        <option value="OTHER">OTHER</option>
                                    </select>
                                </div>
                                {["M-PESA", "BANK", "CHEQUE"].includes(formData.paymentMethod) && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Transaction Code
                                        </label>
                                        <input
                                            type="text"
                                            name="transactionCode"
                                            value={formData.transactionCode}
                                            onChange={handleChange}
                                            placeholder="e.g. QGH7XXXXXX"
                                            className={getInputClassName('transactionCode')}
                                        />
                                        {errors.transactionCode && (
                                            <p className="mt-1 text-sm text-red-500">{errors.transactionCode}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4 text-[#cc4400]">Personal Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className={getInputClassName('firstName')}
                                    />
                                    {errors.firstName && (
                                        <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className={getInputClassName('lastName')}
                                    />
                                    {errors.lastName && (
                                        <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Gender <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className={getInputClassName('gender')}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                    {errors.gender && (
                                        <p className="mt-1 text-sm text-red-500">{errors.gender}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date of Birth <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            name="dateOfBirth"
                                            type="date"
                                            value={formData.dateOfBirth}
                                            onChange={handleChange}
                                            className={getInputClassName('dateOfBirth')}
                                        />
                                        {errors.dateOfBirth && (
                                            <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
                                    <select
                                        name="religion"
                                        value={formData.religion}
                                        onChange={handleChange}
                                        className={getInputClassName('religion')}
                                    >
                                        <option value="">Select Religion</option>
                                        <option value="christianity">Christianity</option>
                                        <option value="islam">Islam</option>
                                        <option value="hinduism">Hinduism</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nationality
                                    </label>
                                    <input
                                        name="nationality"
                                        type="text"
                                        value={formData.nationality}
                                        onChange={handleChange}
                                        className={getInputClassName('nationality')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center">
                                            {profileImage ? (
                                                <img
                                                    src={profileImage}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            ) : (
                                                <Upload className="w-8 h-8 text-gray-400" />
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            id="profile-upload"
                                        />
                                        <label
                                            htmlFor="profile-upload"
                                            className="px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                                        >
                                            Choose File
                                        </label>
                                    </div>
                                    {errors.profileImage && (
                                        <p className="mt-1 text-sm text-red-500">{errors.profileImage}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4 text-[#cc4400]">Contact Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={getInputClassName('email')}
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        placeholder="+2547XXXXXXXX"
                                        type="number"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        className={getInputClassName('phoneNumber')}
                                    />
                                    {errors.phoneNumber && (
                                        <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        National ID/Passport No <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="nationalId"
                                        value={formData.nationalId}
                                        onChange={handleChange}
                                        className={getInputClassName('nationalId')}
                                    />
                                    {errors.nationalId && (
                                        <p className="mt-1 text-sm text-red-500">{errors.nationalId}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Emergency Contact Information */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4 text-[#cc4400]">Emergency Contact Person</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="emergencyFirstName"
                                        value={formData.emergencyFirstName}
                                        onChange={handleChange}
                                        className={getInputClassName('emergencyFirstName')}
                                    />
                                    {errors.emergencyFirstName && (
                                        <p className="mt-1 text-sm text-red-500">{errors.emergencyFirstName}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="emergencyLastName"
                                        value={formData.emergencyLastName}
                                        onChange={handleChange}
                                        className={getInputClassName('emergencyLastName')}
                                    />
                                    {errors.emergencyLastName && (
                                        <p className="mt-1 text-sm text-red-500">{errors.emergencyLastName}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Relation<span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="emergencyRelation"
                                        value={formData.emergencyRelation}
                                        onChange={handleChange}
                                        className={getInputClassName('emergencyRelation')}
                                    />
                                    {errors.emergencyRelation && (
                                        <p className="mt-1 text-sm text-red-500">{errors.emergencyRelation}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number<span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="emergencyPhone"
                                        value={formData.emergencyPhone}
                                        onChange={handleChange}
                                        className={getInputClassName('emergencyPhone')}
                                    />
                                    {errors.emergencyPhone && (
                                        <p className="mt-1 text-sm text-red-500">{errors.emergencyPhone}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Submit Button */}
                        <div className="flex justify-center">
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={`px-6 py-2 bg-[#fb923c] hover:bg-[#ea580c] text-white rounded-lg transition-colors text-xl font-bold
                                        ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                {isSubmitting ? loadingButtonText : actionButtonText}
                            </button>
                        </div>

                        {/* General submission error */}
                        {errors.submit && (
                            <p className="mt-2 text-sm text-red-500 text-center">{errors.submit}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
