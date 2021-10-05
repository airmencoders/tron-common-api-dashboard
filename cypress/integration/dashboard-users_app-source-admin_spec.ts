/// <reference types="Cypress" />

import {apiBase, host, adminJwt, ssoXfcc } from "../support";
import UtilityFunctions, {Page} from '../support/utility-functions';
import DataCrudFormPageUtil, {
  AppClient,
  AppClientGridColId, AppSourceEmailGridColId, AppSourceGridColId,
  DashboardUserGridColId
} from '../support/data-crud-form-functions';

describe('Dashboard Users - App Source Admin Tests', () => {

  it('Should create a Dashboard User for App Source Admin add', () => {
    const adminEmail = `${UtilityFunctions.generateRandomString()}@email.com`;

    UtilityFunctions.visitSite(`${host}`, { headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc }});
    UtilityFunctions.clickOnPageNav(Page.APP_SOURCE);

    const appSourceName = 'puckboard';
    DataCrudFormPageUtil.filterColumnWithSearchValue(AppSourceGridColId.NAME, appSourceName, false);
    cy.intercept({
      method: 'GET',
      path: `${apiBase}/app-source/*`
    }).as('appSourceDetails');
    DataCrudFormPageUtil.getRowWithColIdContainingValue(AppSourceGridColId.NAME, appSourceName).click();
    cy.wait('@appSourceDetails');

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

    // navigate to dashboard users page to check if user exists
    UtilityFunctions.clickOnPageNav(Page.DASHBOARD_USER);


    DataCrudFormPageUtil.getRowWithColIdContainingValue(DashboardUserGridColId.EMAIL, adminEmail);
    DataCrudFormPageUtil.clearFilterColumn(DashboardUserGridColId.EMAIL);

    // remove admin again
    UtilityFunctions.clickOnPageNav(Page.APP_SOURCE);
    DataCrudFormPageUtil.filterColumnWithSearchValue(AppSourceGridColId.NAME, appSourceName, false);
    cy.intercept({
      method: 'GET',
      path: `${apiBase}/app-source/*`
    }).as('appSourceDetails');
    DataCrudFormPageUtil.getRowWithColIdContainingValue(AppSourceGridColId.NAME, appSourceName).click();
    cy.wait('@appSourceDetails');

    cy.get('#admin').should('have.value', '');
    cy.get('.admin-email-grid').within(grid => {
      DataCrudFormPageUtil.deleteRowWithColIdContainingValue(AppSourceEmailGridColId.ADMIN, adminEmail, false, false, false);
    });

    DataCrudFormPageUtil.submitDataCrudFormUpdate();
    UtilityFunctions.findToastContainsMessage('Successfully updated App Source');

    // verify dashboard user removed
    UtilityFunctions.clickOnPageNav(Page.DASHBOARD_USER);

    DataCrudFormPageUtil.filterColumnWithSearchValue(DashboardUserGridColId.EMAIL, adminEmail, false,
        undefined, false);
    DataCrudFormPageUtil.clearFilterColumn(DashboardUserGridColId.EMAIL);
  })
})
