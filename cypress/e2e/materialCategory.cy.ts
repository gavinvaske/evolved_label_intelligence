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
    cy.get('[data-test=searchbar]')
      .type(materialCategory.name)
      .type('{enter}');
    
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

  it('should allow deleting a material category', () => {
    // First verify we have at least one row
    cy.get('[data-test=material-category-table]')
      .find('[data-test=table-row]')
      .should('have.length.at.least', 1)
      .then(($rows) => {
        const initialRowCount = $rows.length;
        
        // Click the actions menu on the first row
        cy.get('[data-test=material-category-table]')
          .find('[data-test=table-row]')
          .first()
          .find('[data-test=row-actions]')
          .find('[data-test=row-actions-button]')
          .click();

        // Click the delete button in the dropdown menu
        cy.get('[data-test=row-actions-menu]')
          .find('[data-test=row-action-item]')
          .contains('Delete')
          .click();

        // Handle the confirmation modal
        cy.get('[data-test=confirmation-modal-confirm-button]')
          .should('be.visible')
          .click();

        // Verify the table has one less row
        cy.get('[data-test=material-category-table]')
          .find('[data-test=table-row]')
          .should('have.length', initialRowCount - 1);
      });
  });
});

