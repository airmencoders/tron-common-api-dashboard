import React from 'react';
import { render } from '@testing-library/react';
import DesktopActions, { checkIfItemsIsLoneEmptyFolder } from '../DesktopActions';
import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { DocumentDto, DocumentSpaceControllerApi, DocumentSpaceControllerApiInterface, DocumentSpacePrivilegeDtoTypeEnum, DocumentSpaceResponseDto } from '../../../../../openapi';
import { useDocumentSpacePrivilegesState, useDocumentSpaceState } from '../../../../../state/document-space/document-space-state';
import DocumentSpaceService from '../../../../../state/document-space/document-space-service';
import DocumentSpacePrivilegeService from '../../../../../state/document-space/document-space-privilege-service';
import { CreateEditOperationType } from '../../../../../utils/document-space-utils';

jest.mock('../../../../../state/document-space/document-space-state');
describe('Desktop Actions Test', () => {
  let selectedFiles: State<DocumentDto[]> & StateMethodsDestroy;
  let showDeleteSelectedDialog: State<boolean> & StateMethodsDestroy;
  let selectedSpace: State<DocumentSpaceResponseDto | undefined> & StateMethodsDestroy;
  let path: State<string> & StateMethodsDestroy;
  let shouldUpdateDatasource: State<boolean> & StateMethodsDestroy;
  let createEditElementOpType: State<CreateEditOperationType> & StateMethodsDestroy;
  let membershipsState: State<{ isOpen: boolean }> & StateMethodsDestroy;

  let documentSpacesState: State<DocumentSpaceResponseDto[]> & StateMethodsDestroy;
  let documentSpaceApi: DocumentSpaceControllerApiInterface;
  let documentSpaceService: DocumentSpaceService;

  let documentSpacePrivilegeState: State<Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>>>;
  let documentSpacePrivilegeService: DocumentSpacePrivilegeService;

  beforeEach(() => {
    selectedFiles = createState<DocumentDto[]>([]);
    showDeleteSelectedDialog = createState<boolean>(false);
    selectedSpace = createState<DocumentSpaceResponseDto | undefined>({
      id: 'id',
      name: 'test document space'
    });
    path = createState<string>('');
    shouldUpdateDatasource = createState<boolean>(false);
    createEditElementOpType = createState<CreateEditOperationType>(CreateEditOperationType.NONE);
    membershipsState = createState<{ isOpen: boolean }>({ isOpen: false });

    documentSpacePrivilegeState = createState<Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>>>({});
    documentSpaceApi = new DocumentSpaceControllerApi();
    documentSpacePrivilegeService = new DocumentSpacePrivilegeService(
      documentSpaceApi,
      documentSpacePrivilegeState
    );
    (useDocumentSpacePrivilegesState as jest.Mock).mockReturnValue(documentSpacePrivilegeService);

    documentSpacesState = createState<DocumentSpaceResponseDto[]>([]);
    documentSpaceService = new DocumentSpaceService(documentSpaceApi, documentSpacesState);
    (useDocumentSpaceState as jest.Mock).mockReturnValue(documentSpaceService);
  });

  afterEach(() => {
    selectedFiles.destroy();
    showDeleteSelectedDialog.destroy();
    selectedSpace.destroy();
    path.destroy();
    shouldUpdateDatasource.destroy();
    createEditElementOpType.destroy();
    membershipsState.destroy();

    jest.resetAllMocks();
  });

  it('should render Write actions when authorized for write only', () => {
    jest.spyOn(documentSpacePrivilegeService, 'isAuthorizedForAction')
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    const element = render(
      <DesktopActions
        selectedFiles={selectedFiles}
        showDeleteSelectedDialog={showDeleteSelectedDialog}
        selectedSpace={selectedSpace}
        path={path}
        shouldUpdateDatasource={shouldUpdateDatasource}
        createEditElementOpType={createEditElementOpType}
        membershipsState={membershipsState}
      />
    );

    expect(element.getByTestId('upload-new-file')).toBeInTheDocument();
    expect(element.getByTitle('Add Items')).toBeInTheDocument();
    expect(element.getByTestId('delete-selected-items')).toBeInTheDocument();

    expect(element.queryByTitle('Download Items')).not.toBeInTheDocument();

    expect(element.queryByTitle('Manage Users')).not.toBeInTheDocument();
  });

  it('should render Read actions when authorized for read only', () => {
    jest.spyOn(documentSpacePrivilegeService, 'isAuthorizedForAction')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false);

    const element = render(
      <DesktopActions
        selectedFiles={selectedFiles}
        showDeleteSelectedDialog={showDeleteSelectedDialog}
        selectedSpace={selectedSpace}
        path={path}
        shouldUpdateDatasource={shouldUpdateDatasource}
        createEditElementOpType={createEditElementOpType}
        membershipsState={membershipsState}
      />
    );

    expect(element.queryByTestId('upload-new-file')).not.toBeInTheDocument();
    expect(element.queryByTitle('Add Items')).not.toBeInTheDocument();
    expect(element.queryByTestId('delete-selected-items')).not.toBeInTheDocument();

    expect(element.getByTitle('Download Items')).toBeInTheDocument();

    expect(element.queryByTitle('Manage Users')).not.toBeInTheDocument();
  });

  it('should render Membership actions when authorized for membership only', () => {
    jest.spyOn(documentSpacePrivilegeService, 'isAuthorizedForAction')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    const element = render(
      <DesktopActions
        selectedFiles={selectedFiles}
        showDeleteSelectedDialog={showDeleteSelectedDialog}
        selectedSpace={selectedSpace}
        path={path}
        shouldUpdateDatasource={shouldUpdateDatasource}
        createEditElementOpType={createEditElementOpType}
        membershipsState={membershipsState}
      />
    );

    expect(element.queryByTestId('upload-new-file')).not.toBeInTheDocument();
    expect(element.queryByTitle('Add Items')).not.toBeInTheDocument();
    expect(element.queryByTestId('delete-selected-items')).not.toBeInTheDocument();

    expect(element.queryByTitle('Download Items')).not.toBeInTheDocument();

    expect(element.getByTitle('Manage Users')).toBeInTheDocument();
  });

  it('should not render anything when no selected space', () => {
    selectedSpace.set(undefined);

    const element = render(
      <DesktopActions
        selectedFiles={selectedFiles}
        showDeleteSelectedDialog={showDeleteSelectedDialog}
        selectedSpace={selectedSpace}
        path={path}
        shouldUpdateDatasource={shouldUpdateDatasource}
        createEditElementOpType={createEditElementOpType}
        membershipsState={membershipsState}
      />
    );

    expect(element.queryByTestId('upload-new-file')).not.toBeInTheDocument();
    expect(element.queryByTitle('Add Items')).not.toBeInTheDocument();
    expect(element.queryByTestId('delete-selected-items')).not.toBeInTheDocument();
    expect(element.queryByTitle('Download Items')).not.toBeInTheDocument();
    expect(element.queryByTitle('Manage Users')).not.toBeInTheDocument();
  });

  it('should disallow downloading of a lone, empty folder', () => {
    expect(checkIfItemsIsLoneEmptyFolder(undefined!)).toBeFalsy();
    expect(checkIfItemsIsLoneEmptyFolder([])).toBeFalsy();
    expect(checkIfItemsIsLoneEmptyFolder([ { hasContents: true, folder: true } as DocumentDto])).toBeTruthy();
    expect(checkIfItemsIsLoneEmptyFolder([ { hasContents: true, folder: false } as DocumentDto])).toBeTruthy();
    expect(checkIfItemsIsLoneEmptyFolder([ { hasContents: false, folder: true } as DocumentDto])).toBeFalsy();
    expect(checkIfItemsIsLoneEmptyFolder([ { hasContents: false, folder: true } as DocumentDto, { hasContents: true, folder: true } as DocumentDto])).toBeTruthy();
    expect(checkIfItemsIsLoneEmptyFolder([ { hasContents: false, folder: true } as DocumentDto, { hasContents: false, folder: false } as DocumentDto])).toBeTruthy();
  });
});
