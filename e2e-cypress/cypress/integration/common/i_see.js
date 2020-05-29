import { Then } from 'cypress-cucumber-preprocessor/steps';

Then(`I see {string} in the title`, (title) => {
    cy.title().should('include', title);
});

Then(`I see the search bar`, (title) => {
    cy.title().should('include', 'test');
});
