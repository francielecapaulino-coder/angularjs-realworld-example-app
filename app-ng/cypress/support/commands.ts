// Custom Cypress commands for Conduit application

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      createArticle(title: string, description: string): Chainable<void>;
      addComment(content: string): Chainable<void>;
      checkApiResponse(endpoint: string, expectedStatus: number): Chainable<void>;
      checkGlobalHealth(): Chainable<void>;
    }
  }
}

// Login command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/api/users/login`,
    body: {
      user: {
        email: email,
        password: password
      }
    }
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body.user).to.have.property('token');
    
    // Store token for subsequent requests
    window.localStorage.setItem('jwtToken', response.body.user.token);
  });
});

// Create article command
Cypress.Commands.add('createArticle', (title: string, description: string) => {
  cy.get('[data-cy="new-article"]').click();
  cy.get('[data-cy="article-title"]').type(title);
  cy.get('[data-cy="article-description"]').type(description);
  cy.get('[data-cy="publish-article"]').click();
  cy.url().should('include', '/article/');
});

// Add comment command
Cypress.Commands.add('addComment', (content: string) => {
  cy.get('[data-cy="comment-input"]').type(content);
  cy.get('[data-cy="post-comment"]').click();
  cy.contains(content).should('be.visible');
});

// Check API response command
Cypress.Commands.add('checkApiResponse', (endpoint: string, expectedStatus: number) => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env('apiUrl')}${endpoint}`,
    failOnStatusCode: false
  }).then((response) => {
    expect(response.status).to.eq(expectedStatus);
    return cy.wrap(response);
  });
});

// Check global health command
Cypress.Commands.add('checkGlobalHealth', () => {
  // Check frontend application health
  cy.url().should('not.include', 'error');
  
  // Check backend API health
  cy.checkApiResponse('/actuator/health', 200);
  cy.checkApiResponse('/api/health', 200);
});

// Global beforeEach to set up request headers
beforeEach(() => {
  cy.intercept('GET', `${Cypress.env('apiUrl')}/**`, (req) => {
    const token = window.localStorage.getItem('jwtToken');
    if (token) {
      req.headers['Authorization'] = `Token ${token}`;
    }
  });
});

export {};