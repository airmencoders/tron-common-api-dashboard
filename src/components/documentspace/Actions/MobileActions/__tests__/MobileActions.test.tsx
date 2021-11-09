import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { DocumentSpaceControllerApi, DocumentSpaceControllerApiInterface, DocumentSpacePrivilegeDtoTypeEnum, DocumentSpaceResponseDto } from '../../../../../openapi';
import { useDocumentSpacePrivilegesState } from '../../../../../state/document-space/document-space-state';
import DocumentSpacePrivilegeService from '../../../../../state/document-space/document-space-privilege-service';
import MobileActions from '../MobileActions';
import userEvent from '@testing-library/user-event';
import { CreateEditOperationType } from '../../../../../pages/DocumentSpace/DocumentSpacePage';

jest.mock('../../../../../state/document-space/document-space-state');
describe('Mobile Actions Test', () => {
  let selectedSpace: State<DocumentSpaceResponseDto | undefined> & StateMethodsDestroy;
  let path: State<string> & StateMethodsDestroy;
  let shouldUpdateDatasource: State<boolean> & StateMethodsDestroy;
  let createEditElementOpType: State<CreateEditOperationType> & StateMethodsDestroy;
  let membershipsState: State<{ isOpen: boolean }> & StateMethodsDestroy;

  let documentSpaceApi: DocumentSpaceControllerApiInterface;

  let documentSpacePrivilegeState: State<Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>>>;
  let documentSpacePrivilegeService: DocumentSpacePrivilegeService;

  beforeEach(() => {
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
    selectedSpace.destroy();
    path.destroy();
    shouldUpdateDatasource.destroy();
    createEditElementOpType.destroy();
    membershipsState.destroy();

    jest.resetAllMocks();
  });

  it('should render Write actions when authorized for write only', () => {
    jest.spyOn(documentSpacePrivilegeService, 'isAuthorizedForAction').mockImplementation((id: string, type: DocumentSpacePrivilegeDtoTypeEnum) => {
      if (type === DocumentSpacePrivilegeDtoTypeEnum.Write) {
        return true;
      }

      if (type === DocumentSpacePrivilegeDtoTypeEnum.Membership) {
        return false;
      }

      return false;
    });

    const element = render(
      <MobileActions
        selectedSpace={selectedSpace}
        path={path}
        shouldUpdateDatasource={shouldUpdateDatasource}
        createEditElementOpType={createEditElementOpType}
        membershipsState={membershipsState}
      />
    );

    const actionsButton = element.getByTitle('Actions');
    userEvent.click(actionsButton);

    expect(element.queryByTitle('Manage Users')).not.toBeInTheDocument();

    expect(element.getByTitle('Add Items')).toBeInTheDocument();
    const newFolder = element.getByTitle('Add Items');
    userEvent.click(newFolder);
    expect(createEditElementOpType.value).toEqual(CreateEditOperationType.CREATE_FOLDER);

    userEvent.click(actionsButton);

    expect(element.getByTitle('Upload File')).toBeInTheDocument();
    userEvent.click(element.getByTitle('Upload File'));
  });

  it('should render Membership actions when authorized for membership only', async () => {
    jest.spyOn(documentSpacePrivilegeService, 'isAuthorizedForAction').mockImplementation((id: string, type: DocumentSpacePrivilegeDtoTypeEnum) => {
      if (type === DocumentSpacePrivilegeDtoTypeEnum.Write) {
        return false;
      }

      if (type === DocumentSpacePrivilegeDtoTypeEnum.Membership) {
        return true;
      }

      return false;
    });

    const element = render(
      <MobileActions
        selectedSpace={selectedSpace}
        path={path}
        shouldUpdateDatasource={shouldUpdateDatasource}
        createEditElementOpType={createEditElementOpType}
        membershipsState={membershipsState}
      />
    );

    const actionsButton = element.getByTitle('Actions');
    userEvent.click(actionsButton);

    expect(element.queryByTitle('Upload File')).not.toBeInTheDocument();
    expect(element.queryByTitle('Add Items')).not.toBeInTheDocument();

    expect(element.getByTitle('Manage Users')).toBeInTheDocument();
    const manageUsers = element.getByTitle('Manage Users');
    userEvent.click(manageUsers);
    expect(membershipsState.value.isOpen).toBeTruthy();
    await waitFor(() => expect(membershipsState.value).toBeTruthy());
  });

  it('should not render when no selected space', () => {
    selectedSpace.set(undefined);

    const element = render(
      <MobileActions
        selectedSpace={selectedSpace}
        path={path}
        shouldUpdateDatasource={shouldUpdateDatasource}
        createEditElementOpType={createEditElementOpType}
        membershipsState={membershipsState}
      />
    );

    expect(element.queryByTitle('Actions')).not.toBeInTheDocument();
  });

  it('should not render when no available actions', () => {
    jest.spyOn(documentSpacePrivilegeService, 'isAuthorizedForAction').mockImplementation((id: string, type: DocumentSpacePrivilegeDtoTypeEnum) => {
      if (type === DocumentSpacePrivilegeDtoTypeEnum.Write) {
        return false;
      }

      if (type === DocumentSpacePrivilegeDtoTypeEnum.Membership) {
        return false;
      }

      return false;
    });

    const element = render(
      <MobileActions
        selectedSpace={selectedSpace}
        path={path}
        shouldUpdateDatasource={shouldUpdateDatasource}
        createEditElementOpType={createEditElementOpType}
        membershipsState={membershipsState}
      />
    );

    expect(element.queryByTitle('Actions')).not.toBeInTheDocument();
  });
})
