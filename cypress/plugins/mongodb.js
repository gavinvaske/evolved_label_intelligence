const { connectToTestMongoDatabase, closeDatabase } = require('../../application/api/services/databaseService');

const TEST_ENVIRONMENT = 'test';

// Force test environment for Cypress
process.env.NODE_ENV = TEST_ENVIRONMENT;

const mongoDbPlugin = (on, config) => {
    on('before:run', async () => {
        console.log('Connecting to test database');
        await connectToTestMongoDatabase();
    });

    on('after:run', async () => {
        console.log('Closing test database');
        await closeDatabase();
    });

    return config;
};

module.exports = mongoDbPlugin;
