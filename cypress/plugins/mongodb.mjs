import mongoose from 'mongoose';
import { connectToTestMongoDatabase, closeDatabase, clearDatabase } from './databaseService.js';

const mongodbPlugin = async (on, config) => {
    on('before:run', async () => {
        // Start MongoDB memory server before all tests
        await connectToTestMongoDatabase();
    });

    on('after:run', async () => {
        // Clean up after all tests
        await closeDatabase();
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