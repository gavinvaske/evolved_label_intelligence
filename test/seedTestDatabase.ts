import { UserModel } from '../application/api/models/user';
import { clearDatabase } from '../application/api/services/databaseService';
import { mockData } from './testDataGenerator';

export const TEST_USER = mockData.User();

export async function seedTestDatabase() {
    // !important: clear the database before seeding
    await clearDatabase();

    console.log('Seeding test database...');
    await UserModel.create(TEST_USER);
    console.log('Test database seeded');

    const numberOfUsers = await UserModel.countDocuments();
    console.log(`Number of users in the test database: ${numberOfUsers}`);
}

