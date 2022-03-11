import React from 'react';
import { render } from '@testing-library/react';
import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { DocumentDto, DocumentSpaceControllerApi, DocumentSpaceControllerApiInterface, DocumentSpacePrivilegeDtoTypeEnum, DocumentSpaceResponseDto } from '../../../../openapi';
import DocumentSpacePrivilegeService from '../../../../state/document-space/document-space-privilege-service';
import { useDocumentSpacePrivilegesState } from '../../../../state/document-space/document-space-state';
import DocumentSpaceActions from '../DocumentSpaceActions';
import { CreateEditOperationType } from '../../../../utils/document-space-utils';


jest.mock('../../../../state/document-space/document-space-state');
describe('Document Space Actions Test', () => {
  let selectedFiles: State<DocumentDto[]> & StateMethodsDestroy;
  let showDeleteSelectedDialog: State<boolean> & StateMethodsDestroy;
  let selectedSpace: State<DocumentSpaceResponseDto | undefined> & StateMethodsDestroy;
  let path: State<string> & StateMethodsDestroy;
  let shouldUpdateDatasource: State<boolean> & StateMethodsDestroy;
  let createEditElementOpType: State<CreateEditOperationType> & StateMethodsDestroy;
  let membershipsState: State<{ isOpen: boolean }> & StateMethodsDestroy;

  let documentSpaceApi: DocumentSpaceControllerApiInterface;

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

  it('should not render when show = false', () => {
    jest.spyOn(documentSpacePrivilegeService, 'isAuthorizedForAction').mockImplementation((id: string, type: DocumentSpacePrivilegeDtoTypeEnum) => {
      if (type === DocumentSpacePrivilegeDtoTypeEnum.Write) {
        return true;
      }

      if (type === DocumentSpacePrivilegeDtoTypeEnum.Membership) {
        return true;
      }

      return true;
    });

    const element = render(
      <DocumentSpaceActions
        show={false}
        isMobile={true}
        selectedSpace={selectedSpace}
        path={path}
        shouldUpdateDatasource={shouldUpdateDatasource}
        createEditElementOpType={createEditElementOpType}
        membershipsState={membershipsState}
        selectedFiles={selectedFiles}
        showDeleteSelectedDialog={showDeleteSelectedDialog}
      />
    );

    const actionsButton = element.queryByTitle('Actions');
    const downloadButton = element.queryByTitle('Download Items');
    const removeButton = element.queryByTitle('remove');

    expect(actionsButton).not.toBeInTheDocument();
    expect(downloadButton).not.toBeInTheDocument();
    expect(removeButton).not.toBeInTheDocument();
  });
  
  it('should render Mobile Actions when isMobile = true', () => {
    jest.spyOn(documentSpacePrivilegeService, 'isAuthorizedForAction').mockImplementation((id: string, type: DocumentSpacePrivilegeDtoTypeEnum) => {
      if (type === DocumentSpacePrivilegeDtoTypeEnum.Write) {
        return true;
      }

      if (type === DocumentSpacePrivilegeDtoTypeEnum.Membership) {
        return true;
      }

      return true;
    });

    const element = render(
      <DocumentSpaceActions
        show={true}
        isMobile={true}
        selectedSpace={selectedSpace}
        path={path}
        shouldUpdateDatasource={shouldUpdateDatasource}
        createEditElementOpType={createEditElementOpType}
        membershipsState={membershipsState}
        selectedFiles={selectedFiles}
        showDeleteSelectedDialog={showDeleteSelectedDialog}
      />
    );

    // All privileges, check for all buttons
    const actionsButton = element.queryByTitle('Actions');
    const downloadButton = element.queryByTitle('Download Items');
    const removeButton = element.queryByTitle('remove');

    expect(actionsButton).toBeInTheDocument();
    expect(downloadButton).toBeInTheDocument();
    expect(removeButton).toBeInTheDocument();
  });

  it('should render Desktop Actions when isMobile = false', () => {
    jest.spyOn(documentSpacePrivilegeService, 'isAuthorizedForAction').mockImplementation((id: string, type: DocumentSpacePrivilegeDtoTypeEnum) => {
      if (type === DocumentSpacePrivilegeDtoTypeEnum.Write) {
        return true;
      }

      if (type === DocumentSpacePrivilegeDtoTypeEnum.Membership) {
        return true;
      }

      return true;
    });

    const element = render(
      <DocumentSpaceActions
        show={true}
        selectedSpace={selectedSpace}
        path={path}
        shouldUpdateDatasource={shouldUpdateDatasource}
        createEditElementOpType={createEditElementOpType}
        membershipsState={membershipsState}
        selectedFiles={selectedFiles}
        showDeleteSelectedDialog={showDeleteSelectedDialog}
      />
    );

    // All privileges, check for all buttons
    expect(element.queryByTestId('upload-new-file')).toBeInTheDocument();
    expect(element.queryByTitle('Add Items')).toBeInTheDocument();
    expect(element.queryByTestId('delete-selected-items')).toBeInTheDocument();

    expect(element.getByTitle('Download Items')).toBeInTheDocument();

    expect(element.queryByTitle('Manage Users')).toBeInTheDocument();
  });
})
