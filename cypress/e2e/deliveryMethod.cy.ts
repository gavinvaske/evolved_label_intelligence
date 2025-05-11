import { testDataGenerator } from '@test-utils/cypress/testDataGenerator';

describe('Delivery Method Management', () => {
  const deliveryMethod = testDataGenerator.DeliveryMethod();
  const uppercasedName = deliveryMethod.name.toUpperCase();

  beforeEach(() => {
    cy.login();
    // Visit the table page first
    cy.visit('/react-ui/tables/delivery-method');
  });

  it('should allow creating and viewing a new delivery method', () => {
    // Click the create new button
    cy.get('[data-test=create-icon-button]').click();
    
    // Verify we're on the form page
    cy.url().should('include', '/react-ui/forms/delivery-method');
    
    // Fill out the form
    cy.get('[data-test=delivery-method-form]').within(() => {
      cy.get('[data-test=input-name]').type(deliveryMethod.name);
      cy.get('[data-test=submit-button]').click();
    });

    // Verify we're redirected back to the table
    cy.url().should('include', '/react-ui/tables/delivery-method');
    
    // Verify the new delivery method appears in the table
    cy.get('[data-test=delivery-method-table]')
      .should('exist') // waits for the table
      .and('be.visible')
      .should('contain', uppercasedName);
  });

  it('should allow searching for a delivery method', () => {
    // Search for the delivery method
    cy.get('[data-test=searchbar]')
      .type(deliveryMethod.name)
      .type('{enter}');
    
    // Wait for the table to be ready and verify search results
    cy.get('[data-test=delivery-method-table]').should('exist');
    cy.get('[data-test=table-row]').should('exist');
    cy.get('[data-test=delivery-method-table]')
      .should('contain', uppercasedName);
  });

  it('should allow editing an existing delivery method', () => {
    const updatedName = `${deliveryMethod.name} Updated`;
    
    // Find the row with our test delivery method and click the edit button
    cy.get('[data-test=delivery-method-table]')
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
    cy.get('[data-test=delivery-method-form]').within(() => {
      cy.get('[data-test=input-name]').clear().type(updatedName);
      cy.get('[data-test=submit-button]').click();
    });

    // Wait for the table to be ready and verify the update
    cy.get('[data-test=delivery-method-table]').should('exist');
    cy.get('[data-test=table-row]').should('exist');
    cy.get('[data-test=delivery-method-table]')
      .should('contain', updatedName.toUpperCase());
  });
});
