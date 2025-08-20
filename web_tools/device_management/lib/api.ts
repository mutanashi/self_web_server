// API utilities for communicating with FastAPI server

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export interface Device {
  id: string;
  name: string;
  model?: string;
  size?: number;
  status: string;
  service_id?: string;
  service_name?: string;
  installation_date?: string;
  last_updated?: string;
  notes?: string;
  power_consumption?: number;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  status: string;
  owner?: string;
  department?: string;
  criticality?: string;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DataCenter {
  id: string;
  name: string;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Room {
  id: string;
  name: string;
  data_center_id?: string;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Rack {
  id: string;
  name: string;
  total_units: number;
  room_id?: string;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardStats {
  totalServices: number;
  activeServices: number;
  totalDevices: number;
  totalIPs: number;
  recentActivities: Activity[];
}

export interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

class ApiClient {
  private baseUrl: string;
  private userToken: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setUserToken(token: string) {
    this.userToken = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if token is available
    if (this.userToken) {
      headers['Authorization'] = `Bearer ${this.userToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string; version: string }> {
    return this.request('/health');
  }

  // Services
  async getServices(): Promise<Service[]> {
    return this.request('/services');
  }

  async createService(service: Omit<Service, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Service> {
    return this.request('/services', {
      method: 'POST',
      body: JSON.stringify(service),
    });
  }

  // Devices
  async getDevices(): Promise<Device[]> {
    return this.request('/devices');
  }

  async getDevice(id: string): Promise<Device> {
    return this.request(`/devices/${id}`);
  }

  async createDevice(device: Omit<Device, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Device> {
    return this.request('/devices', {
      method: 'POST',
      body: JSON.stringify(device),
    });
  }

  async updateDevice(id: string, device: Partial<Device>): Promise<Device> {
    return this.request(`/devices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(device),
    });
  }

  async deleteDevice(id: string): Promise<{ message: string }> {
    return this.request(`/devices/${id}`, {
      method: 'DELETE',
    });
  }

  // Data Centers
  async getDataCenters(): Promise<DataCenter[]> {
    return this.request('/data-centers');
  }

  async createDataCenter(dataCenter: Omit<DataCenter, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<DataCenter> {
    return this.request('/data-centers', {
      method: 'POST',
      body: JSON.stringify(dataCenter),
    });
  }

  // Rooms
  async getRooms(): Promise<Room[]> {
    return this.request('/rooms');
  }

  // Racks
  async getRacks(): Promise<Rack[]> {
    return this.request('/racks');
  }

  // Dashboard specific methods
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Fetch all data in parallel
      const [services, devices, dataCenters, rooms, racks] = await Promise.all([
        this.getServices(),
        this.getDevices(),
        this.getDataCenters(),
        this.getRooms(),
        this.getRacks(),
      ]);

      // Calculate stats
      const activeServices = services.filter(s => s.status === 'Active').length;
      const totalServices = services.length;
      const totalDevices = devices.length;
      
      // For now, we'll estimate IP addresses based on devices
      // In a real implementation, you'd have a separate IP addresses endpoint
      const totalIPs = devices.length; // Assuming 1 IP per device for now

      // Generate recent activities based on data
      const recentActivities: Activity[] = [
        {
          id: '1',
          type: 'device',
          message: `${devices.length} devices are online`,
          timestamp: new Date().toISOString(),
          status: 'success'
        },
        {
          id: '2',
          type: 'service',
          message: `${activeServices} services are running normally`,
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          status: 'success'
        },
        {
          id: '3',
          type: 'infrastructure',
          message: `${dataCenters.length} data centers operational`,
          timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          status: 'info'
        }
      ];

      return {
        totalServices,
        activeServices,
        totalDevices,
        totalIPs,
        recentActivities,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default values if API fails
      return {
        totalServices: 0,
        activeServices: 0,
        totalDevices: 0,
        totalIPs: 0,
        recentActivities: [],
      };
    }
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();

// Export types for use in components
export type { Device, Service, DataCenter, Room, Rack, DashboardStats, Activity };
