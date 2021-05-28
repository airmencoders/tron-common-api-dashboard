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
import { SubscriberDto, SubscriberDtoSubscribedEventEnum } from '../../openapi';
import { FormActionType } from '../../state/crud-page/form-action-type';
import { getEnumKeyByEnumValue } from '../../utils/enum-utils';
import { failsHookstateValidation, generateStringErrorMessages, validateRequiredString, validateStringLength, validationErrors } from '../../utils/validation-utils';

function PubSubForm(props: CreateUpdateFormProps<SubscriberDto>) {
  const formState = useState({ ...props.data });

  formState.attach(Validation);
  formState.attach(Initial);
  formState.attach(Touched);

  Validation(formState.subscriberAddress).validate(validateRequiredString, validationErrors.requiredText, 'error');
  Validation(formState.subscriberAddress).validate(validateStringLength, validationErrors.generateStringLengthError(), 'error');

  Validation(formState.subscribedEvent).validate(event => 
    Object.values(SubscriberDtoSubscribedEventEnum).includes(event as SubscriberDtoSubscribedEventEnum), 
    'Invalid Value', 
    'error');

  function isFormModified() {
    return Initial(formState.subscribedEvent).modified() || Initial(formState.subscriberAddress).modified();
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

  return (
    <Form className="subscriber-form" onSubmit={(event) => submitForm(event)} data-testid="subscriber-form">
      {props.formActionType === FormActionType.UPDATE &&
        <FormGroup
          labelName="uuid"
          labelText="UUID"
          isError={false}
        >
          <TextInput
            id="uuid"
            name="uuid"
            type="text"
            defaultValue={formState.id.get()}
            disabled={true}
          />
        </FormGroup>
      }

      <FormGroup
        labelName="subscriberAddress"
        labelText="Subscriber URL"
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
          id="subscriptionEvents"
          name="events"
          defaultValue={formState?.subscribedEvent.get() || ''}
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
