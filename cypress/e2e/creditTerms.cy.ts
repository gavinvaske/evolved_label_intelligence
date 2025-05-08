describe('Credit Term Management', () => {
  const testCreditTerm = {
    description: `Sample Description ${Date.now()}`
  };

  const uppercasedDescription = testCreditTerm.description.toUpperCase();

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
      cy.get('[data-test=input-description]').type(testCreditTerm.description);
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
    cy.get('[data-test=searchbar]').type(testCreditTerm.description);
    
    // Wait for the table to be ready and verify search results
    cy.get('[data-test=credit-term-table]').should('exist');
    cy.get('[data-test=table-row]').should('exist');
    cy.get('[data-test=credit-term-table]')
      .should('contain', uppercasedDescription);
  });

  it('should allow editing an existing credit term', () => {
    const updatedDescription = `${testCreditTerm.description} Updated`;
    
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
});
