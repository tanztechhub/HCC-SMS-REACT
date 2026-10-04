import { X } from "lucide-react"

export default function DeleteConfirmationModal({ admin, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-orange-800/25 z-50 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Delete Admin</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 cursor-pointer">
            <X className="h-6 w-6" />
          </button>
        </div>
        <p className="mb-2">
          Are you sure you want to delete the admin account for <span className="font-bold text-amber-600">{admin.username}</span> ?
        </p>
        <div className="bg-red-600/30 text-red-600 font-bold p-2 mb-6 rounded-md">
        <span>This will delete the user from the Database and it cannot be undone!</span>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

