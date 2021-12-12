import { adminJwt, documentSpaceApiBase, documentSpaceDashboardUrl, documentSpaceUrl, ssoXfcc } from '.';
import { DocumentSpaceResponseDto, DocumentSpaceResponseDtoResponseWrapper } from '../../src/openapi';
import AgGridFunctions, { SpacesGridColId } from './ag-grid-functions';
import UtilityFunctions from './utility-functions';
import { shortenString } from '../../src/utils/string-utils';

export enum OverwriteAction {
  YES = '[data-testid=upload-overwrite-yes__btn]',
  YES_TO_ALL = '[data-testid=upload-overwrite-all__btn]',
  NO = '[data-testid=upload-overwrite-no__btn]',
  NO_TO_ALL = '[data-testid=upload-overwrite-none__btn]'
}

export default class DocumentSpaceFunctions {
  /**
   * Creates or returns the existing Cypress document space configured UUID
   * @returns the UUID of the Cypress document space
   */
  static createOrReturnExistingDocumentSpace() {
    return cy.request<DocumentSpaceResponseDtoResponseWrapper>({
      url: `${documentSpaceUrl}/spaces`,
      method: 'GET',
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc }
    }).then(response => {
      expect(response.status).to.eq(200);

      const cypressSpace = response.body.data.find(documentSpace => documentSpace.name === 'cypress-e2e');

      if (cypressSpace == null) {
        return cy.request<DocumentSpaceResponseDto>({
          url: `${documentSpaceUrl}/spaces`,
          method: 'POST',
          headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
          body: {
            name: 'cypress-e2e'
          }
        }).then(response => {
          expect(response.status).to.eq(201);

          return cy.wrap(response.body.id);
        });
      }

      return cy.wrap(cypressSpace.id);
    });
  }

  static getDownloadButtonIconByRowOnNameCol(name: string) {
    return AgGridFunctions.getRowWithColIdContainingValue(SpacesGridColId.NAME, name).find('.download-icon').should('have.length', 1);
  }

  /**
   * Deletes file(s) from a document space. Does not go through the UI. Will
   * do the request directly to the API.
   * 
   * @param spaceId the space to delete from 
   * @param filename a single file as string or an array of filename strings
   * @param path the path to delete from
   * @returns 
   */
  static deleteFile(spaceId: string, filename: string | Array<string>, path: string) {
    const filenames = (typeof filename === 'string') ? [filename] : filename;
    return cy.request({
      url: `${documentSpaceUrl}/spaces/${spaceId}/delete`,
      method: 'DELETE',
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
      body: {
        currentPath: path,
        items: filenames
      }
    }).then(response => {
      expect(response.status).to.eq(204);
      return response;
    });
  }

  static deleteSpace(spaceId: string) {
    return cy.request({
      url: `${documentSpaceUrl}/spaces/${spaceId}`,
      method: 'DELETE',
      headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc },
    }).then(response => {
      expect(response.status).to.eq(204);
      return response;
    });
  }

  /**
   * Creates a folder through the UI at the current location. This will perform checks to ensure
   * a successful folder creation.
   *
   * @param spaceId the document space this is to be created under, used to intercept requests
   * @param folderName override name of the folder, will use a random string with
   * pattern cypress_folder__xxxxxxxxxx (x = random character) if none provided
   * @returns the the name of the folder created wrapped in cypress
   */
  static createFolderAtCurrentLocation(spaceId: string, folderName?: string) {
    let folderNameToUse = `cypress_folder__${UtilityFunctions.randomStringOfLength(10)}`;
    if (folderName != null && folderName.trim().length > 0) {
      folderNameToUse = folderName;
    }

    cy.get('.dropdown .add-material-icon').click({ force: true });

    return cy.contains('button', 'Add New Folder').click({ force: true })
      .then(() => {
        cy.intercept('POST', `${documentSpaceApiBase}/spaces/${spaceId}/folders`).as('folderCreateRequest');
        cy.intercept('GET', `${documentSpaceApiBase}/spaces/${spaceId}/content*`).as('getFilesRequest');

        cy.get('[data-testid=element-name-field]').type(folderNameToUse);
        cy.get('.form-group > .submit-actions > .button-container__submit').should('not.be.disabled').click({ force: true });

        // Look for successful folder creation signs
        cy.wait('@folderCreateRequest')
          .then(interception => {
            assert.isTrue(interception.response.statusCode === 201, 'Folder creation failed');
          });
        UtilityFunctions.findToastContainsMessage('Folder created');

        // Make sure Ag Grid refetches data on folder creation
        cy.wait('@getFilesRequest')
          .then(interception => {
            assert.exists(interception.response.body);
          });

        return cy.wrap(folderNameToUse);
      });
  }

  /**
   * Creates a folder through the UI at the current location. This will perform an unsafe
   * folder creation. Will not check for signs of success.
   * 
   * @param spaceId the document space this is to be created under, used to intercept requests
   * @param folderName override name of the folder, will use a random string with 
   * pattern cypress_folder__xxxxxxxxxx (x = random character) if none provided
   * @returns the the name of the folder created wrapped in cypress
   */
  static createFolderAtCurrentLocationUnsafe(folderName?: string) {
    let folderNameToUse = `cypress_folder__${UtilityFunctions.randomStringOfLength(10)}`;
    if (folderName != null && folderName.trim().length > 0) {
      folderNameToUse = folderName;
    }

    cy.get('.dropdown .add-material-icon').click({ force: true });

    return cy.contains('button', 'Add New Folder').click({ force: true })
      .then(() => {
        cy.get('[data-testid=element-name-field]').type(folderNameToUse);
        cy.get('.form-group > .submit-actions > .button-container__submit').should('not.be.disabled').click({ force: true });

        return cy.wrap(folderNameToUse);
      });
  }

  /**
   * Uploads the test file to the current location through the UI. Will perform checks
   * to ensure a successful file upload.
   *
   * @param spaceId the document space to upload to
   * @param overrideName the name of the file to use. Defaults to use pattern cypress_file__xxxxxxxxxx.txt, where x are random characters
   * @returns string wrapped by cypress
   */
  static uploadTestFileAtCurrentLocation(spaceId: string, overrideName?: string) {
    let filename = `cypress_file__${UtilityFunctions.randomStringOfLength(10)}.txt`;

    if (overrideName != null && overrideName.trim().length > 0) {
      filename = overrideName;
    }

    cy.intercept('POST', `${documentSpaceApiBase}/spaces/${spaceId}/files/upload*`).as('uploadRequest');
    cy.intercept('GET', `${documentSpaceApiBase}/spaces/${spaceId}/content*`).as('getFilesRequest');

    cy.get('[data-testid=upload-file__btn]').click({ force: true })
      .then(() => {
        cy.get('input[type=file]').attachFile({
          filePath: 'test-upload.txt',
          fileName: filename
        });
      });

    // Look for successful file upload signs
    cy.wait('@uploadRequest')
      .then(interception => {
        assert.isTrue(interception.response.statusCode === 200, 'Upload Request failed: response code = ' + interception.response.statusCode);
      });

    UtilityFunctions.findToastContainsMessage('Upload Process complete');

    // Make sure Ag Grid refetches data on upload
    cy.wait('@getFilesRequest')
      .then(interception => {
        assert.exists(interception.response.body);
      });

    return cy.wrap<string>(filename);
  }

  /**
   * Uploads the test file to the current location through the UI. Will not perform
   * any checks for successful upload.
   * 
   * @param spaceId the document space to upload to
   * @param overrideName the name of the file to use. Defaults to use pattern cypress_file__xxxxxxxxxx.txt, where x are random characters
   * @returns string wrapped by cypress
   */
  static uploadTestFileAtCurrentLocationUnsafe(overrideName?: string) {
    let filename = `cypress_file__${UtilityFunctions.randomStringOfLength(10)}.txt`;

    if (overrideName != null && overrideName.trim().length > 0) {
      filename = overrideName;
    }

    cy.get('[data-testid=upload-file__btn]').click({ force: true })
      .then(() => {
        cy.get('input[type=file]').attachFile({
          filePath: 'test-upload.txt',
          fileName: filename
        });
      });

    return cy.wrap<string>(filename);
  }

  static visitDocumentSpace(documentSpaceId: string) {
    return UtilityFunctions.visitSite(`${documentSpaceDashboardUrl}/spaces?spaceId=${documentSpaceId}`, { headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc } });
  }

  static visitArchivedFilesPage() {
    cy.intercept('GET', `${documentSpaceApiBase}/spaces/archived`).as('getArchivedRequest');
    const visitSite = UtilityFunctions.visitSite(`${documentSpaceDashboardUrl}/archived`, { headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc } });

    cy.wait('@getArchivedRequest');

    return visitSite;
  }

  static visitFavoritePage(spaceId?: string) {
    const visitSite = UtilityFunctions.visitSite(`${documentSpaceDashboardUrl}/favorites`, { headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc } });

    if (spaceId != null) {
      return this.selectDocumentSpaceOption(spaceId);
    }

    return visitSite;
  }

  static visitRecentsPage() {
    cy.intercept('GET', `${documentSpaceApiBase}/spaces/files/recently-uploaded*`).as('getRecentsRequest');
    const visitSite = UtilityFunctions.visitSite(`${documentSpaceDashboardUrl}/recents`, { headers: { "authorization": adminJwt, "x-forwarded-client-cert": ssoXfcc } });

    cy.wait('@getRecentsRequest');

    return visitSite;
  }

  static getMoreActionsColumnByRowOnNameCol(name: string) {
    return AgGridFunctions.getRowWithColIdContainingValue(SpacesGridColId.NAME, name).find('[data-testid=document-row-action-cell-renderer] > [data-testid=more_action]').should('have.length', 1);
  }

  static selectDocumentSpaceOption(spaceId: string) {
    return cy.get('[data-testid=document-space-selector]').find('option:selected').invoke('val')
      .then(selected => {
        if (selected !== spaceId) {
          return cy.get('[data-testid=document-space-selector]').select(spaceId);
        }
      });
  }

  static fillRenameElementForm(newName: string) {
    if (newName === '') {
      return cy.get('[data-testid=element-name-field]').clear();
    }

    return cy.get('[data-testid=element-name-field]').clear().type(newName);
  }

  static fillRenameElementFormAndSubmit(newName: string) {
    this.fillRenameElementForm(newName);

    return cy.get('button').contains('Update').click({ force: true });
  }

  /**
   * Gets the "more actions" remove for a row based on the Name of the folder/file
   * @param name the name of the file/folder to click "Remove" of more actions
   * @returns 
   */
  static clickMoreActionsButton(name: string, action: MoreActionsType) {
    this.getMoreActionsColumnByRowOnNameCol(name).click({ force: true });
    return cy.get('.document-space-popup-actions span').contains(action).should('have.length', 1).click({ force: true });
  }

  /**
   * Clicks the "Archive" modal for file/folder deletion/delete archive.
   * @param isConfirmed press the confirm (Delete) button if true, otherwise presses cancel
   * @param waitForRequest if true, will wait for a DELETE request to be made
   * @param waitForDataRequest if true, will wait for a GET request to be made (specifically for the refetch of data)
   * @returns
   */
  static clickArchiveConfirmationAction(isConfirmed: boolean = true) {
    if (isConfirmed) {
      return UtilityFunctions.getModalContainer('Archive').find('[data-testid=modal-submit-btn]').click({ force: true });
    } else {
      return UtilityFunctions.getModalContainer('Archive').find('[data-testid=modal-cancel-btn]').click({ force: true });
    }
  }

  /**
   * Clicks the "Archive" modal for file/folder deletion/delete archive.
   * @param isConfirmed press the confirm (Delete) button if true, otherwise presses cancel
   * @param waitForRequest if true, will wait for a DELETE request to be made
   * @param waitForDataRequest if true, will wait for a GET request to be made (specifically for the refetch of data)
   * @returns 
   */
  static clickDeleteConfirmationAction(isConfirmed: boolean = true) {
    if (isConfirmed) {
      return UtilityFunctions.getModalContainer('Delete Confirm').find('[data-testid=modal-submit-btn]').click({ force: true });
    } else {
      return UtilityFunctions.getModalContainer('Delete Confirm').find('[data-testid=modal-cancel-btn]').click({ force: true });
    }
  }

  /**
   * Clicks the Overwrite confirmation action
   * @param overwriteAction the action to click
   * @returns 
   */
  static clickOverwriteConfirmationAction(overwriteAction: OverwriteAction) {
    return UtilityFunctions.getModalContainer('Confirm Overwrite').find(overwriteAction).click({ force: true });
  }

  /**
   * Gets an item in the breadcrumb area by name
   * @param itemName the name of the folder in the breadcrumb area
   * @returns 
   */
  static getItemInBreadcrumbs(itemName: string) {
    const itemShorten = shortenString(itemName);
    return cy.get('.breadcrumb-area').contains('span', itemShorten).should('have.length', 1);
  }

  /**
   * Navigates to a folder in Ag Grid by clicking it's name
   * @param folderName the name of the folder to navigate to
   * @returns 
   */
  static navigateToFolderInGridByName(folderName: string) {
    return AgGridFunctions.getElementInRowWithColIdContainingValue(SpacesGridColId.NAME, folderName)
      .find('span').contains(folderName).should('have.length', 1).click({ force: true });
  }

  static clickCheckboxOfItemByName(itemName: string) {
    return AgGridFunctions.getRowWithColIdContainingValue(SpacesGridColId.NAME, itemName)
      .find('[type="checkbox"]').should('have.length', 1).check();
  }

  static getDesktopManagerUsersButton() {
    return cy.contains('button > svg > title', 'Manage Users').parent();
  }
}

export enum MoreActionsType {
  RESTORE = "Restore",
  PERMANENT_DELETE = "Permanently Delete",
  FAVORITE = "Add to favorites",
  UNFAVORITE = "Remove from favorites",
  REMOVE = "Remove",
  RENAME = "Rename"
}