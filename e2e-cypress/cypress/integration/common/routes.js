beforeEach(() => {
    cy.server();
    cy.route('POST', '/relay/graphql').as('getRelayData');
});
