/// <reference types="Cypress" />

import { host, orgApiBase , adminJwt, ssoXfcc } from "../support";
import AgGridFunctions, { OrganizationGridColId, PersonGridColId } from '../support/ag-grid-functions';
import DataCrudFormPageUtil, { Organization } from '../support/data-crud-form-functions';
import UtilityFunctions, { Page } from '../support/utility-functions';

function createOrganization(org: Organization) {
  const { name, branch, type } = org;

  // Opens the sidedrawer for Add form
  cy.get('.add-data-container > [data-testid=button]').click();

  cy.get('#orgName').type(name).should('have.value', name);
  cy.get('#branch').select(branch).should('have.value', branch);
  cy.get('#type').select(type).should('have.value', type);
}

function createOrganizationAndSuccess(org: Organization) {
  createOrganization(org);

  // Submit the form
  DataCrudFormPageUtil.submitDataCrudFormCreate();
}

function createOrgAndExpectError(org: Organization, error: string) {
  createOrganization(org);

  // Submit the form
  DataCrudFormPageUtil.submitDataCrudFormCreateAndFindErrorContainingMsg(error);
}

function filterOrgByNameAndExists(searchValue: string) {
  AgGridFunctions.filterColumnWithSearchValue(OrganizationGridColId.NAME, searchValue);
  AgGridFunctions.getRowWithColIdContainingValue(OrganizationGridColId.NAME, searchValue).should('exist');
}

function createOrganizationAndFilterExists(org: Organization) {
  cy.intercept({ method: 'POST', path: `${orgApiBase}` }).as('orgCreate');
  createOrganizationAndSuccess(org);

  cy.wait('@orgCreate').then((intercept) => {
    filterOrgByNameAndExists(intercept.response.body.name);
    AgGridFunctions.clearFilterColumn(OrganizationGridColId.NAME);
  });
}

describe('Organization Tests', () => {
  const dataTypeName = 'Organization';

  it('Should allow Organization creation & deletion', () => {
    UtilityFunctions.visitSite(host, { headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc }});

    UtilityFunctions.clickOnPageNav(Page.ORGANIZATION);

    const org: Organization = {
      name: UtilityFunctions.generateRandomString(),
      branch: 'USAF',
      type: 'WING'
    };

    createOrganizationAndFilterExists(org);

    // Delete it
    DataCrudFormPageUtil.deleteRowWithColIdContainingValue(OrganizationGridColId.NAME, org.name);
  });

  it('Should error when trying to add Organization with same name', () => {
    UtilityFunctions.visitSite(`${host}/organization`, { headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc }});

    const orgToCreate = {
      name: UtilityFunctions.generateRandomString(),
      branch: 'USAF',
      type: 'WING'
    };

    // Add a new Organization
    createOrganizationAndFilterExists(orgToCreate);

    // Try to add existing and expect an error message
    createOrgAndExpectError(orgToCreate, `* Resource with the Name: ${orgToCreate.name} already exists`);

    // Cleanup the organization
    cy.get('button').contains('Cancel').click();
    DataCrudFormPageUtil.deleteRowWithColIdContainingValue(OrganizationGridColId.NAME, orgToCreate.name);
  });

  it('Should allow to edit organization', () => {
    UtilityFunctions.visitSite(host, { headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc }});

    // Go to person page first and create a person
    UtilityFunctions.clickOnPageNav(Page.PERSON);
    const personLeader = {
      email: `${UtilityFunctions.generateRandomString()}@email.com`,
      firstName: UtilityFunctions.generateRandomString(),
      lastName: 'Test Person LN',
      branch: 'USAF',
      rank: 'Lt Gen'
    };

    const personMember = {
      email: `${UtilityFunctions.generateRandomString()}@email.com`,
      firstName: UtilityFunctions.generateRandomString(),
      lastName: 'Test Person LN',
      branch: 'USAF',
      rank: 'Lt Gen'
    };

    DataCrudFormPageUtil.createPersonAndFilterExists(personLeader);
    DataCrudFormPageUtil.createPersonAndFilterExists(personMember);

    // Go to Organization page, create new org, and edit it
    UtilityFunctions.clickOnPageNav(Page.ORGANIZATION);

    const parentOrg = {
      name: UtilityFunctions.generateRandomString(),
      branch: 'USAF',
      type: 'WING'
    };

    const orgToEdit = {
      name: UtilityFunctions.generateRandomString(),
      branch: 'USAF',
      type: 'WING'
    };

    const subordinateOrg = {
      name: UtilityFunctions.generateRandomString(),
      branch: 'USAF',
      type: 'WING'
    };

    // Add a new Organization
    createOrganizationAndFilterExists(parentOrg);
    createOrganizationAndFilterExists(orgToEdit);
    createOrganizationAndFilterExists(subordinateOrg);

    // Try to edit the organization
    filterOrgByNameAndExists(orgToEdit.name);
    cy.intercept({ method: 'GET', path: `${orgApiBase}/*` }).as('getDetails');
    AgGridFunctions.getRowWithColIdContainingValue(OrganizationGridColId.NAME, orgToEdit.name).click();

    cy.wait('@getDetails');

    cy.get('#orgName').should('have.value', orgToEdit.name);

    // Change org leader
    cy.get('[data-testid=change-org-leader__btn]').click();
    cy.get('.modal-title__text').should('have.text', 'Leader').parents('.modal-component__container').first().within(modalContainer => {
      AgGridFunctions.filterColumnWithSearchValue(PersonGridColId.FIRST_NAME, personLeader.firstName);
      AgGridFunctions.getRowWithColIdContainingValue(PersonGridColId.FIRST_NAME, personLeader.firstName).find(`input[type='checkbox']`).click();
      cy.get('button').contains('Select').should('not.be.disabled').click();
    });

    // Change Parent org
    cy.get('[data-testid=change-org-parent__btn]').click();
    cy.get('.modal-title__text').should('have.text', 'Parent Organization').parents('.modal-component__container').first().within(modalContainer => {
      AgGridFunctions.filterColumnWithSearchValue(OrganizationGridColId.NAME, parentOrg.name);
      AgGridFunctions.getRowWithColIdContainingValue(OrganizationGridColId.NAME, parentOrg.name).find(`input[type='checkbox']`).click();
      cy.get('button').contains('Select').should('not.be.disabled').click();
    });

    // Add Org member
    cy.get('[data-testid=org-add-member__btn]').click();
    cy.get('.modal-title__text').should('have.text', 'Members').parents('.modal-component__container').first().within(modalContainer => {
      AgGridFunctions.filterColumnWithSearchValue(PersonGridColId.FIRST_NAME, personMember.firstName);
      AgGridFunctions.getRowWithColIdContainingValue(PersonGridColId.FIRST_NAME, personMember.firstName).find(`input[type='checkbox']`).click();
      cy.get('button').contains('Select').should('not.be.disabled').click();
    });

    // Add Sub org
    cy.get('[data-testid=org-add-suborg__btn]').click();
    cy.get('.modal-title__text').should('have.text', 'Subordinate Organizations').parents('.modal-component__container').first().within(modalContainer => {
      AgGridFunctions.filterColumnWithSearchValue(OrganizationGridColId.NAME, subordinateOrg.name);
      AgGridFunctions.getRowWithColIdContainingValue(OrganizationGridColId.NAME, subordinateOrg.name).find(`input[type='checkbox']`).click();
      cy.get('button').contains('Select').should('not.be.disabled').click();
    });

    cy.get('#leaderName').should('have.value', `${personLeader.firstName} ${personLeader.lastName}`);
    cy.get('#parentOrg').should('have.value', parentOrg.name);
    cy.get('button').contains('Update').should('not.be.disabled').click();
    UtilityFunctions.findToastContainsMessage('Successfully updated ' + dataTypeName);

    // Delete the Organization
    DataCrudFormPageUtil.deleteRowWithColIdContainingValue(OrganizationGridColId.NAME, orgToEdit.name);
    DataCrudFormPageUtil.deleteRowWithColIdContainingValue(OrganizationGridColId.NAME, parentOrg.name);
    DataCrudFormPageUtil.deleteRowWithColIdContainingValue(OrganizationGridColId.NAME, subordinateOrg.name);

    UtilityFunctions.clickOnPageNav(Page.PERSON);
    DataCrudFormPageUtil.deleteRowWithColIdContainingValue(PersonGridColId.FIRST_NAME, personLeader.firstName);
    DataCrudFormPageUtil.deleteRowWithColIdContainingValue(PersonGridColId.FIRST_NAME, personMember.firstName);
  });
});
