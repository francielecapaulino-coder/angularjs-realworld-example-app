import { $, browser } from '@wdio/globals';
import LoginPage from '../pageobjects/login.page';
import HomePage from '../pageobjects/home.page';

describe('WebdriverIO Integration Tests', () => {
    beforeEach(async () => {
        await browser.url('http://localhost:4200');
        await browser.deleteCookies();
    });

    describe('Application Health Check', () => {
        it('should load the application correctly', async () => {
            await expect($('body')).isDisplayed();
            await expect($('h1')).toHaveTextContaining('conduit');
        });

        it('should connect to backend API', async () => {
            const response = await browser.execute(() => {
                return fetch('http://localhost:8081/actuator/health');
            });
            expect(response.ok).toBe(true);
        });

        it('should verify API endpoints are accessible', async () => {
            const endpoints = [
                'http://localhost:8081/actuator/health',
                'http://localhost:8081/api/health'
            ];

            for (const endpoint of endpoints) {
                const response = await browser.execute((url: string) => {
                    return fetch(url);
                }, endpoint);
                expect(response.ok).toBe(true);
            }
        });
    });

    describe('User Registration Flow', () => {
        it('should register a new user', async () => {
            await browser.url('http://localhost:4200/register');
            const timestamp = Date.now();
            
            await $('#username').setValue(`testuser${timestamp}`);
            await $('#email').setValue(`test${timestamp}@example.com`);
            await $('#password').setValue('testpassword123');
            await $('#registerButton').click();

            await browser.waitUntil(async () => {
                return !(await browser.getUrl()).includes('/register');
            }, { timeout: 10000 });
        });

        it('should show error for invalid registration', async () => {
            await browser.url('http://localhost:4200/register');
            await $('#email').setValue('invalid-email');
            await $('#password').setValue('123');
            await $('#registerButton').click();

            await expect($('.error-message')).toBeDisplayed();
        });
    });

    describe('Login Authentication', () => {
        it('should login with valid credentials', async () => {
            await browser.url('http://localhost:4200/login');
            await $('#email').setValue('test@example.com');
            await $('#password').setValue('testpassword123');
            await $('#loginButton').click();

            await browser.waitUntil(async () => {
                return !(await browser.getUrl()).includes('/login');
            }, { timeout: 10000 });
        });

        it('should reject invalid credentials', async () => {
            await browser.url('http://localhost:4200/login');
            await $('#email').setValue('invalid@example.com');
            await $('#password').setValue('wrongpassword');
            await $('#loginButton').click();

            await expect($('.error-message')).toBeDisplayed();
        });
    });

    describe('Article Management', () => {
        beforeEach(async () => {
            // Login first
            await browser.url('http://localhost:4200/login');
            await $('#email').setValue('test@example.com');
            await $('#password').setValue('testpassword123');
            await $('#loginButton').click();
            
            await browser.waitUntil(async () => {
                return !(await browser.getUrl()).includes('/login');
            }, { timeout: 10000 });
        });

        it('should create a new article', async () => {
            await $('#newArticle').click();
            await $('#articleTitle').setValue('Test Article');
            await $('#articleDescription').setValue('Test description for integration testing');
            await $('#publishArticle').click();

            await browser.waitUntil(async () => {
                return (await browser.getUrl()).includes('/article/');
            }, { timeout: 10000 });
        });

        it('should list articles from API', async () => {
            const articles = await browser.execute(async () => {
                const response = await fetch('http://localhost:8081/api/articles');
                const data = await response.json();
                return data.articles;
            });
            expect(Array.isArray(articles)).toBe(true);
        });
    });

    describe('Error Handling', () => {
        it('should handle API errors gracefully', async () => {
            // Intercept API call and return error
            await browser.execute(() => {
                const originalFetch = window.fetch;
                window.fetch = () => Promise.reject(new Error('Network error'));
            });

            await browser.url('http://localhost:4200');
            await expect($('.fallback-message')).toBeDisplayed();
        });

        it('should handle server errors', async () => {
            const response = await browser.execute(() => {
                return fetch('http://localhost:8081/api/nonexistent');
            });
            expect(response.status).toBe(404);
        });
    });

    describe('Performance Tests', () => {
        it('should load pages within acceptable time', async () => {
            const startTime = Date.now();
            await browser.url('http://localhost:4200');
            await $('body').waitForExist({ timeout: 5000 });
            const loadTime = Date.now() - startTime;
            
            expect(loadTime).toBeLessThan(3000); // 3 seconds max
        });

        it('should respond to API calls quickly', async () => {
            const startTime = Date.now();
            await browser.execute(async () => {
                return await fetch('http://localhost:8081/actuator/health');
            });
            const responseTime = Date.now() - startTime;
            
            expect(responseTime).toBeLessThan(2000); // 2 seconds max
        });
    });
});