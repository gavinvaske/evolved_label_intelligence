const { connectToTestDatabase, clearTestDatabase, isTestDbRunning, closeTestDatabase } = require('../../test/sharedTestDatabase');
const { seedTestDatabase } = require('../support/seedTestDatabase');

module.exports = (on, config) => {
    on('before:run', async () => {
        // First, check if the API has already created a database
        if (!isTestDbRunning()) throw new Error('No test database URI found. Make sure the API server is running first!');
        if (process.env.NODE_ENV !== 'test') throw new Error('Cypress tests must be run in test mode! This is to prevent accidental deletion of production data.');
        // Connect to the existing database instance
        await connectToTestDatabase();
        // Seed the database
        await seedTestDatabase();
    });

    on('after:run', async () => {
        await closeTestDatabase();
    });

    on('task', {
        clearDatabase: async () => {
            await clearTestDatabase();
            return null;
        }
    });

    return config;
};