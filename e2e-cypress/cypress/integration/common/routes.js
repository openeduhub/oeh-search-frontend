beforeEach(() => {
    cy.intercept('POST', `${Cypress.env('relayUrl')}/graphql`).as('getRelayData');
});
