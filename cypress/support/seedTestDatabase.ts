import { UserModel } from '../../application/api/models/user';
import { TEST_USER } from './testData';
import { DeliveryMethodModel } from '../../application/api/models/deliveryMethod';
import { clearTestDatabase } from '../../test/sharedTestDatabase';

export async function seedTestDatabase() {
    // !important: clear the database before seeding
    await clearTestDatabase();

    console.log('Seeding test database...');
    await UserModel.create(TEST_USER);
    await DeliveryMethodModel.create({name: 'seedTestDatabase.ts' })
    console.log('Test database seeded');

    const users = await UserModel.find({}).lean();
    const deliveryMethods = await DeliveryMethodModel.find({}).lean();

    console.log('users in cypress test database:', users);
    console.log('delivery methods in cypress test database:', deliveryMethods);
}