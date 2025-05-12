import { Chance } from 'chance';
import { TEST_USER } from './testData';

const chance = new Chance();

Cypress.Commands.add('login', () => {
  const testUser = TEST_USER;

  if (!testUser?.email || !testUser?.password) throw new Error('Missing a required test user. Hint: did you forget to seed the test database?');

  cy.visit('/react-ui/login')

  /* When username and password input fields are populated */
  cy.get('[data-test=username-input]').type(testUser.email)
  cy.get('[data-test=password-input]').type(testUser.password)

  /* And a User clicks login */
  cy.get('[data-test=login-btn]').click();

  /* 
    [Important]
      If we dont verify anything on the page after a login, 
      the tests execute too quickly and sometimes that auth hasn't fully taken effect leading to random errors 
  */
  cy.location().should(loc => {
    expect(loc.pathname).to.equal('/react-ui/profile')
  })
})

Cypress.Commands.add('invalidLogin', () => {
  cy.visit('/react-ui/login')
  const invalidUsername = chance.string()
  const invalidPassword = chance.string()

  /* When username and password input fields are populated */
  cy.get('[data-test=username-input]').type(invalidUsername)
  cy.get('[data-test=password-input]').type(invalidPassword)

  /* And a User clicks login */
  cy.get('[data-test=login-btn]').click();

  /* 
    [Important]
      If we dont verify anything on the page after a login, 
      the tests execute too quickly and sometimes that auth hasn't fully taken effect leading to random errors 
  */
  cy.location().should(loc => {
    expect(loc.pathname).to.equal('/react-ui/login')
  })
})

Cypress.Commands.add('logout', () => {
  cy.request('/auth/logout'); /* TODO: Initiate logout via a UI button instead of direct HTTP request*/
})

// Custom command for selecting an option from CustomSelect
Cypress.Commands.add('selectFromDropdown', (selector: string, optionText: string) => {
  cy.get(selector).click(); // Opens the dropdown
  cy.get('[data-test=select-items-dropdown]').should('be.visible');
  cy.get('[data-test=select-search-input]').type(optionText); // Type to search
  cy.get('[data-test=select-dropdown-item]').contains(optionText).click();
});

Cypress.Commands.add('selectRandomOptionFromDropdown', (selector) => {
  // Open the dropdown
  cy.get(selector).click();

  // Get all dropdown items, excluding the first one
  cy.get('[data-test=select-dropdown-item]').not(':first').then($items => {
    // Get the count of the remaining items
    const count = $items.length;

    // Generate a random index
    const randomIndex = Math.floor(Math.random() * count);

    // Click on the randomly selected item
    cy.wrap($items).eq(randomIndex).click();
  });
});

// Custom command for populating a date input field
Cypress.Commands.add('typeDate', (selector: string, dateStr: string | undefined) => {
  if (!dateStr) return;

  const formatDateForInput = (dateStr: string) => {
    const [month, day, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  cy.get(selector).type(formatDateForInput(dateStr));
});

// Define the type for fields that can be ignored
type MaterialOrderFormFields = {
  material?: boolean;
  author?: boolean;
  vendor?: boolean;
  purchaseOrderNumber?: boolean;
  orderDate?: boolean;
  feetPerRoll?: boolean;
  totalRolls?: boolean;
  totalCost?: boolean;
  hasArrived?: boolean;
  arrivalDate?: boolean;
  freightCharge?: boolean;
  fuelCharge?: boolean;
  notes?: boolean;
};

type MaterialLengthAdjustmentFormFields = {
  material?: boolean;
  length?: boolean;
  notes?: boolean;
};

// Add this to your existing commands
Cypress.Commands.add('fillMaterialOrderForm', (materialOrder: any, fieldsToIgnore: MaterialOrderFormFields = {}) => {
  cy.get('[data-test=material-order-form]').within(() => {
    // Basic Information
    !fieldsToIgnore.author && cy.selectRandomOptionFromDropdown('[data-test=input-author]');
    !fieldsToIgnore.material && cy.selectRandomOptionFromDropdown('[data-test=input-material]');
    !fieldsToIgnore.vendor && cy.selectRandomOptionFromDropdown('[data-test=input-vendor]');
    
    // Order Details
    !fieldsToIgnore.purchaseOrderNumber && cy.get('[data-test=input-purchaseOrderNumber]').type(materialOrder.purchaseOrderNumber);
    !fieldsToIgnore.orderDate && cy.typeDate('[data-test=input-orderDate]', materialOrder.orderDate);
    !fieldsToIgnore.feetPerRoll && cy.get('[data-test=input-feetPerRoll]').type(materialOrder.feetPerRoll.toString());
    !fieldsToIgnore.totalRolls && cy.get('[data-test=input-totalRolls]').type(materialOrder.totalRolls.toString());
    !fieldsToIgnore.totalCost && cy.get('[data-test=input-totalCost]').type(materialOrder.totalCost.toString());
    
    // Arrival Information
    if (materialOrder.hasArrived && !fieldsToIgnore.hasArrived) {
      cy.get('[data-test=input-hasArrived]').check();
    }
    !fieldsToIgnore.arrivalDate && cy.typeDate('[data-test=input-arrivalDate]', materialOrder.arrivalDate);
    !fieldsToIgnore.freightCharge && cy.get('[data-test=input-freightCharge]').clear().type(materialOrder.freightCharge.toString());
    !fieldsToIgnore.fuelCharge && cy.get('[data-test=input-fuelCharge]').clear().type(materialOrder.fuelCharge.toString());
    
    // Notes
    !fieldsToIgnore.notes && cy.get('[data-test=input-notes]').type(materialOrder.notes || '');
    
    cy.get('[data-test=submit-button]').click();
  });
});

// Add this to your existing commands
Cypress.Commands.add('fillMaterialForm', (material: any) => {
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

    cy.get('[data-test=input-freightCostPerMsi]').clear().type(material.freightCostPerMsi);
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
});

// Add this to your existing commands
Cypress.Commands.add('fillMaterialLengthAdjustmentForm', (materialLengthAdjustment: any, fieldsToIgnore: MaterialLengthAdjustmentFormFields = {}) => {
  cy.get('[data-test=material-length-adjustment-form]').within(() => {
    !fieldsToIgnore.material && cy.selectRandomOptionFromDropdown('[data-test=input-material]');
    !fieldsToIgnore.length && cy.get('[data-test=input-length]').type(materialLengthAdjustment.length.toString());
    !fieldsToIgnore.notes && cy.get('[data-test=input-notes]').type(materialLengthAdjustment.notes || '');
    cy.get('[data-test=submit-button]').click();
  });
});

// Add to the Cypress namespace
declare global {
  namespace Cypress {
    interface Chainable {
      selectFromDropdown(selector: string, optionText: string): Chainable<void>,
      selectRandomOptionFromDropdown(selector: string),
      typeDate(selector: string, dateStr: string | undefined): Chainable<void>,
      realHover(): Chainable<JQuery<HTMLElement>>,
      fillMaterialOrderForm(materialOrder: any, fieldsToIgnore?: MaterialOrderFormFields): Chainable<void>,
      fillMaterialForm(material: any): Chainable<void>,
      fillMaterialLengthAdjustmentForm(materialLengthAdjustment: any, fieldsToIgnore?: MaterialLengthAdjustmentFormFields): Chainable<void>
    }
  }
}

