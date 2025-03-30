describe('Product Views', () => {
  const formUrlPrefix = '/react-ui/forms'
  const tableUrlPrefix = '/react-ui/tables'

  beforeEach(() => {
    cy.login();
  });

  it('Should render the Die form', () => {
    const url = `${formUrlPrefix}/die`;

    cy.visit(url);

    cy.get('[data-test=die-form]').should('exist');
    cy.url().should('include', url)
  });

  it('Should render the Die table and searchbar', () => {
    const url = `${tableUrlPrefix}/die`;

    cy.visit(url);

    cy.get('#die-table').should('exist');
    cy.get('[data-test=searchbar]').should('exist');
    cy.url().should('include', url)
  });
});