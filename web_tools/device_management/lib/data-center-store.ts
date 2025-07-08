import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { DataCenter, Rack, Unit, IPAddress } from "@/models/data-center"
import { useNotificationStore } from "@/lib/notification-store"

// 生成空的機架單元
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

// 初始數據
const initialDataCenters: DataCenter[] = [
  {
    id: "dc-1",
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
    id: "dc-2",
    name: "DC-B",
    rooms: [
      {
        id: "room-3",
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
        ],
      },
      {
        id: "room-4",
        name: "Room B",
        racks: [
          {
            id: "rack-9",
            name: "Rack 1",
            totalUnits: 42,
            units: generateEmptyUnits(42),
          },
        ],
      },
    ],
  },
]

// 初始子網數據
const initialIPSubnets: IPSubnet[] = [
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

// 初始服務數據
const initialServices: ServiceInfo[] = [
  {
    id: "service-1",
    name: "Web Application",
    description: "Main company web application",
    status: "Active",
    criticality: "High",
    owner: "John Doe",
    department: "IT",
    devices: [],
  },
  {
    id: "service-2",
    name: "Database Cluster",
    description: "Primary database cluster",
    status: "Active",
    criticality: "Critical",
    owner: "Jane Smith",
    department: "IT",
    devices: [],
  },
  {
    id: "service-3",
    name: "Email Server",
    description: "Corporate email server",
    status: "Maintenance",
    criticality: "Medium",
    owner: "Mike Johnson",
    department: "IT",
    devices: [],
  },
]

// 設備信息接口
interface DeviceInfo {
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

// IP 子網信息接口
interface IPSubnet {
  id: string
  subnet: string
  description: string
  totalIPs: number
  usedIPs: number
  availableIPs: number
  reservedIPs: number
  serviceId?: string | null
}

// 服務信息接口
interface ServiceInfo {
  id: string
  name: string
  description: string
  status: "Active" | "Inactive" | "Maintenance" | "Planned"
  criticality: "Low" | "Medium" | "High" | "Critical"
  owner?: string
  department?: string
  devices: string[] // 設備 ID 列表
}

// 存儲設備數據的映射
interface DeviceStore {
  [deviceId: string]: DeviceInfo
}

// 存儲服務數據的映射
interface ServiceStore {
  [serviceId: string]: ServiceInfo
}

// 在 DataCenterStore 接口中確保有 releaseIP 和 reserveIP 函數
interface DataCenterStore {
  dataCenters: DataCenter[]
  devices: DeviceStore
  services: ServiceStore
  ipSubnets: IPSubnet[]
  setDataCenters: (dataCenters: DataCenter[]) => void

  // 數據中心操作
  addDataCenter: (name: string) => string
  updateDataCenter: (id: string, name: string) => void
  deleteDataCenter: (id: string) => void

  // 機房操作
  addRoom: (dataCenterId: string, name: string) => string
  updateRoom: (dataCenterId: string, roomId: string, name: string) => void
  deleteRoom: (dataCenterId: string, roomId: string) => void

  // 機架操作
  addRack: (dataCenterId: string, roomId: string, name: string, totalUnits: number) => string
  updateRack: (dataCenterId: string, roomId: string, rackId: string, name: string, totalUnits: number) => void
  deleteRack: (dataCenterId: string, roomId: string, rackId: string) => void

  // 設備操作
  addDevice: (
    dataCenterId: string,
    roomId: string,
    rackId: string,
    startPosition: number,
    deviceInfo: DeviceInfo,
  ) => string
  updateDevice: (
    dataCenterId: string,
    roomId: string,
    rackId: string,
    deviceId: string,
    deviceInfo: Partial<DeviceInfo>,
  ) => void
  deleteDevice: (dataCenterId: string, roomId: string, rackId: string, deviceId: string) => void
  getDevice: (deviceId: string) => DeviceInfo | undefined
  getAllDevices: () => DeviceInfo[]

  // 查找功能
  findRack: (rackId: string) => { rack: Rack; datacenter: DataCenter; room: { id: string; name: string } } | null

  // IP 子網操作
  addSubnet: (
    subnet: string,
    description: string,
    cidr: string,
    gateway?: string,
    reservedCount?: number,
    serviceId?: string | null,
  ) => string
  updateSubnet: (id: string, data: Partial<IPSubnet>) => void
  deleteSubnet: (id: string) => void
  getSubnets: () => IPSubnet[]

  // 服務操作
  addService: (serviceInfo: Omit<ServiceInfo, "id" | "devices">) => string
  updateService: (id: string, data: Partial<ServiceInfo>) => void
  deleteService: (id: string) => void
  getService: (id: string) => ServiceInfo | undefined
  getAllServices: () => ServiceInfo[]
  assignDeviceToService: (deviceId: string, serviceId: string) => void
  removeDeviceFromService: (deviceId: string, serviceId: string) => void

  // 設備移動操作
  moveDevice: (
    sourceDataCenterId: string,
    sourceRoomId: string,
    sourceRackId: string,
    deviceId: string,
    targetDataCenterId: string,
    targetRoomId: string,
    targetRackId: string,
    targetPosition: number,
  ) => void

  // IP 操作
  assignIP: (ip: IPAddress) => void
  releaseIP: (ipId: string) => void
  reserveIP: (ip: IPAddress) => void
}

// 在 useDataCenterStore 的實現中添加或更新這些函數
export const useDataCenterStore = create<DataCenterStore>()(
  persist(
    (set, get) => {
      // 將初始服務數據轉換為映射
      const initialServicesMap: ServiceStore = {}
      initialServices.forEach((service) => {
        initialServicesMap[service.id] = service
      })

      return {
        dataCenters: initialDataCenters,
        devices: {},
        services: initialServicesMap,
        ipSubnets: initialIPSubnets,

        setDataCenters: (dataCenters) => set({ dataCenters }),

        addDataCenter: (name) => {
          const id = `dc-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
          set((state) => ({
            dataCenters: [...state.dataCenters, { id, name, rooms: [] }],
          }))
          return id
        },

        updateDataCenter: (id, name) => {
          set((state) => ({
            dataCenters: state.dataCenters.map((dc) => (dc.id === id ? { ...dc, name } : dc)),
          }))
        },

        deleteDataCenter: (id) => {
          set((state) => ({
            dataCenters: state.dataCenters.filter((dc) => dc.id !== id),
          }))
        },

        addRoom: (dataCenterId, name) => {
          const id = `room-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
          set((state) => ({
            dataCenters: state.dataCenters.map((dc) =>
              dc.id === dataCenterId ? { ...dc, rooms: [...dc.rooms, { id, name, racks: [] }] } : dc,
            ),
          }))
          return id
        },

        updateRoom: (dataCenterId, roomId, name) => {
          set((state) => ({
            dataCenters: state.dataCenters.map((dc) =>
              dc.id === dataCenterId
                ? {
                    ...dc,
                    rooms: dc.rooms.map((room) => (room.id === roomId ? { ...room, name } : room)),
                  }
                : dc,
            ),
          }))
        },

        deleteRoom: (dataCenterId, roomId) => {
          set((state) => ({
            dataCenters: state.dataCenters.map((dc) =>
              dc.id === dataCenterId ? { ...dc, rooms: dc.rooms.filter((room) => room.id !== roomId) } : dc,
            ),
          }))
        },

        addRack: (dataCenterId, roomId, name, totalUnits) => {
          const id = `rack-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
          set((state) => ({
            dataCenters: state.dataCenters.map((dc) =>
              dc.id === dataCenterId
                ? {
                    ...dc,
                    rooms: dc.rooms.map((room) =>
                      room.id === roomId
                        ? {
                            ...room,
                            racks: [
                              ...room.racks,
                              {
                                id,
                                name,
                                totalUnits,
                                units: generateEmptyUnits(totalUnits),
                              },
                            ],
                          }
                        : room,
                    ),
                  }
                : dc,
            ),
          }))
          return id
        },

        updateRack: (dataCenterId, roomId, rackId, name, totalUnits) => {
          set((state) => ({
            dataCenters: state.dataCenters.map((dc) =>
              dc.id === dataCenterId
                ? {
                    ...dc,
                    rooms: dc.rooms.map((room) =>
                      room.id === roomId
                        ? {
                            ...room,
                            racks: room.racks.map((rack) =>
                              rack.id === rackId
                                ? {
                                    ...rack,
                                    name,
                                    totalUnits,
                                    units:
                                      totalUnits > rack.totalUnits
                                        ? [...rack.units, ...generateEmptyUnits(totalUnits - rack.totalUnits)]
                                        : rack.units.slice(0, totalUnits),
                                  }
                                : rack,
                            ),
                          }
                        : room,
                    ),
                  }
                : dc,
            ),
          }))
        },

        deleteRack: (dataCenterId, roomId, rackId) => {
          set((state) => ({
            dataCenters: state.dataCenters.map((dc) =>
              dc.id === dataCenterId
                ? {
                    ...dc,
                    rooms: dc.rooms.map((room) =>
                      room.id === roomId ? { ...room, racks: room.racks.filter((rack) => rack.id !== rackId) } : room,
                    ),
                  }
                : dc,
            ),
          }))
        },

        addDevice: (
          dataCenterId: string,
          roomId: string,
          rackId: string,
          startPosition: number,
          deviceInfo: DeviceInfo,
        ) => {
          const deviceId = deviceInfo.id || `dev-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
          const deviceWithId = { ...deviceInfo, id: deviceId }

          // 存儲設備信息
          set((state) => ({
            devices: {
              ...state.devices,
              [deviceId]: deviceWithId,
            },
          }))

          // 如果設備有關聯的服務，將設備添加到服務的設備列表中
          if (deviceInfo.serviceId) {
            set((state) => {
              const service = state.services[deviceInfo.serviceId!]
              if (service) {
                return {
                  services: {
                    ...state.services,
                    [deviceInfo.serviceId!]: {
                      ...service,
                      devices: [...service.devices, deviceId],
                    },
                  },
                }
              }
              return state
            })
          }

          // 更新機架單元
          set((state) => ({
            dataCenters: state.dataCenters.map((dc) =>
              dc.id === dataCenterId
                ? {
                    ...dc,
                    rooms: dc.rooms.map((room) =>
                      room.id === roomId
                        ? {
                            ...room,
                            racks: room.racks.map((rack) => {
                              if (rack.id !== rackId) return rack

                              // 更新機架單元
                              const updatedUnits = [...rack.units]
                              for (let i = 0; i < deviceInfo.size; i++) {
                                const position = startPosition + i
                                if (position <= rack.totalUnits) {
                                  updatedUnits[position - 1] = {
                                    ...updatedUnits[position - 1],
                                    deviceId,
                                    deviceName: deviceInfo.name,
                                    deviceIp:
                                      deviceInfo.ips && deviceInfo.ips.length > 0 ? deviceInfo.ips[0].address : null,
                                    deviceSize: deviceInfo.size,
                                    serviceId: deviceInfo.serviceId || null,
                                    serviceName:
                                      deviceInfo.serviceId && state.services[deviceInfo.serviceId]
                                        ? state.services[deviceInfo.serviceId].name
                                        : null,
                                  }
                                }
                              }

                              return {
                                ...rack,
                                units: updatedUnits,
                              }
                            }),
                          }
                        : room,
                    ),
                  }
                : dc,
            ),
          }))

          // 添加通知
          const notificationStore = useNotificationStore.getState()
          notificationStore.addNotification({
            title: "Device Added",
            message: `Device "${deviceInfo.name}" has been added to the system.`,
            type: "success",
          })

          return deviceId
        },

        updateDevice: (dataCenterId, roomId, rackId, deviceId, deviceInfo) => {
          const oldDevice = get().devices[deviceId]
          const oldServiceId = oldDevice?.serviceId
          const newServiceId = deviceInfo.serviceId

          // 先處理服務關聯的變更，然後再更新設備訊息
          if (oldServiceId !== newServiceId) {
            // 先處理服務關聯的變更
            set((state) => {
              const newState = { ...state }

              // 從舊服務中移除設備
              if (oldServiceId && newState.services[oldServiceId]) {
                newState.services[oldServiceId] = {
                  ...newState.services[oldServiceId],
                  devices: newState.services[oldServiceId].devices.filter((id) => id !== deviceId),
                }
              }

              // 添加設備到新服務
              if (newServiceId && newState.services[newServiceId]) {
                newState.services[newServiceId] = {
                  ...newState.services[newServiceId],
                  devices: [...newState.services[newServiceId].devices, deviceId],
                }
              }

              return newState
            })
          }

          // 然後更新設備訊息
          set((state) => ({
            devices: {
              ...state.devices,
              [deviceId]: {
                ...state.devices[deviceId],
                ...deviceInfo,
              },
            },
          }))

          // 更新機架單元
          set((state) => ({
            dataCenters: state.dataCenters.map((dc) =>
              dc.id === dataCenterId
                ? {
                    ...dc,
                    rooms: dc.rooms.map((room) =>
                      room.id === roomId
                        ? {
                            ...room,
                            racks: room.racks.map((rack) => {
                              if (rack.id !== rackId) return rack

                              // 更新設備信息
                              const updatedUnits = rack.units.map((unit) => {
                                if (unit.deviceId !== deviceId) return unit

                                return {
                                  ...unit,
                                  deviceName: deviceInfo.name ?? unit.deviceName,
                                  deviceIp:
                                    deviceInfo.ips && deviceInfo.ips.length > 0
                                      ? deviceInfo.ips[0].address
                                      : unit.deviceIp,
                                  serviceId: deviceInfo.serviceId || null,
                                  serviceName:
                                    deviceInfo.serviceId && state.services[deviceInfo.serviceId]
                                      ? state.services[deviceInfo.serviceId].name
                                      : null,
                                }
                              })

                              return {
                                ...rack,
                                units: updatedUnits,
                              }
                            }),
                          }
                        : room,
                    ),
                  }
                : dc,
            ),
          }))

          // 添加通知
          const notificationStore = useNotificationStore.getState()
          notificationStore.addNotification({
            title: "Device Updated",
            message: `Device "${oldDevice.name}" has been updated.`,
            type: "info",
          })
        },

        deleteDevice: (dataCenterId, roomId, rackId, deviceId) => {
          const device = get().devices[deviceId]
          const serviceId = device?.serviceId

          // 從設備存儲中刪除
          set((state) => {
            const newDevices = { ...state.devices }
            delete newDevices[deviceId]
            return { devices: newDevices }
          })

          // 從服務中移除設備
          if (serviceId) {
            set((state) => {
              const service = state.services[serviceId]
              if (service) {
                return {
                  services: {
                    ...state.services,
                    [serviceId]: {
                      ...service,
                      devices: service.devices.filter((id) => id !== deviceId),
                    },
                  },
                }
              }
              return state
            })
          }

          // 從機架中刪除
          set((state) => ({
            dataCenters: state.dataCenters.map((dc) =>
              dc.id === dataCenterId
                ? {
                    ...dc,
                    rooms: dc.rooms.map((room) =>
                      room.id === roomId
                        ? {
                            ...room,
                            racks: room.racks.map((rack) => {
                              if (rack.id !== rackId) return rack

                              // 清除設備信息
                              const updatedUnits = rack.units.map((unit) => {
                                if (unit.deviceId !== deviceId) return unit

                                return {
                                  ...unit,
                                  deviceId: null,
                                  deviceName: null,
                                  deviceIp: null,
                                  deviceSize: 0,
                                  serviceId: null,
                                  serviceName: null,
                                }
                              })

                              return {
                                ...rack,
                                units: updatedUnits,
                              }
                            }),
                          }
                        : room,
                    ),
                  }
                : dc,
            ),
          }))

          // 添加通知
          const notificationStore = useNotificationStore.getState()
          notificationStore.addNotification({
            title: "Device Removed",
            message: `Device "${device.name}" has been removed from the system.`,
            type: "warning",
          })
        },

        getDevice: (deviceId) => {
          return get().devices[deviceId]
        },

        getAllDevices: () => {
          return Object.values(get().devices)
        },

        findRack: (rackId) => {
          for (const dc of get().dataCenters) {
            for (const room of dc.rooms) {
              const rack = room.racks.find((r) => r.id === rackId)
              if (rack) {
                return {
                  rack,
                  datacenter: dc,
                  room: { id: room.id, name: room.name },
                }
              }
            }
          }
          return null
        },

        // IP 子網操作
        addSubnet: (subnet, description, cidr, gateway, reservedCount = 10, serviceId = null) => {
          const id = `subnet-${Date.now()}`
          const cidrNum = Number.parseInt(cidr, 10)
          const totalIPs = Math.pow(2, 32 - cidrNum) - 2 // 減去網絡地址和廣播地址

          const newSubnet: IPSubnet = {
            id,
            subnet: `${subnet}/${cidr}`,
            description,
            totalIPs,
            usedIPs: 0,
            availableIPs: totalIPs - reservedCount,
            reservedIPs: reservedCount,
            serviceId,
          }

          set((state) => {
            const currentSubnets = state.ipSubnets || []
            return {
              ipSubnets: [...currentSubnets, newSubnet],
            }
          })

          // 如果有關聯的服務，更新服務信息
          if (serviceId) {
            const service = get().services[serviceId]
            if (service) {
              set((state) => ({
                services: {
                  ...state.services,
                  [serviceId]: {
                    ...service,
                    // 可以在這裡添加子網關聯邏輯
                  },
                },
              }))
            }
          }

          // 添加通知
          const notificationStore = useNotificationStore.getState()
          notificationStore.addNotification({
            title: "Subnet Added",
            message: `Subnet "${subnet}/${cidr}" has been added to the system.`,
            type: "success",
          })

          return id
        },

        updateSubnet: (id, data) => {
          set((state) => {
            const currentSubnets = state.ipSubnets || []
            return {
              ipSubnets: currentSubnets.map((subnet) => (subnet.id === id ? { ...subnet, ...data } : subnet)),
            }
          })

          // 添加通知
          const subnet = get().ipSubnets.find((s) => s.id === id)
          if (subnet) {
            const notificationStore = useNotificationStore.getState()
            notificationStore.addNotification({
              title: "Subnet Updated",
              message: `Subnet "${subnet.subnet}" has been updated.`,
              type: "info",
            })
          }
        },

        deleteSubnet: (id) => {
          // 添加通知
          const subnet = get().ipSubnets.find((s) => s.id === id)
          if (subnet) {
            const notificationStore = useNotificationStore.getState()
            notificationStore.addNotification({
              title: "Subnet Removed",
              message: `Subnet "${subnet.subnet}" has been removed from the system.`,
              type: "warning",
            })
          }

          set((state) => {
            const currentSubnets = state.ipSubnets || []
            return {
              ipSubnets: currentSubnets.filter((subnet) => subnet.id !== id),
            }
          })
        },

        getSubnets: () => {
          return get().ipSubnets || []
        },

        // 服務操作
        addService: (serviceInfo) => {
          const id = `service-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
          const newService: ServiceInfo = {
            ...serviceInfo,
            id,
            devices: [],
          }

          set((state) => ({
            services: {
              ...state.services,
              [id]: newService,
            },
          }))

          // 添加通知
          const notificationStore = useNotificationStore.getState()
          notificationStore.addNotification({
            title: "Service Added",
            message: `Service "${serviceInfo.name}" has been added to the system.`,
            type: "success",
          })

          return id
        },

        updateService: (id, data) => {
          set((state) => {
            const service = state.services[id]
            if (!service) return state

            return {
              services: {
                ...state.services,
                [id]: {
                  ...service,
                  ...data,
                },
              },
            }
          })

          // 添加通知
          const service = get().services[id]
          const notificationStore = useNotificationStore.getState()
          notificationStore.addNotification({
            title: "Service Updated",
            message: `Service "${service.name}" has been updated.`,
            type: "info",
          })
        },

        deleteService: (id) => {
          // 獲取服務中的所有設備
          const service = get().services[id]
          const deviceIds = service?.devices || []

          // 添加通知
          const notificationStore = useNotificationStore.getState()
          notificationStore.addNotification({
            title: "Service Removed",
            message: `Service "${service.name}" has been removed from the system.`,
            type: "warning",
          })

          // 從設備中移除服務關聯
          deviceIds.forEach((deviceId) => {
            set((state) => {
              const device = state.devices[deviceId]
              if (device && device.serviceId === id) {
                return {
                  devices: {
                    ...state.devices,
                    [deviceId]: {
                      ...device,
                      serviceId: null,
                    },
                  },
                }
              }
              return state
            })
          })

          // 從機架單元中移除服務關聯
          set((state) => ({
            dataCenters: state.dataCenters.map((dc) => ({
              ...dc,
              rooms: dc.rooms.map((room) => ({
                ...room,
                racks: room.racks.map((rack) => ({
                  ...rack,
                  units: rack.units.map((unit) => {
                    if (unit.serviceId === id) {
                      return {
                        ...unit,
                        serviceId: null,
                        serviceName: null,
                      }
                    }
                    return unit
                  }),
                })),
              })),
            })),
          }))

          // 刪除服務
          set((state) => {
            const newServices = { ...state.services }
            delete newServices[id]
            return { services: newServices }
          })
        },

        getService: (id) => {
          return get().services[id]
        },

        getAllServices: () => {
          const services = get().services
          return Object.values(services)
        },

        assignDeviceToService: (deviceId, serviceId) => {
          const device = get().devices[deviceId]
          const service = get().services[serviceId]

          if (!device || !service) return

          // 先從舊服務中移除設備
          if (device.serviceId && device.serviceId !== serviceId) {
            set((state) => {
              const oldService = state.services[device.serviceId!]
              if (oldService) {
                return {
                  services: {
                    ...state.services,
                    [device.serviceId!]: {
                      ...oldService,
                      devices: oldService.devices.filter((id) => id !== deviceId),
                    },
                  },
                }
              }
              return state
            })
          }

          // 更新設備的服務關聯
          set((state) => ({
            devices: {
              ...state.devices,
              [deviceId]: {
                ...device,
                serviceId,
              },
            },
          }))

          // 將設備添加到服務的設備列表中
          set((state) => ({
            services: {
              ...state.services,
              [serviceId]: {
                ...service,
                devices: service.devices.includes(deviceId) ? service.devices : [...service.devices, deviceId],
              },
            },
          }))

          // 更新機架單元中的服務信息
          set((state) => ({
            dataCenters: state.dataCenters.map((dc) => ({
              ...dc,
              rooms: dc.rooms.map((room) => ({
                ...room,
                racks: room.racks.map((rack) => ({
                  ...rack,
                  units: rack.units.map((unit) => {
                    if (unit.deviceId === deviceId) {
                      return {
                        ...unit,
                        serviceId,
                        serviceName: service.name,
                      }
                    }
                    return unit
                  }),
                })),
              })),
            })),
          }))
        },

        removeDeviceFromService: (deviceId, serviceId) => {
          const device = get().devices[deviceId]
          const service = get().services[serviceId]

          if (!device || !service || device.serviceId !== serviceId) return

          // 更新設備的服務關聯
          set((state) => ({
            devices: {
              ...state.devices,
              [deviceId]: {
                ...device,
                serviceId: null,
              },
            },
          }))

          // 從服務的設備列表中移除設備
          set((state) => ({
            services: {
              ...state.services,
              [serviceId]: {
                ...service,
                devices: service.devices.filter((id) => id !== deviceId),
              },
            },
          }))

          // 更新機架單元中的服務信息
          set((state) => ({
            dataCenters: state.dataCenters.map((dc) => ({
              ...dc,
              rooms: dc.rooms.map((room) => ({
                ...room,
                racks: room.racks.map((rack) => ({
                  ...rack,
                  units: rack.units.map((unit) => {
                    if (unit.deviceId === deviceId) {
                      return {
                        ...unit,
                        serviceId: null,
                        serviceName: null,
                      }
                    }
                    return unit
                  }),
                })),
              })),
            })),
          }))
        },

        // 設備移動操作
        moveDevice: (
          sourceDataCenterId,
          sourceRoomId,
          sourceRackId,
          deviceId,
          targetDataCenterId,
          targetRoomId,
          targetRackId,
          targetPosition,
        ) => {
          // 獲取設備信息
          const device = get().devices[deviceId]
          if (!device) {
            throw new Error("Device not found")
          }

          // 獲取源機櫃中的設備位置和大小
          const deviceSize = device.size || 1
          let sourcePosition = 0

          // 查找源機櫃中的設備位置
          const sourceRack = get()
            .dataCenters.find((dc) => dc.id === sourceDataCenterId)
            ?.rooms.find((room) => room.id === sourceRoomId)
            ?.racks.find((rack) => rack.id === sourceRackId)

          if (!sourceRack) {
            throw new Error("Source rack not found")
          }

          for (let i = 0; i < sourceRack.units.length; i++) {
            if (sourceRack.units[i].deviceId === deviceId) {
              sourcePosition = sourceRack.units[i].position
              break
            }
          }

          // 獲取目標機櫃
          const targetRack = get()
            .dataCenters.find((dc) => dc.id === targetDataCenterId)
            ?.rooms.find((room) => room.id === targetRoomId)
            ?.racks.find((rack) => rack.id === targetRackId)

          if (!targetRack) {
            throw new Error("Target rack not found")
          }

          // 檢查目標位置是否有足夠的空間
          for (let i = 0; i < deviceSize; i++) {
            const unitIndex = targetPosition + i - 1
            if (
              unitIndex >= targetRack.units.length ||
              (targetRack.units[unitIndex].deviceId !== null && targetRack.units[unitIndex].deviceId !== deviceId)
            ) {
              throw new Error("Target position does not have enough space")
            }
          }

          // 從源機櫃中移除設備
          set((state) => ({
            dataCenters: state.dataCenters.map((dc) =>
              dc.id === sourceDataCenterId
                ? {
                    ...dc,
                    rooms: dc.rooms.map((room) =>
                      room.id === sourceRoomId
                        ? {
                            ...room,
                            racks: room.racks.map((rack) => {
                              if (rack.id !== sourceRackId) return rack

                              // 清除設備信息
                              const updatedUnits = rack.units.map((unit) => {
                                if (unit.deviceId !== deviceId) return unit

                                return {
                                  ...unit,
                                  deviceId: null,
                                  deviceName: null,
                                  deviceIp: null,
                                  deviceSize: 0,
                                  serviceId: null,
                                  serviceName: null,
                                }
                              })

                              return {
                                ...rack,
                                units: updatedUnits,
                              }
                            }),
                          }
                        : room,
                    ),
                  }
                : dc,
            ),
          }))

          // 在目標機櫃中安裝設備
          set((state) => ({
            dataCenters: state.dataCenters.map((dc) =>
              dc.id === targetDataCenterId
                ? {
                    ...dc,
                    rooms: dc.rooms.map((room) =>
                      room.id === targetRoomId
                        ? {
                            ...room,
                            racks: room.racks.map((rack) => {
                              if (rack.id !== targetRackId) return rack

                              // 更新機架單元
                              const updatedUnits = [...rack.units]
                              for (let i = 0; i < deviceSize; i++) {
                                const position = targetPosition + i
                                if (position <= rack.totalUnits) {
                                  updatedUnits[position - 1] = {
                                    ...updatedUnits[position - 1],
                                    deviceId,
                                    deviceName: device.name,
                                    deviceIp: device.ips && device.ips.length > 0 ? device.ips[0].address : null,
                                    deviceSize: deviceSize,
                                    serviceId: device.serviceId || null,
                                    serviceName: device.serviceName || null,
                                  }
                                }
                              }

                              return {
                                ...rack,
                                units: updatedUnits,
                              }
                            }),
                          }
                        : room,
                    ),
                  }
                : dc,
            ),
          }))

          // 添加通知
          const notificationStore = useNotificationStore.getState()
          notificationStore.addNotification({
            title: "Device Moved",
            message: `Device "${device.name}" has been moved successfully.`,
            type: "success",
          })
        },

        // 分配 IP
        assignIP: (ip: IPAddress) => {
          // 查找設備
          const device = get().devices[ip.deviceId || ""]
          if (!device) return

          // 更新設備的 IP 列表
          set((state) => ({
            devices: {
              ...state.devices,
              [ip.deviceId || ""]: {
                ...device,
                ips: [...(device.ips || []), ip],
              },
            },
          }))

          // 更新子網使用情況
          set((state) => ({
            ipSubnets: state.ipSubnets.map((subnet) => {
              if (subnet.subnet === ip.subnet) {
                return {
                  ...subnet,
                  usedIPs: subnet.usedIPs + 1,
                  availableIPs: subnet.availableIPs - 1,
                }
              }
              return subnet
            }),
          }))

          // 添加通知
          const notificationStore = useNotificationStore.getState()
          notificationStore.addNotification({
            title: "IP Assigned",
            message: `IP address ${ip.address} has been assigned to ${device.name}.`,
            type: "success",
          })
        },

        // 釋放 IP
        releaseIP: (ipId: string) => {
          // 查找包含此 IP 的設備
          let deviceWithIP: DeviceInfo | undefined
          let ipToRelease: IPAddress | undefined

          Object.values(get().devices).forEach((device) => {
            if (device.ips) {
              const ip = device.ips.find((ip) => ip.id === ipId)
              if (ip) {
                deviceWithIP = device
                ipToRelease = ip
              }
            }
          })

          if (!deviceWithIP || !ipToRelease) return

          // 更新設備的 IP 列表
          set((state) => ({
            devices: {
              ...state.devices,
              [deviceWithIP!.id]: {
                ...deviceWithIP!,
                ips: deviceWithIP!.ips?.filter((ip) => ip.id !== ipId) || [],
              },
            },
          }))

          // 更新子網使用情況
          set((state) => ({
            ipSubnets: state.ipSubnets.map((subnet) => {
              if (subnet.subnet === ipToRelease!.subnet) {
                return {
                  ...subnet,
                  usedIPs: Math.max(0, subnet.usedIPs - 1),
                  availableIPs: subnet.availableIPs + 1,
                }
              }
              return subnet
            }),
          }))

          // 添加通知
          const notificationStore = useNotificationStore.getState()
          notificationStore.addNotification({
            title: "IP Released",
            message: `IP address ${ipToRelease.address} has been released from ${deviceWithIP.name}.`,
            type: "info",
          })
        },

        // 保留 IP
        reserveIP: (ip: IPAddress) => {
          // 查找一個可用的設備來存儲保留的 IP
          // 在實際應用中，可能需要一個專門的存儲結構來管理保留的 IP
          const devices = Object.values(get().devices)
          if (devices.length === 0) return

          // 使用第一個設備來存儲保留的 IP
          const device = devices[0]

          // 更新設備的 IP 列表
          set((state) => ({
            devices: {
              ...state.devices,
              [device.id]: {
                ...device,
                ips: [...(device.ips || []), ip],
              },
            },
          }))

          // 更新子網使用情況
          set((state) => ({
            ipSubnets: state.ipSubnets.map((subnet) => {
              if (subnet.subnet === ip.subnet) {
                return {
                  ...subnet,
                  reservedIPs: subnet.reservedIPs + 1,
                  availableIPs: subnet.availableIPs - 1,
                }
              }
              return subnet
            }),
          }))

          // 添加通知
          const notificationStore = useNotificationStore.getState()
          notificationStore.addNotification({
            title: "IP Reserved",
            message: `IP address ${ip.address} has been reserved.`,
            type: "success",
          })
        },
      }
    },
    {
      name: "data-center-storage", // 本地存儲的名稱
      partialize: (state) => ({
        dataCenters: state.dataCenters,
        devices: state.devices,
        ipSubnets: state.ipSubnets,
        services: state.services,
      }), // 存儲 dataCenters、devices、ipSubnets 和 services
    },
  ),
)
