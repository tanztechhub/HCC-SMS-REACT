import { Plus } from "lucide-react"

export default function ToDo() {
  return (
    <div className="bg-white m-6 p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">To Do List</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
          <Plus className="h-5 w-5" />
          ADD
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <button className="px-4 py-2 bg-purple-500 text-white rounded-lg">INCOMPLETE</button>
        <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">COMPLETED</button>
      </div>

      <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg">
        <p className="text-gray-500">No Do Lists Assigned Yet</p>
      </div>
    </div>
  )
}

