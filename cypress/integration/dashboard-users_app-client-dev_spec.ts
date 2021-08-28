/// <reference types="Cypress" />

import {apiBase, host} from '../support';
import UtilityFunctions, {Page} from '../support/utility-functions';
import DataCrudFormPageUtil, {
  AppClient,
  AppClientGridColId,
  DashboardUserGridColId
} from '../support/data-crud-form-functions';

describe('Dashboard Users - App Client Dev Tests', () => {

  it('Should create a Dashboard User for App Client Dev add', () => {
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

    // navigate to dashboard users page to check if user exists
    UtilityFunctions.clickOnPageNav(Page.DASHBOARD_USER);

    DataCrudFormPageUtil.getRowWithColIdContainingValue(DashboardUserGridColId.EMAIL, adminDevEmail);
    DataCrudFormPageUtil.clearFilterColumn(DashboardUserGridColId.EMAIL);

    // navigate to back to app client page to check if user exists
    UtilityFunctions.clickOnPageNav(Page.APP_CLIENT);

    // Delete it
    DataCrudFormPageUtil.deleteRowWithColIdContainingValue(AppClientGridColId.NAME, appClient.name, true,
        true, false);

    // verify dashboard user removed
    UtilityFunctions.clickOnPageNav(Page.DASHBOARD_USER);

    DataCrudFormPageUtil.filterColumnWithSearchValue(DashboardUserGridColId.EMAIL, adminDevEmail, false,
        undefined, false);
    DataCrudFormPageUtil.clearFilterColumn(DashboardUserGridColId.EMAIL);
  })
})
