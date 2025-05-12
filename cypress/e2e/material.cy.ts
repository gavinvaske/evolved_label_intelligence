import { testDataGenerator } from '@test-utils/cypress/testDataGenerator';

describe('Material Management', () => {
  const material = testDataGenerator.Material();
  const uppercasedMaterialId = material.materialId.toUpperCase();

  beforeEach(() => {
    cy.login();
    // Visit the table page first
    cy.visit('/react-ui/tables/material');
  });

  it('should allow creating and viewing a new material', () => {
    // Click the create new button
    cy.get('[data-test=create-icon-button]').click();

    // Verify we're on the form page
    cy.url().should('include', '/react-ui/forms/material');

    // Fill out the form
    cy.fillMaterialForm(material);

    // Verify we're redirected back to the table
    cy.url().should('include', '/react-ui/tables/material');

    // Verify the new material appears in the table
    cy.get('[data-test=material-table]')
      .should('exist') // waits for the table
      .and('be.visible')
      .should('contain', uppercasedMaterialId);
  });

  it('should allow searching for a material', () => {
    // Search for the material
    cy.get('[data-test=searchbar]')
      .type(uppercasedMaterialId)
      .type('{enter}');

    // Wait for the table to be ready and verify search results
    cy.get('[data-test=material-table]').should('exist');
    cy.get('[data-test=table-row]').should('exist');
    cy.get('[data-test=material-table]')
      .should('contain', uppercasedMaterialId);
  });

  it('should allow editing an existing material', () => {
    const updatedName = material.name + ' Updated';

    // Find the row with our test material and click the edit button
    cy.get('[data-test=material-table]')
      .contains(uppercasedMaterialId)
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
    cy.get('[data-test=material-form]').within(() => {
      cy.get('[data-test=input-name]').clear().type(updatedName);
      cy.get('[data-test=submit-button]').click();
    });

    // Wait for the table to be ready and verify the update
    cy.get('[data-test=material-table]').should('exist');
    cy.get('[data-test=table-row]').should('exist');
    cy.get('[data-test=material-table]')
      .should('contain', updatedName.toUpperCase());
  });
});
