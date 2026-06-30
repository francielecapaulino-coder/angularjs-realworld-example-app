#!/bin/bash
# Setup script for Pitest mutation testing - Slice 029b

echo "🧬 Setting up Pitest mutation testing for Spring Boot..."

# Check Java version
if ! command -v Java &> /dev/null; then
    echo "❌ Java is required but not installed"
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | head -1 | cut -d'"' -f2 | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 25 ]; then
    echo "⚠️ Java 25+ recommended for Spring Boot 4.0.3"
    echo "📊 Found version: $(java -version 2>&1 | head -1)"
    echo "⚠️ May cause warnings but should work"
fi

# Check Gradle
if ! command -v gradle &> /dev/null && [ ! -f "./gradlew" ]; then
    echo "❌ Gradle or gradlew required"
    exit 1
fi

echo "✅ Java $(java -version 2>&1 | head -1) found"

# Ensure reports directory exists
mkdir -p build/reports/pitest

# Clean previous builds
echo "🧹 Cleaning previous builds..."
if command -v gradle &> /dev/null; then
    gradle clean > /dev/null 2>&1
else
    ./gradlew clean > /dev/null 2>&1
fi

# Download dependencies
echo "📦 Downloading dependencies..."
if command -v gradle &> /dev/null; then
    gradle build -x test > /dev/null 2>&1
else
    ./gradlew build -x test > /dev/null 2>&1
fi

BUILD_RESULT=$?
if [ $BUILD_RESULT -ne 0 ]; then
    echo "❌ Build failed - check dependencies"
    exit 1
fi

# Verify Pitest plugin
echo "✅ Validating Pitest configuration..."
if ! grep -q "info.solidsoft.pitest" build.gradle; then
    echo "❌ Pitest plugin not found in build.gradle"
    exit 1
fi

# Run basic tests
echo "🧪 Running basic tests to ensure everything works..."
if command -v gradle &> /dev/null; then
    gradle test --quiet > /dev/null 2>&1
else
    ./gradlew test --quiet > /dev/null 2>&1
fi

TEST_RESULT=$?
if [ $TEST_RESULT -eq 0 ]; then
    echo "✅ Tests are working"
else
    echo "⚠️ Some tests may be failing - mutation will reflect this"
fi

echo ""
echo "🚀 Setup complete!"
echo ""
echo "Available commands:"
echo "  ./gradlew pitest                # Full mutation testing"
echo "  ./gradlew pitest --info         # Detailed mutation output"
echo "  ./gradlew test                  # Unit tests only"
echo ""
echo "Reports will be generated in: build/reports/pitest/"