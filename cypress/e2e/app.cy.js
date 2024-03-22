describe('loads the app UI correctly', () => {
  // base on webapp url "baseUrl" visit webapp
  beforeEach(() =>{
    cy.visit(Cypress.config('baseUrl'));
  })
  
  //check if app component exists
  it('check app #root exists', () => {
    cy.get('#root').should('exist');
    cy.log(`App is up and running at ${Cypress.config('baseUrl')}`);
  })

  //check if header component exists
  it('check app #header exists', () => {
    cy.get('#header').should('exist');
  })

  //check flowsheet component exists
  it('check app #flowsheet-wrapper exists', () => {
    cy.get('#flowsheet-wrapper').should('exist');
  })

  //check stream table component exists
  it('check app #stream-table exist', () => {
    cy.get('#stream-table').should('exist');
  })


  /**
   * This comment out on purpose and if enabled, will use it to test if CI can fail
   */
  //loading fake test check if test working
  // it('loads stream table', () => {
  //   cy.get('#unexist-id').should('exist');
  // })
})