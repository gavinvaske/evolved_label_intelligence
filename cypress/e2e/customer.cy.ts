import { testDataGenerator } from '@test-utils/cypress/testDataGenerator';

describe('Customer Management', () => {
  const customer = testDataGenerator.Customer();
  const contact = testDataGenerator.Contact();
  const businessLocation = testDataGenerator.Address();
  const shippingLocation = testDataGenerator.ShippingLocation();
  const billingLocation = testDataGenerator.Address();
  const uppercasedCustomerId = customer.customerId.toUpperCase();

  beforeEach(() => {
    cy.login();
    // Visit the table page first
    cy.visit('/react-ui/tables/customer');
  });

  it('should allow creating and viewing a new customer', () => {
    // Click the create new button
    cy.get('[data-test=create-icon-button]').click();

    // Verify we're on the form page
    cy.url().should('include', '/react-ui/forms/customer');

    // Fill out the form
    cy.get('[data-test=customer-form]').within(() => {
      // Basic Information
      cy.get('[data-test=input-customerId]').type(customer.customerId);
      cy.get('[data-test=input-name]').type(customer.name);
      cy.get('[data-test=input-overun]').type(customer.overun.toString());
      cy.get('[data-test=input-notes]').type(customer.notes || 'Test notes');
      cy.selectRandomOptionFromDropdown('[data-test=input-creditTerms]');
    });

    // Add a business location
    cy.get('[data-test=business-locations-table]').within(() => {
      cy.get('[data-test=add-button]').click();
    });

    // Fill the business location form
    cy.get('[data-test=modal]')
      .within(() => {
        // Fill out the form
        cy.get('[data-test=input-name]').should('be.visible').type(businessLocation.name);
        cy.get('[data-test=input-street]').should('be.visible').type(businessLocation.street);
        cy.get('[data-test=input-unitOrSuite]').should('be.visible').type(businessLocation.unitOrSuite);
        cy.get('[data-test=input-city]').should('be.visible').type(businessLocation.city);
        cy.get('[data-test=input-state]').should('be.visible').type(businessLocation.state);
        cy.get('[data-test=input-zipCode]').should('be.visible').type(businessLocation.zipCode);

        // Click create button
        cy.get('button[type="submit"]').should('be.visible').click();
      });

    // Add a shipping location
    cy.get('[data-test=shipping-locations-table]').within(() => {
      cy.get('[data-test=add-button]').click();
    });

    // Fill the shipping location form
    cy.get('[data-test=modal]')
      .within(() => {
        // Fill out the form
        cy.get('[data-test=input-name]').should('be.visible').type(shippingLocation.name);
        cy.get('[data-test=input-freightAccountNumber]').should('be.visible').type(shippingLocation.freightAccountNumber);
        cy.selectRandomOptionFromDropdown('[data-test=input-deliveryMethod]');
        cy.get('[data-test=input-street]').should('be.visible').type(shippingLocation.street);
        cy.get('[data-test=input-unitOrSuite]').should('be.visible').type(shippingLocation.unitOrSuite);
        cy.get('[data-test=input-city]').should('be.visible').type(shippingLocation.city);
        cy.get('[data-test=input-state]').should('be.visible').type(shippingLocation.state);
        cy.get('[data-test=input-zipCode]').should('be.visible').type(shippingLocation.zipCode);

        // Click create button
        cy.get('button[type="submit"]').should('be.visible').click();
      });

    // Add a billing location
    cy.get('[data-test=billing-locations-table]').within(() => {
      cy.get('[data-test=add-button]').click();
    });

    // Fill the billing location form
    cy.get('[data-test=modal]')
      .within(() => {
        // Fill out the form
        cy.get('[data-test=input-name]').should('be.visible').type(billingLocation.name);
        cy.get('[data-test=input-street]').should('be.visible').type(billingLocation.street);
        cy.get('[data-test=input-unitOrSuite]').should('be.visible').type(billingLocation.unitOrSuite);
        cy.get('[data-test=input-city]').should('be.visible').type(billingLocation.city);
        cy.get('[data-test=input-state]').should('be.visible').type(billingLocation.state);
        cy.get('[data-test=input-zipCode]').should('be.visible').type(billingLocation.zipCode);

        // Click create button
        cy.get('button[type="submit"]').should('be.visible').click();
      });


    // Add a contact
    cy.get('[data-test=contacts-table]').within(() => {
      cy.get('[data-test=add-button]').click();
    });
    // Fill the contact form
    cy.get('[data-test=modal]')
      .within(() => {
        // Fill out the form
        cy.get('[data-test=input-fullName]').should('be.visible').type(contact.fullName);
        cy.get('[data-test=input-phoneNumber]').should('be.visible').type(contact.phoneNumber);
        cy.get('[data-test=input-phoneExtension]').should('be.visible').type(contact.phoneExtension);
        cy.get('[data-test=input-email]').should('be.visible').type(contact.email);
        cy.get('[data-test=input-contactStatus]').should('be.visible').type(contact.contactStatus);
        cy.get('[data-test=input-notes]').should('be.visible').type(contact.notes);
        cy.get('[data-test=input-position]').should('be.visible').type(contact.position);
        cy.selectRandomOptionFromDropdown('[data-test=input-location]');

        // Click create button
        cy.get('button[type="submit"]').should('be.visible').click();
      });

    // Verify contact was added to the table
    cy.get('[data-test=contacts-table]')
      .should('contain', contact.fullName);

    cy.get('[data-test=submit-button]').click();

    // Verify we're redirected back to the table
    cy.url().should('include', '/react-ui/tables/customer');

    // Verify the new customer appears in the table
    cy.get('[data-test=customer-table]')
      .should('exist') // waits for the table
      .and('be.visible')
      .should('contain', uppercasedCustomerId);
  });

  it('should allow searching for a customer', () => {
    // Search for the customer
    cy.get('[data-test=searchbar]')
      .type(uppercasedCustomerId.toUpperCase())
      .type('{enter}');

    // Wait for the table to be ready and verify search results
    cy.get('[data-test=customer-table]').should('exist');
    cy.get('[data-test=table-row]').should('exist');
    cy.get('[data-test=customer-table]')
      .should('contain', uppercasedCustomerId);
  });

  it('should allow editing an existing customer', () => {
    const updatedName = customer.name + ' Updated';

    // Find the row with our test customer and click the edit button
    cy.get('[data-test=customer-table]')
      .contains(uppercasedCustomerId)
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
    cy.get('[data-test=customer-form]').within(() => {
      cy.get('[data-test=input-name]').clear().type(updatedName);
      cy.get('[data-test=submit-button]').click();
    });

    // Wait for the table to be ready and verify the update
    cy.get('[data-test=customer-table]').should('exist');
    cy.get('[data-test=table-row]').should('exist');
    cy.get('[data-test=customer-table]')
      .should('contain', updatedName);
  });
});
