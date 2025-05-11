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
    
    // Find the row with our test category and click the edit button
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
});


