import { Then } from 'cypress-cucumber-preprocessor/steps';

Then('I see {string} in the title', (title) => {
    cy.title().should('include', title);
});

Then('I see all recommendations of the editorial department', () => {
    // define aliases
    cy.get('app-subjects-portal')
        .find('app-subjects-portal-section[sectiontitle*="Lehrmaterial"]')
        .as('teachingMaterial');
    cy.get('app-subjects-portal')
        .find('app-subjects-portal-section[sectiontitle*="Unterrichtsideen"]')
        .as('courseOfInstruction');
    cy.get('app-subjects-portal')
        .find('app-subjects-portal-section[sectiontitle*="Tools"]')
        .as('tools');
    cy.get('app-subjects-portal')
        .find('app-subjects-portal-section[sectiontitle*="Portale & Datenbanken"]')
        .as('portals');

    cy.get('app-subjects-portal').should('be.visible');

    cy.get('@teachingMaterial').should('be.visible');
    cy.get('@teachingMaterial')
        .find('div[class*="results"]')
        .children('app-result-card-small')
        .its('length')
        .should('be.gt', 0);

    cy.get('@courseOfInstruction').should('be.visible');
    cy.get('@courseOfInstruction')
        .find('div[class*="results"]')
        .children('app-result-card-small')
        .its('length')
        .should('be.gt', 0);

    cy.get('@tools').should('be.visible');
    cy.get('@tools')
        .find('div[class*="results"]')
        .children('app-result-card-small')
        .its('length')
        .should('be.gt', 0);

    cy.get('@portals').should('be.visible');
    cy.get('@portals')
        .find('div[class*="results"]')
        .children('app-result-card-small')
        .its('length')
        .should('be.gt', 0);
});

Then('I see search results', () => {
    cy.get('app-search-results').should('be.visible');
    cy.get('app-search-results')
        .find('div[class="results"]')
        .children('app-result-card')
        .its('length')
        .should('be.gt', 0);
});

Then('I see the search bar input field', () => {
    cy.get('app-search-field').find('div[class*="search-field-wrapper"]').should('be.visible');
});

Then('I see the search button', () => {
    cy.get('app-search-field').find('button[class*="submit-button"]').should('be.visible');
});

Then('I see the search button label {string}', (label) => {
    cy.get('app-search-field')
        .find('button[class*="submit-button"]')
        .find('span[class*="mat-button-wrapper"]')
        .should('have.text', label);
});

Then('I see the filter button', () => {
    cy.get('app-headerbar').find('button[class*="filter-button"]').should('be.visible');
});

Then('I see the filter button label {string}', (filter) => {
    cy.get('app-headerbar')
        .find('button[class*="filter-button"]')
        .find('span[class*="mat-button-wrapper"]')
        .find('span')
        .should('have.text', filter);
});

Then('I see the paginator', () => {
    cy.get('app-paginator').should('be.visible');
    cy.get('app-paginator').find('a[aria-label="Vorherige Seite"]').should('be.visible');
    cy.get('app-paginator')
        .find('a[aria-label="Vorherige Seite"]')
        .find('mat-icon[class*="mat-icon"]')
        .should('have.text', 'chevron_left');

    cy.get('app-paginator').find('a[aria-label="Nächste Seite"]').should('be.visible');
    cy.get('app-paginator')
        .find('a[aria-label="Nächste Seite"]')
        .find('mat-icon[class*="mat-icon"]')
        .should('have.text', 'chevron_right');

    cy.get('app-paginator').find('span[class*="page-number"]').should('be.visible');
    cy.get('app-paginator').find('span[class*="page-number"]').its('length').should('equal', 1);
    cy.get('app-paginator').find('a[class*="page-number"]').its('length').should('be.gt', 0);
});
