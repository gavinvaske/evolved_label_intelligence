import { Chance } from 'chance';
import { mockData } from '../../test/testDataGenerator';

const chance = new Chance();

declare global {
    namespace Cypress {
        interface Chainable {
            clearDatabase(): Chainable<void>;
            seedDatabase(model: string, count?: number): Chainable<void>;
            login(username: string, password: string): Chainable<void>;
            invalidLogin(): Chainable<void>;
            logout(): Chainable<void>;
        }
    }
}

Cypress.Commands.add('clearDatabase', () => {
    cy.task('clearDatabase');
});

Cypress.Commands.add('seedDatabase', (model: string, count: number = 1) => {
    const data = Array(count).fill(null).map(() => mockData[model]());
    cy.task('seedDatabase', { model, data });
});

Cypress.Commands.add('login', (username: string, password: string) => {
  cy.visit('/react-ui/login')

  /* When username and password input fields are populated */
  cy.get('[data-test=username-input]').type(username)
  cy.get('[data-test=password-input]').type(password)

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
    cy.visit('/react-ui/login');
    const invalidUsername = chance.string();
    const invalidPassword = chance.string();

    /* When username and password input fields are populated */
    cy.get('[data-test="username-input"]').type(invalidUsername);
    cy.get('[data-test="password-input"]').type(invalidPassword);

    /* And a User clicks login */
    cy.get('[data-test="login-btn"]').click();

    /* 
    [Important]
      If we dont verify anything on the page after a login, 
      the tests execute too quickly and sometimes that auth hasn't fully taken effect leading to random errors 
    */
    cy.location().should(loc => {
        expect(loc.pathname).to.equal('/react-ui/login');
    });
});

Cypress.Commands.add('logout', () => {
    cy.request('/auth/logout'); /* TODO: Initiate logout via a UI button instead of direct HTTP request*/
});

