import { testDataGenerator } from '@test-utils/cypress/testDataGenerator';

describe('Material Order Management', () => {
  const materialOrder = testDataGenerator.MaterialOrder();
  const uppercasedPoNumber = materialOrder.purchaseOrderNumber.toUpperCase();

  beforeEach(() => {
    cy.login();
    // Visit the table page first
    cy.visit('/react-ui/tables/material-order');
  });

  it('should allow creating and viewing a new material order', () => {
    // Click the create new button
    cy.get('[data-test=create-icon-button]').click();
    
    // Verify we're on the form page
    cy.url().should('include', '/react-ui/forms/material-order');
    
    // Fill out the form
    cy.get('[data-test=material-order-form]').within(() => {
      // Basic Information
      cy.selectRandomOptionFromDropdown('[data-test=input-author]');
      cy.selectRandomOptionFromDropdown('[data-test=input-material]');
      cy.selectRandomOptionFromDropdown('[data-test=input-vendor]');
      
      // Order Details
      cy.get('[data-test=input-purchaseOrderNumber]').type(materialOrder.purchaseOrderNumber);
      cy.typeDate('[data-test=input-orderDate]', materialOrder.orderDate);
      cy.get('[data-test=input-feetPerRoll]').type(materialOrder.feetPerRoll.toString());
      cy.get('[data-test=input-totalRolls]').type(materialOrder.totalRolls.toString());
      cy.get('[data-test=input-totalCost]').type(materialOrder.totalCost.toString());
      
      // Arrival Information
      if (materialOrder.hasArrived) {
        cy.get('[data-test=input-hasArrived]').check();
      }
      cy.typeDate('[data-test=input-arrivalDate]', materialOrder.arrivalDate);
      cy.get('[data-test=input-freightCharge]').type(materialOrder.freightCharge.toString());
      cy.get('[data-test=input-fuelCharge]').type(materialOrder.fuelCharge.toString());
      
      // Notes
      cy.get('[data-test=input-notes]').type(materialOrder.notes || '');
      
      cy.get('[data-test=submit-button]').click();
    });

    // Verify we're redirected back to the table
    cy.url().should('include', '/react-ui/tables/material-order');
    
    // Verify the new material order appears in the table
    cy.get('[data-test=material-order-table]')
      .should('exist') // waits for the table
      .and('be.visible')
      .should('contain', uppercasedPoNumber);
  });

  it('should allow searching for a material order', () => {
    // Search for the material order
    cy.get('[data-test=searchbar]')
      .type(materialOrder.purchaseOrderNumber)
      .type('{enter}');
    
    // Wait for the table to be ready and verify search results
    cy.get('[data-test=material-order-table]').should('exist');
    cy.get('[data-test=table-row]').should('exist');
    cy.get('[data-test=material-order-table]')
      .should('contain', uppercasedPoNumber);
  });

  it('should allow editing an existing material order', () => {
    const updatedPoNumber = `${materialOrder.purchaseOrderNumber}12345`;
    
    // Find the row with our test material order and click the edit button
    cy.get('[data-test=material-order-table]')
      .contains(uppercasedPoNumber)
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
    cy.get('[data-test=material-order-form]').within(() => {
      cy.get('[data-test=input-purchaseOrderNumber]').clear().type(updatedPoNumber);
      cy.get('[data-test=submit-button]').click();
    });

    // Wait for the table to be ready and verify the update
    cy.get('[data-test=material-order-table]').should('exist');
    cy.get('[data-test=table-row]').should('exist');
    cy.get('[data-test=material-order-table]')
      .should('contain', updatedPoNumber.toUpperCase());
  });
});
