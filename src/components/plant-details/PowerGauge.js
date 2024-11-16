import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip);

export function PowerGauge({ value, maxValue = 100 }) {
  // Convert value to percentage
  const percentage = (value / maxValue) * 100;
  const remaining = 100 - percentage;

  const data = {
    datasets: [
      {
        data: [percentage, remaining],
        backgroundColor: [
          'rgb(59, 130, 246)', // Blue for value
          'rgb(229, 231, 235)', // Light gray for remaining
        ],
        borderWidth: 0,
        circumference: 180, // Half circle
        rotation: 270, // Start from bottom
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    cutout: '85%',
  };

  return (
    <div className="relative h-48">
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex flex-col items-center justify-center mt-8">
        <div className="text-3xl font-bold text-gray-900">
          {Math.round(value)}
          <span className="text-xl font-normal text-gray-500"> / {maxValue}</span>
        </div>
        <span className="text-sm text-gray-500 mt-1">kW</span>
      </div>
    </div>
  );
}