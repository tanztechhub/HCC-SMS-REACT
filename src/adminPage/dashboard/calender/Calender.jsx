import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

export default function Calendar() {
  // Sample data for February 2025
  const weeks = [
    ["28", "27", "28", "29", "30", "31", "1"],
    ["2", "3", "4", "5", "6", "7", "8"],
    ["9", "10", "11", "12", "13", "14", "15"],
    ["16", "17", "18", "19", "20", "21", "22"],
    ["23", "24", "25", "26", "27", "28", "1"],
  ]

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm m-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {/* Navigation Buttons */}
            <div className="flex items-center gap-1">
              <button className="p-1 hover:bg-gray-100 rounded">
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <ChevronRight className="h-4 w-4" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>

            <button className="px-3 py-1 text-sm bg-[#cc4400]/10 text-[#cc4400] rounded-md hover:bg-[#cc4400]/20">
              Today
            </button>
          </div>

          <h2 className="text-xl font-semibold">February 2025</h2>

          <div className="flex items-center gap-2">
            <button className="px-4 py-1 bg-[#cc4400] text-white rounded-md">Month</button>
            <button className="px-4 py-1 hover:bg-gray-100 rounded-md">Week</button>
            <button className="px-4 py-1 hover:bg-gray-100 rounded-md">Day</button>
            <button className="px-4 py-1 hover:bg-gray-100 rounded-md">List</button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="border rounded-lg">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b">
            {daysOfWeek.map((day) => (
              <div key={day} className="py-2 text-center text-sm font-medium text-gray-600">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="divide-y">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 divide-x">
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`h-24 p-2 ${
                      day === "3" ? "bg-purple-500 text-white" : ""
                    } hover:bg-gray-50 transition-colors`}
                  >
                    <span className="text-sm">{day}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

