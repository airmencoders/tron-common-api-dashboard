import { DocumentSpaceResponseDto } from '../../../src/openapi';
import { documentSpaceApiBase } from '../../support';
import AgGridFunctions, { FavoritesGridColId, SpacesGridColId } from '../../support/ag-grid-functions';
import Funcs, { MoreActionsType, OverwriteAction } from '../../support/document-space-functions';
import UtilityFunctions from '../../support/utility-functions';

describe('Document Space File Upload test', () => {
  const space = '@space';
  const spaceIdAlias = '@spaceId';

  beforeEach(() => {
    Funcs.createOrReturnExistingDocumentSpace()
      .then((value) => {
        cy.wrap(value).as('space');
        cy.wrap(value.id).as('spaceId');
      })
      .then(() => {
        // Go to the cypress e2e document space
        cy.get<string>(spaceIdAlias).then((cypressSpaceId) => Funcs.visitDocumentSpace(cypressSpaceId));
      });
  });

  after(() => {
    cy.get<string>(spaceIdAlias).then(spaceId => {
      Funcs.deleteSpace(spaceId);
    });
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

      });
  });

  it('should be able to delete archive multipe files, then permanently delete them', () => {
    // create two files
    cy.get<string>(spaceIdAlias)
      .then(cypressSpaceId => {
        Funcs.uploadTestFileAtCurrentLocation(cypressSpaceId).as('file1');
        Funcs.uploadTestFileAtCurrentLocation(cypressSpaceId).as('file2');
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
    Funcs.clickArchiveConfirmationAction(true);
    UtilityFunctions.findToastContainsMessage('Item(s) Archived');

    // Go to Archived Files page to find folder
    Funcs.visitArchivedFilesPage();
    // Permanently delete file1
    cy.get<string>('@file1').then(file1 => {
      Funcs.clickMoreActionsButton(file1, MoreActionsType.PERMANENT_DELETE);
      Funcs.clickDeleteConfirmationAction(true);
      UtilityFunctions.findToastContainsMessage(`File deleted: ${file1}`).click({ force: true });
    });

    // Permanently delete file2
    cy.get<string>('@file2').then(file2 => {
      Funcs.clickMoreActionsButton(file2, MoreActionsType.PERMANENT_DELETE);
      Funcs.clickDeleteConfirmationAction(true);
      UtilityFunctions.findToastContainsMessage(`File deleted: ${file2}`);
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
        Funcs.clickArchiveConfirmationAction(true);
      });

    // Try to create another file with the same name
    cy.get<string>(spaceIdAlias)
      .then(id => {
        cy.get<string>('@filename')
          .then(filename => {
            cy.intercept('POST', `${documentSpaceApiBase}/spaces/${id}/files/upload*`).as('fileCreateRequest');
            Funcs.uploadTestFileAtCurrentLocationUnsafe(filename);
            Funcs.clickOverwriteConfirmationAction(OverwriteAction.YES);
            cy.wait('@fileCreateRequest')
              .then(interception => {
                assert.isTrue(interception.response.statusCode === 409, 'Status code for creating a duplicated file that exists in an archived state should be 409');
              });
          });
      });
  });

  it('should allow file overwrite', () => {
    cy.get<string>(spaceIdAlias)
      .then(cypressSpaceId => {
        // Upload a file
        Funcs.uploadTestFileAtCurrentLocation(cypressSpaceId)
          .then(filename => {
            // Upload file with same name
            cy.intercept('POST', `${documentSpaceApiBase}/spaces/${cypressSpaceId}/files/upload*`).as('fileCreateRequest');
            Funcs.uploadTestFileAtCurrentLocationUnsafe(filename);
            Funcs.clickOverwriteConfirmationAction(OverwriteAction.YES);
            cy.wait('@fileCreateRequest')
              .then(interception => {
                assert.isTrue(interception.response.statusCode === 200, 'should allow file overwrite');
              });
          });
      });
  });

  it('should allow favorite/unfavorite', () => {
    cy.get<DocumentSpaceResponseDto>(space)
      .then(cypressSpace => {
        // Upload a file
        Funcs.uploadTestFileAtCurrentLocation(cypressSpace.id).as('filename');

        cy.get<string>('@filename')
          .then(filename => {
            // Favorite it
            Funcs.clickMoreActionsButton(filename, MoreActionsType.FAVORITE);

            // Check to make sure it now exists in favorites page
            Funcs.visitFavoritePage(cypressSpace.name);
            AgGridFunctions.getRowWithColIdContainingValue(FavoritesGridColId.NAME, filename);

            // Unfavorite it
            Funcs.clickMoreActionsButton(filename, MoreActionsType.UNFAVORITE);
            AgGridFunctions.getRowWithColIdContainingValue(FavoritesGridColId.NAME, filename).should('not.exist');
          });
      });
  });
});