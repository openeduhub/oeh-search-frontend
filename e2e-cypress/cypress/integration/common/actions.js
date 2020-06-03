import { Given } from 'cypress-cucumber-preprocessor/steps';

Given('I open the home page', () => {
    cy.visit('/');
    cy.wait('@getRelayData.all');
});

Given('I open the german version of the home page', () => {
    cy.visit('/de/search');
    cy.wait('@getRelayData.all');
});

Given('I scroll down to paginator', () => {
    cy.get('app-paginator').scrollIntoView();
});
