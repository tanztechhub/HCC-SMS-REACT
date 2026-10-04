"use client"

import { useState, useEffect } from "react"
import { X, Eye, EyeOff, Upload, User } from "lucide-react"
import LoadingSpinner from "../../components/loadingSpinner/LoadingSpinner"
import { LuRefreshCw } from "react-icons/lu"

export default function AdminModal({ admin, onClose, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    username: "",
    role: "junior",
    profileImage: null,
    profileImagePreview: null,
    password: "",
    confirmPassword: "",
    isBlockedAccess: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

  useEffect(() => {
    if (admin) {
      setFormData({
        username: admin.username,
        role: admin.role,
        profileImage: null,
        profileImagePreview: admin.profileImageUrl || null,
        password: "",
        confirmPassword: "",
        isBlockedAccess: admin.isBlockedAccess,
      })
    }
  }, [admin])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setErrors((prev) => ({
          ...prev,
          profileImage: "Image size should not exceed 5MB",
        }))
        return
      }
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          profileImage: "Please upload an image file",
        }))
        return
      }
      setFormData((prev) => ({
        ...prev,
        profileImage: file,
        profileImagePreview: URL.createObjectURL(file),
      }))
      setErrors((prev) => ({ ...prev, profileImage: "" }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({ ...prev, password: "Passwords do not match" }))
      return
    }

    // For file uploads, use FormData
    if (formData.profileImage) {
      const data = new FormData()
      for (const key in formData) {
        if (formData[key] !== null && key !== 'profileImagePreview' && key !== 'confirmPassword') {
          data.append(key, formData[key])
        }
      }
      onSubmit(data, true) // Pass true to indicate FormData
    } else {
      // For regular updates without files, use JSON
      const data = { ...formData }
      delete data.profileImage
      delete data.profileImagePreview
      delete data.confirmPassword
      onSubmit(data, false) // Pass false to indicate JSON
    }
  }

  return (
    <div className="fixed inset-0 bg-orange-800/25 z-50 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{admin ? "Edit Admin" : "Create Admin"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="shadow appearance-none border-2 border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="role" className="block text-gray-700 text-sm font-bold mb-2">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="shadow appearance-none border-2 border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="junior">Junior</option>
              <option value="senior">Senior</option>
            </select>
          </div>

          <div className="mb-4 relative">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="shadow appearance-none border-2 border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-10"
              required={!admin}
            />
            <button
              type="button"
              className="absolute text-gray-500 top-9 cursor-pointer right-0 pr-3 flex items-center text-sm leading-5"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1 mb-3">{errors.password}</p>}
          <div className="mb-4 relative">
            <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">
              Confirm Password
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="shadow appearance-none border-2 border-gray-300 cursor-pointer rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-10"
              required={!admin}
            />
            <button
              type="button"
              className="absolute text-gray-500 top-9 right-0 pr-3 flex items-center text-sm leading-5"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
            </button>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Profile Picture
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 border-2 border-gray-300 border-dashed rounded-full flex items-center justify-center overflow-hidden">
                {formData.profileImagePreview ? (
                  <img
                    src={formData.profileImagePreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Upload className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <input
                type="file"
                id="profileImage"
                name="profileImage"
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
              />
              <label
                htmlFor="profileImage"
                className="px-4 py-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 transition-colors"
              >
                Choose File
              </label>
            </div>
            {errors.profileImage && <p className="text-red-500 text-xs mt-1">{errors.profileImage}</p>}
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isBlockedAccess"
                checked={formData.isBlockedAccess}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-gray-700">Block Access</span>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center gap-4 cursor-pointer"
            >
               {isSubmitting ? <LoadingSpinner size={15} /> : <User />}
              {admin ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}