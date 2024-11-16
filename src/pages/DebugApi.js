import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

function DebugApi({ user }) {
  const { plantId } = useParams();
  const navigate = useNavigate();
  const [rawResponse, setRawResponse] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use a test plant ID if none provided
        const testPlantId = plantId || '1';
        
        const response = await axios.get(
          `https://tl4uuazcjk.execute-api.us-east-1.amazonaws.com/prod/plants/${testPlantId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              ...(user?.signInUserSession?.accessToken?.jwtToken && {
                'Authorization': `Bearer ${user.signInUserSession.accessToken.jwtToken}`
              })
            },
          }
        );

        // Store the raw response
        setRawResponse(response.data);

        // Attempt to parse the body if it's a string
        try {
          const parsed = typeof response.data.body === 'string'
            ? JSON.parse(response.data.body)
            : response.data.body;
          setParsedData(parsed);
        } catch (parseError) {
          setError(`Parse error: ${parseError.message}`);
        }
      } catch (error) {
        setError(`Fetch error: ${error.message}`);
      }
    };

    fetchData();
  }, [plantId, user]);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold">API Debug View</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">Raw Response</h2>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-[400px]">
              <pre className="text-sm">
                {JSON.stringify(rawResponse, null, 2)}
              </pre>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Parsed Data</h2>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-[400px]">
              <pre className="text-sm">
                {JSON.stringify(parsedData, null, 2)}
              </pre>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Data Structure Analysis</h2>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <ul className="space-y-2">
                <li>
                  <strong>Response Type: </strong>
                  {typeof rawResponse}
                </li>
                <li>
                  <strong>Has Body: </strong>
                  {rawResponse?.body ? 'Yes' : 'No'}
                </li>
                <li>
                  <strong>Body Type: </strong>
                  {typeof rawResponse?.body}
                </li>
                <li>
                  <strong>Required Fields Present: </strong>
                  {parsedData ? (
                    <ul className="ml-4 mt-2 space-y-1">
                      <li>id: {parsedData.id ? '✅' : '❌'}</li>
                      <li>name: {parsedData.name ? '✅' : '❌'}</li>
                      <li>devices: {parsedData.devices ? '✅' : '❌'}</li>
                      <li>measurements: {parsedData.measurements ? '✅' : '❌'}</li>
                    </ul>
                  ) : 'Unable to check fields'}
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default DebugApi;