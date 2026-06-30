import { WebDriverOptions, Frameworks } from '@wdio/types';

export const config: WebDriverOptions.Testrunner = {
    // =====================
    // WebdriverIO Configuration
    // =====================
    runner: 'local',
    framework: 'mocha',
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },

    // =====================
    // Test Capabilities
    // =====================
    capabilities: [{
        browserName: 'chrome',
        'goog:chromeOptions': {
            args: [
                '--headless',
                '--no-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        }
    }],

    // =====================
    // Test Files
    // =====================
    specs: [
        './wdio/specs/**/*.ts'
    ],

    // =====================
    // Reporter Configuration
    // =====================
    reporters: ['spec', 'allure'],
    reportersOptions: {
        allure: {
            outputDir: './wdio/allure-results'
        }
    },

    // =====================
    // Hooks
    // =====================
    before: async function (capabilities, specs) {
        // Global setup
        await browser.url('http://localhost:4200');
    },

    beforeTest: async function (test, context) {
        // Test-specific setup
        await browser.deleteCookies();
        await browser.execute('localStorage.clear()');
    },

    // =====================
    // Environment Variables
    // =====================
    baseUrl: 'http://localhost:4200',
    apiUrl: 'http://localhost:8081',

    // =====================
    // Timeouts
    // =====================
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,

    // =====================
    // Services
    // =====================
    services: ['chromedriver'],
    servicesOptions: {
        chromedriver: {
            logFileName: 'wdio-chromedriver.log',
            args: ['--silent']
        }
    }
};