#!/bin/bash
# Validation script for Pitest mutation testing - Slice 029b

echo "🧬 Validating Pitest Mutation Testing Setup..."

# Check components
echo "📋 Checking Components..."

# 1. Check Java version
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -1)
    echo "✅ $JAVA_VERSION found"
else
    echo "❌ Java not found"
    exit 1
fi

# 2. Check Gradle/gradlew
if [ -f "./gradlew" ]; then
    echo "✅ Gradle wrapper available"
    GRADLE_CMD="./gradlew"
elif command -v gradle &> /dev/null; then
    echo "✅ Gradle available"
    GRADLE_CMD="gradle"
else
    echo "❌ Gradle not found"
    exit 1
fi

# 3. Check build.gradle configuration
if grep -q "info.solidsoft.pitest" build.gradle; then
    echo "✅ Pitest plugin configured"
    
    if grep -q "pitest {" build.gradle; then
        echo "✅ Pitest configuration found"
    else
        echo "❌ Pitest configuration block missing"
        exit 1
    fi
else
    echo "❌ Pitest plugin not found"
    exit 1
fi

# 4. Check target classes exist
JAVA_FILES=$(find src/main/java -name "*.java" -not -name "*Test*" 2>/dev/null | wc -l)
if [ "$JAVA_FILES" -gt 0 ]; then
    echo "✅ Found $JAVA_FILES Java source files for mutation"
else
    echo "❌ No Java source files found"
    exit 1
fi

# 5. Check test files exist
TEST_FILES=$(find src/test/java -name "*.java" 2>/dev/null | wc -l)
if [ "$TEST_FILES" -gt 0 ]; then
    echo "✅ Found $TEST_FILES test files"
else
    echo "⚠️ No test files found - mutation testing may not work well"
fi

# 6. Check build configuration
if $GRADLE_CMD tasks | grep -q pitest; then
    echo "✅ Pitest task available"
else
    echo "❌ Pitest task not available"
    exit 1
fi

# 7. Verify dependencies
echo "📦 Checking dependencies..."
if $GRADLE_CMD dependencies --configuration testCompileClasspath | grep -q pitest; then
    echo "✅ Pitest dependencies resolved"
else
    echo "⚠️ Pitest dependencies may not be resolved"
fi

# 8. Check reports directory
if [ -d "build/reports" ]; then
    echo "✅ Build reports directory exists"
    mkdir -p build/reports/pitest 2>/dev/null
    echo "✅ Pitest reports directory ready"
else
    mkdir -p build/reports/pitest
    echo "✅ Build and reports directories created"
fi

echo ""
echo "🎯 Configuration Summary:"
if grep -A 20 "pitest {" build.gradle; then
    echo ""
fi

# Extract key configuration values
MUTATION_THRESHOLD=$(grep "mutationThreshold" build.gradle | grep -o '[0-9]\+' | head -1)
COVERAGE_THRESHOLD=$(grep "coverageThreshold" build.gradle | grep -o '[0-9]\+' | head -1)
THREADS=$(grep "threads" build.gradle | grep -o '[0-9]\+' | head -1)

echo "  Thresholds: mutation=${MUTATION_THRESHOLD:-70}%, coverage=${COVERAGE_THRESHOLD:-80}%"
echo "  Performance: threads=${THREADS:-4}"
echo "  Output formats: HTML, XML, CSV"

echo ""
echo "🧬 Target Classes:"
find src/main/java -name "*.java" -not -name "*Test*" | sed 's|.*/src/main/java/||' | sed 's|\.java||' | sed 's|/|.|g'

echo ""
echo "🚀 Validation Complete!"
echo ""
echo "Ready to run mutation testing with:"
echo "  $GRADLE_CMD pitest                 # Full mutation testing"
echo "  $GRADLE_CMD pitest --info          # Detailed mutation output"
echo "  $GRADLE_CMD test -x pitest          # Tests only (no mutation)"
echo ""
echo "📊 Reports will appear in: build/reports/pitest/"