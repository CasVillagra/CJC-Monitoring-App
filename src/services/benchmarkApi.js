// src/services/benchmarkApi.js
import axios from 'axios';

const API_URL = 'https://your-api-gateway-url/prod/benchmarks';

export const benchmarkApi = {
  async getBenchmarks() {
    const response = await axios.get(API_URL);
    return response.data.benchmarks;
  },

  async saveBenchmark(siteId, siteName, benchmarkData) {
    const response = await axios.post(API_URL, {
      siteId,
      siteName,
      benchmarkData: {
        monthly: benchmarkData,
        daily: calculateDailyBenchmarks(benchmarkData)
      }
    });
    return response.data;
  },

  async deleteBenchmark(siteId) {
    const response = await axios.delete(`${API_URL}/${siteId}`);
    return response.data;
  }
};

function calculateDailyBenchmarks(monthlyData) {
  const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const daily = {};
  
  Object.entries(monthlyData).forEach(([month, value]) => {
    const monthIndex = parseInt(month) - 1;
    daily[month] = {
      expectedGeneration: value,
      daysInMonth: DAYS_IN_MONTH[monthIndex],
      dailyBenchmark: value / DAYS_IN_MONTH[monthIndex]
    };
  });
  
  return daily;
}
