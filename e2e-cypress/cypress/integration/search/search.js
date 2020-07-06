import { Given, Then } from 'cypress-cucumber-preprocessor/steps';

Given('I search for {string}', (searchString) => {
    cy.get('app-search-field')
        .find('div[class*="search-field-input-wrapper"]')
        .find('input[aria-label*="Suche"]')
        .type(searchString);

    cy.get('app-search-field').find('button[class*="submit-button"]').click();
    cy.wait('@getRelayData.all');
});
