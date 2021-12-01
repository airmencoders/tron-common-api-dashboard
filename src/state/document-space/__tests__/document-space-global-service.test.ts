import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { DocumentSpaceResponseDto } from '../../../openapi';
import DocumentSpaceGlobalService, { DocumentSpaceGlobalState } from '../document-space-global-service';

describe('Document Space Global Service Tests', () => {
  const documentSpaces: DocumentSpaceResponseDto[] = [
    {
      id: '412ea028-1fc5-41e0-b48a-c6ef090704d3',
      name: 'space1',
    },
    {
      id: '52909027-69f6-4d0c-83da-293bc2d9d2f8',
      name: 'space2',
    }
  ];

  let globalDocumentSpaceState: State<DocumentSpaceGlobalState> & StateMethodsDestroy;
  let globalDocumentSpaceService: DocumentSpaceGlobalService;

  beforeEach(() => {

    globalDocumentSpaceState = createState<DocumentSpaceGlobalState>({
      currentDocumentSpace: undefined
    });
    globalDocumentSpaceService = new DocumentSpaceGlobalService(globalDocumentSpaceState);
  });

  describe('getInitialSelectedDocumentSpace tests', () => {
    it('should return the global selected document space when it is set', () => {
      const globalSelectedSpace = documentSpaces[1];
      globalDocumentSpaceService.setCurrentDocumentSpace(globalSelectedSpace);
      expect(globalDocumentSpaceState.currentDocumentSpace.value).toEqual(globalSelectedSpace);

      const initialSpace = globalDocumentSpaceService.getInitialSelectedDocumentSpace(documentSpaces);
      expect(initialSpace).toEqual(globalSelectedSpace);
    });

    it('should return the default space if it exists and global space is not set', () => {
      expect(globalDocumentSpaceState.currentDocumentSpace.value).toBeUndefined();

      const defaultSpace = documentSpaces[0];
      const initialSpace = globalDocumentSpaceService.getInitialSelectedDocumentSpace(documentSpaces, defaultSpace.id);
      expect(initialSpace).toEqual(defaultSpace);
    });

    it('should return index 0 of spaces when global selected space and default space does not exist', () => {
      expect(globalDocumentSpaceState.currentDocumentSpace.value).toBeUndefined();

      const initialSpace = globalDocumentSpaceService.getInitialSelectedDocumentSpace(documentSpaces);
      expect(initialSpace).toEqual(documentSpaces[0]);
    });

    it('should return undefined when no conditions are satisfied', () => {
      const initialSpace = globalDocumentSpaceService.getInitialSelectedDocumentSpace([]);
      expect(initialSpace).toBeUndefined();
    });
  });

  it('should reset state', () => {
    globalDocumentSpaceService.setCurrentDocumentSpace(documentSpaces[0]);
    expect(globalDocumentSpaceState.currentDocumentSpace.value).toEqual(documentSpaces[0]);

    globalDocumentSpaceService.resetState();
    expect(globalDocumentSpaceState.value).toEqual({
      currentDocumentSpace: undefined
    });
  });
});