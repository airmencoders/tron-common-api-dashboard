import { agGridFilterDebounce, apiBase } from '.';

export default class AgGridFunctions {
  /**
   * Returns the entire row given a column id and value to search for.
   * The row must be visible to successfully find it.
   * @param colId the column id to match
   * @param value the value to find
   * @param searchParentSelector used to narrow the grid search to a specific parent selector
   * @returns a cypress reference to the row
   */
  static getRowWithColIdContainingValue(colId: string, value: string, searchParentSelector?: string) {
    return AgGridFunctions.getElementInRowWithColIdContainingValue(colId, value, searchParentSelector).parents('.ag-row').first();
  }

  static getElementInRowWithColIdContainingValue(colId: string, value: string, searchParentSelector?: string) {
    if (searchParentSelector != null) {
      return cy.contains(`${searchParentSelector} .ag-row [col-id="${colId}"]`, value, { matchCase: false });
    } else {
      return cy.contains(`.ag-row [col-id="${colId}"]`, value, { matchCase: false });
    }
  }

  /**
   * Gets the checkbox for a row in Ag Grid
   * 
   * @param colId the column id to find on
   * @param value the actual value to find
   * @param searchParentSelector used to narrow the grid search to a specific parent selector
   * @returns cypress reference to the checkbox of the row
   */
  static getCheckboxInRowWithColIdContainingValue(colId: string, value: string, searchParentSelector?: string) {
    return AgGridFunctions.getRowWithColIdContainingValue(colId, value, searchParentSelector)
      .find('[type="checkbox"]').should('have.length', 1);
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
   * Opens the filter menu in the grid given a column id
   * @param colId the column id to open the menu for
   */
  static openColumnFilterMenu(colId: string) {
    // cy.get('.ag-header-cell-text').contains(colId).parents('.ag-header-cell').first().within((nameHeader) => {
    //   cy.get('.ag-icon-menu').click();
    // });
    cy.get(`[col-id="${colId}"]`).within(() => {
      cy.get('.ag-icon-menu').first().click();
    });
  }

  /**
   * Filters the grid based on the column with the specified value
   * @param colId the column id to filter
   * @param searchValue the value to filter for
   * @param shouldWaitRequest if should wait for the api request to finish. Should not be set to true if the filter will not perform an api request
   * @param searchParentSelector used to narrow the grid search to a specific parent selector
   */
  static filterColumnWithSearchValue(colId: string, searchValue: string, shouldWaitRequest: boolean = true, searchParentSelector?: string, shouldExpectExists: boolean = true) {
    AgGridFunctions.openColumnFilterMenu(colId);

    cy.intercept({
      method: 'POST',
      path: `${apiBase}/*/filter**`
    }).as('filterRequest');

    if (searchParentSelector != null) {
      cy.get(`${searchParentSelector}`).find('.ag-filter-filter input').first().clear().type(`${searchValue}{esc}`);

      if (shouldWaitRequest)
        cy.wait('@filterRequest');

      cy.wait(agGridFilterDebounce);

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

      cy.wait(agGridFilterDebounce);

      if (shouldExpectExists) {
        cy.get('.ag-center-cols-container')
          .find('.ag-row')
          .should('have.length', 1)
          .first()
          .contains(`[col-id="${colId}"]`, searchValue, { matchCase: false })
          .should('exist');
      }
    }
  }

  /**
   * Clears out the filter value for a column id
   * @param colId the column id to clear filter
   */
  static clearFilterColumn(colId: string) {
    AgGridFunctions.openColumnFilterMenu(colId);
    cy.get('.ag-filter-filter input').first().clear().type('{esc}');
    // This ensures that we wait for ag grid debounce time to take effect
    cy.wait(agGridFilterDebounce);
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

export enum SpacesGridColId {
  NAME = 'key',
  LAST_MODIFIED = 'lastModifiedDate',
  LAST_MODIFIED_BY = 'lastModifiedBy',
  SIZE = 'size'
}

export enum SpacesManageMembersColId {
  EMAIL = 'email'
}