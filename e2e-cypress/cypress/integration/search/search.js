import { Given, Then } from 'cypress-cucumber-preprocessor/steps';

Given('I search for {string}', (searchString) => {
    cy.get('app-new-search-field')
        .find('div[class*="search-field-input-wrapper"]')
        .find('input[type="text"]')
        .type(searchString);

    cy.get('app-new-search-field').find('button[class*="submit-button"]').click();
    cy.url().should('include', searchString);
    cy.wait('@getRelayData.all');
});
