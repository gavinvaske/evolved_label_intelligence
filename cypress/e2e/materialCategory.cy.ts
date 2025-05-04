describe('Material Category CRUD Operations', () => {
    beforeEach(() => {
        cy.clearDatabase();
        cy.seedDatabase('User', 1); // Create a test user
        cy.login('test@example.com', 'password123');
    });

    it('should create a new material category', () => {
        // Visit the form page
        cy.visit('/react-ui/forms/material-category');
        
        // Fill out and submit the form
        cy.get('[data-test="material-category-name-input"]').type('Test Category');
        cy.get('[data-test="material-category-submit"]').click();

        // Should redirect to the table page and show the new category
        cy.url().should('include', '/react-ui/tables/material-category');
        cy.get('[data-test="material-category-table"]').should('contain', 'Test Category');
    });

    it('should update an existing material category', () => {
        // First create a material category
        cy.seedDatabase('MaterialCategory', 1);
        
        // Visit the table page and click edit
        cy.visit('/react-ui/tables/material-category');
        cy.get('[data-test="edit-material-category"]').first().click();
        
        // Update the form
        cy.get('[data-test="material-category-name-input"]').clear().type('Updated Category');
        cy.get('[data-test="material-category-submit"]').click();

        // Should redirect to the table page and show the updated category
        cy.url().should('include', '/react-ui/tables/material-category');
        cy.get('[data-test="material-category-table"]').should('contain', 'Updated Category');
    });

    it('should delete a material category', () => {
        // First create a material category
        cy.seedDatabase('MaterialCategory', 1);
        
        // Visit the table page and delete
        cy.visit('/react-ui/tables/material-category');
        cy.get('[data-test="delete-material-category"]').first().click();
        cy.get('[data-test="confirm-delete"]').click();

        // Should show the category is gone
        cy.get('[data-test="material-category-table"]').should('not.contain', 'Test Category');
    });
}); 