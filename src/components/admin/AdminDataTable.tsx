import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
  width?: string;
}

interface AdminDataTableProps {
  data: any[];
  columns: Column[];
  onRowClick?: (row: any) => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onView?: (row: any) => void;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  loading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
  emptyState?: {
    icon: React.ReactNode;
    title: string;
    description: string;
    action?: React.ReactNode;
  };
}

const AdminDataTable: React.FC<AdminDataTableProps> = ({
  data,
  columns,
  onRowClick,
  onEdit,
  onDelete,
  onView,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  loading = false,
  pagination,
  emptyState
}) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (columnKey: string) => {
    if (!columns.find(col => col.key === columnKey)?.sortable) return;

    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    
    const allSelected = data.every(row => selectedRows.includes(row.id));
    if (allSelected) {
      onSelectionChange(selectedRows.filter(id => !data.find(row => row.id === id)));
    } else {
      onSelectionChange([...new Set([...selectedRows, ...data.map(row => row.id)])]);
    }
  };

  const handleRowSelect = (rowId: string) => {
    if (!onSelectionChange) return;
    
    if (selectedRows.includes(rowId)) {
      onSelectionChange(selectedRows.filter(id => id !== rowId));
    } else {
      onSelectionChange([...selectedRows, rowId]);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center">
          {emptyState.icon}
          <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyState.title}</h3>
          <p className="text-gray-600 mb-4">{emptyState.description}</p>
          {emptyState.action}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {selectable && (
                <th className="px-4 py-3 text-left w-12">
                  <input
                    type="checkbox"
                    checked={data.length > 0 && data.every(row => selectedRows.includes(row.id))}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </th>
              )}
              
              {columns.map(column => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  } ${column.width || ''}`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && sortColumn === column.key && (
                      <span className="text-primary-500">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              
              {(onEdit || onDelete || onView) && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr
                key={row.id || index}
                className={`hover:bg-gray-50 transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
                onClick={() => onRowClick?.(row)}
              >
                {selectable && (
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleRowSelect(row.id);
                      }}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </td>
                )}
                
                {columns.map(column => (
                  <td key={column.key} className="px-4 py-4 text-sm">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
                
                {(onEdit || onDelete || onView) && (
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      {onView && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onView(row);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      
                      {onEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(row);
                          }}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(row);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
              {pagination.totalItems} results
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => pagination.onPageChange(Math.max(1, pagination.currentPage - 1))}
                disabled={pagination.currentPage === 1}
                className="flex items-center space-x-1 px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i + 1;
                  const isActive = page === pagination.currentPage;
                  
                  return (
                    <button
                      key={page}
                      onClick={() => pagination.onPageChange(page)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        isActive
                          ? 'bg-primary-500 text-white'
                          : 'border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => pagination.onPageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                disabled={pagination.currentPage === pagination.totalPages}
                className="flex items-center space-x-1 px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDataTable;