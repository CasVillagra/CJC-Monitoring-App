import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PlantInfo } from '../components/plant-details/PlantInfo';
import { GenerationStats } from '../components/plant-details/GenerationStats';
import { DevicesList } from '../components/plant-details/DevicesList';
import { DownloadButton } from '../components/plant-details/DownloadButton';
import { PlantDevices } from '../components/plant-details/PlantDevices';

function PlantDetails() {
  const { plantId } = useParams();
  const navigate = useNavigate();
  const [plantData, setPlantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchPlantData = async () => {
      if (!plantId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `https://tl4uuazcjk.execute-api.us-east-1.amazonaws.com/prod/plants/${plantId}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        // The response is already an object, no need to parse
        const data = response.data;

        // Validate the required fields
        if (!data.name || !data.devices || !data.measurements) {
          throw new Error('Missing required plant data fields');
        }

        setPlantData(data);
      } catch (error) {
        console.error('Error fetching plant data:', error);
        setError(error.message || 'Failed to load plant data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlantData();

    // Cleanup function
    return () => {
      setPlantData(null);
      setError(null);
    };
  }, [plantId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <span className="text-gray-600">Loading plant details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Sites</span>
          </button>
        </div>
      </div>
    );
  }

  if (!plantData) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-gray-600">
            No data available for this plant
          </div>
          <button
            onClick={() => navigate('/')}
            className="mt-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Sites</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Sites</span>
          </button>
          <DownloadButton plantData={plantData} measurements={plantData.measurements} />
        </div>

        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">PLANT DETAILS</h1>
          <div className="text-2xl font-bold text-gray-900">KW TOOLBOX</div>
        </header>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('devices')}
              className={`${
                activeTab === 'devices'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium`}
            >
              Devices
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <PlantInfo plantData={plantData} />
            <GenerationStats measurements={plantData.measurements} />
            <DevicesList devices={plantData.devices} />
          </div>
        ) : (
          <PlantDevices devices={plantData.devices} plantName={plantData.name} />
        )}
      </div>
    </div>
  );
}

export default PlantDetails;