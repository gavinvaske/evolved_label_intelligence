import { testDataGenerator } from '@test-utils/cypress/testDataGenerator';

describe('Inventory Management', () => {
  const material = testDataGenerator.Material();
  const uppercasedMaterialId = material.materialId.toUpperCase();

  beforeEach(() => {
    cy.login();
    // Visit the inventory page first
    cy.visit('/react-ui/inventory');
  });

  // Page should have a search bar
  it('should have a search bar and create buttons', () => {
    cy.url().should('include', '/react-ui/inventory');

    cy.get('[data-test=searchbar]').should('exist');
    cy.get('[data-test=create-material-order-button]').should('exist');
    cy.get('[data-test=create-material-button]').should('exist');
    cy.get('[data-test=create-material-length-adjustment-button]').should('exist');
  });

  it('should allow creating a new material and viewing it in inventory', () => {
    // Click the create new button
    cy.get('[data-test=create-material-button]').click();

    // Verify we're on the form page
    cy.url().should('include', '/react-ui/forms/material');

    // Fill out the form
    cy.fillMaterialForm(material);

    // Verify we're redirected back to the table
    cy.url().should('include', '/react-ui/tables/material');

    // Navigate back to inventory page
    cy.visit('/react-ui/inventory');

    // Count initial number of materials and store it
    cy.get('[data-test=material-inventory-card]')
      .its('length')
      .as('totalNumberOfMaterials')
      .then((length) => {
        cy.log(`Total number of materials: ${length}`);
      });

    // Verify the new material appears in the inventory table
    cy.get('[data-test=material-inventory-card]')
      .should('exist')
      .and('be.visible')
      .should('contain', uppercasedMaterialId);

    // verify the material can be searched for
    cy.get('[data-test=searchbar]').type(uppercasedMaterialId).type('{enter}');

    // verify only one material card exists and it contains our material ID
    cy.get('[data-test=material-inventory-card]')
      .should('have.length', 1)
      .and('contain', uppercasedMaterialId);

    // clear the filters
    cy.get('[data-test=clear-filters-button]').click();

    // verify all materials are shown again
    cy.get('@totalNumberOfMaterials').then((total) => {
      cy.get('[data-test=material-inventory-card]')
        .should('have.length', total)
        .and('contain', uppercasedMaterialId);
    });
  });

  it('should open a material details modal when clicking on a material card', () => {
    // click on the material card containing our material ID
    cy.get('[data-test=material-inventory-card]')
      .contains(material.materialId.toUpperCase())
      .click();

    // verify the material details modal is shown
    cy.get('[data-test=material-details-modal]')
      .should('exist')
      .and('contain', material.materialId.toUpperCase())
      .and('contain', material.name.toUpperCase())
      .and('contain', material.description)
      .and('contain', material.whenToUse)
  });

  // should hover over one of the material cards, and see a create actions button (data-test='create-actions-button')
  it('should hover over one of the material cards, and see a create actions button', () => {
    // Find the text and get its parent material card
    cy.contains(material.materialId.toUpperCase())
      .closest('[data-test=material-inventory-card]')
      .within(() => {
        cy.get('[data-test=create-actions-button]').click();
      });


    // click on "Create Order" in the dropdown that appears
    cy.get('[data-test=create-actions-dropdown]')
      .contains('Create Order')
      .click();

    // verify we're on the material order form
    cy.url().should('include', '/react-ui/forms/material-order');

    // Fill out the material order form
    const materialOrder = testDataGenerator.MaterialOrder();
    cy.fillMaterialOrderForm(materialOrder);

    // navigate back to the inventory page, and verify the ordered material appears in the inventory table
    cy.visit('/react-ui/inventory');
    cy.contains(material.materialId.toUpperCase())
      .closest('[data-test=material-inventory-card]')
      .within(() => {
        cy.get('[data-test=material-order-count]')
          .should('exist')
          .and('contain', '69');
      });
  });
});
