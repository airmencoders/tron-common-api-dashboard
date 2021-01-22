const host = Cypress.env('INTEGRATION_TEST_HOST');

describe('Sample test', () => {
    it('Visit home', () => {
        cy.visit(host);

        cy.get('button.btn-outline-primary').click();
        cy.contains('New Person');
    })
})