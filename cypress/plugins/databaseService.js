import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod;
const TEST_ENVIRONMENT = 'test';

// Force test environment for Cypress
process.env.NODE_ENV = TEST_ENVIRONMENT;

export const connectToMongoDatabase = async (databaseUrl) => {
    if (!databaseUrl) {
        throw new Error('Database URL is not defined');
    }

    await mongoose.connect(databaseUrl, {});
};

export const connectToTestMongoDatabase = async () => {
    if (process.env.NODE_ENV !== TEST_ENVIRONMENT) {
        throw Error('the test database can only be connected to from test environments');
    }

    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri(), {});
};

export const closeDatabase = async () => {
    if (process.env.NODE_ENV !== TEST_ENVIRONMENT) {
        throw Error('the database can ONLY be closed manually in test environments');
    }
    await mongoose.disconnect();
    await mongod.stop();
};

export const clearDatabase = async () => {
    if (process.env.NODE_ENV === 'test') {
        const { collections } = mongoose.connection;

        for (const collection of Object.values(collections)) {
            try {
                await collection.deleteMany({});
            } catch (err) {
                console.error(`Error clearing collection ${collection.name}:`, err);
            }
        }
    }
};