import { documentSpaceApiBase } from '../../support';
import AgGridFunctions, { SpacesGridColId } from '../../support/ag-grid-functions';
import Funcs, { MoreActionsType } from '../../support/document-space-functions';
import UtilityFunctions from '../../support/utility-functions';

describe('Document Space File Upload test', () => {
  const spaceIdAlias = '@spaceId';

  beforeEach(() => {
    Funcs.createOrReturnExistingDocumentSpace().as('spaceId');

    // Go to the cypress e2e document space 
    cy.get<string>(spaceIdAlias)
      .then((cypressSpaceId) =>
        Funcs.visitDocumentSpace(cypressSpaceId)
      );
  });

  it('should be able to upload a file and it should show correct download urls', () => {
    cy.get<string>(spaceIdAlias)
      .then(cypressSpaceId => {
        Funcs.uploadTestFileAtCurrentLocation(cypressSpaceId).as('filename');
      });

    cy.get<string>('@filename')
      .then(filename => {
        // Just make sure it exists in Ag Grid
        AgGridFunctions.getElementInRowWithColIdContainingValue(SpacesGridColId.NAME, filename)
          .then(response => {
            // check to make sure the name has the correct href
            // it should be "viewable"
            cy.wrap(response).find('a').should('have.length', 1).should('have.attr', 'href').and('not.contain', '?download=true');
          });

        // check to make sure the download icon has correct href
        // it should not be "viewable"
        Funcs.getDownloadButtonIconByRowOnNameCol(filename)
          .parentsUntil('.document-download-cell-renderer', 'a').should('have.length', 1).and('have.attr', 'href').and('contain', '?download=true');

        // Clean up
        cy.get<string>(spaceIdAlias)
          .then((cypressSpaceId) => Funcs.deleteFile(cypressSpaceId, filename, '/'));
      });
  });

  it('should be able to delete archive multipe files, then permanently delete them', () => {
    // create two files
    cy.get<string>(spaceIdAlias)
      .then(cypressSpaceId => {
        Funcs.uploadTestFileAtCurrentLocation(cypressSpaceId).as('file1');
        Funcs.uploadTestFileAtCurrentLocation(cypressSpaceId, 'file2').as('file2');
      });

    // Check both files
    cy.get<string>('@file1')
      .then(file1 => {
        cy.get<string>('@file2')
          .then(file2 => {
            Funcs.clickCheckboxOfItemByName(file1).should('be.checked');
            Funcs.clickCheckboxOfItemByName(file2).should('be.checked');
          });
      });

    // Delete Archive them
    cy.get('[data-testid=delete-selected-items]').should('not.be.disabled').click();
    Funcs.clickDeleteConfirmationAction(true);
    UtilityFunctions.findToastContainsMessage('File Archived');

    // Go to Archived Files page to find folder
    Funcs.visitArchivedFilesPage();
    // Permanently delete file1
    cy.get<string>('@file1').then(file1 => {
      Funcs.clickMoreActionsButton(file1, MoreActionsType.PERMANENT_DELETE);
      Funcs.clickDeleteConfirmationAction(true);
      UtilityFunctions.findToastContainsMessage('Files Deleted').click({ force: true });
    });

    // Permanently delete file2
    cy.get<string>('@file2').then(file2 => {
      Funcs.clickMoreActionsButton(file2, MoreActionsType.PERMANENT_DELETE);
      Funcs.clickDeleteConfirmationAction(true);
      UtilityFunctions.findToastContainsMessage('Files Deleted');
    });
  });

  it('should not allow a file to be uploaded to a path and exist in both an archived and unarchived state', () => {
    // Upload a file
    cy.get<string>(spaceIdAlias)
      .then(cypressSpaceId => {
        Funcs.uploadTestFileAtCurrentLocation(cypressSpaceId).as('filename');
      });

    // Archive it
    cy.get<string>('@filename')
      .then(filename => {
        Funcs.clickMoreActionsButton(filename, MoreActionsType.REMOVE);
        Funcs.clickDeleteConfirmationAction(true);
      });

    // Try to create another file with the same name
    cy.get<string>(spaceIdAlias)
      .then(id => {
        cy.get<string>('@filename')
          .then(filename => {
            cy.intercept('POST', `${documentSpaceApiBase}/spaces/${id}/files/upload*`).as('fileCreateRequest');
            Funcs.uploadTestFileAtCurrentLocationUnsafe(filename);
            cy.wait('@fileCreateRequest')
              .then(interception => {
                assert.isTrue(interception.response.statusCode === 409, 'Status code for creating a duplicated file that exists in an archived state should be 409');
              });
          });
      });
  });
});