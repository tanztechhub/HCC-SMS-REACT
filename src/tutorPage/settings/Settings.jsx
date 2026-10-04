"use client"

import { useState, useEffect, useRef } from "react"
import { toast } from "react-hot-toast"
import { Eye, EyeOff, Lock, Mail, Phone, Upload, User } from "lucide-react"
import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner'

const API_URL = import.meta.env.VITE_API_URL;

export default function Settings() {
    const [tutor, setTutor] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showPassword, setShowPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [previewImage, setPreviewImage] = useState(null)
    const fileInputRef = useRef(null)
    const [isUploading, setIsUploading] = useState(false)
    const [isPasswording, setIsPasswording] = useState(false);
    const [isEmailing, setIsEmailing] = useState(false);
    const [isPhoning, setIsPhoning] = useState(false);

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    })

    const [emailForm, setEmailForm] = useState({
        newEmail: "",
        password: "",
    })

    const [phoneForm, setPhoneForm] = useState({
        phone: "",
    })

    useEffect(() => {
        fetchTutorData()
    }, [])

    useEffect(() => {
        if (tutor && tutor.phone) {
            setPhoneForm({ phone: tutor.phone })
        }
    }, [tutor])

    const fetchTutorData = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem("user"))
            if (!userData || !userData.token) {
                throw new Error("Please login again")
            }

            const response = await fetch(`${API_URL}/tutors/${userData.id}`, {
                headers: {
                    Authorization: `Bearer ${userData.token}`,
                },
            })
            const data = await response.json()

            if (data.success) {
                setTutor(data.data)
                setPreviewImage(data.data.profilePicture)
            } else {
                throw new Error(data.message || "Failed to fetch tutor data")
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handlePasswordChange = (e) => {
        const { name, value } = e.target
        setPasswordForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleEmailChange = (e) => {
        const { name, value } = e.target
        setEmailForm((prev) => ({ ...prev, [name]: value }))
    }

    const handlePhoneChange = (e) => {
        const { name, value } = e.target
        setPhoneForm((prev) => ({ ...prev, [name]: value }))
    }

    const validatePasswordForm = () => {
        if (!passwordForm.currentPassword) {
            toast.error("Please enter your current password")
            return false
        }
        if (!passwordForm.newPassword) {
            toast.error("Please enter a new password")
            return false
        }
        if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
            toast.error("New passwords do not match")
            return false
        }
        return true
    }

    const validateEmailForm = () => {
        if (!emailForm.newEmail) {
            toast.error("Please enter a new email")
            return false
        }
        if (!/\S+@\S+\.\S+/.test(emailForm.newEmail)) {
            toast.error("Please enter a valid email address")
            return false
        }
        if (!emailForm.password) {
            toast.error("Please enter your password to confirm email change")
            return false
        }
        return true
    }

    const validatePhoneForm = () => {
        if (!phoneForm.phone) {
            toast.error("Please enter your phone number")
            return false
        }
        // Basic phone number validation - adjust according to your requirements
        if (!/^\d{10,12}$/.test(phoneForm.phone.replace(/[+\s-]/g, ''))) {
            toast.error("Please enter a valid phone number")
            return false
        }
        return true
    }

    const handlePasswordSubmit = async (e) => {
        e.preventDefault()
        if (!validatePasswordForm()) return

        try {
            setIsPasswording(true);
            const userData = JSON.parse(localStorage.getItem("user"))
            const response = await fetch(`${API_URL}/tutors/${userData.id}/change-password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userData.token}`,
                },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword,
                }),
            })

            const data = await response.json()

            if (data.success) {
                toast.success("Password updated successfully")
                setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmNewPassword: "",
                })
            } else {
                throw new Error(data.message || "Failed to update password")
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsPasswording(false);
        }
    }

    const handleEmailSubmit = async (e) => {
        e.preventDefault()
        if (!validateEmailForm()) return

        try {
            setIsEmailing(true);
            const userData = JSON.parse(localStorage.getItem("user"))
            const response = await fetch(`${API_URL}/tutors/${userData.id}/change-email`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userData.token}`,
                },
                body: JSON.stringify({
                    newEmail: emailForm.newEmail,
                    password: emailForm.password,
                }),
            })

            const data = await response.json()

            if (data.success) {
                toast.success("Email updated successfully")
                setTutor((prev) => ({ ...prev, email: emailForm.newEmail }))
                setEmailForm({
                    newEmail: "",
                    password: "",
                })
            } else {
                throw new Error(data.message || "Failed to update email")
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsEmailing(false);
        }
    }

    const handlePhoneSubmit = async (e) => {
        e.preventDefault()
        if (!validatePhoneForm()) return

        try {
            setIsPhoning(true);
            const userData = JSON.parse(localStorage.getItem("user"))
            const response = await fetch(`${API_URL}/tutors/${userData.id}/update-phone`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userData.token}`,
                },
                body: JSON.stringify({
                    phone: phoneForm.phone,
                }),
            })

            const data = await response.json()

            if (data.success) {
                toast.success("Phone number updated successfully")
                setTutor((prev) => ({ ...prev, phone: phoneForm.phone }))
            } else {
                throw new Error(data.message || "Failed to update phone number")
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsPhoning(false);
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size should not exceed 5MB")
            return
        }

        if (!file.type.includes('image/')) {
            toast.error("Please upload an image file")
            return
        }

        // Create a preview of the selected image
        const reader = new FileReader()
        reader.onloadend = () => {
            setPreviewImage(reader.result)
        }
        reader.readAsDataURL(file)
    }

    const handleProfilePictureSubmit = async (e) => {
        e.preventDefault()

        if (!fileInputRef.current.files[0]) {
            toast.error("Please select an image to upload")
            return
        }

        setIsUploading(true)

        try {
            const userData = JSON.parse(localStorage.getItem("user"))
            const formData = new FormData()
            formData.append('profilePicture', fileInputRef.current.files[0])

            const response = await fetch(`${API_URL}/tutors/${userData.id}/update-profile-picture`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${userData.token}`,
                },
                body: formData,
            })

            const data = await response.json()

            if (data.success) {
                toast.success("Profile picture updated successfully")
                setTutor((prev) => ({ ...prev, profilePicture: data.data.profilePicture }))
            } else {
                throw new Error(data.message || "Failed to update profile picture")
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsUploading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        )
    }

    return (
        <div>
            <div className="py-8 mx-4 pb-25">
                <h1 className="text-3xl font-bold text-orange-900 mb-8">Settings</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="bg-white shadow rounded-lg p-6 mb-6 border-2 border-orange-400">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {tutor.firstName} {tutor.lastName}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <p className="mt-1 text-sm text-gray-900">{tutor.email}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <p className="mt-1 text-sm text-gray-900">{tutor.phone || "Not set"}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Role</label>
                                    <p className="mt-1 text-sm text-gray-900">{tutor.role}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <p className="mt-1 text-sm text-gray-900">{tutor.status}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white shadow rounded-lg p-6 mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Email</h2>
                            <form onSubmit={handleEmailSubmit}>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700">
                                            New Email
                                        </label>
                                        <input
                                            type="email"
                                            name="newEmail"
                                            id="newEmail"
                                            value={emailForm.newEmail}
                                            onChange={handleEmailChange}
                                            className="mt-1 block w-full border-2 p-2 border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="emailPassword" className="block text-sm font-medium text-gray-700">
                                            Password (to confirm change)
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            id="emailPassword"
                                            value={emailForm.password}
                                            onChange={handleEmailChange}
                                            className="mt-1 block w-full border-2 p-2 border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <button
                                        type="submit"
                                        className="inline-flex gap-4 items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer"
                                    >
                                        {isEmailing ? <LoadingSpinner size={20}/> : <Mail className="mr-2 h-4 w-4" />}
                                        Update Email
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="bg-white shadow rounded-lg p-6 mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Phone Number</h2>
                            <form onSubmit={handlePhoneSubmit}>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            id="phone"
                                            value={phoneForm.phone}
                                            onChange={handlePhoneChange}
                                            placeholder="e.g. 0712345678"
                                            className="mt-1 block w-full border-2 p-2 border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <button
                                        type="submit"
                                        className="inline-flex gap-4 items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer"
                                    >
                                        {isPhoning ? <LoadingSpinner size={20}/> : <Phone className="mr-2 h-4 w-4" />}
                                        Update Phone Number
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="bg-white shadow rounded-lg p-6 mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h2>
                            <form onSubmit={handlePasswordSubmit}>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                                            Current Password
                                        </label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="currentPassword"
                                                id="currentPassword"
                                                value={passwordForm.currentPassword}
                                                onChange={handlePasswordChange}
                                                className="block w-full pr-10 border-2 p-2 border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 sm:text-sm focus:outline-none"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                            New Password
                                        </label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                name="newPassword"
                                                id="newPassword"
                                                value={passwordForm.newPassword}
                                                onChange={handlePasswordChange}
                                                className="block w-full pr-10 border-2 p-2 border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 sm:text-sm focus:outline-none"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                            >
                                                {showNewPassword ? (
                                                    <EyeOff className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmNewPassword"
                                            id="confirmNewPassword"
                                            value={passwordForm.confirmNewPassword}
                                            onChange={handlePasswordChange}
                                            className="mt-1 block w-full border-2 p-2 border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <button
                                        type="submit"
                                        className="inline-flex gap-4 items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer"
                                    >
                                        {isPasswording ? <LoadingSpinner size={20}/> : <Lock className="mr-2 h-4 w-4" />}
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white shadow rounded-lg p-6 mb-6 sticky top-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Picture</h2>
                            <div className="flex flex-col items-center">
                                <div className="w-48 h-48 rounded-full overflow-hidden mb-4 border-4 border-orange-500">
                                    {previewImage ? (
                                        <img
                                            src={previewImage}
                                            alt="Profile Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                            <User className="h-24 w-24 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <form onSubmit={handleProfilePictureSubmit} className="w-full">
                                    <div className="flex flex-col items-center">
                                        <label htmlFor="profilePicture" className="mb-2 cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                                            <Upload className="mr-2 h-4 w-4" />
                                            Select New Image
                                        </label>
                                        <input
                                            type="file"
                                            id="profilePicture"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <p className="text-xs text-gray-500 mt-1 mb-4 text-center">
                                            Supported formats: JPG, PNG, GIF (Max 5MB)
                                        </p>
                                        <button
                                            type="submit"
                                            disabled={isUploading}
                                            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isUploading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                                    Uploading...
                                                </>
                                            ) : (
                                                <>
                                                    <User className="mr-2 h-4 w-4" />
                                                    Update Profile Picture
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}