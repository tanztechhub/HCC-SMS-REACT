export default function DeleteConfirmationModal({ item, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-orange-700/25 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <div className="">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Item</h3>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete "<span className="font-bold">{item.name}</span>"? This action cannot be undone.
          </p>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
