import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';

const PlantDashboard = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = 'https://tl4uuazcjk.execute-api.us-east-1.amazonaws.com/prod/plants';

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const response = await axios.get(API_URL, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        // Parse the body string into an object
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
  }, []);

  const columns = [
    { 
      field: 'name', 
      headerName: 'Plant Name', 
      width: 300,
    },
    { 
      field: 'timezone', 
      headerName: 'Timezone', 
      width: 200
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 150,
      renderCell: (params) => (
        <div style={{
          color: params.row.status === 'Ok' ? 'green' : 
                 params.row.status === 'Unknown' ? 'orange' : 'red'
        }}>
          {params.row.status || 'Unknown'}
        </div>
      )
    },
    {
      field: 'underperforming',
      headerName: 'Performance',
      width: 150,
      renderCell: (params) => (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px' 
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: params.row.underperforming ? '#22c55e' : '#ef4444',
            marginRight: '8px'
          }}/>
          {params.row.underperforming ? 'On Target' : 'Below Target'}
        </div>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(`/plant/${params.row.id}`)}
        >
          View Devices
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Plant Data Dashboard
      </Typography>

      <div style={{ height: 600, width: '100%' }}>
        <DataGrid 
          rows={plants}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 25]}
          getRowId={(row) => row.id}
          disableSelectionOnClick
          autoHeight
        />
      </div>
    </Container>
  );
};

export default PlantDashboard;