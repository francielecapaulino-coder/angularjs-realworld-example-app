# Test Configuration Files Evidence

## Stryker Configuration (Frontend)
```json
{
  "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
  "_comment": "Generated for Angular 21 with signals support",
  "testRunner": "vitest",
  "testRunnerComment": "TypeScript unit testing with modern test runner",
  "reporters": ["html", "clear-text", "json"],
  "coverageAnalysis": "perTest",
  "thresholds": {
    "high": 85,
    "low": 70,
    "break": 60
  },
  "tempDirName": "stryker-tmp",
  "cleanTempDir": true,
  "plugins": ["@stryker-mutator/typescript"]
}
```

## Pitest Configuration (Backend)
```gradle
pitest {
    targetClasses = ['com.conduit.*']
    excludedClasses = ['*.Application']
    threads = 4
    outputFormats = ['HTML', 'XML']
    mutationThreshold = 70
    coverageThreshold = 80
    timestampedReports = false
    mutators = [
        'CONDITIONALS_BOUNDARY',
        'INCREMENTS', 
        'MATH',
        'NEGATE_CONDITIONALS'
    ]
}
```

## Cypress Configuration
```typescript
import { defineConfig } from 'cypress/config';

export default defineConfig({
  e2e: {
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    baseUrl: 'http://localhost:4200',
    setupNodeEvents(on, config) {
      // Task automation setup
    }
  }
});
```

## WebdriverIO Configuration  
```typescript
export const config: WebdriverIOConfig = {
  runner: 'local',
  specs: ['./wdio/specs/**/*.spec.ts'],
  maxInstances: 4,
  capabilities: [{
    browserName: 'chrome',
    'goog:chromeOptions': {
      args: ['--headless']
    }
  }]
};
```
