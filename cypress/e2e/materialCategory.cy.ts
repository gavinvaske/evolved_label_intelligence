describe('Material Category CRUD Operations', () => {
    beforeEach(() => {
        cy.clearDatabase();
        cy.seedDatabase('User', 1); // Create a test user
        cy.login('test@example.com', 'password123');
    });

    it('should create a new material category', () => {
        cy.visit('/material-categories');
        cy.get('[data-test="create-material-category"]').click();
        
        cy.get('input[name="name"]').type('Test Category');
        cy.get('textarea[name="description"]').type('Test Description');
        cy.get('button[type="submit"]').click();

        cy.get('[data-test="material-category-list"]')
            .should('contain', 'Test Category');
    });

    it('should update an existing material category', () => {
        // First create a material category
        cy.seedDatabase('MaterialCategory', 1);
        
        cy.visit('/material-categories');
        cy.get('[data-test="edit-material-category"]').first().click();
        
        cy.get('input[name="name"]').clear().type('Updated Category');
        cy.get('button[type="submit"]').click();

        cy.get('[data-test="material-category-list"]')
            .should('contain', 'Updated Category');
    });

    it('should delete a material category', () => {
        // First create a material category
        cy.seedDatabase('MaterialCategory', 1);
        
        cy.visit('/material-categories');
        cy.get('[data-test="delete-material-category"]').first().click();
        cy.get('[data-test="confirm-delete"]').click();

        cy.get('[data-test="material-category-list"]')
            .should('not.contain', 'Test Category');
    });
}); 