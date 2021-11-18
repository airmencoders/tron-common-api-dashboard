/// <reference types="Cypress" />

import {host, orgApiBase, adminJwt, ssoXfcc } from "../support";
import AgGridFunctions, { PersonGridColId } from '../support/ag-grid-functions';
import { cleanup } from "../support/cleanup-helper";
import DataCrudFormPageUtil, { Person } from '../support/data-crud-form-functions';
import UtilityFunctions, { Page } from '../support/utility-functions';

describe('Person Tests', () => {
  const dataTypeName = 'Person';

  beforeEach(() => {
    cleanup();
  });

  after(() => {
    cleanup();
  });

  it('Should allow Person creation & deletion', () => {
    UtilityFunctions.visitSite(host, { headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc }});

    UtilityFunctions.clickOnPageNav(Page.PERSON);

    const person: Person = {
      email: `${UtilityFunctions.generateRandomString()}@email.com`,
      firstName: UtilityFunctions.generateRandomString(),
      middleName: 'Middle Name',
      lastName: 'Last Name',
      branch: 'USAF',
      rank: 'Lt Gen',
      title: 'Person Title',
      dodid: '555555',
      phone: '(555)555-5555',
      address: '123 Lane Lane, Honolulu, HI 96825',
      dutyPhone: '(555)555-5555'
    };

    DataCrudFormPageUtil.createPersonAndFilterExists(person);

    // Delete it
    DataCrudFormPageUtil.deleteRowWithColIdContainingValue(PersonGridColId.FIRST_NAME, person.firstName);
  });

  it('Should error when trying to add Person with same email', () => {
    UtilityFunctions.visitSite(`${host}/person`, { headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc }});

    const person: Person = {
      email: `${UtilityFunctions.generateRandomString()}@email.com`,
      firstName: UtilityFunctions.generateRandomString(),
      lastName: 'Last Name',
      branch: 'USAF',
      rank: 'Lt Gen',
    };

    // Add a new Person
    DataCrudFormPageUtil.createPersonAndFilterExists(person);

    // Try to add existing and expect an error message
    DataCrudFormPageUtil.createPersonAndError(person, `* Person resource with the email: ${person.email} already exists`);

    // Cleanup
    cy.get('button').contains('Cancel').click();
    DataCrudFormPageUtil.deleteRowWithColIdContainingValue(PersonGridColId.FIRST_NAME, person.firstName);
  });

  it('Should allow edit', () => {
    UtilityFunctions.visitSite(`${host}/person`, { headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc }});

    const person: Person = {
      email: `${UtilityFunctions.generateRandomString()}@email.com`,
      firstName: UtilityFunctions.generateRandomString(),
      lastName: 'Last Name',
      branch: 'USAF',
      rank: 'Lt Gen'
    };

    // Add a new Person
    DataCrudFormPageUtil.createPersonAndSuccess(person);
    DataCrudFormPageUtil.filterPersonAndExists(PersonGridColId.FIRST_NAME, person.firstName);
    AgGridFunctions.getRowWithColIdContainingValue(PersonGridColId.FIRST_NAME, person.firstName).click();

    person.email = `${UtilityFunctions.generateRandomString()}@email.com`;
    person.firstName = UtilityFunctions.generateRandomString();

    cy.get('#email').clear().type(person.email).should('have.value', person.email);
    cy.get('#firstName').clear().type(person.firstName).should('have.value', person.firstName);
    cy.get('button').contains('Update').should('not.be.disabled').click();

    UtilityFunctions.findToastContainsMessage('Successfully updated ' + dataTypeName);

    AgGridFunctions.clearFilterColumn(PersonGridColId.FIRST_NAME);

    // clean up
    DataCrudFormPageUtil.deleteRowWithColIdContainingValue(PersonGridColId.FIRST_NAME, person.firstName);
  });
});
