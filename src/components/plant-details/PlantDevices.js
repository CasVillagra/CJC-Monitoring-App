import React, { useState } from 'react';
import { Search, ChevronUp, ChevronDown, SlidersHorizontal } from 'lucide-react';
import clsx from 'clsx';

export function PlantDevices({ devices, plantName }) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredAndSortedDevices = React.useMemo(() => {
    return devices
      .filter(device => {
        const matchesSearch = 
          device.name.toLowerCase().includes(search.toLowerCase()) ||
          device.serial.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || 
          (statusFilter === 'active' && device.isActive) ||
          (statusFilter === 'inactive' && !device.isActive);
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortField === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else if (sortField === 'power') {
          comparison = parseInt(a.generatorPower) - parseInt(b.generatorPower);
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [devices, search, statusFilter, sortField, sortDirection]);

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search devices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <SlidersHorizontal className="h-5 w-5" />
            <span>Filters</span>
          </button>
        </div>

        {isFilterOpen && (
          <div className="mt-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">
                <button
                  onClick={() => {
                    if (sortField === 'name') {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('name');
                      setSortDirection('asc');
                    }
                  }}
                  className="flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900"
                >
                  Name
                  {sortField === 'name' ? (
                    sortDirection === 'asc' ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )
                  ) : (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => {
                    if (sortField === 'power') {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('power');
                      setSortDirection('asc');
                    }
                  }}
                  className="flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900"
                >
                  Power Rating
                  {sortField === 'power' ? (
                    sortDirection === 'asc' ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )
                  ) : (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </th>
              <th className="text-left p-4">Product ID</th>
              <th className="text-left p-4">Serial</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedDevices.map((device) => (
              <tr
                key={device.serial}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="p-4">
                  <div className={clsx(
                    'w-2.5 h-2.5 rounded-full',
                    device.isActive ? 'bg-green-500' : 'bg-red-500'
                  )} />
                </td>
                <td className="p-4">
                  <div className="font-medium text-gray-900">{device.name}</div>
                </td>
                <td className="p-4">
                  <span className="text-gray-900">
                    {(parseInt(device.generatorPower) / 1000).toFixed(1)} kW
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-gray-600">{device.productId}</span>
                </td>
                <td className="p-4">
                  <span className="text-gray-600">{device.serial}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAndSortedDevices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No devices found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}