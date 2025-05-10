import { UserModel } from '../application/api/models/user';
import { mockData } from '../test-utils/testDataGenerator';

export const TEST_USER = mockData.User();

export async function seedTestDatabase() {
    console.log('Seeding test database...');
    await UserModel.create(TEST_USER);
    console.log('Test database seeded');

    const numberOfUsers = await UserModel.countDocuments();
    console.log(`Number of users in the test database: ${numberOfUsers}`);
}

