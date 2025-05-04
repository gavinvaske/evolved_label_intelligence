const mongoose = require('mongoose');
const { connectToTestMongoDatabase, closeDatabase, clearDatabase } = require('./databaseService.js');
const { UserModel } = require('../../application/api/models/user.ts');
const { MaterialCategoryModel } = require('../../application/api/models/materialCategory.ts');
const { generateTestUser, generateTestMaterialCategory } = require('./testDataGenerator.js');

// Register models with Mongoose
mongoose.model('User', UserModel.schema);
mongoose.model('MaterialCategory', MaterialCategoryModel.schema);

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
        },
        // Task to generate test user data
        async generateTestUser() {
            return await generateTestUser();
        },
        // Task to generate test material category data
        async generateTestMaterialCategory() {
            return generateTestMaterialCategory();
        }
    });

    return config;
};

module.exports = mongodbPlugin; 