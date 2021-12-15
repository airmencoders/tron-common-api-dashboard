/// <reference types="Cypress" />

import {apiBase, host, adminJwt, ssoXfcc, skipIfPipeline } from "../support";
import UtilityFunctions, {Page} from '../support/utility-functions';
import DataCrudFormPageUtil, { AppClient } from '../support/data-crud-form-functions';
import AgGridFunctions, { AppClientGridColId, DashboardUserGridColId } from '../support/ag-grid-functions';

describe('Dashboard Users - App Client Dev Tests', () => {

  skipIfPipeline('Should create a Dashboard User for App Client Dev add', () => {
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


    // Save it
    cy.get('button').contains('Update').should('not.be.disabled').click();
    UtilityFunctions.findToastContainsMessage('Successfully updated App Client');

    // navigate to dashboard users page to check if user exists
    UtilityFunctions.clickOnPageNav(Page.DASHBOARD_USER);

    AgGridFunctions.getRowWithColIdContainingValue(DashboardUserGridColId.EMAIL, adminDevEmail);
    AgGridFunctions.clearFilterColumn(DashboardUserGridColId.EMAIL);

    // navigate to back to app client page to check if user exists
    UtilityFunctions.clickOnPageNav(Page.APP_CLIENT);

    // Delete it
    DataCrudFormPageUtil.deleteRowWithColIdContainingValue(AppClientGridColId.NAME, appClient.name, true,
        true, false);

    // verify dashboard user removed
    UtilityFunctions.clickOnPageNav(Page.DASHBOARD_USER);

    AgGridFunctions.filterColumnWithSearchValue(DashboardUserGridColId.EMAIL, adminDevEmail, false,
        undefined, false);
    AgGridFunctions.clearFilterColumn(DashboardUserGridColId.EMAIL);
  })
})
