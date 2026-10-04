"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { Plus, Edit, Trash2, Lock, Unlock } from "lucide-react"
import AdminModal from "./AdminModal"
import DeleteConfirmationModal from "./DeleteConfirmationModal"
import PermissionsSettings from "./PermissionsSettings"

const API_URL = import.meta.env.VITE_API_URL

export default function AdminManagement() {
  const [activeTab, setActiveTab] = useState("admins")
  const [admins, setAdmins] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/admin`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch admins")
      }
      toast.success(`Admins Fetched Sucessfully`)
      const data = await response.json()
      setAdmins(data.data)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateOrUpdateAdmin = async (adminData, isFormData) => {
    try {
      setIsSubmitting(true)
      const url = selectedAdmin ? `${API_URL}/admin/${selectedAdmin._id}` : `${API_URL}/admin/create`
      const method = selectedAdmin ? "PUT" : "POST"
  
      let headers = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }
  
      // Only add Content-Type for JSON data
      if (!isFormData) {
        headers["Content-Type"] = "application/json";
      }
  
      const response = await fetch(url, {
        method,
        headers,
        body: isFormData ? adminData : JSON.stringify(adminData),
      })
  
      const data = await response.json();
  
      if (!response.ok) {
        console.log(data);
        throw new Error(data.message || `Failed to create/update admin`);
      }
  
      toast.success(`Admin ${selectedAdmin ? "updated" : "created"} successfully`)
      fetchAdmins()
      setShowModal(false)
      setSelectedAdmin(null)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDeleteAdmin = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/${selectedAdmin._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })

      if (!response.ok) {
        throw new Error("Failed to delete admin")
      }

      toast.success("Admin deleted successfully")
      fetchAdmins()
      setShowDeleteModal(false)
      setSelectedAdmin(null)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleToggleAccess = async (admin) => {
    try {
      const response = await fetch(`${API_URL}/admin/${admin._id}/toggle-access`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ isBlockedAccess: !admin.isBlockedAccess }),
      })

      if (!response.ok) {
        throw new Error("Failed to toggle admin access")
      }

      toast.success(`Admin access ${admin.isBlockedAccess ? "unblocked" : "blocked"} successfully`)
      fetchAdmins()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Management</h1>
        {activeTab === "admins" && (
          <button
            onClick={() => {
              setSelectedAdmin(null)
              setShowModal(true)
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
          >
            <Plus className="mr-2" />
            Add New Admin
          </button>
        )}
      </div>

      <div className="flex gap-2 border-b border-gray-300 mb-6">
        <button
          onClick={() => setActiveTab("admins")}
          className={`py-2 px-4 font-semibold cursor-pointer ${
            activeTab === "admins"
              ? "border-b-2 border-orange-700 text-orange-700"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Admins
        </button>
        <button
          onClick={() => setActiveTab("permissions")}
          className={`py-2 px-4 font-semibold cursor-pointer ${
            activeTab === "permissions"
              ? "border-b-2 border-orange-700 text-orange-700"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Permissions
        </button>
      </div>

      {activeTab === "permissions" ? (
        <PermissionsSettings />
      ) : isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-22 w-22 border-t-2 border-b-2 border-orange-900"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {admins.map((admin) => (
            <div key={admin._id} className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-4">
                <img
                  src={admin.profileImage || "/profile/student.jpg"}
                  alt={`${admin.username}`}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h2 className="text-xl font-semibold text-center mb-2">
                  {admin.username}
                </h2>
                <p className="text-gray-600 text-center mb-2 capitalize">{admin.role}</p>
                <p className={`text-center font-bold mb-4 ${admin.isBlockedAccess ? "text-red-500" : "text-orange-500"}`}>
                  {admin.isBlockedAccess ? "Access Blocked" : "Access Granted"}
                </p>
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedAdmin(admin)
                      setShowModal(true)
                    }}
                    className="bg-orange-500/30 border-2 border-orange-500 hover:bg-orange-600/50 text-orange-500 hover:text-white font-bold py-1 px-2 rounded inline-flex items-center cursor-pointer"
                  >
                    <Edit className="mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleAccess(admin)}
                    className={`${
                      admin.isBlockedAccess ? "bg-orange-500/30 hover:bg-orange-600/50 border-2 border-orange-500 text-orange-500" : "bg-red-500/30 hover:bg-red-600/50 border-2 border-red-600 text-red-500"
                    } hover:text-white font-bold py-1 px-2 rounded inline-flex items-center cursor-pointer`}
                  >
                    {admin.isBlockedAccess ? <Unlock className="mr-2" /> : <Lock className="mr-2" />}
                    {admin.isBlockedAccess ? "Unblock" : "Block"}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAdmin(admin)
                      setShowDeleteModal(true)
                    }}
                    className="bg-amber-500/30 hover:bg-amber-600/50 border-2 border-amber-500 text-amber-500 hover:text-white font-bold py-1 px-2 rounded inline-flex items-center cursor-pointer"
                  >
                    <Trash2 className="mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AdminModal
          admin={selectedAdmin}
          onClose={() => {
            setShowModal(false)
            setSelectedAdmin(null)
          }}
          onSubmit={handleCreateOrUpdateAdmin}
          isSubmitting={isSubmitting}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmationModal
          admin={selectedAdmin}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedAdmin(null)
          }}
          onConfirm={handleDeleteAdmin}
        />
      )}
    </div>
  )
}

