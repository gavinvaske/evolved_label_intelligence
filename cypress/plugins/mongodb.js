const mongoose = require('mongoose');
const { connectToTestMongoDatabase, closeDatabase, clearDatabase } = require('./databaseService.js');
const { UserModel } = require('../../application/api/models/user.ts');
const { MaterialCategoryModel } = require('../../application/api/models/materialCategory.ts');
const { generateTestMaterialCategory } = require('./testDataGenerator.js');
const axios = require('axios');
const { SERVER_ERROR, CREATED_SUCCESSFULLY } = require('../../application/api/enums/httpStatusCodes.ts');

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
        // Task to register a test user and set their roles
        async registerTestUser() {
            try {
                // First register the user
                const response = await axios.post('http://localhost:8080/auth/register', {
                    email: 'test@example.com',
                    password: 'password123',
                    repeatPassword: 'password123',
                    firstName: 'Test',
                    lastName: 'User',
                    birthDate: '1990-01-01'
                });

                if (response.status === CREATED_SUCCESSFULLY) {
                    // Then update their roles in the database
                    const User = mongoose.model('User');
                    const updateResult = await User.findOneAndUpdate(
                        { email: 'test@example.com' },
                        { $set: { authRoles: ['ADMIN'] } },
                        { new: true } // Return the updated document
                    );

                    if (!updateResult) {
                        throw new Error('Failed to update user roles: User not found');
                    }

                    if (!updateResult.authRoles || !updateResult.authRoles.includes('ADMIN')) {
                        throw new Error('Failed to update user roles: Admin role not set');
                    }

                    console.log('Successfully updated user roles:', updateResult);
                }

                return {
                    status: response.status,
                    data: response.data
                };
            } catch (error) {
                console.error('Error in registerTestUser:', error);
                // If there's an error, return the error response data
                return {
                    status: error.response?.status || SERVER_ERROR,
                    data: error.response?.data || error.message
                };
            }
        },
        // Task to generate test material category data
        async generateTestMaterialCategory() {
            return generateTestMaterialCategory();
        }
    });

    return config;
};

module.exports = mongodbPlugin; 