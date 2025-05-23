import { testDataGenerator } from "@/test-utils/cypress/testDataGenerator";

describe('Adhesive Category Management', () => {
  const adhesiveCategory = testDataGenerator.AdhesiveCategory();
  const uppercasedName = adhesiveCategory.name.toUpperCase();

  beforeEach(() => {
    cy.login();
    // Visit the table page first
    cy.visit('/react-ui/tables/adhesive-category');
  });

  it('should allow creating and viewing a new adhesive category', () => {
    // Click the create new button
    cy.get('[data-test=create-icon-button]').click();
    
    // Verify we're on the form page
    cy.url().should('include', '/react-ui/forms/adhesive-category');
    
    // Fill out the form
    cy.get('[data-test=adhesive-category-form]').within(() => {
      cy.get('[data-test=input-name]').type(adhesiveCategory.name);
      cy.get('[data-test=submit-button]').click();
    });

    // Verify we're redirected back to the table
    cy.url().should('include', '/react-ui/tables/adhesive-category');
    
    // Verify the new category appears in the table
    cy.get('[data-test=adhesive-category-table]')
      .should('contain', uppercasedName);
  });

  it('should allow searching for an adhesive category', () => {
    // Search for the category
    cy.get('[data-test=searchbar]')
      .type(adhesiveCategory.name)
      .type('{enter}');
    
    // Verify search results
    cy.get('[data-test=adhesive-category-table]')
      .should('contain', uppercasedName);
  });

  it('should allow editing an existing adhesive category', () => {
    const updatedName = `${adhesiveCategory.name} Updated`;
    
    // Find the row within the table and click the edit button
    cy.get('[data-test=adhesive-category-table]')
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
    cy.get('[data-test=adhesive-category-form]').within(() => {
      cy.get('[data-test=input-name]').clear().type(updatedName);
      cy.get('[data-test=submit-button]').click();
    });

    // Verify the update in the table
    cy.get('[data-test=adhesive-category-table]')
      .should('contain', uppercasedName);
  });

  it('should allow deleting an adhesive category', () => {
    // First verify we have at least one row
    cy.get('[data-test=adhesive-category-table]')
      .find('[data-test=table-row]')
      .should('have.length.at.least', 1)
      .then(($rows) => {
        const initialRowCount = $rows.length;
        
        // Click the actions menu on the first row
        cy.get('[data-test=adhesive-category-table]')
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
        cy.get('[data-test=adhesive-category-table]')
          .find('[data-test=table-row]')
          .should('have.length', initialRowCount - 1);
      });
  });
});

