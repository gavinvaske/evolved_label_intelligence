import { testDataGenerator } from '@test-utils/cypress/testDataGenerator';

describe('Die Management', () => {
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
      // Basic Information
      cy.get('[data-test=input-dieNumber]').type(die.dieNumber);
      cy.selectFromDropdown('[data-test=input-shape]', die.shape);
      cy.get('[data-test=input-quantity]').type(die.quantity.toString());
      cy.selectFromDropdown('[data-test=input-status]', die.status);

      // Size Information
      cy.get('[data-test=input-sizeAcross]').type(die.sizeAcross.toString());
      cy.get('[data-test=input-sizeAround]').type(die.sizeAround.toString());
      cy.get('[data-test=input-numberAcross]').type(die.numberAcross.toString());
      cy.get('[data-test=input-numberAround]').type(die.numberAround.toString());
      cy.get('[data-test=input-cornerRadius]').type(die.cornerRadius.toString());
      cy.get('[data-test=input-topAndBottom]').type(die.topAndBottom.toString());
      cy.get('[data-test=input-leftAndRight]').type(die.leftAndRight.toString());

      // Tool Information
      cy.get('[data-test=input-gear]').type(die.gear);
      cy.selectFromDropdown('[data-test=input-toolType]', die.toolType);
      cy.selectFromDropdown('[data-test=input-magCylinder]', die.magCylinder.toString());
      cy.get('[data-test=input-facestock]').type(die.facestock);
      cy.get('[data-test=input-liner]').type(die.liner);
      cy.get('[data-test=input-specialType]').type(die.specialType || '');

      // Additional Information
      cy.get('[data-test=input-cost]').type(die.cost.toString());
      cy.selectFromDropdown('[data-test=input-vendor]', die.vendor);
      cy.get('[data-test=input-serialNumber]').type(die.serialNumber);
      if (die.isLamination) {
        cy.get('[data-test=input-isLamination]').check();
      }

      // Notes
      cy.get('[data-test=input-notes]').type(die.notes);
      
      cy.get('[data-test=submit-button]').click();
    });

    // Verify we're redirected back to the table
    cy.url().should('include', '/react-ui/tables/die');
    
    // Verify the new die appears in the table
    cy.get('[data-test=die-table]')
      .should('exist') // waits for the table
      .and('be.visible')
      .should('contain', uppercasedName);
  });

  it('should allow searching for a die', () => {
    // Search for the die
    cy.get('[data-test=searchbar]').type(die.dieNumber);
    
    // Wait for the table to be ready and verify search results
    cy.get('[data-test=die-table]').should('exist');
    cy.get('[data-test=table-row]').should('exist');
    cy.get('[data-test=die-table]')
      .should('contain', uppercasedName);
  });

  it('should allow editing an existing die', () => {
    const updatedSerialNumber = die.serialNumber + ' Updated';
    
    // Find the row with our test die and click the edit button
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
      cy.get('[data-test=input-serialNumber]').clear().type(updatedSerialNumber);
      cy.get('[data-test=submit-button]').click();
    });

    // Wait for the table to be ready and verify the update
    cy.get('[data-test=die-table]').should('exist');
    cy.get('[data-test=table-row]').should('exist');
    cy.get('[data-test=die-table]')
      .should('contain', updatedSerialNumber);
  });
});
