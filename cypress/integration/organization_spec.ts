/// <reference types="Cypress" />

import { host, orgApiBase } from '../support';
import DataCrudFormPageUtil, { Organization, OrganizationGridColId, PersonGridColId } from '../support/data-crud-form-functions';
import UtilityFunctions from '../support/utility-functions';

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
  DataCrudFormPageUtil.filterColumnWithSearchValue(OrganizationGridColId.NAME, searchValue);
  DataCrudFormPageUtil.getRowWithColIdContainingValue(OrganizationGridColId.NAME, searchValue).should('exist');
}

function createOrganizationAndFilterExists(org: Organization) {
  cy.intercept({ method: 'POST', path: `${orgApiBase}` }).as('orgCreate');
  createOrganizationAndSuccess(org);

  cy.wait('@orgCreate').then((intercept) => {
    filterOrgByNameAndExists(intercept.response.body.name);
    DataCrudFormPageUtil.clearFilterColumn(OrganizationGridColId.NAME);
  });
}

describe('Organization Tests', () => {
  const dataTypeName = 'Organization';

  it('Should allow Organization creation & deletion', () => {
    cy.visit(host);

    cy.get('[href="/organization"] > .sidebar-item__name').click();

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
    cy.visit(`${host}/organization`);

    const orgToCreate = {
      name: UtilityFunctions.generateRandomString(),
      branch: 'USAF',
      type: 'WING'
    };

    // Add a new Organization
    createOrganizationAndFilterExists(orgToCreate);

    // Try to add existing and expect an error message
    createOrgAndExpectError(orgToCreate, 'Request failed with status code 409');

    // Cleanup the organization
    cy.get('button').contains('Cancel').click();
    DataCrudFormPageUtil.deleteRowWithColIdContainingValue(OrganizationGridColId.NAME, orgToCreate.name);
  });

  it('Should allow to edit organization', () => {
    cy.visit(host);

    // Go to person page first and create a person
    cy.get('[href="/person"] > .sidebar-item__name').click();
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
    cy.get('[href="/organization"] > .sidebar-item__name').click();

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
    DataCrudFormPageUtil.getRowWithColIdContainingValue(OrganizationGridColId.NAME, orgToEdit.name).click();

    cy.wait('@getDetails').then(intercept => {

    });

    cy.get('#orgName').should('have.value', orgToEdit.name);

    // Change org leader
    cy.get('[data-testid=change-org-leader__btn]').click();
    cy.get('.modal-title__text').should('have.text', 'Choose Entry').parents('.modal-component__container').first().within(modalContainer => {
      DataCrudFormPageUtil.filterColumnWithSearchValue(PersonGridColId.FIRST_NAME, personLeader.firstName);
      DataCrudFormPageUtil.getRowWithColIdContainingValue(PersonGridColId.FIRST_NAME, personLeader.firstName).find(`input[type='checkbox']`).click();
      cy.get('button').contains('Done').should('not.be.disabled').click();
    });

    // Change Parent org
    cy.get('[data-testid=change-org-parent__btn]').click();
    cy.get('.modal-title__text').should('have.text', 'Choose Entry').parents('.modal-component__container').first().within(modalContainer => {
      DataCrudFormPageUtil.filterColumnWithSearchValue(OrganizationGridColId.NAME, parentOrg.name);
      DataCrudFormPageUtil.getRowWithColIdContainingValue(OrganizationGridColId.NAME, parentOrg.name).find(`input[type='checkbox']`).click();
      cy.get('button').contains('Done').should('not.be.disabled').click();
    });

    // Add Org member
    cy.get('[data-testid=org-add-member__btn]').click();
    cy.get('.modal-title__text').should('have.text', 'Choose Entry').parents('.modal-component__container').first().within(modalContainer => {
      DataCrudFormPageUtil.filterColumnWithSearchValue(PersonGridColId.FIRST_NAME, personMember.firstName);
      DataCrudFormPageUtil.getRowWithColIdContainingValue(PersonGridColId.FIRST_NAME, personMember.firstName).find(`input[type='checkbox']`).click();
      cy.get('button').contains('Done').should('not.be.disabled').click();
    });

    // Add Sub org
    cy.get('[data-testid=org-add-suborg__btn]').click();
    cy.get('.modal-title__text').should('have.text', 'Choose Entry').parents('.modal-component__container').first().within(modalContainer => {
      DataCrudFormPageUtil.filterColumnWithSearchValue(OrganizationGridColId.NAME, subordinateOrg.name);
      DataCrudFormPageUtil.getRowWithColIdContainingValue(OrganizationGridColId.NAME, subordinateOrg.name).find(`input[type='checkbox']`).click();
      cy.get('button').contains('Done').should('not.be.disabled').click();
    });

    cy.get('#leaderName').should('have.value', `${personLeader.firstName} ${personLeader.lastName}`);
    cy.get('#parentOrg').should('have.value', parentOrg.name);
    cy.get('button').contains('Update').should('not.be.disabled').click();
    UtilityFunctions.findToastContainsMessage('Successfully updated ' + dataTypeName);

    // Delete the Organization
    DataCrudFormPageUtil.deleteRowWithColIdContainingValue(OrganizationGridColId.NAME, orgToEdit.name);
    DataCrudFormPageUtil.deleteRowWithColIdContainingValue(OrganizationGridColId.NAME, parentOrg.name);
    DataCrudFormPageUtil.deleteRowWithColIdContainingValue(OrganizationGridColId.NAME, subordinateOrg.name);

    cy.get('[href="/person"] > .sidebar-item__name').click();
    DataCrudFormPageUtil.deleteRowWithColIdContainingValue(PersonGridColId.FIRST_NAME, personLeader.firstName);
    DataCrudFormPageUtil.deleteRowWithColIdContainingValue(PersonGridColId.FIRST_NAME, personMember.firstName);
  });
});