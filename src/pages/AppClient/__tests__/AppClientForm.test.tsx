import { createState, State, StateMethodsDestroy, useState } from '@hookstate/core';
import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { DataCrudFormErrors } from '../../../components/DataCrudFormPage/data-crud-form-errors';
import { DataCrudSuccessAction } from '../../../components/DataCrudFormPage/data-crud-success-action';
import { AppClientControllerApi, AppClientControllerApiInterface } from '../../../openapi/apis/app-client-controller-api';
import { PrivilegeDto } from '../../../openapi/models/privilege-dto';
import { AppClientFlat } from '../../../state/app-clients/app-client-flat';
import AppClientsService from '../../../state/app-clients/app-clients-service';
import { useAppClientsState, wrapState } from '../../../state/app-clients/app-clients-state';
import { FormActionType } from '../../../state/crud-page/form-action-type';
import { PrivilegeType } from '../../../state/privilege/privilege-type';
import { validationErrors } from '../../../utils/validation-utils';
import AppClientForm from '../AppClientForm';

jest.mock("../../../state/app-clients/app-clients-state");

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
})
