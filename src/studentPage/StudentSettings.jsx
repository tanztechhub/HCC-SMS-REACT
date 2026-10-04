import { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Flag,
  Key,
  Upload,
  Save,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  X
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

export default function StudentSettings() {
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  // Profile picture state
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordUpdateLoading, setPasswordUpdateLoading] = useState(false);
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);

  useEffect(() => {
    fetchStudentData();
  }, []);

  // Create preview when a new image is selected
  useEffect(() => {
    if (!selectedImage) return;

    const objectUrl = URL.createObjectURL(selectedImage);
    setPreviewImage(objectUrl);

    // Free memory when this component is unmounted
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  const fetchStudentData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData || !userData.token) {
        throw new Error("Please login again");
      }

      const studentResponse = await fetch(
        `${API_URL}/students/${userData.admissionNumber}`,
        {
          headers: { Authorization: `Bearer ${userData.token}` },
        }
      );

      const studentData = await studentResponse.json();

      if (studentData.success) {
        setStudent(studentData.data);
      } else {
        throw new Error("Failed to fetch student data");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should not exceed 5MB");
      return;
    }

    if (!file.type.includes("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);

    setSelectedImage(file);
  };


  const resetImageUpload = () => {
    setSelectedImage(null);
    setPreviewImage(null);
    setUploadError(null);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  const handleImageUpload = async (e) => {
    e.preventDefault();

    if (!fileInputRef.current.files[0]) {
      toast.error("Please select an image to upload");
      return;
    }

    setUploadLoading(true);

    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const formData = new FormData();
      formData.append("admissionNumber", student.admissionNumber);
      formData.append("profileImage", fileInputRef.current.files[0]);

      const response = await fetch(`${API_URL}/students/change-student-profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Profile picture updated successfully");
        setStudent((prev) => ({ ...prev, profileImage: data.data.profileImage }));
      } else {
        throw new Error(data.message || "Failed to update profile picture");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploadLoading(false);
    }
  };


  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value
    });

    // Clear success message when user starts typing again
    if (passwordUpdateSuccess) {
      setPasswordUpdateSuccess(false);
    }
  };

  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    return errors;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const formErrors = validatePasswordForm();
    setPasswordErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      return;
    }

    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData || !userData.token) {
      alert("Please login again");
      return;
    }

    setPasswordUpdateLoading(true);

    try {
      const response = await fetch(`${API_URL}/students/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData.token}`
        },
        body: JSON.stringify({
          admissionNumber: student.admissionNumber,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const result = await response.json();

      if (result.success) {
        setPasswordUpdateSuccess(true);
        // Reset form after success
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        setPasswordErrors({
          general: result.message || "Failed to update password"
        });
      }
    } catch (error) {
      setPasswordErrors({
        general: "An error occurred. Please try again."
      });
    } finally {
      setPasswordUpdateLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[url(/student/student.png)]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-orange-600 text-2xl font-bold mb-6 uppercase">
          Account Settings
        </h1>

        <div className="bg-white rounded-lg shadow-lg border-2 border-orange-600 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-4 px-6 max-md:px-2 text-center cursor-pointer ${activeTab === "profile"
                  ? "border-b-2 border-orange-600 text-orange-600 font-medium"
                  : "text-gray-500 hover:text-orange-500"
                }`}
              onClick={() => setActiveTab("profile")}
            >
              Personal Information
            </button>
            <button
              className={`flex-1 py-4 px-6 max-md:px-2 text-center cursor-pointer ${activeTab === "password"
                  ? "border-b-2 border-orange-600 text-orange-600 font-medium"
                  : "text-gray-500 hover:text-orange-500"
                }`}
              onClick={() => setActiveTab("password")}
            >
              Change Password
            </button>
            <button
              className={`flex-1 py-4 px-6 max-md:px-2 max-md:pr-4 text-center cursor-pointer ${activeTab === "picture"
                  ? "border-b-2 border-orange-600 text-orange-600 font-medium"
                  : "text-gray-500 hover:text-orange-500"
                }`}
              onClick={() => setActiveTab("picture")}
            >
              Profile Picture
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Personal Information Tab */}
            {activeTab === "profile" && (
              <div>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        To update your personal information, please visit the administration office with proper identification.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <User className="h-5 w-5 mr-2 text-orange-600" />
                        <span className="text-sm font-medium text-gray-500">Full Name</span>
                      </div>
                      <p className="text-lg font-medium">
                        {student.firstName} {student.lastName}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center mb-2">
                        <Mail className="h-5 w-5 mr-2 text-orange-600" />
                        <span className="text-sm font-medium text-gray-500">Email Address</span>
                      </div>
                      <p className="text-lg">{student.email}</p>
                    </div>

                    <div>
                      <div className="flex items-center mb-2">
                        <Phone className="h-5 w-5 mr-2 text-orange-600" />
                        <span className="text-sm font-medium text-gray-500">Phone Number</span>
                      </div>
                      <p className="text-lg">{student.phoneNumber}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <Calendar className="h-5 w-5 mr-2 text-orange-600" />
                        <span className="text-sm font-medium text-gray-500">Date of Birth</span>
                      </div>
                      <p className="text-lg">
                        {new Date(student.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center mb-2">
                        <Flag className="h-5 w-5 mr-2 text-orange-600" />
                        <span className="text-sm font-medium text-gray-500">Nationality</span>
                      </div>
                      <p className="text-lg">{student.nationality}</p>
                    </div>

                    <div>
                      <div className="flex items-center mb-2">
                        <User className="h-5 w-5 mr-2 text-orange-600" />
                        <span className="text-sm font-medium text-gray-500">ID Number</span>
                      </div>
                      <p className="text-lg">{student.nationalId}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Name</p>
                      <p className="font-medium">
                        {student.emergencyContact.firstName} {student.emergencyContact.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Relationship</p>
                      <p className="font-medium">{student.emergencyContact.relation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Phone</p>
                      <p className="font-medium">{student.emergencyContact.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Change Password Tab */}
            {activeTab === "password" && (
              <div>
                {passwordUpdateSuccess && (
                  <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-orange-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-orange-700">
                          Your password has been updated successfully!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {passwordErrors.general && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">
                          {passwordErrors.general}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="max-w-md mx-auto">
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="currentPassword">
                      Current Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        className={`w-full pl-10 pr-3 py-2 border ${passwordErrors.currentPassword ? "border-red-500" : "border-gray-300"
                          } rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500`}
                        placeholder="Enter your current password"
                      />
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        className={`w-full pl-10 pr-3 py-2 border ${passwordErrors.newPassword ? "border-red-500" : "border-gray-300"
                          } rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500`}
                        placeholder="Enter your new password"
                      />
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword}</p>
                    )}
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        className={`w-full pl-10 pr-3 py-2 border ${passwordErrors.confirmPassword ? "border-red-500" : "border-gray-300"
                          } rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500`}
                        placeholder="Confirm your new password"
                      />
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={passwordUpdateLoading}
                      className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-8 rounded-full flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {passwordUpdateLoading ? (
                        <>
                          <div className="animate-spin mr-2 h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-5 w-5" />
                          Update Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Profile Picture Tab */}
            {activeTab === "picture" && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative mb-4 w-48 h-48 rounded-full overflow-hidden border-4 border-orange-100">
                      <img
                        src={previewImage || student.profileImage || "/profile/student.jpg"}
                        alt={`${student.firstName} ${student.lastName}`}
                        className="w-full h-full object-cover"
                      />
                      {selectedImage && (
                        <button
                          onClick={resetImageUpload}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                          title="Remove selected image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="text-center mb-4">
                      <h3 className="font-medium">
                        {student.firstName} {student.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{student.admissionNumber}</p>
                    </div>
                  </div>

                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-2">Update Profile Picture</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Upload a new profile picture. For best results, use a square image.
                      </p>

                      {uploadSuccess && (
                        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <CheckCircle className="h-5 w-5 text-orange-400" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-orange-700">
                                Profile picture updated successfully!
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {uploadError && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <AlertCircle className="h-5 w-5 text-red-400" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-red-700">{uploadError}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                          <input
                            type="file"
                            id="profileImage"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            className="hidden"
                          />
                          <label
                            htmlFor="profileImage"
                            className="cursor-pointer flex flex-col items-center justify-center"
                          >
                            <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                            <span className="text-gray-600 font-medium">Click to select an image</span>
                            <span className="text-gray-500 text-sm mt-1">
                              JPEG, PNG, GIF up to 5MB
                            </span>
                          </label>
                        </div>

                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={handleImageUpload}
                            disabled={!selectedImage || uploadLoading}
                            className={`${!selectedImage
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-orange-600 hover:bg-orange-700"
                              } text-white font-bold py-2 px-8 rounded-full flex items-center`}
                          >
                            {uploadLoading ? (
                              <>
                                <div className="animate-spin mr-2 h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></div>
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="mr-2 h-5 w-5" />
                                Upload Image
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}