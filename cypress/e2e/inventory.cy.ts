import { testDataGenerator } from '@test-utils/cypress/testDataGenerator';

describe('Inventory Management', () => {
  const material = testDataGenerator.Material();
  const uppercasedMaterialId = material.materialId.toUpperCase();

  // Helper function to find and interact with a material card
  const findMaterialCard = () => {
    return cy.contains(material.materialId.toUpperCase())
      .closest('[data-test=material-inventory-card]');
  };

  // Helper function to open the create actions menu for a material
  const openCreateActionsMenu = () => {
    findMaterialCard().within(() => {
      cy.get('[data-test=create-actions-button]').click();
    });
  };

  // Helper function to select an action from the dropdown
  const selectCreateAction = (actionName: string) => {
    cy.get('[data-test=create-actions-dropdown]')
      .contains(actionName)
      .click();
  };

  // Helper function to verify material length in a specific field
  const verifyMaterialLength = (fieldTestId: string, expectedLength: number) => {
    findMaterialCard().within(() => {
      cy.get(`[data-test=${fieldTestId}]`)
        .should('exist')
        .and('contain', expectedLength);
    });
  };

  // Helper function to create a material order
  const createMaterialOrder = (hasArrived: boolean) => {
    openCreateActionsMenu();
    selectCreateAction('Create Order');

    // Verify we're on the material order form
    cy.url().should('include', '/react-ui/forms/material-order');

    const materialOrder = testDataGenerator.MaterialOrder();
    materialOrder.hasArrived = hasArrived;
    const length = materialOrder.feetPerRoll * materialOrder.totalRolls;

    // Fill out the material order form, ignoring the material field
    cy.fillMaterialOrderForm(materialOrder, { material: true });

    // Navigate back to inventory
    cy.visit('/react-ui/inventory');

    return { materialOrder, length };
  };

  // Helper function to create a material length adjustment
  const createMaterialLengthAdjustment = () => {
    openCreateActionsMenu();
    selectCreateAction('Create Length Adjustment');

    // Verify we're on the material length adjustment form
    cy.url().should('include', '/react-ui/forms/material-length-adjustment');

    const materialLengthAdjustment = testDataGenerator.MaterialLengthAdjustment();
    cy.fillMaterialLengthAdjustmentForm(materialLengthAdjustment, { material: true });

    // Navigate back to inventory
    cy.visit('/react-ui/inventory');

    return materialLengthAdjustment;
  };

  beforeEach(() => {
    cy.login();
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
    findMaterialCard().click();

    // verify the material details modal is shown
    cy.get('[data-test=material-details-modal]')
      .should('exist')
      .and('contain', material.materialId.toUpperCase())
      .and('contain', material.name.toUpperCase())
      .and('contain', material.description)
      .and('contain', material.whenToUse);
  });

  it('should allow creating orders and length adjustments for a material', () => {
    // Create an arrived order
    const { length: lengthArrived1 } = createMaterialOrder(true);
    const { length: lengthArrived2 } = createMaterialOrder(true);
    verifyMaterialLength('length-arrived', lengthArrived1 + lengthArrived2);

    // Create a not arrived order
    const { length: lengthNotArrived1 } = createMaterialOrder(false);
    const { length: lengthNotArrived2 } = createMaterialOrder(false);
    verifyMaterialLength('length-not-arrived', lengthNotArrived1 + lengthNotArrived2);
    verifyMaterialLength('net-length-available', lengthArrived1 + lengthArrived2);

    // Create a length adjustment
    const materialLengthAdjustment1 = createMaterialLengthAdjustment();
    const materialLengthAdjustment2 = createMaterialLengthAdjustment();
    verifyMaterialLength('net-length-available', (lengthArrived1 + lengthArrived2) + (materialLengthAdjustment1.length + materialLengthAdjustment2.length));
  });
});
