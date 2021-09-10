import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { AxiosResponse } from 'axios';
import React from 'react';
import { DataCrudFormErrors } from '../../../components/DataCrudFormPage/data-crud-form-errors';
import { DataCrudSuccessAction } from '../../../components/DataCrudFormPage/data-crud-success-action';
import { EventRequestLogControllerApi, EventRequestLogControllerApiInterface, EventRequestLogDtoEventTypeEnum, EventRequestLogDtoPaginationResponseWrapper } from '../../../openapi';
import { AppClientControllerApi, AppClientControllerApiInterface } from '../../../openapi/apis/app-client-controller-api';
import { PrivilegeDto } from '../../../openapi/models/privilege-dto';
import { AppClientFlat } from '../../../state/app-clients/app-client-flat';
import AppClientsService from '../../../state/app-clients/app-clients-service';
import { useAppClientsState, wrapState } from '../../../state/app-clients/app-clients-state';
import { FormActionType } from '../../../state/crud-page/form-action-type';
import EventRequestLogService from '../../../state/event-request-log/event-request-log-service';
import { useEventRequestLogState } from '../../../state/event-request-log/event-request-log-state';
import { PrivilegeType } from '../../../state/privilege/privilege-type';
import { createAxiosSuccessResponse } from '../../../utils/TestUtils/test-utils';
import { validationErrors } from '../../../utils/validation-utils';
import AppClientForm from '../AppClientForm';

jest.mock("../../../state/app-clients/app-clients-state");
jest.mock('../../../state/event-request-log/event-request-log-state');

describe('Test App Client Form', () => {
  let onSubmit = jest.fn();
  let onClose = jest.fn();
  let successAction: DataCrudSuccessAction | undefined;
  let client: AppClientFlat;

  let counter = 0;
  const privilegeDtos: PrivilegeDto[] = Object.values(PrivilegeType).map((item : any) => ({id: counter++, name: item }));   
  const initialAppClientState: AppClientFlat[] = [
    {
      id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
      name: "Test App Client 1",
      clusterUrl: '',
    },
    {
      id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd9",
      name: "Test App Client 2",
      clusterUrl: '',
    }
  ];

  let privilegeState: State<PrivilegeDto[]> & StateMethodsDestroy;
  let appClientState: State<AppClientFlat[]> & StateMethodsDestroy;
  let appClientApi: AppClientControllerApiInterface;
  let wrappedState: AppClientsService;
  let eventRequestLogApi: EventRequestLogControllerApiInterface;

  beforeEach(() => {
    onSubmit = jest.fn().mockImplementation(() => { });

    onClose = jest.fn().mockImplementation(() => { });

    successAction = {
      success: false,
      successMsg: ''
    };

    client = {
      id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
      name: 'test',
      clusterUrl: '',
      personCreate: true,
      allPrivs: [ { id: 10, name: 'PERSON_CREATE'} ]
    };

    appClientState = createState<AppClientFlat[]>([...initialAppClientState]);
    privilegeState = createState<PrivilegeDto[]>(privilegeDtos);
    appClientApi = new AppClientControllerApi();
    wrappedState = wrapState(appClientState, appClientApi, privilegeState);

    function mockAppClientState() {
      (useAppClientsState as jest.Mock).mockReturnValue(new AppClientsService(appClientState, appClientApi, privilegeState));
      jest.spyOn(useAppClientsState(), 'isPromised', 'get').mockReturnValue(true);
    }
    mockAppClientState();

    eventRequestLogApi = new EventRequestLogControllerApi();
    (useEventRequestLogState as jest.Mock).mockReturnValue(new EventRequestLogService(eventRequestLogApi));
  });

  it('Update', async () => {


    successAction = undefined;

    const pageRender = render(
      <AppClientForm 
        onClose={onClose} 
        data={client} 
        onSubmit={onSubmit} 
        formActionType={FormActionType.UPDATE} 
        isSubmitting={false} 
        successAction={successAction} 
      />
    );

    const elem = pageRender.getByTestId('app-client-form');
    expect(elem).toBeInTheDocument();

    const nameInput = pageRender.getByDisplayValue(client.name);
    fireEvent.change(nameInput, { target: { value: 'Test 2' } });
    expect(nameInput).toHaveValue('Test 2');

    fireEvent.click(pageRender.getByText("Person Entity Permissions"));
    await waitFor(() => expect(pageRender.getByTestId('person-privileges')).toBeInTheDocument());

    const personCreateCheckbox = pageRender.getByTestId('PERSON_CREATE');
    fireEvent.click(personCreateCheckbox);
    expect(personCreateCheckbox).not.toBeChecked();

    fireEvent.click(pageRender.getByText("Organization Entity Permissions"));
    await waitFor(() => expect(pageRender.getByTestId('organization-privileges')).toBeInTheDocument());

    const organizationCreateCheckbox = pageRender.getByTestId('ORGANIZATION_CREATE');
    fireEvent.click(organizationCreateCheckbox);
    expect(organizationCreateCheckbox).toBeChecked();

    fireEvent.click(pageRender.getByText('Update'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('Update - no app client', async () => {
    const pageRender = render(
      <AppClientForm 
        onSubmit={onSubmit} 
        onClose={onClose} 
        successAction={successAction} 
        isSubmitting={false} 
        formActionType={FormActionType.UPDATE} 
      />
    );

    const nameInput = pageRender.getByLabelText('Name');
    expect(nameInput).toHaveValue('');
  });

  it('Client-side Validation', () => {
    const pageRender = render(
      <AppClientForm 
        onClose={onClose} 
        data={client} 
        onSubmit={onSubmit} 
        formActionType={FormActionType.UPDATE} 
        isSubmitting={false} 
        successAction={successAction} 
      />
    );

    const elem = pageRender.getByTestId('app-client-form');
    expect(elem).toBeInTheDocument();

    const nameInput = pageRender.getByDisplayValue(client.name);
    fireEvent.change(nameInput, { target: { value: '' } });
    expect(nameInput).toHaveValue('');
    expect(pageRender.getByText(new RegExp(validationErrors.requiredText)));
  });

  it('Server-side Validation', () => {
    const nameValidation: string = 'name validation';
    const generalError: string = 'some error';
    const errors: DataCrudFormErrors = {
      validation: {
        name: nameValidation
      },
      general: generalError
    };

    const pageRender = render(
      <AppClientForm onClose={onClose} formErrors={errors} data={client} onSubmit={onSubmit} formActionType={FormActionType.UPDATE} isSubmitting={false} successAction={successAction} />
    );

    const elem = pageRender.getByTestId('app-client-form');
    expect(elem).toBeInTheDocument();

    expect(pageRender.getByText(new RegExp(nameValidation)));
    expect(pageRender.getByText(new RegExp(generalError)));
  });

  it('Success message', () => {
    successAction = {
      success: true,
      successMsg: 'Success message'
    };

    const pageRender = render(
      <AppClientForm onClose={onClose} data={client} onSubmit={onSubmit} formActionType={FormActionType.UPDATE} isSubmitting={false} successAction={successAction} />
    );

    const elem = pageRender.getByTestId('app-client-form');
    expect(elem).toBeInTheDocument();

    expect(pageRender.getByText(successAction.successMsg));
  });

  it('Adds a developer email', async () => {
    const pageRender = render(
      <AppClientForm 
        onClose={onClose} 
        data={client} 
        onSubmit={onSubmit} 
        formActionType={FormActionType.UPDATE} 
        isSubmitting={false} 
      />
    );

    const button = pageRender.getByTestId('app-client-developer__add-btn');
    expect(button).toBeInTheDocument();

    const field = pageRender.getByTestId('app-client-developer-field');
    expect(field).toBeInTheDocument();
    fireEvent.change(field, { target: { value: 'joe@test.com'}});
    await waitFor(() => { 
      expect(button).not.toBeDisabled();
    });

    fireEvent.click(button);

    await waitFor(() => { 
      expect(field).toHaveValue('');
    });

    await waitFor(() => {
      expect(pageRender.getByText('joe@test.com')).toBeInTheDocument();
    });

    const row = pageRender.getByText('joe@test.com');
    fireEvent.click(row);

    await waitFor(() => {
      expect(pageRender.getByText('joe@test.com')).toBeInTheDocument();
    });

  });

  it('should show Event Request Log modal', () => {
    const pageRender = render(
      <AppClientForm
        onClose={onClose}
        data={client}
        onSubmit={onSubmit}
        formActionType={FormActionType.UPDATE}
        isSubmitting={false}
        successAction={successAction}
      />
    );

    const eventRequestLogResponse: AxiosResponse<EventRequestLogDtoPaginationResponseWrapper> = createAxiosSuccessResponse({
      data: [
        {
          appClientUser: {
            id: client.id,
            name: "guardianangel"
          },
          eventType: EventRequestLogDtoEventTypeEnum.OrganizationChange,
          eventCount: 523,
          wasSuccessful: false,
          reason: "Event request to recipient failed: 404 NOT_FOUND",
          lastAttempted: "2021-09-03T12:56:44.482Z"
        }
      ],
      pagination: {
        page: 0,
        size: 1,
        totalElements: 29,
        totalPages: 15,
        links: {
          next: "http://localhost:8888/api/v2/event-request-log/all?page=1&size=2",
          last: "http://localhost:8888/api/v2/event-request-log/all?page=14&size=2"
        }
      }
    });

    eventRequestLogApi.getEventRequestLogsByAppClientId = jest.fn(() => {
      return Promise.resolve(eventRequestLogResponse);
    });

    const viewLogsBtn = pageRender.getByText('View Event Logs');
    expect(viewLogsBtn).toBeInTheDocument();
    fireEvent.click(viewLogsBtn);

    expect(pageRender.getByText('Event Request Logs')).toBeInTheDocument();
  });
})
