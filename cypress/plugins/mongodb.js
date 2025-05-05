const { connectToTestDatabase, clearTestDatabase, getTestDatabaseUri } = require('../../test/sharedTestDatabase');
const { seedTestDatabase } = require('../support/seedTestDatabase');
const fs = require('fs');
const path = require('path');

const DB_URI_FILE = path.resolve('./test-db-uri.txt');

module.exports = (on, config) => {
    on('before:run', async () => {
        // First, check if the API has already created a database
        if (!fs.existsSync(DB_URI_FILE)) {
            console.error('No database URI file found. Make sure the API server is running first!');
            process.exit(1);
        }

        // Read the existing URI
        const existingUri = fs.readFileSync(DB_URI_FILE, 'utf8');
        console.log('Using existing database URI from file:', existingUri);

        // Connect to the existing database instance
        await connectToTestDatabase();
        
        // Seed the database
        await seedTestDatabase();
        
        // Log the URI for debugging
        const dbUri = await getTestDatabaseUri();
        console.log('Cypress connected to existing test database with URI:', dbUri);
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
