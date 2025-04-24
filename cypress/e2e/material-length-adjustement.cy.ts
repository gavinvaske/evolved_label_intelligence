describe('MaterialLengthAdjustment Views', () => {
  const formUrlPrefix = '/react-ui/forms'
  const tableUrlPrefix = '/react-ui/tables'

  beforeEach(() => {
    cy.login();
  });

  it('Should render the MaterialLengthAdjustment form', () => {
    const url = `${formUrlPrefix}/material-length-adjustment`;

    cy.visit(url);

    cy.get('[data-test=material-length-adjustment-form]').should('exist');
    cy.url().should('include', url)
  });

  it('Should render the Material Length Adjustment table and searchbar', () => {
    const url = `${tableUrlPrefix}/material-length-adjustment`;

    cy.visit(url);

    cy.get('#material-length-adjustment-table').should('exist');
    cy.get('[data-test=searchbar]').should('exist');
    cy.url().should('include', url)
  });
});