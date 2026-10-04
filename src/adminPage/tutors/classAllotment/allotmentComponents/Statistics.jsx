export default function Statistics({ stats }) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Statistics</h2>
        <div className="text-3xl font-bold text-blue-600">{stats.unassignedCount} Unassigned Students</div>
      </div>
    )
  }
  
  