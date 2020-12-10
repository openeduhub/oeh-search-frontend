import { Given, Then } from 'cypress-cucumber-preprocessor/steps';

Given('I search for {string}', (searchString) => {
    cy.get('app-new-search-field').find('input[type="text"]').type(searchString);

    cy.get('app-new-search-field').find('button[class*="submit-button"]').click();
    cy.wait('@getRelayData.all');
});
