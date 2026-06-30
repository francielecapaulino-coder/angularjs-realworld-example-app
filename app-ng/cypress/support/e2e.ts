// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

beforeEach(() => {
  // Clear local storage before each test
  cy.clearLocalStorage();
  cy.clearCookies();
});

// Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing on uncaught exceptions
  if (err.message.includes('Non-Error promise rejection')) {
    return false;
  }
  return true;
});