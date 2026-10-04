import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

const StudentFeeFilter = ({ onFilterChange, courseWiseFeeData }) => {
    const [filters, setFilters] = useState({
      paymentStatus: 'all',
      feeRange: 'all',
      course: 'all',
      searchTerm: '',
    });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters = {
      paymentStatus: 'all',
      feeRange: 'all',
      course: 'all',
      searchTerm: '',
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filter Students
        </h2>
        {Object.values(filters).some(value => value !== 'all' && value !== '') && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or admission number..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <select
          value={filters.paymentStatus}
          onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
          className="px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">All Payment Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overpaid">Overpaid</option>
        </select>

        <select
          value={filters.feeRange}
          onChange={(e) => handleFilterChange('feeRange', e.target.value)}
          className="px-3 py-2 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-300"
        >
          <option value="all">All Fee Ranges</option>
          <option value="0-10000">KES 0 - 10,000</option>
          <option value="10000-30000">KES 10,000 - 30,000</option>
          <option value="30000-50000">KES 30,000 - 50,000</option>
          <option value="50000+">KES 50,000+</option>
        </select>

        <select
          value={filters.course}
          onChange={(e) => handleFilterChange('course', e.target.value)}
          className="px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
        >
          <option value="all">All Courses</option>
          {courseWiseFeeData.map((course) => (
            <option key={course.name} value={course.name}>
              {course.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default StudentFeeFilter;