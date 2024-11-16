import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { PlantPDF } from './PlantPDF';

export function DownloadButton({ plantData, measurements, chartRefs }) {
  const handleDownload = async () => {
    try {
      // Wait a moment for charts to be fully rendered
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get chart images
      const chartImages = {
        dayChart: chartRefs.dayChart?.canvas?.toDataURL(),
        monthChart: chartRefs.monthChart?.canvas?.toDataURL(),
        yearChart: chartRefs.yearChart?.canvas?.toDataURL(),
      };

      // Create and download PDF
      const blob = await pdf(
        <PlantPDF 
          plantData={plantData} 
          measurements={measurements} 
          chartRefs={chartImages}
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${plantData.name.replace(/\s+/g, '-').toLowerCase()}-report.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
    >
      <Download className="h-5 w-5" />
      <span>Download Report</span>
    </button>
  );
}