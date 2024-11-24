import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
import PlantDashboard from './pages/PlantDashboard';
import PlantDetails from './pages/PlantDetails';
import Devices from './pages/Devices';
import Benchmarks from './pages/Benchmarks';
import { Layout } from './components/Layout';

// Configure Amplify
Amplify.configure(awsExports);

export default function App() {
  return (
    <Authenticator
      components={{
        Header: () => (
          <div className="flex justify-center p-4 bg-white">
            <h1 className="text-2xl font-semibold text-gray-900">KW Toolbox</h1>
          </div>
        ),
      }}
      variation="modal"
      loginMechanisms={['email']}
      theme={{
        name: 'custom',
        tokens: {
          colors: {
            brand: {
              primary: {
                10: '#f0f9ff',
                20: '#e0f2fe',
                40: '#38bdf8',
                60: '#0284c7',
                80: '#075985',
                100: '#0c4a6e'
              }
            }
          },
          borderWidths: {
            small: '1px',
            medium: '2px',
            large: '4px'
          },
          radii: {
            small: '0.375rem',
            medium: '0.5rem',
            large: '0.75rem'
          },
          fonts: {
            default: {
              variable: 'Inter, system-ui, sans-serif',
              static: 'Inter, system-ui, sans-serif'
            }
          }
        }
      }}
    >
      {({ signOut, user }) => (
        <Router>
          <Layout signOut={signOut}>
            <Routes>
              <Route path="/" element={<PlantDashboard user={user} />} />
              <Route path="/plant/:plantId" element={<PlantDetails user={user} />} />
              <Route path="/devices" element={<Devices user={user} />} />
              <Route path="/benchmarks" element={<Benchmarks />} />
            </Routes>
          </Layout>
        </Router>
      )}
    </Authenticator>
  );
}