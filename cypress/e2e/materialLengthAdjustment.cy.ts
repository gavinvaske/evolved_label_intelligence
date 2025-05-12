import { testDataGenerator } from "@/test-utils/cypress/testDataGenerator";

describe('Material Length Adjustment Management', () => {
  const materialLengthAdjustment = testDataGenerator.MaterialLengthAdjustment();

  beforeEach(() => {
    cy.login();
    // Visit the table page first
    cy.visit('/react-ui/tables/material-length-adjustment');
  });

  it('should allow creating and viewing a new material length adjustment', () => {
    // Click the create new button
    cy.get('[data-test=create-icon-button]').click();
    
    // Verify we're on the form page
    cy.url().should('include', '/react-ui/forms/material-length-adjustment');
    
    // Fill out the form
    cy.fillMaterialLengthAdjustmentForm(materialLengthAdjustment);

    // Verify we're redirected back to the table
    cy.url().should('include', '/react-ui/tables/material-length-adjustment');
    
    // Verify the new material length adjustment appears in the table
    cy.get('[data-test=material-length-adjustment-table]')
      .should('contain', getExpectedLengthFormat(materialLengthAdjustment.length));
  });

  it('should allow searching for an material length adjustment', () => {
    // Search for the material length adjustment
    cy.get('[data-test=searchbar]')
      .type(materialLengthAdjustment.notes.slice(0, 4))
      .type('{enter}');
    
    // Verify search results
    cy.get('[data-test=material-length-adjustment-table]')
      .should('contain', getExpectedLengthFormat(materialLengthAdjustment.length));
  });

  it('should allow editing an existing material length adjustment', () => {
    const updatedLength = materialLengthAdjustment.length + 100;
    
    // Find the row with our test material length adjustment and click the edit button
    cy.get('[data-test=material-length-adjustment-table]')
      .contains(getExpectedLengthFormat(materialLengthAdjustment.length))
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
    cy.get('[data-test=material-length-adjustment-form]').within(() => {
      cy.get('[data-test=input-length]').clear().type(updatedLength.toString());
      cy.get('[data-test=submit-button]').click();
    });

    // Verify the update in the table
    cy.get('[data-test=material-length-adjustment-table]')
      .should('contain', getExpectedLengthFormat(updatedLength));
  });
});

function getExpectedLengthFormat(length: number) {
  return length < 0 ? `(${Math.abs(length)})` : `${length}`;
}


