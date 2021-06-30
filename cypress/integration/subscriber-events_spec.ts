/// <reference types="Cypress" />

import { host, subscriptionsApiBase } from '../support';
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
  cy.get('#events').select(event).should('have.value', event);
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
    filterColumnWithSearchValueNoRequest(SubscriberGridColId.ID, intercept.response.body.id);
    DataCrudFormPageUtil.getRowWithColIdContainingValue(SubscriberGridColId.ID, intercept.response.body.id);
    DataCrudFormPageUtil.clearFilterColumn(SubscriberGridColId.ID);
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
    cy.visit(host);

    UtilityFunctions.clickOnPageNav(Page.PUB_SUB);

    const subscriber: Subscriber = {
      appClientName: 'puckboard',
      subscriberAddress: `/test/${UtilityFunctions.generateRandomString()}`,
      event: SubscribeEvent.ORGANIZATION_DELETE,
      secret: UtilityFunctions.generateRandomString()
    };

    createSubscriberAndFilterExists(subscriber);

    // Delete it
    deleteRowWithColIdContainingValue(SubscriberGridColId.SUBSCRIBER_URL, subscriber.subscriberAddress);
  });

  it('Should allow to edit subscribed events ', () => {
    cy.visit(host);

    UtilityFunctions.clickOnPageNav(Page.PUB_SUB);

    const subscriber: Subscriber = {
      appClientName: 'puckboard',
      subscriberAddress: `/test/${UtilityFunctions.generateRandomString()}`,
      event: SubscribeEvent.ORGANIZATION_DELETE,
      secret: UtilityFunctions.generateRandomString()
    };

    createSubscriberAndSuccess(subscriber);

    // Open edit form
    filterColumnWithSearchValueNoRequest(SubscriberGridColId.SUBSCRIBER_URL, subscriber.subscriberAddress);
    DataCrudFormPageUtil.getRowWithColIdContainingValue(SubscriberGridColId.SUBSCRIBER_URL, subscriber.subscriberAddress).click();
    cy.get('#subscriberAddress').should('have.value', subscriber.subscriberAddress);

    // Change it
    cy.get('#events').select(SubscribeEvent.PERSON_ORG_REMOVE).should('have.value', SubscribeEvent.PERSON_ORG_REMOVE);

    // Save it
    DataCrudFormPageUtil.submitDataCrudFormUpdate();

    // Delete it
    deleteRowWithColIdContainingValue(SubscriberGridColId.SUBSCRIBER_URL, subscriber.subscriberAddress);
  });
});