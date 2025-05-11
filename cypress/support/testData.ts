import { testDataGenerator } from "../../test-utils/cypress/testDataGenerator";

export const TEST_USER = {
    firstName: 'Test',
    lastName: 'User',
    birthDate: '1990-01-01',
    email: 'test@example.com',
    password: 'password123',
    authRoles: ['ADMIN']
};

export const VENDORS = [
  testDataGenerator.Vendor(),
  testDataGenerator.Vendor(),
  testDataGenerator.Vendor(),
]

export const LINER_TYPES = [
  testDataGenerator.LinerType(),
  testDataGenerator.LinerType(),
  testDataGenerator.LinerType(),
]

export const ADHESIVE_CATEGORIES = [
  testDataGenerator.AdhesiveCategory(),
  testDataGenerator.AdhesiveCategory(),
  testDataGenerator.AdhesiveCategory(),
]

export const MATERIAL_CATEGORIES = [
  testDataGenerator.MaterialCategory(),
  testDataGenerator.MaterialCategory(),
  testDataGenerator.MaterialCategory(),
]

export const MATERIALS = [
  testDataGenerator.Material(),
  testDataGenerator.Material(),
  testDataGenerator.Material(),
]

export const CREDIT_TERMS = [
  testDataGenerator.CreditTerm(),
  testDataGenerator.CreditTerm(),
  testDataGenerator.CreditTerm(),
]


