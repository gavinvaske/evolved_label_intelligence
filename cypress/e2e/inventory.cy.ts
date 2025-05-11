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
});
