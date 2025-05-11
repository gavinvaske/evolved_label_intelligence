import { testDataGenerator } from "@/test-utils/cypress/testDataGenerator";

describe('Material Category Management', () => {
  const materialCategory = testDataGenerator.MaterialCategory();
  const uppercasedName = materialCategory.name.toUpperCase();

  beforeEach(() => {
    cy.login();
    // Visit the table page first
    cy.visit('/react-ui/tables/material-category');
  });

  it('should allow creating and viewing a new material category', () => {
    // Click the create new button
    cy.get('[data-test=create-icon-button]').click();
    
    // Verify we're on the form page
    cy.url().should('include', '/react-ui/forms/material-category');
    
    // Fill out the form
    cy.get('[data-test=material-category-form]').within(() => {
      cy.get('[data-test=input-name]').type(materialCategory.name);
      cy.get('[data-test=submit-button]').click();
    });

    // Verify we're redirected back to the table
    cy.url().should('include', '/react-ui/tables/material-category');
    
    // Verify the new category appears in the table
    cy.get('[data-test=material-category-table]')
      .should('contain', uppercasedName);
  });

  it('should allow searching for an material category', () => {
    // Search for the category
    cy.get('[data-test=searchbar]').type(materialCategory.name);
    
    // Verify search results
    cy.get('[data-test=material-category-table]')
      .should('contain', uppercasedName);
  });

  it('should allow editing an existing material category', () => {
    const updatedName = `${materialCategory.name} Updated`;
    
    // Find the row with our test material category and click the edit button
    cy.get('[data-test=material-category-table]')
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
    cy.get('[data-test=material-category-form]').within(() => {
      cy.get('[data-test=input-name]').clear().type(updatedName);
      cy.get('[data-test=submit-button]').click();
    });

    // Verify the update in the table
    cy.get('[data-test=material-category-table]')
      .should('contain', uppercasedName);
  });
});


