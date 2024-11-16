import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
import PlantDashboard from './PlantDashboard';
import PlantOverview from './PlantOverview';
import AdminOnboarding from './AdminOnboarding';

// Configure Amplify with the aws-exports file
Amplify.configure(awsExports);

export default function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <Router>
          <div>
            <button onClick={signOut} style={{ position: 'absolute', top: 10, right: 10 }}>
              Sign Out
            </button>
            <Routes>
              <Route path="/" element={<PlantDashboard user={user} />} />
              <Route path="/plant/:plantId" element={<PlantOverview user={user} />} />
              <Route path="/onboarding" element={<AdminOnboarding user={user} />} />
            </Routes>
          </div>
        </Router>
      )}
    </Authenticator>
  );
}
