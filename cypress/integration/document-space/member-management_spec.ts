import AgGridFunctions, { SpacesManageMembersColId } from '../../support/ag-grid-functions';
import Funcs from '../../support/document-space-functions';

describe('Document Space Member Management', () => {
  const spaceId = 'spaceId';
  const spaceIdAlias = `@${spaceId}`;

  const cypressEmailPrefix = 'cypress_documentspace';

  beforeEach(() => {
    Funcs.createOrReturnExistingDocumentSpace().as(spaceId);
    // Go to the cypress e2e document space 
    cy.get<string>(spaceIdAlias)
      .then((cypressSpaceId) =>
        Funcs.visitDocumentSpace(cypressSpaceId)
      );
  });

  it('should be able to add a member to document space and remove them', () => {
    const email = `${cypressEmailPrefix}@user.com`;

    Funcs.getDesktopManagerUsersButton().click({ force: true });

    // Make sure the side drawer is open and visible
    cy.contains('.open > .side-drawer__header > .header__title', 'Member Management').should('be.visible');

    // Add a User
    cy.get('[data-testid=textInput]').type(email);

    // Ensure privileges assign hierarchy correctly

    // Give "admin" and "editor" should be checked
    cy.get('#privilege_MEMBERSHIP').check({ force: true }).should('be.checked').and('not.be.disabled');
    cy.get('#privilege_WRITE').should('be.checked').and('be.disabled');

    // Clear the checkboxes
    cy.get('#privilege_MEMBERSHIP').uncheck({ force: true }).should('not.be.checked').and('not.be.disabled');
    cy.get('#privilege_WRITE').uncheck({ force: true }).should('not.be.checked').and('not.be.disabled');

    // Give "editor" and only that should be checked
    cy.get('#privilege_WRITE').check({ force: true }).should('be.checked').and('not.be.disabled');
    cy.get('#privilege_MEMBERSHIP').should('not.be.checked').and('not.be.disabled');

    // Submit
    cy.get('.add-members-form .submit-actions > .button-container__submit').should('not.be.disabled').click({ force: true });

    // Make sure they exist and remove
    cy.contains('.side-drawer .tabs > ul > li > a', 'Manage Members').click({ force: true });
    AgGridFunctions.getCheckboxInRowWithColIdContainingValue(SpacesManageMembersColId.EMAIL, email).check();
    cy.get('.header__actions > [data-testid=button] > .remove-icon').should('not.be.disabled').click({ force: true });
    cy.get('[data-testid=modal-submit-btn]').click();

    // Make sure no longer exists
    AgGridFunctions.getRowWithColIdContainingValue(SpacesManageMembersColId.EMAIL, email).should('not.exist');
  });
});