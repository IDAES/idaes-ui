describe('flowsheet visualizer spec', () => {
  it('successfully loads', () => {
    cy.visit(Cypress.config('baseUrl'));
  });
  it('has jointjs diagram', () => {
    cy.visit(Cypress.config('baseUrl'));
    cy.get('#fv div.joint-paper svg');
  });
})