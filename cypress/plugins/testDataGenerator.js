const bcrypt = require('bcryptjs');

const BCRYPT_SALT_ROUNDS = 10;

const generateTestUser = async () => {
    const plainTextPassword = 'password123';
    const hashedPassword = await bcrypt.hash(plainTextPassword, BCRYPT_SALT_ROUNDS);
    
    return {
        email: 'test@example.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        birthDate: new Date('1990-01-01'),
        authRoles: ['ADMIN']
    };
};

const generateTestMaterialCategory = () => {
    return {
        name: 'Test Category'
    };
};

module.exports = {
    generateTestUser,
    generateTestMaterialCategory
}; 