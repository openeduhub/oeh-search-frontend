beforeEach(() => {
    cy.intercept('POST', `${Cypress.env('apiUrl')}`).as('getRelayData');
});
