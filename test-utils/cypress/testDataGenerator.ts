import { mockData } from '../testDataGenerator';

// Re-export the mock data generator
export const testDataGenerator = mockData;

// Add any Cypress-specific test data generation functions here
export const generateUniqueTestData = () => {
  // Add any Cypress-specific logic for generating unique test data
  // For example, adding timestamps or unique identifiers
  return {
    ...mockData,
    // Add any overrides or additional generators here
  };
}; 