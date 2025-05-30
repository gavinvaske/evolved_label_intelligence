import { testDataGenerator } from '@test-utils/cypress/testDataGenerator';

describe('Credit Term Management', () => {
  const creditTerm = testDataGenerator.CreditTerm();
  const uppercasedDescription = creditTerm.description.toUpperCase();

  beforeEach(() => {
    cy.login();
    // Visit the table page first
    cy.visit('/react-ui/tables/credit-term');
  });

  it('should allow creating and viewing a new credit term', () => {
    // Click the create new button
    cy.get('[data-test=create-icon-button]').click();
    
    // Verify we're on the form page
    cy.url().should('include', '/react-ui/forms/credit-term');
    
    // Fill out the form
    cy.get('[data-test=credit-term-form]').within(() => {
      cy.get('[data-test=input-description]').type(creditTerm.description);
      cy.get('[data-test=submit-button]').click();
    });

    // Verify we're redirected back to the table
    cy.url().should('include', '/react-ui/tables/credit-term');
    
    // Verify the new category appears in the table
    cy.get('[data-test=credit-term-table]')
      .should('exist') // waits for the table
      .and('be.visible')
      .should('contain', uppercasedDescription);
  });

  it('should allow searching for a credit term', () => {
    // Search for the credit term
    cy.get('[data-test=searchbar]')
      .type(creditTerm.description)
      .type('{enter}');
    
    // Wait for the table to be ready and verify search results
    cy.get('[data-test=credit-term-table]').should('exist');
    cy.get('[data-test=table-row]').should('exist');
    cy.get('[data-test=credit-term-table]')
      .should('contain', uppercasedDescription);
  });

  it('should allow editing an existing credit term', () => {
    const updatedDescription = `${creditTerm.description} Updated`;
    
    // Find the row with our test credit term and click the edit button
    cy.get('[data-test=credit-term-table]')
      .contains(uppercasedDescription)
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
    cy.get('[data-test=credit-term-form]').within(() => {
      cy.get('[data-test=input-description]').clear().type(updatedDescription);
      cy.get('[data-test=submit-button]').click();
    });

    // Wait for the table to be ready and verify the update
    cy.get('[data-test=credit-term-table]').should('exist');
    cy.get('[data-test=table-row]').should('exist');
    cy.get('[data-test=credit-term-table]')
      .should('contain', updatedDescription.toUpperCase());
  });

  it('should allow deleting a credit term', () => {
    // First verify we have at least one row
    cy.get('[data-test=credit-term-table]')
      .find('[data-test=table-row]')
      .should('have.length.at.least', 1)
      .then(($rows) => {
        const initialRowCount = $rows.length;
        
        // Click the actions menu on the first row
        cy.get('[data-test=credit-term-table]')
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
        cy.get('[data-test=credit-term-table]')
          .find('[data-test=table-row]')
          .should('have.length', initialRowCount - 1);
      });
  });
});
