describe(
    'loads the app UI correctly',
    {
        retries: {
            runMode: 5,
            openMode: 5
        }
    },
    () => {
        // base on webapp url "baseUrl" visit webapp
        beforeEach(() => {
            cy.visit(Cypress.config('baseUrl'));
        })

        //check if app component exists
        it('check app #root exists', () => {
            cy.get('#root').should('exist');
        })

        // check if header component exists
        it('check app #header exists', () => {
            cy.get('#header').should('exist');
        })

        // check flowsheet component exists
        it('check app #flowsheet-wrapper exists', () => {
            cy.get('#flowsheet-wrapper').should('exist');
        })

        // check stream table component exists
        it('check app #stream-table exist', () => {
            cy.get('#stream-table').should('exist');
        })
    })