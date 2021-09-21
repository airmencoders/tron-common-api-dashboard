import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { fireEvent, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosResponse } from 'axios';
import { MemoryRouter } from 'react-router-dom';
import { DocumentSpaceControllerApi, DocumentSpaceControllerApiInterface, DocumentSpaceInfoDto, DocumentSpaceInfoDtoResponseWrapper } from '../../../openapi';
import DocumentSpaceService from '../../../state/document-space/document-space-service';
import { useDocumentSpaceState } from '../../../state/document-space/document-space-state';
import { createAxiosSuccessResponse } from '../../../utils/TestUtils/test-utils';
import DocumentSpacePage from '../DocumentSpacePage';

jest.mock('../../../state/document-space/document-space-state');
describe('Test Document Space Page', () => {
  const documentSpaces: DocumentSpaceInfoDto[] = [
    {
      name: 'space1'
    },
    {
      name: 'space2'
    }
  ];

  const getSpacesResponse: AxiosResponse<DocumentSpaceInfoDtoResponseWrapper> = createAxiosSuccessResponse({ data: documentSpaces });

  let documentSpacesState: State<DocumentSpaceInfoDto[]> & StateMethodsDestroy;
  let documentSpaceApi: DocumentSpaceControllerApiInterface;
  let documentSpaceService: DocumentSpaceService;

  beforeEach(() => {
    documentSpacesState = createState<DocumentSpaceInfoDto[]>([]);
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
    expect(documentSpacesSelect).toHaveValue('Loading...');

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
    expect(documentSpacesSelect).toHaveValue('Could not load Document Spaces');
  });

  it('should show Document Spaces options select when retrieving Document Spaces succeeds', () => {
    jest.spyOn(documentSpaceApi, 'getSpaces').mockReturnValue(Promise.resolve(getSpacesResponse));
    jest.spyOn(documentSpaceService, 'isDocumentSpacesStateErrored', 'get').mockReturnValue(false);
    jest.spyOn(documentSpaceService, 'isDocumentSpacesStatePromised', 'get').mockReturnValue(false);
    jest.spyOn(documentSpaceService, 'documentSpaces', 'get').mockReturnValue(documentSpaces);

    const page = render(
      <MemoryRouter>
        <DocumentSpacePage />
      </MemoryRouter>
    );

    const documentSpacesSelect = page.getByLabelText('Spaces');
    expect(documentSpacesSelect).toBeEnabled();
    expect(documentSpacesSelect).toHaveValue('Select a Space');
  });

  it('should load Ag Grid when a valid Document Space is selected', async () => {
    jest.spyOn(documentSpaceApi, 'getSpaces').mockReturnValue(Promise.resolve(getSpacesResponse));
    jest.spyOn(documentSpaceService, 'isDocumentSpacesStateErrored', 'get').mockReturnValue(false);
    jest.spyOn(documentSpaceService, 'isDocumentSpacesStatePromised', 'get').mockReturnValue(false);
    jest.spyOn(documentSpaceService, 'documentSpaces', 'get').mockReturnValue(documentSpaces);

    const page = render(
      <MemoryRouter>
        <DocumentSpacePage />
      </MemoryRouter>
    );

    const documentSpacesSelect = page.getByLabelText('Spaces');
    expect(documentSpacesSelect).toBeEnabled();
    expect(documentSpacesSelect).toHaveValue('Select a Space');

    userEvent.selectOptions(documentSpacesSelect, documentSpaces[0].name);
    expect(documentSpacesSelect).toHaveValue(documentSpaces[0].name);
  });

  it('should have Add New Space button', async () => {
    const page = render(
      <MemoryRouter>
        <DocumentSpacePage />
      </MemoryRouter>
    );

    const addBtn = page.getByText('Add New Space');
    await waitFor(() => expect(addBtn).toBeVisible());
  });
})
