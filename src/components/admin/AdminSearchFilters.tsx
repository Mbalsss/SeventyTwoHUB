import React from 'react';
import { Search, Filter, SortAsc, SortDesc, X } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface AdminSearchFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters: {
    [key: string]: {
      value: string;
      options: FilterOption[];
      label: string;
    };
  };
  onFilterChange: (filterKey: string, value: string) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (sortBy: string, order: 'asc' | 'desc') => void;
  onClearFilters: () => void;
  resultCount: number;
  totalCount: number;
}

const AdminSearchFilters: React.FC<AdminSearchFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  sortBy,
  sortOrder,
  onSortChange,
  onClearFilters,
  resultCount,
  totalCount
}) => {
  const hasActiveFilters = searchTerm || Object.values(filters).some(filter => filter.value !== 'all');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(filters).map(([key, filter]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {filter.label}
            </label>
            <select
              value={filter.value}
              onChange={(e) => onFilterChange(key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            >
              {filter.options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                  {option.count !== undefined && ` (${option.count})`}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Sort Options */}
        {onSortChange && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value, sortOrder || 'desc')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                <option value="created_at">Date Created</option>
                <option value="updated_at">Last Updated</option>
                <option value="full_name">Name</option>
                <option value="email">Email</option>
              </select>
              <button
                onClick={() => onSortChange(sortBy || 'created_at', sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              >
                {sortOrder === 'asc' ? (
                  <SortAsc className="w-4 h-4 text-gray-600" />
                ) : (
                  <SortDesc className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary and Clear Filters */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Showing {resultCount.toLocaleString()} of {totalCount.toLocaleString()} results
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <X className="w-3 h-3" />
            <span>Clear filters</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminSearchFilters;