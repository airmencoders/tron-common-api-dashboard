/// <reference types="Cypress" />

import {apiBase, host, adminJwt, ssoXfcc } from "../support";
import AgGridFunctions, { AppSourceEmailGridColId, AppSourceGridColId, DashboardUserGridColId } from '../support/ag-grid-functions';
import UtilityFunctions, {Page} from '../support/utility-functions';
import DataCrudFormPageUtil from '../support/data-crud-form-functions';

describe('Dashboard Users - App Source Admin Tests', () => {

  it.skip('Should create a Dashboard User for App Source Admin add', () => {
    const adminEmail = `${UtilityFunctions.generateRandomString()}@email.com`;

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

    // navigate to dashboard users page to check if user exists
    UtilityFunctions.clickOnPageNav(Page.DASHBOARD_USER);


    AgGridFunctions.getRowWithColIdContainingValue(DashboardUserGridColId.EMAIL, adminEmail);
    AgGridFunctions.clearFilterColumn(DashboardUserGridColId.EMAIL);

    // remove admin again
    UtilityFunctions.clickOnPageNav(Page.APP_SOURCE);
    AgGridFunctions.filterColumnWithSearchValue(AppSourceGridColId.NAME, appSourceName, false);
    cy.intercept({
      method: 'GET',
      path: `${apiBase}/app-source/*`
    }).as('appSourceDetails');
    AgGridFunctions.getRowWithColIdContainingValue(AppSourceGridColId.NAME, appSourceName).click();
    cy.wait('@appSourceDetails');

    cy.get('#admin').should('have.value', '');
    cy.get('.admin-email-grid').within(grid => {
      DataCrudFormPageUtil.deleteRowWithColIdContainingValue(AppSourceEmailGridColId.ADMIN, adminEmail, false, false, false);
    });

    DataCrudFormPageUtil.submitDataCrudFormUpdate();
    UtilityFunctions.findToastContainsMessage('Successfully updated App Source');

    // verify dashboard user removed
    UtilityFunctions.clickOnPageNav(Page.DASHBOARD_USER);

    AgGridFunctions.filterColumnWithSearchValue(DashboardUserGridColId.EMAIL, adminEmail, false,
        undefined, false);
    AgGridFunctions.clearFilterColumn(DashboardUserGridColId.EMAIL);
  })
})
