/// <reference types="Cypress" />

import { apiBase, host, scratchAppApiBase , adminJwt, ssoXfcc } from "../support";
import AgGridFunctions, { DigitizeAppsGridColId, ScratchStorageGridColId } from '../support/ag-grid-functions';
import DataCrudFormPageUtil, { ScratchStorageApp, ScratchStorageUser } from '../support/data-crud-form-functions';
import UtilityFunctions, { Page } from '../support/utility-functions';

function createScratchAppAndFillForm(app: ScratchStorageApp) {
  // Opens the sidedrawer for Add form
  cy.get('.add-data-container > [data-testid=button]').click();

  fillScratchAppForm(app);
}

function fillScratchAppForm(app: ScratchStorageApp) {
  const { name, aclMode, implicitRead } = app;

  cy.get('#appName').clear().type(name).should('have.value', name);

  if (implicitRead) {
    cy.get('#implicit_read').check({ force: true }).should('be.checked');
  } else {
    cy.get('#implicit_read').uncheck({ force: true }).should('not.be.checked');
  }

  if (aclMode) {
    cy.get('#acl_mode').check({ force: true }).should('be.checked');
  } else {
    cy.get('#acl_mode').uncheck({ force: true }).should('not.be.checked');
  }
}

function createScratchAppAndSuccess(app: ScratchStorageApp) {
  createScratchAppAndFillForm(app);

  // Submit the form
  DataCrudFormPageUtil.submitDataCrudFormCreate();
}

function createScratchAppAndFilterExists(app: ScratchStorageApp) {
  cy.intercept({ method: 'POST', path: `${scratchAppApiBase}/apps` }).as('scratchAppCreate');
  createScratchAppAndSuccess(app);

  cy.wait('@scratchAppCreate').then((intercept) => {
    filterColumnWithSearchValueNoRequest(ScratchStorageGridColId.ID, intercept?.response?.body.id);
    AgGridFunctions.getRowWithColIdContainingValue(ScratchStorageGridColId.ID, intercept?.response?.body.id);
    AgGridFunctions.clearFilterColumn(ScratchStorageGridColId.ID);
  });
}

function deleteRowWithColIdContainingValue(colId: string, value: string) {
  DataCrudFormPageUtil.deleteRowWithColIdContainingValue(colId, value, true, false, false);
}

function filterColumnWithSearchValueNoRequest(colId: string, searchValue: string, searchParentSelector?: string) {
  AgGridFunctions.filterColumnWithSearchValue(colId, searchValue, false, searchParentSelector);
}

/**
 * Creates interception aliases for the requests made upon row click
 * @returns array of aliases
 */
function createFormRequestsToInterceptOnRowClick(): string[] {
  cy.intercept({
    method: 'GET',
    path: `${scratchAppApiBase}/apps/*`
  }).as('getScratchApp');

  cy.intercept({
    method: 'GET',
    path: `${scratchAppApiBase}/apps/*/keys`
  }).as('getScratchAppKeys');

  return ['@getScratchApp', '@getScratchAppKeys'];
}

describe('Scratch Storage Tests', () => {
  it('Should allow Scratch Storage creation & deletion', () => {
    UtilityFunctions.visitSite(host, { headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc }});

    UtilityFunctions.clickOnPageNav(Page.SCRATCH_STORAGE);

    const scratchApp: ScratchStorageApp = {
      name: UtilityFunctions.generateRandomString(),
      aclMode: true,
      implicitRead: false
    };

    createScratchAppAndFilterExists(scratchApp);

    // Delete it
    deleteRowWithColIdContainingValue(ScratchStorageGridColId.APP_NAME, scratchApp.name);
  });

  it('Should give access to user and add key/value', () => {
    cy.intercept({
      method: 'GET',
      path: `${apiBase}/userinfo`
    }).as('getUserInfo');

    UtilityFunctions.visitSite(host, { headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc }});

    const scratchApp: ScratchStorageApp = {
      name: UtilityFunctions.generateRandomString(),
      aclMode: true,
      implicitRead: false
    };

    cy.wait('@getUserInfo').then(intercept => {
      const user: ScratchStorageUser = {
        email: intercept?.response?.body.email,
        read: true,
        write: true,
        admin: true
      };

      UtilityFunctions.clickOnPageNav(Page.SCRATCH_STORAGE);

      createScratchAppAndSuccess(scratchApp);

      // Try to edit the scratch app to add a user
      filterColumnWithSearchValueNoRequest(ScratchStorageGridColId.APP_NAME, scratchApp.name);
      const requestAliases = createFormRequestsToInterceptOnRowClick();
      AgGridFunctions.getRowWithColIdContainingValue(ScratchStorageGridColId.APP_NAME, scratchApp.name).click();
      cy.wait(requestAliases);
      cy.get('#appName').should('have.value', scratchApp.name);

      // Add the current user
      cy.get('button').contains('Add User').click();
      UtilityFunctions.getModalContainer('Add User Editor').within(modal => {
        cy.get('#email').clear().type(user.email).should('have.value', user.email);

        if (user.read) {
          cy.get('#read').check({ force: true }).should('be.checked');
        }

        if (user.admin) {
          cy.get('#admin').check({ force: true }).should('be.checked');
        }

        if (user.write) {
          cy.get('#write').check({ force: true }).should('be.checked');
        }

        cy.get('button').contains('Add User').should('not.be.disabled').click();
        cy.get('button').contains('Done').click();
      });
    });

    // Add a key value
    cy.get('button').contains('Add Key/Value').click();
    const kvp = {
      key: UtilityFunctions.generateRandomString(),
      value: UtilityFunctions.generateRandomString()
    };
    UtilityFunctions.getModalContainer('Create Key/Value').within(modal => {
      cy.get('#keyName').clear().type(kvp.key).should('have.value', kvp.key);
      cy.get('#keyValue').clear().type(kvp.value).should('have.value', kvp.value);
      cy.get('button').contains('Save Key/Value').should('not.be.disabled').click();
    });

    // Save it
    DataCrudFormPageUtil.submitDataCrudFormUpdate();

    // Check that Scratch App appears as one of our apps in My Digitize Page
    UtilityFunctions.clickOnPageNav(Page.MY_DIGITIZE_APPS);
    filterColumnWithSearchValueNoRequest(DigitizeAppsGridColId.APP_NAME, scratchApp.name);
    AgGridFunctions.getRowWithColIdContainingValue(DigitizeAppsGridColId.APP_NAME, scratchApp.name);
    
    // Delete it
    UtilityFunctions.clickOnPageNav(Page.SCRATCH_STORAGE);
    deleteRowWithColIdContainingValue(ScratchStorageGridColId.APP_NAME, scratchApp.name);
  });
});
