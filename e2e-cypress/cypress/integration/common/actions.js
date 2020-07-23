import { Given } from 'cypress-cucumber-preprocessor/steps';

Given('I open the home page', () => {
    cy.visit(`${Cypress.env('languagePrefix')}/search`);
    cy.wait('@getRelayData.all');
});

Given('I scroll down to paginator', () => {
    cy.get('app-paginator').scrollIntoView();
});
