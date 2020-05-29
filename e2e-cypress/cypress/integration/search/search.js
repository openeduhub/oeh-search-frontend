import { Given } from 'cypress-cucumber-preprocessor/steps';

const homepage = 'http://localhost:8080/';

Given('I open the home page', () => {
    cy.visit('/');
    cy.wait('@getRelayData.all');
});
