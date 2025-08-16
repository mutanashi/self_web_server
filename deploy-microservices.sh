#!/bin/bash

echo "🚀 Deploying Microservices Architecture"

# Create shared network
echo "📡 Creating microservices network..."
docker network create microservices 2>/dev/null || echo "Network already exists"

# Stop old services
echo "🛑 Stopping old monolithic services..."
docker-compose down 2>/dev/null || true

# Deploy each service
echo "🔧 Deploying NGINX Gateway..."
cd ~/self_web_server/nginx && docker-compose up -d

echo "🖥️  Deploying Device Management Service..."
cd ~/self_web_server/web_tools/device_management && docker-compose up -d

echo "💰 Deploying Salary Tool Service..."
cd ~/self_web_server/web_tools/salary_tool && docker-compose up -d

# Health check
echo "🏥 Checking service health..."
sleep 15

echo "Checking NGINX..."
curl -f http://localhost/health 2>/dev/null && echo "✅ NGINX healthy" || echo "❌ NGINX not healthy"

echo "Checking Device Management..."
curl -f http://localhost:8000/ 2>/dev/null && echo "✅ Device Management healthy" || echo "❌ Device Management not healthy"

echo "Checking Salary Tool..."
curl -f http://localhost:8080/ 2>/dev/null && echo "✅ Salary Tool healthy" || echo "❌ Salary Tool not healthy"

echo "✅ Microservices deployment complete!"
echo ""
echo "🌐 Services available at:"
echo "  - Main Site: http://localhost/"
echo "  - Device Management: http://localhost/web_tools/device_management/"
echo "  - Salary Tool: http://localhost/web_tools/salary_tool/"
echo ""
echo "🔍 Direct service access:"
echo "  - Device Management: http://localhost:8000/"
echo "  - Salary Tool: http://localhost:8080/"
