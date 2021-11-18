/// <reference types="Cypress" />

import { personApiBase } from '.';
import AgGridFunctions, { PersonGridColId } from './ag-grid-functions';
import UtilityFunctions from './utility-functions';

export default class DataCrudFormFunctions {
  /**
   * Finds the delete cell renderer of a given row that matches a column id and value
   * @param colId the column id to match
   * @param value the value to search for
   * @returns a cypress reference to the delete button
   */
  static findDeleteButtonInRowWithColIdContainingValue(colId: string, value: string) {
    return AgGridFunctions.getRowWithColIdContainingValue(colId, value).find('.delete-cell-renderer__btn');
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
    AgGridFunctions.filterColumnWithSearchValue(colId, value, shouldWaitFilterRequest);

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
      AgGridFunctions.filterColumnWithSearchValue(colId, value, shouldWaitFilterRequest, undefined, false);

      /**
       * The grid has been filtered, so there should exist no rows in the
       * grid at this point to verify deletion.
       */
      AgGridFunctions.noRowsExist();
    }


    AgGridFunctions.clearFilterColumn(colId);
  }

  static createPerson(person: Person) {
    const {
      email,
      firstName,
      middleName,
      lastName,
      branch,
      rank,
      title,
      dodid,
      phone,
      address,
      dutyPhone
    } = person;

    cy.get('.add-data-container > [data-testid=button]').click();

    cy.get('#email').type(email).should('have.value', email);
    cy.get('#firstName').type(firstName).should('have.value', firstName);
    if (middleName != null) {
      cy.get('#middleName').type(middleName).should('have.value', middleName);
    }
    cy.get('#lastName').type(lastName).should('have.value', lastName);
    if (title != null) {
      cy.get('#title').type(title).should('have.value', title);
    }
    if (dodid != null) {
      cy.get('#dodid').type(dodid).should('have.value', dodid);
    }
    if (phone != null) {
      cy.get('#phone').type(phone).should('have.value', phone);
    }
    if (address != null) {
      cy.get('#address').type(address).should('have.value', address);
    }
    if (dutyPhone != null) {
      cy.get('#dutyPhone').type(dutyPhone).should('have.value', dutyPhone);

    }
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
    AgGridFunctions.filterColumnWithSearchValue(gridColId, searchValue);
    AgGridFunctions.getRowWithColIdContainingValue(gridColId, searchValue).should('exist');
  }

  static createPersonAndFilterExists(person: Person) {
    cy.intercept({ method: 'POST', path: `${personApiBase}` }).as('personCreate');
    DataCrudFormFunctions.createPersonAndSuccess(person);

    return cy.wait('@personCreate').then((intercept) => {
      DataCrudFormFunctions.filterPersonAndExists(PersonGridColId.ID, intercept?.response?.body.id);
      AgGridFunctions.clearFilterColumn(PersonGridColId.ID);
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

export interface Person {
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  branch: string;
  rank: string;
  title?: string;
  dodid?: string;
  phone?: string;
  address?: string;
  dutyPhone?: string;
  dutyTitle?: string;
  primaryOrganization?: string; // uuid
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
