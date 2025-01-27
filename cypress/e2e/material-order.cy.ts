describe('Material Order Views', () => {
  const formUrlPrefix = '/react-ui/forms'
  const tableUrlPrefix = '/react-ui/tables'

  beforeEach(() => {
    cy.login();
  });

  it('Should render the Material Order form', () => {
    const url = `${formUrlPrefix}/material-order`;

    cy.visit(url);

    cy.get('[data-test=material-order-form]').should('exist');
    cy.url().should('include', url)
  });

  it('Should render the Material Order table and searchbar', () => {
    const url = `${tableUrlPrefix}/material-order`;

    cy.visit(url);

    cy.get('#material-order-table').should('exist');
    cy.get('[data-test=searchbar]').should('exist');
    cy.url().should('include', url)
  });
});