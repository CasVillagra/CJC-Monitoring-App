import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
import PlantDashboard from './pages/PlantDashboard';
import PlantDetails from './pages/PlantDetails';
import Benchmarks from './pages/Benchmarks';
import { Layout } from './components/Layout';

// Configure Amplify
Amplify.configure(awsExports);

export default function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <Router>
          <Layout signOut={signOut}>
            <Routes>
              <Route path="/" element={<PlantDashboard user={user} />} />
              <Route path="/plant/:plantId" element={<PlantDetails user={user} />} />
              <Route path="/benchmarks" element={<Benchmarks />} />
            </Routes>
          </Layout>
        </Router>
      )}
    </Authenticator>
  );
}