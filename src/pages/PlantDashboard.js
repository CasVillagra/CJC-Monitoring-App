import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Circle, AlertTriangle, XCircle, Search, ChevronUp, ChevronDown, SlidersHorizontal } from 'lucide-react';

const PlantDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('status');  // Changed default sort to status
  const [sortDirection, setSortDirection] = useState('asc');  // Changed default direction to desc
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const API_URL = 'https://49bgmmmqnk.execute-api.us-east-1.amazonaws.com/prod';

  // Status options for filtering
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'Ok', label: 'Online' },
    { value: 'Warning', label: 'Warning' },
    { value: 'CommunicationMonitoringFault', label: 'Communication Error' },
    { value: 'Error', label: 'Error' },
    { value: 'Unknown', label: 'Unknown' }
  ];

  // Status priority for sorting
  const statusPriority = {
    'Error': 1,
    'CommunicationMonitoringFault': 2,
    'Warning': 3,
    'Unknown': 4,
    'Ok': 5
  };

  // Fetch plants data
  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const response = await axios.get(`${API_URL}/plants`);
        console.log('Plants data:', response.data);

        const plantsData = typeof response.data === 'string' 
          ? JSON.parse(response.data) 
          : response.data;

        // Transform the data to match your component's needs
        const plantsWithDetails = plantsData.map(plant => ({
          id: plant.plantId,
          name: plant.name,
          description: plant.description,
          timezone: plant.timezone,
          status: plant.status || 'Unknown'
        }));

        setPlants(plantsWithDetails);
      } catch (error) {
        console.error('Error fetching plant data:', error);
        setPlants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  // Calculate status counts
  const statusCounts = useMemo(() => {
    return plants.reduce((acc, plant) => {
      acc[plant.status] = (acc[plant.status] || 0) + 1;
      return acc;
    }, {});
  }, [plants]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Ok':
        return <Circle className="h-4 w-4 text-green-500 fill-current" />;
      case 'Warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'CommunicationMonitoringFault':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'Error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'Unknown':
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Ok':
        return 'Online';
      case 'Warning':
        return 'Warning';
      case 'CommunicationMonitoringFault':
        return 'Communication Error';
      case 'Error':
        return 'Error';
      case 'Unknown':
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ok':
        return 'bg-green-50 hover:bg-green-100';
      case 'Warning':
        return 'bg-yellow-50 hover:bg-yellow-100';
      case 'CommunicationMonitoringFault':
        return 'bg-orange-50 hover:bg-orange-100';
      case 'Error':
        return 'bg-red-50 hover:bg-red-100';
      default:
        return 'hover:bg-gray-50';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'Ok':
        return 'text-green-700';
      case 'Warning':
        return 'text-yellow-700';
      case 'CommunicationMonitoringFault':
        return 'text-orange-700';
      case 'Error':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  const filteredAndSortedPlants = useMemo(() => {
    return plants
      .filter(plant => {
        const matchesSearch = plant.name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || plant.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortField === 'name') {
          return sortDirection === 'asc' 
            ? a.name.localeCompare(b.name) 
            : b.name.localeCompare(a.name);
        }
        if (sortField === 'status') {
          // Sort by status priority
          const priorityA = statusPriority[a.status] || 999;
          const priorityB = statusPriority[b.status] || 999;
          return sortDirection === 'asc'
            ? priorityA - priorityB
            : priorityB - priorityA;
        }
        return 0;
      });
  }, [plants, search, statusFilter, sortField, sortDirection, statusPriority]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Status Summary */}
      <div className="bg-white rounded-xl shadow-sm mb-6 p-4">
        <h2 className="text-lg font-semibold mb-3">Sites Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statusOptions.slice(1).map(option => (
            <div 
              key={option.value}
              className={`p-3 rounded-lg border ${option.value === 'Ok' ? 'border-green-200' : 'border-gray-200'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                {getStatusIcon(option.value)}
                <span className="text-sm font-medium">{option.label}</span>
              </div>
              <div className="text-2xl font-bold">
                {statusCounts[option.value] || 0}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm">
        {/* Search and Filters */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search plants..."
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
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
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
                      if (sortField === 'status') {
                        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortField('status');
                        setSortDirection('asc');
                      }
                    }}
                    className="flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900"
                  >
                    Status
                    {sortField === 'status' ? (
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
                <th className="text-left p-4">Timezone</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedPlants.map((plant) => (
                <tr
                  key={plant.id}
                  onClick={() => navigate(`/plant/${plant.id}`)}
                  className={`border-b border-gray-100 cursor-pointer ${getStatusColor(plant.status)}`}
                >
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{plant.name}</div>
                    {plant.description && (
                      <div className="text-sm text-gray-500">{plant.description}</div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(plant.status)}
                      <span className={`text-sm ${getStatusTextColor(plant.status)}`}>
                        {getStatusText(plant.status)}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-gray-600">{plant.timezone}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAndSortedPlants.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No plants found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlantDashboard;