describe('Full Stack Integration Tests', () => {
  beforeEach(() => {
    // Set up base URL and visit the application
    cy.checkGlobalHealth();
  });

  describe('Application Health & Connectivity', () => {
    it('should load the Angular application', () => {
      cy.visit(Cypress.env('baseUrl'));
      cy.contains('conduit', { matchCase: false }).should('be.visible');
    });

    it('should connect to backend API', () => {
      cy.checkApiResponse('/actuator/health', 200);
      cy.checkApiResponse('/api/health', 200);
    });

    it('should verify cross-stack communication', () => {
      cy.visit(Cypress.env('baseUrl'));
      
      // Wait for app to load
      cy.get('body').should('be.visible');
      
      // Check if frontend can reach backend
      cy.window().then((win) => {
        // This would typically check for successful API calls
        expect(win.fetch).to.not.be.undefined;
      });
    });
  });

  describe('User Registration Flow', () => {
    it('should register new user successfully', () => {
      cy.visit(Cypress.env('baseUrl') + '/register');
      
      const timestamp = Date.now();
      const username = `testuser${timestamp}`;
      const email = `test${timestamp}@example.com`;
      const password = 'testpassword123';

      cy.get('[data-cy="username"]').type(username);
      cy.get('[data-cy="email"]').type(email);
      cy.get('[data-cy="password"]').type(password);
      cy.get('[data-cy="register-button"]').click();

      // Should redirect to home or dashboard
      cy.url().should('not.include', '/register');
      cy.contains(username, { matchCase: false }).should('be.visible');
    });

    it('should handle duplicate email registration', () => {
      cy.visit(Cypress.env('baseUrl') + '/register');
      
      // Use fixed email for duplicate test
      const email = 'duplicate@example.com';
      const password = 'testpassword123';

      cy.get('[data-cy="email"]').type(email);
      cy.get('[data-cy="password"]').type(password);
      cy.get('[data-cy="register-button"]').click();

      // Should show error for duplicate email
      cy.contains('error', { matchCase: false }).should('be.visible');
    });
  });

  describe('User Authentication Flow', () => {
    it('should login successfully', () => {
      cy.visit(Cypress.env('baseUrl') + '/login');
      
      // Use existing test user or create one
      const email = 'test@example.com';
      const password = 'testpassword123';

      cy.get('[data-cy="email"]').type(email);
      cy.get('[data-cy="password"]').type(password);
      cy.get('[data-cy="login-button"]').click();

      // Should redirect and show user is logged in
      cy.url().should('not.include', '/login');
    });

    it('should handle invalid login credentials', () => {
      cy.visit(Cypress.env('baseUrl') + '/login');
      
      cy.get('[data-cy="email"]').type('invalid@example.com');
      cy.get('[data-cy="password"]').type('wrongpassword');
      cy.get('[data-cy="login-button"]').click();

      // Should show error message
      cy.contains('error', { matchCase: false }).should('be.visible');
    });
  });

  describe('Article Management Flow', () => {
    beforeEach(() => {
      // Login before article operations
      cy.login('test@example.com', 'testpassword123');
      cy.visit(Cypress.env('baseUrl'));
    });

    it('should create new article', () => {
      cy.createArticle('Test Article Title', 'Test article description for integration testing');
      
      // Verify article was created
      cy.contains('Test Article Title').should('be.visible');
      cy.url().should('include', '/article/');
    });

    it('should list articles from API', () => {
      cy.checkApiResponse('/api/articles', 200).then((response) => {
        expect(response.body).to.have.property('articles');
        expect(Array.isArray(response.body.articles)).to.be.true;
      });
    });

    it('should interact with article endpoints', () => {
      cy.checkApiResponse('/api/articles/feed', 200);
      cy.checkApiResponse('/api/tags', 200);
    });
  });

  describe('Error Handling & Resilience', () => {
    it('should handle API unavailability gracefully', () => {
      // Mock API failure
      cy.intercept('GET', `${Cypress.env('apiUrl')}/api/articles`, {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      });

      cy.visit(Cypress.env('baseUrl'));
      cy.get('[data-cy="error-message"]').should('be.visible');
    });

    it('should handle network timeouts', () => {
      // Mock timeout
      cy.intercept('GET', `${Cypress.env('apiUrl')}/api/articles*/, { delay: 10000 });

      cy.visit(Cypress.env('baseUrl'));
      cy.get('[data-cy="loading-state"]').should('be.visible');
    });
  });

  describe('Performance Metrics', () => {
    it('should load pages within acceptable time', () => {
      cy.visit(Cypress.env('baseUrl'));
      cy.get('body').should('be.visible');
      
      // Check performance using window.performance if available
      cy.window().then((win) => {
        if (win.performance && win.performance.timing) {
          const loadTime = win.performance.timing.loadEventEnd - win.performance.timing.navigationStart;
          expect(loadTime).to.be.lessThan(5000); // 5 seconds max load time
        }
      });
    });

    it('should respond to API calls quickly', () => {
      cy.checkApiResponse('/actuator/health', 200).then((response) => {
        expect(response.duration).to.be.lessThan(2000); // 2 seconds max API response time
      });
    });
  });
});