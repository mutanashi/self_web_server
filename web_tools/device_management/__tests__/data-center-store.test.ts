// __tests__/data-center-store.test.ts
import { useDataCenterStore } from '../lib/data-center-store'

describe('DataCenterStore - addDataCenter', () => {
  beforeEach(() => {
    // 每次測試都重置狀態
    useDataCenterStore.setState({
      dataCenters: [],
      devices: {},
      services: {},
      ipSubnets: [],
    } as any)  // 可使用 as any 繞過複雜型別
  })

  it('should add a new data center with the given name', () => {
    const name = 'Test DC'
    const id = useDataCenterStore.getState().addDataCenter(name)
    const dataCenters = useDataCenterStore.getState().dataCenters

    expect(dataCenters.length).toBe(1)
    expect(dataCenters[0].id).toBe(id)
    expect(dataCenters[0].name).toBe(name)
    expect(dataCenters[0].rooms).toEqual([])
  })

  it('should add a room to a data center', () => {
    const dcId = useDataCenterStore.getState().addDataCenter('DC-1')
    const roomName = 'Room A'
    const roomId = useDataCenterStore.getState().addRoom(dcId, roomName)

    const dc = useDataCenterStore.getState().dataCenters.find(dc => dc.id === dcId)!
    const room = dc.rooms.find(r => r.id === roomId)

    expect(dc.rooms.length).toBe(1)
    expect(room).toBeDefined()
    expect(room!.name).toBe(roomName)
    expect(room!.racks).toEqual([])
  })

  it('should add a rack to a room in a data center', () => {
    const dcId = useDataCenterStore.getState().addDataCenter('DC-1')
    const roomId = useDataCenterStore.getState().addRoom(dcId, 'Room A')

    const rackName = 'Rack 1'
    const totalUnits = 20
    const rackId = useDataCenterStore.getState().addRack(dcId, roomId, rackName, totalUnits)

    const dc = useDataCenterStore.getState().dataCenters.find(dc => dc.id === dcId)!
    const room = dc.rooms.find(r => r.id === roomId)!
    const rack = room.racks.find(r => r.id === rackId)

    expect(room.racks.length).toBe(1)
    expect(rack).toBeDefined()
    expect(rack!.name).toBe(rackName)
    expect(rack!.totalUnits).toBe(totalUnits)
    expect(rack!.units).toHaveLength(totalUnits)
  })

  it('should add a device to a rack and update device store and rack units', () => {
    const store = useDataCenterStore.getState()
    const dcId = store.addDataCenter('DC-A')
    const roomId = store.addRoom(dcId, 'Room-A')
    const rackId = store.addRack(dcId, roomId, 'Rack-A', 10)

    const deviceInfo = {
      name: 'Device-01',
      size: 2,
      ips: [{ id: 'ip-1', address: '192.168.0.10', subnet: '192.168.0.0/24' }],
    }

    const startPosition = 3
    const deviceId = store.addDevice(dcId, roomId, rackId, startPosition, deviceInfo)

    // 驗證 device store 是否被更新
    const device = useDataCenterStore.getState().devices[deviceId]
    expect(device).toBeDefined()
    expect(device.name).toBe(deviceInfo.name)
    expect(device.ips).toEqual(deviceInfo.ips)

    // 驗證機架單元是否有正確佔用位置
    const rack = useDataCenterStore.getState()
      .dataCenters.find(dc => dc.id === dcId)!.rooms
      .find(r => r.id === roomId)!.racks
      .find(r => r.id === rackId)!

    for (let i = startPosition - 1; i < startPosition - 1 + deviceInfo.size; i++) {
      const unit = rack.units[i]
      expect(unit.deviceId).toBe(deviceId)
      expect(unit.deviceName).toBe(deviceInfo.name)
      expect(unit.deviceIp).toBe(deviceInfo.ips[0].address)
      expect(unit.deviceSize).toBe(deviceInfo.size)
    }
  })
  it('should move a device from one rack to another', () => {
    const store = useDataCenterStore.getState()
    const dcId = store.addDataCenter('DC-1')
    const roomId = store.addRoom(dcId, 'Room-1')
    const rackA = store.addRack(dcId, roomId, 'Rack-A', 10)
    const rackB = store.addRack(dcId, roomId, 'Rack-B', 10)

    const deviceId = store.addDevice(dcId, roomId, rackA, 1, {
      name: 'Device-X',
      size: 2,
      ips: [],
    })

    store.moveDevice(dcId, roomId, rackA, deviceId, dcId, roomId, rackB, 5)

    const racks = useDataCenterStore.getState()
      .dataCenters.find(dc => dc.id === dcId)!.rooms.find(r => r.id === roomId)!.racks

    const rackAUnits = racks.find(r => r.id === rackA)!.units
    const rackBUnits = racks.find(r => r.id === rackB)!.units

    // rackA 應該清空該裝置位置
    expect(rackAUnits.slice(0, 2).every(unit => unit.deviceId === null)).toBe(true)

    // rackB 指定位置應該出現新裝置
    expect(rackBUnits[4].deviceId).toBe(deviceId)
    expect(rackBUnits[5].deviceId).toBe(deviceId)
  })

  it('should delete a device and clear its rack units', () => {
    const store = useDataCenterStore.getState()
    const dcId = store.addDataCenter('DC-1')
    const roomId = store.addRoom(dcId, 'Room-1')
    const rackId = store.addRack(dcId, roomId, 'Rack-1', 10)

    const deviceId = store.addDevice(dcId, roomId, rackId, 2, {
      name: 'Device-Y',
      size: 3,
      ips: [],
    })

    // 確保裝置有放上去
    let rack = useDataCenterStore.getState()
      .dataCenters.find(dc => dc.id === dcId)!.rooms.find(r => r.id === roomId)!.racks.find(r => r.id === rackId)!

    expect(rack.units[1].deviceId).toBe(deviceId)

    // 執行刪除
    store.deleteDevice(dcId, roomId, rackId, deviceId)

    // 重新檢查機架單元
    rack = useDataCenterStore.getState()
      .dataCenters.find(dc => dc.id === dcId)!.rooms.find(r => r.id === roomId)!.racks.find(r => r.id === rackId)!

    for (let i = 1; i <= 3; i++) {
      const unit = rack.units[i]
      expect(unit.deviceId).toBeNull()
      expect(unit.deviceName).toBeNull()
      expect(unit.deviceIp).toBeNull()
    }

    // 確保 devices store 也刪除了
    expect(useDataCenterStore.getState().devices[deviceId]).toBeUndefined()
  })

  it('should assign a device to a service', () => {
    const store = useDataCenterStore.getState()

    const dcId = store.addDataCenter('DC-1')
    const roomId = store.addRoom(dcId, 'Room-1')
    const rackId = store.addRack(dcId, roomId, 'Rack-1', 5)

    const serviceId = store.addService({
      name: 'Service-A',
      description: '',
      status: 'Active',
      criticality: 'High',
    })

    const deviceId = store.addDevice(dcId, roomId, rackId, 1, {
      name: 'Device-A',
      size: 2,
      ips: [],
    })

    useDataCenterStore.getState().assignDeviceToService(deviceId, serviceId)

    const state = useDataCenterStore.getState()

    const device = state.devices[deviceId]
    const service = state.services[serviceId]
    const rackUnits = state.dataCenters[0].rooms[0].racks[0].units

    expect(device.serviceId).toBe(serviceId)
    expect(service.devices).toContain(deviceId)
    expect(rackUnits[0].serviceId).toBe(serviceId)
    expect(rackUnits[0].serviceName).toBe(service.name)
  })

  it('should update a device and sync service if changed', () => {
    const store = useDataCenterStore.getState()

    const dcId = store.addDataCenter('DC-1')
    const roomId = store.addRoom(dcId, 'Room-1')
    const rackId = store.addRack(dcId, roomId, 'Rack-1', 5)

    const service1Id = store.addService({
      name: 'Service-One',
      description: '',
      status: 'Active',
      criticality: 'Medium',
    })
    const service2Id = store.addService({
      name: 'Service-Two',
      description: '',
      status: 'Active',
      criticality: 'Critical',
    })

    const deviceId = store.addDevice(dcId, roomId, rackId, 1, {
      name: 'Old Device',
      size: 2,
      ips: [],
      serviceId: service1Id,
    })

    console.log(deviceId, service1Id, service2Id)

    // ✅ 用最新狀態確認
    expect(useDataCenterStore.getState().services[service1Id].devices).toContain(deviceId)

    store.updateDevice(dcId, roomId, rackId, deviceId, {
      name: 'Updated Device',
      serviceId: service2Id,
      ips: [{ id: 'ip-1', address: '10.0.0.1', subnet: '10.0.0.0/24' }],
    })

    const state = useDataCenterStore.getState()
    const updatedDevice = state.devices[deviceId]
    const rackUnits = state.dataCenters[0].rooms[0].racks[0].units

    expect(updatedDevice.name).toBe('Updated Device')
    expect(updatedDevice.serviceId).toBe(service2Id)
    expect(updatedDevice.ips?.[0].address).toBe('10.0.0.1')

    expect(state.services[service1Id].devices).not.toContain(deviceId)
    expect(state.services[service2Id].devices).toContain(deviceId)

    expect(rackUnits[0].deviceName).toBe('Updated Device')
    expect(rackUnits[0].deviceIp).toBe('10.0.0.1')
    expect(rackUnits[0].serviceId).toBe(service2Id)
  })

  it('should update rack name and resize units array (truncate or extend)', () => {
    const store = useDataCenterStore.getState()

    const dcId = store.addDataCenter('DC-Test')
    const roomId = store.addRoom(dcId, 'Room-Test')
    const rackId = store.addRack(dcId, roomId, 'Rack-Original', 5)

    // 增加到更大的尺寸
    store.updateRack(dcId, roomId, rackId, 'Rack-Expanded', 8)
    let updatedRack = useDataCenterStore.getState()
      .dataCenters.find(dc => dc.id === dcId)!.rooms.find(r => r.id === roomId)!.racks.find(r => r.id === rackId)!

    expect(updatedRack.name).toBe('Rack-Expanded')
    expect(updatedRack.totalUnits).toBe(8)
    expect(updatedRack.units.length).toBe(8)

    // 縮小尺寸
    store.updateRack(dcId, roomId, rackId, 'Rack-Reduced', 3)
    updatedRack = useDataCenterStore.getState()
      .dataCenters.find(dc => dc.id === dcId)!.rooms.find(r => r.id === roomId)!.racks.find(r => r.id === rackId)!

    expect(updatedRack.name).toBe('Rack-Reduced')
    expect(updatedRack.totalUnits).toBe(3)
    expect(updatedRack.units.length).toBe(3)
  })
  it('should remove rack from a room', () => {
    const store = useDataCenterStore.getState();
    const dcId = store.addDataCenter('DC-X');
    const roomId = store.addRoom(dcId, 'Room-X');
    const rackId = store.addRack(dcId, roomId, 'Rack-X', 5);

    store.deleteRack(dcId, roomId, rackId);

    const room = useDataCenterStore.getState()
    .dataCenters.find(dc => dc.id === dcId)!.rooms.find(r => r.id === roomId)!;
    expect(room.racks.find(r => r.id === rackId)).toBeUndefined();
  })
  it('should update room name', () => {
    const store = useDataCenterStore.getState();
    const dcId = store.addDataCenter('DC-X');
    const roomId = store.addRoom(dcId, 'Room-X');

    store.updateRoom(dcId, roomId, 'Room-Y');

    const room = useDataCenterStore.getState()
    .dataCenters.find(dc => dc.id === dcId)!.rooms.find(r => r.id === roomId)!;
    expect(room.name).toBe('Room-Y');
  })
  it('should remove room from data center', () => {
    const store = useDataCenterStore.getState();
    const dcId = store.addDataCenter('DC-X');
    const roomId = store.addRoom(dcId, 'Room-X');

    store.deleteRoom(dcId, roomId);

    const dc = useDataCenterStore.getState()
    .dataCenters.find(dc => dc.id === dcId)!;
    expect(dc.rooms.find(r => r.id === roomId)).toBeUndefined();
  })
  it('should update data center name', () => {
    const store = useDataCenterStore.getState();
    const dcId = store.addDataCenter('DC-X');

    store.updateDataCenter(dcId, 'DC-Y');

    const dc = useDataCenterStore.getState()
    .dataCenters.find(dc => dc.id === dcId)!;
    expect(dc.name).toBe('DC-Y');
  })
  it('should remove data center from store', () => {
    const store = useDataCenterStore.getState();
    const dcId = store.addDataCenter('DC-X');

    store.deleteDataCenter(dcId);

    const dc = useDataCenterStore.getState()
    .dataCenters.find(dc => dc.id === dcId);
    expect(dc).toBeUndefined();
  })
  it('should assign IP to a device and update subnet usage', () => {
    const store = useDataCenterStore.getState();

    const dcId = store.addDataCenter('DC-A');
    const roomId = store.addRoom(dcId, 'Room-A');
    const rackId = store.addRack(dcId, roomId, 'Rack-A', 5);

    const deviceId = store.addDevice(dcId, roomId, rackId, 1, {
      name: 'Test Device',
      size: 1,
      ips: [],
    });

    const ip = {
      id: 'ip-1',
      address: '192.168.1.10',
      subnet: '192.168.1.0/24',
      deviceId: deviceId,
    };

    // ✅ 修正 subnet 和 cidr 傳入
    store.addSubnet('192.168.1.0', 'Test Subnet', '24');

    store.assignIP(ip);

    const state = useDataCenterStore.getState();
    expect(state.devices[deviceId].ips?.some(i => i.address === ip.address)).toBe(true);

    const subnet = state.ipSubnets.find(s => s.subnet === ip.subnet)!;
    expect(subnet.usedIPs).toBeGreaterThan(0);
    expect(subnet.availableIPs).toBeLessThan(subnet.totalIPs);
  });

  it('should release IP from a device and update subnet usage', () => {
    const store = useDataCenterStore.getState();

    const dcId = store.addDataCenter('DC-B');
    const roomId = store.addRoom(dcId, 'Room-B');
    const rackId = store.addRack(dcId, roomId, 'Rack-B', 5);

    const deviceId = store.addDevice(dcId, roomId, rackId, 1, {
      name: 'Device-B',
      size: 1,
      ips: [],
    });

    const ip = {
      id: 'ip-2',
      address: '192.168.1.20',
      subnet: '192.168.1.0/24',
      deviceId: deviceId,
    };

    // ✅ 修正 subnet 和 cidr 傳入
    store.addSubnet('192.168.1.0', 'Test Subnet', '24');

    store.assignIP(ip);
    store.releaseIP(ip.id);

    const state = useDataCenterStore.getState();
    expect(state.devices[deviceId].ips?.some(i => i.id === ip.id)).toBe(false);

    const subnet = state.ipSubnets.find(s => s.subnet === ip.subnet)!;
    expect(subnet.usedIPs).toBeLessThan(subnet.totalIPs);
    expect(subnet.availableIPs).toBeGreaterThan(0);
  });

  it('should reserve IP using the first available device and update subnet reserved count', () => {
    const store = useDataCenterStore.getState();

    const dcId = store.addDataCenter('DC-C');
    const roomId = store.addRoom(dcId, 'Room-C');
    const rackId = store.addRack(dcId, roomId, 'Rack-C', 5);

    const deviceId = store.addDevice(dcId, roomId, rackId, 1, {
      name: 'Reserve-Device',
      size: 1,
      ips: [],
    });

    const ip = {
      id: 'ip-3',
      address: '10.0.0.100',
      subnet: '10.0.0.0/24',
      deviceId: deviceId,
    };

    // ✅ 修正 subnet 和 cidr 傳入
    store.addSubnet('10.0.0.0', 'Test Subnet', '24');

    store.reserveIP(ip);

    const state = useDataCenterStore.getState();
    const assigned = Object.values(state.devices).some(d => d.ips?.some(i => i.address === ip.address));
    expect(assigned).toBe(true);

    const subnet = state.ipSubnets.find(s => s.subnet === ip.subnet)!;
    expect(subnet.reservedIPs).toBeGreaterThan(0);
    expect(subnet.availableIPs).toBeLessThan(subnet.totalIPs);
  });
  it('should add a subnet and verify it exists', () => {
    const store = useDataCenterStore.getState();
    const subnetId = store.addSubnet('10.1.1.0', 'Internal Subnet', '24');
    const found = store.getSubnets().find(s => s.id === subnetId);
    expect(found).toBeDefined();
    expect(found?.subnet).toBe('10.1.1.0/24');
  });

  it('should update a subnet description', () => {
    const store = useDataCenterStore.getState();
    const subnetId = store.addSubnet('10.2.0.0', 'Old Desc', '16');
    store.updateSubnet(subnetId, { description: 'New Description' });
    const updated = store.getSubnets().find(s => s.id === subnetId);
    expect(updated?.description).toBe('New Description');
  });

  it('should delete a subnet by ID', () => {
    const store = useDataCenterStore.getState();
    const subnetId = store.addSubnet('10.3.0.0', 'To Delete', '16');
    store.deleteSubnet(subnetId);
    const stillExists = store.getSubnets().some(s => s.id === subnetId);
    expect(stillExists).toBe(false);
  });

  it('should get a service by ID', () => {
    const store = useDataCenterStore.getState();
    const serviceId = store.addService({
      name: 'Service Get',
      description: 'Testing',
      status: 'Active',
      criticality: 'Medium',
    });
    const service = store.getService(serviceId);
    expect(service).toBeDefined();
    expect(service?.name).toBe('Service Get');
  });
  it('should get a device by ID', () => {
    const store = useDataCenterStore.getState();
    const dcId = store.addDataCenter('DC-X');
    const roomId = store.addRoom(dcId, 'Room-X');
    const rackId = store.addRack(dcId, roomId, 'Rack-X', 5);

    const deviceId = store.addDevice(dcId, roomId, rackId, 1, {
      name: 'QueryDevice',
      size: 1,
      ips: [],
    });

    const foundDevice = store.getDevice(deviceId);
    expect(foundDevice).toBeDefined();
    expect(foundDevice?.name).toBe('QueryDevice');
  });

  it('should find a rack by ID and return its datacenter and room', () => {
    const store = useDataCenterStore.getState();
    const dcId = store.addDataCenter('DC-Y');
    const roomId = store.addRoom(dcId, 'Room-Y');
    const rackId = store.addRack(dcId, roomId, 'Rack-Y', 5);

    const result = store.findRack(rackId);
    expect(result).not.toBeNull();
    expect(result?.rack.id).toBe(rackId);
    expect(result?.datacenter.id).toBe(dcId);
    expect(result?.room.id).toBe(roomId);
  });

  it('should get all services', () => {
    const store = useDataCenterStore.getState();

    const serviceId1 = store.addService({
      name: 'Service-1',
      description: 'Test Service 1',
      status: 'Active',
      criticality: 'Low',
    });

    const serviceId2 = store.addService({
      name: 'Service-2',
      description: 'Test Service 2',
      status: 'Maintenance',
      criticality: 'Critical',
    });

    const services = store.getAllServices();
    const ids = services.map((s) => s.id);
    expect(ids).toContain(serviceId1);
    expect(ids).toContain(serviceId2);
  });

  it('should get all subnets', () => {
    const store = useDataCenterStore.getState();

    const subnetId = store.addSubnet('172.16.0.0', 'Private Subnet', '16');

    const subnets = store.getSubnets();
    expect(subnets.some((s) => s.id === subnetId)).toBe(true);
    expect(subnets.some((s) => s.subnet === '172.16.0.0/16')).toBe(true);
  });
  it('should remove a device from a service and update all related state', () => {
    const store = useDataCenterStore.getState();

    const dcId = store.addDataCenter('DC-RM');
    const roomId = store.addRoom(dcId, 'Room-RM');
    const rackId = store.addRack(dcId, roomId, 'Rack-RM', 5);

    const serviceId = store.addService({
      name: 'Removable Service',
      description: '',
      status: 'Active',
      criticality: 'Medium',
    });

    const deviceId = store.addDevice(dcId, roomId, rackId, 1, {
      name: 'LinkedDevice',
      size: 1,
      ips: [],
      serviceId,
    });

    const stateBefore = useDataCenterStore.getState();
    expect(stateBefore.services[serviceId].devices).toContain(deviceId);
    expect(stateBefore.devices[deviceId].serviceId).toBe(serviceId);

    store.removeDeviceFromService(deviceId, serviceId);

    const stateAfter = useDataCenterStore.getState();
    expect(stateAfter.devices[deviceId].serviceId).toBeNull();
    expect(stateAfter.services[serviceId].devices).not.toContain(deviceId);

    const rackUnit = stateAfter.dataCenters
      .find(dc => dc.id === dcId)!.rooms
      .find(r => r.id === roomId)!.racks
      .find(r => r.id === rackId)!.units
      .find(u => u.deviceId === deviceId);

    expect(rackUnit?.serviceId).toBeNull();
    expect(rackUnit?.serviceName).toBeNull();
  });
})
