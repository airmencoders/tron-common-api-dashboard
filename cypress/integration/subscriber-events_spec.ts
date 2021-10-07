/// <reference types="Cypress" />

import { host, subscriptionsApiBase , adminJwt, ssoXfcc } from "../support";
import AppClientSetupFunctions from '../support/app-client-setup-functions';
import DataCrudFormPageUtil, { SubscribeEvent, Subscriber, SubscriberGridColId } from '../support/data-crud-form-functions';
import UtilityFunctions, { Page } from '../support/utility-functions';

function createSubscriberAndFillForm(data: Subscriber) {
  // Opens the sidedrawer for Add form
  cy.get('.add-data-container > [data-testid=button]').click();

  fillSubscriberForm(data);
}

function fillSubscriberForm(data: Subscriber) {
  const { appClientName, subscriberAddress, event, secret } = data;

  cy.get('#appclients').select(appClientName).should('have.value', appClientName);
  cy.get('#subscriberAddress').clear().type(subscriberAddress).should('have.value', subscriberAddress);
  cy.get('#event_PERSON_CHANGE').check({ force: true }).should('be.checked');
  cy.get('#secretPhrase').clear().type(secret).should('have.value', secret);
}

function createSubscriberAndSuccess(data: Subscriber) {
  createSubscriberAndFillForm(data);

  // Submit the form
  DataCrudFormPageUtil.submitDataCrudFormCreate();
}

function createSubscriberAndFilterExists(data: Subscriber) {
  cy.intercept({ method: 'POST', path: `${subscriptionsApiBase}` }).as('subscriberCreate');
  createSubscriberAndSuccess(data);

  cy.wait('@subscriberCreate').then((intercept) => {
    filterColumnWithSearchValueNoRequest(SubscriberGridColId.APP_CLIENT_NAME, intercept.response.body.appClientUser);
    DataCrudFormPageUtil.getRowWithColIdContainingValue(SubscriberGridColId.APP_CLIENT_NAME, intercept.response.body.appClientUser);
    DataCrudFormPageUtil.clearFilterColumn(SubscriberGridColId.APP_CLIENT_NAME);
  });
}

function deleteRowWithColIdContainingValue(colId: string, value: string) {
  DataCrudFormPageUtil.deleteRowWithColIdContainingValue(colId, value, true, true, false);
}

function filterColumnWithSearchValueNoRequest(colId: string, searchValue: string, searchParentSelector?: string) {
  DataCrudFormPageUtil.filterColumnWithSearchValue(colId, searchValue, false, searchParentSelector);
}

describe('Subscriber Events Tests', () => {
  it('Should allow to subscribe/unsubscribe to events ', () => {
    // Create an App Client first
    AppClientSetupFunctions.addAndConfigureAppClient(['PERSON_READ', 'PERSON_CREATE', 'PERSON_EDIT', 'PERSON_DELETE']);

    UtilityFunctions.visitSite(host, { headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc }});

    // Create subscription
    UtilityFunctions.clickOnPageNav(Page.PUB_SUB);

    const subscriber: Subscriber = {
      appClientName: AppClientSetupFunctions.APP_CLIENT_NAME,
      subscriberAddress: `/test/${UtilityFunctions.generateRandomString()}`,
      event: SubscribeEvent.PERSON_CHANGE,
      secret: UtilityFunctions.generateRandomString()
    };

    createSubscriberAndFilterExists(subscriber);

    // Delete subscription
    deleteRowWithColIdContainingValue(SubscriberGridColId.APP_CLIENT_NAME, subscriber.appClientName);
  });

  it('Should allow to edit subscribed events ', () => {
    // Create an App Client first
    AppClientSetupFunctions.addAndConfigureAppClient(['PERSON_READ', 'PERSON_CREATE', 'PERSON_EDIT', 'PERSON_DELETE']);

    UtilityFunctions.visitSite(host, { headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc }});

    UtilityFunctions.clickOnPageNav(Page.PUB_SUB);

    const subscriber: Subscriber = {
      appClientName: AppClientSetupFunctions.APP_CLIENT_NAME,
      subscriberAddress: `/test/${UtilityFunctions.generateRandomString()}`,
      event: SubscribeEvent.PERSON_CHANGE,
      secret: UtilityFunctions.generateRandomString()
    };

    createSubscriberAndSuccess(subscriber);

    // Open edit form
    filterColumnWithSearchValueNoRequest(SubscriberGridColId.APP_CLIENT_NAME, subscriber.appClientName);
    DataCrudFormPageUtil.getRowWithColIdContainingValue(SubscriberGridColId.APP_CLIENT_NAME, subscriber.appClientName).click();
    cy.get('#subscriberAddress').should('have.value', subscriber.subscriberAddress);

    // Change it
    cy.get('#event_PERSON_ORG_REMOVE').check({ force: true }).should('be.checked');

    // Save it
    DataCrudFormPageUtil.submitDataCrudFormUpdate();

    // Delete it
    deleteRowWithColIdContainingValue(SubscriberGridColId.APP_CLIENT_NAME, subscriber.appClientName);
  });
});