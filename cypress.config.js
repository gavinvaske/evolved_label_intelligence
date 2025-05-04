const { defineConfig } = require('cypress');
const mongodbPlugin = require('./cypress/plugins/mongodb.js');
const dotenv = require('dotenv');

dotenv.config();

module.exports = defineConfig({
    e2e: {
        setupNodeEvents(on, config) {
            return mongodbPlugin(on, config);
        },
        baseUrl: process.env.BASE_URL || 'http://localhost:3000',
        specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
        supportFile: 'cypress/support/commands.ts',
        testIsolation: true,
    },
    env: {
        loginUsername: process.env.TEST_LOGIN_USERNAME,
        loginPassword: process.env.TEST_LOGIN_PASSWORD
    }
}); 