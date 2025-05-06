describe('Login Cases', () => {
  it('should show the login page with a email and password field, with the email field in focus', () => {
    cy.visit('/react-ui/login');
  
    cy.contains('Login');
    cy.location().should(loc => {
      expect(loc.pathname).to.equal('/react-ui/login')
    })
    cy.get('input[name="email"]').should('be.focused');
    cy.get('input[name="password"]').should('exist');
  })

  it('User should see a profile page and welcome message upon login', () => {
    cy.login();

    cy.location().should(loc => {
      expect(loc.pathname).to.equal('/react-ui/profile')
    })
    cy.contains('Welcome to E.L.I')
  })

  // it('Unauthenticated user should be sent to login page when visiting base route', () => {
  //   cy.logout();
  //   const baseRoute = '/';
  //   cy.visit(baseRoute);

  //   cy.contains('Login');
  //   cy.location().should(loc => {
  //     expect(loc.pathname).to.equal('/react-ui/login')
  //   })
  // });

  // it('An error message should be shown for invalid login', () => {
  //   cy.logout();
  //   cy.invalidLogin();
  //   const expectedInvalidLoginErrorMessage = 'Invalid email and/or password'

  //   cy.location().should(loc => {
  //     expect(loc.pathname).to.equal('/react-ui/login')
  //   })
  //   cy.contains(expectedInvalidLoginErrorMessage)
  // });

  // it('User should see a home page upon login', () => {
  //   cy.logout();
  //   cy.login();

  //   cy.location().should(loc => {
  //     expect(loc.pathname).to.equal('/react-ui/profile')
  //   })
  // })

  // it('If an unauthenticated user attempts to visit a url, they should be redirected to that url after login', () => {
  //   cy.logout();
  //   const originallyRequestedUrl = '/react-ui/inventory';
  //   cy.visit(originallyRequestedUrl);

  //   /* unauthenticated User should have been redirected to login page */
  //   cy.location().should(loc => {
  //     expect(loc.pathname).to.equal('/react-ui/login')
  //   })

  //   /* Type in username and password */
  //   cy.get('[data-test=username-input]').type(Cypress.env('loginUsername'))
  //   cy.get('[data-test=password-input]').type(Cypress.env('loginPassword'))

  //   /* Click login button */
  //   cy.get('[data-test=login-btn]').click();
    
  //   /* Exo */
  //   cy.location().should(loc => {
  //     expect(loc.pathname).to.equal(originallyRequestedUrl)
  //   })
  // });
})