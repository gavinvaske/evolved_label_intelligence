import { Chance } from 'chance';
import { TEST_USER } from './testData';

const chance = new Chance();

Cypress.Commands.add('login', () => {
  const testUser = TEST_USER;

  console.log('testUser', testUser);

  if (!testUser) throw new Error('Missing a required test user. Hint: did you forget to seed the test database?');

  cy.visit('/react-ui/login')

  /* When username and password input fields are populated */
  cy.get('[data-test=username-input]').type('test@example.com')
  cy.get('[data-test=password-input]').type('password123')

  /* And a User clicks login */
  cy.get('[data-test=login-btn]').click();

  /* 
    [Important]
      If we dont verify anything on the page after a login, 
      the tests execute too quickly and sometimes that auth hasn't fully taken effect leading to random errors 
  */
  cy.location().should(loc => {
    expect(loc.pathname).to.equal('/react-ui/profile')
  })
})

Cypress.Commands.add('invalidLogin', () => {
  cy.visit('/react-ui/login')
  const invalidUsername = chance.string()
  const invalidPassword = chance.string()

  /* When username and password input fields are populated */
  cy.get('[data-test=username-input]').type(invalidUsername)
  cy.get('[data-test=password-input]').type(invalidPassword)

  /* And a User clicks login */
  cy.get('[data-test=login-btn]').click();

  /* 
    [Important]
      If we dont verify anything on the page after a login, 
      the tests execute too quickly and sometimes that auth hasn't fully taken effect leading to random errors 
  */
  cy.location().should(loc => {
    expect(loc.pathname).to.equal('/react-ui/login')
  })
})

Cypress.Commands.add('logout', () => {
  cy.request('/auth/logout'); /* TODO: Initiate logout via a UI button instead of direct HTTP request*/
})

