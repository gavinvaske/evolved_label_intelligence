import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { connectToMongoDatabase, closeDatabase, clearDatabase } from './databaseService.js';

let mongod;

const mongodbPlugin = async (on, config) => {
    on('before:run', async () => {
        // Start MongoDB memory server before all tests
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        await connectToMongoDatabase(uri);
    });

    on('after:run', async () => {
        // Clean up after all tests
        await closeDatabase();
        await mongod.stop();
    });

    on('task', {
        // Task to clear the database between tests
        async clearDatabase() {
            await clearDatabase();
            return null;
        },
        // Task to seed the database with test data
        async seedDatabase({ model, data }) {
            const Model = mongoose.model(model);
            await Model.insertMany(data);
            return null;
        }
    });

    return config;
};

export default mongodbPlugin; 