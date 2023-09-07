describe('loads the app UI correctly', () => {
  beforeEach(() =>{
    cy.visit(Cypress.config('baseUrl'));
  })
  
  //loading app component
  it('loads app', () => {
    cy.get('#app').should('exist');
    cy.log(`App is up and running at ${Cypress.config('baseUrl')}`)
  })

  //loading header component
  it('loads header', () => {
    cy.get('#idaes-header').should('exist');
  })

  //loading page contents
  it('loads page contents', () => {
    cy.get('#idaes-page-contents').should('exist');
  })

  //loading stream table
  it('loads stream table', () => {
    cy.get('#stream-table').should('exist');
  })


  /**
   * This mean to comment out, use to test if CI can fail
   */
  //loading fake test check if test working
  // it('loads stream table', () => {
  //   cy.get('#unexist-id').should('exist');
  // })
})