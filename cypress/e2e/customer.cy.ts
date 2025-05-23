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

    // Fill out the customer form
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

    // verify the business location was added
    cy.get('[data-test=business-locations-table]')
      .should('contain', businessLocation.name);

    // update the business location name
    const updatedBusinessLocationName = businessLocation.name + ' Updated';
    cy.get('[data-test=business-locations-table]')
      .contains(businessLocation.name)
      .closest('[data-test=table-row]')
      .find('[data-test=edit-button]')
      .click();

    // Fill the business location form with updated name
    cy.get('[data-test=modal]')
      .within(() => {
        // Update the name
        cy.get('[data-test=input-name]')
          .should('be.visible')
          .clear()
          .type(updatedBusinessLocationName);

        // Click update button
        cy.get('button[type="submit"]').should('be.visible').click();
      });

    // Verify the updated name appears in the table
    cy.get('[data-test=business-locations-table]')
      .should('contain', updatedBusinessLocationName);

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

    // verify the shipping location was added
    cy.get('[data-test=shipping-locations-table]')
      .should('contain', shippingLocation.name);

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

    // verify the billing location was added
    cy.get('[data-test=billing-locations-table]')
      .should('contain', billingLocation.name);

    // remove the billing location via the delete button
    cy.get('[data-test=billing-locations-table]')
      .contains(billingLocation.name)
      .closest('[data-test=table-row]')
      .find('[data-test=delete-button]')
      .click();

    // verify the billing location was removed
    cy.get('[data-test=billing-locations-table]')
      .should('not.contain', billingLocation.name);

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

  it('should allow deleting a customer', () => {
    // First verify we have at least one row
    cy.get('[data-test=customer-table]')
      .find('[data-test=table-row]')
      .should('have.length.at.least', 1)
      .then(($rows) => {
        const initialRowCount = $rows.length;
        
        // Click the actions menu on the first row
        cy.get('[data-test=customer-table]')
          .find('[data-test=table-row]')
          .first()
          .find('[data-test=row-actions]')
          .find('[data-test=row-actions-button]')
          .click();

        // Click the delete button in the dropdown menu
        cy.get('[data-test=row-actions-menu]')
          .find('[data-test=row-action-item]')
          .contains('Delete')
          .click();

        // Handle the confirmation modal
        cy.get('[data-test=confirmation-modal-confirm-button]')
          .should('be.visible')
          .click();

        // Verify the table has one less row
        cy.get('[data-test=customer-table]')
          .find('[data-test=table-row]')
          .should('have.length', initialRowCount - 1);
      });
  });
});
