#!/bin/bash
# Setup script for Stryker mutation testing - Slice 029a

echo "🧬 Setting up Stryker mutation testing..."

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f1)
if [ "$NODE_VERSION" = "v10" ]; then
    echo "❌ Node.js 18+ is required. Found: $(node -v)"
    echo "💡 Use: source ~/.nvm/nvm.sh && nvm use 18"
    exit 1
fi

echo "✅ Node.js $(node -v) found"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Ensure reports directory exists
mkdir -p reports/mutation

# Clean previous mutations
echo "🧹 Cleaning previous mutations..."
rm -rf .stryker-temp reports/mutation/*

# Verify Stryker configuration
echo "✅ Validating Stryker configuration..."
if [ ! -f "stryker.config.json" ]; then
    echo "❌ Stryker config not found"
    exit 1
fi

# Check test basics
echo "🧪 Running basic test to ensure everything works..."
timeout 30s npm test -- --watch=false --browsers=ChromeHeadless > /dev/null 2>&1
TEST_RESULT=$?

if [ $TEST_RESULT -eq 0 ]; then
    echo "✅ Tests are working"
else
    echo "⚠️ Some tests may be failing - mutation testing will reflect this"
fi

echo ""
echo "🚀 Setup complete!"
echo ""
echo "Available commands:"
echo "  npm run test:mutation          # Full mutation testing"
echo "  npm run test:mutation:report   # With detailed reports"
echo "  npm run test:mutation:quick    # Faster mutations for CI"
echo ""
echo "Reports will be generated in: reports/mutation/"