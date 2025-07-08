CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  passwordHash TEXT NOT NULL,
  userLevel TEXT DEFAULT 'user',
  token TEXT
);

INSERT INTO users (id, uuid, username, passwordHash, userLevel, token) VALUES (
  0,
  '00000000-0000-0000-0000-000000000000',
  'admin',
  '$2b$10$SY7w2MGHOLMfhJGTpxyiXObHKH1exSrnXvR5cvB1CgZM.68FPAWqS', -- hash for '1234'
  'admin',
  NULL
);


CREATE TABLE data_centers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

INSERT INTO data_centers (id, name) VALUES 
  ('dc-1', 'DC-A'),
  ('dc-2', 'DC-B');


CREATE TABLE rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  data_center_id TEXT,
  FOREIGN KEY (data_center_id) REFERENCES data_centers(id)
);

INSERT INTO rooms (id, name, data_center_id) VALUES 
  ('room-1', 'Room 1', 'dc-1'),
  ('room-2', 'Room 2', 'dc-1'),
  ('room-3', 'Room A', 'dc-2'),
  ('room-4', 'Room B', 'dc-2');


CREATE TABLE racks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  total_units INTEGER NOT NULL,
  room_id TEXT,
  FOREIGN KEY (room_id) REFERENCES rooms(id)
);

INSERT INTO racks (id, name, total_units, room_id) VALUES 
  ('rack-1', 'Rack 1', 42, 'room-1'),
  ('rack-2', 'Rack 2', 42, 'room-1'),
  ('rack-3', 'Rack 3', 42, 'room-1'),
  ('rack-4', 'Rack 1', 42, 'room-2'),
  ('rack-5', 'Rack 2', 42, 'room-2'),
  ('rack-6', 'Rack 3', 42, 'room-2'),
  ('rack-7', 'Rack 1', 42, 'room-3'),
  ('rack-8', 'Rack 2', 42, 'room-3'),
  ('rack-9', 'Rack 1', 42, 'room-4');


CREATE TABLE devices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  model TEXT,
  size INTEGER,
  status TEXT,
  service_id TEXT,
  service_name TEXT,
  installation_date TEXT,
  last_updated TEXT,
  notes TEXT,
  power_consumption INTEGER
);

CREATE TABLE ip_addresses (
  id TEXT PRIMARY KEY,
  address TEXT NOT NULL,
  subnet TEXT NOT NULL,
  gateway TEXT,
  status TEXT,
  device_id TEXT,
  device_name TEXT,
  service_id TEXT,
  service_name TEXT,
  last_updated TEXT
);

CREATE TABLE ip_subnets (
  id TEXT PRIMARY KEY,
  subnet TEXT NOT NULL,
  description TEXT,
  total_ips INTEGER,
  used_ips INTEGER,
  available_ips INTEGER,
  reserved_ips INTEGER
);

INSERT INTO ip_subnets (id, subnet, description, total_ips, used_ips, available_ips, reserved_ips) VALUES 
  ('subnet-1', '192.168.1.0/24', 'Primary Network', 254, 120, 124, 10),
  ('subnet-2', '192.168.2.0/24', 'Secondary Network', 254, 85, 159, 10),
  ('subnet-3', '10.0.0.0/24', 'Management Network', 254, 45, 199, 10);


CREATE TABLE services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT,
  owner TEXT,
  department TEXT,
  criticality TEXT
);

INSERT INTO services (id, name, description, status, criticality, owner, department) VALUES 
  ('service-1', 'Web Application', 'Main company web application', 'Active', 'High', 'John Doe', 'IT'),
  ('service-2', 'Database Cluster', 'Primary database cluster', 'Active', 'Critical', 'Jane Smith', 'IT'),
  ('service-3', 'Email Server', 'Corporate email server', 'Maintenance', 'Medium', 'Mike Johnson', 'IT');


CREATE TABLE device_ips (
  device_id TEXT,
  ip_id TEXT,
  FOREIGN KEY (device_id) REFERENCES devices(id),
  FOREIGN KEY (ip_id) REFERENCES ip_addresses(id),
  PRIMARY KEY (device_id, ip_id)
);

CREATE TABLE rack_units (
  rack_id TEXT,
  position INTEGER,
  device_id TEXT,
  device_name TEXT,
  device_ip TEXT,
  device_size INTEGER,
  service_id TEXT,
  service_name TEXT,
  PRIMARY KEY (rack_id, position),
  FOREIGN KEY (rack_id) REFERENCES racks(id),
  FOREIGN KEY (device_id) REFERENCES devices(id)
);

