import { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-hot-toast"
import { Eye, EyeOff } from "lucide-react"
import ForgotPassword from "./forgotPassword/ForgotPassword"

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const [selectedRole, setSelectedRole] = useState("student")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      let endpoint = "";
      switch (selectedRole) {
        case "student":
        case "tutor":
        case "admin":
          endpoint = `${API_URL}/auth/login`;
          break;
        default:
          throw new Error("Please select a role");
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          role: selectedRole,
          rememberMe, // Send Remember Me value
        }),
      });

      const result = await response.json();

      if (result.success) {
          localStorage.setItem(
            "user",
            JSON.stringify({
              token: result.token,
              cohort: result.currentCohort,
              position: selectedRole,
              ...result.data,
            })
          );

        toast.success("Login successful!");

        // Redirect based on role
        switch (selectedRole) {
          case "student":
            navigate("/student-dash");
            break;
          case "tutor":
            navigate("/teacher-dash");
            break;
          case "admin":
            navigate("/admin-dash");
            break;
        }
      } else {
        throw new Error(result.message || "Login failed");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-4 from-orange-50 via-white to-orange-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl grid md:grid-cols-2 bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-[#cc440077]"
      >
        {/* Left Side - Image */}
        <div className="hidden md:block relative shadow-xl">
          <img
            src="/auth/student.png"
            alt="Coffee"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Side - Form */}
        <div className="px-4 py-8 md:p-12">
          <div className="mb-8 max-md:mb-4">
            <div className="flex flex-col items-start gap-4">
              <img src="/wordmark.png" className="h-16 w-auto" alt="HCC" />
              <p className="text-3xl font-bold text-[#cc4400] mb-2 max-md:text-xl ">Login to Your Account</p> 
            </div>
            <p className="text-gray-600">Welcome back! Please enter your details.</p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Select Your Role</label>
            <div className="flex gap-4">
              {["student", "tutor", "admin"].map((role) => (
                <motion.button
                  key={role}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedRole(role)}
                  className={`cursor-pointer flex-1 py-2 px-4 rounded-lg border-2 transition-all ${selectedRole === role
                      ? "border-[#cc4400] bg-[#cc4400] text-white"
                      : "border-gray-200 hover:border-[#cc4400]"
                    }`}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {selectedRole && (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Conditional Input Fields */}
                {selectedRole === "student" ? (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Admission Number</label>
                    <input
                      {...register("admissionNumber", { required: "Admission number is required" })}
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-[#cc4400] focus:border-transparent focus:outline-none"
                      placeholder="Enter your admission number"
                    />
                    {errors.admissionNumber && (
                      <p className="text-red-500 text-sm mt-1">{errors.admissionNumber.message}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">First time? Use your phone number as password</p>
                  </div>
                ) : selectedRole === "admin" ? (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Username</label>
                    <input
                      {...register("username", { required: "Username is required", })}
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-[#cc4400] focus:border-transparent focus:outline-none"
                      placeholder="Enter your username"
                    />
                    {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Email</label>
                    <input
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-[#cc4400] focus:border-transparent focus:outline-none"
                      placeholder="Enter your email"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                  </div>
                )
                }

                {/* Password Field */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Password</label>
                  <div className="relative">
                    <input
                      {...register("password", { required: "Password is required" })}
                      type={showPassword ? "text" : "password"}
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-[#cc4400] focus:border-transparent focus:outline-none"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}

                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded text-[#cc4400] cursor-pointer"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)} // Track change
                    />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-[#cc4400] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#cc4400] cursor-pointer text-white py-2 rounded-lg hover:bg-[#a33700] transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Logging in..." : "Login"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <ForgotPassword
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        role={selectedRole}
      />
    </div>
  )
}

