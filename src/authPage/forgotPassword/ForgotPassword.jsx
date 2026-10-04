"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { X } from "lucide-react"
import { toast } from "react-hot-toast"

const API_URL = import.meta.env.VITE_API_URL;

export default function ForgotPassword({ isOpen, onClose, role }) {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm()

  const handleRequestCode = async (data) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email, role }),
      })

      const result = await response.json()

      if (result.success) {
        setEmail(data.email)
        setStep(2)
        toast.success("Verification code sent to your email!")
      } else {
        throw new Error(result.message || "Failed to send verification code")
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (data) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/auth/verify-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code: data.code, role }),
      })

      const result = await response.json()

      if (result.success) {
        setStep(3)
        toast.success("Code verified successfully!")
      } else {
        throw new Error(result.message || "Invalid verification code")
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (data) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password: data.password, role }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Password reset successfully!")
        reset()
        setStep(1)
        onClose()
      } else {
        throw new Error(result.message || "Failed to reset password")
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md relative overflow-hidden"
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 cursor-pointer">
          <X size={24} />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Reset Password</h2>
          <p className="bg-amber-300/35 font-thin p-2 rounded-md mb-4">Make Sure you <span className="font-semibold">select role</span> first before you click Forget. Otherwise it won't work.</p>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit(handleRequestCode)}
                className="space-y-4"
              >
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Email Address</label>
                  <input
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#cc4400] focus:border-transparent"
                    placeholder="Enter your email"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#cc4400] text-white py-2 rounded-lg hover:bg-[#a33700] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? "Sending..." : "Send Verification Code"}
                </button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit(handleVerifyCode)}
                className="space-y-4"
              >
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Verification Code</label>
                  <input
                    {...register("code", { required: "Verification code is required" })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#cc4400] focus:border-transparent"
                    placeholder="Enter verification code"
                  />
                  {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#cc4400] text-white py-2 rounded-lg hover:bg-[#a33700] transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Verifying..." : "Verify Code"}
                </button>
              </motion.form>
            )}

            {step === 3 && (
              <motion.form
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit(handleResetPassword)}
                className="space-y-4"
              >
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">New Password</label>
                  <input
                    type="password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                    })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#cc4400] focus:border-transparent"
                    placeholder="Enter new password"
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Confirm Password</label>
                  <input
                    type="password"
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) => value === password || "The passwords do not match",
                    })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#cc4400] focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#cc4400] text-white py-2 rounded-lg hover:bg-[#a33700] transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

