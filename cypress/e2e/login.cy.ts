describe('Login Cases', () => {
  beforeEach(() => {
    cy.clearDatabase().then(() => {
      // Create a test user with admin permissions
      cy.task('registerTestUser').then((response: ApiResponse) => {
        if (response.status !== 201 && !response.data.includes('already exists')) {
          throw new Error(`Failed to create test user: ${response.data}`);
        }
      });
    });
  });

  it('User should see a profile page upon login', () => {
    cy.login();

    cy.location().should(loc => {
      expect(loc.pathname).to.equal('/react-ui/profile')
    })
  })

  it('Unauthenticated user should see the login page with the email field in focus', () => {
    cy.logout();
    cy.visit('/react-ui/inventory');

    cy.contains('Login');
    cy.location().should(loc => {
      expect(loc.pathname).to.equal('/react-ui/login')
    })
    cy.get('input[name="email"]').should('be.focused');
  });

  it('Unauthenticated user should be sent to login page when visiting base route', () => {
    cy.logout();
    const baseRoute = '/';
    cy.visit(baseRoute);

    cy.contains('Login');
    cy.location().should(loc => {
      expect(loc.pathname).to.equal('/react-ui/login')
    })
  });

  it('An error message should be shown for invalid login', () => {
    cy.logout();
    cy.invalidLogin();
    const expectedInvalidLoginErrorMessage = 'Invalid email and/or password'

    cy.location().should(loc => {
      expect(loc.pathname).to.equal('/react-ui/login')
    })
    cy.contains(expectedInvalidLoginErrorMessage)
  });

  it('User should see a home page upon login', () => {
    cy.login();

    cy.location().should(loc => {
      expect(loc.pathname).to.equal('/react-ui/profile')
    })
  })

  it('If an unauthenticated user attempts to visit a url, they should be redirected to that url after login', () => {
    cy.logout();
    const originallyRequestedUrl = '/react-ui/inventory';
    cy.visit(originallyRequestedUrl);

    /* unauthenticated User should have been redirected to login page */
    cy.location().should(loc => {
      expect(loc.pathname).to.equal('/react-ui/login')
    })

    cy.login();

    /* Exo */
    cy.location().should(loc => {
      expect(loc.pathname).to.equal(originallyRequestedUrl)
    })
  });
})