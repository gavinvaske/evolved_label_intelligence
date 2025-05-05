const { connectToTestMongoDatabase, closeDatabase } = require('../../application/api/services/databaseService');
const { seedTestDatabase } = require('../../test/seedTestDatabase');

const TEST_ENVIRONMENT = 'test';

// Force test environment for Cypress
process.env.NODE_ENV = TEST_ENVIRONMENT;

const mongoDbPlugin = (on, config) => {
    on('before:run', async () => {
        console.log('Connecting to test database...');
        await connectToTestMongoDatabase();
        await seedTestDatabase();
        console.log('Test database connected and seeded');
    });

    on('after:run', async () => {
        console.log('Closing test database...');
        await closeDatabase();
        console.log('Test database closed');
    });

    return config;
};

module.exports = mongoDbPlugin;
