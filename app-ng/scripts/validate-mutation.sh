#!/bin/bash
# Validation script for mutation testing - Slice 029a

echo "🧬 Validating Stryker Mutation Testing Setup..."

# Use Node.js 18+
source ~/.nvm/nvm.sh 2>/dev/null
nvm use 18 2>/dev/null || echo "Using system Node.js"

# Check components
echo "📋 Checking Components..."

# 1. Check Stryker package
if npm list @stryker-mutator/core > /dev/null 2>&1; then
    echo "✅ Stryker package installed"
else
    echo "❌ Stryker package missing"
    exit 1
fi

# 2. Check configuration
if [ -f "stryker.config.json" ]; then
    echo "✅ Stryker configuration found"
    
    # Validate JSON
    if python3 -m json.tool stryker.config.json > /dev/null 2>&1; then
        echo "✅ Configuration JSON valid"
    else
        echo "❌ Configuration JSON invalid"
        exit 1
    fi
else
    echo "❌ Stryker configuration missing"
    exit 1
fi

# 3. Check npm scripts
if npm run | grep -q "test:mutation"; then
    echo "✅ Mutation scripts configured"
    
    if npm run | grep -q "test:mutation:report"; then
        echo "✅ Enhanced scripts available"
    fi
else
    echo "❌ Mutation scripts missing"
    exit 1
fi

# 4. Check reports directory
if [ -d "reports/mutation" ]; then
    echo "✅ Reports directory ready"
else
    echo "❌ Reports directory missing"
    mkdir -p reports/mutation
    echo "✅ Reports directory created"
fi

# 5. Check Node.js version
NODE_MAJOR=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_MAJOR" -ge 18 ]; then
    echo "✅ Node.js $(node -v) supported"
else
    echo "⚠️ Node.js $(node -v) - upgrade recommended"
fi

# 6. Check TypeScript files for mutation
if find src -name "*.ts" -not -name "*.spec.ts" | head -1 > /dev/null 2>&1; then
    FILES_COUNT=$(find src -name "*.ts" -not -name "*.spec.ts" | wc -l)
    echo "✅ Found $FILES_COUNT TypeScript files to mutate"
else
    echo "❌ No TypeScript files found"
    exit 1
fi

echo ""
echo "🎯 Configuration Summary:"
echo "  Thresholds: high=85%, low=70%, break=60%"
echo "  Timeout: 30s"
echo "  Concurrency: 4"
echo "  Reporters: html, json, clear-text, progress"

# Show mutation targets
echo ""
echo "🎯 Mutation Targets:"
if grep -A 20 '"mutate"' stryker.config.json; then
    echo ""
fi

echo ""
echo "🚀 Validation Complete!"
echo ""
echo "Ready to run mutation testing with:"
echo "  npm run test:mutation          # Full testing"
echo "  npm run test:mutation:report   # Detailed reports"
echo "  npm run test:mutation:quick    # Quick testing"
echo ""
echo "📊 Reports will appear in: reports/mutation/"