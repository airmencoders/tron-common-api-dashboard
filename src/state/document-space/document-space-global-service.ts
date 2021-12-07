import { State } from '@hookstate/core';
import { DocumentSpaceResponseDto } from '../../openapi';
import { AbstractGlobalStateService } from '../global-service/abstract-global-state-service';

export interface DocumentSpaceGlobalState {
  currentDocumentSpace?: DocumentSpaceResponseDto;
}

export default class DocumentSpaceGlobalService extends AbstractGlobalStateService<DocumentSpaceGlobalState> {
  constructor(
    public state: State<DocumentSpaceGlobalState>
  ) {
    super(state);
  }

  setCurrentDocumentSpace(documentSpace: DocumentSpaceResponseDto) {
    this.state.currentDocumentSpace.set({ ...documentSpace });
  }

  /**
   * Determines the initial space to load
   * @param spaces the Document Spaces the user is authenticated for
   * @param defaultDocumentSpaceId the default Document Space for the user
   * @returns the initial Document Space determined in the following order: Existing Selected Document Space in Global State -> Default Document Space -> index 0 of {@link spaces} -> undefined if none of the previous are fulfilled
   */
  getInitialSelectedDocumentSpace(spaces: DocumentSpaceResponseDto[], defaultDocumentSpaceId?: string): DocumentSpaceResponseDto | undefined {
    let selectedSpace: DocumentSpaceResponseDto | undefined = this.state.currentDocumentSpace.value;

    if (!spaces) return undefined;

    // guard for if selected space is deleted, force to pick another
    if (spaces && spaces.findIndex(space => space.id === selectedSpace?.id) === -1) {
      selectedSpace = undefined;
    }

    if (selectedSpace == null && spaces.length > 0) {
      const defaultDocumentSpace = defaultDocumentSpaceId == null ? undefined : spaces.find(space => space.id === defaultDocumentSpaceId);

      if (defaultDocumentSpace != null) {
        selectedSpace = defaultDocumentSpace;
      } else {
        selectedSpace = spaces[0];
      }
    }

    return selectedSpace;
  }

  resetState() {
    this.state.set({
      currentDocumentSpace: undefined
    });
  }
}
