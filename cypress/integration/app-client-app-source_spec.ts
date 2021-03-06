/// <reference types="Cypress" />

import { apiBase, host , adminJwt, ssoXfcc } from "../support";
import AgGridFunctions, { AppClientGridColId, AppSourceEmailGridColId, AppSourceEndpointGridColId, AppSourceGridColId } from '../support/ag-grid-functions';
import DataCrudFormPageUtil, { AppClient } from '../support/data-crud-form-functions';
import UtilityFunctions, { Page } from '../support/utility-functions';

describe('App Source / App Client Tests', () => {
  it('Should allow App Client creation & deletion', () => {
    UtilityFunctions.visitSite(host, { headers: { "Authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc }});

    UtilityFunctions.clickOnPageNav(Page.APP_CLIENT);

    const appClient: AppClient = {
      name: UtilityFunctions.generateRandomString()
    };

    DataCrudFormPageUtil.createAppClientAndSuccess(appClient);

    // Delete it
    DataCrudFormPageUtil.deleteRowWithColIdContainingValue(AppClientGridColId.NAME, appClient.name, true, true, false);
  });

  it('Should be able to add Developer to App Client', () => {
    UtilityFunctions.visitSite(`${host}/app-clients`, { headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc }});

    const appClient: AppClient = {
      name: UtilityFunctions.generateRandomString()
    };

    DataCrudFormPageUtil.createAppClientAndSuccess(appClient);
    AgGridFunctions.filterColumnWithSearchValue(AppClientGridColId.NAME, appClient.name, false);

    // Go to edit
    cy.intercept({
      method: 'GET',
      path: `${apiBase}/app-client/*`
    }).as('appClientDetails');
    AgGridFunctions.getRowWithColIdContainingValue(AppClientGridColId.NAME, appClient.name).click();
    cy.wait('@appClientDetails');

    // Add admin
    const adminDevEmail = `${UtilityFunctions.generateRandomString()}@email.com`;
    cy.get('#developer').type(adminDevEmail).should('have.value', adminDevEmail);
    cy.get('button').contains('Add Developer').should('not.be.disabled').click();

    // Add same Admin, should get validation error
    cy.get('button').contains('Add Developer').should('be.disabled');
    cy.get('#developer').clear().type(adminDevEmail).should('have.value', adminDevEmail);
    cy.get('button').contains('Add Developer').should('be.disabled');
    cy.contains('Developer already exists with that email');

    // Save it
    cy.get('button').contains('Update').should('not.be.disabled').click();
    UtilityFunctions.findToastContainsMessage('Successfully updated App Client');

    AgGridFunctions.clearFilterColumn(AppClientGridColId.NAME);

    // Delete it
    DataCrudFormPageUtil.deleteRowWithColIdContainingValue(AppClientGridColId.NAME, appClient.name, true, true, false);
  });

  it('Should give App Client entity permissions', () => {
    UtilityFunctions.visitSite(`${host}/app-clients`, { headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc }});

    const appClient: AppClient = {
      name: UtilityFunctions.generateRandomString()
    };

    DataCrudFormPageUtil.createAppClientAndSuccess(appClient);
    AgGridFunctions.filterColumnWithSearchValue(AppClientGridColId.NAME, appClient.name, false);

    // Go to edit
    cy.intercept({
      method: 'GET',
      path: `${apiBase}/app-client/*`
    }).as('appClientDetails');
    AgGridFunctions.getRowWithColIdContainingValue(AppClientGridColId.NAME, appClient.name).click();
    cy.wait('@appClientDetails');

    // Person Entity Permissions
    cy.get('button').contains('Person Entity Permissions').click();
    cy.get('#PERSON_CREATE').should('not.be.checked').check({ force: true }).should('be.checked');
    cy.get('#PERSON_DELETE').should('not.be.checked').check({ force: true }).should('be.checked');
    cy.get('#PERSON_READ').should('not.be.checked').check({ force: true }).should('be.checked');
    cy.get('#PERSON_EDIT').should('not.be.checked').check({ force: true }).should('be.checked');

    // Organization Entity Permissions
    cy.get('button').contains('Organization Entity Permissions').click();
    cy.get('#ORGANIZATION_CREATE').should('not.be.checked').check({ force: true }).should('be.checked');
    cy.get('#ORGANIZATION_DELETE').should('not.be.checked').check({ force: true }).should('be.checked');
    cy.get('#ORGANIZATION_READ').should('not.be.checked').check({ force: true }).should('be.checked');
    cy.get('#ORGANIZATION_EDIT').should('not.be.checked').check({ force: true }).should('be.checked');

    // Save it
    cy.get('button').contains('Update').should('not.be.disabled').click();
    UtilityFunctions.findToastContainsMessage('Successfully updated App Client');

    AgGridFunctions.clearFilterColumn(AppClientGridColId.NAME);

    // Delete it
    DataCrudFormPageUtil.deleteRowWithColIdContainingValue(AppClientGridColId.NAME, appClient.name, true, true, false);
  });

  it('Should allow App Source endpoint permission to be given/revoked to/from App Client', () => {
    UtilityFunctions.visitSite(`${host}/app-clients`, { headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc }});

    const appClient: AppClient = {
      name: UtilityFunctions.generateRandomString()
    };

    DataCrudFormPageUtil.createAppClientAndSuccess(appClient);

    // Go to app source page and give permission to app client
    UtilityFunctions.clickOnPageNav(Page.APP_SOURCE);
    const appSourceName = 'puckboard';
    AgGridFunctions.filterColumnWithSearchValue(AppSourceGridColId.NAME, appSourceName, false);
    cy.intercept({
      method: 'GET',
      path: `${apiBase}/app-source/*`
    }).as('appSourceDetails');
    AgGridFunctions.getRowWithColIdContainingValue(AppSourceGridColId.NAME, appSourceName).click();
    cy.wait('@appSourceDetails');

    const appSourceEndpointPath = '/events';

    // Give App Client access
    AgGridFunctions.filterColumnWithSearchValue(AppSourceEndpointGridColId.PATH, appSourceEndpointPath, false, '.endpoint-grid');
    AgGridFunctions.getRowWithColIdContainingValue(AppSourceEndpointGridColId.PATH, appSourceEndpointPath, '.endpoint-grid').click();
    UtilityFunctions.getModalContainer('Endpoint Editor').within(modalContainer => {
      AgGridFunctions.filterColumnWithSearchValue(AppClientGridColId.NAME, appClient.name, false);
      AgGridFunctions.getRowWithColIdContainingValue(AppClientGridColId.NAME, appClient.name).find(`input[type='checkbox']`).should('not.be.checked').click({ force: true });
      cy.get('button').contains('Done').should('not.be.disabled').click();
    });

    cy.get('button').contains('Update').should('not.be.disabled').click();

    UtilityFunctions.findToastContainsMessage('Successfully updated App Source');

    // Go to app client page and make sure app client has access to app source now
    UtilityFunctions.clickOnPageNav(Page.APP_CLIENT);
    AgGridFunctions.filterColumnWithSearchValue(AppClientGridColId.NAME, appClient.name, false);
    cy.intercept({
      method: 'GET',
      path: `${apiBase}/app-client/*`
    }).as('appClientDetails');
    AgGridFunctions.getRowWithColIdContainingValue(AppClientGridColId.NAME, appClient.name).click();
    cy.wait('@appClientDetails');
    cy.get('#name').should('have.value', appClient.name);
    cy.get('button').contains(appSourceName, {matchCase: false}).should('exist').click();
    cy.contains(appSourceEndpointPath).should('exist');
    cy.get('button').contains('Cancel').click();

    // Go to app source page and revoke permission from app client
    UtilityFunctions.clickOnPageNav(Page.APP_SOURCE);
    AgGridFunctions.getRowWithColIdContainingValue(AppSourceGridColId.NAME, appSourceName).click();
    cy.wait('@appSourceDetails');

    AgGridFunctions.filterColumnWithSearchValue(AppSourceEndpointGridColId.PATH, appSourceEndpointPath, false, '.endpoint-grid');
    AgGridFunctions.getRowWithColIdContainingValue(AppSourceEndpointGridColId.PATH, appSourceEndpointPath, '.endpoint-grid').click();
    UtilityFunctions.getModalContainer('Endpoint Editor').within(modalContainer => {
      AgGridFunctions.filterColumnWithSearchValue(AppClientGridColId.NAME, appClient.name, false);
      AgGridFunctions.getRowWithColIdContainingValue(AppClientGridColId.NAME, appClient.name).find(`input[type='checkbox']`).should('be.checked').click({ force: true });
      cy.get('button').contains('Done').should('not.be.disabled').click();
    });

    cy.get('button').contains('Update').should('not.be.disabled').click();

    UtilityFunctions.findToastContainsMessage('Successfully updated App Source');

    // Go to app client page and make sure app client no longer has access to app source
    UtilityFunctions.clickOnPageNav(Page.APP_CLIENT);
    AgGridFunctions.filterColumnWithSearchValue(AppClientGridColId.NAME, appClient.name, false);
    AgGridFunctions.getRowWithColIdContainingValue(AppClientGridColId.NAME, appClient.name).click();
    cy.wait('@appClientDetails');
    cy.get('#name').should('have.value', appClient.name);
    cy.get('button').contains(appSourceName).should('not.exist');
    cy.get('button').contains('Cancel').click();

    // Cleanup
    AgGridFunctions.clearFilterColumn(AppClientGridColId.NAME);
    DataCrudFormPageUtil.deleteRowWithColIdContainingValue(AppClientGridColId.NAME, appClient.name, true, false, false);
  });

  describe('Test App Source Admin add/remove', () => {
    const adminEmail = `${UtilityFunctions.generateRandomString()}@email.com`;

    beforeEach(() => {
      UtilityFunctions.visitSite(`${host}`, { headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc }});
      UtilityFunctions.clickOnPageNav(Page.APP_SOURCE);

      const appSourceName = 'puckboard';
      AgGridFunctions.filterColumnWithSearchValue(AppSourceGridColId.NAME, appSourceName, false);
      cy.intercept({
        method: 'GET',
        path: `${apiBase}/app-source/*`
      }).as('appSourceDetails');
      AgGridFunctions.getRowWithColIdContainingValue(AppSourceGridColId.NAME, appSourceName).click();
      cy.wait('@appSourceDetails');
    });

    it('Should be able to add Admin to App Source', () => {
      cy.get('#admin').should('have.value', '');
      cy.get('button').contains('Add Admin').should('be.disabled');

      cy.get('#admin').clear().type(adminEmail);
      cy.get('button').contains('Add Admin').should('not.be.disabled').click();

      cy.get('.admin-email-grid').within(grid => {
        AgGridFunctions.filterColumnWithSearchValue(AppSourceEmailGridColId.ADMIN, adminEmail, false);
        AgGridFunctions.getRowWithColIdContainingValue(AppSourceEmailGridColId.ADMIN, adminEmail);
        AgGridFunctions.clearFilterColumn(AppSourceEmailGridColId.ADMIN);
      });

      DataCrudFormPageUtil.submitDataCrudFormUpdate();
      UtilityFunctions.findToastContainsMessage('Successfully updated App Source');
    });

    it('Should be able to remove Admin from App Source', () => {
      cy.get('.admin-email-grid').within(grid => {
        DataCrudFormPageUtil.deleteRowWithColIdContainingValue(AppSourceEmailGridColId.ADMIN, adminEmail, false, false, false);
      });

      DataCrudFormPageUtil.submitDataCrudFormUpdate();
      UtilityFunctions.findToastContainsMessage('Successfully updated App Source');
    });
  });

  it('Should be able to toggle Rate Limiting and change requests/minutes', () => {
    UtilityFunctions.visitSite(`${host}`, { headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc }});
    UtilityFunctions.clickOnPageNav(Page.APP_SOURCE);

    const appSourceName = 'puckboard';
    AgGridFunctions.filterColumnWithSearchValue(AppSourceGridColId.NAME, appSourceName, false);
    cy.intercept({
      method: 'GET',
      path: `${apiBase}/app-source/*`
    }).as('appSourceDetails');
    AgGridFunctions.getRowWithColIdContainingValue(AppSourceGridColId.NAME, appSourceName).click();
    cy.wait('@appSourceDetails');

    // Force it to be checked and try to change rate limit value
    cy.get('#rate-limit-toggle').check({ force: true }).should('be.checked');
    cy.get('#rate-limit-count').should('not.be.disabled').clear().type('111a').should('have.value', '111');

    // Force it to be unchecked
    cy.get('#rate-limit-toggle').uncheck({ force: true }).should('not.be.checked');
    cy.get('#rate-limit-count').should('be.disabled');
  });
});
