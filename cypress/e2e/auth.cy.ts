import { TEST_USER } from '../support/testData';
import { mockData } from '../../test-utils/testDataGenerator';

describe('Auth', () => {
  it('should login', () => {
    cy.visit('/react-ui/login');
    cy.get('input[name="email"]').type(TEST_USER.email);
    cy.get('input[name="password"]').type(TEST_USER.password);
    cy.get('button[type="submit"]').click();
  });

  it('should see message if login fails', () => {
    const invalidEmail = 'invalid@email.com';
    cy.visit('/react-ui/login');
    cy.get('input[name="email"]').type(invalidEmail);
    cy.get('input[name="password"]').type('password');
    cy.get('button[type="submit"]').click();
    cy.contains('Invalid email and/or password');
  });

  it('should logout', () => {
    cy.login();
    // verify we're on the profile page
    cy.url().should('include', '/react-ui/profile');
    
    // Click the user profile button to open dropdown
    cy.get('[class*="userPictureContainer"]').click();
    
    // Click the logout button
    cy.get('button').contains('Log Out').click();
    
    // Verify redirect to login page
    cy.url().should('include', '/react-ui/login');
  });

  it('should be able to register and then login', () => {
    const newUser = mockData.User();
    
    // Format the date to YYYY-MM-DD
    const formattedDate = new Date(newUser.birthDate).toISOString().split('T')[0];
    
    // Visit registration page
    cy.visit('/react-ui/register');
    
    // Fill out the registration form
    cy.get('form').within(() => {
      cy.get('input[name="firstName"]').type(newUser.firstName);
      cy.get('input[name="lastName"]').type(newUser.lastName);
      cy.get('input[name="birthDate"]').type(formattedDate);
      cy.get('input[name="email"]').type(newUser.email);
      cy.get('input[name="password"]').type(newUser.password);
      cy.get('input[name="repeatPassword"]').type(newUser.password);
      cy.get('button[type="submit"]').click();
    });

    // Verify redirect to login page
    cy.url().should('include', '/react-ui/login');
    
    // Verify success message
    cy.contains('Registration was successful!');
    
    // Login with new credentials
    cy.get('input[name="email"]').type(newUser.email);
    cy.get('input[name="password"]').type(newUser.password);
    cy.get('button[type="submit"]').click();
    
    // Verify successful login (by default, the user is not authorized to view any page upon login)
    cy.url().should('include', '/react-ui/unauthorized');
    cy.contains('Unauthorized').should('exist');
    cy.contains('You do not have access to the requested page').should('exist');
  });

  it('should be able to visit forgot password page and see correct fields', () => {
    // Visit forgot password page
    cy.visit('/react-ui/forgot-password');

    // Verify correct text and fields exist
    cy.contains("Enter your email and we'll send you instructions to reset your password").should('exist');
    cy.get('input[name="email"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
    
    // Click back to login button
    cy.contains('Back to login').click();

    // Verify redirect to login page
    cy.url().should('include', '/react-ui/login');
  })
});
