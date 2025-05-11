import { testDataGenerator } from '@test-utils/cypress/testDataGenerator';

describe('Vendor Management', () => {
  const vendor = testDataGenerator.Vendor();
  const uppercasedName = vendor.name.toUpperCase();

  beforeEach(() => {
    cy.login();
    // Visit the table page first
    cy.visit('/react-ui/tables/vendor');
  });

  it('should allow creating and viewing a new vendor', () => {
    // Click the create new button
    cy.get('[data-test=create-icon-button]').click();
    
    // Verify we're on the form page
    cy.url().should('include', '/react-ui/forms/vendor');
    
    // Fill out the form
    cy.get('[data-test=vendor-form]').within(() => {
      // Basic Information
      cy.get('[data-test=input-name]').type(vendor.name);
      cy.get('[data-test=input-phoneNumber]').type(vendor.phoneNumber);
      cy.get('[data-test=input-email]').type(vendor.email);
      cy.get('[data-test=input-website]').type(vendor.website);

      // Contact Information
      cy.get('[data-test=input-primaryContactName]').type(vendor.primaryContactName);
      cy.get('[data-test=input-primaryContactPhoneNumber]').type(vendor.primaryContactPhoneNumber);
      cy.get('[data-test=input-primaryContactEmail]').type(vendor.primaryContactEmail);
      cy.get('[data-test=input-mfgSpecNumber]').type(vendor.mfgSpecNumber || '');

      // Notes
      cy.get('[data-test=input-notes]').type(vendor.notes || '');

      // Primary Address
      cy.get('[data-test=input-primaryAddress\\.name]').type(vendor.primaryAddress.name);
      cy.get('[data-test=input-primaryAddress\\.street]').type(vendor.primaryAddress.street);
      cy.get('[data-test=input-primaryAddress\\.unitOrSuite]').type(vendor.primaryAddress.unitOrSuite || '');
      cy.get('[data-test=input-primaryAddress\\.city]').type(vendor.primaryAddress.city);
      cy.get('[data-test=input-primaryAddress\\.state]').type(vendor.primaryAddress.state);
      cy.get('[data-test=input-primaryAddress\\.zipCode]').type(vendor.primaryAddress.zipCode);

      // Remittance Address (if different)
      if (vendor.remittanceAddress) {
        cy.get('input[type="checkbox"]').uncheck();
        cy.get('[data-test=input-remittanceAddress\\.name]').type(vendor.remittanceAddress.name);
        cy.get('[data-test=input-remittanceAddress\\.street]').type(vendor.remittanceAddress.street);
        cy.get('[data-test=input-remittanceAddress\\.unitOrSuite]').type(vendor.remittanceAddress.unitOrSuite || '');
        cy.get('[data-test=input-remittanceAddress\\.city]').type(vendor.remittanceAddress.city);
        cy.get('[data-test=input-remittanceAddress\\.state]').type(vendor.remittanceAddress.state);
        cy.get('[data-test=input-remittanceAddress\\.zipCode]').type(vendor.remittanceAddress.zipCode);
      }
      
      cy.get('[data-test=submit-button]').click();
    });

    // Verify we're redirected back to the table
    cy.url().should('include', '/react-ui/tables/vendor');
    
    // Verify the new vendor appears in the table
    cy.get('[data-test=vendor-table]')
      .should('exist') // waits for the table
      .and('be.visible')
      .should('contain', uppercasedName);
  });

  it('should allow searching for a vendor', () => {
    // Search for the vendor
    cy.get('[data-test=searchbar]')
      .type(vendor.name)
      .type('{enter}');
    
    // Wait for the table to be ready and verify search results
    cy.get('[data-test=vendor-table]').should('exist');
    cy.get('[data-test=table-row]').should('exist');
    cy.get('[data-test=vendor-table]')
      .should('contain', uppercasedName);
  });

  it('should allow editing an existing vendor', () => {
    const updatedName = `${vendor.name}12345`;
    
    // Find the row with our test vendor and click the edit button
    cy.get('[data-test=vendor-table]')
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
    cy.get('[data-test=vendor-form]').within(() => {
      cy.get('[data-test=input-name]').clear().type(updatedName);
      cy.get('[data-test=submit-button]').click();
    });

    // Wait for the table to be ready and verify the update
    cy.get('[data-test=vendor-table]').should('exist');
    cy.get('[data-test=table-row]').should('exist');
    cy.get('[data-test=vendor-table]')
      .should('contain', updatedName.toUpperCase());
  });
});
