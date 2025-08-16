#!/bin/bash

echo "🧹 Cleaning up all services..."

# Stop all containers
echo "Stopping containers..."
docker stop nginx-gateway device-management-service salary-tool-service salary_app salary_postgres 2>/dev/null || true

# Remove all containers
echo "Removing containers..."
docker rm nginx-gateway device-management-service salary-tool-service salary_app salary_postgres 2>/dev/null || true

# Remove orphaned containers
echo "Removing orphaned containers..."
docker container prune -f

# Remove unused networks
echo "Cleaning up networks..."
docker network rm microservices 2>/dev/null || true

# Remove unused volumes (be careful with this)
echo "Cleaning up unused volumes..."
docker volume prune -f

echo "✅ Cleanup complete!"
