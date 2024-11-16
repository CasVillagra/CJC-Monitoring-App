import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { CircleDot, Sun, Cloud, MapPin } from 'lucide-react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for the default marker icon
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

export function PlantInfo({ plantData }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const hasLocation = plantData?.location?.latitude && plantData?.location?.longitude;

  useEffect(() => {
    const fetchWeather = async () => {
      if (!hasLocation) return;

      try {
        setLoading(true);
        const response = await axios.get(
          `https://api.open-meteo.com/v1/forecast?` + 
          `latitude=${plantData.location.latitude}&` +
          `longitude=${plantData.location.longitude}&` +
          `hourly=temperature_2m&` +
          `temperature_unit=fahrenheit&` +
          `timezone=${encodeURIComponent(plantData.location.timezone || 'UTC')}`
        );

        const hourlyData = response.data.hourly;
        const currentHourIndex = new Date().getHours();
        const tomorrowSameHourIndex = currentHourIndex + 24;

        setWeather({
          current_temperature: hourlyData.temperature_2m[currentHourIndex],
          forecast_temperature: hourlyData.temperature_2m[tomorrowSameHourIndex],
        });
      } catch (error) {
        console.error('Error fetching weather:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [plantData, hasLocation]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Plant Details</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Plant Name:</span>
          <span className="font-medium">{plantData?.name || 'N/A'}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Status:</span>
          <div className="flex items-center gap-2">
            <CircleDot className={`h-4 w-4 ${
              plantData?.status === 'Ok' ? 'text-green-500' :
              plantData?.status === 'Unknown' ? 'text-yellow-500' : 'text-red-500'
            }`} />
            <span className="font-medium">{plantData?.status}</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Local Time:</span>
          <span className="font-medium">
            {new Date().toLocaleTimeString('en-US', { 
              timeZone: plantData?.location?.timezone || 'UTC' 
            })}
          </span>
        </div>

        {hasLocation && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Location:</span>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="font-medium">
                  {plantData.location.latitude.toFixed(6)}, {plantData.location.longitude.toFixed(6)}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-4">WEATHER</h3>
              {loading ? (
                <div className="text-center text-gray-500">Loading weather data...</div>
              ) : weather ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sun className="h-8 w-8 text-yellow-500" />
                      <div>
                        <div className="text-2xl font-bold">{Math.round(weather.current_temperature)}°F</div>
                        <div className="text-sm text-gray-600">currently</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Cloud className="h-8 w-8 text-gray-400" />
                      <div>
                        <div className="text-2xl font-bold">{Math.round(weather.forecast_temperature)}°F</div>
                        <div className="text-sm text-gray-600">Tomorrow</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">Weather data unavailable</div>
              )}
            </div>

            <div className="h-[200px] w-full rounded-lg overflow-hidden">
              <MapContainer
                center={[plantData.location.latitude, plantData.location.longitude]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[plantData.location.latitude, plantData.location.longitude]}>
                  <Popup>{plantData.name}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
