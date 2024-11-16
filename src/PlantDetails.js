import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useParams } from 'react-router-dom';

const PlantDetails = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { plantId } = useParams();

  // Updated API URL for fetching devices of a plant
  const API_URL = `https://zam00r335e.execute-api.us-east-1.amazonaws.com/prod/plants/${plantId}/devices`;

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await axios.get(API_URL, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        setDevices(response.data.devices);
      } catch (error) {
        console.error('Error fetching devices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [API_URL]);

  // Define columns for the MUI DataGrid
  const columns = [
    { field: 'deviceId', headerName: 'Device ID', width: 150 },
    { field: 'name', headerName: 'Device Name', width: 200 },
    { field: 'type', headerName: 'Type', width: 200 },
    { field: 'vendor', headerName: 'Vendor', width: 200 },
  ];

  // Assign 'id' for each row in MUI DataGrid
  const rows = devices.map((device, index) => ({
    id: index,
    ...device,
  }));

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Devices for Plant {plantId}
      </Typography>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <div style={{ height: 600, width: '100%' }}>
          <DataGrid rows={rows} columns={columns} pageSize={10} />
        </div>
      )}
    </Container>
  );
};

export default PlantDetails;
