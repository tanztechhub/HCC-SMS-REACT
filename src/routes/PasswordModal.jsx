import React, { useState } from "react";
import toast from "react-hot-toast";
import { RectangleEllipsis } from "lucide-react";
import LoadingSpinner from "../components/loadingSpinner/LoadingSpinner";

const API_URL = import.meta.env.VITE_API_URL;

// Password modal component
const PasswordModal = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      setIsLoading(true);
      const userData = JSON.parse(localStorage.getItem("user"))
      const response = await fetch(`${API_URL}/tutors/${userData.id}/confirm-pass`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData.token}`,
        },
        body: JSON.stringify({
          password,
        }),
      })

      const data = await response.json()
      console.log(`data`, data)

      if (data.success) {
        toast.success("Password Verified Successfully");
        onSuccess();
      } else {
        toast.error(data.message)
        setError(data.message)
      }
    } catch (err) {
      setError("Failed to verify password");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-orange-800/25 backdrop-blur-xl flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full">
        <h2 className="text-xl font-bold mb-4">Authentication Required</h2>
        <p className="mb-4">This section requires additional verification. Please enter your password to continue.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full p-2 border-2 border-gray-300 rounded mb-4 focus:border-orange-600 focus:outline-none"
            autoFocus
          />

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded cursor-pointer"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-600 text-white rounded cursor-pointer flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? <LoadingSpinner size={20} /> : <RectangleEllipsis />}
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;