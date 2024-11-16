export interface Device {
    deviceId: string;
    name: string;
    product: string;
    productId: string;
    serial: string;
    type: string;
    vendor: string;
    timezone: string;
    isActive: boolean;
    generatorPower: string;
  }
  
  export interface Measurement {
    time: string;
    pvGeneration: string;
    totalGeneration: string;
  }
  
  export interface MeasurementSet {
    set: Measurement[];
    setType: string;
    resolution: string;
    plant?: {
      name: string;
      plantId: string;
      description: string;
      timezone: string;
      dailyBenchmark?: string;
      performanceRatio?: string;
      recentGeneration?: string;
      underperforming?: boolean;
    };
  }
  
  export interface PlantData {
    name: string;
    status: string;
    location: {
      latitude: number;
      longitude: number;
      timezone: string;
    };
    measurements: {
      day: MeasurementSet;
      month: MeasurementSet;
      year: MeasurementSet;
    };
    devices: Device[];
  }