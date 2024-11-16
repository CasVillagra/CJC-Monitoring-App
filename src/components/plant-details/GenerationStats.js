import React, { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { PowerGauge } from './PowerGauge';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export const chartRefs = {
  dayChart: null,
  monthChart: null,
  yearChart: null
};

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      display: false,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
        drawTicks: false,
      },
    },
  },
};

export function GenerationStats({ measurements }) {
  const dayChartRef = useRef(null);
  const monthChartRef = useRef(null);
  const yearChartRef = useRef(null);

  React.useEffect(() => {
    // Update chart refs for PDF generation
    chartRefs.dayChart = dayChartRef.current;
    chartRefs.monthChart = monthChartRef.current;
    chartRefs.yearChart = yearChartRef.current;
  }, [dayChartRef.current, monthChartRef.current, yearChartRef.current]);

  const getCurrentPower = () => {
    if (!measurements?.day?.set || measurements.day.set.length === 0) {
      return 0;
    }
    
    const latestReading = measurements.day.set[measurements.day.set.length - 1];
    return parseFloat(latestReading.pvGeneration) / 1000;
  };

  const formatChartData = (data, type) => {
    if (!data?.set) return null;

    const chartData = data.set.map(item => {
      const date = new Date(item.time);
      let label;
      
      switch (type) {
        case 'day':
          label = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            hour12: true,
          });
          break;
        case 'month':
          label = date.getDate().toString();
          break;
        case 'year':
          label = date.toLocaleString('default', { month: 'short' });
          break;
        default:
          label = '';
      }

      return {
        x: label,
        y: parseFloat(item.pvGeneration),
        fullDate: date
      };
    });

    const datasets = [{
      data: chartData.map(item => item.y),
      fullDates: chartData.map(item => item.fullDate)
    }];

    if (type === 'day') {
      datasets[0].borderColor = 'rgb(59, 130, 246)';
      datasets[0].backgroundColor = 'rgba(59, 130, 246, 0.1)';
      datasets[0].tension = 0.4;
      datasets[0].fill = true;
    } else {
      datasets[0].backgroundColor = 'rgb(59, 130, 246)';
      datasets[0].borderRadius = 4;
      datasets[0].barThickness = type === 'month' ? 16 : 24;
    }

    return {
      labels: chartData.map(item => item.x),
      datasets
    };
  };

  const getChartOptions = (type) => ({
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      tooltip: {
        callbacks: {
          title: function(context) {
            const dataset = context[0].dataset;
            const index = context[0].dataIndex;
            const date = dataset.fullDates[index];
            
            switch (type) {
              case 'day':
                return date.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                });
              case 'month':
                return date.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric'
                });
              case 'year':
                return date.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                });
              default:
                return '';
            }
          },
          label: function(context) {
            const value = context.raw / 1000; // Convert to kW
            return `${value.toFixed(2)} kW`;
          }
        }
      }
    },
    scales: {
      ...baseOptions.scales,
      x: {
        ...baseOptions.scales.x,
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: type === 'day' ? 6 : type === 'month' ? 10 : 12
        }
      }
    }
  });

  const calculateTotal = (data) => {
    if (!data?.set) return 0;
    return data.set.reduce((total, item) => total + (parseFloat(item.pvGeneration) / 1000), 0);
  };

  const dayData = formatChartData(measurements?.day, 'day');
  const monthData = formatChartData(measurements?.month, 'month');
  const yearData = formatChartData(measurements?.year, 'year');

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Generation Statistics</h2>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Current Power</h3>
          <PowerGauge value={getCurrentPower()} maxValue={200} />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-gray-900">Today</h3>
            <span className="text-sm text-gray-600">
              Total: {calculateTotal(measurements?.day).toFixed(2)} kWh
            </span>
          </div>
          {dayData ? (
            <div className="h-48">
              <Line ref={dayChartRef} options={getChartOptions('day')} data={dayData} />
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-gray-900">This Month</h3>
            <span className="text-sm text-gray-600">
              Total: {calculateTotal(measurements?.month).toFixed(2)} kWh
            </span>
          </div>
          {monthData ? (
            <div className="h-48">
              <Bar ref={monthChartRef} options={getChartOptions('month')} data={monthData} />
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-gray-900">This Year</h3>
            <span className="text-sm text-gray-600">
              Total: {calculateTotal(measurements?.year).toFixed(2)} kWh
            </span>
          </div>
          {yearData ? (
            <div className="h-48">
              <Bar ref={yearChartRef} options={getChartOptions('year')} data={yearData} />
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}