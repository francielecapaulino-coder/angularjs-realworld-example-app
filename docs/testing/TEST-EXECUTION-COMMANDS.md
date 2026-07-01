# Test Execution Commands Reference

## Frontend Tests (Angular 21)

### Unit Tests
```bash
cd app-ng
npm run test                    # Run all unit tests
npm run test:watch              # Watch mode
npm run test:coverage           # Generate coverage report
```

### Mutation Tests
```bash
cd app-ng
npm run test:mutation          # Run Stryker mutation testing
npm run test:mutation:report   # Generate HTML/JSON reports
npm run test:mutation:quick    # Quick mutation run
```

### E2E Tests
```bash
cd app-ng
npm run cypress:run           # Cypress E2E tests
npm run cypress:open          # Cypress interactive mode
npm run wdio                  # WebdriverIO tests
npm run test:e2e              # Run all E2E tests
```

## Backend Tests (Spring Boot)

### Unit Tests
```bash
cd api
./gradlew test                # Run all unit tests
./gradlew test --info         # Detailed output
./gradlew test --parallel     # Parallel execution
```

### Mutation Tests
```bash
cd api
./gradlew pitest              # Run Pitest mutation testing
./gradlew pitestDebug         # Debug mode
./gradlew mutate              # Quick mutation run
```

### Integration Tests
```bash
cd api
./gradlew test -Dtest=integration    # Integration tests only
./gradlew test -Dtest=DatabaseIntegrationTest
./gradlew test -Dtest=ApiIntegrationTest
```

## Full Stack Tests

### Complete Test Suite
```bash
./scripts/run-integration-tests.sh    # Full orchestration
./scripts/test-everything.sh         # All frameworks
./scripts/validation-suite.sh        # Production validation
```

### Docker-Based Testing
```bash
docker-compose up -d test-db          # Start test database
docker-compose run test-runner        # Execute tests
docker-compose down                   # Cleanup
```

## Quality Gates Commands

### Coverage Validation
```bash
# Frontend coverage check
npm run test:coverage | grep "All files"

# Backend coverage check  
./gradlew test | grep "Task :test"

# Mutation score validation
npm run test:mutation | grep "Mutation score"
./gradlew pitest | grep "Mutation score"
```

### CI/CD Pipeline Testing
```bash
# Local CI simulation
git add . && git commit -m "test: ci validation"
npm run build && npm run test && npm run test:e2e

# Production readiness validation
./scripts/production-ready-check.sh
```

## Monitoring Test Quality

### Flaky Test Detection
```bash
# Run tests multiple times
for i in {1..5}; do npm run test; done

# Performance baseline
time npm run test:mutation
time ./gradlew pitest
```

### Regression Testing
```bash
# Before changes
npm run test:coverage:baseline

# After changes  
npm run test:coverage:regression
./scripts/compare-reports.sh
```
