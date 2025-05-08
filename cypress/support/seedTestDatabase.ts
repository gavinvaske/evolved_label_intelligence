import { UserModel } from '../../application/api/models/user';
import { TEST_USER } from './testData';
import { clearTestDatabase } from '../../test/sharedTestDatabase';
import { USER } from '../../application/api/enums/authRolesEnum';

const TEST_API_URL = 'http://localhost:8069';

export async function seedTestDatabase() {
    console.log('Seeding test database...');
    
    // Register the test user through the API
    await registerUserAndAssignAuthRole(TEST_USER, [USER]);

    /* [START] SEED TEST DATA */
    /*    TODO: Seed test data here */
    /* [END] SEED TEST DATA */

    console.log('Test database seeded');

    const users = await UserModel.find({}).lean();  

    console.log('users in cypress test database:', users);
}

const registerUserAndAssignAuthRole = async (user: any, authRole: string[]) => {
  const response = await fetch(`${TEST_API_URL}/auth/register`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: user.firstName,
        lastName: user.lastName,
        birthDate: user.birthDate,
        email: user.email,
        password: user.password,
        repeatPassword: user.password
      })
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Failed to register test user: ${responseText}`);
  }

  /* Assign the registered user the USER auth role so they can access pages that require auth roles */
  await UserModel.findOneAndUpdate({ email: user.email }, { $set: { authRoles: authRole } }, { runValidators: true}).lean();
}