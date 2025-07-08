export interface DeviceInfo {
  id: string
  name: string
  type: string
  size: number
  description?: string
  ips?: any[]
  status?: "Active" | "Inactive" | "Maintenance" | "Decommissioned"
  powerConsumption?: number | null
  installationDate?: string | null
  serviceId?: string | null
}

export interface ServiceInfo {
  id: string
  name: string
  description: string
  status: "Active" | "Inactive" | "Maintenance" | "Planned"
  criticality: "Low" | "Medium" | "High" | "Critical"
  owner?: string
  department?: string
  devices: string[]
}
