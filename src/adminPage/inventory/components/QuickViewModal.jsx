import { User } from "lucide-react"
import { format, addDays } from "date-fns";

export default function QuickViewModal({ item, onClose }) {
  if (!item) return null

  return (
    <div className="fixed inset-0 bg-orange-800/25 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full h-[90%] overflow-y-scroll">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Item Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 cursor-pointer">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="aspect-w-16 aspect-h-9 mb-4 flex justify-center">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-48 h-48 rounded-full object-cover"
              />
            ) : (
              <div className="w-45 h-45 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-40 h-40 text-gray-400" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="text-sm text-gray-900">{item.name}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Category</p>
              <p className="text-sm text-gray-900">{item.category}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p className="text-sm text-gray-900">{item.status}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Quantity</p>
              <p className="text-sm text-gray-900">{item.quantity}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Purchase Price</p>
              <p className="text-sm text-gray-900">{item.purchasePrice}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Current Price</p>
              <p className="text-sm text-gray-900">{item.estimatedCurrentPrice}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Date Purchased</p>
              <p className="text-sm text-gray-900">
                {item.datePurchased ? new Date(item.datePurchased).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Description</p>
            <p className="text-sm text-gray-900 mt-1">{item.description}</p>
          </div>

          {item.borrowedBy && item.borrowedBy.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-500">Currently Borrowed By:</p>
              {item.borrowedBy.map((book) => {
                // Directly create Date object from the dateBorrowed string
                const dateBorrowed = book.dateBorrowed
                  ? new Date(book.dateBorrowed)
                  : null;

                const dueDate = dateBorrowed
                  ? addDays(dateBorrowed, book.allowedDays)
                  : null;

                return (
                  <div key={book._id} className="mb-2 border p-2 border-gray-300 mt-2">
                    <p className="text-sm text-gray-900">Student Adm: {book.studentAdm}</p>
                    <p className="text-sm text-gray-500">
                      Date Borrowed: {dateBorrowed ? format(dateBorrowed, "PPP p") : "N/A"}
                    </p>
                    <p className="text-sm text-gray-500">Allowed Days: {book.allowedDays}</p>
                    <p className="text-sm text-gray-500 font-semibold">
                      Due Date: {dueDate ? format(dueDate, "PPP p") : "N/A"}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-md cursor-pointer hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
