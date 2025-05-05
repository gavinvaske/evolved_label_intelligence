const { defineConfig } = require('cypress');
const mongodbPlugin = require('./cypress/plugins/mongodb.js');
const dotenv = require('dotenv');
const { exec } = require('child_process');

dotenv.config();

const SERVER_STARTUP_DELAY = 2000; // 2 seconds
let apiServer;

module.exports = defineConfig({
    e2e: {
        setupNodeEvents(on, config) {
            on('before:run', async () => {
                // Start the API server in test mode
                apiServer = exec('npm run start:test');
                await new Promise(resolve => setTimeout(resolve, SERVER_STARTUP_DELAY)); // Wait for server to start
            });

            on('after:run', async () => {
                // Stop the API server
                if (apiServer) {
                    apiServer.kill();
                }
            });

            return mongodbPlugin(on, config);
        },
        baseUrl: process.env.BASE_URL || 'http://localhost:8080',
        specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
        supportFile: 'cypress/support/commands.ts',
        testIsolation: true,
        env: {
            // Override API URL to use the in-memory database during tests
            API_URL: 'http://localhost:8080',
            NODE_ENV: 'test'
        }
    }
}); 