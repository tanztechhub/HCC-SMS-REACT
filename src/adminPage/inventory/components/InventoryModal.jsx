"use client"

import { useState, useEffect } from "react"
import { X, Upload } from 'lucide-react'
import { MdInventory } from "react-icons/md"

export default function InventoryModal({ item, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "Book",
    description: "",
    purchasePrice: "",
    estimatedCurrentPrice: "",
    datePurchased: "",
    quantity: "",
    status: "Available",
    image: null,
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        category: item.category || "Book",
        description: item.description || "",
        purchasePrice: item.purchasePrice ? item.purchasePrice.toString() : "",
        estimatedCurrentPrice: item.estimatedCurrentPrice ? item.estimatedCurrentPrice.toString() : "",
        datePurchased: item.datePurchased || "",
        status: item.status || "Available",
        quantity: item.quantity ? item.quantity.toString() : "",
        image: null,
      })
    }
  }, [item])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setErrors((prev) => ({
          ...prev,
          image: "Image size should not exceed 5MB",
        }))
        return
      }

      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          image: "Please upload an image file",
        }))
        return
      }

      setFormData((prev) => ({
        ...prev,
        image: file,
      }))
      setErrors((prev) => ({ ...prev, image: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.category) newErrors.category = "Category is required"
    if (!formData.purchasePrice.trim()) newErrors.purchasePrice = "Purchase price is required"
    if (isNaN(Number(formData.purchasePrice))) newErrors.purchasePrice = "Purchase price must be a number"
    if (!formData.quantity.trim()) newErrors.quantity = "Quantity is required"
    if (isNaN(Number(formData.quantity))) newErrors.quantity = "Quantity must be a number"
    if (formData.estimatedCurrentPrice && isNaN(Number(formData.estimatedCurrentPrice)))
      newErrors.estimatedCurrentPrice = "Estimated current price must be a number"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validateForm()) {
      setIsSubmitting(true)
      const formDataToSend = new FormData()
      
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "image") {
          formDataToSend.append(key, value.toString().trim())
        }
      })

      if (formData.image) {
        formDataToSend.append("image", formData.image)
      }

      try {
        await onSave(formDataToSend, !!item)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-orange-800/25 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-orange-700">
            <i className="bg-orange-700 rounded-full text-white p-1 flex items-center justify-center">
              <MdInventory />
            </i>
            {item ? "Edit Item" : "Add New Item"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-2 p-2 border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm focus:outline-none ${
                errors.name ? "border-red-500" : ""
              }`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-2 p-2 cursor-pointer border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm focus:outline-none"
            >
              <option value="Book">Book</option>
              <option value="Equipment">Equipment</option>
              <option value="Supply">Supply</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {item && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-2 p-2 cursor-pointer border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm focus:outline-none"
            >
              <option value="Available">Available</option>
              <option value="Borrowed">Borrowed</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-2 p-2 border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Purchase Price</label>
              <input
                type="text"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-2 p-2 border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm focus:outline-none ${
                  errors.purchasePrice ? "border-red-500" : ""
                }`}
              />
              {errors.purchasePrice && <p className="mt-1 text-sm text-red-600">{errors.purchasePrice}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Estimated Current Price</label>
              <input
                type="text"
                name="estimatedCurrentPrice"
                value={formData.estimatedCurrentPrice}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-2 p-2 border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm focus:outline-none ${
                  errors.estimatedCurrentPrice ? "border-red-500" : ""
                }`}
              />
              {errors.estimatedCurrentPrice && (
                <p className="mt-1 text-sm text-red-600">{errors.estimatedCurrentPrice}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date Purchased</label>
              <input
                type="date"
                name="datePurchased"
                value={formData.datePurchased}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-2 p-2 border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
              <input
                type="text"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-2 p-2 border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm focus:outline-none ${
                  errors.quantity ? "border-red-500" : ""
                }`}
              />
              {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Image</label>
            <div className="mt-1 flex items-center space-x-4">
              <div className="w-20 h-20 border-2 border-gray-300 border-dashed rounded-lg flex items-center justify-center overflow-hidden">
                {formData.image ? (
                  <img
                    src={URL.createObjectURL(formData.image) || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : item?.image ? (
                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <Upload className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="px-4 py-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 transition-colors"
              >
                Choose File
              </label>
            </div>
            {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Saving..." : item ? "Update Item" : "Create Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
