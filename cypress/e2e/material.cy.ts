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
    cy.get('[data-test=material-form]').within(() => {
      // Basic Information
      cy.get('[data-test=input-name]').type(material.name);
      cy.get('[data-test=input-materialId]').type(material.materialId);
      cy.get('[data-test=input-width]').type(material.width.toString());
      cy.selectRandomOptionFromDropdown('[data-test=input-vendor]');
      cy.get('[data-test=input-locationsAsStr]').type(material.locations.join(', '));

      cy.get('[data-test=input-thickness]').type(material.thickness.toString());
      cy.get('[data-test=input-weight]').type(material.weight.toString());
      cy.get('[data-test=input-faceColor]').type(material.faceColor);
      cy.get('[data-test=input-adhesive]').type(material.adhesive);

      cy.get('[data-test=input-freightCostPerMsi]').type(material.freightCostPerMsi);
      cy.get('[data-test=input-costPerMsi]').type(material.costPerMsi);
      cy.get('[data-test=input-quotePricePerMsi]').type(material.quotePricePerMsi.toString());


      cy.get('[data-test=input-lowStockThreshold]').type(material.lowStockThreshold.toString());
      cy.get('[data-test=input-lowStockBuffer]').type(material.lowStockBuffer.toString());

      cy.get('[data-test=input-description]').type(material.description);
      cy.get('[data-test=input-whenToUse]').type(material.whenToUse);
      cy.get('[data-test=input-alternativeStock]').type(material.alternativeStock);

      cy.get('[data-test=input-length]').type(material.length.toString());
      cy.get('[data-test=input-facesheetWeightPerMsi]').type(material.facesheetWeightPerMsi.toString());
      cy.get('[data-test=input-adhesiveWeightPerMsi]').type(material.adhesiveWeightPerMsi.toString());
      cy.get('[data-test=input-linerWeightPerMsi]').type(material.linerWeightPerMsi.toString());
      cy.get('[data-test=input-productNumber]').type(material.productNumber);
      cy.get('[data-test=input-masterRollSize]').type(material.masterRollSize.toString());
      cy.get('[data-test=input-image]').type(material.image);
      cy.selectRandomOptionFromDropdown('[data-test=input-linerType]');
      cy.selectRandomOptionFromDropdown('[data-test=input-adhesiveCategory]');
      cy.selectRandomOptionFromDropdown('[data-test=input-materialCategory]');

      cy.get('[data-test=submit-button]').click();
    });

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
