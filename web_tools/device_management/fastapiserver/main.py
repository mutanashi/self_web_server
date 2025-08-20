from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from typing import List, Optional
import os
import sqlite3
import json
from datetime import datetime

app = FastAPI(
    title="Device Management FastAPI Server",
    description="FastAPI server for device management operations",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Basic models
class Device(BaseModel):
    id: Optional[str] = None
    name: str
    model: Optional[str] = None
    size: Optional[int] = None
    status: str = "active"
    service_id: Optional[str] = None
    service_name: Optional[str] = None
    installation_date: Optional[str] = None
    last_updated: Optional[str] = None
    notes: Optional[str] = None
    power_consumption: Optional[int] = None
    user_id: Optional[int] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class DataCenter(BaseModel):
    id: Optional[str] = None
    name: str
    user_id: Optional[int] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class Room(BaseModel):
    id: Optional[str] = None
    name: str
    data_center_id: Optional[str] = None
    user_id: Optional[int] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class Rack(BaseModel):
    id: Optional[str] = None
    name: str
    total_units: int
    room_id: Optional[str] = None
    user_id: Optional[int] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class Service(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    status: str = "Active"
    owner: Optional[str] = None
    department: Optional[str] = None
    criticality: Optional[str] = None
    user_id: Optional[int] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    message: str
    version: str

# Database setup
DB_PATH = "/app/db/data_center.db"

def get_db_connection():
    """Get database connection"""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

def get_user_id_from_token(authorization: str = Header(None)) -> int:
    """Extract user_id from authorization header (simplified for now)"""
    # For now, we'll use a simple approach - in production, you'd validate JWT tokens
    if not authorization:
        # Default to admin user (id=0) for testing
        return 0
    
    # In a real implementation, you'd decode the JWT token and extract user_id
    # For now, we'll assume the token contains the user_id directly
    try:
        # This is a simplified approach - replace with proper JWT validation
        user_id = int(authorization.replace("Bearer ", ""))
        return user_id
    except:
        return 0

def init_database():
    """Initialize database with all tables if they don't exist"""
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            
            # Read and execute the SQL initialization file
            sql_file_path = "/app/SQL_data/init_data_center.sql"
            if os.path.exists(sql_file_path):
                with open(sql_file_path, 'r') as f:
                    sql_script = f.read()
                    cursor.executescript(sql_script)
                conn.commit()
                print("Database initialized successfully from SQL file")
            else:
                print(f"SQL file not found at {sql_file_path}")
                
        except Exception as e:
            print(f"Database initialization error: {e}")
        finally:
            conn.close()

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_database()

@app.get("/", response_model=HealthResponse)
async def root():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        message="Device Management FastAPI Server is running",
        version="1.0.0"
    )

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        message="Server is operational",
        version="1.0.0"
    )

# Data Centers endpoints
@app.get("/data-centers", response_model=List[DataCenter])
async def get_data_centers(user_id: int = Depends(get_user_id_from_token)):
    """Get all data centers for a user"""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM data_centers WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
        data_centers = []
        for row in cursor.fetchall():
            data_centers.append(DataCenter(
                id=row['id'],
                name=row['name'],
                user_id=row['user_id'],
                created_at=row['created_at'],
                updated_at=row['updated_at']
            ))
        return data_centers
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()

@app.post("/data-centers", response_model=DataCenter)
async def create_data_center(data_center: DataCenter, user_id: int = Depends(get_user_id_from_token)):
    """Create a new data center"""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        cursor = conn.cursor()
        data_center_id = f"dc-{int(datetime.now().timestamp())}"
        cursor.execute(
            "INSERT INTO data_centers (id, name, user_id) VALUES (?, ?, ?)",
            (data_center_id, data_center.name, user_id)
        )
        conn.commit()
        
        # Get the created data center
        cursor.execute("SELECT * FROM data_centers WHERE id = ?", (data_center_id,))
        row = cursor.fetchone()
        
        return DataCenter(
            id=row['id'],
            name=row['name'],
            user_id=row['user_id'],
            created_at=row['created_at'],
            updated_at=row['updated_at']
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()

# Rooms endpoints
@app.get("/rooms", response_model=List[Room])
async def get_rooms(user_id: int = Depends(get_user_id_from_token)):
    """Get all rooms for a user"""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM rooms WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
        rooms = []
        for row in cursor.fetchall():
            rooms.append(Room(
                id=row['id'],
                name=row['name'],
                data_center_id=row['data_center_id'],
                user_id=row['user_id'],
                created_at=row['created_at'],
                updated_at=row['updated_at']
            ))
        return rooms
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()

# Racks endpoints
@app.get("/racks", response_model=List[Rack])
async def get_racks(user_id: int = Depends(get_user_id_from_token)):
    """Get all racks for a user"""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM racks WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
        racks = []
        for row in cursor.fetchall():
            racks.append(Rack(
                id=row['id'],
                name=row['name'],
                total_units=row['total_units'],
                room_id=row['room_id'],
                user_id=row['user_id'],
                created_at=row['created_at'],
                updated_at=row['updated_at']
            ))
        return racks
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()

# Devices endpoints
@app.get("/devices", response_model=List[Device])
async def get_devices(user_id: int = Depends(get_user_id_from_token)):
    """Get all devices for a user"""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM devices WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
        devices = []
        for row in cursor.fetchall():
            devices.append(Device(
                id=row['id'],
                name=row['name'],
                model=row['model'],
                size=row['size'],
                status=row['status'],
                service_id=row['service_id'],
                service_name=row['service_name'],
                installation_date=row['installation_date'],
                last_updated=row['last_updated'],
                notes=row['notes'],
                power_consumption=row['power_consumption'],
                user_id=row['user_id'],
                created_at=row['created_at'],
                updated_at=row['updated_at']
            ))
        return devices
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()

@app.get("/devices/{device_id}", response_model=Device)
async def get_device(device_id: str, user_id: int = Depends(get_user_id_from_token)):
    """Get a specific device by ID"""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM devices WHERE id = ? AND user_id = ?", (device_id, user_id))
        row = cursor.fetchone()
        if row:
            return Device(
                id=row['id'],
                name=row['name'],
                model=row['model'],
                size=row['size'],
                status=row['status'],
                service_id=row['service_id'],
                service_name=row['service_name'],
                installation_date=row['installation_date'],
                last_updated=row['last_updated'],
                notes=row['notes'],
                power_consumption=row['power_consumption'],
                user_id=row['user_id'],
                created_at=row['created_at'],
                updated_at=row['updated_at']
            )
        raise HTTPException(status_code=404, detail="Device not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()

@app.post("/devices", response_model=Device)
async def create_device(device: Device, user_id: int = Depends(get_user_id_from_token)):
    """Create a new device"""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        cursor = conn.cursor()
        device_id = f"device-{int(datetime.now().timestamp())}"
        cursor.execute(
            "INSERT INTO devices (id, name, model, size, status, service_id, service_name, installation_date, notes, power_consumption, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (device_id, device.name, device.model, device.size, device.status, device.service_id, device.service_name, device.installation_date, device.notes, device.power_consumption, user_id)
        )
        conn.commit()
        
        # Get the created device
        cursor.execute("SELECT * FROM devices WHERE id = ?", (device_id,))
        row = cursor.fetchone()
        
        return Device(
            id=row['id'],
            name=row['name'],
            model=row['model'],
            size=row['size'],
            status=row['status'],
            service_id=row['service_id'],
            service_name=row['service_name'],
            installation_date=row['installation_date'],
            last_updated=row['last_updated'],
            notes=row['notes'],
            power_consumption=row['power_consumption'],
            user_id=row['user_id'],
            created_at=row['created_at'],
            updated_at=row['updated_at']
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()

@app.put("/devices/{device_id}", response_model=Device)
async def update_device(device_id: str, device_update: Device, user_id: int = Depends(get_user_id_from_token)):
    """Update an existing device"""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE devices SET name = ?, model = ?, size = ?, status = ?, service_id = ?, service_name = ?, installation_date = ?, notes = ?, power_consumption = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
            (device_update.name, device_update.model, device_update.size, device_update.status, device_update.service_id, device_update.service_name, device_update.installation_date, device_update.notes, device_update.power_consumption, device_id, user_id)
        )
        conn.commit()
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Device not found")
        
        # Get the updated device
        cursor.execute("SELECT * FROM devices WHERE id = ?", (device_id,))
        row = cursor.fetchone()
        
        return Device(
            id=row['id'],
            name=row['name'],
            model=row['model'],
            size=row['size'],
            status=row['status'],
            service_id=row['service_id'],
            service_name=row['service_name'],
            installation_date=row['installation_date'],
            last_updated=row['last_updated'],
            notes=row['notes'],
            power_consumption=row['power_consumption'],
            user_id=row['user_id'],
            created_at=row['created_at'],
            updated_at=row['updated_at']
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()

@app.delete("/devices/{device_id}")
async def delete_device(device_id: str, user_id: int = Depends(get_user_id_from_token)):
    """Delete a device"""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM devices WHERE id = ? AND user_id = ?", (device_id, user_id))
        conn.commit()
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Device not found")
        
        return {"message": f"Device {device_id} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()

# Services endpoints
@app.get("/services", response_model=List[Service])
async def get_services(user_id: int = Depends(get_user_id_from_token)):
    """Get all services for a user"""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM services WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
        services = []
        for row in cursor.fetchall():
            services.append(Service(
                id=row['id'],
                name=row['name'],
                description=row['description'],
                status=row['status'],
                owner=row['owner'],
                department=row['department'],
                criticality=row['criticality'],
                user_id=row['user_id'],
                created_at=row['created_at'],
                updated_at=row['updated_at']
            ))
        return services
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()

# User management endpoints
@app.get("/users/me")
async def get_current_user(user_id: int = Depends(get_user_id_from_token)):
    """Get current user information"""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id, uuid, username, userLevel FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        if row:
            return {
                "id": row['id'],
                "uuid": row['uuid'],
                "username": row['username'],
                "userLevel": row['userLevel']
            }
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()

@app.put("/users/username")
async def update_username(username_update: dict, user_id: int = Depends(get_user_id_from_token)):
    """Update username for current user"""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        new_username = username_update.get('username')
        if not new_username:
            raise HTTPException(status_code=400, detail="Username is required")
        
        cursor = conn.cursor()
        
        # Check if username already exists
        cursor.execute("SELECT id FROM users WHERE username = ? AND id != ?", (new_username, user_id))
        if cursor.fetchone():
            raise HTTPException(status_code=409, detail="Username already exists")
        
        # Update username
        cursor.execute("UPDATE users SET username = ? WHERE id = ?", (new_username, user_id))
        conn.commit()
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get updated user info
        cursor.execute("SELECT id, uuid, username, userLevel FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        
        return {
            "id": row['id'],
            "uuid": row['uuid'],
            "username": row['username'],
            "userLevel": row['userLevel'],
            "message": "Username updated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()

@app.put("/users/password")
async def update_password(password_update: dict, user_id: int = Depends(get_user_id_from_token)):
    """Update password for current user"""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        current_password = password_update.get('currentPassword')
        new_password = password_update.get('newPassword')
        
        if not current_password or not new_password:
            raise HTTPException(status_code=400, detail="Current and new password are required")
        
        cursor = conn.cursor()
        
        # Verify current password
        cursor.execute("SELECT passwordHash FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="User not found")
        
        # In a real implementation, you'd hash and verify the current password
        # For now, we'll assume the current password is correct
        # import bcrypt
        # if not bcrypt.checkpw(current_password.encode('utf-8'), row['passwordHash'].encode('utf-8')):
        #     raise HTTPException(status_code=401, detail="Current password is incorrect")
        
        # Hash new password
        # new_password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
        # For now, we'll use a simple hash (replace with proper bcrypt in production)
        new_password_hash = f"$2b$10$hash_for_{new_password}"
        
        # Update password
        cursor.execute("UPDATE users SET passwordHash = ? WHERE id = ?", (new_password_hash, user_id))
        conn.commit()
        
        return {"message": "Password updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
