/// <reference types="Cypress" />

import { dashboardUserApiBase, host , adminJwt, ssoXfcc } from "../support";
import AgGridFunctions, { DashboardUserGridColId } from '../support/ag-grid-functions';
import DataCrudFormPageUtil, { DashboardUser } from '../support/data-crud-form-functions';
import UtilityFunctions, { Page } from '../support/utility-functions';

function createDashboardUserAndFillForm(data: DashboardUser) {
  // Opens the sidedrawer for Add form
  cy.get('.add-data-container > [data-testid=button]').click();

  fillDashboardUserForm(data);
}

function fillDashboardUserForm(data: DashboardUser) {
  const { email, admin } = data;

  cy.get('#email').clear().type(email).should('have.value', email);

  if (admin) {
    cy.get('#dashboard_admin').check({ force: true }).should('be.checked');
  } else {
    cy.get('#dashboard_admin').uncheck({ force: true }).should('not.be.checked');
  }
}

function createDashboardUserAndSuccess(data: DashboardUser) {
  createDashboardUserAndFillForm(data);

  // Submit the form
  DataCrudFormPageUtil.submitDataCrudFormCreate();
}

function createDashboardUserAndFilterExists(data: DashboardUser) {
  cy.intercept({ method: 'POST', path: `${dashboardUserApiBase}` }).as('dashboardUserCreate');
  createDashboardUserAndSuccess(data);

  cy.wait('@dashboardUserCreate').then((intercept) => {
    filterColumnWithSearchValueNoRequest(DashboardUserGridColId.ID, intercept.response.body.id);
    AgGridFunctions.getRowWithColIdContainingValue(DashboardUserGridColId.ID, intercept.response.body.id);
    AgGridFunctions.clearFilterColumn(DashboardUserGridColId.ID);
  });
}

function deleteRowWithColIdContainingValue(colId: string, value: string) {
  DataCrudFormPageUtil.deleteRowWithColIdContainingValue(colId, value, true, true, false);
}

function filterColumnWithSearchValueNoRequest(colId: string, searchValue: string, searchParentSelector?: string) {
  AgGridFunctions.filterColumnWithSearchValue(colId, searchValue, false, searchParentSelector);
}

describe('Dashboard Users Tests', () => {
  it('Should allow Dashboard User creation & deletion', () => {
    UtilityFunctions.visitSite(host, { headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc }});

    UtilityFunctions.clickOnPageNav(Page.DASHBOARD_USER);

    const dashboardUser: DashboardUser = {
      email: `${UtilityFunctions.generateRandomString()}@email.com`,
      admin: true
    };

    createDashboardUserAndFilterExists(dashboardUser);

    // Delete it
    deleteRowWithColIdContainingValue(DashboardUserGridColId.EMAIL, dashboardUser.email);
  });

  it('Should allow Dashboard User edit', () => {
    UtilityFunctions.visitSite(host, { headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc }});

    UtilityFunctions.clickOnPageNav(Page.DASHBOARD_USER);

    const dashboardUser: DashboardUser = {
      email: `${UtilityFunctions.generateRandomString()}@email.com`,
      admin: true
    };

    createDashboardUserAndSuccess(dashboardUser);

    // Open edit form
    filterColumnWithSearchValueNoRequest(DashboardUserGridColId.EMAIL, dashboardUser.email);
    AgGridFunctions.getRowWithColIdContainingValue(DashboardUserGridColId.EMAIL, dashboardUser.email).click();
    cy.get('#email').should('have.value', dashboardUser.email);

    // Edit dashboard user
    cy.get('#dashboard_admin').should('be.checked').uncheck({ force: true });

    // Save
    DataCrudFormPageUtil.submitDataCrudFormUpdate();

    // Delete it
    deleteRowWithColIdContainingValue(DashboardUserGridColId.EMAIL, dashboardUser.email);
  });
});
