#!/bin/bash
# Complete integration testing setup - Slice 029c

echo "🔧 Setting up integration testing environment..."

# Check prerequisites
echo "📋 Checking prerequisites..."

# Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is required but not installed"
    exit 1
fi

# Docker Compose
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is required but not installed"
    exit 1
fi

# Node.js for frontend tests
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed"
    exit 1
fi

# Java for backend tests
if ! command -v java &> /dev/null; then
    echo "❌ Java is required but not installed"
    exit 1
fi

# Gradle
if [ ! -f "./api/gradlew" ] && ! command -v gradle &> /dev/null; then
    echo "❌ Gradle is required but not installed"
    exit 1
fi

echo "✅ All prerequisites found"

# Setup backend integration tests
echo "🐍 Setting up backend integration tests..."
cd api

# Clean and build
echo "🧹 Cleaning backend..."
./gradlew clean > /dev/null 2>&1

# Download dependencies
echo "📦 Downloading backend dependencies..."
./gradlew build -x test > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Backend build failed"
    exit 1
fi

echo "✅ Backend setup complete"

# Setup frontend integration tests
echo "📱 Setting up frontend integration tests..."
cd ../app-ng

# Setup Node.js if needed
if [ ! -z ~/.nvm ]; then
    source ~/.nvm/nvm.sh
    nvm use 18 > /dev/null 2>&1
fi

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm install --quiet 2>/dev/null

# Check Cypress installation
if [ ! -d "node_modules/cypress" ]; then
    echo "📦 Installing Cypress..."
    npm install --save-dev cypress @types/cypress --quiet > /dev/null 2>&1
fi

# Check WebdriverIO installation
if [ ! -d "node_modules/@wdio" ]; then
    echo "📦 Installing WebdriverIO..."
    npm install --save-dev @wdio/cli @wdio/allure-reporter @wdio/local-runner @wdio/mocha-framework @wdio/spec-reporter wdio-chromedriver --quiet > /dev/null 2>&1
fi

echo "✅ Frontend setup complete"

# Start services for testing
echo "🚀 Starting services..."

# Start test containers and application stack
cd ..

# Stop any existing containers
docker compose down > /dev/null 2>&1

# Start with health checks
echo "🐳 Starting Docker containers..."
docker compose up -d > /dev/null 2>&1

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🏥 Checking service health..."

# Check backend health
BACKEND_HEALTH=$(curl -s http://localhost:8081/actuator/health 2>/dev/null | grep -o '"status":"[^"]*"' | cut -d'"' -f4 || echo "unknown")
echo "📊 Backend health: $BACKEND_HEALTH"

# Check frontend health
FRONTEND_HEALTH=$(curl -s http://localhost:8080 2>/dev/null && echo "up" || echo "down")
echo "📊 Frontend health: $FRONTEND_HEALTH"

# database health
DB_HEALTH=$(docker compose exec -T db pg_isready -U conduit 2>/dev/null && echo "up" || echo "down")
echo "📊 Database health: $DB_HEALTH"

echo ""
echo "🎉 Integration testing setup complete!"
echo ""
echo "Available commands:"
echo "  Backend Integration Tests:"
echo "    cd api && ./gradlew test -Dtest=integration"
echo "  Frontend Integration Tests:"
echo "    cd app-ng && npm run cypress:run"
echo "    cd app-ng && npm run wdio"
echo "  Full Stack Testing:"
echo "    cd scripts && ./run-integration-tests.sh"
echo ""
echo "📊 Services are running at:"
echo "  Frontend: http://localhost:8080"
echo "  Backend: http://localhost:8081" 
echo "  Database: localhost:5432"
echo "  Prometheus: http://localhost:9090"
echo ""
echo "📝 Test results will be in:"
echo "  Backend: api/build/reports/"
echo "  Cypress: app-ng/cypress/results/"
echo "  WebdriverIO: app-ng/wdio/allure-results/"