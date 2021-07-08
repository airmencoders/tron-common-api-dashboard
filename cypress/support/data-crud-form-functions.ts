/// <reference types="Cypress" />

import { agGridFilterDebounce, apiBase, personApiBase } from '.';
import UtilityFunctions from './utility-functions';

export default class DataCrudFormFunctions {
  /**
   * Returns the entire row given a column id and value to search for.
   * The row must be visible to successfully find it.
   * @param colId the column id to match
   * @param value the value to find
   * @param searchParentSelector used to narrow the grid search to a specific parent selector
   * @returns a cypress reference to the row
   */
  static getRowWithColIdContainingValue(colId: string, value: string, searchParentSelector?: string) {
    if (searchParentSelector != null) {
      return cy.get(searchParentSelector).find('.ag-row').find(`[col-id="${colId}"]`).contains(value).parents('.ag-row').first();
    } else {
      return cy.get('.ag-row').find(`[col-id="${colId}"]`).contains(value).parents('.ag-row').first();
    }
  }

  /**
   * Ensures that a row, given a column id and a value to search for, does not exist.
   *
   * @param colId the column id to match
   * @param value the value to find
   * @param searchParentSelector used to narrow the grid search to a specific parent selector
   */
  static noRowsExist(searchParentSelector?: string) {
    if (searchParentSelector != null) {
      cy.get(searchParentSelector).find('.ag-row').should('not.exist');
    } else {
      cy.get('.ag-row').should('not.exist');
    }
  }

  /**
   * Finds the delete cell renderer of a given row that matches a column id and value
   * @param colId the column id to match
   * @param value the value to search for
   * @returns a cypress reference to the delete button
   */
  static findDeleteButtonInRowWithColIdContainingValue(colId: string, value: string) {
    return DataCrudFormFunctions.getRowWithColIdContainingValue(colId, value).find('.delete-cell-renderer__btn');
  }

  static submitDataCrudFormCreateAndWaitForLengthToIncrement(dataTypeNameInToast: string) {
    cy.get('.ag-center-cols-container').find('.ag-row').its('length').then(initialLength => {
      DataCrudFormFunctions.submitDataCrudFormCreate();
      UtilityFunctions.findToastContainsMessage(`Successfully created ${dataTypeNameInToast}`);
      cy.get('.ag-center-cols-container').find('.ag-row').should('have.length', initialLength + 1);
    });
  }

  static submitDataCrudFormCreateAndFindErrorContainingMsg(errorMsg: string) {
    cy.get('.ag-center-cols-container').find('.ag-row').its('length').then(initialLength => {
      cy.get('.button-container__submit').click();
      cy.contains(errorMsg);
      cy.get('.ag-center-cols-container').find('.ag-row').should('have.length', initialLength);
    });
  }

  /**
   * Clicks the data crud form submit button for Add
   */
  static submitDataCrudFormCreate() {
    cy.get('.button-container__submit').click();
  }

  /**
   * Clicks the data crud for submit button for Update.
   * The button should not be disabled.
   */
  static submitDataCrudFormUpdate() {
    cy.get('.button-container__submit').contains('Update').should('not.be.disabled').click();
  }

  /**
   * Clicks the data crud for submit button for Update.
   * The button should not be disabled.
   */
  static submitDataCrudFormUpdateAndError(errorMessage: string) {
    cy.get('.button-container__submit').contains('Update').should('not.be.disabled').click();
    cy.contains(errorMessage);
  }

  /**
   * Finds the Delete button in the Delete Confirmation modal
   * @param shouldBeDisabled if the button should be disabled or not
   * @returns a cypress reference to the button
   */
  static findDeleteConfirmationSubmitButton(shouldBeDisabled: boolean = false) {
    return cy.get('button').contains('Delete').should(shouldBeDisabled ? 'be.disabled' : 'not.be.disabled');
  }

  /**
   * This will filter the grid based on the column id and search value.
   * It will then find the delete cell renderer button and click it.
   *
   * if {@link containsDeleteConfirmation} is true, the Delete Confirmation modal
   * will be found and the delete button will be pressed.
   *
   * if {@link verifyRowDeleted} is true, an assert that no rows exists in the grid
   * will be made.
   *
   * if {@link shouldWaitRequest} is true, cypress will be set to wait for the
   * filter request to finish before continuing. This must be set to false for
   * any grid queries that do not perform an api request.
   *
   * The grid will finally have its filter reset.
   *
   * @param colId the column id to search
   * @param value the value to find
   * @param containsDeleteConfirmation if this action requires delete confirmation
   * @param verifyRowDeleted verifies that the row was deleted from grid
   * @param shouldWaitFilterRequest if should wait for filter api request to finish
   */
  static deleteRowWithColIdContainingValue(colId: string, value: string, containsDeleteConfirmation: boolean = true, verifyRowDeleted: boolean = true, shouldWaitFilterRequest?: boolean) {
    DataCrudFormFunctions.filterColumnWithSearchValue(colId, value, shouldWaitFilterRequest);

    DataCrudFormFunctions.findDeleteButtonInRowWithColIdContainingValue(colId, value).click();

    if (containsDeleteConfirmation) {
      cy.get('.modal-title__text').contains('Delete Confirmation');
      DataCrudFormFunctions.findDeleteConfirmationSubmitButton().click();
    }

    if (verifyRowDeleted) {
      /**
       * Force the filter again. Some Grids will hard refresh the grid,
       * causing everything to reset, including the previous filter value.
       */
      DataCrudFormFunctions.filterColumnWithSearchValue(colId, value, shouldWaitFilterRequest, undefined, false);

      /**
       * The grid has been filtered, so there should exist no rows in the
       * grid at this point to verify deletion.
       */
      DataCrudFormFunctions.noRowsExist();
    }


    DataCrudFormFunctions.clearFilterColumn(colId);
  }

  /**
   * Opens the filter menu in the grid given a column id
   * @param colId the column id to open the menu for
   */
  static openColumnFilterMenu(colId: string) {
    // cy.get('.ag-header-cell-text').contains(colId).parents('.ag-header-cell').first().within((nameHeader) => {
    //   cy.get('.ag-icon-menu').click();
    // });
    cy.get(`[col-id="${colId}"]`).within(() => {
      cy.get('.ag-icon-menu').click();
    })
  }

  /**
   * Filters the grid based on the column with the specified value
   * @param colId the column id to filter
   * @param searchValue the value to filter for
   * @param shouldWaitRequest if should wait for the api request to finish. Should not be set to true if the filter will not perform an api request
   * @param searchParentSelector used to narrow the grid search to a specific parent selector
   */
  static filterColumnWithSearchValue(colId: string, searchValue: string, shouldWaitRequest: boolean = true, searchParentSelector?: string, shouldExpectExists: boolean = true) {
    DataCrudFormFunctions.openColumnFilterMenu(colId);

    cy.intercept({
      method: 'POST',
      path: `${apiBase}/*/filter**`
    }).as('filterRequest');

    if (searchParentSelector != null) {
      cy.get(`${searchParentSelector}`).find('.ag-filter-filter input').first().clear().type(`${searchValue}{esc}`);

      if (shouldWaitRequest)
        cy.wait('@filterRequest');

      if (shouldExpectExists) {
        cy.get(`${searchParentSelector}`)
        .find('.ag-center-cols-container')
        .find('.ag-row').should('have.length', 1)
        .first()
        .contains(`[col-id="${colId}"]`, searchValue)
        .should('exist');
      }
    } else {
      cy.get('.ag-filter-filter input').first().clear().type(`${searchValue}{esc}`);

      if (shouldWaitRequest)
        cy.wait('@filterRequest');

      if (shouldExpectExists) {
        cy.get('.ag-center-cols-container')
          .find('.ag-row')
          .should('have.length', 1)
          .first()
          .contains(`[col-id="${colId}"]`, searchValue)
          .should('exist');
      }
    }
  }

  /**
   * Clears out the filter value for a column id
   * @param colId the column id to clear filter
   */
  static clearFilterColumn(colId: string) {
    DataCrudFormFunctions.openColumnFilterMenu(colId);
    cy.get('.ag-filter-filter input').first().clear().type('{esc}');
    // This ensures that we wait for ag grid debounce time to take effect
    cy.wait(agGridFilterDebounce);
  }

  static createPerson(person: Person) {
    const { email, firstName, lastName, branch, rank } = person;

    cy.get('.add-data-container > [data-testid=button]').click();

    cy.get('#email').type(email).should('have.value', email);
    cy.get('#firstName').type(firstName).should('have.value', firstName);
    cy.get('#lastName').type(lastName).should('have.value', lastName);
    cy.get('#branch').select(branch).should('have.value', branch);
    cy.get('#rank').should('exist').select(rank).should('have.value', rank);
  }

  static createPersonAndSuccess(person: Person) {
    DataCrudFormFunctions.createPerson(person);

    // Submit the form
    DataCrudFormFunctions.submitDataCrudFormCreate();
  }

  static createPersonAndError(person: Person, errorMsg: string) {
    DataCrudFormFunctions.createPerson(person);

    // Submit the form
    DataCrudFormFunctions.submitDataCrudFormCreateAndFindErrorContainingMsg(errorMsg);
  }

  static filterPersonAndExists(gridColId: PersonGridColId, searchValue: string) {
    // Filter
    DataCrudFormFunctions.filterColumnWithSearchValue(gridColId, searchValue);
    DataCrudFormFunctions.getRowWithColIdContainingValue(gridColId, searchValue).should('exist');
  }

  static createPersonAndFilterExists(person: Person) {
    cy.intercept({ method: 'POST', path: `${personApiBase}` }).as('personCreate');
    DataCrudFormFunctions.createPersonAndSuccess(person);

    return cy.wait('@personCreate').then((intercept) => {
      DataCrudFormFunctions.filterPersonAndExists(PersonGridColId.ID, intercept.response.body.id);
      DataCrudFormFunctions.clearFilterColumn(PersonGridColId.ID);
    });
  }

  static createAppClient(appClient: AppClient) {
    const {
      name,
    } = appClient;

    cy.get('.add-data-container > [data-testid=button]').click();

    cy.get('#name').clear().type(name).should('have.value', name);
  }

  static createAppClientAndSuccess(appClient: AppClient) {
    DataCrudFormFunctions.createAppClient(appClient);

    DataCrudFormFunctions.submitDataCrudFormCreate();
  }

  static createAppClientAndError(appClient: AppClient, errorMsg: string) {
    DataCrudFormFunctions.createAppClient(appClient);

    // Submit the form
    DataCrudFormFunctions.submitDataCrudFormCreateAndFindErrorContainingMsg(errorMsg);
  }
}

export enum PersonGridColId {
  ID = 'id',
  FIRST_NAME = 'firstName',
  LAST_NAME = 'lastName'
}

export enum OrganizationGridColId {
  ID = 'id',
  NAME = 'name'
}

export enum AppClientGridColId {
  NAME = 'name',
  PERSON_CREATE = 'personCreate',
  PERSON_DELETE = 'personDelete',
  PERSON_EDIT = 'personEdit',
  PERSON_READ = 'personRead',
  ORG_CREATE = 'orgCreate',
  ORG_DELETE = 'orgDelete',
  ORG_EDIT = 'orgEdit',
  ORG_READ = 'orgRead',
}

export enum AppSourceGridColId {
  NAME = 'name'
}

export enum AppSourceEndpointGridColId {
  PATH = 'path'
}

export enum AppSourceEmailGridColId {
  ADMIN = 'email'
}

export enum ScratchStorageGridColId {
  ID = 'id',
  APP_NAME = 'appName',
  IMPLICIT_READ = 'appHasImplicitRead',
  ACL_MODE = 'aclMode'
}

export enum DigitizeAppsGridColId {
  APP_NAME = 'appName',
  READ = 'scratchRead',
  WRITE = 'scratchWrite',
  ADMIN = 'scratchAdmin'
}

export enum DashboardUserGridColId {
  ID = 'id',
  EMAIL = 'email',
  HAS_ADMIN = 'hasDashboardAdmin',
  HAS_USER = 'hasDashboardUser'
}

export enum SubscriberGridColId {
  ID = 'id',
  APP_CLIENT_NAME = 'appClientUser',
  SUBSCRIBER_URL = 'subscriberAddress',
  SUBSCRIBED_EVENT = 'subscribedEvent'
}

export interface Person {
  email: string;
  firstName: string;
  lastName: string;
  branch: string;
  rank: string;
}

export interface Organization {
  name: string;
  branch: string;
  type: string;
}

export interface AppClient {
  name: string;
  personCreate?: boolean;
  personEdit?: boolean;
  personDelete?: boolean;
  personRead?: boolean;
  orgCreate?: boolean;
  orgEdit?: boolean;
  orgDelete?: boolean;
  orgRead?: boolean;
}

export interface ScratchStorageApp {
  name: string;
  implicitRead?: boolean;
  aclMode?: boolean;
}

export interface ScratchStorageUser {
  email: string;
  read?: boolean;
  write?: boolean;
  admin?: boolean;
}

export interface DashboardUser {
  email: string;
  admin?: boolean;
  user?: boolean;
}

export interface Subscriber {
  appClientName: string;
  subscriberAddress: string;
  event: SubscribeEvent;
  secret: string;
}

export enum SubscribeEvent {
  PERSON_CHANGE = 'PERSON_CHANGE',
  PERSON_DELETE = 'PERSON_DELETE',
  PERSON_ORG_ADD = 'PERSON_ORG_ADD',
  PERSON_ORG_REMOVE = 'PERSON_ORG_REMOVE',
  ORGANIZATION_CHANGE = 'ORGANIZATION_CHANGE',
  ORGANIZATION_DELETE = 'ORGANIZATION_DELETE',
  SUB_ORG_ADD = 'SUB_ORG_ADD',
  SUB_ORG_REMOVE = 'SUB_ORG_REMOVE'
}