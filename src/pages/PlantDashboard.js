import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Circle, AlertTriangle, XCircle, Search, ChevronUp, ChevronDown, SlidersHorizontal } from 'lucide-react';
import clsx from 'clsx';

const PlantDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const API_URL = 'https://tl4uuazcjk.execute-api.us-east-1.amazonaws.com/prod/plants';

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const response = await axios.get(API_URL, {
          headers: {
            'Content-Type': 'application/json',
            ...(user?.signInUserSession?.accessToken?.jwtToken && {
              'Authorization': `Bearer ${user.signInUserSession.accessToken.jwtToken}`
            })
          },
        });
        
        const bodyData = JSON.parse(response.data.body);
        console.log('Parsed plants data:', bodyData.plants);
        
        if (bodyData && bodyData.plants) {
          setPlants(bodyData.plants);
        }
      } catch (error) {
        console.error('Error fetching plant data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, [user]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Ok':
        return <Circle className="h-4 w-4 text-green-500 fill-current" />;
      case 'Unknown':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'Error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const filteredAndSortedPlants = React.useMemo(() => {
    return plants
      .filter(plant => {
        const matchesSearch = plant.name.toLowerCase().includes(search.toLowerCase()) ||
          plant.timezone.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || plant.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortField === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else if (sortField === 'status') {
          comparison = a.status.localeCompare(b.status);
        } else if (sortField === 'timezone') {
          comparison = a.timezone.localeCompare(b.timezone);
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [plants, search, statusFilter, sortField, sortDirection]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm mb-6">
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
                <option value="all">All Status</option>
                <option value="Ok">Online</option>
                <option value="Unknown">Unknown</option>
                <option value="Error">Error</option>
              </select>
            </div>
          )}
        </div>

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
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Timezone</th>
                <th className="text-left p-4">Performance</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedPlants.map((plant) => (
                <tr
                  key={plant.id}
                  onClick={() => navigate(`/plant/${plant.id}`)}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                >
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{plant.name}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(plant.status)}
                      <span className={clsx(
                        'text-sm',
                        plant.status === 'Ok' && 'text-green-700',
                        plant.status === 'Unknown' && 'text-yellow-700',
                        plant.status === 'Error' && 'text-red-700'
                      )}>
                        {plant.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-600">{plant.timezone}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className={clsx(
                        'w-2.5 h-2.5 rounded-full',
                        plant.underperforming ? 'bg-red-500' : 'bg-green-500'
                      )} />
                      <span className="text-sm text-gray-600">
                        {plant.underperforming ? 'Below Target' : 'On Target'}
                      </span>
                    </div>
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