const { connectToTestDatabase, clearTestDatabase, getTestDatabaseUri, isTestDbRunning } = require('../../test/sharedTestDatabase');
const { seedTestDatabase } = require('../support/seedTestDatabase');

module.exports = (on, config) => {
    on('before:run', async () => {
        // First, check if the API has already created a database
        if (!isTestDbRunning()) {
            console.error('No test database URI found. Make sure the API server is running first!');
            process.exit(1);
        }

        // Connect to the existing database instance
        await connectToTestDatabase();
        
        // Seed the database
        await seedTestDatabase();
    });

    on('after:run', async () => {
        // Don't delete the URI file - the API needs it
        // Just clear the database
        await clearTestDatabase();
    });

    on('task', {
        clearDatabase: async () => {
            await clearTestDatabase();
            return null;
        }
    });

    return config;
};
