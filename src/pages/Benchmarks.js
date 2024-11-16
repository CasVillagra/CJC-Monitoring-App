import React, { useState, useEffect } from 'react';
import { Download, Upload, Plus, Save, Trash2, AlertTriangle, X } from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const PREDEFINED_SITES = [
  'McCaslin North',
  'McCaslin South',
  'Beech Ranch',
  'Mayer Ranch',
  'RBG #1',
  'RBG #3',
  '58 ranch',
  'Sullivan Ranch'
];

function Benchmarks() {
  const [sites, setSites] = useState([]);
  const [monthlyBenchmarks, setMonthlyBenchmarks] = useState({});
  const [dailyBenchmarks, setDailyBenchmarks] = useState({});
  const [showSiteForm, setShowSiteForm] = useState(false);
  const [selectedSite, setSelectedSite] = useState('');
  const [editingSite, setEditingSite] = useState(null);
  const [monthlyValues, setMonthlyValues] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState(null);

  // Load saved benchmarks from localStorage on component mount
  useEffect(() => {
    const savedBenchmarks = localStorage.getItem('solarBenchmarks');
    if (savedBenchmarks) {
      const { sites, monthly, daily } = JSON.parse(savedBenchmarks);
      setSites(sites);
      setMonthlyBenchmarks(monthly);
      setDailyBenchmarks(daily);
    }
  }, []);

  const calculateDailyBenchmark = (monthlyValue, monthIndex) => {
    const days = DAYS_IN_MONTH[monthIndex];
    return monthlyValue / days;
  };

  const updateDailyBenchmarks = (siteId, monthlyData) => {
    const daily = {};
    Object.entries(monthlyData).forEach(([month, value]) => {
      const monthIndex = parseInt(month) - 1;
      daily[month] = {
        expectedGeneration: value,
        daysInMonth: DAYS_IN_MONTH[monthIndex],
        dailyBenchmark: calculateDailyBenchmark(value, monthIndex)
      };
    });
    return daily;
  };

  const handleEditSite = (site) => {
    setEditingSite(site);
    setMonthlyValues(monthlyBenchmarks[site.id] || {});
    setShowSiteForm(true);
  };

  const handleAddNewSite = () => {
    if (!selectedSite) return;
    
    const newSiteId = `site-${Date.now()}`;
    const newSite = { id: newSiteId, name: selectedSite };
    
    setSites(prev => [...prev, newSite]);
    setEditingSite(newSite);
    setMonthlyValues({});
    setShowSiteForm(true);
  };

  const handleSaveSiteBenchmarks = () => {
    const siteId = editingSite.id;
    
    setMonthlyBenchmarks(prev => ({
      ...prev,
      [siteId]: monthlyValues
    }));

    setDailyBenchmarks(prev => ({
      ...prev,
      [siteId]: updateDailyBenchmarks(siteId, monthlyValues)
    }));

    // Save to localStorage
    const data = {
      sites,
      monthly: {
        ...monthlyBenchmarks,
        [siteId]: monthlyValues
      },
      daily: {
        ...dailyBenchmarks,
        [siteId]: updateDailyBenchmarks(siteId, monthlyValues)
      }
    };
    localStorage.setItem('solarBenchmarks', JSON.stringify(data));

    // Reset form
    setShowSiteForm(false);
    setEditingSite(null);
    setMonthlyValues({});
    setSelectedSite('');
  };

  const handleDeleteClick = (site) => {
    setSiteToDelete(site);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (siteToDelete) {
      setSites(prev => prev.filter(site => site.id !== siteToDelete.id));
      setMonthlyBenchmarks(prev => {
        const { [siteToDelete.id]: removed, ...rest } = prev;
        return rest;
      });
      setDailyBenchmarks(prev => {
        const { [siteToDelete.id]: removed, ...rest } = prev;
        return rest;
      });

      // Save to localStorage
      const data = {
        sites: sites.filter(site => site.id !== siteToDelete.id),
        monthly: monthlyBenchmarks,
        daily: dailyBenchmarks
      };
      localStorage.setItem('solarBenchmarks', JSON.stringify(data));
    }
    setShowDeleteModal(false);
    setSiteToDelete(null);
  };

  const exportToCSV = () => {
    const header = ['Month', ...sites.map(site => site.name)].join(',');
    const rows = MONTHS.map((month, i) => {
      const monthNum = i + 1;
      const values = sites.map(site => 
        monthlyBenchmarks[site.id]?.[monthNum]?.toLocaleString() || ''
      );
      return [month, ...values].join(',');
    });
    
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'solar-benchmarks.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">BENCHMARKS</h1>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a site...</option>
                {PREDEFINED_SITES
                  .filter(site => !sites.some(s => s.name === site))
                  .map(site => (
                    <option key={site} value={site}>{site}</option>
                  ))
                }
              </select>
              <button
                onClick={handleAddNewSite}
                disabled={!selectedSite}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
              >
                <Plus className="h-5 w-5" />
                <span>Add Site</span>
              </button>
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="h-5 w-5" />
              <span>Export CSV</span>
            </button>
          </div>
        </header>

        {/* Site Form Modal */}
        {showSiteForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">
                  {editingSite ? `Edit Benchmarks: ${editingSite.name}` : 'Add New Site Benchmarks'}
                </h3>
                <button
                  onClick={() => setShowSiteForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                {MONTHS.map((month, i) => {
                  const monthNum = i + 1;
                  return (
                    <div key={month} className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {month}
                      </label>
                      <input
                        type="number"
                        value={monthlyValues[monthNum] || ''}
                        onChange={(e) => setMonthlyValues(prev => ({
                          ...prev,
                          [monthNum]: parseFloat(e.target.value) || 0
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter kWh"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowSiteForm(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSiteBenchmarks}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Save Benchmarks
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sites Table */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Site Benchmarks</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">Site</th>
                    {MONTHS.map(month => (
                      <th key={month} className="text-left py-3 px-4">{month}</th>
                    ))}
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sites.map(site => (
                    <tr key={site.id} className="border-b border-gray-200">
                      <td className="py-3 px-4 font-medium">{site.name}</td>
                      {MONTHS.map((month, i) => {
                        const monthNum = i + 1;
                        return (
                          <td key={month} className="py-3 px-4">
                            {monthlyBenchmarks[site.id]?.[monthNum]?.toLocaleString() || '-'} kWh
                          </td>
                        );
                      })}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditSite(site)}
                            className="text-blue-500 hover:text-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(site)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {sites.length === 0 && (
                    <tr>
                      <td colSpan={14} className="py-8 text-center text-gray-500">
                        No sites added yet. Select a site from the dropdown above to add benchmarks.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Daily Benchmarks Table */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Benchmarks</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">Site</th>
                    <th className="text-left py-3 px-4">Month</th>
                    <th className="text-left py-3 px-4">Expected Generation</th>
                    <th className="text-left py-3 px-4">Days in Month</th>
                    <th className="text-left py-3 px-4">Daily Benchmark</th>
                  </tr>
                </thead>
                <tbody>
                  {sites.map(site => (
                    MONTHS.map((month, i) => {
                      const monthNum = i + 1;
                      const benchmark = dailyBenchmarks[site.id]?.[monthNum];
                      if (!benchmark) return null;

                      return (
                        <tr key={`${site.id}-${monthNum}`} className="border-b border-gray-200">
                          <td className="py-3 px-4">{site.name}</td>
                          <td className="py-3 px-4">{month}</td>
                          <td className="py-3 px-4">
                            {benchmark.expectedGeneration.toLocaleString()} kWh
                          </td>
                          <td className="py-3 px-4">{benchmark.daysInMonth}</td>
                          <td className="py-3 px-4">
                            {benchmark.dailyBenchmark.toFixed(2)} kWh
                          </td>
                        </tr>
                      );
                    })
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                <h3 className="text-lg font-semibold">Delete Site</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete {siteToDelete?.name}? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Benchmarks;