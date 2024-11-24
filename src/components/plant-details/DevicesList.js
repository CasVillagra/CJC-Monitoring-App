import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export function DevicesList({ devices }) {
  const navigate = useNavigate();
  const { plantId } = useParams();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Devices</h2>
        <button
          onClick={() => navigate(`/plant/${plantId}/devices`)}
          className="text-blue-500 hover:text-blue-600 text-sm"
        >
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {devices && devices.length > 0 ? (
          devices.slice(0, 5).map((device) => (
            <div 
              key={device.deviceId || device.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <div className="font-medium text-gray-900">{device.name}</div>
                <div className="text-sm text-gray-500">SN: {device.serial}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className={`h-2.5 w-2.5 rounded-full ${
                  device.isActive ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <div className="flex items-center gap-2">
                  {device.isActive ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-sm font-medium">
                    {(parseInt(device.generatorPower) / 1000).toFixed(1)} kW
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">No devices available</div>
        )}
      </div>

      {devices?.length > 5 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate(`/plant/${plantId}/devices`)}
            className="text-blue-500 hover:text-blue-600 text-sm"
          >
            View {devices.length - 5} more devices
          </button>
        </div>
      )}
    </div>
  );
}