import { documentSpaceApiBase } from '../../support';
import Funcs, { MoreActionsType } from '../../support/document-space-functions';
import UtilityFunctions from '../../support/utility-functions';

describe('Document Space Folder test', () => {
  const spaceId = 'spaceId';
  const spaceIdAlias = `@${spaceId}`;
  const testFolder = 'testFolder';
  const testFolderAlias = `@${testFolder}`;

  beforeEach(() => {
    Funcs.createOrReturnExistingDocumentSpace().as(spaceId);

    // Go to the cypress e2e document space 
    cy.get<string>(spaceIdAlias)
      .then((cypressSpaceId) =>
        Funcs.visitDocumentSpace(cypressSpaceId)
      );

    // Create the test folder
    cy.get<string>(spaceIdAlias)
      .then(cypressSpaceId => {
        Funcs.createFolderAtCurrentLocation(cypressSpaceId).as(testFolder);
      });
  });

  afterEach(() => {
    // Clean up the created folder
    cy.get<string>(testFolderAlias)
      .then(folderName => {
        cy.get<string>(spaceIdAlias)
          .then((cypressSpaceId) => Funcs.deleteFile(cypressSpaceId, folderName, '/'));
      }).as('cleanUp');
  });

  after(() => {
    cy.get<string>(spaceIdAlias).then(spaceId => {
      Funcs.deleteSpace(spaceId);
    });
  });

  it('should be able to create a folder and navigate to it', () => {
    cy.get<string>(testFolderAlias)
      .then(folderName => {
        // Get in Ag Grid and click to navigate to folder
        Funcs.navigateToFolderInGridByName(folderName);

        // Ensure we are in the folder by looking for it in the breadcrumbs
        Funcs.getItemInBreadcrumbs(folderName);
      });
  });

  it('should be able to "delete archive" folder, find it in Archive Files page and permanently delete it', () => {
    /**
     * Create a nested folder structure.
     * 
     * Root
     * |__(random folder name, 1st)
     *    |__(random folder name, 2nd)
     *       |__(random folder name, 3rd)
     */
    cy.get<string>(spaceIdAlias).then(cypressSpaceId => {
      cy.get<string>(testFolderAlias).then(firstLevel => {
        // Navigate to 1st
        Funcs.navigateToFolderInGridByName(firstLevel);

        // Create 2nd
        Funcs.createFolderAtCurrentLocation(cypressSpaceId).as('secondLevel')
          .then(secondLevel => {
            // Navigate to 2nd
            Funcs.navigateToFolderInGridByName(secondLevel);
          })
          .then(() => {
            // Create 3rd
            Funcs.createFolderAtCurrentLocation(cypressSpaceId).as('thirdLevel')
              .then(thirdLevel => {
                // navigate to 3rd
                Funcs.navigateToFolderInGridByName(thirdLevel);
              });
          });
      });
    });

    // Archive a nested subfolder (2nd)
    cy.get<string>(testFolderAlias)
      .then(folderName => {
        // Navigate to 1st in breadcrumbs
        Funcs.getItemInBreadcrumbs(folderName).click({ force: true });

        // Archive 2nd
        cy.get<string>('@secondLevel')
          .then(secondFolderName => {
            Funcs.clickMoreActionsButton(secondFolderName, MoreActionsType.REMOVE);
            Funcs.clickArchiveConfirmationAction(true);
            UtilityFunctions.findToastContainsMessage('Item(s) Archived');
          });
      });

    // Go to Archived Files page to find folder
    Funcs.visitArchivedFilesPage();
    // Permanently delete 2nd
    cy.get<string>('@secondLevel').then(secondLevel => {
      Funcs.clickMoreActionsButton(secondLevel, MoreActionsType.PERMANENT_DELETE);
      Funcs.clickDeleteConfirmationAction(true);

      UtilityFunctions.findToastContainsMessage(`File deleted: ${secondLevel}`)
    });
  });

  it('should not allow a folder to be uploaded to a path and exist in both an archived and unarchived state', () => {
    // Archive the test folder
    cy.get<string>(testFolderAlias)
      .then(folderName => {
        Funcs.clickMoreActionsButton(folderName, MoreActionsType.REMOVE);
        Funcs.clickArchiveConfirmationAction(true);
      });

    // Try to create another folder with the same name,
    // should fail
    cy.get<string>(spaceIdAlias)
      .then(id => {
        cy.get<string>(testFolderAlias)
          .then(folderName => {
            cy.intercept('POST', `${documentSpaceApiBase}/spaces/${id}/folders`).as('folderCreateRequest');
            Funcs.createFolderAtCurrentLocationUnsafe(folderName);
            cy.wait('@folderCreateRequest')
              .then(interception => {
                assert.isTrue(interception.response.statusCode === 409, 'Status code for creating a duplicated folder that exists in an archived state should be 409');
              });
          });
      });
  });
});