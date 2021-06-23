import { useState } from '@hookstate/core';
import { Initial } from "@hookstate/initial";
import { Touched } from "@hookstate/touched";
import { Validation } from "@hookstate/validation";
import React, { ChangeEvent, FormEvent } from 'react';
import { CreateUpdateFormProps } from '../../components/DataCrudFormPage/CreateUpdateFormProps';
import Form from "../../components/forms/Form/Form";
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import Select from '../../components/forms/Select/Select';
import SubmitActions from '../../components/forms/SubmitActions/SubmitActions';
import SuccessErrorMessage from '../../components/forms/SuccessErrorMessage/SuccessErrorMessage';
import TextInput from "../../components/forms/TextInput/TextInput";
import TextInputInline from "../../components/forms/TextInput/TextInputInline";
import { SubscriberDto, SubscriberDtoSubscribedEventEnum } from '../../openapi';
import { AppClientFlat } from '../../state/app-clients/app-client-flat';
import { useAppClientsState } from '../../state/app-clients/app-clients-state';
import { FormActionType } from '../../state/crud-page/form-action-type';
import { getEnumKeyByEnumValue } from '../../utils/enum-utils';
import { failsHookstateValidation, generateStringErrorMessages, validateRequiredString, validateStringLength, validateSubscriberAddress, validationErrors } from '../../utils/validation-utils';
import {CopyToClipboard} from '../../components/CopyToClipboard/CopyToClipboard';

function PubSubForm(props: CreateUpdateFormProps<SubscriberDto>) {
  const appClientsAvail = useAppClientsState().appClients;
  const formState = useState({ 
    ...props.data, 
    appClientUser: props.data?.appClientUser ?? (appClientsAvail[0]?.name ?? ''),
    subscribedEvent: props.data?.subscribedEvent ?? Object.values(SubscriberDtoSubscribedEventEnum)[0]
  });  

  formState.attach(Validation);
  formState.attach(Initial);
  formState.attach(Touched);

  if (props.formActionType == FormActionType.ADD) {
    Validation(formState.secret).validate(validateRequiredString, validationErrors.requiredText, 'error');
    Validation(formState.secret).validate(validateStringLength, validationErrors.generateStringLengthError(), 'error');
  }


  function isFormModified() {
    if (props.formActionType === FormActionType.ADD) {
      return Initial(formState.subscriberAddress).modified() && Initial(formState.secret).modified();
    }
    else {
      return Initial(formState.subscriberAddress).modified() || Initial(formState.subscribedEvent).modified()
        || Initial(formState.appClientUser).modified();
    }
  }

  function isFormDisabled() {
    return props.successAction?.success;
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    props.onSubmit(formState.get() as SubscriberDto);
  }

  const onEventChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const stringVal = event.target.value;
    const eventEnumKey = getEnumKeyByEnumValue(SubscriberDtoSubscribedEventEnum, stringVal);
    if (eventEnumKey == null) {
      throw new Error('Selected event is not part of enum.');
    }
    const eventEnum = SubscriberDtoSubscribedEventEnum[eventEnumKey];
    formState.subscribedEvent.set(eventEnum);
  }

  const onAppClientChange = (event: ChangeEvent<HTMLSelectElement>) => {
    formState.appClientUser.set(event.target.value);
  }

  return (
    <Form className="subscriber-form" onSubmit={(event) => submitForm(event)} data-testid="subscriber-form">
      {props.formActionType === FormActionType.UPDATE &&
        <FormGroup
          labelName="uuid"
          labelText="UUID"
          isError={false}
        >
          <TextInputInline
            id="uuid"
            name="uuid"
            type="text"
            defaultValue={formState.id.get()}
            disabled={true}
            className={'tron-text-input-inline'}
          />
          <CopyToClipboard text={String(formState.id.get())} />
        </FormGroup>
      }

      <FormGroup
        labelName="appclients"
        labelText="Choose App Client"
        required
      >
        <Select
          id="appclients"
          name="appclients"
          defaultValue={formState?.appClientUser.get() || '' }
          onChange={onAppClientChange}
          disabled={isFormDisabled()}
        >
          {
            appClientsAvail.map((app) => {
                return <option key={app.name} value={app.name}>{app.name}</option>
            })
          }
        </Select>        
      </FormGroup>
      
      <FormGroup
        labelName="subscriberAddress"
        labelText="Subscriber Endpoint Relative Path (e.g. /api/event)"
        isError={failsHookstateValidation(formState.subscriberAddress)}
        errorMessages={generateStringErrorMessages(formState.subscriberAddress)}
        required
      >
        <TextInput
          id="subscriberAddress"
          name="subscriberAddress"
          type="text"
          defaultValue={formState.subscriberAddress.get()}
          error={failsHookstateValidation(formState.subscriberAddress)}
          onChange={(event) => formState.subscriberAddress.set(event.target.value)}
          disabled={isFormDisabled()}
        />
      </FormGroup>

      <FormGroup
        labelName="events"
        labelText="Subscribed Event"
        required
      >
        <Select
          id="events"
          name="events"
          defaultValue={formState?.subscribedEvent.get() || Object.values(SubscriberDtoSubscribedEventEnum)[0] }
          onChange={onEventChange}
          disabled={isFormDisabled()}
        >
          {
            Object.values(SubscriberDtoSubscribedEventEnum).map((name) => {
                return <option key={name} value={name}>{name}</option>
            })
          }
        </Select>        
      </FormGroup>

      { props.formActionType === FormActionType.ADD &&
        <FormGroup
          labelName="secretPhrase"
          labelText="Secret"
          isError={failsHookstateValidation(formState.secret)}
          errorMessages={generateStringErrorMessages(formState.secret)}
          required
        >
          <TextInput
            id="secretPhrase"
            name="secretPhrase"
            type="password"
            defaultValue={formState.secret.get()}
            error={failsHookstateValidation(formState.secret)}
            onChange={(event) => formState.secret.set(event.target.value)}
            disabled={isFormDisabled()}
          />
        </FormGroup>
      }

      <SuccessErrorMessage
        successMessage={props.successAction?.successMsg}
        errorMessage={props.formErrors?.general || ''}
        showErrorMessage={props.formErrors?.general != null}
        showSuccessMessage={props.successAction != null && props.successAction?.success}
        showCloseButton={true}
        onCloseClicked={props.onClose}
      />
      {
        props.successAction == null &&
        <SubmitActions
          formActionType={props.formActionType}
          onCancel={props.onClose}
          onSubmit={submitForm}
          isFormValid={Validation(formState).valid()}
          isFormModified={isFormModified()}
          isFormSubmitting={props.isSubmitting}
        />
      }
    </Form>
  );
}

export default PubSubForm;
