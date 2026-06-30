#!/bin/bash
# Setup script for Slice 028 validation

echo "🚀 Setting up Slice 028 Validation Script..."

# Check Python version
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed"
    exit 1
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is required but not installed"
    exit 1
fi

 Check Docker Compose
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is required but not installed"
    exit 1
fi

# Install Python dependencies
echo "📦 Installing Python dependencies..."
python3 -m pip install -r requirements.txt

# Make script executable
echo "🔧 Making validation script executable..."
chmod +x validate-stack.py

# Create reports directory
mkdir -p reports

echo "✅ Setup complete!"
echo
echo "Usage examples:"
echo "  python3 validate-stack.py                    # Full validation with cleanup"
echo "  python3 validate-stack.py --verbose          #Detailed output"
echo "  python3 validate-stack.py --no-cleanup        # Keep stack running"
echo "  python3 validate-stack.py --cleanup-only     # Just cleanup stack"
echo