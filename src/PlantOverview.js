import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Card, CardContent, Grid, Tabs, Tab, Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useParams } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIconPng from "leaflet/dist/images/marker-icon.png";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PlantsOverview = () => {
  const { plantId } = useParams();
  const [plantData, setPlantData] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0); // State to control the active tab

  const API_URL = `https://tl4uuazcjk.execute-api.us-east-1.amazonaws.com/prod/plants/${plantId}`;
  const WEATHER_API_KEY = 'e41a31fc92084fb9bb5103449242110';
  const WEATHER_API_BASE_URL = 'http://api.weatherapi.com/v1/current.json';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(API_URL, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // Parse the response body if it's a string
        const data = typeof response.data.body === 'string' 
          ? JSON.parse(response.data.body) 
          : response.data;
          
        setPlantData(data);
        
        // Fetch weather data if location exists
        if (data.location?.latitude && data.location?.longitude) {
          fetchWeather(data.location.latitude, data.location.longitude);
        }
      } catch (error) {
        console.error('Error fetching plant data:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchWeather = async (latitude, longitude) => {
      try {
        const response = await axios.get(
          `${WEATHER_API_BASE_URL}?key=${WEATHER_API_KEY}&q=${latitude},${longitude}`,
          { headers: { 'Content-Type': 'application/json' } }
        );
        setWeather(response.data);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    if (plantId) {
      fetchData();
    }
  }, [API_URL, plantId]);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const columns = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'generatorPower', headerName: 'Generator Power (W)', width: 200 },
    { field: 'isActive', headerName: 'Active', width: 100 },
    { field: 'product', headerName: 'Product', width: 200 },
    { field: 'productId', headerName: 'Product ID', width: 150 },
    { field: 'serial', headerName: 'Serial', width: 200 },
  ];

  const prepareChartData = (measurementData) => {
    if (!measurementData || !measurementData.set) {
      return {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: 'rgba(0, 99, 132, 0.6)',
        }],
      };
    }
  
    const currentYear = new Date().getFullYear();
  
    const filteredData = measurementData.set.filter((entry) => {
      const entryYear = new Date(entry.time).getFullYear();
      return entryYear === currentYear;
    });
  
    const getMonthLabel = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleString('default', { month: 'short' }).charAt(0);
    };
  
    return {
      labels: filteredData.map((entry) => getMonthLabel(entry.time)),
      datasets: [{
        data: filteredData.map((entry) => {
          const pvGeneration = entry.pvGeneration ? parseFloat(entry.pvGeneration) : 0;
          return pvGeneration; // Ensure raw values are in watts
        }),
        backgroundColor: 'rgba(0, 99, 132, 0.6)',
      }],
    };
  };
  

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false }, // Hides the legend
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            const value = context.raw; // Get the raw value from the dataset
            
            // Convert watts to kWh
            if (typeof value === 'number' && !isNaN(value)) {
              const kWhValue = value / 1000; // Convert to kWh
              return `${kWhValue.toFixed(2)} kWh`; // Format the value with 2 decimal places
            }
  
            // Fallback for invalid values
            return 'No data';
          },
        },
      },
    },
    scales: {
      x: {
        display: false, // Hides the x-axis labels
      },
      y: {
        display: false, // Keeps the y-axis visible (optional)
      },
    },
  };

  const thisYearChartOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      x: {
        display: true, // Show x-axis labels for the "This Year" graph
      },
    },
  };
  

  const getTotalPvGeneration = (data) => {
    if (!data || !data.set) return 0;
    
    // Log the data to debug if needed
    console.log('Data for PV Generation:', data);
    
    // Sum the pvGeneration values safely (handling potential null/undefined cases)
    return data.set.reduce((total, entry) => {
      const pvGeneration = entry.pvGeneration ? parseFloat(entry.pvGeneration) : 0;
      return total + pvGeneration;
    }, 0);
  };
  
  

  const markerIcon = new L.Icon({
    iconUrl: markerIconPng,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  if (loading || !plantData) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Plant Overview: {plantData.name}
      </Typography>

      {/* Tabs to switch between Overview and Devices */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabIndex} onChange={handleTabChange} aria-label="plant tabs">
          <Tab label="Overview" />
          <Tab label="Devices" />
        </Tabs>
      </Box>

      {/* Tab Panel for Overview */}
      {tabIndex === 0 && (
        <Box p={3}>
          <Grid container spacing={3}>
            {/* Plant Details Card */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Plant Details
                  </Typography>
                  <Typography variant="body1">Plant Name: {plantData.name || 'N/A'}</Typography>
                  <Typography variant="body1">Communication Status: {plantData.status || 'N/A'}</Typography>
                  <Typography variant="body1">
                    Local Time: {new Date().toLocaleTimeString('en-US', { 
                      timeZone: plantData.location?.timezone || 'UTC' 
                    })}
                  </Typography>
                  {weather && (
                    <>
                      <Typography variant="body1">Weather: {weather.current.condition.text}</Typography>
                      <Typography variant="body1">Temperature: {weather.current.temp_f}°F</Typography>
                    </>
                  )}
                  {plantData.location?.latitude && plantData.location?.longitude && (
                    <MapContainer
                      center={[plantData.location.latitude, plantData.location.longitude]}
                      zoom={13}
                      style={{ height: "200px", width: "100%", marginTop: "20px" }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker
                        position={[plantData.location.latitude, plantData.location.longitude]}
                        icon={markerIcon}
                      >
                        <Popup>{plantData.name}</Popup>
                      </Marker>
                    </MapContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Measurements Card */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Today
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                  Total PV Generation: {getTotalPvGeneration(plantData.measurements?.day) / 1000 / 4} kWh
                  </Typography>
                  <Bar
                    data={prepareChartData(plantData.measurements?.day)}
                    options={chartOptions}
                  />

                  <Typography variant="h6" style={{ marginTop: '20px' }}>
                    This Month
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Total PV Generation: {getTotalPvGeneration(plantData.measurements?.month) / 1000} kWh
                  </Typography>
                  <Bar
                    data={prepareChartData(plantData.measurements?.month)}
                    options={chartOptions}
                  />

                  <Typography variant="h6" style={{ marginTop: '20px' }}>
                      This Year
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      Total PV Generation: {getTotalPvGeneration(plantData.measurements?.year) / 1000} kWh
                    </Typography>
                    <Bar 
                      data={prepareChartData(plantData.measurements?.year)} 
                      options={thisYearChartOptions} 
                    />
                </CardContent>
              </Card>
            </Grid>

            {/* Devices Card - Still in Overview */}
            <Grid item xs={12} md={4}>
              <Card>
              <CardContent>
      <Typography variant="h5" gutterBottom>
        Devices
      </Typography>
      {plantData.devices && plantData.devices.length > 0 ? (
        <ul>
          {plantData.devices.map((device) => (
            <li key={device.deviceId || device.id}>
              <Typography variant="body1">{device.name}</Typography>
            </li>
          ))}
        </ul>
      ) : (
        <Typography variant="body1">No devices available</Typography>
      )}
    </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Tab Panel for Devices (with full devices list) */}
      {tabIndex === 1 && (
        <Box p={3}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Devices
              </Typography>
              <div style={{ height: 400, width: '100%' }}>
                <DataGrid 
                  rows={plantData.devices || []}
                  columns={columns}
                  pageSize={10}
                  getRowId={(row) => row.deviceId || row.id}
                  autoHeight
                />
              </div>
            </CardContent>
          </Card>
        </Box>
      )}
    </Container>
  );
};

export default PlantsOverview;
