/// <reference types="Cypress" />

import { apiBase, host } from '../support';
import DataCrudFormPageUtil, { AppClient, AppClientGridColId, AppSourceEmailGridColId, AppSourceEndpointGridColId, AppSourceGridColId } from '../support/data-crud-form-functions';
import UtilityFunctions from '../support/utility-functions';

describe('App Source / App Client Tests', () => {
  it('Should allow App Client creation & deletion', () => {
    cy.visit(host);

    cy.get('[href="/app-clients"] > .sidebar-item__name').click({ force: true });

    const appClient: AppClient = {
      name: UtilityFunctions.generateRandomString()
    };

    DataCrudFormPageUtil.createAppClientAndSuccess(appClient);

    // Delete it
    DataCrudFormPageUtil.deleteRowWithColIdContainingValue(AppClientGridColId.NAME, appClient.name, true, true, false);
  });

  it('Should be able to add Developer to App Client', () => {
    cy.visit(`${host}/app-clients`);

    const appClient: AppClient = {
      name: UtilityFunctions.generateRandomString()
    };

    DataCrudFormPageUtil.createAppClientAndSuccess(appClient);
    DataCrudFormPageUtil.filterColumnWithSearchValue(AppClientGridColId.NAME, appClient.name, false);

    // Go to edit
    cy.intercept({
      method: 'GET',
      path: `${apiBase}/app-client/*`
    }).as('appClientDetails');
    DataCrudFormPageUtil.getRowWithColIdContainingValue(AppClientGridColId.NAME, appClient.name).click();
    cy.wait('@appClientDetails');

    // Add admin
    const adminDevEmail = `${UtilityFunctions.generateRandomString()}@email.com`;
    cy.get('#developer').type(adminDevEmail).should('have.value', adminDevEmail);
    cy.get('button').contains('Add Developer').should('not.be.disabled').click();

    // Save it
    cy.get('button').contains('Update').should('not.be.disabled').click();
    UtilityFunctions.findToastContainsMessage('Successfully updated App Client');

    DataCrudFormPageUtil.clearFilterColumn(AppClientGridColId.NAME);

    // Delete it
    DataCrudFormPageUtil.deleteRowWithColIdContainingValue(AppClientGridColId.NAME, appClient.name, true, true, false);
  });

  it('Should give App Client entity permissions', () => {
    cy.visit(`${host}/app-clients`);

    const appClient: AppClient = {
      name: UtilityFunctions.generateRandomString()
    };

    DataCrudFormPageUtil.createAppClientAndSuccess(appClient);
    DataCrudFormPageUtil.filterColumnWithSearchValue(AppClientGridColId.NAME, appClient.name, false);

    // Go to edit
    cy.intercept({
      method: 'GET',
      path: `${apiBase}/app-client/*`
    }).as('appClientDetails');
    DataCrudFormPageUtil.getRowWithColIdContainingValue(AppClientGridColId.NAME, appClient.name).click();
    cy.wait('@appClientDetails');

    // Person Entity Permissions
    cy.get('button').contains('Person Entity Permissions').click();
    cy.get('#PERSON_CREATE').should('not.be.checked').check({ force: true }).should('be.checked');
    cy.get('#PERSON_DELETE').should('not.be.checked').check({ force: true }).should('be.checked');
    cy.get('#PERSON_READ').should('not.be.checked').check({ force: true }).should('be.checked');
    cy.get('#PERSON_EDIT').should('be.disabled');

    // Organization Entity Permissions
    cy.get('button').contains('Organization Entity Permissions').click();
    cy.get('#ORGANIZATION_CREATE').should('not.be.checked').check({ force: true }).should('be.checked');
    cy.get('#ORGANIZATION_DELETE').should('not.be.checked').check({ force: true }).should('be.checked');
    cy.get('#ORGANIZATION_READ').should('not.be.checked').check({ force: true }).should('be.checked');
    cy.get('#ORGANIZATION_EDIT').should('be.disabled');

    // Save it
    cy.get('button').contains('Update').should('not.be.disabled').click();
    UtilityFunctions.findToastContainsMessage('Successfully updated App Client');

    DataCrudFormPageUtil.clearFilterColumn(AppClientGridColId.NAME);

    // Delete it
    DataCrudFormPageUtil.deleteRowWithColIdContainingValue(AppClientGridColId.NAME, appClient.name, true, true, false);
  });

  it('Should allow App Source endpoint permission to be given/revoked to/from App Client', () => {
    cy.visit(`${host}/app-clients`);

    const appClient: AppClient = {
      name: UtilityFunctions.generateRandomString()
    };

    DataCrudFormPageUtil.createAppClientAndSuccess(appClient);

    // Go to app source page and give permission to app client
    cy.get('[href="/app-source"] > .sidebar-item__name').click();
    const appSourceName = 'puckboard';
    DataCrudFormPageUtil.filterColumnWithSearchValue(AppSourceGridColId.NAME, appSourceName, false);
    cy.intercept({
      method: 'GET',
      path: `${apiBase}/app-source/*`
    }).as('appSourceDetails');
    DataCrudFormPageUtil.getRowWithColIdContainingValue(AppSourceGridColId.NAME, appSourceName).click();
    cy.wait('@appSourceDetails');

    const appSourceEndpointPath = '/events';

    // Give App Client access
    DataCrudFormPageUtil.filterColumnWithSearchValue(AppSourceEndpointGridColId.PATH, appSourceEndpointPath, false, '.endpoint-grid');
    DataCrudFormPageUtil.getRowWithColIdContainingValue(AppSourceEndpointGridColId.PATH, appSourceEndpointPath, '.endpoint-grid').click();
    UtilityFunctions.getModalContainer('Endpoint Editor').within(modalContainer => {
      DataCrudFormPageUtil.filterColumnWithSearchValue(AppClientGridColId.NAME, appClient.name, false);
      DataCrudFormPageUtil.getRowWithColIdContainingValue(AppClientGridColId.NAME, appClient.name).find(`input[type='checkbox']`).should('not.be.checked').click({ force: true });
      cy.get('button').contains('Done').should('not.be.disabled').click();
    });

    cy.get('button').contains('Update').should('not.be.disabled').click();

    UtilityFunctions.findToastContainsMessage('Successfully updated App Source');

    // Go to app client page and make sure app client has access to app source now
    cy.get('[href="/app-clients"] > .sidebar-item__name').click();
    DataCrudFormPageUtil.filterColumnWithSearchValue(AppClientGridColId.NAME, appClient.name, false);
    cy.intercept({
      method: 'GET',
      path: `${apiBase}/app-client/*`
    }).as('appClientDetails');
    DataCrudFormPageUtil.getRowWithColIdContainingValue(AppClientGridColId.NAME, appClient.name).click();
    cy.wait('@appClientDetails');
    cy.get('#name').should('have.value', appClient.name);
    cy.get('button').contains(appSourceName).should('exist').click();
    cy.contains(appSourceEndpointPath).should('exist');
    cy.get('button').contains('Cancel').click();

    // Go to app source page and revoke permission from app client
    cy.get('[href="/app-source"] > .sidebar-item__name').click();
    DataCrudFormPageUtil.getRowWithColIdContainingValue(AppSourceGridColId.NAME, appSourceName).click();
    cy.wait('@appSourceDetails');

    DataCrudFormPageUtil.filterColumnWithSearchValue(AppSourceEndpointGridColId.PATH, appSourceEndpointPath, false, '.endpoint-grid');
    DataCrudFormPageUtil.getRowWithColIdContainingValue(AppSourceEndpointGridColId.PATH, appSourceEndpointPath, '.endpoint-grid').click();
    UtilityFunctions.getModalContainer('Endpoint Editor').within(modalContainer => {
      DataCrudFormPageUtil.filterColumnWithSearchValue(AppClientGridColId.NAME, appClient.name, false);
      DataCrudFormPageUtil.getRowWithColIdContainingValue(AppClientGridColId.NAME, appClient.name).find(`input[type='checkbox']`).should('be.checked').click({ force: true });
      cy.get('button').contains('Done').should('not.be.disabled').click();
    });

    cy.get('button').contains('Update').should('not.be.disabled').click();

    UtilityFunctions.findToastContainsMessage('Successfully updated App Source');

    // Go to app client page and make sure app client no longer has access to app source
    cy.get('[href="/app-clients"] > .sidebar-item__name').click();
    DataCrudFormPageUtil.filterColumnWithSearchValue(AppClientGridColId.NAME, appClient.name, false);
    DataCrudFormPageUtil.getRowWithColIdContainingValue(AppClientGridColId.NAME, appClient.name).click();
    cy.wait('@appClientDetails');
    cy.get('#name').should('have.value', appClient.name);
    cy.get('button').contains(appSourceName).should('not.exist');
    cy.get('button').contains('Cancel').click();

    // Cleanup
    DataCrudFormPageUtil.clearFilterColumn(AppClientGridColId.NAME);
    DataCrudFormPageUtil.deleteRowWithColIdContainingValue(AppClientGridColId.NAME, appClient.name, true, false, false);
  });

  describe('Test App Source Admin add/remove', () => {
    const adminEmail = `${UtilityFunctions.generateRandomString()}@email.com`;

    beforeEach(() => {
      cy.visit(`${host}`);
      cy.get('[href="/app-source"] > .sidebar-item__name').click({ force: true });

      const appSourceName = 'puckboard';
      DataCrudFormPageUtil.filterColumnWithSearchValue(AppSourceGridColId.NAME, appSourceName, false);
      cy.intercept({
        method: 'GET',
        path: `${apiBase}/app-source/*`
      }).as('appSourceDetails');
      DataCrudFormPageUtil.getRowWithColIdContainingValue(AppSourceGridColId.NAME, appSourceName).click();
      cy.wait('@appSourceDetails');
    });

    it('Should be able to add Admin to App Source', () => {
      cy.get('#admin').should('have.value', '');
      cy.get('button').contains('Add Admin').should('be.disabled');

      cy.get('#admin').clear().type(adminEmail);
      cy.get('button').contains('Add Admin').should('not.be.disabled').click();

      cy.get('.admin-email-grid').within(grid => {
        DataCrudFormPageUtil.filterColumnWithSearchValue(AppSourceEmailGridColId.ADMIN, adminEmail, false);
        DataCrudFormPageUtil.getRowWithColIdContainingValue(AppSourceEmailGridColId.ADMIN, adminEmail);
        DataCrudFormPageUtil.clearFilterColumn(AppSourceEmailGridColId.ADMIN);
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
});
