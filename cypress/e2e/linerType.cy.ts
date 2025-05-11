import { testDataGenerator } from "@/test-utils/cypress/testDataGenerator";

describe('Liner Type Management', () => {
  const linerType = testDataGenerator.LinerType();
  const uppercasedName = linerType.name.toUpperCase();

  beforeEach(() => {
    cy.login();
    // Visit the table page first
    cy.visit('/react-ui/tables/liner-type');
  });

  it('should allow creating and viewing a new liner type', () => {
    // Click the create new button
    cy.get('[data-test=create-icon-button]').click();
    
    // Verify we're on the form page
    cy.url().should('include', '/react-ui/forms/liner-type');
    
    // Fill out the form
    cy.get('[data-test=liner-type-form]').within(() => {
      cy.get('[data-test=input-name]').type(linerType.name);
      cy.get('[data-test=submit-button]').click();
    });

    // Verify we're redirected back to the table
    cy.url().should('include', '/react-ui/tables/liner-type');
    
    // Verify the new liner type appears in the table
    cy.get('[data-test=liner-type-table]')
      .should('contain', uppercasedName);
  });

  it('should allow searching for a liner type', () => {
    // Search for the liner type
    cy.get('[data-test=searchbar]')
      .type(linerType.name)
      .type('{enter}');
    
    // Verify search results
    cy.get('[data-test=liner-type-table]')
      .should('contain', uppercasedName);
  });

  it('should allow editing an existing liner type', () => {
    const updatedName = `${linerType.name} Updated`;
    
    // Find the row with our test liner type and click the edit button
    cy.get('[data-test=liner-type-table]')
      .contains(uppercasedName)
      .closest('[data-test=table-row]')  // Get the row containing our text
      .find('[data-test=row-actions]')  // Find the actions container
      .find('[data-test=row-actions-button]')  // Find the button within actions
      .click();

    // Click the edit button in the dropdown menu
    cy.get('[data-test=row-actions-menu]')
      .find('[data-test=row-action-item]')
      .contains('Edit')
      .click();

    // Update the form
    cy.get('[data-test=liner-type-form]').within(() => {
      cy.get('[data-test=input-name]').clear().type(updatedName);
      cy.get('[data-test=submit-button]').click();
    });

    // Verify the update in the table
    cy.get('[data-test=liner-type-table]')
      .should('contain', uppercasedName);
  });
});


