import { documentSpaceApiBase } from '../../support';
import AgGridFunctions, { RecentsGridColId, SpacesGridColId } from '../../support/ag-grid-functions';
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
  });

  after(() => {
    cy.get<string>(spaceIdAlias).then(spaceId => {
      Funcs.deleteSpace(spaceId);
    });
  });

  it('should be able to see recently uploaded files', () => {
    // create two files
    cy.get<string>(spaceIdAlias)
      .then(cypressSpaceId => {
        Funcs.uploadTestFileAtCurrentLocation(cypressSpaceId).as('file1');
        Funcs.uploadTestFileAtCurrentLocation(cypressSpaceId).as('file2');
      });

    // Go to Recents Page and make sure they exist in there now
    Funcs.visitRecentsPage();

    cy.get<string>('@file1')
      .then(file1 => {
        cy.get<string>('@file2')
          .then(file2 => {
            AgGridFunctions.getRowWithColIdContainingValue(RecentsGridColId.NAME, file1);
            AgGridFunctions.getRowWithColIdContainingValue(RecentsGridColId.NAME, file2);
          });
      });
  });

  it('should be able to rename files/folders', () => {
    cy.get<string>(spaceIdAlias)
      .then(cypressSpaceId => {
        // create a file
        Funcs.uploadTestFileAtCurrentLocation(cypressSpaceId)
          .then(filename => {
            // try to rename it
            Funcs.clickMoreActionsButton(filename, MoreActionsType.RENAME);
            Funcs.fillRenameElementFormAndSubmit('test new file name');
            AgGridFunctions.getRowWithColIdContainingValue(SpacesGridColId.NAME, 'test new file name');
          });

        // create a folder
        Funcs.createFolderAtCurrentLocation(cypressSpaceId)
          .then(folderName => {
            // try to rename it
            Funcs.clickMoreActionsButton(folderName, MoreActionsType.RENAME);
            Funcs.fillRenameElementFormAndSubmit('test new folder name');
            AgGridFunctions.getRowWithColIdContainingValue(SpacesGridColId.NAME, 'test new folder name');
          });
      });
  });

  describe('test validation for element renames', () => {
    // blank
    // non-alphanumeric character
    // whitespace before extension
    // more than one period (.)
    // more than 255 characters
    const invalidNames = ['', '!@#$%^', 'newfile .txt', 'invalid.file.name', UtilityFunctions.randomStringOfLength(256)];

    it('should validate file renames', () => {
      cy.get<string>(spaceIdAlias)
        .then(cypressSpaceId => {
          // create a file
          Funcs.uploadTestFileAtCurrentLocation(cypressSpaceId)
            .then(filename => {
              // try to rename it
              Funcs.clickMoreActionsButton(filename, MoreActionsType.RENAME);


              invalidNames.forEach(name => {
                Funcs.fillRenameElementForm(name);
                cy.contains('.validation__error', 'Invalid File Name');
              });
            });
        });
    });

    it('should validate folder renames', () => {
      cy.get<string>(spaceIdAlias)
        .then(cypressSpaceId => {
          // create a folder
          Funcs.createFolderAtCurrentLocation(cypressSpaceId)
            .then(folderName => {
              // try to rename it
              Funcs.clickMoreActionsButton(folderName, MoreActionsType.RENAME);

              invalidNames.forEach(name => {
                Funcs.fillRenameElementForm(name);
                cy.contains('.validation__error', 'Invalid Folder Name');
              });
            });
        });
    });
  });

  describe('should show the correct action component on main document space page', () => {
    it('should show desktop component', () => {
      cy.viewport(1920, 1080);
      cy.get('.document-space-actions--desktop');
    });

    it('should show mobile component', () => {
      cy.viewport('ipad-mini');
      cy.get('.document-space-actions--mobile');
    });
  });
});