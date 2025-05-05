import { UserModel } from '../../application/api/models/user';
import { clearDatabase } from '../../application/api/services/databaseService';
import { TEST_USER } from './testData';
import { DeliveryMethodModel } from '../../application/api/models/deliveryMethod';
export async function seedTestDatabase() {
    // !important: clear the database before seeding
    //await clearDatabase();

    console.log('Seeding test database...');
    await UserModel.create(TEST_USER);
    await DeliveryMethodModel.create({name: 'seedTestDatabase.ts' })
    console.log('Test database seeded');

    const users = await UserModel.find({}).lean();
    const deliveryMethods = await DeliveryMethodModel.find({}).lean();

    console.log('users in cypress test database:', users);
    console.log('delivery methods in cypress test database:', deliveryMethods);
}

