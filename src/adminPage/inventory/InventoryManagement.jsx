import "./Inventory.css"
"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { Plus, Eye, Pencil, Trash2, Book, User, BookA } from 'lucide-react'
import InventoryModal from "./components/InventoryModal"
import QuickViewModal from "./components/QuickViewModal"
import BorrowBookModal from "./components/BorrowBookModal"
import DeleteConfirmationModal from "./components/DeleteConfirmationModal"
import ReturnBookModal from "./components/ReturnBookModal"

const API_URL = import.meta.env.VITE_API_URL;

export default function InventoryManagement() {
  const [items, setItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [filters, setFilters] = useState({
    search: "",
    category: "All Categories",
    status: "All Statuses",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showInventoryModal, setShowInventoryModal] = useState(false)
  const [showQuickViewModal, setShowQuickViewModal] = useState(false)
  const [showBorrowModal, setShowBorrowModal] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [borrowingBook, setBorrowingBook] = useState(false)

  useEffect(() => {
    fetchInventory()
  }, [])

  useEffect(() => {
    filterItems()
  }, [items, filters])

  const fetchInventory = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/inventory`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch inventory")
      }
      const data = await response.json()
      setItems(data.data)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const filterItems = () => {
    let filtered = [...items]

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(
        item =>
          item.name.toLowerCase().includes(searchTerm) ||
          item.description.toLowerCase().includes(searchTerm)
      )
    }

    if (filters.category !== "All Categories") {
      filtered = filtered.filter(item => item.category === filters.category)
    }

    if (filters.status !== "All Statuses") {
      filtered = filtered.filter(item => item.status === filters.status)
    }

    setFilteredItems(filtered)
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/inventory/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      if (!response.ok) {
        throw new Error("Failed to delete item")
      }
      toast.success("Item deleted successfully")
      fetchInventory()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setShowDeleteModal(false)
    }
  }

  const handleSave = async (formData, isEditing) => {
    try {
      const url = isEditing
        ? `${API_URL}/inventory/${selectedItem._id}`
        : `${API_URL}/inventory`

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? "update" : "create"} item`)
      }

      toast.success(`Item ${isEditing ? "updated" : "created"} successfully`)
      fetchInventory()
      setShowInventoryModal(false)
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="hcc-inventory">
      <div className="hcc-inventory-heading">
        <div><p className="hcc-inventory-eyebrow">14 / SCHOOL RESOURCES</p><h1>Inventory</h1><p>Manage equipment, supplies and library lending.</p></div>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => {
              setShowReturnModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors cursor-pointer"
          >
            <BookA className="h-5 w-5" />
            Return Book
          </button>
          <button
            onClick={() => {
              setSelectedItem(null)
              setShowInventoryModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add New Item
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="hcc-inventory-filters grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          aria-label="Search inventory"
          placeholder="Search items..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="px-4 py-2 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <select
          aria-label="Inventory category"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="px-4 py-2 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
        >
          <option>All Categories</option>
          <option>Book</option>
          <option>Equipment</option>
          <option>Supply</option>
          <option>Other</option>
        </select>
        <select
          aria-label="Inventory status"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-4 py-2 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
        >
          <option>All Statuses</option>
          <option>Available</option>
          <option>Borrowed</option>
          <option>Maintenance</option>
          <option>Lost</option>
        </select>
      </div>

      {/* Items Table */}
      <div className="hcc-inventory-table-panel">
        <div className="hcc-inventory-panel-heading"><h2>Inventory items</h2><span>{filteredItems.length} of {items.length} items</span></div>
        <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Collected Fee (Ksh)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? <tr><td colSpan="6" className="hcc-inventory-empty" role="status">Loading inventory...</td></tr> : filteredItems.length === 0 ? <tr><td colSpan="6" className="hcc-inventory-empty">{items.length ? "No items match your filters." : "No inventory items yet. Add an item to get started."}</td></tr> : filteredItems.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">

                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 max-w-70 truncate ">{item.name}</div>
                      <div className="text-sm text-gray-500 max-w-60 truncate ">{item.description}</div>
                    </div>
                  </div>
                </td>
                <td className="text-center text-gray-500">
                  {item.feesCollected.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-sm bg-orange-100 text-orange-800">
                    {item.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-sm ${item.status === "Available"
                      ? "bg-orange-100 text-orange-800"
                      : item.status === "Borrowed"
                        ? "bg-yellow-100 text-yellow-800"
                        : item.status === "Maintenance"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-100 text-red-800"
                      }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedItem(item)
                      setShowQuickViewModal(true)
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-3 cursor-pointer"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedItem(item)
                      setShowInventoryModal(true)
                    }}
                    className="text-yellow-600 hover:text-yellow-900 mr-3 cursor-pointer"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedItem(item)
                      setShowDeleteModal(true)
                    }}
                    className="text-red-600 hover:text-red-900 mr-3 cursor-pointer"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  {item.category === "Book" && (
                    <button
                      onClick={() => {
                        setSelectedItem(item)
                        setShowBorrowModal(true)
                      }}
                      className="text-orange-600 hover:text-orange-900 cursor-pointer"
                    >
                      <Book className="h-5 w-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>

      {/* Modals */}
      {showInventoryModal && (
        <InventoryModal
          item={selectedItem}
          onClose={() => setShowInventoryModal(false)}
          onSave={handleSave}
        />
      )}

      {showQuickViewModal && (
        <QuickViewModal
          item={selectedItem}
          onClose={() => setShowQuickViewModal(false)}
        />
      )}

      {showBorrowModal && (
        <BorrowBookModal
          book={selectedItem}
          onClose={() => setShowBorrowModal(false)}
          onBorrow={async (studentId, borrowingPeriod) => {
            try {
              setBorrowingBook(true)
              const response = await fetch(`${API_URL}/inventory/borrow`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ inventoryId: selectedItem._id, studentId, allowedDays: borrowingPeriod }),
              })
              const data = await response.json()
              if (!response.ok) {
                throw new Error(data.message || "Failed to update grades")
              }
              toast.success("Book borrowed successfully")
              fetchInventory()
              setShowBorrowModal(false)
            } catch (error) {
              toast.error(error.message)
            } finally {
              setBorrowingBook(false)
            }
          }}
          borrowingBook={borrowingBook}
        />
      )}

      {showReturnModal && (
        <ReturnBookModal
          book={selectedItem}
          onClose={() => setShowReturnModal(false)}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmationModal
          item={selectedItem}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => handleDelete(selectedItem._id)}
        />
      )}
    </div>
  )
}
