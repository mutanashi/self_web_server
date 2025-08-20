# FastAPI Server for Device Management

A basic FastAPI server for device management operations.

## Features

- Health check endpoints
- CRUD operations for devices
- CORS enabled
- Docker support
- Auto-generated API documentation

## Quick Start

### Using Docker (Recommended)

1. Build and run the server:
```bash
make rebuild
```

2. Check if the server is running:
```bash
make test
```

3. View logs:
```bash
make logs
```

### Using Python directly

1. Install dependencies:
```bash
make install
```

2. Run the server:
```bash
make dev
```

## API Endpoints

- `GET /` - Health check
- `GET /health` - Health check
- `GET /devices` - Get all devices
- `GET /devices/{device_id}` - Get specific device
- `POST /devices` - Create new device
- `PUT /devices/{device_id}` - Update device
- `DELETE /devices/{device_id}` - Delete device

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8001/docs
- ReDoc: http://localhost:8001/redoc

## Make Commands

- `make build` - Build Docker image
- `make up` - Start the server
- `make down` - Stop the server
- `make rebuild` - Rebuild and restart
- `make logs` - View logs
- `make exec` - Execute bash in container
- `make test` - Test health endpoint
- `make dev` - Run in development mode
- `make install` - Install Python dependencies

## Port

The server runs on port 8001 by default.
