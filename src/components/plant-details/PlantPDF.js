import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  header: {
    fontSize: 24,
    marginBottom: 5,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  reportDate: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  subheader: {
    fontSize: 18,
    marginBottom: 10,
    color: '#374151',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
  },
  value: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  deviceItem: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
  },
  generationTitle: {
    fontSize: 14,
    marginBottom: 5,
    color: '#374151',
  },
  generationValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  chartsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    gap: 10,
  },
  chartBox: {
    flex: 1,
  },
  chart: {
    width: '100%',
    height: 150,
    objectFit: 'contain',
  },
});

export function PlantPDF({ plantData, measurements, chartRefs }) {
  // Calculate total generation
  const calculateTotal = (data) => {
    if (!data?.set) return 0;
    return (data.set.reduce((total, item) => 
      total + (parseFloat(item.pvGeneration) / 1000), 0)).toFixed(2);
  };

  const dayTotal = calculateTotal(measurements?.day);
  const monthTotal = calculateTotal(measurements?.month);
  const yearTotal = calculateTotal(measurements?.year);

  // Format current date in plant's timezone
  const reportDate = new Date().toLocaleString('en-US', {
    timeZone: plantData.location?.timezone || 'UTC',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.header}>{plantData.name}</Text>
          <Text style={styles.reportDate}>Report generated on {reportDate}</Text>
          
          {/* Plant Details */}
          <Text style={styles.subheader}>Plant Details</Text> 
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{plantData.status}</Text>
          </View>
          {plantData.location && (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>Location:</Text>
                <Text style={styles.value}>
                  {`${plantData.location.latitude.toFixed(6)}, ${plantData.location.longitude.toFixed(6)}`}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Timezone:</Text>
                <Text style={styles.value}>{plantData.location.timezone}</Text>
              </View>
            </>
          )}

          {/* Generation Statistics */}
          <Text style={styles.subheader}>Generation Statistics</Text>
          
          {/* Charts in a row */}
          <View style={styles.chartsContainer}>
            {/* Daily Generation */}
            <View style={styles.chartBox}>
              <Text style={styles.generationTitle}>Today's Generation</Text>
              <Text style={styles.generationValue}>{dayTotal} kWh</Text>
              {chartRefs?.dayChart && (
                <Image 
                  style={styles.chart} 
                  src={chartRefs.dayChart}
                />
              )}
            </View>

            {/* Monthly Generation */}
            <View style={styles.chartBox}>
              <Text style={styles.generationTitle}>Month's Generation</Text>
              <Text style={styles.generationValue}>{monthTotal} kWh</Text>
              {chartRefs?.monthChart && (
                <Image 
                  style={styles.chart} 
                  src={chartRefs.monthChart}
                />
              )}
            </View>

            {/* Yearly Generation */}
            <View style={styles.chartBox}>
              <Text style={styles.generationTitle}>Year's Generation</Text>
              <Text style={styles.generationValue}>{yearTotal} kWh</Text>
              {chartRefs?.yearChart && (
                <Image 
                  style={styles.chart} 
                  src={chartRefs.yearChart}
                />
              )}
            </View>
          </View>

          {/* Devices */}
          <Text style={styles.subheader}>Connected Devices</Text>
          {plantData.devices.map((device, index) => (
            <View key={index} style={styles.deviceItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.value}>{device.name}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Serial:</Text>
                <Text style={styles.value}>{device.serial}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Status:</Text>
                <Text style={styles.value}>{device.isActive ? 'Active' : 'Inactive'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Power:</Text>
                <Text style={styles.value}>{(parseInt(device.generatorPower) / 1000).toFixed(1)} kW</Text>
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}