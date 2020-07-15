beforeEach(() => {
    cy.server();
    cy.route('POST', `${Cypress.env('relayUrl')}/graphql`).as('getRelayData');
});
