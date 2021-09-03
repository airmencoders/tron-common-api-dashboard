import {useHookstate, useState} from '@hookstate/core';
import {Initial} from "@hookstate/initial";
import {Touched} from "@hookstate/touched";
import {Validation} from "@hookstate/validation";
import React, {ChangeEvent, FormEvent, useEffect} from 'react';
import {CreateUpdateFormProps} from '../../components/DataCrudFormPage/CreateUpdateFormProps';
import Form from "../../components/forms/Form/Form";
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import Select from '../../components/forms/Select/Select';
import SubmitActions from '../../components/forms/SubmitActions/SubmitActions';
import SuccessErrorMessage from '../../components/forms/SuccessErrorMessage/SuccessErrorMessage';
import TextInput from "../../components/forms/TextInput/TextInput";
import {SubscriberDtoSubscribedEventEnum} from '../../openapi';
import {useAppClientsState} from '../../state/app-clients/app-clients-state';
import {FormActionType} from '../../state/crud-page/form-action-type';
import {
  failsHookstateValidation,
  generateStringErrorMessages,
  validateRequiredString,
  validateStringLength,
  validationErrors
} from '../../utils/validation-utils';
import {PubSubCollection} from "../../state/pub-sub/pubsub-service";
import Checkbox from "../../components/forms/Checkbox/Checkbox";
import {AppClientFlat} from "../../state/app-clients/app-client-flat";
import {useSubscriptionState} from "../../state/pub-sub/pubsub-state";

function PubSubForm(props: CreateUpdateFormProps<PubSubCollection>) {
  const pubSubState = useSubscriptionState();
  const appClientsAvail = useAppClientsState().appClients;
  const newSecretCheckBox = useHookstate(props.formActionType == FormActionType.ADD);
  const formState = useState<PubSubCollection>({
    appClientUser: props.data?.appClientUser ?? '',
    events: props.data?.events,
    subscriberAddress: props.data?.subscriberAddress ?? '',
    secret: '',
  });  

  formState.attach(Validation);
  formState.attach(Initial);
  formState.attach(Touched);

  useEffect(() => {
    if (formState.appClientUser.get() === '') {
      formState.appClientUser.set(getFirstValidAppClient()[0].name);
    }
  }, []);

  if (props.formActionType == FormActionType.ADD) {
    Validation(formState.secret)
      .validate((value) => validateRequiredString(value), validationErrors.requiredText, 'error');
    Validation(formState.secret)
      .validate((value) => validateStringLength(value), validationErrors.generateStringLengthError(), 'error');
  }
  else if (props.formActionType == FormActionType.UPDATE) {
    Validation(formState.secret)
      .validate((value) => validateRequiredString(value) || !newSecretCheckBox.get(), validationErrors.requiredText, 'error');
    Validation(formState.secret)
      .validate((value) => validateStringLength(value) || !newSecretCheckBox.get(), validationErrors.generateStringLengthError(), 'error');
    Validation(formState.events)
      .validate((value: SubscriberDtoSubscribedEventEnum[] | undefined) => !!(value && (value.length > 0)), 'Must have at least one subscription', 'error');
  }


  function isFormModified() {
    if (props.formActionType === FormActionType.ADD) {
      return Initial(formState.subscriberAddress).modified()
        && Initial(formState.secret).modified()
        && Initial(formState.events).modified()
    }
    else {
      return Initial(formState.subscriberAddress).modified()
        || Initial(formState.events).modified()
        || Initial(formState.appClientUser).modified()
        || Initial(formState.events).modified()
        || (Initial(formState.secret).modified() || newSecretCheckBox.get())
    }
  }

  function isFormDisabled() {
    return props.successAction?.success;
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    props.onSubmit(formState.get());
  }

  const onAppClientChange = (event: ChangeEvent<HTMLSelectElement>) => {
    formState.appClientUser.set(event.target.value);
  }

  // tell if current app client has some sort of read priv
  const getAppClientHasReadPrivs = () : boolean => {
    const appClient = appClientsAvail // find the DTO based on App Client name
        .find(elem => elem.name === formState.appClientUser.value);

    return (appClient?.orgRead ?? false) || (appClient?.personRead ?? false);
  }

  const filterOutIneligibleEvents = (item: SubscriberDtoSubscribedEventEnum) : boolean | undefined => {
    const entityType = item.split('_')[0].startsWith('SUB') ? 'ORGANIZATION' : item.split('_')[0];  
    const appClient = appClientsAvail // find the DTO based on App Client name
      .find(elem => elem.name === formState.appClientUser.value);

    switch (entityType) {
      case 'ORGANIZATION':
        return appClient?.orgRead;
      case 'PERSON':
        return appClient?.personRead;
      default:
        return false;
    }    
  }

  const checkAppClientIsAvailable = (appClientName: string) : boolean | undefined => {
    return pubSubState.state.get()?.filter(item => item.appClientUser === appClientName).length === 0
  }

  const addRemoveSubscribedEvent = (event: SubscriberDtoSubscribedEventEnum, add: boolean) : void => {
    if (add && !formState.events.get()?.includes(event)) {
      formState.events.set([...(formState.events.get() ?? []), event]);
    }
    else {
      // remove element - if its there
      if (formState.events.get() === undefined) return;
      const index = formState.events.get()!.indexOf(event);
      if (index !== -1) {
        const newEvents = [...formState.events.get()!];
        newEvents.splice(index, 1);
        formState.events.set([...newEvents]);
      }
    }
  }

  const getFirstValidAppClient = () : AppClientFlat[] => {
    return appClientsAvail
      .filter(item => item.orgRead || item.personRead)  // app client should have at least some sort of read privilege
      .filter(item => props.formActionType == FormActionType.UPDATE || checkAppClientIsAvailable(item.name)) // and not already have a subscription entry
  }

  return (
    <Form className="subscriber-form" onSubmit={(event) => submitForm(event)} data-testid="subscriber-form">
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
          disabled={isFormDisabled() || props.formActionType == FormActionType.UPDATE}
        >
          {
            getFirstValidAppClient()
              .map((app: AppClientFlat) => {
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
        labelText="Subscribed Event(s)"
        isError={failsHookstateValidation(formState.events)}
        errorMessages={generateStringErrorMessages(formState.events)}
        required
      >
        {
          getAppClientHasReadPrivs() ?
            Object.values(SubscriberDtoSubscribedEventEnum)
              .filter(filterOutIneligibleEvents)
              .map((name: string) =>
                  <Checkbox
                      id={`event_${name}`}
                      name={`event_${name}`}
                      key={`event_${name}`}
                      label={name}
                      checked={formState.events.get()?.includes(name as SubscriberDtoSubscribedEventEnum)}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          addRemoveSubscribedEvent(name as SubscriberDtoSubscribedEventEnum, event.target.checked)}
                      disabled={isFormDisabled()}
                  />
              )
          :
              <p>Appears this app client has no READ privileges</p>
        }
      </FormGroup>

      <FormGroup
        labelName="secretPhrase"
        labelText="Secret"
        isError={failsHookstateValidation(formState.secret)}
        errorMessages={generateStringErrorMessages(formState.secret)}
        required
      >
        { props.formActionType == FormActionType.UPDATE &&
          <Checkbox
            id="secret_change_checkbox"
            name="secret_change_checkbox"
            key="secret_change_checkbox"
            label="Supply New Secret?"
            checked={newSecretCheckBox.get()}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              if (!event.target.checked) formState.secret.set('');
              newSecretCheckBox.set(event.target.checked)
            }}
            disabled={isFormDisabled()}
          />
        }
        <TextInput
          id="secretPhrase"
          name="secretPhrase"
          type="password"
          defaultValue={formState.secret.get()}
          error={failsHookstateValidation(formState.secret)}
          onChange={(event) => formState.secret.set(event.target.value)}
          disabled={isFormDisabled() || (props.formActionType == FormActionType.UPDATE && !newSecretCheckBox.get())}
        />
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
