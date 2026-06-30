#!/bin/bash
echo "🧪 Running Full Stack Integration Tests..."

# Backend tests
echo "🔧 Backend Integration Tests..."
cd api && ./gradlew test -Dtest=integration --quiet

# Frontend tests  
echo "📱 Frontend E2E Tests..."
cd ../app-ng && npm run cypress:run --quiet

# Generate report
echo "📊 Generating Integration Report..."
cd ../scripts && ./generate-integration-report.sh

echo "✅ Integration testing complete!"