import {createState, State, StateMethodsDestroy} from '@hookstate/core';
import {act, fireEvent, render} from '@testing-library/react';
import {AxiosResponse} from 'axios';
import {MemoryRouter} from 'react-router-dom';
import {
  DashboardUserControllerApi,
  DashboardUserDto,
  DocumentSpaceControllerApi,
  DocumentSpaceControllerApiInterface,
  DocumentSpaceResponseDto,
  DocumentSpaceResponseDtoResponseWrapper
} from '../../../openapi';
import AuthorizedUserService from '../../../state/authorized-user/authorized-user-service';
import {useAuthorizedUserState} from '../../../state/authorized-user/authorized-user-state';
import DocumentSpaceMembershipService from '../../../state/document-space/document-space-membership-service';
import DocumentSpaceService from '../../../state/document-space/document-space-service';
import {
  documentSpaceMembershipService,
  useDocumentSpaceState
} from '../../../state/document-space/document-space-state';
import {createAxiosSuccessResponse} from '../../../utils/TestUtils/test-utils';
import {FormActionType} from "../../../state/crud-page/form-action-type";
import DocumentSpaceMySettingsForm from "../DocumentSpaceMySettingsForm";
import React from "react";
import {waitFor} from "@testing-library/dom";

jest.mock('../../../state/document-space/document-space-state');
jest.mock('../../../state/authorized-user/authorized-user-state');

describe('Test Document SpaceMySettingsForm', () => {
  const documentSpaces: DocumentSpaceResponseDto[] = [
    {
      id: 'id1',
      name: 'space1',
    },
    {
      id: 'id2',
      name: 'space2',
    },
    {
      id: 'id3',
      name: 'space3',
    }
  ];

  const getSpacesResponse: AxiosResponse<DocumentSpaceResponseDtoResponseWrapper> = createAxiosSuccessResponse({ data: documentSpaces });

  let documentSpacesState: State<DocumentSpaceResponseDto[]> & StateMethodsDestroy;
  let documentSpaceApi: DocumentSpaceControllerApiInterface;
  let documentSpaceService: DocumentSpaceService;

  let membershipService: DocumentSpaceMembershipService;

  let authorizedUserState: State<DashboardUserDto | undefined> & StateMethodsDestroy;
  let dashboardUserApi: DashboardUserControllerApi;
  let authorizedUserService: AuthorizedUserService;

  beforeEach(() => {
    documentSpacesState = createState<DocumentSpaceResponseDto[]>([]);
    documentSpaceApi = new DocumentSpaceControllerApi();
    documentSpaceService = new DocumentSpaceService(documentSpaceApi, documentSpacesState);

    membershipService = new DocumentSpaceMembershipService(documentSpaceApi);

    authorizedUserState = createState<DashboardUserDto | undefined>({defaultDocumentSpaceId:'id3'});
    dashboardUserApi = new DashboardUserControllerApi();
    authorizedUserService = new AuthorizedUserService(authorizedUserState, dashboardUserApi);

    (useAuthorizedUserState as jest.Mock).mockReturnValue(authorizedUserService);
    (useDocumentSpaceState as jest.Mock).mockReturnValue(documentSpaceService);
    (documentSpaceMembershipService as jest.Mock).mockReturnValue(membershipService);
  });

  it('should show available documentSpaces', async() => {
    const page = render(
      <MemoryRouter>
        <DocumentSpaceMySettingsForm
          onCancel={jest.fn()}
          onSubmit={jest.fn()}
          isFormSubmitting={false}
          formActionType={FormActionType.SAVE}
          documentSpaces={documentSpaces}
          authorizedUserService={authorizedUserService}
        />
      </MemoryRouter>
    );

    const space1 = page.queryByText('space1');
    const space2 = page.queryByText('space2');
    const space3 = page.queryByText('space3');
    await waitFor(()=> expect(space1).toBeInTheDocument())
    await waitFor(()=> expect(space2).toBeInTheDocument())
    await waitFor(()=> expect(space3).toBeInTheDocument())
  });

  it('should show default documentSpace as selected', async() => {
    const page = render(
      <MemoryRouter>
        <DocumentSpaceMySettingsForm
          onCancel={jest.fn()}
          onSubmit={jest.fn()}
          isFormSubmitting={false}
          formActionType={FormActionType.SAVE}
          documentSpaces={documentSpaces}
          authorizedUserService={authorizedUserService}
        />
      </MemoryRouter>
    );

    const space1Value = page.queryByTestId('id1-false');
    const space2Value = page.queryByTestId('id2-false');
    const space3Value = page.queryByTestId('id3-true');
    await waitFor(()=> expect(space1Value).toBeInTheDocument())
    await waitFor(()=> expect(space2Value).toBeInTheDocument())
    await waitFor(()=> expect(space3Value).toBeInTheDocument())
  });


  it('should select value when clicked', async() => {
    const page = render(
      <MemoryRouter>
        <DocumentSpaceMySettingsForm
          onCancel={jest.fn()}
          onSubmit={jest.fn()}
          isFormSubmitting={false}
          formActionType={FormActionType.SAVE}
          documentSpaces={documentSpaces}
          authorizedUserService={authorizedUserService}
        />
      </MemoryRouter>
    );

    const space1Value = page.queryByTestId('id1-false');
    const space2Value = page.queryByTestId('id2-false');
    const space3Value = page.queryByTestId('id3-true');
    await waitFor(()=> expect(space1Value).toBeInTheDocument())
    await waitFor(()=> expect(space2Value).toBeInTheDocument())
    await waitFor(()=> expect(space3Value).toBeInTheDocument())
    act(()=>{
      fireEvent.click(space2Value!)
    })
    const updatedSpace1Value = page.queryByTestId('id1-false');
    const updatedSpace2Value = page.queryByTestId('id2-true');
    const updatedSpace3Value = page.queryByTestId('id3-false');
    await waitFor(()=> expect(updatedSpace1Value).toBeInTheDocument())
    await waitFor(()=> expect(updatedSpace2Value).toBeInTheDocument())
    await waitFor(()=> expect(updatedSpace3Value).toBeInTheDocument())
  });


  it('should call onCancel when clicked', async() => {
    const onCancel = jest.fn()
    const page = render(
      <MemoryRouter>
        <DocumentSpaceMySettingsForm
          onCancel={onCancel}
          onSubmit={jest.fn()}
          isFormSubmitting={false}
          formActionType={FormActionType.SAVE}
          documentSpaces={documentSpaces}
          authorizedUserService={authorizedUserService}
        />
      </MemoryRouter>
    );

    const cancelButton = page.getByText('Cancel');

    expect(cancelButton).toBeInTheDocument()
    fireEvent.click(cancelButton)
    expect(onCancel).toBeCalled()
  });

  it('should disable the save button when no change has been made', async() => {
    const onSave = jest.fn()
    const page = render(
      <MemoryRouter>
        <DocumentSpaceMySettingsForm
          onCancel={jest.fn()}
          onSubmit={onSave}
          isFormSubmitting={false}
          formActionType={FormActionType.SAVE}
          documentSpaces={documentSpaces}
          authorizedUserService={authorizedUserService}
        />
      </MemoryRouter>
    );

    const saveButton = page.getByText('Save');

    expect(saveButton).toBeInTheDocument()
    expect(saveButton).toBeDisabled()
    fireEvent.click(saveButton)
    expect(onSave).not.toBeCalled()
  });

  it('should call save button when selected option has been changed', async() => {
    const onSave = jest.fn()
    const page = render(
      <MemoryRouter>
        <DocumentSpaceMySettingsForm
          onCancel={jest.fn()}
          onSubmit={onSave}
          isFormSubmitting={false}
          formActionType={FormActionType.SAVE}
          documentSpaces={documentSpaces}
          authorizedUserService={authorizedUserService}
        />
      </MemoryRouter>
    );

    const saveButton = page.getByText('Save');

    expect(saveButton).toBeInTheDocument()
    expect(saveButton).toBeDisabled()
    const space2Value = page.queryByTestId('id2-false');
    await waitFor(()=> expect(space2Value).toBeInTheDocument())
    act(()=>{
      fireEvent.click(space2Value!)
    })
    const updatedSpace2Value = page.queryByTestId('id2-true');
    await waitFor(()=> expect(updatedSpace2Value).toBeInTheDocument())

    fireEvent.click(saveButton)
    expect(onSave).toBeCalled()
  });



});
