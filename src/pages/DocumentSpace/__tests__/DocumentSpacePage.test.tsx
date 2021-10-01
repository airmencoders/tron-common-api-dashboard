import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';
import { MemoryRouter } from 'react-router-dom';
import { DocumentSpaceControllerApi, DocumentSpaceControllerApiInterface, DocumentSpaceResponseDto, DocumentSpaceResponseDtoResponseWrapper } from '../../../openapi';
import DocumentSpaceService from '../../../state/document-space/document-space-service';
import { useDocumentSpaceState } from '../../../state/document-space/document-space-state';
import { createAxiosSuccessResponse } from '../../../utils/TestUtils/test-utils';
import DocumentSpacePage from '../DocumentSpacePage';

jest.mock('../../../state/document-space/document-space-state');
describe('Test Document Space Page', () => {
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

  const getSpacesResponse: AxiosResponse<DocumentSpaceResponseDtoResponseWrapper> = createAxiosSuccessResponse({ data: documentSpaces });

  let documentSpacesState: State<DocumentSpaceResponseDto[]> & StateMethodsDestroy;
  let documentSpaceApi: DocumentSpaceControllerApiInterface;
  let documentSpaceService: DocumentSpaceService;

  beforeEach(() => {
    documentSpacesState = createState<DocumentSpaceResponseDto[]>([]);
    documentSpaceApi = new DocumentSpaceControllerApi();
    documentSpaceService = new DocumentSpaceService(documentSpaceApi, documentSpacesState);

    (useDocumentSpaceState as jest.Mock).mockReturnValue(documentSpaceService);
  });

  it('should show loading select when first retrieving Document Spaces', () => {
    jest.spyOn(documentSpaceService, 'isDocumentSpacesStatePromised', 'get').mockReturnValue(true);

    const page = render(
      <MemoryRouter>
        <DocumentSpacePage />
      </MemoryRouter>
    );

    const documentSpacesSelect = page.getByLabelText('Spaces');
    expect(documentSpacesSelect).toBeDisabled();
    expect(documentSpacesSelect).toHaveValue('loading');

  });

  it('should show error select when retrieving Document Spaces fails', () => {
    jest.spyOn(documentSpaceApi, 'getSpaces').mockReturnValue(Promise.reject('Error'));
    jest.spyOn(documentSpaceService, 'isDocumentSpacesStateErrored', 'get').mockReturnValue(true);

    const page = render(
      <MemoryRouter>
        <DocumentSpacePage />
      </MemoryRouter>
    );

    const documentSpacesSelect = page.getByLabelText('Spaces');
    expect(documentSpacesSelect).toBeDisabled();
    expect(documentSpacesSelect).toHaveValue('error');
  });

  it('should show Document Spaces options select with first item in state when state is not promised or errored', () => {
    jest.spyOn(documentSpaceApi, 'getSpaces').mockReturnValue(Promise.resolve(getSpacesResponse));
    jest.spyOn(documentSpaceService, 'isDocumentSpacesStateErrored', 'get').mockReturnValue(false);
    jest.spyOn(documentSpaceService, 'isDocumentSpacesStatePromised', 'get').mockReturnValue(false);
    jest.spyOn(documentSpaceService, 'documentSpaces', 'get').mockReturnValue(documentSpaces);
    jest.spyOn(documentSpaceService, 'fetchAndStoreSpaces').mockImplementation(() => {
      return {
        promise: Promise.resolve(documentSpaces),
        cancelTokenSource: axios.CancelToken.source()
      }
    });

    const page = render(
      <MemoryRouter>
        <DocumentSpacePage />
      </MemoryRouter>
    );

    const documentSpacesSelect = page.getByLabelText('Spaces');
    expect(documentSpacesSelect).toBeEnabled();
    expect(documentSpacesSelect).toHaveValue(documentSpaces[0].id);
  });

  it('should have Add New Space button', () => {
    jest.spyOn(documentSpaceApi, 'getSpaces').mockReturnValue(Promise.resolve(getSpacesResponse));
    jest.spyOn(documentSpaceService, 'isDocumentSpacesStateErrored', 'get').mockReturnValue(false);
    jest.spyOn(documentSpaceService, 'isDocumentSpacesStatePromised', 'get').mockReturnValue(false);
    jest.spyOn(documentSpaceService, 'documentSpaces', 'get').mockReturnValue(documentSpaces);

    const page = render(
      <MemoryRouter>
        <DocumentSpacePage />
      </MemoryRouter>
    );

    const addBtn = page.getByText('Add New Space');
    expect(addBtn).toBeVisible();
  });

  it('should not show Upload Files button while spaces are loading (no space selected)', () => {
    jest.spyOn(documentSpaceService, 'isDocumentSpacesStatePromised', 'get').mockReturnValue(true);

    const page = render(
      <MemoryRouter>
        <DocumentSpacePage />
      </MemoryRouter>
    );

    expect(page.queryByText('Upload Files')).not.toBeInTheDocument();
  });

  it('should allow to change space', async () => {
    jest.spyOn(documentSpaceApi, 'getSpaces').mockReturnValue(Promise.resolve(getSpacesResponse));
    jest.spyOn(documentSpaceService, 'isDocumentSpacesStateErrored', 'get').mockReturnValue(false);
    jest.spyOn(documentSpaceService, 'isDocumentSpacesStatePromised', 'get').mockReturnValue(false);
    jest.spyOn(documentSpaceService, 'documentSpaces', 'get').mockReturnValue(documentSpaces);
    jest.spyOn(documentSpaceService, 'fetchAndStoreSpaces').mockReturnValue({
      promise: Promise.resolve(documentSpaces),
      cancelTokenSource: axios.CancelToken.source()
    });

    const page = render(
      <MemoryRouter>
        <DocumentSpacePage />
      </MemoryRouter>
    );

    const documentSpacesSelect = page.getByLabelText('Spaces');
    expect(documentSpacesSelect).toBeEnabled();
    expect(documentSpacesSelect).toHaveValue(documentSpaces[0].id);

    userEvent.selectOptions(documentSpacesSelect, documentSpaces[1].id);
    await waitFor(() => expect(documentSpacesSelect).toHaveValue(documentSpaces[1].id));
  });
});
