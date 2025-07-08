// Data center model
export interface DataCenter {
  id: string
  name: string
  rooms: Room[]
}

// Room model
export interface Room {
  id: string
  name: string
  racks: Rack[]
}

// Rack model
export interface Rack {
  id: string
  name: string
  totalUnits: number // Total units in the rack
  units: Unit[]
}

// Unit model
export interface Unit {
  position: number // Unit position (from bottom to top)
  deviceId: string | null // Device ID if occupied
  deviceName: string | null // Device name
  deviceIp: string | null // Device IP
  deviceSize: number // Units occupied by the device
  serviceId: string | null // Service ID this device belongs to
  serviceName: string | null // Service name
}

// Device model
export interface Device {
  id: string
  name: string
  type: string
  size: number
  description?: string
  ips?: IPAddress[]
  status?: "Active" | "Inactive" | "Maintenance" | "Decommissioned"
  powerConsumption?: number | null
  installationDate?: string | null
  serviceId?: string | null
  serviceName?: string | null
  model?: string
}

// IP Address model
export interface IPAddress {
  id: string
  address: string
  subnet: string
  gateway?: string
  status: "Assigned" | "Available" | "Reserved" | "Deprecated"
  deviceId: string | null
  deviceName: string | null
  serviceId: string | null
  serviceName: string | null
  lastUpdated?: string
}

// IP Subnet model
export interface IPSubnet {
  id: string
  subnet: string
  description: string
  totalIPs: number
  usedIPs: number
  availableIPs: number
  reservedIPs: number
  serviceId?: string | null
}

// Service model
export interface Service {
  id: string
  name: string
  description: string
  status: "Active" | "Inactive" | "Maintenance" | "Planned"
  criticality: "Low" | "Medium" | "High" | "Critical"
  owner?: string
  department?: string
  devices: string[]
}

// Mock data for data centers
export const dataCenters: DataCenter[] = [
  {
    id: "dc-a",
    name: "DC-A",
    rooms: [
      {
        id: "room-1",
        name: "Room 1",
        racks: [
          {
            id: "rack-1",
            name: "Rack 1",
            totalUnits: 42,
            units: generateEmptyUnits(42),
          },
          {
            id: "rack-2",
            name: "Rack 2",
            totalUnits: 42,
            units: generateEmptyUnits(42),
          },
          {
            id: "rack-3",
            name: "Rack 3",
            totalUnits: 42,
            units: generateEmptyUnits(42),
          },
        ],
      },
      {
        id: "room-2",
        name: "Room 2",
        racks: [
          {
            id: "rack-4",
            name: "Rack 1",
            totalUnits: 42,
            units: generateEmptyUnits(42),
          },
          {
            id: "rack-5",
            name: "Rack 2",
            totalUnits: 42,
            units: generateEmptyUnits(42),
          },
          {
            id: "rack-6",
            name: "Rack 3",
            totalUnits: 42,
            units: generateEmptyUnits(42),
          },
        ],
      },
    ],
  },
  {
    id: "dc-b",
    name: "DC-B",
    rooms: [
      {
        id: "room-a",
        name: "Room A",
        racks: [
          {
            id: "rack-7",
            name: "Rack 1",
            totalUnits: 42,
            units: generateEmptyUnits(42),
          },
          {
            id: "rack-8",
            name: "Rack 2",
            totalUnits: 42,
            units: generateEmptyUnits(42),
          },
          {
            id: "rack-9",
            name: "Rack 3",
            totalUnits: 42,
            units: generateEmptyUnits(42),
          },
        ],
      },
      {
        id: "room-b",
        name: "Room B",
        racks: [
          {
            id: "rack-10",
            name: "Rack 1",
            totalUnits: 42,
            units: generateEmptyUnits(42),
          },
          {
            id: "rack-11",
            name: "Rack 2",
            totalUnits: 42,
            units: generateEmptyUnits(42),
          },
          {
            id: "rack-12",
            name: "Rack 3",
            totalUnits: 42,
            units: generateEmptyUnits(42),
          },
        ],
      },
    ],
  },
]

// Generate empty units
function generateEmptyUnits(count: number): Unit[] {
  return Array.from({ length: count }, (_, i) => ({
    position: i + 1,
    deviceId: null,
    deviceName: null,
    deviceIp: null,
    deviceSize: 0,
    serviceId: null,
    serviceName: null,
  }))
}

// Mock IP subnets
export const ipSubnets: IPSubnet[] = [
  {
    id: "subnet-1",
    subnet: "192.168.1.0/24",
    description: "Primary Network",
    totalIPs: 254,
    usedIPs: 120,
    availableIPs: 124,
    reservedIPs: 10,
  },
  {
    id: "subnet-2",
    subnet: "192.168.2.0/24",
    description: "Secondary Network",
    totalIPs: 254,
    usedIPs: 85,
    availableIPs: 159,
    reservedIPs: 10,
  },
  {
    id: "subnet-3",
    subnet: "10.0.0.0/24",
    description: "Management Network",
    totalIPs: 254,
    usedIPs: 45,
    availableIPs: 199,
    reservedIPs: 10,
  },
]

// Mock IP addresses
export const ipAddresses: IPAddress[] = [
  {
    id: "ip-1",
    address: "192.168.1.10",
    subnet: "192.168.1.0/24",
    gateway: "192.168.1.1",
    status: "Assigned",
    deviceId: "dev-1",
    deviceName: "Web Server 1",
    serviceId: "svc-1",
    serviceName: "Web Service",
    lastUpdated: "2023-05-15",
  },
  {
    id: "ip-2",
    address: "192.168.1.11",
    subnet: "192.168.1.0/24",
    gateway: "192.168.1.1",
    status: "Assigned",
    deviceId: "dev-2",
    deviceName: "Database Server",
    serviceId: "svc-2",
    serviceName: "Database Service",
    lastUpdated: "2023-05-15",
  },
  {
    id: "ip-3",
    address: "192.168.1.12",
    subnet: "192.168.1.0/24",
    gateway: "192.168.1.1",
    status: "Assigned",
    deviceId: "dev-3",
    deviceName: "Application Server",
    serviceId: "svc-3",
    serviceName: "Application Service",
    lastUpdated: "2023-05-15",
  },
  {
    id: "ip-4",
    address: "192.168.1.20",
    subnet: "192.168.1.0/24",
    gateway: "192.168.1.1",
    status: "Available",
    deviceId: null,
    deviceName: null,
    serviceId: null,
    serviceName: null,
    lastUpdated: "2023-05-15",
  },
  {
    id: "ip-5",
    address: "10.0.0.10",
    subnet: "10.0.0.0/24",
    gateway: "10.0.0.1",
    status: "Assigned",
    deviceId: "dev-1",
    deviceName: "Web Server 1",
    serviceId: "svc-1",
    serviceName: "Web Service",
    lastUpdated: "2023-05-15",
  },
]

// Mock services
export const services: Service[] = [
  {
    id: "svc-1",
    name: "Web Service",
    description: "Primary web service for customer-facing applications",
    devices: ["dev-1", "dev-5"],
    ips: ["ip-1", "ip-5"],
    status: "Active",
    owner: "Web Team",
    department: "IT",
    criticality: "High",
  },
  {
    id: "svc-2",
    name: "Database Service",
    description: "Primary database service",
    devices: ["dev-2"],
    ips: ["ip-2"],
    status: "Active",
    owner: "Database Team",
    department: "IT",
    criticality: "Critical",
  },
  {
    id: "svc-3",
    name: "Application Service",
    description: "Internal application service",
    devices: ["dev-3"],
    ips: ["ip-3"],
    status: "Active",
    owner: "App Team",
    department: "IT",
    criticality: "Medium",
  },
]

// Mock devices
export const devices: Device[] = [
  {
    id: "dev-1",
    name: "Web Server 1",
    model: "Dell R740",
    size: 2,
    ips: [
      {
        id: "ip-1",
        address: "192.168.1.10",
        subnet: "192.168.1.0/24",
        gateway: "192.168.1.1",
        status: "Assigned",
        deviceId: "dev-1",
        deviceName: "Web Server 1",
        serviceId: "svc-1",
        serviceName: "Web Service",
        lastUpdated: "2023-05-15",
      },
      {
        id: "ip-5",
        address: "10.0.0.10",
        subnet: "10.0.0.0/24",
        gateway: "10.0.0.1",
        status: "Assigned",
        deviceId: "dev-1",
        deviceName: "Web Server 1",
        serviceId: "svc-1",
        serviceName: "Web Service",
        lastUpdated: "2023-05-15",
      },
    ],
    status: "Active",
    serviceId: "svc-1",
    serviceName: "Web Service",
    installationDate: "2023-01-15",
    lastUpdated: "2023-05-15",
    notes: "Primary web server",
    powerConsumption: 450,
  },
  {
    id: "dev-2",
    name: "Database Server",
    model: "HP DL380",
    size: 2,
    ips: [
      {
        id: "ip-2",
        address: "192.168.1.11",
        subnet: "192.168.1.0/24",
        gateway: "192.168.1.1",
        status: "Assigned",
        deviceId: "dev-2",
        deviceName: "Database Server",
        serviceId: "svc-2",
        serviceName: "Database Service",
        lastUpdated: "2023-05-15",
      },
    ],
    status: "Active",
    serviceId: "svc-2",
    serviceName: "Database Service",
    installationDate: "2023-01-20",
    lastUpdated: "2023-05-15",
    notes: "Primary database server",
    powerConsumption: 550,
  },
  {
    id: "dev-3",
    name: "Application Server",
    model: "Dell R640",
    size: 1,
    ips: [
      {
        id: "ip-3",
        address: "192.168.1.12",
        subnet: "192.168.1.0/24",
        gateway: "192.168.1.1",
        status: "Assigned",
        deviceId: "dev-3",
        deviceName: "Application Server",
        serviceId: "svc-3",
        serviceName: "Application Service",
        lastUpdated: "2023-05-15",
      },
    ],
    status: "Active",
    serviceId: "svc-3",
    serviceName: "Application Service",
    installationDate: "2023-02-01",
    lastUpdated: "2023-05-15",
    notes: "Internal application server",
    powerConsumption: 350,
  },
  {
    id: "dev-4",
    name: "Backup Server",
    model: "Dell R640",
    size: 2,
    ips: [],
    status: "Inactive",
    serviceId: null,
    serviceName: null,
    installationDate: "2023-03-01",
    lastUpdated: "2023-05-15",
    notes: "Backup server - not yet configured",
    powerConsumption: 350,
  },
  {
    id: "dev-5",
    name: "Web Server 2",
    model: "Dell R740",
    size: 2,
    ips: [],
    status: "Maintenance",
    serviceId: "svc-1",
    serviceName: "Web Service",
    installationDate: "2023-02-15",
    lastUpdated: "2023-05-15",
    notes: "Secondary web server - under maintenance",
    powerConsumption: 450,
  },
]

// Add sample devices to racks
export function populateWithSampleDevices() {
  // DC-A, Room 1, Rack 1
  const rack1 = dataCenters[0].rooms[0].racks[0]
  rack1.units[5].deviceId = "dev-1"
  rack1.units[5].deviceName = "Web Server 1"
  rack1.units[5].deviceIp = "192.168.1.10"
  rack1.units[5].deviceSize = 2
  rack1.units[5].serviceId = "svc-1"
  rack1.units[5].serviceName = "Web Service"
  rack1.units[4].deviceId = "dev-1" // Second unit for the same device
  rack1.units[4].deviceName = "Web Server 1"
  rack1.units[4].deviceIp = "192.168.1.10"
  rack1.units[4].deviceSize = 2
  rack1.units[4].serviceId = "svc-1"
  rack1.units[4].serviceName = "Web Service"

  // DC-B, Room A, Rack 1
  const rack7 = dataCenters[1].rooms[0].racks[0]
  rack7.units[8].deviceId = "dev-2"
  rack7.units[8].deviceName = "Database Server"
  rack7.units[8].deviceIp = "192.168.1.11"
  rack7.units[8].deviceSize = 2
  rack7.units[8].serviceId = "svc-2"
  rack7.units[8].serviceName = "Database Service"
  rack7.units[7].deviceId = "dev-2" // Second unit for the same device
  rack7.units[7].deviceName = "Database Server"
  rack7.units[7].deviceIp = "192.168.1.11"
  rack7.units[7].deviceSize = 2
  rack7.units[7].serviceId = "svc-2"
  rack7.units[7].serviceName = "Database Service"

  // DC-B, Room A, Rack 2
  const rack8 = dataCenters[1].rooms[0].racks[1]
  rack8.units[2].deviceId = "dev-3"
  rack8.units[2].deviceName = "Application Server"
  rack8.units[2].deviceIp = "192.168.1.12"
  rack8.units[2].deviceSize = 1
  rack8.units[2].serviceId = "svc-3"
  rack8.units[2].serviceName = "Application Service"
}

// Initialize sample data
populateWithSampleDevices()
