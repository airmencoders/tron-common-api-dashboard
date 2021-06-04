import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import PubSubForm from '../PubSubForm';
import { FormActionType } from '../../../state/crud-page/form-action-type';
import { DataCrudSuccessAction } from '../../../components/DataCrudFormPage/data-crud-success-action';
import { DataCrudFormErrors } from '../../../components/DataCrudFormPage/data-crud-form-errors';
import { SubscriberDto, SubscriberDtoSubscribedEventEnum } from '../../../openapi';

describe('Test Subscriber Form', () => {
  let onSubmit = jest.fn();
  let onClose = jest.fn();
  let successAction: DataCrudSuccessAction | undefined;
  let data: SubscriberDto;
  let formErrors: DataCrudFormErrors;

  beforeEach(() => {
    onSubmit = jest.fn().mockImplementation(() => {

    });

    onClose = jest.fn().mockImplementation(() => {

    });

    data = {
        id: "dd05272f-aeb8-4c58-89a8-e5c0b2f48dd8",
        subscribedEvent: SubscriberDtoSubscribedEventEnum.PersonChange,
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

    const subscriberAddress = pageRender.getByLabelText(/Subscriber Endpoint Relative Path/);
    fireEvent.change(subscriberAddress, { target: { value: 'http://app2.app2.svc.cluster.local/' } });
    expect(subscriberAddress).toHaveValue('http://app2.app2.svc.cluster.local/');

    const subscribedEvent = await pageRender.getByLabelText('Subscribed Event', {selector: 'select'});
    fireEvent.change(subscribedEvent, { target: { value: SubscriberDtoSubscribedEventEnum.PersonDelete }});

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

    const subscriberAddress = pageRender.getByDisplayValue(data.subscriberAddress);
    fireEvent.change(subscriberAddress, { target: { value: 'http://app2.app2.svc.cluster.local/' } });
    expect(subscriberAddress).toHaveValue('http://app2.app2.svc.cluster.local/');

    const subscribedEvent = await pageRender.getByLabelText('Subscribed Event', {selector: 'select'});
    fireEvent.change(subscribedEvent, { target: { value: SubscriberDtoSubscribedEventEnum.PersonDelete }});

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
