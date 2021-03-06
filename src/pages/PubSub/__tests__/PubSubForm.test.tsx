import React from 'react';
import {fireEvent, render} from '@testing-library/react';
import {useAppClientsState} from '../../../state/app-clients/app-clients-state';
import {PrivilegeType} from '../../../state/privilege/privilege-type';
import AppClientsService from '../../../state/app-clients/app-clients-service';
import PubSubForm from '../PubSubForm';
import {FormActionType} from '../../../state/crud-page/form-action-type';
import {DataCrudSuccessAction} from '../../../components/DataCrudFormPage/data-crud-success-action';
import {DataCrudFormErrors} from '../../../components/DataCrudFormPage/data-crud-form-errors';
import {
  AppClientControllerApi,
  AppClientControllerApiInterface,
  PrivilegeDto,
  SubscriberDtoSubscribedEventEnum
} from '../../../openapi';
import {createState, State, StateMethodsDestroy} from '@hookstate/core';
import {AppClientFlat} from '../../../state/app-clients/app-client-flat';
import {PubSubCollection} from "../../../state/pub-sub/pubsub-service";

jest.mock('../../../state/app-clients/app-clients-state');

describe('Test Subscriber Form', () => {
  let onSubmit = jest.fn();
  let onClose = jest.fn();
  let successAction: DataCrudSuccessAction | undefined;
  let data: PubSubCollection;
  let formErrors: DataCrudFormErrors;

  let appClientState: State<AppClientFlat[]> & StateMethodsDestroy;
  let appClientApi: AppClientControllerApiInterface;
  let privilegeState: State<PrivilegeDto[]> & StateMethodsDestroy;

  beforeEach(() => {
    onSubmit = jest.fn().mockImplementation(() => {

    });

    onClose = jest.fn().mockImplementation(() => {

    });

    data = {
      id: "1",
      appClientUser: "App1",
      events: [SubscriberDtoSubscribedEventEnum.PersonChange],
      subscriberAddress: "http://app.app.svc.cluster.local/",
      secret: "",
    }

    successAction = {
      success: false,
      successMsg: ''
    };

    formErrors = {
      validation: undefined,
      general: undefined
    }

    let counter = 0;
    appClientState = createState<AppClientFlat[]>([ { name: "App1", clusterUrl: '', id: '11', orgCreate: false, orgEdit: false, personRead: true}]);
    privilegeState = createState<PrivilegeDto[]>(Object.values(PrivilegeType).map((item : any) => ({id: counter++, name: item })));
    appClientApi = new AppClientControllerApi();

    function mockAppClientState() {
      (useAppClientsState as jest.Mock).mockReturnValue(new AppClientsService(appClientState, appClientApi, privilegeState));
      jest.spyOn(useAppClientsState(), 'error', 'get').mockReturnValue(undefined);
      jest.spyOn(useAppClientsState(), 'isPromised', 'get').mockReturnValue(false);
    }
    mockAppClientState();
  });



  it('Create', async () => {

    successAction = undefined;
    const pageRender = render(
      <PubSubForm
        data={data}
        formErrors={formErrors}
        onSubmit={onSubmit}
        onClose={onClose}
        successAction={successAction}
        isSubmitting={false}
        formActionType={FormActionType.ADD}
      />
    );

    const elem = pageRender.getByTestId('subscriber-form');
    expect(elem).toBeInTheDocument();

    const appClient = await pageRender.getByLabelText('Choose App Client', {selector: 'select'});
    fireEvent.change(appClient, { target: { value: 'App1' }});

    const subscriberAddress = pageRender.getByLabelText(/Subscriber Endpoint Relative Path/);
    fireEvent.change(subscriberAddress, { target: { value: 'http://app2.app2.svc.cluster.local/' } });
    expect(subscriberAddress).toHaveValue('http://app2.app2.svc.cluster.local/');

    const subscribedEvent = pageRender.getByLabelText('PERSON_DELETE');
    fireEvent.click(subscribedEvent);
    expect(subscribedEvent).toBeChecked();

    const secret = await pageRender.getByLabelText('Secret');
    fireEvent.change(secret, { target: { value: 'test' }});

    fireEvent.click(pageRender.getByText(/^Add$/i));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('Update', async () => {
    successAction = undefined;
    const pageRender = render(
      <PubSubForm
        data={data}
        formErrors={formErrors}
        onSubmit={onSubmit}
        onClose={onClose}
        successAction={successAction}
        isSubmitting={false}
        formActionType={FormActionType.UPDATE}
      />
    );

    const elem = pageRender.getByTestId('subscriber-form');
    expect(elem).toBeInTheDocument();

    const subscriberAddress = pageRender.getByDisplayValue(data.subscriberAddress!);
    fireEvent.change(subscriberAddress, { target: { value: 'http://app2.app2.svc.cluster.local/' } });
    expect(subscriberAddress).toHaveValue('http://app2.app2.svc.cluster.local/');

    const subscribedEvent = pageRender.getByLabelText('PERSON_DELETE');
    fireEvent.click(subscribedEvent);
    expect(subscribedEvent).toBeChecked();

    fireEvent.click(pageRender.getByText(/Update/i));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('Success message', () => {
    successAction = {
      success: true,
      successMsg: 'Success message'
    };

    const pageRender = render(
      <PubSubForm
        data={data}
        formErrors={formErrors}
        onSubmit={onSubmit}
        onClose={onClose}
        successAction={successAction}
        isSubmitting={false}
        formActionType={FormActionType.UPDATE}
      />
    );

    const elem = pageRender.getByTestId('subscriber-form');
    expect(elem).toBeInTheDocument();

    expect(pageRender.getByText(successAction.successMsg));
  });
})
