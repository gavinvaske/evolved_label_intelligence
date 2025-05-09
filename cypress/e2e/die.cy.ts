import { testDataGenerator } from '@test-utils/cypress/testDataGenerator';

describe.only('Die Management', () => {
  const die = testDataGenerator.Die();
  const uppercasedName = die.dieNumber.toUpperCase();

  beforeEach(() => {
    cy.login();
    // Visit the table page first
    cy.visit('/react-ui/tables/die');
  });

  it('should allow creating and viewing a new die', () => {
    // Click the create new button
    cy.get('[data-test=create-icon-button]').click();
    
    // Verify we're on the form page
    cy.url().should('include', '/react-ui/forms/die');
    
    // Fill out the form
    cy.get('[data-test=die-form]').within(() => {
      cy.get('[data-test=input-dieNumber]').type(die.dieNumber);
      
      // Select shape from CustomSelect using the custom command
      cy.selectFromCustomSelect('[data-test=input-shape]', die.shape);
      
      cy.get('[data-test=submit-button]').click();
    });

    // Verify we're redirected back to the table
    cy.url().should('include', '/react-ui/tables/die');
    
    // Verify the new delivery method appears in the table
    cy.get('[data-test=die-table]')
      .should('exist') // waits for the table
      .and('be.visible')
      .should('contain', uppercasedName);
  });

  it('should allow searching for a delivery method', () => {
    // Search for the delivery method
    cy.get('[data-test=searchbar]').type(die.dieNumber);
    
    // Wait for the table to be ready and verify search results
    cy.get('[data-test=die-table]').should('exist');
    cy.get('[data-test=table-row]').should('exist');
    cy.get('[data-test=die-table]')
      .should('contain', uppercasedName);
  });

  it('should allow editing an existing die', () => {
    const updatedName = `${die.dieNumber} Updated`;
    
    // Find the row with our test delivery method and click the edit button
    cy.get('[data-test=die-table]')
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
    cy.get('[data-test=die-form]').within(() => {
      cy.get('[data-test=input-dieNumber]').clear().type(updatedName);
      cy.get('[data-test=submit-button]').click();
    });

    // Wait for the table to be ready and verify the update
    cy.get('[data-test=die-table]').should('exist');
    cy.get('[data-test=table-row]').should('exist');
    cy.get('[data-test=die-table]')
      .should('contain', updatedName.toUpperCase());
  });
});
